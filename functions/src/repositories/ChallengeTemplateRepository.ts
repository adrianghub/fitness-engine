import * as admin from "firebase-admin";
import { FieldPath } from "firebase-admin/firestore";
import type { ChallengeLevel, ChallengeTemplate } from "../types/models";

const COLLECTION_NAME = "challengeTemplates";

// Helper to get the collection reference with proper typing
function getCollectionRef() {
  return admin
    .firestore()
    .collection(
      COLLECTION_NAME
    ) as admin.firestore.CollectionReference<ChallengeTemplate>;
}

/**
 * Finds challenge templates by a specific level.
 * Can be used within a transaction.
 * @param level The challenge level to filter by.
 * @param transaction Optional Firestore transaction.
 * @returns A promise that resolves with an array of challenge templates.
 */
export async function findByLevel(
  level: ChallengeLevel,
  transaction?: admin.firestore.Transaction
): Promise<(ChallengeTemplate & { id: string })[]> {
  const query = getCollectionRef().where("level", "==", level);
  const snapshot = transaction
    ? await transaction.get(query)
    : await query.get();

  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Finds challenge templates by multiple levels.
 * Can be used within a transaction.
 * @param levels An array of challenge levels to filter by.
 * @param transaction Optional Firestore transaction.
 * @returns A promise that resolves with an array of challenge templates.
 */
export async function findByLevels(
  levels: ChallengeLevel[],
  transaction?: admin.firestore.Transaction
): Promise<(ChallengeTemplate & { id: string })[]> {
  if (!levels || levels.length === 0) {
    return [];
  }
  const query = getCollectionRef().where("level", "in", levels);
  const snapshot = transaction
    ? await transaction.get(query)
    : await query.get();

  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Finds challenge templates by their document IDs.
 * Useful for validating recommendations.
 * Can be used within a transaction.
 * @param ids An array of challenge template document IDs.
 * @param transaction Optional Firestore transaction.
 * @returns A promise that resolves with an array of challenge templates found.
 */
export async function findByIds(
  ids: string[],
  transaction?: admin.firestore.Transaction
): Promise<(ChallengeTemplate & { id: string })[]> {
  if (!ids || ids.length === 0) {
    return [];
  }
  const query = getCollectionRef().where(FieldPath.documentId(), "in", ids);
  const snapshot = transaction
    ? await transaction.get(query)
    : await query.get();

  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
