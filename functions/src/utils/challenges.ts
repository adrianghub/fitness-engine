import type { ChallengeLevel } from "../types/models";

/**
 * Generates timestamps for challenge completion history
 * @param now Current timestamp
 * @returns Object containing various timestamps for challenge history
 */
export function generateChallengeTimestamps(now: Date) {
  return {
    oneWeekAgo: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    twoWeeksAgo: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
  };
}

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
 * Separates universal and level-specific challenges
 * @param challenges Array of challenge objects with level property
 * @returns Object containing separated universal and level-specific challenges
 */
export function separateChallengesByLevel<T extends { level: ChallengeLevel }>(
  challenges: T[]
): { universal: T[]; levelSpecific: T[] } {
  return {
    universal: challenges.filter((c) => c.level === "all"),
    levelSpecific: challenges.filter((c) => c.level !== "all"),
  };
}
