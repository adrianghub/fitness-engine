import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type {
  ChallengeLevel,
  ChallengeType,
  UniversalChallenge,
} from "../types/models";
import { CHALLENGE_POINTS } from "../utils/challenges";

const COLLECTIONS = {
  userChallenges: "userChallenges",
  universalChallenges: "universalChallenges",
};

/**
 * Assigns universal challenges to a user. This should be called only during:
 * 1. Initial personalization
 * 2. User level promotion
 *
 * @param userId The ID of the user to assign universal challenges to
 * @param level The user's current level
 * @returns Promise that resolves when universal challenges have been assigned
 */
export async function assignUniversalChallenges(
  userId: string,
  level: ChallengeLevel
): Promise<void> {
  logger.info(
    `Assigning universal challenges for user ${userId} with level ${level}`
  );

  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    await db.runTransaction(async (transaction) => {
      const existingChallengesSnapshot = await transaction.get(
        db
          .collection(COLLECTIONS.userChallenges)
          .where("userId", "==", userId)
          .where("type", "==", "universal")
      );

      const universalChallengesSnapshot = await transaction.get(
        db
          .collection(COLLECTIONS.universalChallenges)
          .where("status", "==", "not-started")
      );

      if (universalChallengesSnapshot.empty) {
        logger.error("No active universal challenges found");
        return;
      }

      const universalChallenges = universalChallengesSnapshot.docs.map(
        (doc) => ({
          ...(doc.data() as UniversalChallenge),
          id: doc.id,
        })
      );

      const universalPoints = CHALLENGE_POINTS[level].universal;

      existingChallengesSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      for (const challenge of universalChallenges) {
        const challengeRef = db.collection(COLLECTIONS.userChallenges).doc();
        transaction.set(challengeRef, {
          userId,
          challengeId: challenge.id,
          status: "not-started",
          assignedAt: now,
          points: universalPoints,
          type: "universal" as ChallengeType,
        });
      }

      logger.info(
        `Assigned ${universalChallenges.length} universal challenges for user ${userId}`
      );
    });

    logger.info(
      `Successfully completed universal challenge assignment for user ${userId}`
    );
  } catch (error) {
    logger.error(
      `Error assigning universal challenges for user ${userId}:`,
      error
    );
    throw error;
  }
}
