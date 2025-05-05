import * as admin from "firebase-admin";
import {
  Timestamp,
  // Direct imports for instanceof checks
  Transaction,
  WriteBatch,
  type DocumentReference,
} from "firebase-admin/firestore";
import type { User } from "../types/models";

const COLLECTION_NAME = "users";

function getCollectionRef() {
  return admin
    .firestore()
    .collection(COLLECTION_NAME) as admin.firestore.CollectionReference<User>;
}

/**
 * Gets the DocumentReference for a user.
 * @param userId The user's ID.
 * @returns The DocumentReference.
 */
export function findRefById(userId: string): DocumentReference<User> {
  return getCollectionRef().doc(userId);
}

/**
 * Finds a user by their ID.
 * Can operate within a transaction.
 * @param userId The user's ID.
 * @param transaction Optional Firestore transaction.
 * @returns A promise resolving to the user data or null if not found.
 */
export async function findById(
  userId: string,
  transaction?: admin.firestore.Transaction
): Promise<(User & { id: string }) | null> {
  const docRef = findRefById(userId);
  const snapshot = transaction
    ? await transaction.get(docRef)
    : await docRef.get();

  if (!snapshot.exists) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data()! };
}

/**
 * Finds all users.
 * Consider pagination for large user bases.
 * @returns A promise resolving to the query snapshot.
 */
export async function findAll(): Promise<admin.firestore.QuerySnapshot<User>> {
  // Warning: This can be inefficient for very large numbers of users.
  // Consider adding pagination or specific filtering if needed.
  return getCollectionRef().get();
}

/**
 * Finds all users with completed profiles.
 * @returns A promise resolving to the query snapshot.
 */
export async function findAllWithCompletedProfiles(): Promise<
  admin.firestore.QuerySnapshot<User>
> {
  return getCollectionRef().where("isProfileComplete", "==", true).get();
}

/**
 * Updates specific fields for a user within a transaction or batch.
 * @param target The transaction or batch object.
 * @param userId The ID of the user to update.
 * @param data The data to update (e.g., { points: 100, updatedAt: now }).
 */
export function updateUserFields(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  userId: string,
  data: Partial<User> // Allows updating specific fields like points, lastOpponentRegeneration
): void {
  const userRef = findRefById(userId);
  // Use direct imports for instanceof
  if (target instanceof Transaction) {
    target.update(userRef, data);
  } else if (target instanceof WriteBatch) {
    target.update(userRef, data);
  } else {
    throw new Error(
      "Invalid target type for updateUserFields repository method"
    );
  }
}

/**
 * Updates the points for a user within a transaction or batch.
 * Also updates the 'updatedAt' timestamp.
 * @param target The transaction or batch object.
 * @param userId The ID of the user to update.
 * @param points The new point value.
 * @param updatedAt Timestamp for the update.
 */
export function updatePoints(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  userId: string,
  points: number,
  updatedAt: Timestamp
): void {
  updateUserFields(target, userId, { points, updatedAt });
}

/**
 * Updates the last opponent regeneration timestamp for a user.
 * Also updates the 'updatedAt' timestamp.
 * @param target The transaction or batch object.
 * @param userId The ID of the user to update.
 * @param regenerationTime The timestamp of the last regeneration.
 * @param updatedAt Timestamp for the update.
 */
export function updateLastOpponentRegeneration(
  target: admin.firestore.Transaction | admin.firestore.WriteBatch,
  userId: string,
  regenerationTime: Timestamp,
  updatedAt: Timestamp
): void {
  updateUserFields(target, userId, {
    lastOpponentRegeneration: regenerationTime,
    updatedAt,
  });
}
