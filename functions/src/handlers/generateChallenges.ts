/**
 * Handler for generating user challenges
 * Handles the creation of personalized challenges for users
 */

import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import * as challengeTemplateRepo from "../repositories/ChallengeTemplateRepository";
import * as userChallengeRepo from "../repositories/UserChallengeRepository";
import type {
  ChallengeLevel,
  ChallengeTemplate,
  ChallengeType,
} from "../types/models";
import {
  CHALLENGE_CONFIG,
  CHALLENGE_POINTS,
  selectRegularChallenges,
} from "../utils/challenges";

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
      const existingChallengesSnapshot =
        await userChallengeRepo.findUserChallengesByCriteria(
          userId,
          {
            types: ["regular", "daily"],
          },
          transaction
        );
      logger.info(
        `Read ${existingChallengesSnapshot.size} existing regular/daily challenges to potentially delete (via repo).`
      );

      const challengeTemplates = await challengeTemplateRepo.findByLevel(
        level,
        transaction
      );
      logger.info(
        `Read ${challengeTemplates.length} challenge templates for level ${level} (from repo).`
      );

      let validationResults: (ChallengeTemplate & { id: string })[] = [];
      if (recommendedChallengeIds && recommendedChallengeIds.length > 0) {
        validationResults = await challengeTemplateRepo.findByIds(
          recommendedChallengeIds,
          transaction
        );
        logger.info(
          `Read ${validationResults.length} recommended templates for validation (from repo).`
        );
      }

      if (challengeTemplates.length === 0) {
        logger.error(
          `No challenge templates found for level: ${level} (from repo)`
        );
        // Decide if you want to throw an error or just return early
        return;
      }

      let useAIRecommendations = false;
      if (
        recommendedChallengeIds &&
        recommendedChallengeIds.length > 0 &&
        validationResults.length > 0
      ) {
        if (validationResults.length === recommendedChallengeIds.length) {
          useAIRecommendations = true;
          logger.info(
            `Validated ${validationResults.length} AI recommended challenges (from repo).`
          );
        } else {
          logger.warn(
            `Some AI recommended challenges not found in templates. Expected: ${recommendedChallengeIds.length}, Found: ${validationResults.length}. Falling back to standard selection.`
          );
          useAIRecommendations = false;
        }
      }

      const regularTemplates = challengeTemplates;

      const { dailyChallenge, regularChallenges } = selectRegularChallenges(
        regularTemplates,
        useAIRecommendations ? recommendedChallengeIds || [] : [],
        level
      );

      userChallengeRepo.deleteChallengesInSnapshot(
        transaction,
        existingChallengesSnapshot
      );

      if (!existingChallengesSnapshot.empty) {
        logger.info(
          `Marked ${existingChallengesSnapshot.size} existing challenges for deletion (via repo).`
        );
      }

      if (dailyChallenge) {
        userChallengeRepo.createChallenge(transaction, {
          userId,
          challengeId: dailyChallenge.id,
          status: "not-started",
          assignedAt: now,
          points: CHALLENGE_POINTS[level].daily,
          type: "daily" as ChallengeType,
          retriesLeft: 3,
        });
        logger.info(
          `Marked daily challenge ${dailyChallenge.id} for creation (via repo).`
        );
      } else {
        logger.warn(`No suitable daily challenge found for level ${level}.`);
      }

      for (const challenge of regularChallenges) {
        userChallengeRepo.createChallenge(transaction, {
          userId,
          challengeId: challenge.id,
          status: "not-started",
          assignedAt: now,
          points: CHALLENGE_POINTS[level].regular,
          type: "regular" as ChallengeType,
          retriesLeft: CHALLENGE_CONFIG.retries,
        });
      }
      if (regularChallenges.length > 0) {
        logger.info(
          `Marked ${regularChallenges.length} regular challenges for creation (via repo).`
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
