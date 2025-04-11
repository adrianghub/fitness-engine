import { Timestamp, doc, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { LEVELS, USERNAME_PREFIXES, levelToPointsMap } from "../data/constants";

// Function to generate a random username
export function generateRandomUsername(): string {
  const prefix =
    USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];

  // Different username patterns
  const patterns = [
    () =>
      `${prefix}_${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
    () =>
      `${prefix}.${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
    () =>
      `${prefix}${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
    () =>
      `${prefix}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
    () =>
      `${Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0")}_${prefix}_${Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0")}`,
  ];

  // Select a random pattern
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern();
}

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
      const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
      const basePoints = levelToPointsMap[level];
      const randomPoints = Math.round(basePoints * (0.7 + Math.random() * 0.6)); // 70-130% of base points

      // Generate a random username
      const username = generateRandomUsername();

      const opponentData = {
        id: opponentId,
        name: username,
        currentPoints: randomPoints,
        level: level,
        userId: userId, // Associate opponent with user
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
