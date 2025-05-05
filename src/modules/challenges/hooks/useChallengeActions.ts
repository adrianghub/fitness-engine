import { dateToTimestamp } from "@/lib/date-utils";
import { db } from "@/lib/firebase";
import { COLLECTIONS, FirestoreService } from "@/lib/firestore";
import { logger } from "@/lib/logger";
import {
  completeChallengeEndpoint,
  resignChallengeEndpoint,
} from "@/services/cloud-functions";
import type { UserChallenge } from "@/types/models";
import { useAuth } from "@/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useChallengeInvalidation } from "./useChallengeInvalidation";

export function useChallengeActions() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || "";
  const { invalidateAllChallengeQueries } = useChallengeInvalidation();

  const userChallengeService = new FirestoreService<UserChallenge>(
    COLLECTIONS.USER_CHALLENGES
  );

  const updateActiveChallengeStatus = async (
    isActive: boolean,
    challengeId?: string
  ) => {
    try {
      const userActiveRef = doc(db, "userChallenges", `${userId}_active`);
      await setDoc(userActiveRef, {
        hasActive: isActive,
        activeChallengeId: isActive ? challengeId : null,
        lastUpdated: dateToTimestamp(new Date()),
      });
      logger.info(
        "Challenge",
        `Active challenge status ${isActive ? "set" : "reset"} successfully`
      );
    } catch (error) {
      logger.error(
        "Challenge",
        `Error ${isActive ? "setting" : "resetting"} active challenge flag:`,
        error
      );
    }
  };

  const startChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      logger.info(
        "Challenge",
        `Starting challenge ${challengeId} for user ${userId}`
      );

      try {
        const now = new Date();
        logger.info(
          "Challenge",
          `Updating challenge ${challengeId} status to in-progress with timestamp ${now.toISOString()}`
        );

        const result = await userChallengeService.update(challengeId, {
          status: "in-progress",
          startedAt: dateToTimestamp(now),
        });

        logger.info(
          "Challenge",
          `Challenge ${challengeId} update result:`,
          result
        );
        return result;
      } catch (error) {
        logger.error(
          "Challenge",
          `Error in startChallenge mutation for ${challengeId}:`,
          error
        );
        throw error;
      }
    },
    onSuccess: (_, challengeId) => {
      logger.info("Challenge", `Challenge ${challengeId} started successfully`);

      updateActiveChallengeStatus(true, challengeId);

      invalidateAllChallengeQueries();

      const currentPath = window.location.pathname;
      if (!currentPath.includes(`/challenges/${challengeId}`)) {
        navigate({ to: "/challenges/$id", params: { id: challengeId } });
      }
    },
    onError: (error, challengeId) => {
      logger.error(
        "Challenge",
        `Failed to start challenge ${challengeId}:`,
        error
      );
    },
  });

  const completeChallenge = useMutation({
    mutationFn: async (params: {
      challengeId: string;
      skipRedirectToLeaderboard?: boolean;
    }) => {
      const challengeId = params.challengeId;
      const skipRedirectToLeaderboard =
        params.skipRedirectToLeaderboard ?? false;

      logger.info("Challenge", `Completing challenge ${challengeId}`);
      const { wasPromoted } = await completeChallengeEndpoint(challengeId);
      return { wasPromoted, challengeId, skipRedirectToLeaderboard };
    },
    onSuccess: (result) => {
      logger.info(
        "Challenge",
        `Challenge ${result.challengeId} completed successfully`
      );

      updateActiveChallengeStatus(false);

      toast.success("Challenge completed!", {
        description: result.wasPromoted
          ? "Congratulations! You've been promoted to the next level!"
          : "Keep up the good work!",
        duration: 4000,
      });

      invalidateAllChallengeQueries();

      if (!result.skipRedirectToLeaderboard) {
        navigate({ to: "/leaderboard" });
      }
    },
    onError: (error, params) => {
      const challengeId =
        typeof params === "string" ? params : params.challengeId;
      logger.error(
        "Challenge",
        `Failed to complete challenge ${challengeId}:`,
        error
      );

      toast.error("Failed to complete challenge", {
        description: "Please try again later.",
      });
    },
  });

  const resignChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      logger.info("Challenge", `Resigning from challenge ${challengeId}`);
      const result = await resignChallengeEndpoint(challengeId);
      return { success: true, canRetry: result.canRetry };
    },
    onSuccess: (result, challengeId) => {
      logger.info(
        "Challenge",
        `Successfully resigned from challenge ${challengeId}. Can retry: ${result.canRetry}`
      );

      updateActiveChallengeStatus(false);

      toast.info("Challenge abandoned", {
        description: result.canRetry
          ? "You can try this challenge again later."
          : "You've reached the maximum attempts for this challenge.",
        duration: 4000,
      });

      invalidateAllChallengeQueries();

      navigate({ to: "/dashboard" });
    },
    onError: (error, challengeId) => {
      logger.error(
        "Challenge",
        `Failed to resign from challenge ${challengeId}:`,
        error
      );

      toast.error("Failed to abandon challenge", {
        description: "Please try again later.",
      });
    },
  });

  const restartChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      logger.info("Challenge", `Restarting challenge ${challengeId}`);

      return userChallengeService.update(challengeId, {
        status: "in-progress",
        startedAt: dateToTimestamp(new Date()),
        finishedAt: null,
      });
    },
    onSuccess: (_, challengeId) => {
      logger.info(
        "Challenge",
        `Challenge ${challengeId} restarted successfully`
      );

      updateActiveChallengeStatus(true, challengeId);

      toast.success("Challenge restarted", {
        description: "Good luck on your next attempt!",
        duration: 3000,
      });

      invalidateAllChallengeQueries();
      navigate({ to: "/challenges/$id", params: { id: challengeId } });
    },
    onError: (error, challengeId) => {
      logger.error(
        "Challenge",
        `Failed to restart challenge ${challengeId}:`,
        error
      );

      toast.error("Failed to restart challenge", {
        description: "Please try again later.",
      });
    },
  });

  return {
    startChallenge,
    completeChallenge,
    resignChallenge,
    restartChallenge,
  };
}
