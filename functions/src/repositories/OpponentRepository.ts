import * as admin from "firebase-admin";
import {
  Timestamp,
  // Direct imports for instanceof checks
  Transaction,
  WriteBatch,
  type DocumentReference,
} from "firebase-admin/firestore";
import type { Opponent } from "../types/models";

const COLLECTION_NAME = "opponents";

// Helper to get the collection reference with proper typing
function getCollectionRef() {
  return admin
    .firestore()
    .collection(
      COLLECTION_NAME
    ) as admin.firestore.CollectionReference<Opponent>;
}

/**
 * Gets the DocumentReference for an opponent.
 * @param opponentId The opponent's ID.
 * @returns The DocumentReference.
 */
export function findRefById(opponentId: string): DocumentReference<Opponent> {
  return getCollectionRef().doc(opponentId);
}

/**
 * Finds opponents by user ID.
 * Can operate within a transaction.
 * @param userId The user's ID to fetch opponents for.
 * @param transaction Optional Firestore transaction.
 * @returns A promise resolving to the query snapshot.
 */
export async function findByUserId(
  userId: string,
  transaction?: admin.firestore.Transaction
): Promise<admin.firestore.QuerySnapshot<Opponent>> {
  const query = getCollectionRef().where("userId", "==", userId);
  return transaction ? transaction.get(query) : query.get();
}

/**
 * Updates specific fields for an opponent within a transaction or batch.
 * @param target The transaction or batch object.
 * @param opponentId The ID of the opponent to update.
 * @param data The data to update.
 */
export function updateOpponentFields(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  opponentId: string,
  data: Partial<Opponent>
): void {
  const opponentRef = findRefById(opponentId);
  if (target instanceof Transaction) {
    target.update(opponentRef, data);
  } else if (target instanceof WriteBatch) {
    target.update(opponentRef, data);
  } else {
    throw new Error("Invalid target type for updateOpponentFields method");
  }
}

/**
 * Updates the points for an opponent within a transaction or batch.
 * Also updates the 'updatedAt' timestamp.
 * @param target The transaction or batch object.
 * @param opponentId The ID of the opponent to update.
 * @param points The new point value.
 * @param updatedAt Timestamp for the update.
 */
export function updatePoints(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  opponentId: string,
  points: number,
  updatedAt: Timestamp
): void {
  updateOpponentFields(target, opponentId, {
    currentPoints: points,
    updatedAt,
  });
}

/**
 * Deletes multiple opponents based on a snapshot within a transaction or batch.
 * @param target The transaction or batch object.
 * @param snapshot The snapshot containing opponent documents to delete.
 */
export function deleteOpponentsInSnapshot(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  snapshot: admin.firestore.QuerySnapshot<Opponent>
): void {
  snapshot.forEach((doc) => {
    target.delete(doc.ref);
  });
}

/**
 * Creates a new opponent within a transaction or batch.
 * Note: Assumes opponentData includes the desired ID.
 * @param target The transaction or batch object.
 * @param opponentData The complete data for the new opponent (including ID).
 */
export function createOpponentWithId(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  opponentData: Opponent
): void {
  const opponentRef = findRefById(opponentData.id);
  if (target instanceof Transaction) {
    target.set(opponentRef, opponentData);
  } else if (target instanceof WriteBatch) {
    target.set(opponentRef, opponentData);
  } else {
    throw new Error("Invalid target type for createOpponentWithId method");
  }
}
