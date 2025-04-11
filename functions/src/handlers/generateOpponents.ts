/**
 * Handler for generating opponents for users
 * Handles the creation of algorithmically generated opponents for competition
 */

import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { FIRST_NAMES, LAST_NAMES, USERNAME_PREFIXES } from "../data/opponents";
import type { UserLevel } from "../types";

// Point ranges for different levels to ensure opponents have appropriate scores
export const LEVEL_POINT_RANGES: Record<
  UserLevel,
  { min: number; max: number }
> = {
  beginner: { min: 1000, max: 15000 },
  intermediate: { min: 16000, max: 30000 },
  advanced: { min: 31000, max: 100000 },
};

/**
 * Generates a random username for an opponent using predefined name parts
 * @returns A randomly generated username
 */
function generateRandomUsername(): string {
  const firstName =
    FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)].toLowerCase();
  const lastName =
    LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)].toLowerCase();
  const prefix =
    USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];

  const patterns = [
    () =>
      `${prefix}_${firstName}_${lastName}_${Math.floor(Math.random() * 1000)}`,
    () => `${firstName}_${lastName}_${Math.floor(Math.random() * 1000)}`,
    () => `${prefix}_${firstName}_${Math.floor(Math.random() * 1000)}`,
    () => `${firstName}_${lastName}_${Math.floor(Math.random() * 1000)}`,
    () => `${prefix}_${firstName}_${Math.floor(Math.random() * 1000)}`,
  ];

  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern();
}

/**
 * Calculates initial points for an opponent based on user level
 * @param level The level to calculate points for
 * @returns The calculated points
 */
function calculateOpponentPoints(level: UserLevel): number {
  const pointRange = LEVEL_POINT_RANGES[level];
  const distribution = Math.random();

  if (distribution < 0.7) {
    // 70% of opponents are within middle range
    return Math.floor(
      pointRange.min +
        (pointRange.max - pointRange.min) * 0.3 +
        (pointRange.max - pointRange.min) * 0.4 * Math.random()
    );
  } else if (distribution < 0.9) {
    // 20% of opponents are in the lower range
    return Math.floor(
      pointRange.min + (pointRange.max - pointRange.min) * 0.3 * Math.random()
    );
  } else {
    // 10% of opponents are in the upper range
    return Math.floor(
      pointRange.min +
        (pointRange.max - pointRange.min) * 0.7 +
        (pointRange.max - pointRange.min) * 0.3 * Math.random()
    );
  }
}

/**
 * Updates the leaderboard rankings for a user and their opponents
 * @param db The Firestore database instance
 * @param userId The ID of the user to update rankings for
 */
async function updateLeaderboardRanks(
  db: FirebaseFirestore.Firestore,
  userId: string
): Promise<void> {
  try {
    // Get all leaderboard entries for this user, sorted by points descending
    const leaderboardSnapshot = await db
      .collection("leaderboard")
      .where("userId", "==", userId)
      .orderBy("points", "desc")
      .get();

    if (leaderboardSnapshot.empty) {
      return;
    }

    const updateBatch = db.batch();
    let currentRank = 1;

    leaderboardSnapshot.forEach((doc) => {
      updateBatch.update(doc.ref, {
        rank: currentRank,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      currentRank++;
    });

    await updateBatch.commit();
    logger.info(`Updated leaderboard ranks for user ${userId}`);
  } catch (error) {
    logger.error(`Error updating leaderboard for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Generates opponents for a user based on their level
 * @param userId The ID of the user to generate opponents for
 * @param level The level of the user (beginner, intermediate, advanced)
 * @returns Promise that resolves with an array of opponent IDs
 */
export async function generateUserOpponents(
  userId: string,
  level: UserLevel
): Promise<string[]> {
  logger.info(`Generating opponents for user ${userId} with level ${level}`);

  const opponentIds: string[] = [];
  const db = admin.firestore();

  // Delete any existing opponents for this user
  const existingOpponentsSnapshot = await db
    .collection("opponents")
    .where("userId", "==", userId)
    .get();

  if (!existingOpponentsSnapshot.empty) {
    const batch = db.batch();
    existingOpponentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    logger.info(`Deleted ${existingOpponentsSnapshot.size} existing opponents`);
  }

  // Generate 100 unique opponents for this user
  const numOpponents = 100;
  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 450; // Firestore batch limit is 500

  for (let i = 0; i < numOpponents; i++) {
    try {
      // Generate a unique opponent ID
      const opponentId = db.collection("opponents").doc().id;
      const opponentRef = db.collection("opponents").doc(opponentId);

      // Calculate points and generate username
      const points = calculateOpponentPoints(level);
      const username = generateRandomUsername();

      const opponentData = {
        id: opponentId,
        name: username,
        currentPoints: points,
        level: level,
        userId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(opponentRef, opponentData);
      opponentIds.push(opponentId);
      batchCount++;

      // If batch size reaches limit, commit the batch and start a new one
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
        logger.info(`Committed batch of ${BATCH_SIZE} opponents`);
      }
    } catch (error) {
      logger.error(`Error creating opponent for user ${userId}:`, error);
    }
  }

  // Commit any remaining opponents in the batch
  if (batchCount > 0) {
    await batch.commit();
  }

  logger.info(`Added ${opponentIds.length} opponents for user ${userId}`);

  // Now update the leaderboard with the new opponents
  await updateLeaderboardRanks(db, userId);

  // Update the user's last opponent regeneration timestamp
  await db.collection("users").doc(userId).update({
    lastOpponentRegeneration: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return opponentIds;
}

/**
 * Calculates a point change for an opponent to simulate activity
 * @param currentPoints The current points of the opponent
 * @param level The level of the opponent
 * @returns The new points value
 */
export function calculatePointChange(
  currentPoints: number,
  level: UserLevel
): number {
  let pointsChange: number;
  switch (level) {
    case "beginner":
      // Small change for beginners (1-5% of current points)
      pointsChange = Math.floor(currentPoints * (0.01 + Math.random() * 0.04));
      break;
    case "intermediate":
      // Medium change for intermediate (3-8% of current points)
      pointsChange = Math.floor(currentPoints * (0.03 + Math.random() * 0.05));
      break;
    case "advanced":
      // Larger change for advanced (5-12% of current points)
      pointsChange = Math.floor(currentPoints * (0.05 + Math.random() * 0.07));
      break;
    default:
      pointsChange = Math.floor(currentPoints * 0.03);
  }

  // Randomly decide if points increase or decrease (70% chance to increase)
  const isIncrease = Math.random() < 0.7;
  const newPoints = isIncrease
    ? currentPoints + pointsChange
    : Math.max(currentPoints - pointsChange, 0); // Ensure points don't go below 0

  // Ensure points stay within the level's range
  const pointRange = LEVEL_POINT_RANGES[level];
  return Math.min(Math.max(newPoints, pointRange.min), pointRange.max);
}

/**
 * Determines if opponent regeneration is due based on training frequency
 * @param lastRegeneration The timestamp of the last regeneration
 * @param trainingFrequency The user's training frequency (1-7)
 * @returns Boolean indicating if regeneration is due
 */
export function isRegenerationDue(
  lastRegeneration: FirebaseFirestore.Timestamp | null,
  trainingFrequency: string
): boolean {
  if (!lastRegeneration) {
    return true; // No previous regeneration, so regeneration is due
  }

  const frequencyDays = parseInt(trainingFrequency, 10);
  if (isNaN(frequencyDays) || frequencyDays < 1 || frequencyDays > 7) {
    return false;
  }

  const lastRegenerationDate = lastRegeneration.toDate();
  const currentDate = new Date();

  // Calculate difference in days
  const diffTime = currentDate.getTime() - lastRegenerationDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= frequencyDays;
}

/**
 * Updates opponents for all users due for an update
 * This should be called by a scheduled function
 */
export async function updateOpponentsOnSchedule(): Promise<void> {
  logger.info("Starting scheduled opponent score update check");

  const db = admin.firestore();

  try {
    // Get all users
    const usersSnapshot = await db.collection("users").get();
    const updatePromisesList: Promise<void>[] = [];
    let updatedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Skip users without required fields
      if (!userData.trainingFrequency || !userData.level) {
        continue;
      }

      if (
        isRegenerationDue(
          userData.lastOpponentRegeneration || null,
          userData.trainingFrequency
        )
      ) {
        logger.info(
          `Updating opponent scores for user ${userId} with frequency ${userData.trainingFrequency}`
        );

        // Update existing opponents' scores
        try {
          const existingOpponentsSnapshot = await db
            .collection("opponents")
            .where("userId", "==", userId)
            .get();

          if (!existingOpponentsSnapshot.empty) {
            logger.info(
              `Updating scores for ${existingOpponentsSnapshot.size} opponents`
            );

            // Process in batches
            let updateBatch = db.batch();
            let updateCount = 0;
            const opponentUpdatePromises = [];

            existingOpponentsSnapshot.forEach((doc) => {
              const opponent = doc.data();
              // Cast level as Exclude<Level, 'all'> since opponents don't use 'all' level
              const opponentLevel = opponent.level;

              // Calculate new points
              const newPoints = calculatePointChange(
                opponent.currentPoints,
                opponentLevel
              );

              // Update the opponent
              updateBatch.update(doc.ref, {
                currentPoints: newPoints,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              updateCount++;

              if (updateCount >= 450) {
                opponentUpdatePromises.push(updateBatch.commit());
                updateBatch = db.batch();
                updateCount = 0;
              }
            });

            if (updateCount > 0) {
              opponentUpdatePromises.push(updateBatch.commit());
            }

            // After updating scores, update the leaderboard
            const updatePromise = Promise.all(opponentUpdatePromises).then(
              async () => {
                // Update leaderboard with new scores
                await updateLeaderboardRanks(db, userId);

                // Update the last regeneration timestamp
                await db.collection("users").doc(userId).update({
                  lastOpponentRegeneration:
                    admin.firestore.FieldValue.serverTimestamp(),
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
              }
            );

            updatePromisesList.push(updatePromise);
            updatedCount++;

            logger.info(
              `Successfully updated scores for opponents of user ${userId}`
            );
          }
        } catch (error) {
          logger.error(
            `Error updating opponent scores for user ${userId}:`,
            error
          );
        }
      }
    }

    // Wait for all updates to complete
    await Promise.all(updatePromisesList);

    logger.info(
      `Successfully updated scores for opponents of ${updatedCount} users`
    );
  } catch (error) {
    logger.error("Error in scheduled opponent score update:", error);
    throw error;
  }
}
