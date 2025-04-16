import * as admin from "firebase-admin";
import { QuerySnapshot, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { ADJACENT_LEVELS } from "../data/adjacent-levels";
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
          // SECTION 1: All reads first
          // 1. Get incomplete challenges from yesterday
          const incompleteChallengesSnapshot = await transaction.get(
            db
              .collection(COLLECTIONS.userChallenges)
              .where("userId", "==", userId)
              .where("status", "in", ["not-started", "in-progress"])
              .where("assignedDate", "<", now)
          );

          // 2. Get old challenges to delete
          const oldChallengesSnapshot = await transaction.get(
            db
              .collection(COLLECTIONS.userChallenges)
              .where("userId", "==", userId)
              .where("type", "in", ["regular", "daily"])
              .where("assignedDate", "<", now)
          );

          // 3. Get today's regular challenges
          const todaysChallengesSnapshot = await transaction.get(
            db
              .collection(COLLECTIONS.userChallenges)
              .where("userId", "==", userId)
              .where("type", "==", "regular")
              .where("assignedDate", ">=", yesterday)
          );

          // 4. Get available regular challenges for the user's level and adjacent levels
          const allowedLevels = ADJACENT_LEVELS[userData.level];
          const levelChallengesSnapshot = await transaction.get(
            db
              .collection(COLLECTIONS.challengeTemplates)
              .where("level", "in", allowedLevels)
          );

          // SECTION 2: Process data from reads
          // Calculate penalties
          let penaltyPoints = 0;
          incompleteChallengesSnapshot.forEach((doc) => {
            const challenge = doc.data() as UserChallenge;
            penaltyPoints += challenge.points;
          });

          // Get recent challenge IDs
          todaysChallengesSnapshot.forEach((doc) => {
            const challenge = doc.data() as UserChallenge;
            recentChallengeIds.push(challenge.challengeId);
          });

          // Process available challenges
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

          // Select new challenges
          const { dailyChallenge, regularChallenges } = selectRegularChallenges(
            availableRegularChallenges,
            recommendedChallenges || [],
            userData.level
          );

          // SECTION 3: All writes after processing
          // Apply penalties if any, ensuring points don't go below 0
          if (penaltyPoints > 0) {
            const currentPoints = userData.points || 0;
            const finalPenalty = Math.min(penaltyPoints, currentPoints);

            if (finalPenalty > 0) {
              transaction.update(userDoc.ref, {
                points: Math.max(0, currentPoints - finalPenalty),
              });
              logger.info(
                `Applied penalty of ${finalPenalty} points to user ${userId} (original penalty: ${penaltyPoints})`
              );
            }
          }

          // Delete old challenges
          oldChallengesSnapshot.forEach((doc) => {
            transaction.delete(doc.ref);
          });

          // Add daily challenge
          if (dailyChallenge) {
            const challengeRef = db
              .collection(COLLECTIONS.userChallenges)
              .doc();
            transaction.set(challengeRef, {
              userId,
              challengeId: dailyChallenge.id,
              status: "not-started",
              assignedDate: now,
              points: CHALLENGE_POINTS[userData.level].daily,
              type: "daily" as ChallengeType,
            });
          }

          // Add regular challenges
          for (const challenge of regularChallenges) {
            const challengeRef = db
              .collection(COLLECTIONS.userChallenges)
              .doc();
            transaction.set(challengeRef, {
              userId,
              challengeId: challenge.id,
              status: "not-started",
              assignedDate: now,
              points: CHALLENGE_POINTS[userData.level].regular,
              type: "regular" as ChallengeType,
            });
          }

          logger.info(
            `Generated challenges for user ${userId}: 1 daily + ${regularChallenges.length} regular${recommendedChallenges ? " (AI recommended)" : ""}`
          );
        });

        logger.info(`Successfully refreshed challenges for user ${userId}`);
      } catch (error) {
        logger.error(`Error processing user ${userId}:`, error);
        // Continue with next user even if one fails
        continue;
      }
    }

    logger.info("Successfully completed daily challenge refresh");
  } catch (error) {
    logger.error("Error in refreshUserChallenges:", error);
    throw error;
  }
}
