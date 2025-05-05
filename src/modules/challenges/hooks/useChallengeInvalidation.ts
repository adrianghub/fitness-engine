import { COLLECTIONS } from "@/lib/firestore";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Provides a function to invalidate all common challenge and leaderboard related queries.
 */
export function useChallengeInvalidation() {
  const queryClient = useQueryClient();

  const invalidateAllChallengeQueries = () => {
    console.log("Invalidating all challenge and leaderboard queries...");
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
    queryClient.invalidateQueries({ queryKey: ["challenge"] });
    // Ensure COLLECTIONS.USER_CHALLENGES resolves correctly or use the string literal
    queryClient.invalidateQueries({ queryKey: [COLLECTIONS.USER_CHALLENGES] });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] }); // Added userProfile invalidation as it might change with promotions
    queryClient.invalidateQueries({ queryKey: ["user"] }); // Added user general data invalidation
  };

  return { invalidateAllChallengeQueries };
}
