import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { ADJACENT_LEVELS } from "../data/adjacent-levels";
import { assignUniversalChallenges } from "../handlers/manageUniversalChallenges";
import * as challengeTemplateRepo from "../repositories/ChallengeTemplateRepository";
import * as userChallengeRepo from "../repositories/UserChallengeRepository";
import * as userRepo from "../repositories/UserRepository";
import { generatePersonalizedChallenges } from "../services/ai";
import type { ChallengeType, UserChallenge } from "../types/models";
import {
  CHALLENGE_CONFIG,
  CHALLENGE_POINTS,
  selectRegularChallenges,
} from "../utils/challenges";

/**
 * Refreshes user challenges daily and applies penalties for incomplete challenges
 * Note: Universal challenges are not refreshed daily, they are only assigned during personalization and promotion
 */
export async function refreshUserChallenges(): Promise<void> {
  const db = admin.firestore();
  const now = Timestamp.now();
  const yesterday = new Timestamp(now.seconds - 86400, now.nanoseconds);

  try {
    const usersSnapshot = await userRepo.findAllWithCompletedProfiles();

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
          const incompleteChallengesSnapshot =
            await userChallengeRepo.findIncompleteChallengesBefore(
              userId,
              now,
              transaction
            );

          const oldChallengesSnapshot =
            await userChallengeRepo.findChallengesAssignedBefore(
              userId,
              now,
              transaction
            );

          const todaysChallengesSnapshot =
            await userChallengeRepo.findRegularChallengesSince(
              userId,
              yesterday,
              transaction
            );

          const allowedLevels = ADJACENT_LEVELS[userData.level];
          const levelChallenges = await challengeTemplateRepo.findByLevels(
            allowedLevels,
            transaction
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

          const availableRegularChallenges = levelChallenges.filter(
            (challenge) => !recentChallengeIds.includes(challenge.id)
          );

          logger.info(
            `Found ${availableRegularChallenges.length} available challenges across levels: ${allowedLevels.join(", ")} (from repo)`
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
              const newPoints = Math.max(0, currentPoints - finalPenalty);
              userRepo.updatePoints(transaction, userId, newPoints, now);

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

          userChallengeRepo.deleteChallengesInSnapshot(
            transaction,
            oldChallengesSnapshot
          );

          logger.info(
            `Removed ${oldChallengesSnapshot.size} old challenges (via repo)`
          );

          if (dailyChallenge) {
            userChallengeRepo.createChallenge(transaction, {
              userId,
              challengeId: dailyChallenge.id,
              status: "not-started",
              assignedAt: now,
              points: CHALLENGE_POINTS[userData.level].daily,
              type: "daily" as ChallengeType,
              retriesLeft: CHALLENGE_CONFIG.retries,
            });
          }

          for (const challenge of regularChallenges) {
            userChallengeRepo.createChallenge(transaction, {
              userId,
              challengeId: challenge.id,
              status: "not-started",
              assignedAt: now,
              points: CHALLENGE_POINTS[userData.level].regular,
              type: "regular" as ChallengeType,
              retriesLeft: CHALLENGE_CONFIG.retries,
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
