import { test as base, expect } from "@playwright/test";

// Define custom fixture types
type FirebaseFixtures = {
  testEmail: string;
};

/**
 * Extended test fixture with Firebase emulator cleanup
 */
export const test = base.extend<FirebaseFixtures>({
  // Setup before tests and cleanup after each test
  page: async ({ page }, use) => {
    // Setup: Create a browser context with Firebase emulators
    await page.goto("/");

    // Make firebase emulators available in the browser context
    await page.addInitScript(() => {
      // This only works if the app is configured to use these values when
      // running in test mode (import.meta.env.MODE === 'test')
      window.localStorage.setItem(
        "firebase:emulators",
        JSON.stringify({
          auth: ["localhost", 9099],
          firestore: ["localhost", 8080],
          functions: ["localhost", 5001],
        })
      );
    });

    // Use the page with Firebase emulator configuration
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);

    // Cleanup: Only Firebase-specific setup was done here. Browser cleanup is handled in auth-fixture.
  },

  // Ensure test emails are properly prefixed for cleanup
  testEmail: [
    async () => {
      // Generate a unique test email
      const randomId = Math.floor(Math.random() * 1000000);
      const testEmail = `test-user-${randomId}@example.com`;
      return testEmail;
    },
    { scope: "test" },
  ],
});

export { expect };
