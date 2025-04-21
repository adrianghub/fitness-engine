import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { parseTimeString } from "@/lib/date-utils";
import { useUserChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { useChallengeSyncFirestore } from "@/modules/challenges/hooks/useChallengeSyncFirestore";
import { useChallengeTimer } from "@/modules/challenges/hooks/useChallengeTimer";
import { useAuth } from "@/useAuth";
import { ArrowRight, Clock } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";

export function FloatingChallengeTimer() {
  // All hooks must be called at the top level
  const { data: challenges = [] } = useUserChallenges();
  const { hasActiveChallenge, isLoading } = useChallengeSyncFirestore();
  const { currentUser } = useAuth();

  useEffect(() => {
    const inProgressChallenge = challenges.find(
      (challenge) => challenge.status === "in-progress"
    );
    console.log("FloatingTimer - inProgressChallenge:", inProgressChallenge);
  }, [challenges, hasActiveChallenge, isLoading]);

  // Check if we're on a challenge details page by examining URL directly (no router dependency)
  const isChallengeDetailsPage =
    window.location.pathname.startsWith("/challenges/");

  // Force active state for testing if challenge is in progress
  const hasActiveInProgressChallenge = challenges.some(
    (challenge) => challenge.status === "in-progress"
  );

  // Handle continue button click
  const handleContinueClick = useCallback((challengeId: string) => {
    // Navigate using window.location instead of router
    window.location.href = `/challenges/${challengeId}`;
  }, []);

  // Use useMemo for derived state to avoid recalculations on re-renders
  const timerProps = useMemo(() => {
    // Find an in-progress challenge, if any
    const inProgressChallenge = challenges.find(
      (challenge) => challenge.status === "in-progress"
    );

    if (!inProgressChallenge) return null;

    // Extract data for the timer
    let startedAtDate: Date | undefined = undefined;

    if (inProgressChallenge.startedAt) {
      try {
        // Try different methods to convert to Date
        const timestamp = inProgressChallenge.startedAt;

        if (typeof timestamp.toDate === "function") {
          // Firebase Timestamp object
          startedAtDate = timestamp.toDate();
        } else if (
          timestamp.seconds !== undefined &&
          timestamp.nanoseconds !== undefined
        ) {
          // Firestore timestamp object
          startedAtDate = new Date(
            timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
          );
        } else if (timestamp instanceof Date) {
          // Already a Date
          startedAtDate = timestamp;
        } else {
          // Try to convert from string/number
          startedAtDate = new Date(timestamp as unknown as string | number);
        }
      } catch (error) {
        console.error("Error converting timestamp:", error);
        // Default to current time if conversion fails
        startedAtDate = new Date();
      }
    }

    if (!startedAtDate) return null;

    const expectedTimeInMinutes = inProgressChallenge.challengeTemplate
      ?.expectedTime
      ? parseTimeString(inProgressChallenge.challengeTemplate.expectedTime)
      : 30;

    return {
      challengeId: inProgressChallenge.id,
      expectedTimeInMinutes,
      startedAt: startedAtDate,
      title: inProgressChallenge.challengeTemplate?.title,
    };
  }, [challenges]);

  // Use server timer hook with conditionally-set but always-defined values
  const { formattedTimeRemaining, progressPercentage } = useChallengeTimer({
    challengeId: timerProps?.challengeId || "",
    expectedTimeInMinutes: timerProps?.expectedTimeInMinutes || 30,
    startedAt: timerProps?.startedAt,
    userId: currentUser?.uid,
  });

  // Don't render if we're on the challenge details page or if there's no active challenge
  if (isChallengeDetailsPage || !timerProps) return null;

  // Actually check if we should show the timer - either from Firestore sync OR from local state
  const shouldShowTimer = hasActiveChallenge || hasActiveInProgressChallenge;

  // Exit early if we shouldn't show the timer
  if (!shouldShowTimer) {
    console.log("Not showing timer:", {
      hasActiveChallenge,
      hasActiveInProgressChallenge,
    });
    return null;
  }

  const remainingPercentage = Math.max(0, Math.min(100, progressPercentage));

  const containerClass = `fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-all duration-300 w-64 max-w-full`;

  return (
    <div className={containerClass}>
      <div className='p-4 border-inherit'>
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center gap-2 font-medium text-sm'>
            <Clock className='h-4 w-4 text-primary' />
            <span>{formattedTimeRemaining}</span>
          </div>
        </div>
        <div className='text-sm mb-2 font-medium truncate'>
          {timerProps.title}
        </div>
        <Progress
          value={remainingPercentage}
          className='h-1.5 mb-3'
          aria-label='Challenge progress'
        />

        <Button
          size='sm'
          className='w-full gap-2'
          onClick={() => handleContinueClick(timerProps.challengeId)}
        >
          Continue
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
