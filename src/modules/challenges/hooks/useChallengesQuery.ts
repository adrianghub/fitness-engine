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
    queryKey: [COLLECTIONS.USER_CHALLENGES, userId, "universal"],
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
 * Hook to fetch uncompleted challenges for the current user
 */
export function useUncompletedChallenges() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: [COLLECTIONS.USER_CHALLENGES, userId, "uncompleted"],
    queryFn: async () => {
      if (!userId) return [];
      try {
        const challenges =
          await challengeService.getUncompletedChallenges(userId);

        console.log(
          `Fetched ${challenges.length} uncompleted challenges:`,
          challenges
        );
        return challenges;
      } catch (error) {
        console.error("Error fetching uncompleted challenges:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}
