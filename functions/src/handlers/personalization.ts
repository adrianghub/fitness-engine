/**
 * Handler for user personalization
 * Handles first-time profile setup and validation for personalization data
 */

import * as admin from "firebase-admin";
import { QuerySnapshot, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { ADJACENT_LEVELS } from "../data/adjacent-levels";
import {
  generatePersonalizedChallenges,
  generatePersonalizedGoals,
} from "../services/ai";
import type { ChallengeTemplate, User } from "../types/models";
import type { PersonalizationData } from "../types/personalization-data";
import { CHALLENGE_POINTS } from "../utils/challenges";
import { generateUserChallenges } from "./generateChallenges";
import { assignUniversalChallenges } from "./manageUniversalChallenges";

const DEFAULT_GOALS = [
  "Poprawa ogólnej kondycji",
  "Zwiększenie siły",
  "Rozwój wytrzymałości",
];

/**
 * Validates personalization data submitted by a user
 * @param data The personalization data to validate
 * @param userId The ID of the user submitting the data
 * @returns A tuple with a boolean indicating if the data is valid and an error message if not
 */
export async function validatePersonalizationData(
  data: PersonalizationData,
  userId: string
): Promise<[boolean, string?]> {
  // Validate display name (check uniqueness)
  if (!data.displayName || data.displayName.trim() === "") {
    return [false, "Display name is required"];
  }

  // Check if display name is unique (excluding the current user)
  const db = admin.firestore();

  const existingUserSnapshot = (await db
    .collection("users")
    .where("displayName", "==", data.displayName)
    .get()) as QuerySnapshot<User>;

  // Check if any other user (different ID) has this display name
  const isDisplayNameTaken = existingUserSnapshot.docs.some(
    (doc) => doc.id !== userId && doc.data().displayName === data.displayName
  );

  if (isDisplayNameTaken) {
    return [false, "This display name is already taken"];
  }

  // Validate level
  if (!data.level || !Object.keys(CHALLENGE_POINTS).includes(data.level)) {
    return [false, "Level must be one of: beginner, intermediate, advanced"];
  }

  // Validate goals description
  if (!data.goalsDescription || data.goalsDescription.trim() === "") {
    return [false, "Goals description is required"];
  }

  // Validate equipment array
  if (!data.equipment || !Array.isArray(data.equipment)) {
    return [false, "Equipment list is required"];
  }

  return [true];
}

/**
 * Applies personalization settings for a user
 * @param userId The ID of the user to personalize
 * @param data The personalization data to apply
 * @returns Promise that resolves when personalization is complete
 */
export async function applyPersonalization(
  userId: string,
  data: PersonalizationData
): Promise<void> {
  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    // Generate personalized fitness goals using AI
    let generatedGoals = await generatePersonalizedGoals(data);

    if (generatedGoals.length === 0) {
      logger.warn("No personalized goals generated, using defaults");
      generatedGoals = DEFAULT_GOALS;
    }

    logger.info(
      `Generated ${generatedGoals.length} personalized goals for user ${userId}`
    );

    await db.collection("users").doc(userId).set(
      {
        displayName: data.displayName,
        level: data.level,
        equipment: data.equipment,
        fitnessGoals: generatedGoals,
        points: 0,
        isProfileComplete: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    // Get available challenge templates for AI recommendations, including adjacent levels
    const allowedLevels = ADJACENT_LEVELS[data.level];
    const challengeTemplatesSnapshot = await db
      .collection("challengeTemplates")
      .where("level", "in", allowedLevels)
      .get();

    const availableChallenges = challengeTemplatesSnapshot.docs.map((doc) => ({
      ...(doc.data() as ChallengeTemplate),
      id: doc.id,
    }));

    logger.info(
      `Found ${availableChallenges.length} available challenges across levels: ${allowedLevels.join(", ")}`
    );

    // Generate AI-recommended challenges
    const recommendedChallenges = await generatePersonalizedChallenges(
      data,
      availableChallenges
    );

    // Generate initial challenges with AI recommendations
    await generateUserChallenges(userId, data.level, recommendedChallenges);

    // Assign universal challenges
    await assignUniversalChallenges(userId, data.level);

    logger.info(`Successfully applied personalization for user ${userId}`);
  } catch (error) {
    logger.error("Error in applyPersonalization:", error);
    throw error;
  }
}
