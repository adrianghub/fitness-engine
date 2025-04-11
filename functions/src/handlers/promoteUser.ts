/**
 * Handler for promoting users to higher levels
 * Handles checking if a user qualifies for level promotion and applying the promotion
 */

import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import type { UserLevel } from "../types";
import { generateUserChallenges } from "./generateChallenges";
import { generateUserOpponents } from "./generateOpponents";

/**
 * Gets the next level for a user
 * @param currentLevel The user's current level
 * @returns The next level or null if already at max level
 */
function getNextLevel(currentLevel: UserLevel): UserLevel | null {
  switch (currentLevel) {
    case "beginner":
      return "intermediate";
    case "intermediate":
      return "advanced";
    case "advanced":
      return null; // Already at max level
    default:
      return null;
  }
}

/**
 * Checks if a user qualifies for promotion to the next level
 * @param userId The ID of the user to check
 * @returns Promise that resolves with a boolean indicating if the user qualifies for promotion
 */
export async function checkUserPromotionEligibility(
  userId: string
): Promise<boolean> {
  logger.info(`Checking promotion eligibility for user ${userId}`);

  try {
    const db = admin.firestore();

    // Get the user data
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      logger.error(`User ${userId} not found`);
      return false;
    }

    const userData = userDoc.data();
    if (!userData) {
      return false;
    }

    // If already at max level, return false
    if (userData.level === "advanced") {
      return false;
    }

    // Check if user has enough points
    // The threshold points required for promotion
    const PROMOTION_POINT_THRESHOLD = 1000;
    if (userData.totalPoints < PROMOTION_POINT_THRESHOLD) {
      return false;
    }

    // Check if user is at the top of their level's leaderboard
    const leaderboardSnapshot = await db
      .collection("leaderboard")
      .where("entityType", "==", "user")
      .orderBy("points", "desc")
      .limit(1)
      .get();

    if (leaderboardSnapshot.empty) {
      return false;
    }

    const topEntity = leaderboardSnapshot.docs[0].data();
    return topEntity.entityId === userId;
  } catch (error) {
    logger.error(
      `Error checking promotion eligibility for user ${userId}:`,
      error
    );
    return false;
  }
}

/**
 * Promotes a user to the next level and updates related data
 * @param userId The ID of the user to promote
 * @returns Promise that resolves when the promotion is complete
 */
export async function promoteUser(userId: string): Promise<void> {
  logger.info(`Starting promotion process for user ${userId}`);

  try {
    const db = admin.firestore();

    // Get the user data
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      logger.error(`User ${userId} not found`);
      return;
    }

    const userData = userDoc.data();
    if (!userData) {
      return;
    }

    const currentLevel = userData.level;
    const nextLevel = getNextLevel(currentLevel);

    if (!nextLevel) {
      logger.info(`User ${userId} is already at max level, cannot promote`);
      return;
    }

    // Update the user's level and reset points
    await userDoc.ref.update({
      level: nextLevel,
      totalPoints: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`User ${userId} promoted from ${currentLevel} to ${nextLevel}`);

    // Delete existing opponents
    const opponentsSnapshot = await db
      .collection("opponents")
      .where("userId", "==", userId)
      .get();

    if (!opponentsSnapshot.empty) {
      const batch = db.batch();
      opponentsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      logger.info(`Deleted ${opponentsSnapshot.size} existing opponents`);
    }

    // Delete existing leaderboard entries
    const leaderboardSnapshot = await db
      .collection("leaderboard")
      .where("entityId", "==", userId)
      .get();

    if (!leaderboardSnapshot.empty) {
      const batch = db.batch();
      leaderboardSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      logger.info(
        `Deleted ${leaderboardSnapshot.size} existing leaderboard entries`
      );
    }

    // Generate new challenges for the new level
    await generateUserChallenges(userId, nextLevel);

    // Generate new opponents for the new level
    await generateUserOpponents(userId, nextLevel);

    logger.info(`Successfully completed promotion process for user ${userId}`);
  } catch (error) {
    logger.error(`Error promoting user ${userId}:`, error);
    throw error;
  }
}
