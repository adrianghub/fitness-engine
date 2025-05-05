import { FIRST_NAMES, LAST_NAMES, USERNAME_PREFIXES } from "../data/opponents";
import type { UserLevel } from "../types/models";

// Point ranges for different levels to ensure opponents have appropriate scores
export const LEVEL_POINT_RANGES: Record<
  UserLevel,
  { min: number; max: number; userMax: number; dailyMax: number }
> = {
  beginner: { min: 0, max: 3800, userMax: 4000, dailyMax: 360 },
  intermediate: { min: 1500, max: 7800, userMax: 8000, dailyMax: 720 },
  advanced: { min: 2500, max: 14800, userMax: 15000, dailyMax: 1080 },
};

// Base points for each level - starting points when entering a new level
export const LEVEL_BASE_POINTS: Record<UserLevel, number> = {
  beginner: 0,
  intermediate: 4000,
  advanced: 8000,
};

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
    () => `${firstName}_${lastName}_${Math.floor(Math.random() * 100)}`,
    () => `${firstName}_${lastName}_${Math.floor(Math.random() * 100)}`,
    () => `${prefix}_${firstName}_${Math.floor(Math.random() * 100)}`,
    () => `${prefix}_${lastName}_${Math.floor(Math.random() * 100)}`,
  ];

  return patterns[Math.floor(Math.random() * patterns.length)]();
}

/**
 * Calculates initial points for an opponent based on user level
 * Uses a more balanced distribution to create engaging competition
 * Points are distributed based on expected daily progress
 * @param level The level to calculate points for
 * @returns The calculated points
 */
export function calculateOpponentPoints(level: UserLevel): number {
  const pointRange = LEVEL_POINT_RANGES[level];
  const availableRange = pointRange.max - pointRange.min;
  const distribution = Math.random();

  let points: number;

  if (distribution < 0.35) {
    // 35% of opponents in the lower range (1-4 days worth)
    points = pointRange.min + availableRange * 0.4 * Math.random();
  } else if (distribution < 0.75) {
    // 40% of opponents in the middle range (4-7 days worth)
    points =
      pointRange.min +
      availableRange * 0.4 +
      availableRange * 0.3 * Math.random();
  } else if (distribution < 0.95) {
    // 20% of opponents in upper-middle range (7-9 days worth)
    points =
      pointRange.min +
      availableRange * 0.7 +
      availableRange * 0.2 * Math.random();
  } else {
    // 5% of opponents near the top (9-10 days worth)
    points =
      pointRange.min +
      availableRange * 0.9 +
      availableRange * 0.1 * Math.random();
  }

  // Ensure points stay within the defined range
  return Math.min(Math.max(Math.floor(points), pointRange.min), pointRange.max);
}

/**
 * Calculates a point change for an opponent to simulate activity
 * Uses a more balanced approach to maintain engagement
 * Changes are based on daily achievable points
 * @param currentPoints The current points of the opponent
 * @param level The level of the opponent
 * @returns The new points value
 */
export function calculatePointChange(
  currentPoints: number,
  level: UserLevel
): number {
  const pointRange = LEVEL_POINT_RANGES[level];
  const dailyMax = pointRange.dailyMax;

  // Calculate maximum allowed change based on current position
  const positionInRange =
    (currentPoints - pointRange.min) / (pointRange.max - pointRange.min);
  let maxChangePercent: number;

  if (positionInRange < 0.3) {
    // Bottom third can gain up to 3 days worth of points
    maxChangePercent = (dailyMax * 3) / currentPoints;
  } else if (positionInRange < 0.7) {
    // Middle range can gain up to 2 days worth of points
    maxChangePercent = (dailyMax * 2) / currentPoints;
  } else {
    // Top range can gain up to 1 day worth of points
    maxChangePercent = dailyMax / currentPoints;
  }

  const pointsChange = Math.floor(
    currentPoints * (maxChangePercent * Math.random())
  );

  // 65% chance to increase for steady progression while maintaining challenge
  const isIncrease = Math.random() < 0.65;

  const newPoints = isIncrease
    ? currentPoints + pointsChange
    : Math.max(currentPoints - pointsChange, pointRange.min);

  // Ensure points stay within the level's range and below user maximum
  return Math.min(Math.max(newPoints, pointRange.min), pointRange.max);
}
