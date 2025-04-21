import { parseTimeString, timestampToDate } from "@/lib/date-utils";
import { logger } from "@/lib/logger";
import { challengeService } from "@/modules/challenges/ChallengeService";
import { useChallengeActions } from "@/modules/challenges/hooks/useChallengeActions";
import { useChallengeTimer } from "@/modules/challenges/hooks/useChallengeTimer";
import { useQuote } from "@/modules/challenges/hooks/useQuote";
import { UserChallenge } from "@/types/models";
import { useAuth } from "@/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export function useChallengeDetails(
  challengeId: string,
  preloadedChallenge?: UserChallenge & { id: string }
) {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || "";
  const queryClient = useQueryClient();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<
    "complete" | "resign" | null
  >(null);
  const [hasTriggeredStart, setHasTriggeredStart] = useState(false);

  // Fetch motivational quote
  const { quote, isLoading: isLoadingQuote } = useQuote();

  // If we have a preloaded challenge, add it to the query cache
  useEffect(() => {
    if (preloadedChallenge) {
      queryClient.setQueryData(["challenge", challengeId], preloadedChallenge);
    }
  }, [preloadedChallenge, challengeId, queryClient]);

  // Fetch challenge data
  const { data: challenge, isLoading: isLoadingChallenge } = useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: async () => {
      return challengeService.getChallengeWithTemplate(challengeId, userId);
    },
    // Disable the initial fetch if we have preloaded data
    enabled: !preloadedChallenge && !!userId,
    // Keep the data fresh for 30 seconds
    staleTime: 30000,
  });

  const { startChallenge, completeChallenge, resignChallenge } =
    useChallengeActions();

  // Start the challenge if it's in "not-started" state
  useEffect(() => {
    if (challenge && challenge.status === "not-started" && !hasTriggeredStart) {
      setHasTriggeredStart(true);
      startChallenge.mutate(challenge.id);
    }
  }, [challenge, startChallenge, hasTriggeredStart]);

  // Extract expected time in minutes from the challenge
  const expectedTimeInMinutes = challenge?.challengeTemplate?.expectedTime
    ? parseTimeString(challenge.challengeTemplate.expectedTime)
    : 30; // Default to 30 minutes

  // Convert startedAt Timestamp to Date
  const startedAtDate = challenge?.startedAt
    ? timestampToDate(challenge.startedAt)
    : undefined;

  // Use the timer hook
  const { formattedTimeRemaining, progressPercentage, isExpired } =
    useChallengeTimer({
      challengeId,
      expectedTimeInMinutes,
      startedAt: startedAtDate,
      userId,
      onTimeExpired: useCallback(
        (canRetry: boolean) => {
          logger.info(
            "Challenge",
            `Time expired for challenge. Can retry: ${canRetry}`
          );
          queryClient.invalidateQueries({
            queryKey: ["challenge", challengeId],
          });
        },
        [challengeId, queryClient]
      ),
    });

  // Calculate if challenge is actually expired based on start time and expected time
  const now = new Date();
  const startedTime = startedAtDate || now;
  const endTime = new Date(
    startedTime.getTime() + expectedTimeInMinutes * 60 * 1000
  );
  const isActuallyExpired = challenge
    ? now > endTime && challenge.status === "in-progress"
    : false;

  // Handle confirmation
  const handleComplete = () => {
    setConfirmationType("complete");
    setShowConfirmation(true);
  };

  const handleResign = () => {
    setConfirmationType("resign");
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (confirmationType === "complete" && challenge?.id) {
      completeChallenge.mutate({
        challengeId: challenge.id,
      });
    } else if (confirmationType === "resign" && challenge?.id) {
      resignChallenge.mutate(challenge.id);
    }
    setShowConfirmation(false);
    setConfirmationType(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirmation(false);
    setConfirmationType(null);
  };

  return {
    challenge,
    isLoadingChallenge,
    quote,
    isLoadingQuote,
    showConfirmation,
    confirmationType,
    isActuallyExpired,
    isExpired,
    formattedTimeRemaining,
    progressPercentage,
    handleComplete,
    handleResign,
    handleConfirm,
    handleCancelConfirm,
    startChallenge,
  };
}
