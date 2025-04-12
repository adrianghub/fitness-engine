import type { ChallengeLevel } from "../../../types/models";

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
 * Calculates points awarded for completing a challenge
 * @param level The level of the challenge
 * @returns Number of points awarded
 */
export function calculateChallengePoints(level: ChallengeLevel): number {
  const basePoints = {
    beginner: 50,
    intermediate: 100,
    advanced: 150,
    all: 80,
  };

  // Default to 'all' if level is undefined or invalid
  const safeLevel = level && level in basePoints ? level : "all";
  const base = basePoints[safeLevel];

  // Add some randomness (±50% of base points)
  const variation = Math.floor(base * (Math.random() - 0.5));
  return Math.max(base + variation, 1); // Ensure at least 1 point
}
