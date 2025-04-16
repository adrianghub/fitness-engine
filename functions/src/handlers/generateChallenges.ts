/**
 * Handler for generating user challenges
 * Handles the creation of personalized challenges for users
 */

import * as admin from "firebase-admin";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type {
  ChallengeLevel,
  ChallengeTemplate,
  ChallengeType,
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
  logger.info(`Generating challenges for user ${userId} with level ${level}`);

  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    await db.runTransaction(async (transaction) => {
      // Delete any existing unfinished regular and daily challenges
      const existingChallengesSnapshot = await transaction.get(
        db
          .collection(COLLECTIONS.userChallenges)
          .where("userId", "==", userId)
          .where("status", "in", ["not-started", "in-progress"])
          .where("type", "in", ["regular", "daily"])
      );

      existingChallengesSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });
      logger.info(
        `Marked ${existingChallengesSnapshot.size} existing unfinished challenges for deletion`
      );

      // Get regular challenge templates matching the user's level
      const challengeTemplatesSnapshot = await transaction.get(
        db
          .collection(COLLECTIONS.challengeTemplates)
          .where("level", "==", level)
      );

      if (challengeTemplatesSnapshot.empty) {
        logger.error(`No challenge templates found for level: ${level}`);
        return;
      }

      // If we have AI recommendations, verify they exist in our templates
      let useAIRecommendations = false;
      if (recommendedChallengeIds && recommendedChallengeIds.length > 0) {
        const validationSnapshot = await transaction.get(
          db
            .collection(COLLECTIONS.challengeTemplates)
            .where(FieldPath.documentId(), "in", recommendedChallengeIds)
        );

        if (validationSnapshot.size === recommendedChallengeIds.length) {
          useAIRecommendations = true;
          logger.info(
            `Using ${validationSnapshot.size} AI recommended challenges`
          );
        } else {
          logger.warn(
            `Some AI recommended challenges not found in templates. Expected: ${recommendedChallengeIds.length}, Found: ${validationSnapshot.size}. Falling back to standard selection.`
          );
          useAIRecommendations = false;
        }
      }

      // Process regular challenge templates
      const regularTemplates = challengeTemplatesSnapshot.docs.map((doc) => ({
        ...(doc.data() as ChallengeTemplate),
        id: doc.id,
      }));

      // Generate and select challenges
      const { dailyChallenge, regularChallenges } = selectRegularChallenges(
        regularTemplates,
        useAIRecommendations ? recommendedChallengeIds || [] : [],
        level
      );

      // Add daily challenge
      if (dailyChallenge) {
        const challengeRef = db.collection(COLLECTIONS.userChallenges).doc();
        transaction.set(challengeRef, {
          userId,
          challengeId: dailyChallenge.id,
          status: "not-started",
          assignedDate: now,
          points: CHALLENGE_POINTS[level].daily,
          type: "daily" as ChallengeType,
        });
      }

      // Add regular challenges
      for (const challenge of regularChallenges) {
        const challengeRef = db.collection(COLLECTIONS.userChallenges).doc();
        transaction.set(challengeRef, {
          userId,
          challengeId: challenge.id,
          status: "not-started",
          assignedDate: now,
          points: CHALLENGE_POINTS[level].regular,
          type: "regular" as ChallengeType,
        });
      }

      logger.info(
        `Generated challenges for user ${userId}: 1 daily + ${regularChallenges.length} regular${useAIRecommendations ? " (AI recommended)" : ""}`
      );
    });

    logger.info(
      `Successfully completed challenge generation for user ${userId}`
    );
  } catch (error) {
    logger.error(`Error generating challenges for user ${userId}:`, error);
    throw error;
  }
}
