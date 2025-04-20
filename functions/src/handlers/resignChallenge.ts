import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type { User, UserChallenge } from "../types/models";

/**
 * Handles the resignation of a challenge by:
 * 1. Marking the challenge as uncompleted
 * 2. Applying point penalty to the user (only if not the same day as assigned)
 * 3. Updating the leaderboard
 * 4. The challenge will remain visible until the next daily refresh
 *
 * If the challenge is resigned on the same day it was assigned, no penalty is applied
 * and the user can try again without losing points.
 *
 * @param userId The ID of the user resigning from the challenge
 * @param challengeId The ID of the challenge being resigned
 */
export async function resignChallenge(
  userId: string,
  challengeId: string
): Promise<void> {
  logger.info(
    `Processing resignation for challenge ${challengeId} from user ${userId}`
  );

  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    // Run everything in a transaction to ensure consistency
    await db.runTransaction(async (transaction) => {
      // SECTION 1: All reads first
      // 1. Get the challenge document
      const challengeDoc = await transaction.get(
        db.collection("userChallenges").doc(challengeId)
      );

      if (!challengeDoc.exists) {
        logger.error(`Challenge ${challengeId} not found`);
        throw new Error("Challenge not found");
      }

      const challengeData = challengeDoc.data() as UserChallenge;
      if (challengeData.userId !== userId) {
        logger.error(
          `Challenge ${challengeId} does not belong to user ${userId}`
        );
        throw new Error("Challenge does not belong to user");
      }

      if (challengeData.status === "completed") {
        logger.info(
          `Challenge ${challengeId} already completed, cannot resign`
        );
        return;
      }

      // 2. Get current user data
      const userDoc = await transaction.get(db.collection("users").doc(userId));
      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }
      const userData = userDoc.data() as User;

      // Check if challenge is being resigned on the same day it was assigned
      const isSameDay = isSameDayTimestamp(challengeData.assignedAt, now);

      // SECTION 2: Process data
      let newPoints = userData.points || 0;
      let finalPenalty = 0;

      if (!isSameDay) {
        // Only apply penalty if not the same day
        const penaltyPoints = Math.floor(challengeData.points * 0.5);
        const currentPoints = userData.points || 0;
        finalPenalty = Math.min(penaltyPoints, currentPoints);
        newPoints = Math.max(0, currentPoints - finalPenalty);
      }

      // SECTION 3: All writes
      // 1. Update user points only if penalty is applied
      if (finalPenalty > 0) {
        transaction.update(userDoc.ref, {
          points: newPoints,
          updatedAt: now,
        });

        // 2. Update leaderboard
        const leaderboardRef = db.collection("leaderboard").doc(userId);
        transaction.set(
          leaderboardRef,
          {
            entityId: userId,
            entityType: "user",
            level: userData.level,
            points: newPoints,
            updatedAt: now,
          },
          { merge: true }
        );
      }

      // 3. Mark the challenge as uncompleted
      transaction.update(challengeDoc.ref, {
        status: "uncompleted",
        finishedAt: now,
      });

      logger.info(
        isSameDay
          ? `Challenge ${challengeId} marked as uncompleted by user ${userId}. No penalty applied as challenge was assigned today.`
          : `Challenge ${challengeId} marked as uncompleted by user ${userId}. Applied penalty of ${finalPenalty} points. New total: ${newPoints}`
      );
    });
  } catch (error) {
    logger.error(
      `Error processing resignation for challenge ${challengeId} from user ${userId}:`,
      error
    );
    throw error;
  }
}

/**
 * Checks if two timestamps are from the same day
 */
function isSameDayTimestamp(
  timestamp1: Timestamp,
  timestamp2: Timestamp
): boolean {
  const date1 = timestamp1.toDate();
  const date2 = timestamp2.toDate();

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
