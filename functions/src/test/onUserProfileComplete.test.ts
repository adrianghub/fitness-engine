import * as admin from "firebase-admin";
import { afterAll, describe, expect, it } from "vitest";

// Import only projectId from the shared setup
import { projectId } from "./setup"; // Removed unused testEnvInstance import

// We don't import the function directly anymore as it's not exported
// import * as myFunctions from "../index";

// Helper function to introduce a small delay
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Tests will run against the (default) Firestore database

describe.skip(`Integration Test: Firestore Trigger (default DB) for onUserProfileComplete`, () => {
  // Get a reference to the default database
  const db = admin.firestore(); // Use default database

  // Cleanup the default database after all tests in this suite are finished
  afterAll(async () => {
    console.log(
      `Cleaning Firestore data for suite: ${describe.name} (Database: (default))...`
    );
    const firestoreHost =
      process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";
    try {
      // Clear all data in the (default) database for the project
      await fetch(
        `http://${firestoreHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
        { method: "DELETE" }
      );
      console.log(
        `Firestore data cleared for database (default) in project ${projectId}.`
      );
    } catch (error) {
      console.warn(
        `Could not clear Firestore emulator database (default) at ${firestoreHost} for project ${projectId}:`,
        error
      );
    }
    // No need to delete a specific test app instance anymore
  });

  // No need for beforeAll to initialize a separate app

  it("should trigger challenge generation when user profile is completed via Firestore write", async () => {
    const userId = `user_trigger_complete_${Date.now()}`;
    // Use the default database reference
    const userDocRef = db.collection("users").doc(userId);

    // 1. Simulate the initial state (profile incomplete) in default db
    await userDocRef.set({
      name: "Test User",
      profileComplete: false,
      level: 1,
    });

    // 2. Simulate the update that should trigger the function (in default db)
    await userDocRef.update({ profileComplete: true });

    // 3. Wait for the Cloud Function trigger (listening on default db) to execute
    await wait(1000); // Adjust as needed

    // 4. Assertions: Check the results in default db
    const challengesRef = userDocRef.collection("challenges");
    const challengesSnapshot = await challengesRef.limit(1).get();

    expect(challengesSnapshot.empty).toBe(false);
    expect(challengesSnapshot.docs.length).toBeGreaterThan(0);
    console.log(
      `Trigger Test (default): Found ${challengesSnapshot.docs.length} challenges for ${userId} (expected)`
    );
  });

  it("should NOT trigger challenge generation if profileComplete does not change to true", async () => {
    const userId = `user_trigger_incomplete_${Date.now()}`;
    // Use the default database reference
    const userDocRef = db.collection("users").doc(userId);

    // 1. Simulate the initial state (profile incomplete) in default db
    await userDocRef.set({
      name: "Test User Inc",
      profileComplete: false,
      level: 1,
    });

    // 2. Simulate an update that *shouldn't* trigger the specific logic (in default db)
    await userDocRef.update({ name: "Test User Incomplete Updated" });

    // 3. Wait
    await wait(500); // Adjust as needed

    // 4. Assertions: Check that the 'challenges' subcollection was *not* created in default db
    const challengesRef = userDocRef.collection("challenges");
    const challengesSnapshot = await challengesRef.get();

    expect(challengesSnapshot.empty).toBe(true);
    console.log(
      `Trigger Test (default): Profile incomplete - no challenges found for ${userId} (expected)`
    );
  });
});
