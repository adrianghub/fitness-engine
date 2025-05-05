import * as admin from "firebase-admin";
import {
  Transaction,
  WriteBatch,
  type DocumentReference,
  type QuerySnapshot,
} from "firebase-admin/firestore";
import type { Leaderboard } from "../types/models";

const COLLECTION_NAME = "leaderboard";

// Helper to get the collection reference with proper typing
function getCollectionRef() {
  return admin
    .firestore()
    .collection(
      COLLECTION_NAME
    ) as admin.firestore.CollectionReference<Leaderboard>;
}

/**
 * Finds all leaderboard entries for a specific user, sorted by points descending.
 * @param userId The user's ID.
 * @returns A promise resolving to the query snapshot.
 */
export async function findByUserIdSorted(
  userId: string
): Promise<QuerySnapshot<Leaderboard>> {
  return getCollectionRef()
    .where("userId", "==", userId)
    .orderBy("points", "desc")
    .get();
}

/**
 * Finds opponent leaderboard entries for a specific user.
 * Can operate within a transaction.
 * @param userId The user's ID.
 * @param transaction Optional Firestore transaction.
 * @returns A promise resolving to the query snapshot.
 */
export async function findOpponentEntriesByUser(
  userId: string,
  transaction?: Transaction
): Promise<QuerySnapshot<Leaderboard>> {
  const query = getCollectionRef()
    .where("userId", "==", userId)
    .where("entityType", "==", "opponent");
  return transaction ? transaction.get(query) : query.get();
}

/**
 * Updates the rank field for a leaderboard entry within a batch or transaction.
 * @param target The batch or transaction object.
 * @param docRef The DocumentReference of the entry to update.
 * @param rank The new rank value.
 */
export function updateRank(
  target: WriteBatch | Transaction,
  docRef: DocumentReference<Leaderboard>,
  rank: number
): void {
  if (target instanceof Transaction) {
    target.update(docRef, { rank });
  } else if (target instanceof WriteBatch) {
    target.update(docRef, { rank });
  } else {
    throw new Error("Invalid target type for updateRank method");
  }
}

/**
 * Sets (creates or overwrites) a leaderboard entry within a batch or transaction.
 * Uses merge option for user entries to avoid overwriting other fields.
 * Generates a new ID for opponent entries.
 * @param target The batch or transaction object.
 * @param entryData The data for the leaderboard entry.
 */
export function setEntry(
  target: WriteBatch | Transaction,
  entryData: Leaderboard
): void {
  let docRef: DocumentReference<Leaderboard>;
  let options: admin.firestore.SetOptions | undefined = undefined;

  if (entryData.entityType === "user") {
    // For users, use their userId as the document ID and merge
    docRef = getCollectionRef().doc(entryData.entityId);
    options = { merge: true };
  } else {
    // For opponents, generate a new document ID
    // We assume entryData.entityId already holds the opponent's ID
    // but the leaderboard entry needs its own unique ID.
    docRef = getCollectionRef().doc(); // Generate new ID
  }

  if (target instanceof Transaction) {
    if (options) {
      target.set(docRef, entryData, options);
    } else {
      target.set(docRef, entryData);
    }
  } else if (target instanceof WriteBatch) {
    if (options) {
      target.set(docRef, entryData, options);
    } else {
      target.set(docRef, entryData);
    }
  } else {
    throw new Error("Invalid target type for setEntry method");
  }
}

/**
 * Deletes multiple leaderboard entries based on a snapshot within a transaction or batch.
 * @param target The transaction or batch object.
 * @param snapshot The snapshot containing entries to delete.
 */
export function deleteEntriesInSnapshot(
  target: WriteBatch | Transaction,
  snapshot: QuerySnapshot<Leaderboard>
): void {
  snapshot.forEach((doc) => {
    if (target instanceof Transaction) {
      target.delete(doc.ref);
    } else if (target instanceof WriteBatch) {
      target.delete(doc.ref);
    }
  });
}
