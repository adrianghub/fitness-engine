import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { UNIVERSAL_CHALLENGES } from "../data/universal-challenges";

/**
 * Seeds universal challenges into the database
 * This should be run once to populate the initial universal challenges
 */
export async function seedUniversalChallengesFunction(): Promise<void> {
  logger.info("Starting seedUniversalChallenges function");

  try {
    const db = admin.firestore();
    const universalChallengesCollection = "universalChallenges";

    const existingChallengesSnapshot = await db
      .collection(universalChallengesCollection)
      .limit(1)
      .get();

    if (!existingChallengesSnapshot.empty) {
      logger.info("Universal challenges already exist, skipping seed process");
      return;
    }

    logger.info(
      `Seeding ${UNIVERSAL_CHALLENGES.length} universal challenges to the database`
    );

    const batch = db.batch();
    const now = Timestamp.now();

    for (const challenge of UNIVERSAL_CHALLENGES) {
      const docRef = db.collection(universalChallengesCollection).doc();
      batch.set(docRef, {
        ...challenge,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();
    logger.info(
      `Successfully seeded ${UNIVERSAL_CHALLENGES.length} universal challenges`
    );
  } catch (error) {
    logger.error("Error seeding universal challenges:", error);
    throw error;
  }
}
