import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type { User, UserChallenge } from "../types/models";

/**
 * Handles the resignation of a challenge by:
 * 1. Marking the challenge as uncompleted
 * 2. Applying point penalty to the user
 * 3. Updating the leaderboard
 * 4. The challenge will remain visible until the next daily refresh
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

      // SECTION 2: Process data
      const penaltyPoints = Math.floor(challengeData.points * 0.5);
      const currentPoints = userData.points || 0;
      const finalPenalty = Math.min(penaltyPoints, currentPoints);
      const newPoints = Math.max(0, currentPoints - finalPenalty);

      // SECTION 3: All writes
      // 1. Update user points
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

      // 3. Mark the challenge as uncompleted
      transaction.update(challengeDoc.ref, {
        status: "uncompleted",
        finishedAt: now,
      });

      logger.info(
        `Challenge ${challengeId} marked as uncompleted by user ${userId}. Applied penalty of ${finalPenalty} points (original penalty: ${penaltyPoints}). New total: ${newPoints}`
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
