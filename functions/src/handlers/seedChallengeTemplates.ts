/**
 * Function to seed challenge templates into the production database
 * This should only be run once after deployment to populate the initial challenge templates
 */

import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { CHALLENGE_TEMPLATES } from "../../../shared/data/challenge-templates";

export async function seedChallengeTemplatesFunction(): Promise<void> {
  logger.info("Starting seedChallengeTemplates function");

  try {
    const db = admin.firestore();

    const existingTemplatesSnapshot = await db
      .collection("challengeTemplates")
      .limit(1)
      .get();

    if (!existingTemplatesSnapshot.empty) {
      logger.info("Challenge templates already exist, skipping seed process");
      return;
    }

    logger.info(
      `Seeding ${CHALLENGE_TEMPLATES.length} challenge templates to the database`
    );

    // Use batched writes for better performance
    const batchSize = 500; // Firestore limit
    let batch = db.batch();
    let count = 0;
    let totalAdded = 0;

    const now = admin.firestore.Timestamp.now();

    for (const template of CHALLENGE_TEMPLATES) {
      const docRef = db.collection("challengeTemplates").doc(template.id);

      batch.set(docRef, {
        ...template,
        createdAt: now,
        updatedAt: now,
      });

      count++;
      totalAdded++;

      if (count >= batchSize) {
        // Commit the batch and start a new one
        await batch.commit();
        logger.info(`Committed batch of ${count} templates`);
        batch = db.batch();
        count = 0;
      }
    }

    // Commit any remaining templates
    if (count > 0) {
      await batch.commit();
      logger.info(`Committed final batch of ${count} templates`);
    }

    logger.info(`Successfully seeded ${totalAdded} challenge templates`);
  } catch (error) {
    logger.error("Error seeding challenge templates:", error);
    throw error;
  }
}
