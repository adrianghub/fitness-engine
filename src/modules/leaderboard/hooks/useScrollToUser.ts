import { RefObject, useCallback, useEffect, useState } from "react";

interface UseScrollToUserProps<T extends HTMLElement = HTMLDivElement> {
  isLoading: boolean;
  hasEntries: boolean;
  userEntryRef: RefObject<T>;
}

/**
 * Custom hook to handle scrolling to user's position in leaderboard
 * and controlling the animation visibility
 */
export function useScrollToUser<T extends HTMLElement = HTMLDivElement>({
  isLoading,
  hasEntries,
  userEntryRef,
}: UseScrollToUserProps<T>) {
  const [userInView, setUserInView] = useState(false);

  useEffect(() => {
    if (!isLoading && hasEntries && userEntryRef.current) {
      const timer = setTimeout(() => {
        if (userEntryRef.current) {
          const scrollOptions: ScrollIntoViewOptions = {
            behavior: "smooth",
            block: "center",
          };

          userEntryRef.current.scrollIntoView(scrollOptions);
          setUserInView(true);
        }
        // Use a small delay to ensure the DOM has rendered
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isLoading, hasEntries, userEntryRef]);

  const resetView = useCallback(() => {
    setUserInView(false);
  }, []);

  return { userInView, resetView };
}
