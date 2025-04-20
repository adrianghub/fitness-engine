/**
 * Handler for generating user challenges
 * Handles the creation of personalized challenges for users
 */

import * as admin from "firebase-admin";
import {
  FieldPath,
  Timestamp,
  type DocumentReference,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type {
  ChallengeLevel,
  ChallengeTemplate,
  ChallengeType,
  UserChallenge,
} from "../types/models";
import { CHALLENGE_POINTS, selectRegularChallenges } from "../utils/challenges";

const COLLECTIONS = {
  challengeTemplates: "challengeTemplates",
  userChallenges: "userChallenges",
};

/**
 * Generates regular challenges for a user based on their level and AI recommendations
 * Universal challenges are managed separately during personalization and promotion
 * @param userId The ID of the user to generate challenges for
 * @param level The level of the user (beginner, intermediate, advanced)
 * @param recommendedChallengeIds Optional array of challenge IDs recommended by AI
 * @returns Promise that resolves when challenges have been generated
 */
export async function generateUserChallenges(
  userId: string,
  level: ChallengeLevel,
  recommendedChallengeIds?: string[]
): Promise<void> {
  logger.info(
    `Generating challenges for user ${userId} with level ${level}${
      recommendedChallengeIds ? " (using AI recommendations)" : ""
    }`
  );

  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    await db.runTransaction(async (transaction) => {
      const existingChallengesQuery = db
        .collection(COLLECTIONS.userChallenges)
        .where("userId", "==", userId)
        .where("type", "in", ["regular", "daily"]);
      const existingChallengesSnapshot = await transaction.get(
        existingChallengesQuery
      );
      logger.info(
        `Read ${existingChallengesSnapshot.size} existing challenges to potentially delete.`
      );

      const challengeTemplatesQuery = db
        .collection(COLLECTIONS.challengeTemplates)
        .where("level", "==", level);
      const challengeTemplatesSnapshot = await transaction.get(
        challengeTemplatesQuery
      );
      logger.info(
        `Read ${challengeTemplatesSnapshot.size} challenge templates for level ${level}.`
      );

      let validationSnapshot: admin.firestore.QuerySnapshot | null = null;
      if (recommendedChallengeIds && recommendedChallengeIds.length > 0) {
        const validationQuery = db
          .collection(COLLECTIONS.challengeTemplates)
          .where(FieldPath.documentId(), "in", recommendedChallengeIds);
        validationSnapshot = await transaction.get(validationQuery);
        logger.info(
          `Read ${validationSnapshot.size} recommended templates for validation.`
        );
      }

      if (challengeTemplatesSnapshot.empty) {
        logger.error(`No challenge templates found for level: ${level}`);
        // Decide if you want to throw an error or just return early
        return;
      }

      let useAIRecommendations = false;
      if (
        recommendedChallengeIds &&
        recommendedChallengeIds.length > 0 &&
        validationSnapshot
      ) {
        if (validationSnapshot.size === recommendedChallengeIds.length) {
          useAIRecommendations = true;
          logger.info(
            `Validated ${validationSnapshot.size} AI recommended challenges.`
          );
        } else {
          logger.warn(
            `Some AI recommended challenges not found in templates. Expected: ${recommendedChallengeIds.length}, Found: ${validationSnapshot.size}. Falling back to standard selection.`
          );
          useAIRecommendations = false;
        }
      }

      const regularTemplates = challengeTemplatesSnapshot.docs.map((doc) => ({
        ...(doc.data() as ChallengeTemplate),
        id: doc.id,
      }));

      const { dailyChallenge, regularChallenges } = selectRegularChallenges(
        regularTemplates,
        useAIRecommendations ? recommendedChallengeIds || [] : [],
        level
      );

      existingChallengesSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });
      if (!existingChallengesSnapshot.empty) {
        logger.info(
          `Marked ${existingChallengesSnapshot.size} existing challenges for deletion.`
        );
      }

      if (dailyChallenge) {
        const dailyChallengeRef = db
          .collection(COLLECTIONS.userChallenges)
          .doc() as DocumentReference<UserChallenge>;
        transaction.set(dailyChallengeRef, {
          userId,
          challengeId: dailyChallenge.id,
          status: "not-started",
          assignedAt: now,
          points: CHALLENGE_POINTS[level].daily,
          type: "daily" as ChallengeType,
        });
        logger.info(
          `Marked daily challenge ${dailyChallenge.id} for creation.`
        );
      } else {
        logger.warn(`No suitable daily challenge found for level ${level}.`);
      }

      // 3. Add regular challenges
      for (const challenge of regularChallenges) {
        const regularChallengeRef = db
          .collection(COLLECTIONS.userChallenges)
          .doc(); // Generate new ID
        transaction.set(regularChallengeRef, {
          userId,
          challengeId: challenge.id, // Store template ID
          status: "not-started",
          assignedAt: now,
          points: CHALLENGE_POINTS[level].regular,
          type: "regular" as ChallengeType,
          level,
        });
      }
      if (regularChallenges.length > 0) {
        logger.info(
          `Marked ${regularChallenges.length} regular challenges for creation.`
        );
      }

      logger.info(
        `Transaction prepared for user ${userId}: ${
          existingChallengesSnapshot.size
        } deletions, ${dailyChallenge ? 1 : 0} daily creation, ${
          regularChallenges.length
        } regular creations.`
      );
    });

    logger.info(
      `Successfully completed challenge generation transaction for user ${userId}`
    );
  } catch (error) {
    logger.error(
      `Error in challenge generation transaction for user ${userId}:`,
      error
    );
    throw error; // Re-throw the error for upstream handling
  }
}
