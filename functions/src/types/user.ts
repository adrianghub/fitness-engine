import type { Timestamp } from "firebase-admin/firestore";

export type FitnessGoals = string[];

export type TrainingFrequency = "1" | "2" | "3" | "4" | "5" | "6" | "7";

export type UserLevel = "beginner" | "intermediate" | "advanced";

export interface User {
  id?: string;
  email?: string;
  displayName?: string;
  level: UserLevel;
  fitnessGoals?: FitnessGoals;
  trainingFrequency?: TrainingFrequency;
  totalPoints: number;
  role: "user" | "admin";
  isAdmin?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
