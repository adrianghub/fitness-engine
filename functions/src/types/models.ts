import type * as firestore from 'firebase-admin/firestore';

/** Represents the level of a challenge */
export type ChallengeLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

/** Represents the status of a user's challenge */
export type ChallengeStatus = 'not-started' | 'in-progress' | 'completed';

/** Represents the type of entity in the leaderboard */
export type EntityType = 'user' | 'opponent';

/** Represents a fitness goal that a user can have */
export type FitnessGoal = string;

/** Represents how many times per week the user trains */
export type TrainingFrequency = '1' | '2' | '3' | '4' | '5' | '6' | '7';

/** Represents user's fitness level */
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

/** Represents a challenge template that can be assigned to users */
export interface ChallengeTemplate {
  /** Title of the challenge */
  title: string;
  /** Detailed description of the challenge */
  description: string;
  /** Required fitness level for the challenge */
  level: ChallengeLevel;
  /** Points awarded for completing the challenge */
  points: number;
  /** Expected time to complete the challenge */
  expectedTime: string;
  /** When the challenge template was created */
  createdAt: firestore.Timestamp;
  /** When the challenge template was last updated */
  updatedAt: firestore.Timestamp;
}

/** Represents an entry in the leaderboard */
export interface Leaderboard {
  /** Type of the entity (user or opponent) */
  entityType: EntityType;
  /** Reference to user or opponent ID */
  entityId: string;
  /** Total points */
  points: number;
  /** Current ranking position */
  rank?: number;
  /** When the leaderboard entry was last updated */
  lastUpdated: firestore.Timestamp;
}

/** Represents a fictional opponent for competition */
export interface Opponent {
  /** Name of the opponent */
  name: string;
  /** Current points of the opponent */
  currentPoints: number;
  /** Current ranking position */
  ranking?: number;
  /** When the opponent was last updated */
  lastUpdated: firestore.Timestamp;
  /** Opponent's fitness level */
  level: UserLevel;
}

/** Represents a user in the fitness application */
export interface User {
  /** User's email address (unique) */
  email: string;
  /** User's display name */
  displayName?: string;
  /** User's fitness level */
  level: UserLevel;
  /** Array of user's fitness goals */
  fitnessGoals?: FitnessGoal[];
  /** How often the user trains */
  trainingFrequency?: TrainingFrequency;
  /** Total points accumulated by the user */
  totalPoints: number;
  /** When the user account was created */
  createdAt: firestore.Timestamp;
  /** When the user account was last updated */
  updatedAt: firestore.Timestamp;
}

/** Represents an assigned challenge to a user */
export interface UserChallenge {
  /** Reference to the user document */
  userId: string;
  /** Reference to the challenge template document */
  challengeId: string;
  /** Current status of the challenge */
  status: ChallengeStatus;
  /** When the challenge was assigned */
  assignedDate: firestore.Timestamp;
  /** When the challenge was started */
  startedAt?: firestore.Timestamp;
  /** When the challenge was completed */
  finishedAt?: firestore.Timestamp;
  /** Points awarded for completing the challenge */
  pointsAwarded?: number;
}
