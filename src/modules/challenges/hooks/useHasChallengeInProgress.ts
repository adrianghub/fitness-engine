import { useUserChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { useEffect, useState } from "react";

export function useHasChallengeInProgress() {
  const { data: challenges = [] } = useUserChallenges();
  const [hasInProgressChallenge, setHasInProgressChallenge] = useState(false);

  useEffect(() => {
    const inProgressChallenge = challenges.find(
      (challenge) => challenge.status === "in-progress"
    );
    setHasInProgressChallenge(!!inProgressChallenge);
  }, [challenges]);

  return { hasInProgressChallenge };
}
