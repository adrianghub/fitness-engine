import * as admin from "firebase-admin";
import {
  Timestamp,
  Transaction,
  WriteBatch,
  type DocumentReference,
} from "firebase-admin/firestore";
import type {
  ChallengeStatus,
  ChallengeType,
  UserChallenge,
} from "../types/models";

const COLLECTION_NAME = "userChallenges";

// Helper to get the collection reference with proper typing
function getCollectionRef() {
  return admin
    .firestore()
    .collection(
      COLLECTION_NAME
    ) as admin.firestore.CollectionReference<UserChallenge>;
}

/**
 * Finds challenges for a user based on various criteria.
 * Can operate within a transaction.
 *
 * @param userId The user's ID.
 * @param criteria Criteria for filtering challenges:
 *   - statusNotIn?: Filter challenges whose status is NOT in the given array.
 *   - assignedBefore?: Filter challenges assigned before this timestamp.
 *   - assignedAfterOrOn?: Filter challenges assigned at or after this timestamp.
 *   - types?: Filter challenges by specific types (e.g., ["regular", "daily"])
 * @param transaction Optional Firestore transaction.
 * @returns A promise resolving to the query snapshot.
 */
export async function findUserChallengesByCriteria(
  userId: string,
  criteria: {
    statusNotIn?: ChallengeStatus[];
    assignedBefore?: Timestamp;
    assignedAfterOrOn?: Timestamp;
    types?: ChallengeType[];
  },
  transaction?: admin.firestore.Transaction
): Promise<admin.firestore.QuerySnapshot<UserChallenge>> {
  let query = getCollectionRef().where("userId", "==", userId);

  if (criteria.statusNotIn && criteria.statusNotIn.length > 0) {
    query = query.where("status", "not-in", criteria.statusNotIn);
  }
  if (criteria.assignedBefore) {
    query = query.where("assignedAt", "<", criteria.assignedBefore);
  }
  if (criteria.assignedAfterOrOn) {
    query = query.where("assignedAt", ">=", criteria.assignedAfterOrOn);
  }
  if (criteria.types && criteria.types.length > 0) {
    query = query.where("type", "in", criteria.types);
  }

  return transaction ? transaction.get(query) : query.get();
}

/**
 * Finds incomplete challenges for a user assigned before a specific time.
 * Can be used within a transaction.
 *
 * @param userId User's ID.
 * @param assignedBefore Timestamp threshold.
 * @param transaction Optional Firestore transaction.
 * @returns Promise resolving to the query snapshot.
 */
export function findIncompleteChallengesBefore(
  userId: string,
  assignedBefore: Timestamp,
  transaction?: admin.firestore.Transaction
): Promise<admin.firestore.QuerySnapshot<UserChallenge>> {
  return findUserChallengesByCriteria(
    userId,
    {
      statusNotIn: ["completed"],
      assignedBefore,
    },
    transaction
  );
}

/**
 * Finds all challenges for a user assigned before a specific time.
 * Can be used within a transaction.
 *
 * @param userId User's ID.
 * @param assignedBefore Timestamp threshold.
 * @param transaction Optional Firestore transaction.
 * @returns Promise resolving to the query snapshot.
 */
export function findChallengesAssignedBefore(
  userId: string,
  assignedBefore: Timestamp,
  transaction?: admin.firestore.Transaction
): Promise<admin.firestore.QuerySnapshot<UserChallenge>> {
  return findUserChallengesByCriteria(
    userId,
    {
      assignedBefore,
    },
    transaction
  );
}

/**
 * Finds regular challenges for a user assigned since a specific time (e.g., yesterday).
 * Can be used within a transaction.
 *
 * @param userId User's ID.
 * @param assignedSince Timestamp threshold (inclusive).
 * @param transaction Optional Firestore transaction.
 * @returns Promise resolving to the query snapshot.
 */
export function findRegularChallengesSince(
  userId: string,
  assignedSince: Timestamp,
  transaction?: admin.firestore.Transaction
): Promise<admin.firestore.QuerySnapshot<UserChallenge>> {
  return findUserChallengesByCriteria(
    userId,
    {
      assignedAfterOrOn: assignedSince,
      types: ["regular"],
    },
    transaction
  );
}

/**
 * Deletes multiple challenges within a transaction or batch.
 *
 * @param target The transaction or batch object.
 * @param snapshot The snapshot containing documents to delete.
 */
export function deleteChallengesInSnapshot(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  snapshot: admin.firestore.QuerySnapshot<UserChallenge>
): void {
  snapshot.forEach((doc) => {
    target.delete(doc.ref);
  });
}

/**
 * Creates a new user challenge within a transaction or batch.
 *
 * @param target The transaction or batch object.
 * @param challengeData The complete data for the new challenge (should match Firestore structure).
 * @returns The DocumentReference of the newly created challenge.
 */
export function createChallenge(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  challengeData: UserChallenge
): DocumentReference<UserChallenge> {
  const newChallengeRef = getCollectionRef().doc();

  // Explicitly check the type of target using direct imports
  if (target instanceof Transaction) {
    target.set(newChallengeRef, challengeData);
  } else if (target instanceof WriteBatch) {
    target.set(newChallengeRef, challengeData);
  } else {
    // Should not happen with the defined types, but good practice
    throw new Error(
      "Invalid target type for createChallenge repository method"
    );
  }

  return newChallengeRef;
}
