import type { ChallengeLevel, ChallengeTemplate } from "../types/models";

export const CHALLENGE_CONFIG = {
  retries: 3,
};

/**
 * Point values for different types of challenges at each level
 */
export const CHALLENGE_POINTS: Record<
  ChallengeLevel,
  {
    daily: number;
    regular: number;
    universal: number;
  }
> = {
  beginner: {
    daily: 100,
    regular: 50,
    universal: 15,
  },
  intermediate: {
    daily: 200,
    regular: 100,
    universal: 30,
  },
  advanced: {
    daily: 300,
    regular: 150,
    universal: 45,
  },
};

/**
 * Shuffles and selects challenge templates based on user level
 * @param challengeIds Array of all challenge template IDs
 * @param count Number of challenges to select
 * @returns Array of selected challenge IDs
 */
export function selectRandomChallenges(
  challengeIds: string[],
  count: number
): string[] {
  const shuffled = [...challengeIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Filters out recently completed challenges to avoid repetition
 * @param allChallenges Array of all available challenges
 * @param previousChallengeIds Array of recently completed challenge IDs
 * @returns Filtered array of challenge IDs
 */
export function filterRecentChallenges(
  allChallenges: string[],
  previousChallengeIds: string[]
): string[] {
  return allChallenges.filter((id) => !previousChallengeIds.includes(id));
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array Array to shuffle
 * @returns New shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Selects regular challenges for a user based on available templates and AI recommendations
 * @param availableChallenges Array of all available regular challenges
 * @param recommendedChallenges Array of recommended challenge IDs from AI
 * @param userLevel User's current level
 * @returns Object containing selected daily and regular challenges
 */
export function selectRegularChallenges(
  availableChallenges: (ChallengeTemplate & { id: string })[],
  recommendedChallenges: string[],
  userLevel: ChallengeLevel
) {
  // Filter challenges by user level
  const levelSpecificChallenges = availableChallenges.filter(
    (c) => c.level === userLevel
  );

  // Select daily challenge from regular challenges
  const dailyChallenge =
    levelSpecificChallenges[
      Math.floor(Math.random() * levelSpecificChallenges.length)
    ];

  // Select regular challenges (4 challenges)
  let regularChallenges: (ChallengeTemplate & { id: string })[] = [];

  if (recommendedChallenges.length > 0) {
    // Use AI recommendations for regular challenges
    regularChallenges = levelSpecificChallenges
      .filter(
        (c) =>
          recommendedChallenges.includes(c.id) && c.id !== dailyChallenge?.id
      )
      .slice(0, 4);

    // If we don't have enough recommended challenges, fill with random ones
    if (regularChallenges.length < 4) {
      const remainingNeeded = 4 - regularChallenges.length;
      const unusedChallenges = levelSpecificChallenges.filter(
        (c) =>
          !recommendedChallenges.includes(c.id) && c.id !== dailyChallenge?.id
      );
      regularChallenges = [
        ...regularChallenges,
        ...shuffleArray(unusedChallenges).slice(0, remainingNeeded),
      ];
    }
  } else {
    // Random selection if no AI recommendations
    regularChallenges = shuffleArray(
      levelSpecificChallenges.filter((c) => c.id !== dailyChallenge?.id)
    ).slice(0, 4);
  }

  return {
    dailyChallenge,
    regularChallenges,
  };
}
