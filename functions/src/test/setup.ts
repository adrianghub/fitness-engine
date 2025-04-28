import * as admin from "firebase-admin";
// Use default import for firebase-functions-test based on common patterns
import functionsTest from "firebase-functions-test";
import { afterAll, beforeAll } from "vitest";

export const projectId = "fitness-engine-a3383";

// Initialize firebase-functions-test (online mode)
export const testEnvInstance = functionsTest(
  {
    projectId: projectId,
    // If running into issues connecting to emulators, specify host/port:
    // firestore: { host: 'localhost', port: 8080 },
    // auth: { host: 'localhost', port: 9099 },
    // database: { host: 'localhost', port: 9000 }
  }
  // pathToServiceAccountKey - usually not needed when using emulators
);

// Initialize Firebase Admin SDK (if not already initialized)
if (admin.apps.length === 0) {
  admin.initializeApp({ projectId });
  // If emulators are running and admin SDK doesn't connect automatically,
  // you might need to point it to the Firestore emulator:
  // admin.firestore().settings({ host: 'localhost:8080', ssl: false });
}

// Global setup before any tests run
beforeAll(() => {
  // --- Optional Global Setup ---
  // Example: Mock functions.config() globally if needed
  // testEnvInstance.mockConfig({
  //   some_api: { key: 'test-key' },
  //   feature_flags: { new_dashboard: 'true' }
  // });
  console.log("Starting test suite with global setup...");
});

// Global cleanup after all tests have run
afterAll(async () => {
  console.log("Cleaning up test environment...");
  // Cleanup the test environment (removes mocks, etc.)
  testEnvInstance.cleanup();

  // --- Optional Global Teardown ---
  // Example: Delete the admin app if it was created ONLY for testing
  // This might interfere if other processes use the same admin instance.
  // await admin.app().delete();

  // Example: Force exit if tests hang (use with caution)
  // setTimeout(() => process.exit(0), 1000);
});
