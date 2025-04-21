import { db } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import { useAuth } from "@/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Hook that uses Firestore real-time listeners instead of polling
 * to monitor active challenges. This provides more efficient and
 * immediate updates compared to polling-based approaches.
 *
 * @returns Object containing active challenge status
 */
export function useChallengeSyncFirestore() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const queryClient = useQueryClient();
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't set up listeners if no user is logged in
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Set up Firestore listener for active challenges
    const userDoc = doc(db, "users", userId);

    // Subscribe to user document changes
    const unsubscribeUser = onSnapshot(
      userDoc,
      (userSnap) => {
        if (userSnap.exists()) {
          logger.info("Challenge Sync", "User document updated");

          // Invalidate challenges query to update UI
          queryClient.invalidateQueries({ queryKey: ["challenges"] });
        }
      },
      (error) => {
        logger.error(
          "Challenge Sync",
          "Error listening to user document:",
          error
        );
      }
    );

    // Listen for active challenges
    const challengesQuery = doc(db, "userChallenges", `${userId}_active`);

    const unsubscribeChallenges = onSnapshot(
      challengesQuery,
      (snapshot) => {
        setIsLoading(false);

        if (snapshot.exists()) {
          const data = snapshot.data();
          logger.info(
            "Challenge Sync",
            "Active challenge document data:",
            data
          );
          setHasActiveChallenge(!!data.hasActive);

          // If active challenge exists, invalidate the specific challenge
          if (data.hasActive && data.activeChallengeId) {
            logger.info(
              "Challenge Sync",
              `Active challenge ID: ${data.activeChallengeId}`
            );
            queryClient.invalidateQueries({
              queryKey: ["challenge", data.activeChallengeId],
            });
          }
        } else {
          // If the document doesn't exist, create it with default values
          logger.info(
            "Challenge Sync",
            "Active challenge document doesn't exist, creating it"
          );
          setHasActiveChallenge(false);

          const checkInProgressChallenges = async () => {
            try {
              const challengesCollection = collection(db, "userChallenges");
              const q = query(
                challengesCollection,
                where("userId", "==", userId),
                where("status", "==", "in-progress")
              );

              const querySnapshot = await getDocs(q);
              const inProgressChallenges = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              logger.info(
                "Challenge Sync",
                `Found ${inProgressChallenges.length} in-progress challenges`
              );

              if (inProgressChallenges.length > 0) {
                const inProgressChallenge = inProgressChallenges[0];
                setDoc(challengesQuery, {
                  hasActive: true,
                  activeChallengeId: inProgressChallenge.id,
                  lastUpdated: serverTimestamp(),
                }).catch((error) => {
                  logger.error(
                    "Challenge Sync",
                    "Error creating active challenge document:",
                    error
                  );
                });

                setHasActiveChallenge(true);
              } else {
                setDoc(challengesQuery, {
                  hasActive: false,
                  activeChallengeId: null,
                  lastUpdated: serverTimestamp(),
                }).catch((error) => {
                  logger.error(
                    "Challenge Sync",
                    "Error creating empty active challenge document:",
                    error
                  );
                });
              }
            } catch (error) {
              logger.error(
                "Challenge Sync",
                "Error checking for in-progress challenges:",
                error
              );
            }
          };

          checkInProgressChallenges();
        }
      },
      (error) => {
        setIsLoading(false);
        logger.error(
          "Challenge Sync",
          "Error listening to active challenges:",
          error
        );
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeChallenges();
    };
  }, [userId, queryClient]);

  return {
    hasActiveChallenge,
    isLoading,
  };
}
