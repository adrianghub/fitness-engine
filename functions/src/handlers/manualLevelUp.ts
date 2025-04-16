import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type { User, UserLevel } from "../types/models";
import { generateUserChallenges } from "./generateChallenges";

/**
 * Handles manual level up for a user, ensuring all related updates are atomic
 */
export async function manualUserLevelUp(
  userId: string,
  newLevel: UserLevel
): Promise<void> {
  const db = admin.firestore();

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Get and validate user
      const userRef = db.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const userData = userDoc.data() as User;
      if (userData.level === newLevel) {
        throw new Error(`User ${userId} is already at level ${newLevel}`);
      }

      const now = Timestamp.now();

      // 2. Update user document
      transaction.update(userRef, {
        level: newLevel,
        points: 0, // Reset points on level up
        previousLevel: userData.level,
        levelUpDate: now,
        updatedAt: now,
      });

      // 3. Update user's leaderboard entry
      const leaderboardRef = db.collection("leaderboard").doc(userId);
      transaction.set(
        leaderboardRef,
        {
          entityId: userId,
          entityType: "user",
          level: newLevel,
          points: 0,
          displayName: userData.displayName,
          updatedAt: now,
        },
        { merge: true }
      );

      // 4. Delete existing challenges
      const existingChallengesSnapshot = await transaction.get(
        db
          .collection("userChallenges")
          .where("userId", "==", userId)
          .where("status", "in", ["not-started", "in-progress"])
      );

      existingChallengesSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      logger.info(
        `Manual level up transaction completed for user ${userId}: ${userData.level} -> ${newLevel}`
      );
    });

    // Generate new challenges after the transaction (this has its own transaction)
    await generateUserChallenges(userId, newLevel);

    logger.info(
      `Successfully completed manual level up process for user ${userId}`
    );
  } catch (error) {
    logger.error(`Error in manual level up for user ${userId}:`, error);
    throw error;
  }
}
