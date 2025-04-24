import { useCallback, useEffect, useState } from "react";

interface UseLoadingMessagesOptions {
  messages: string[];
  intervalTime?: number;
  onComplete?: () => void;
}

export function useLoadingMessages({
  messages,
  intervalTime = 1000,
  onComplete,
}: UseLoadingMessagesOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setCurrentMessageIndex(0);
    setHasCompleted(false);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isLoading && !hasCompleted) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => {
          if (prev < messages.length - 1) {
            return prev + 1;
          }

          if (interval) {
            clearInterval(interval);
          }

          setHasCompleted(true);
          onComplete?.();
          return prev;
        });
      }, intervalTime);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, hasCompleted, messages.length, intervalTime, onComplete]);

  const resetLoading = useCallback(() => {
    setIsLoading(false);
    setCurrentMessageIndex(0);
    setHasCompleted(false);
  }, []);

  return {
    isLoading,
    currentMessageIndex,
    hasCompleted,
    startLoading,
    resetLoading,
  };
}
