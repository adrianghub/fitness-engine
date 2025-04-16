/**
 * Handler for generating user challenges
 * Handles the creation of personalized challenges for users
 */

import * as admin from "firebase-admin";
import {
  DocumentReference,
  FieldPath,
  QuerySnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type {
  ChallengeLevel,
  ChallengeTemplate,
  ChallengeType,
  UserChallenge,
} from "../types/models";
import {
  CHALLENGE_POINTS,
  filterRecentChallenges,
  selectRandomChallenges,
  separateChallengesByLevel,
} from "../utils/challenges";

const challengeTemplatesCollection = "challengeTemplates";
const userChallengesCollection = "userChallenges";

/**
 * Generates challenges for a user based on their level and AI recommendations
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

    // Delete any existing unfinished challenges
    const existingChallengesSnapshot = (await db
      .collection(userChallengesCollection)
      .where("userId", "==", userId)
      .where("status", "in", ["not-started", "in-progress"])
      .get()) as QuerySnapshot<UserChallenge>;

    if (!existingChallengesSnapshot.empty) {
      const deleteBatch = db.batch();
      existingChallengesSnapshot.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      logger.info(
        `Deleted ${existingChallengesSnapshot.size} existing unfinished challenges`
      );
    }

    // Get challenge templates matching the user's level and universal challenges
    const challengeTemplatesSnapshot = (await db
      .collection(challengeTemplatesCollection)
      .where("level", "in", ["all", level])
      .get()) as QuerySnapshot<ChallengeTemplate>;

    if (challengeTemplatesSnapshot.empty) {
      logger.error(
        `No challenge templates found for levels: ${level} and universal`
      );
      return;
    }

    // If we have AI recommendations, verify they exist in our templates
    let useAIRecommendations = false;
    if (recommendedChallengeIds && recommendedChallengeIds.length > 0) {
      const validationSnapshot = await db
        .collection(userChallengesCollection)
        .where(FieldPath.documentId(), "in", recommendedChallengeIds)
        .get();

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

    // Separate universal and level-specific challenges
    const { universal: universalDocs, levelSpecific: specificDocs } =
      separateChallengesByLevel(
        challengeTemplatesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );

    // Query the user's most recent challenges to avoid repeating specific challenges consecutively
    const lastChallengeSnapshot = (await db
      .collection(userChallengesCollection)
      .where("userId", "==", userId)
      .orderBy("assignedDate", "desc")
      .limit(1)
      .get()) as QuerySnapshot<UserChallenge>;

    let previousChallengeIds: string[] = [];
    if (!lastChallengeSnapshot.empty) {
      previousChallengeIds = lastChallengeSnapshot.docs.map(
        (doc) => doc.data().challengeId
      );
    }

    // Filter out recent challenges and select new ones
    const availableSpecificIds = filterRecentChallenges(
      specificDocs.map((doc) => doc.id),
      previousChallengeIds
    );

    const batch = db.batch();
    let remainingUniversalDocs = universalDocs;
    let remainingSpecificIds = availableSpecificIds;

    // Select daily challenge from combined pool of regular and universal challenges
    const allAvailableChallenges = [
      ...availableSpecificIds,
      ...universalDocs.map((doc) => doc.id),
    ];
    const dailyChallengeId = selectRandomChallenges(
      allAvailableChallenges,
      1
    )[0];

    // Check if daily challenge was selected from universal pool
    const isUniversalDaily = universalDocs.some(
      (doc) => doc.id === dailyChallengeId
    );

    // Remove selected daily challenge from appropriate pool
    if (isUniversalDaily) {
      remainingUniversalDocs = universalDocs.filter(
        (doc) => doc.id !== dailyChallengeId
      );
    } else {
      remainingSpecificIds = availableSpecificIds.filter(
        (id) => id !== dailyChallengeId
      );
    }

    // Add daily challenge
    if (dailyChallengeId) {
      const challengeRef = db
        .collection(userChallengesCollection)
        .doc() as DocumentReference<UserChallenge>;
      batch.set(challengeRef, {
        userId: userId,
        challengeId: dailyChallengeId,
        status: "not-started",
        assignedDate: now,
        points: CHALLENGE_POINTS[level].daily,
        type: "daily" as ChallengeType,
      });
    }

    // Handle regular challenges - either from AI recommendations or random selection
    const numRegularChallenges = isUniversalDaily ? 5 : 4;
    let regularChallengeIds: string[] = [];

    if (useAIRecommendations && recommendedChallengeIds) {
      // Use AI recommendations for regular challenges, but only take what we need
      regularChallengeIds = recommendedChallengeIds.slice(
        0,
        numRegularChallenges
      );
      logger.info(
        `Using ${regularChallengeIds.length} AI recommended regular challenges`
      );
    } else {
      // Random selection of regular challenges
      regularChallengeIds = selectRandomChallenges(
        remainingSpecificIds,
        numRegularChallenges
      );
    }

    // Add regular challenges
    for (const challengeId of regularChallengeIds) {
      const challengeRef = db
        .collection(userChallengesCollection)
        .doc() as DocumentReference<UserChallenge>;
      batch.set(challengeRef, {
        userId: userId,
        challengeId: challengeId,
        status: "not-started",
        assignedDate: now,
        points: CHALLENGE_POINTS[level].regular,
        type: "regular" as ChallengeType,
      });
    }

    // Add universal challenges (3 if daily was from universal, 4 if from regular)
    for (const challenge of remainingUniversalDocs) {
      const challengeRef = db
        .collection(userChallengesCollection)
        .doc() as DocumentReference<UserChallenge>;
      batch.set(challengeRef, {
        userId: userId,
        challengeId: challenge.id,
        status: "not-started",
        assignedDate: now,
        points: CHALLENGE_POINTS[level].universal,
        type: "universal" as ChallengeType,
      });
    }

    await batch.commit();
    const aiNote = useAIRecommendations
      ? " (AI recommended regular challenges)"
      : "";
    const challengeDistribution = isUniversalDaily
      ? `1 daily (universal) + 5 regular + 3 universal${aiNote}`
      : `1 daily (regular) + 4 regular + 4 universal${aiNote}`;

    logger.info(
      `Added challenges for user ${userId}: ${challengeDistribution}`
    );
  } catch (error) {
    logger.error(`Error generating challenges for user ${userId}:`, error);
    throw error;
  }
}
