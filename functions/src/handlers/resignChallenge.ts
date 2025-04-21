import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type { UserChallenge } from "../types/models";

/**
 * Handles the resignation of a challenge by:
 * 1. Marking the challenge as uncompleted
 * 2. Incrementing the retry count and tracking remaining retries
 * 3. The challenge will remain visible until the next daily refresh
 * 4. No penalty is applied when resigning - penalties are only applied during nightly refresh
 *
 * @param userId The ID of the user resigning from the challenge
 * @param challengeId The ID of the challenge being resigned
 * @returns Information about whether the challenge can be retried again
 */
export async function resignChallenge(
  userId: string,
  challengeId: string
): Promise<{ canRetry: boolean }> {
  logger.info(
    `Processing resignation for challenge ${challengeId} from user ${userId}`
  );

  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    const result = await db.runTransaction(async (transaction) => {
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
        throw new Error("Cannot resign from a completed challenge");
      }

      const currentRetries = challengeData.retriesLeft || 0;
      const canRetry = currentRetries > 0;

      const updateData: Partial<UserChallenge> = {
        status: "uncompleted",
        finishedAt: now,
        retriesLeft: currentRetries - 1,
      };

      transaction.update(challengeDoc.ref, updateData);

      logger.info(
        canRetry
          ? `Challenge ${challengeId} marked as uncompleted by user ${userId}. Retry ${currentRetries - 1}/3 available today.`
          : `Challenge ${challengeId} marked as permanently uncompleted by user ${userId}. Maximum retries (3/3) used today.`
      );

      return { canRetry };
    });

    return result;
  } catch (error) {
    logger.error(
      `Error processing resignation for challenge ${challengeId} from user ${userId}:`,
      error
    );
    throw error;
  }
}
