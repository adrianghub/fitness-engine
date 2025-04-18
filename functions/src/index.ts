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
import { onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  completeChallenge,
  generateUserOpponents,
  promoteUser,
  resignChallenge,
  seedChallengeTemplatesFunction,
  seedUniversalChallengesFunction,
  updateOpponentsOnSchedule,
} from "./handlers";

try {
  admin.initializeApp();
} catch (error) {
  logger.error("Error initializing Firebase Admin:", error);
  throw error;
}

import type { PersonalizationData } from "@/types/personalization-data";
import {
  applyPersonalization,
  validatePersonalizationData,
} from "./handlers/personalization";
import { refreshUserChallenges } from "./handlers/refreshChallenges";

const defaultProperties = {
  timeZone: "Europe/Warsaw",
  retryCount: 3,
  region: "europe-central2",
  cors: true,
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

      const validLevels = ["beginner", "intermediate", "advanced"] as const;
      if (!validLevels.includes(newLevel)) {
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
 * Scheduled function that runs daily to:
 * 1. Apply penalties for incomplete challenges
 * 2. Generate new challenges for users
 * 3. Update opponent scores
 */
export const dailyChallengeAndOpponentUpdate = onSchedule(
  {
    schedule: "every day 00:00",
    ...defaultProperties,
    secrets: ["GEMINI_API_KEY"],
  },
  async () => {
    try {
      logger.info("Starting daily challenge and opponent update");

      // First, refresh challenges and apply penalties
      await refreshUserChallenges();

      // Then update opponent scores
      await updateOpponentsOnSchedule();

      logger.info("Daily challenge and opponent update completed successfully");
    } catch (error) {
      logger.error("Error in daily challenge and opponent update:", error);
      throw error;
    }
  }
);

/**
 * HTTP callable function to complete user profile and apply personalization
 */
export const completeUserProfile = onCall(
  { ...defaultProperties, cors: true, secrets: ["GEMINI_API_KEY"] },
  async (request) => {
    try {
      const uid = request.auth?.uid;
      if (!uid) {
        logger.error("Unauthorized access to completeUserProfile");
        throw new Error("Unauthorized");
      }

      const personalizationData = request.data as PersonalizationData;

      const [isValid, errorMessage] = await validatePersonalizationData(
        personalizationData,
        uid
      );
      if (!isValid) {
        logger.error(`Invalid personalization data: ${errorMessage}`);
        throw new Error(`Invalid personalization data: ${errorMessage}`);
      }

      await applyPersonalization(uid, personalizationData);
      await generateUserOpponents(uid, personalizationData.level);

      logger.info(`Successfully completed profile setup for user ${uid}`);

      return { success: true };
    } catch (error) {
      logger.error("Error in completeUserProfile function:", error);
      throw new Error("Failed to complete profile setup");
    }
  }
);

/**
 * HTTP endpoint for testing the challenge refresh process locally
 * This endpoint is only available in development
 */
export const triggerDailyChallengeRefresh = onRequest(
  {
    ...defaultProperties,
  },
  async (_, response) => {
    try {
      if (process.env.NODE_ENV === "production") {
        response.status(404).send("Not available in production");
        return;
      }

      await refreshUserChallenges();

      response.json({
        success: true,
        message: "Challenge refresh process completed for all users",
      });
    } catch (error) {
      logger.error("Error in triggerDailyChallengeRefresh:", error);
      response.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

/**
 * HTTP callable function to complete a challenge
 * This endpoint is called when a user marks a challenge as completed
 */
export const completeChallengeEndpoint = onCall(
  { ...defaultProperties },
  async (request) => {
    try {
      const uid = request.auth?.uid;
      if (!uid) {
        logger.error("Unauthorized access to completeChallengeEndpoint");
        throw new Error("Unauthorized");
      }

      const { challengeId } = request.data;
      if (!challengeId) {
        throw new Error("Missing required parameter: challengeId");
      }

      const result = await completeChallenge(uid, challengeId);

      return {
        success: true,
        wasPromoted: result.wasPromoted,
        message: `Challenge ${challengeId} completed successfully${
          result.wasPromoted ? " and user was promoted!" : ""
        }`,
      };
    } catch (error) {
      logger.error("Error in completeChallengeEndpoint:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to complete challenge"
      );
    }
  }
);

/**
 * HTTP callable function to resign from a challenge
 * This endpoint is called when a user wants to give up on a challenge
 */
export const resignChallengeEndpoint = onCall(
  { ...defaultProperties, cors: true },
  async (request) => {
    try {
      const uid = request.auth?.uid;
      if (!uid) {
        logger.error("Unauthorized access to resignChallengeEndpoint");
        throw new Error("Unauthorized");
      }

      const { challengeId } = request.data;
      if (!challengeId) {
        throw new Error("Missing required parameter: challengeId");
      }

      await resignChallenge(uid, challengeId);

      return {
        success: true,
        message: `Successfully resigned from challenge ${challengeId}`,
      };
    } catch (error) {
      logger.error("Error in resignChallengeEndpoint:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to resign from challenge"
      );
    }
  }
);

/**
 * HTTP endpoint to seed universal challenges
 * Protected by admin key
 */
export const seedUniversalChallenges = onRequest(
  {
    ...defaultProperties,
    secrets: ["ADMIN_SECRET_KEY"],
  },
  async (req, res) => {
    try {
      const adminKey = req.headers["x-admin-key"];
      if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        res.status(401).send("Unauthorized");
        return;
      }

      await seedUniversalChallengesFunction();
      res.status(200).send("Universal challenges seeded successfully");
    } catch (error) {
      logger.error("Error in seedUniversalChallenges:", error);
      res.status(500).send("Error seeding universal challenges");
    }
  }
);
