import { COLLECTIONS } from "@/lib/firestore";
import { useAuth } from "@/useAuth";
import { useQuery } from "@tanstack/react-query";
import { challengeService } from "../ChallengeService";

/**
 * Hook to fetch daily challenge for the current user
 */
export function useDailyChallenge() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: [COLLECTIONS.USER_CHALLENGES, userId, "daily"],
    queryFn: () => {
      if (!userId) return null;
      return challengeService.getDailyChallengeForUser(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch regular challenges for the current user
 */
export function useUserChallenges() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: [COLLECTIONS.USER_CHALLENGES, userId, "regular"],
    queryFn: () => {
      if (!userId) return [];
      return challengeService.getUserChallenges(userId);
    },
    enabled: !!userId,
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
 * Hook to fetch universal challenges
 */
export function useUniversalChallenges() {
  return useQuery({
    queryKey: [COLLECTIONS.UNIVERSAL_CHALLENGES],
    queryFn: () => challengeService.getUniversalChallenges(),
  });
}
