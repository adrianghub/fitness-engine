/**
 * Handler for generating user challenges
 * Handles the creation of personalized challenges for users
 */

import * as admin from "firebase-admin";
import {
  DocumentReference,
  QuerySnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type {
  ChallengeLevel,
  ChallengeTemplate,
  UserChallenge,
} from "../types/models";
import {
  filterRecentChallenges,
  selectRandomChallenges,
  separateChallengesByLevel,
} from "../utils/challenges";

// Import the Firestore module to ensure Timestamp is available

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
      .collection("userChallenges")
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

    if (recommendedChallengeIds && recommendedChallengeIds.length > 0) {
      const batch = db.batch();
      for (const challengeId of recommendedChallengeIds) {
        const challengeRef = db
          .collection("userChallenges")
          .doc() as DocumentReference<UserChallenge>;
        batch.set(challengeRef, {
          userId: userId,
          challengeId: challengeId,
          status: "not-started",
          assignedDate: now,
        });
      }

      const universalChallengesSnapshot = (await db
        .collection("challengeTemplates")
        .where("level", "==", "all")
        .get()) as QuerySnapshot<ChallengeTemplate>;

      for (const challenge of universalChallengesSnapshot.docs) {
        const challengeRef = db
          .collection("userChallenges")
          .doc() as DocumentReference<UserChallenge>;
        batch.set(challengeRef, {
          userId: userId,
          challengeId: challenge.id,
          status: "not-started",
          assignedDate: now,
        });
      }

      await batch.commit();
      logger.info(
        `Added ${recommendedChallengeIds.length} AI-recommended challenges for user ${userId}`
      );
      return;
    }

    // If no AI recommendations, fall back to original logic
    // Get challenge templates matching the user's level and universal challenges
    const challengeTemplatesSnapshot = (await db
      .collection("challengeTemplates")
      .where("level", "in", [level, "all"])
      .get()) as QuerySnapshot<ChallengeTemplate>;

    if (challengeTemplatesSnapshot.empty) {
      logger.error(
        `No challenge templates found for levels: ${level} and universal`
      );
      return;
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
      .collection("userChallenges")
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

    // Select up to 5 specific challenges
    const selectedSpecificIds = selectRandomChallenges(availableSpecificIds, 5);

    // Combine universal challenges with selected specific challenges
    const selectedChallengeIds = [
      ...universalDocs.map((doc) => doc.id),
      ...selectedSpecificIds,
    ];

    // Create user challenges
    const batch = db.batch();
    for (const challengeId of selectedChallengeIds) {
      const challengeRef = db
        .collection("userChallenges")
        .doc() as DocumentReference<UserChallenge>;
      batch.set(challengeRef, {
        userId: userId,
        challengeId: challengeId,
        status: "not-started",
        assignedDate: now,
      });
    }

    await batch.commit();
    logger.info(
      `Added ${selectedChallengeIds.length} challenges for user ${userId}`
    );
  } catch (error) {
    logger.error(`Error generating challenges for user ${userId}:`, error);
    throw error;
  }
}
