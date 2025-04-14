/**
 * Handler for user personalization
 * Handles first-time profile setup and validation for personalization data
 */

import * as admin from "firebase-admin";
import { DocumentReference, QuerySnapshot } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { onCall } from "firebase-functions/v2/https";
import type { User } from "../../src/types/models";
import { generateUserChallenges } from "./generateChallenges";
import { generateUserOpponents } from "./generateOpponents";

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
    const userRef = db
      .collection("users")
      .doc(userId) as DocumentReference<User>;

    // Update user profile with personalization data
    await userRef.update({
      displayName: data.displayName,
      level: data.level,
      fitnessGoals: data.fitnessGoals,
      isProfileComplete: true,
    });

    logger.info(`Successfully applied personalization for user ${userId}`);
  } catch (error) {
    logger.error(`Error applying personalization for user ${userId}:`, error);
    throw error;
  }
}

export interface PersonalizationData {
  displayName: string;
  level: User["level"];
  fitnessGoals: string[];
}

/**
 * HTTP callable function to complete user profile and apply personalization
 */
export const completeUserProfile = onCall(
  { cors: true, region: "europe-central2" },
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

      await generateUserChallenges(uid, personalizationData.level);
      await generateUserOpponents(uid, personalizationData.level);

      logger.info(`Successfully completed profile setup for user ${uid}`);

      return { success: true };
    } catch (error) {
      logger.error("Error in completeUserProfile function:", error);
      throw new Error("Failed to complete profile setup");
    }
  }
);
