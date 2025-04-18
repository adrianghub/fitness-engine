import { COLLECTIONS } from "@/lib/firestore";
import { useAuth } from "@/useAuth";
import { useQuery } from "@tanstack/react-query";
import { challengeService } from "../ChallengeService";

/**
 * Hook to fetch regular challenges for the current user
 */
export function useUserChallenges() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: [COLLECTIONS.USER_CHALLENGES, userId, "regular-and-daily"],
    queryFn: () => {
      if (!userId) return [];
      return challengeService.getUserChallenges(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch universal challenges
 */
export function useUniversalChallenges() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: [COLLECTIONS.CHALLENGE_TEMPLATES, userId, "universal"],
    queryFn: () => {
      if (!userId) return [];
      return challengeService.getUserUniversalChallenges(userId);
    },
  });
}

/**
 * Hook to fetch completed challenges for the current user
 */
export function useCompletedChallenges() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: [COLLECTIONS.USER_CHALLENGES, userId, "completed"],
    queryFn: () => {
      if (!userId) return [];
      return challengeService.getCompletedChallenges(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch completed challenges for the current user
 */
export function useUncompletedChallenges() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: [COLLECTIONS.USER_CHALLENGES, userId, "uncompleted"],
    queryFn: () => {
      if (!userId) return [];
      return challengeService.getUncompletedChallenges(userId);
    },
    enabled: !!userId,
  });
}
