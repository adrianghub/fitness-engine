import { formatTime } from "@/lib/date-utils";
import { checkChallengeExpirationEndpoint } from "@/services/cloud-functions";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface ChallengeTimerOptions {
  challengeId: string;
  expectedTimeInMinutes: number;
  startedAt?: Date;
  userId?: string;
  onTimeExpired?: (canRetry: boolean) => void;
}

export function useChallengeTimer({
  challengeId,
  expectedTimeInMinutes,
  startedAt,
  userId,
  onTimeExpired,
}: ChallengeTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  // Calculate expectedTimeMs *inside* useEffect or memoize it if needed outside
  // For this hook structure, calculating inside useEffect is cleaner.

  useEffect(() => {
    // Don't set up timer if there's no valid challenge ID or start time
    if (!startedAt || !challengeId) {
      // Reset state if dependencies change and timer shouldn't run
      setTimeRemaining(null);
      setIsExpired(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Calculate expectedTimeMs based on the prop inside the effect
    const expectedTimeMs = expectedTimeInMinutes * 60 * 1000;
    const endTime = startedAt.getTime() + expectedTimeMs;

    // Clear any existing interval from previous runs of this effect
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const checkTimeRemaining = () => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        // Use functional updates to avoid potential stale state issues
        setTimeRemaining(0);
        setIsExpired(true);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        if (userId) {
          checkChallengeExpirationEndpoint(challengeId)
            .then(({ expired, canRetry }) => {
              if (expired) {
                queryClient.invalidateQueries({ queryKey: ["challenges"] });
                onTimeExpired?.(canRetry); // Pass canRetry status to the callback
              }
            })
            .catch((error) => {
              console.error("Error checking challenge expiration:", error);
            });
        }
      } else {
        // Use functional updates
        setTimeRemaining(remaining);
        setIsExpired(false); // Ensure isExpired is reset if time becomes positive again
      }
    };

    // Run initial check
    checkTimeRemaining();

    // Set up interval only if not already expired
    if (endTime > Date.now()) {
      intervalRef.current = setInterval(checkTimeRemaining, 1000);
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Re-check time immediately when tab becomes visible
        checkTimeRemaining();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    challengeId,
    startedAt,
    expectedTimeInMinutes,
    userId,
    queryClient,
    onTimeExpired,
  ]);

  // Calculate expectedTimeMs here for the return value calculation
  const expectedTimeMsForProgress = expectedTimeInMinutes * 60 * 1000;

  const formattedTimeRemaining =
    timeRemaining === null ? "--:--" : formatTime(timeRemaining);

  const progressPercentage =
    timeRemaining === null || expectedTimeMsForProgress <= 0
      ? 0
      : Math.max(
          0,
          Math.min(100, (timeRemaining / expectedTimeMsForProgress) * 100)
        );

  return {
    timeRemaining,
    formattedTimeRemaining,
    progressPercentage,
    isExpired,
  };
}
