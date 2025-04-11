// User credentials
export const TEST_USER = {
  email: "user1@example.com",
  password: "test123",
  role: "user",
  level: "beginner",
};

export const ADMIN_USER = {
  email: "admin@example.com",
  password: "admin123",
  role: "admin",
  level: "advanced",
};

// Test user 2
export const TEST_USER_2 = {
  email: "user2@example.com",
  password: "test456",
  role: "user",
  level: "intermediate",
};

// Constants for opponent generation
export const USERNAME_PREFIXES = [
  "user",
  "player",
  "gamer",
  "fitness",
  "athlete",
  "runner",
  "lifter",
  "trainer",
  "coach",
  "hero",
  "champion",
  "warrior",
  "ninja",
  "titan",
  "beast",
  "pro",
];

export const LEVELS = ["beginner", "intermediate", "advanced"];

export const levelToPointsMap: Record<string, number> = {
  beginner: 50,
  intermediate: 150,
  advanced: 300,
};

// Collection names
export const COLLECTIONS = [
  "users",
  "challengeTemplates",
  "userChallenges",
  "opponents",
  "leaderboard",
];
