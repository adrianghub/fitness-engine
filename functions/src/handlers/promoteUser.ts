/**
 * Handler for promoting users to higher levels
 * Handles checking if a user qualifies for level promotion and applying the promotion
 */

import * as admin from "firebase-admin";
import type { DocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type { ChallengeLevel, Leaderboard, User } from "../types/models";
import { generateUserChallenges } from "./generateChallenges";
import { generateUserOpponents } from "./generateOpponents";
import { assignUniversalChallenges } from "./manageUniversalChallenges";

const LEVEL_PROGRESSION: Record<ChallengeLevel, ChallengeLevel | null> = {
  beginner: "intermediate",
  intermediate: "advanced",
  advanced: null,
};

/**
 * Checks if a user qualifies for promotion to the next level
 * Requirements:
 * 1. Must be #1 in their level's leaderboard
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
    const userDoc = (await db
      .collection("users")
      .doc(userId)
      .get()) as DocumentSnapshot<User>;
    if (!userDoc.exists) {
      logger.error(`User ${userId} not found`);
      return false;
    }

    const userData = userDoc.data();

    // If already at max level, return false
    if (!userData || userData.level === "advanced") {
      return false;
    }

    // Check if user is #1 in their level's leaderboard
    const leaderboardSnapshot = (await db
      .collection("leaderboard")
      .where("entityType", "==", "user")
      .where("level", "==", userData.level)
      .orderBy("points", "desc")
      .limit(1)
      .get()) as QuerySnapshot<Leaderboard>;

    if (leaderboardSnapshot.empty) {
      return false;
    }

    // Check if user is #1
    const isNumberOne = leaderboardSnapshot.docs[0].data().entityId === userId;
    if (!isNumberOne) {
      logger.info(`User ${userId} is not #1 in their level`);
      return false;
    }

    logger.info(`User ${userId} is eligible for promotion!`);
    return true;
  } catch (error) {
    logger.error(
      `Error checking promotion eligibility for user ${userId}:`,
      error
    );
    return false;
  }
}

/**
 * Promotes a user to the next level and resets their challenges
 * @param userId ID of the user to promote
 * @returns Promise that resolves when the user has been promoted
 */
export async function promoteUser(userId: string): Promise<void> {
  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    // We capture userData and nextLevel within the transaction
    const { nextLevel } = await db.runTransaction(async (transaction) => {
      // SECTION 1: All reads first
      const userRef = db.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const userData = userDoc.data() as User;

      const nextLevel = LEVEL_PROGRESSION[userData.level];

      if (!nextLevel) {
        throw new Error(`User ${userId} is already at maximum level`);
      }

      // SECTION 2: All writes
      // 1. Update user level and reset points
      transaction.update(userRef, {
        level: nextLevel,
        points: 0,
        updatedAt: now,
      });

      // 2. Update leaderboard entry
      const leaderboardRef = db.collection("leaderboard").doc(userId);
      transaction.set(
        leaderboardRef,
        {
          entityId: userId,
          entityType: "user",
          level: nextLevel,
          points: 0,
          updatedAt: now,
        },
        { merge: true }
      );

      logger.info(`Promoted user ${userId} to ${nextLevel}`);

      // Return the userData and nextLevel
      return { userData, nextLevel };
    });

    // Generate new challenges and opponents for the new level
    await Promise.all([
      generateUserChallenges(userId, nextLevel),
      assignUniversalChallenges(userId, nextLevel),
      generateUserOpponents(userId, nextLevel),
    ]);

    logger.info(`Successfully completed promotion process for user ${userId}`);
  } catch (error) {
    logger.error(`Error promoting user ${userId}:`, error);
    throw error;
  }
}
