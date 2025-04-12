/**
 * Handler for generating user challenges
 * Handles the creation of personalized challenges for users
 */

import * as admin from "firebase-admin";
import type {
  DocumentReference,
  QuerySnapshot,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type {
  ChallengeLevel,
  ChallengeTemplate,
  UserChallenge,
} from "../types/models";

/**
 * Generates challenges for a user based on their level
 * Should be called when a user completes their profile or levels up
 * @param userId The ID of the user to generate challenges for
 * @param level The level of the user (beginner, intermediate, advanced)
 * @returns Promise that resolves when challenges have been generated
 */
export async function generateUserChallenges(
  userId: string,
  level: ChallengeLevel
): Promise<void> {
  logger.info(`Generating challenges for user ${userId} with level ${level}`);

  try {
    const db = admin.firestore();

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

    // Separate universal challenges (level "all") and level-specific challenges
    const universalDocs = challengeTemplatesSnapshot.docs.filter(
      (doc) => doc.data().level === "all"
    );
    const specificDocs = challengeTemplatesSnapshot.docs.filter(
      (doc) => doc.data().level !== "all"
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

    // Filter specific challenges to exclude those from the previous challenge set
    const filteredSpecificDocs = specificDocs.filter(
      (doc) => !previousChallengeIds.includes(doc.id)
    );

    // Fallback: if filtering removes all candidates, use the original specificDocs
    const candidateSpecificDocs =
      filteredSpecificDocs.length > 0 ? filteredSpecificDocs : specificDocs;

    // Shuffle candidate specific challenges and select up to 5
    const shuffledSpecific = [...candidateSpecificDocs].sort(
      () => Math.random() - 0.5
    );
    const selectedSpecificDocs = shuffledSpecific.slice(
      0,
      Math.min(5, shuffledSpecific.length)
    );

    // Combine universal challenges (always included) with the selected specific challenges
    const selectedChallengeIds = [
      ...universalDocs.map((doc) => doc.id),
      ...selectedSpecificDocs.map((doc) => doc.id),
    ];

    // Delete any existing unfinished challenges for this user to avoid duplicates
    const existingChallengesSnapshot = (await db
      .collection("userChallenges")
      .where("userId", "==", userId)
      .where("status", "in", ["not-started", "in-progress"])
      .get()) as QuerySnapshot<UserChallenge>;

    // Delete existing unfinished challenges in a batch
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

    // Get the current timestamp
    const now = admin.firestore.FieldValue.serverTimestamp();

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
