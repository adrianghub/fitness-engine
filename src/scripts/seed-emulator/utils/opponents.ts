import type { UserLevel } from "../../../types/models";
import { LEVEL_POINT_RANGES } from "../constants";
import { FIRST_NAMES, LAST_NAMES, USERNAME_PREFIXES } from "../data/opponents";

/**
 * Generates a random username for an opponent using predefined name parts
 * @returns A randomly generated username
 */
export function generateRandomUsername(): string {
  const firstName =
    FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)].toLowerCase();
  const lastName =
    LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)].toLowerCase();
  const prefix =
    USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];

  const patterns = [
    () =>
      `${prefix}_${firstName}_${lastName}_${Math.floor(Math.random() * 1000)}`,
    () => `${firstName}_${lastName}_${Math.floor(Math.random() * 1000)}`,
    () => `${prefix}_${firstName}_${Math.floor(Math.random() * 1000)}`,
    () => `${firstName}_${lastName}_${Math.floor(Math.random() * 1000)}`,
    () => `${prefix}_${firstName}_${Math.floor(Math.random() * 1000)}`,
  ];

  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern();
}

/**
 * Calculates initial points for an opponent based on user level
 * @param level The level to calculate points for
 * @returns The calculated points
 */
export function calculateOpponentPoints(level: UserLevel): number {
  const pointRange = LEVEL_POINT_RANGES[level];
  const distribution = Math.random();

  if (distribution < 0.7) {
    // 70% of opponents are within middle range
    return Math.floor(
      pointRange.min +
        (pointRange.max - pointRange.min) * 0.3 +
        (pointRange.max - pointRange.min) * 0.4 * Math.random()
    );
  } else if (distribution < 0.9) {
    // 20% of opponents are in the lower range
    return Math.floor(
      pointRange.min + (pointRange.max - pointRange.min) * 0.3 * Math.random()
    );
  } else {
    // 10% of opponents are in the upper range
    return Math.floor(
      pointRange.min +
        (pointRange.max - pointRange.min) * 0.7 +
        (pointRange.max - pointRange.min) * 0.3 * Math.random()
    );
  }
}

/**
 * Calculates a point change for an opponent to simulate activity
 * @param currentPoints The current points of the opponent
 * @param level The level of the opponent
 * @returns The new points value
 */
export function calculatePointChange(
  currentPoints: number,
  level: UserLevel
): number {
  let pointsChange: number;
  switch (level) {
    case "beginner":
      // Small change for beginners (1-5% of current points)
      pointsChange = Math.floor(currentPoints * (0.01 + Math.random() * 0.04));
      break;
    case "intermediate":
      // Medium change for intermediate (3-8% of current points)
      pointsChange = Math.floor(currentPoints * (0.03 + Math.random() * 0.05));
      break;
    case "advanced":
      // Larger change for advanced (5-12% of current points)
      pointsChange = Math.floor(currentPoints * (0.05 + Math.random() * 0.07));
      break;
    default:
      pointsChange = Math.floor(currentPoints * 0.03);
  }

  // Randomly decide if points increase or decrease (70% chance to increase)
  const isIncrease = Math.random() < 0.7;
  const newPoints = isIncrease
    ? currentPoints + pointsChange
    : Math.max(currentPoints - pointsChange, 0); // Ensure points don't go below 0

  // Ensure points stay within the level's range
  const pointRange = LEVEL_POINT_RANGES[level];
  return Math.min(Math.max(newPoints, pointRange.min), pointRange.max);
}
