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
      // SECTION 1: All reads first
      // 1. Get existing universal challenges
      const existingChallengesSnapshot = await transaction.get(
        db
          .collection(COLLECTIONS.userChallenges)
          .where("userId", "==", userId)
          .where("type", "==", "universal")
      );

      // 2. Get active universal challenges
      const universalChallengesSnapshot = await transaction.get(
        db
          .collection(COLLECTIONS.universalChallenges)
          .where("status", "==", "not-started")
      );

      if (universalChallengesSnapshot.empty) {
        logger.error("No active universal challenges found");
        return;
      }

      // SECTION 2: Process data
      // Process universal challenges
      const universalChallenges = universalChallengesSnapshot.docs.map(
        (doc) => ({
          ...(doc.data() as UniversalChallenge),
          id: doc.id,
        })
      );

      // Calculate points based on user level
      const universalPoints = CHALLENGE_POINTS[level].universal;

      // SECTION 3: All writes
      // 1. Delete existing universal challenges
      existingChallengesSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      // 2. Add new universal challenges
      for (const challenge of universalChallenges) {
        const challengeRef = db.collection(COLLECTIONS.userChallenges).doc();
        transaction.set(challengeRef, {
          userId,
          challengeId: challenge.id,
          status: "not-started",
          assignedDate: now,
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
