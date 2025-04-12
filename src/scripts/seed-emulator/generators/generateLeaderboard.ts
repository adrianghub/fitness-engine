import {
  addDoc,
  collection,
  doc,
  getDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

// Update leaderboard for a specific user and their opponents
export async function updateLeaderboard(
  userId: string,
  opponentIds: string[]
): Promise<void> {
  console.log(`Updating leaderboard for user ${userId}...`);
  const leaderboardRef = collection(db, "leaderboard");
  const batch = writeBatch(db);
  const now = Timestamp.now();

  // Fetch the opponents to get their current points
  const opponentsData: Array<{
    id: string;
    name?: string;
    currentPoints: number;
    level?: string;
  }> = [];

  for (const opponentId of opponentIds) {
    const opponentDoc = await getDoc(doc(db, "opponents", opponentId));
    if (opponentDoc.exists()) {
      const data = opponentDoc.data();
      opponentsData.push({
        id: opponentId,
        name: data.name,
        currentPoints: data.currentPoints,
        level: data.level,
      });
    }
  }

  // Sort opponents by current points in descending order
  opponentsData.sort((a, b) => b.currentPoints - a.currentPoints);

  // Create leaderboard entries with correct ranks
  for (let i = 0; i < opponentsData.length; i++) {
    const entry = opponentsData[i];
    const rank = i + 1;

    try {
      const leaderboardEntry = {
        entityType: "opponent",
        entityId: entry.id,
        points: entry.currentPoints,
        rank: rank,
        userId: userId, // Associate leaderboard entry with user
        lastUpdated: now,
      };

      const docRef = await addDoc(leaderboardRef, leaderboardEntry);
      console.log(
        `Added leaderboard entry for opponent ${entry.name} with rank ${rank} and ID: ${docRef.id}`
      );
    } catch (error) {
      console.error(`Error adding leaderboard entry:`, error);
    }
  }

  await batch.commit();
}
