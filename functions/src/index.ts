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
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

try {
  admin.initializeApp();
} catch (error) {
  logger.error("Error initializing Firebase Admin:", error);
  throw error;
}

import { promoteUser, updateOpponentsOnSchedule } from "./handlers";
import { completeUserProfile } from "./handlers/personalization";
import { seedChallengeTemplatesFunction } from "./handlers/seedChallengeTemplates";

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

export { completeUserProfile };
