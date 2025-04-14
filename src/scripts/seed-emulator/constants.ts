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

export const COLLECTIONS = [
  "users",
  "challengeTemplates",
  "userChallenges",
  "opponents",
  "leaderboard",
];
