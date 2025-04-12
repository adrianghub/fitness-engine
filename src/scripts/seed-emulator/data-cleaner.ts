import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "./constants";

// Clear existing data from the database
export async function clearExistingData(): Promise<void> {
  console.log("Clearing existing data...");

  // First, get all user documents to know which auth accounts to delete
  let userIds: string[] = [];
  try {
    const usersCollectionRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollectionRef);
    userIds = usersSnapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error retrieving users for account deletion:", error);
  }

  for (const collectionName of COLLECTIONS) {
    try {
      console.log(`Clearing ${collectionName} collection...`);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      const batchSize = 500;
      let batch = writeBatch(db);
      let count = 0;

      for (const document of snapshot.docs) {
        batch.delete(doc(db, collectionName, document.id));
        count++;

        if (count >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
      }

      console.log(`Deleted ${snapshot.size} documents from ${collectionName}`);
    } catch (error) {
      console.error(`Error clearing ${collectionName} collection:`, error);
    }
  }

  // Delete corresponding auth accounts
  console.log(
    `Found ${userIds.length} user accounts that need to be removed from authentication`
  );

  console.log(
    "Note: For emulator environment, auth account deletion is skipped."
  );
  console.log(
    "In production, enable the commented code to use Firebase Admin SDK for account deletion."
  );

  console.log("Data clearing completed.");
}
