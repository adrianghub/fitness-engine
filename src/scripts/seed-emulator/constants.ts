import type { UserLevel } from "@/types/models";

export const TEST_USER = {
  email: "user1@example.com",
  password: "test123",
  role: "user",
  level: "beginner",
} as const;

export const ADMIN_USER = {
  email: "admin@example.com",
  password: "admin123",
  role: "admin",
  level: "advanced",
} as const;

export const TEST_USER_2 = {
  email: "user2@example.com",
  password: "test456",
  role: "user",
  level: "intermediate",
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
