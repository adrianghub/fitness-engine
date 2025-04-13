import type { UserLevel } from "@/types/models";

export const BEGINNER_USER = {
  email: "beginner@example.com",
  password: "beginner123",
  level: "beginner",
} as const;

export const INTERMEDIATE_USER = {
  email: "intermediate@example.com",
  password: "intermediate123",
  level: "intermediate",
} as const;

export const UBER_DUPER_USER = {
  email: "uber-duper@example.com",
  password: "uber-duper123",
  level: "advanced",
} as const;

export const USER_LEVELS = ["beginner", "intermediate", "advanced"] as const;

// Point ranges for different levels to ensure opponents have appropriate scores
export const LEVEL_POINT_RANGES: Record<
  UserLevel,
  { min: number; max: number }
> = {
  beginner: { min: 1000, max: 15000 },
  intermediate: { min: 16000, max: 30000 },
  advanced: { min: 31000, max: 100000 },
};

// Base points for each level
export const LEVEL_BASE_POINTS: Record<UserLevel, number> = {
  beginner: 50,
  intermediate: 150,
  advanced: 300,
};

export const COLLECTIONS = [
  "users",
  "challengeTemplates",
  "userChallenges",
  "opponents",
  "leaderboard",
];
