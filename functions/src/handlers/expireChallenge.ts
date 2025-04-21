import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type { ChallengeTemplate, UserChallenge } from "../types/models";
import { parseTimeString } from "../utils/date-utils";

/**
 * Handles the expiration of a challenge by:
 * 1. Checking if the challenge has exceeded its time limit
 * 2. If expired, marking it as uncompleted
 * 3. Tracking the number of retries (up to 3 max during the same day)
 * 4. If 3 retries exhausted, marking challenge as permanently uncompleted for the day
 * 5. No penalty is applied when a challenge expires (penalties are applied during nightly refresh)
 *
 * Note: All challenges are refreshed at midnight regardless of retry count
 *
 * @param userId The ID of the user with the challenge
 * @param challengeId The ID of the challenge being checked
 * @returns Promise that resolves with whether the challenge was expired and can be retried
 */
export async function checkChallengeExpiration(
  userId: string,
  challengeId: string
): Promise<{ expired: boolean; canRetry: boolean }> {
  logger.info(
    `Checking expiration for challenge ${challengeId} for user ${userId}`
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

      if (challengeData.status !== "in-progress") {
        logger.info(
          `Challenge ${challengeId} is not in progress (status: ${challengeData.status})`
        );
        return { expired: false, canRetry: false };
      }

      if (!challengeData.startedAt) {
        logger.warn(`Challenge ${challengeId} has no start time`);
        return { expired: false, canRetry: false };
      }

      const templateDoc = await transaction.get(
        db.collection("challengeTemplates").doc(challengeData.challengeId)
      );

      if (!templateDoc.exists) {
        logger.error(`Template for challenge ${challengeId} not found`);
        return { expired: false, canRetry: false };
      }

      const templateData = templateDoc.data() as ChallengeTemplate;

      const expectedTimeInMinutes = parseTimeString(templateData.expectedTime);
      const expectedDurationMs = expectedTimeInMinutes * 60 * 1000;

      const startTime = challengeData.startedAt.toMillis();
      const currentTime = now.toMillis();
      const elapsedTimeMs = currentTime - startTime;
      const hasExpired = elapsedTimeMs > expectedDurationMs;

      if (!hasExpired) {
        logger.info(`Challenge ${challengeId} has not expired yet`);
        return { expired: false, canRetry: false };
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
          ? `Challenge ${challengeId} marked as expired for user ${userId}. Retry ${currentRetries - 1}/3 available today.`
          : `Challenge ${challengeId} marked as permanently expired for user ${userId}. Maximum retries (3/3) used today.`
      );

      return { expired: true, canRetry };
    });

    return result;
  } catch (error) {
    logger.error(
      `Error checking expiration for challenge ${challengeId} for user ${userId}:`,
      error
    );
    throw error;
  }
}
