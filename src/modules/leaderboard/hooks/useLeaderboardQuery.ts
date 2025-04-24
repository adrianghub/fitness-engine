import { COLLECTIONS } from "@/lib/firestore";
import { useAuth } from "@/useAuth";
import { useQuery } from "@tanstack/react-query";
import { leaderboardService } from "../LeaderboardService";

/**
 * Hook to fetch leaderboard entries for the current user's context
 */
export function useLeaderboardQuery() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: [COLLECTIONS.LEADERBOARD, userId],
    queryFn: async () => {
      if (!userId) return [];
      return leaderboardService.getLeaderboard(userId);
    },
    enabled: !!userId,
  });
}
