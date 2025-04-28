import { http, HttpResponse } from "msw";

// Sample data
const sampleUser = {
  uid: "test-user-id",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: "https://example.com/profile.jpg",
};

const sampleUserProfile = {
  displayName: "Test User",
  isProfileComplete: true,
  fitnessLevel: "intermediate",
  equipment: ["dumbbells", "resistance-bands"],
  goals: ["strength", "endurance"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sampleChallenges = [
  {
    id: "daily-challenge-1",
    title: "20 Push-ups",
    description: "Complete 20 push-ups in proper form",
    points: 50,
    expectedTime: 300, // 5 minutes in seconds
    type: "daily",
    status: "not-started",
    difficulty: "intermediate",
    createdAt: new Date().toISOString(),
  },
  {
    id: "regular-challenge-1",
    title: "30 Squats",
    description: "Complete 30 squats with proper form",
    points: 40,
    expectedTime: 180, // 3 minutes in seconds
    type: "regular",
    status: "not-started",
    difficulty: "intermediate",
    createdAt: new Date().toISOString(),
  },
  {
    id: "universal-challenge-1",
    title: "Drink 2L of Water",
    description: "Drink at least 2 liters of water today",
    points: 20,
    type: "universal",
    status: "not-started",
    difficulty: "beginner",
    createdAt: new Date().toISOString(),
  },
];

const sampleLeaderboard = [
  {
    id: "test-user-id",
    displayName: "Test User",
    points: 300,
    rank: 1,
    photoURL: "https://example.com/profile.jpg",
    isUser: true,
  },
  {
    id: "opponent-1",
    displayName: "Virtual Athlete 1",
    points: 280,
    rank: 2,
    isUser: false,
  },
  {
    id: "opponent-2",
    displayName: "Virtual Athlete 2",
    points: 250,
    rank: 3,
    isUser: false,
  },
];

// Typy dla Firestore
type FirestoreField =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { arrayValue: { values: { stringValue: string }[] } }
  | { timestampValue: string };

type FirestoreFields = Record<string, FirestoreField>;

// HTTP handlers for Firebase endpoints
export const firebaseHandlers = [
  // Auth handlers
  http.post(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp*",
    () => {
      return HttpResponse.json({
        localId: sampleUser.uid,
        email: sampleUser.email,
        displayName: sampleUser.displayName,
        photoUrl: sampleUser.photoURL,
        idToken: "fake-id-token",
        refreshToken: "fake-refresh-token",
        expiresIn: "3600",
      });
    }
  ),

  // Firestore user profile handlers
  http.get("*/databases/*/documents/users/:userId", ({ params }) => {
    return HttpResponse.json({
      fields: {
        displayName: { stringValue: sampleUserProfile.displayName },
        isProfileComplete: {
          booleanValue: sampleUserProfile.isProfileComplete,
        },
        fitnessLevel: { stringValue: sampleUserProfile.fitnessLevel },
        equipment: {
          arrayValue: {
            values: sampleUserProfile.equipment.map((e) => ({
              stringValue: e,
            })),
          },
        },
        goals: {
          arrayValue: {
            values: sampleUserProfile.goals.map((g) => ({ stringValue: g })),
          },
        },
        createdAt: { timestampValue: sampleUserProfile.createdAt },
        updatedAt: { timestampValue: sampleUserProfile.updatedAt },
      },
      name: `projects/fitness-engine/databases/(default)/documents/users/${params.userId}`,
      createTime: sampleUserProfile.createdAt,
      updateTime: sampleUserProfile.updatedAt,
    });
  }),

  // Firestore challenges handlers
  http.get("*/databases/*/documents/challenges", () => {
    return HttpResponse.json({
      documents: sampleChallenges.map((challenge) => ({
        fields: Object.entries(challenge).reduce<FirestoreFields>(
          (acc, [key, value]) => {
            if (key === "id") return acc;

            if (Array.isArray(value)) {
              acc[key] = {
                arrayValue: { values: value.map((v) => ({ stringValue: v })) },
              };
            } else if (typeof value === "number") {
              acc[key] = { integerValue: value.toString() };
            } else if (typeof value === "boolean") {
              acc[key] = { booleanValue: value };
            } else {
              acc[key] = { stringValue: value };
            }

            return acc;
          },
          {}
        ),
        name: `projects/fitness-engine/databases/(default)/documents/challenges/${challenge.id}`,
        createTime: challenge.createdAt,
        updateTime: challenge.createdAt,
      })),
    });
  }),

  // Firestore leaderboard handlers
  http.get("*/databases/*/documents/leaderboard", () => {
    return HttpResponse.json({
      documents: sampleLeaderboard.map((entry) => ({
        fields: Object.entries(entry).reduce<FirestoreFields>(
          (acc, [key, value]) => {
            if (key === "id") return acc;

            if (typeof value === "number") {
              acc[key] = { integerValue: value.toString() };
            } else if (typeof value === "boolean") {
              acc[key] = { booleanValue: value };
            } else {
              acc[key] = { stringValue: value };
            }

            return acc;
          },
          {}
        ),
        name: `projects/fitness-engine/databases/(default)/documents/leaderboard/${entry.id}`,
      })),
    });
  }),

  // Firebase Functions handlers
  http.post("*/functions/completeChallenge", () => {
    return HttpResponse.json({
      result: {
        success: true,
        pointsAwarded: 50,
      },
    });
  }),

  http.post("*/functions/startChallenge", () => {
    return HttpResponse.json({
      result: {
        success: true,
        challengeId: "daily-challenge-1",
        startedAt: new Date().toISOString(),
      },
    });
  }),

  http.post("*/functions/resignChallenge", () => {
    return HttpResponse.json({
      result: {
        success: true,
        remainingRetries: 2,
      },
    });
  }),

  http.post("*/functions/completeUserProfile", () => {
    return HttpResponse.json({
      result: {
        success: true,
        userId: "test-user-id",
      },
    });
  }),
];
