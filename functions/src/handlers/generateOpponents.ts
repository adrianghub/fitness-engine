/**
 * Handler for generating opponents for users
 * Handles the creation of algorithmically generated opponents for competition
 */

import * as admin from "firebase-admin";
import type {
  DocumentReference,
  QuerySnapshot,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type {
  Leaderboard,
  Opponent,
  User,
  UserLevel,
} from "../../src/types/models";
import {
  calculateOpponentPoints,
  calculatePointChange,
  generateRandomUsername,
} from "../utils/opponents";

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
    const leaderboardSnapshot = (await db
      .collection("leaderboard")
      .where("userId", "==", userId)
      .orderBy("points", "desc")
      .get()) as QuerySnapshot<Leaderboard>;

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
  const existingOpponentsSnapshot = (await db
    .collection("opponents")
    .where("userId", "==", userId)
    .get()) as QuerySnapshot<Opponent>;

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
      const opponentRef = db
        .collection("opponents")
        .doc(opponentId) as DocumentReference<Opponent>;

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
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
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
 * Updates opponents for all users due for an update
 * This should be called by a scheduled function
 */
export async function updateOpponentsOnSchedule(): Promise<void> {
  logger.info("Starting scheduled opponent score update check");

  const db = admin.firestore();

  try {
    // Get all users
    const usersSnapshot = (await db
      .collection("users")
      .get()) as QuerySnapshot<User>;
    const updatePromisesList: Promise<void>[] = [];
    let updatedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Skip users without required fields
      if (!userData.level) {
        continue;
      }

      logger.info(`Updating opponent scores for user ${userId}`);

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
