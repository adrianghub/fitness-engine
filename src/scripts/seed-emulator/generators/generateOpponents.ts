import { doc, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import type { UserLevel } from "../../../types/models";
import { USER_LEVELS } from "../constants";
import {
  calculateOpponentPoints,
  generateRandomUsername,
} from "../utils/opponents";

export async function generateOpponentsForUser(
  userId: string
): Promise<string[]> {
  console.log(`Generating opponents for user ${userId}...`);

  const opponentIds: string[] = [];

  // Use batch writes to handle larger number of opponents
  // Firebase limits batch size to 500, so we'll handle that
  const BATCH_SIZE = 500;
  let batch = writeBatch(db);
  let batchCount = 0;

  // Generate 100 unique opponents for this user
  const numOpponents = 100;

  for (let i = 0; i < numOpponents; i++) {
    try {
      const opponentId = crypto.randomUUID();
      const opponentRef = doc(db, "opponents", opponentId);

      // Generate random opponent data with points and level
      const level = USER_LEVELS[
        Math.floor(Math.random() * USER_LEVELS.length)
      ] as UserLevel;
      const points = calculateOpponentPoints(level);
      const username = generateRandomUsername();

      const opponentData = {
        id: opponentId,
        name: username,
        currentPoints: points,
        level: level,
        userId: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      batch.set(opponentRef, opponentData);
      opponentIds.push(opponentId);
      batchCount++;

      // If batch size reaches limit, commit the batch and start a new one
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
        console.log(`Committed batch of ${BATCH_SIZE} opponents`);
      }
    } catch (error) {
      console.error(`Error creating opponent for user ${userId}:`, error);
    }
  }

  // Commit any remaining opponents in the batch
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`Added ${opponentIds.length} opponents for user ${userId}`);
  return opponentIds;
}
