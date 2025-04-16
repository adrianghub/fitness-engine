/**
 * Handler for generating opponents for users
 * Handles the creation of algorithmically generated opponents for competition
 */

import * as admin from "firebase-admin";
import { QuerySnapshot, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type { Leaderboard, User, UserLevel } from "../../src/types/models";
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
              updatedAt: Timestamp.now(),
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
                lastOpponentRegeneration: Timestamp.now(),
                updatedAt: Timestamp.now(),
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
  const db = admin.firestore();
  const opponentIds: string[] = [];
  const now = Timestamp.now();

  try {
    await db.runTransaction(async (transaction) => {
      const existingOpponentsSnapshot = await transaction.get(
        db.collection("opponents").where("userId", "==", userId)
      );

      const existingLeaderboardEntries = await transaction.get(
        db
          .collection("leaderboard")
          .where("entityType", "==", "opponent")
          .where("userId", "==", userId)
      );

      const userRef = db.collection("users").doc(userId);

      const numOpponents = 100;
      const opponentsData = Array.from({ length: numOpponents }, () => {
        const opponentId = db.collection("opponents").doc().id;
        opponentIds.push(opponentId);
        return {
          id: opponentId,
          name: generateRandomUsername(),
          currentPoints: calculateOpponentPoints(level),
          level: level,
          userId: userId,
          createdAt: now,
          updatedAt: now,
          lastUpdated: now,
        };
      });

      const leaderboardEntries = opponentsData.map((opponent) => ({
        entityId: opponent.id,
        entityType: "opponent" as const,
        userId: userId,
        level: level,
        points: opponent.currentPoints,
        updatedAt: now,
      }));

      existingOpponentsSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      existingLeaderboardEntries.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      opponentsData.forEach((opponentData) => {
        const opponentRef = db.collection("opponents").doc(opponentData.id);
        transaction.set(opponentRef, opponentData);
      });

      leaderboardEntries.forEach((entry) => {
        const leaderboardRef = db.collection("leaderboard").doc();
        transaction.set(leaderboardRef, entry);
      });

      transaction.update(userRef, {
        lastOpponentRegeneration: now,
        updatedAt: now,
      });

      logger.info(
        `Prepared ${opponentIds.length} opponents and leaderboard entries for user ${userId}`
      );
    });

    logger.info(
      `Successfully generated ${opponentIds.length} opponents for user ${userId}`
    );
    return opponentIds;
  } catch (error) {
    logger.error(
      `Error in opponent generation transaction for user ${userId}:`,
      error
    );
    throw error;
  }
}
