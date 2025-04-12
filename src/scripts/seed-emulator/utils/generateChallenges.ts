import {
  addDoc,
  collection,
  doc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { CHALLENGE_TEMPLATES } from "../../../../shared/data/challenge-templates";
import { db } from "../../../lib/firebase";
import type { ChallengeLevel } from "../../../types/models";
import {
  calculateChallengePoints,
  generateChallengeTimestamps,
  selectRandomChallenges,
} from "./challenges";

// Create challenge templates in the database
export async function createChallengeTemplates(): Promise<string[]> {
  console.log("Creating challenge templates...");
  const challengesRef = collection(db, "challengeTemplates");
  const now = Timestamp.now();
  const challengeIds: string[] = [];

  for (const template of CHALLENGE_TEMPLATES) {
    try {
      const docRef = await addDoc(challengesRef, {
        ...template,
        createdAt: now,
        updatedAt: now,
      });

      challengeIds.push(docRef.id);
      console.log(
        `Added challenge template: ${template.title} with ID: ${docRef.id}`
      );
    } catch (error) {
      console.error(
        `Error adding challenge template ${template.title}:`,
        error
      );
    }
  }

  return challengeIds;
}

// Create user challenges for a specific user
export async function createUserChallenges(
  userId: string,
  challengeIds: string[]
): Promise<void> {
  console.log(`Creating user challenges for user ${userId}...`);

  if (challengeIds.length < 15) {
    console.warn("Not enough challenge templates to create user challenges");
    return;
  }

  const userChallengesRef = collection(db, "userChallenges");
  const now = Timestamp.now();
  const { oneWeekAgo, twoWeeksAgo } = generateChallengeTimestamps(now.toDate());

  // Select random challenges
  const selectedChallengeIds = selectRandomChallenges(challengeIds, 20);

  // Completed challenges (10)
  const completedChallenges = selectedChallengeIds
    .slice(0, 10)
    .map((challengeId, index) => {
      // Vary the completion dates
      let assignedDate, startedAt, finishedAt;

      if (index < 3) {
        // Recently completed
        assignedDate = new Timestamp(
          now.seconds - (index + 1) * 24 * 60 * 60,
          0
        );
        startedAt = new Timestamp(assignedDate.seconds + 60 * 60, 0); // 1 hour after assignment
        finishedAt = new Timestamp(startedAt.seconds + 30 * 60, 0); // 30 minutes after starting
      } else if (index < 6) {
        // Completed last week
        assignedDate = Timestamp.fromDate(oneWeekAgo);
        startedAt = new Timestamp(assignedDate.seconds + 2 * 60 * 60, 0); // 2 hours after assignment
        finishedAt = new Timestamp(startedAt.seconds + 45 * 60, 0); // 45 minutes after starting
      } else {
        // Completed earlier
        assignedDate = Timestamp.fromDate(twoWeeksAgo);
        startedAt = new Timestamp(assignedDate.seconds + 5 * 60 * 60, 0); // 5 hours after assignment
        finishedAt = new Timestamp(startedAt.seconds + 60 * 60, 0); // 1 hour after starting
      }

      // Calculate points based on challenge level
      const template = CHALLENGE_TEMPLATES.find((t) => t.id === challengeId);
      const pointsAwarded = calculateChallengePoints(
        template?.level as ChallengeLevel
      );

      return {
        userId: userId,
        challengeId: challengeId,
        status: "finished",
        assignedDate: assignedDate,
        startedAt: startedAt,
        finishedAt: finishedAt,
        pointsAwarded: pointsAwarded,
      };
    });

  // In-progress challenges (5)
  const inProgressChallenges = selectedChallengeIds
    .slice(10, 15)
    .map((challengeId, index) => {
      // Vary the start dates
      const assignedDate = new Timestamp(
        now.seconds - (index + 1) * 12 * 60 * 60,
        0
      );
      const startedAt = new Timestamp(
        assignedDate.seconds + (index + 1) * 60 * 60,
        0
      );

      return {
        userId: userId,
        challengeId: challengeId,
        status: "in progress",
        assignedDate: assignedDate,
        startedAt: startedAt,
        finishedAt: null,
        pointsAwarded: null,
      };
    });

  // Not started challenges (5)
  const notStartedChallenges = selectedChallengeIds
    .slice(15, 20)
    .map((challengeId, index) => {
      // Assigned recently, not started yet
      const assignedDate = new Timestamp(now.seconds - index * 8 * 60 * 60, 0);

      return {
        userId: userId,
        challengeId: challengeId,
        status: "not started",
        assignedDate: assignedDate,
        startedAt: null,
        finishedAt: null,
        pointsAwarded: null,
      };
    });

  // Combine all challenges
  const userChallenges = [
    ...completedChallenges,
    ...inProgressChallenges,
    ...notStartedChallenges,
  ];

  // Use batch writes for better performance
  const batchSize = 500;
  let batch = writeBatch(db);
  let count = 0;

  for (const challenge of userChallenges) {
    try {
      const docRef = doc(userChallengesRef);
      batch.set(docRef, {
        ...challenge,
        createdAt: challenge.assignedDate || now,
        updatedAt:
          challenge.finishedAt ||
          challenge.startedAt ||
          challenge.assignedDate ||
          now,
      });

      count++;

      if (count >= batchSize) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    } catch (error) {
      console.error(`Error adding user challenge:`, error);
    }
  }

  // Commit any remaining challenges
  if (count > 0) {
    await batch.commit();
  }

  console.log(`Added ${userChallenges.length} challenges for user: ${userId}`);
}
