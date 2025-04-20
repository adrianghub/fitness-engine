import * as admin from "firebase-admin";
import { Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import type { User, UserChallenge } from "../types/models";
import { promoteUser } from "./promoteUser";

/**
 * Handles the completion of a challenge by:
 * 1. Marking the challenge as completed
 * 2. Awarding points to the user
 * 3. Updating the leaderboard
 * 4. Checking for promotion eligibility
 *
 * Note: Promotion eligibility is checked automatically via Firestore triggers
 *
 * @param userId The ID of the user completing the challenge
 * @param challengeId The ID of the challenge being completed
 * @returns Promise that resolves with whether the user was promoted
 */
export async function completeChallenge(
  userId: string,
  challengeId: string
): Promise<{ wasPromoted: boolean }> {
  logger.info(`Completing challenge ${challengeId} for user ${userId}`);

  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    const result = await db.runTransaction(async (transaction) => {
      const challengeDoc = (await transaction.get(
        db.collection("userChallenges").doc(challengeId)
      )) as DocumentSnapshot<UserChallenge>;

      if (!challengeDoc.exists) {
        logger.error(`Challenge ${challengeId} not found`);
        throw new Error("Challenge not found");
      }

      const challengeData = challengeDoc.data();
      if (challengeData?.userId !== userId) {
        logger.error(
          `Challenge ${challengeId} does not belong to user ${userId}`
        );
        throw new Error("Challenge does not belong to user");
      }

      if (challengeData.status === "completed") {
        logger.info(`Challenge ${challengeId} already completed`);
        return { wasPromoted: false };
      }

      const userDoc = await transaction.get(db.collection("users").doc(userId));
      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }
      const userData = userDoc.data() as User;

      const leaderboardQuery = await transaction.get(
        db
          .collection("leaderboard")
          .where("entityType", "in", ["user", "opponent"])
          .where("level", "==", userData.level)
          .orderBy("points", "desc")
          .limit(1)
      );

      const newPoints = (userData.points || 0) + challengeData.points;
      const isNumberOne =
        !leaderboardQuery.empty && leaderboardQuery.docs[0].id === userId;

      transaction.update(challengeDoc.ref, {
        status: "completed",
        finishedAt: now,
      });

      transaction.update(userDoc.ref, {
        points: newPoints,
        updatedAt: now,
      });

      const leaderboardRef = db.collection("leaderboard").doc(userId);
      transaction.set(
        leaderboardRef,
        {
          entityId: userId,
          entityType: "user",
          level: userData.level,
          points: newPoints,
          updatedAt: now,
        },
        { merge: true }
      );

      // If user is #1, they will be promoted after the transaction
      return { wasPromoted: isNumberOne && userData.level !== "advanced" };
    });

    // If user was #1, promote them
    if (result.wasPromoted) {
      await promoteUser(userId);
    }

    logger.info(
      `Successfully completed challenge ${challengeId} for user ${userId}`
    );

    return result;
  } catch (error) {
    logger.error(
      `Error completing challenge ${challengeId} for user ${userId}:`,
      error
    );
    throw error;
  }
}
