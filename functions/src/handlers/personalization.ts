/**
 * Handler for user personalization
 * Handles first-time profile setup and validation for personalization data
 */

import * as admin from "firebase-admin";
import {
  DocumentReference,
  QuerySnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { generatePersonalizedPlan } from "../services/ai";
import type { ChallengeTemplate, User } from "../types/models";
import type { PersonalizationData } from "../types/personalization-data";
import { generateUserChallenges } from "./generateChallenges";
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
  logger.info(`Applying personalization for user ${userId}`);

  try {
    const db = admin.firestore();
    const userRef = db
      .collection("users")
      .doc(userId) as DocumentReference<User>;

    const challengeTemplatesSnapshot = (await db
      .collection("challengeTemplates")
      .where("level", "in", [data.level])
      .get()) as QuerySnapshot<ChallengeTemplate>;

    const availableChallenges = challengeTemplatesSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const aiPlan = await generatePersonalizedPlan(data, availableChallenges);

    await userRef.update({
      displayName: data.displayName,
      level: data.level,
      equipment: data.equipment,
      fitnessGoals: aiPlan.goals,
      isProfileComplete: true,
      updatedAt: Timestamp.now(),
    });

    await generateUserChallenges(
      userId,
      data.level,
      aiPlan.recommendedChallenges
    );

    logger.info(`Successfully applied personalization for user ${userId}`);
  } catch (error) {
    logger.error(`Error applying personalization for user ${userId}:`, error);
    throw error;
  }
}
