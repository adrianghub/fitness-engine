import { COLLECTIONS } from "@/lib/firestore";
import { completeChallenge } from "@/services/api";
import { useAuth } from "@/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCompleteChallenge() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useMutation({
    mutationFn: (challengeId: string) => completeChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS.USER_CHALLENGES, userId],
      });
    },
  });
}
