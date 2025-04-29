/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";
import { AuthPage } from "../pages/auth-page";
import { PersonalizationPage } from "../pages/personalization-page";

type CustomFixtures = {
  authPage: AuthPage;
  personalizationPage: PersonalizationPage;
};

// Extend the base test fixture with our page objects
export const test = base.extend<CustomFixtures>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  personalizationPage: async ({ page }, use) => {
    await use(new PersonalizationPage(page));
  },
  // Add a fixture for page that includes automatic cleanup
  page: async ({ page }, use) => {
    // Use the original page
    await use(page);

    // After each test, clear the state
    await page.evaluate(() => {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch (e) {
        console.error("Error cleaning up storage:", e);
      }
    });

    try {
      await page.context().clearCookies();
    } catch (e) {
      console.error("Error clearing cookies:", e);
    }
  },
});

// Add afterAll hook to clean up resources
test.afterAll(async ({ browser }) => {
  await browser.close();
});

// Add after hook to verify tests clean up their resources
test.afterEach(async ({ page }) => {
  // Verify storage is clean
  const storageLength = await page.evaluate(() => {
    return {
      localStorage: window.localStorage.length,
      sessionStorage: window.sessionStorage.length,
    };
  });

  // Log a warning if storage is not empty
  if (storageLength.localStorage > 0 || storageLength.sessionStorage > 0) {
    console.warn(
      "Warning: Test left items in storage. Cleaned up automatically."
    );
  }
});

export { expect } from "@playwright/test";
