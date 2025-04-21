import * as admin from "firebase-admin";
import {
  QuerySnapshot,
  Timestamp,
  type DocumentReference,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { ADJACENT_LEVELS } from "../data/adjacent-levels";
import { assignUniversalChallenges } from "../handlers/manageUniversalChallenges";
import { generatePersonalizedChallenges } from "../services/ai";
import type {
  ChallengeTemplate,
  ChallengeType,
  User,
  UserChallenge,
} from "../types/models";
import { CHALLENGE_POINTS, selectRegularChallenges } from "../utils/challenges";

const COLLECTIONS = {
  users: "users",
  userChallenges: "userChallenges",
  challengeTemplates: "challengeTemplates",
};

/**
 * Refreshes user challenges daily and applies penalties for incomplete challenges
 * Note: Universal challenges are not refreshed daily, they are only assigned during personalization and promotion
 */
export async function refreshUserChallenges(): Promise<void> {
  const db = admin.firestore();
  const now = Timestamp.now();
  const yesterday = new Timestamp(now.seconds - 86400, now.nanoseconds);

  try {
    // Get all users with completed profiles
    const usersSnapshot = (await db
      .collection(COLLECTIONS.users)
      .where("isProfileComplete", "==", true)
      .get()) as QuerySnapshot<User>;

    if (usersSnapshot.empty) {
      logger.info("No users found with completed profiles");
      return;
    }

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      try {
        logger.info(`Processing user ${userId}`);
        const recentChallengeIds: string[] = [];

        await db.runTransaction(async (transaction) => {
          // Get incomplete challenges - apply penalties to ALL incomplete challenges
          const incompleteChallengesSnapshot = await transaction.get(
            db
              .collection(COLLECTIONS.userChallenges)
              .where("userId", "==", userId)
              .where("status", "not-in", ["completed"])
              .where("assignedAt", "<", now)
          );

          // Get all old challenges to be removed
          const oldChallengesSnapshot = await transaction.get(
            db
              .collection(COLLECTIONS.userChallenges)
              .where("userId", "==", userId)
              .where("assignedAt", "<", now)
          );

          // Get challenges from today - to avoid duplicates
          const todaysChallengesSnapshot = await transaction.get(
            db
              .collection(COLLECTIONS.userChallenges)
              .where("userId", "==", userId)
              .where("type", "==", "regular")
              .where("assignedAt", ">=", yesterday)
          );

          const allowedLevels = ADJACENT_LEVELS[userData.level];
          const levelChallengesSnapshot = await transaction.get(
            db
              .collection(COLLECTIONS.challengeTemplates)
              .where("level", "in", allowedLevels)
          );

          let penaltyPoints = 0;

          // Apply penalties for all incomplete challenges
          incompleteChallengesSnapshot.forEach((doc) => {
            const challenge = doc.data() as UserChallenge;
            penaltyPoints += challenge.points;
          });

          todaysChallengesSnapshot.forEach((doc) => {
            const challenge = doc.data() as UserChallenge;
            recentChallengeIds.push(challenge.challengeId);
          });

          const availableRegularChallenges = levelChallengesSnapshot.docs
            .map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }))
            .filter(
              (challenge) => !recentChallengeIds.includes(challenge.id)
            ) as (ChallengeTemplate & { id: string })[];

          logger.info(
            `Found ${availableRegularChallenges.length} available challenges across levels: ${allowedLevels.join(", ")}`
          );

          // Generate personalized challenges
          const recommendedChallenges = await generatePersonalizedChallenges(
            {
              level: userData.level,
              equipment: userData.equipment || [],
              goalsDescription: (userData.fitnessGoals || []).join(", "),
              displayName: userData.displayName!,
            },
            availableRegularChallenges
          );

          const { dailyChallenge, regularChallenges } = selectRegularChallenges(
            availableRegularChallenges,
            recommendedChallenges || [],
            userData.level
          );

          if (penaltyPoints > 0) {
            const currentPoints = userData.points || 0;
            const finalPenalty = Math.min(penaltyPoints, currentPoints);

            if (finalPenalty > 0) {
              transaction.update(userDoc.ref, {
                points: Math.max(0, currentPoints - finalPenalty),
              });

              const leaderboardRef = db.collection("leaderboard").doc(userId);
              transaction.set(
                leaderboardRef,
                {
                  entityId: userId,
                  entityType: "user",
                  level: userData.level,
                  points: Math.max(0, currentPoints - finalPenalty),
                  updatedAt: now,
                },
                { merge: true }
              );

              logger.info(
                `Applied penalty of ${finalPenalty} points to user ${userId} (original penalty: ${penaltyPoints})`
              );
            }
          }

          oldChallengesSnapshot.forEach((doc) => {
            transaction.delete(doc.ref);
          });

          logger.info(`Removed ${oldChallengesSnapshot.size} old challenges`);

          if (dailyChallenge) {
            const challengeRef = db
              .collection(COLLECTIONS.userChallenges)
              .doc() as DocumentReference<UserChallenge>;
            transaction.set(challengeRef, {
              userId,
              challengeId: dailyChallenge.id,
              status: "not-started",
              assignedAt: now,
              points: CHALLENGE_POINTS[userData.level].daily,
              type: "daily" as ChallengeType,
              retriesLeft: 3,
            });
          }

          for (const challenge of regularChallenges) {
            const challengeRef = db
              .collection(COLLECTIONS.userChallenges)
              .doc() as DocumentReference<UserChallenge>;
            transaction.set(challengeRef, {
              userId,
              challengeId: challenge.id,
              status: "not-started",
              assignedAt: now,
              points: CHALLENGE_POINTS[userData.level].regular,
              type: "regular" as ChallengeType,
              retriesLeft: 3,
            });
          }

          logger.info(
            `Generated challenges for user ${userId}: 1 daily + ${regularChallenges.length} regular${recommendedChallenges ? " (AI recommended)" : ""}`
          );
        });

        await assignUniversalChallenges(userId, userData.level);

        logger.info(`Successfully refreshed challenges for user ${userId}`);
      } catch (error) {
        logger.error(`Error processing user ${userId}:`, error);
        continue;
      }
    }

    logger.info("Successfully completed daily challenge refresh");
  } catch (error) {
    logger.error("Error in refreshUserChallenges:", error);
    throw error;
  }
}
