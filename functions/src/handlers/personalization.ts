/**
 * Handler for user personalization
 * Handles first-time profile setup and validation for personalization data
 */

import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import type { FitnessGoals, TrainingFrequency, UserLevel } from "../types";

interface PersonalizationData {
  displayName: string;
  level: UserLevel;
  fitnessGoals: FitnessGoals;
  trainingFrequency: TrainingFrequency;
}

/**
 * Validates personalization data submitted by a user
 * @param data The personalization data to validate
 * @returns A tuple with a boolean indicating if the data is valid and an error message if not
 */
export async function validatePersonalizationData(
  data: PersonalizationData
): Promise<[boolean, string?]> {
  // Validate display name (check uniqueness)
  if (!data.displayName || data.displayName.trim() === "") {
    return [false, "Display name is required"];
  }

  // Check if display name is unique
  const db = admin.firestore();
  const existingUserSnapshot = await db
    .collection("users")
    .where("displayName", "==", data.displayName)
    .limit(1)
    .get();

  if (!existingUserSnapshot.empty) {
    return [false, "This display name is already taken"];
  }

  // Validate level
  if (
    !data.level ||
    !["beginner", "intermediate", "advanced"].includes(data.level)
  ) {
    return [false, "Level must be one of: beginner, intermediate, advanced"];
  }

  // Validate fitness goals
  if (
    !data.fitnessGoals ||
    !Array.isArray(data.fitnessGoals) ||
    data.fitnessGoals.length === 0
  ) {
    return [false, "At least one fitness goal is required"];
  }

  // Validate training frequency
  const validFrequencies = ["1", "2", "3", "4", "5", "6", "7"];
  if (
    !data.trainingFrequency ||
    !validFrequencies.includes(data.trainingFrequency)
  ) {
    return [false, "Training frequency must be between 1 and 7"];
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
  logger.info(`Applying personalization for user ${userId}`);

  try {
    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);

    // Update user profile with personalization data
    await userRef.update({
      displayName: data.displayName,
      level: data.level,
      fitnessGoals: data.fitnessGoals,
      trainingFrequency: data.trainingFrequency,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Successfully applied personalization for user ${userId}`);
  } catch (error) {
    logger.error(`Error applying personalization for user ${userId}:`, error);
    throw error;
  }
}
