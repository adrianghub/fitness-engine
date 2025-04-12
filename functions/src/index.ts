/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  applyPersonalization,
  generateUserChallenges,
  generateUserOpponents,
  promoteUser,
  updateOpponentsOnSchedule,
  validatePersonalizationData,
} from "./handlers";
import { seedChallengeTemplatesFunction } from "./handlers/seedChallengeTemplates";

try {
  admin.initializeApp();
} catch (error) {
  logger.error("Error initializing Firebase Admin:", error);
  throw error;
}

const defaultProperties = {
  timeZone: "Europe/Warsaw",
  retryCount: 3,
  region: "europe-central2",
};

/**
 * Cloud function to seed challenge templates in production
 * This function is exposed as an HTTP endpoint and should only be run once
 * after deploying to production.
 */
export const seedChallengeTemplates = onRequest(
  {
    ...defaultProperties,
    secrets: ["ADMIN_SECRET_KEY"],
  },
  async (request, response) => {
    try {
      const providedKey = request.query.key || request.headers["x-admin-key"];
      const expectedKey = process.env.ADMIN_SECRET_KEY;

      if (providedKey !== expectedKey) {
        logger.warn("Unauthorized attempt to seed challenge templates");
        response.status(401).json({
          success: false,
          error: "Unauthorized. Invalid or missing admin key.",
        });
        return;
      }

      logger.info("Starting challenge templates seeding process");
      await seedChallengeTemplatesFunction();

      response.json({
        success: true,
        message: "Challenge templates successfully seeded",
      });
    } catch (error) {
      logger.error("Error in seedChallengeTemplates function:", error);
      response.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

/**
 * Trigger function that runs when a user completes their profile
 * This watches for updates to user documents that include level/goal settings
 */
export const onUserProfileComplete = onDocumentUpdated(
  {
    document: "users/{userId}",
    ...defaultProperties,
  },
  async (event) => {
    try {
      const previousData = event.data?.before.data();
      const newData = event.data?.after.data();

      if (!newData) {
        logger.warn("User document was deleted or missing data");
        return;
      }

      const isProfileUpdate =
        previousData &&
        (!previousData.level ||
          !previousData.fitnessGoals ||
          !previousData.trainingFrequency) &&
        newData.level &&
        newData.fitnessGoals &&
        newData.trainingFrequency;

      if (isProfileUpdate) {
        logger.info(`User ${event.params.userId} completed their profile`);

        const personalizationData = {
          displayName: newData.displayName,
          level: newData.level,
          fitnessGoals: newData.fitnessGoals,
          trainingFrequency: newData.trainingFrequency,
        };

        const [isValid, errorMessage] =
          await validatePersonalizationData(personalizationData);
        if (!isValid) {
          logger.error(`Invalid personalization data: ${errorMessage}`);
          return;
        }

        await applyPersonalization(event.params.userId, personalizationData);

        await generateUserChallenges(
          event.params.userId,
          personalizationData.level
        );
        await generateUserOpponents(
          event.params.userId,
          personalizationData.level
        );

        logger.info(
          `Successfully completed profile setup for user ${event.params.userId}`
        );
      }
    } catch (error) {
      logger.error(`Error in onUserProfileComplete function:`, error);
    }
  }
);

/**
 * HTTP function to manually trigger user level up
 * This should be called when a user accumulates enough points to advance to the next level
 */
export const manualUserLevelUp = onRequest(
  {
    ...defaultProperties,
  },
  async (request, response) => {
    try {
      const { userId, newLevel } = request.body;

      if (!userId || !newLevel) {
        response.status(400).json({
          success: false,
          error: "Missing required parameters: userId and newLevel",
        });
        return;
      }

      if (!["beginner", "intermediate", "advanced"].includes(newLevel)) {
        response.status(400).json({
          success: false,
          error:
            "Invalid level. Must be one of: beginner, intermediate, advanced",
        });
        return;
      }

      await promoteUser(userId);

      response.json({
        success: true,
        message: `User ${userId} successfully leveled up to ${newLevel}`,
      });
    } catch (error) {
      logger.error("Error in manualUserLevelUp function:", error);
      response.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

/**
 * Scheduled function that runs daily to check which users need
 * their opponent scores updated based on their training frequency.
 * This only updates the scores of existing opponents without regenerating them.
 */
export const dailyOpponentsUpdate = onSchedule(
  {
    schedule: "every day 00:00",
    ...defaultProperties,
  },
  async () => {
    try {
      logger.info("Starting daily opponent update");
      await updateOpponentsOnSchedule();
      logger.info("Daily opponent update completed successfully");
    } catch (error) {
      logger.error("Error in daily opponent regeneration:", error);
    }
  }
);
