import { Page } from "@playwright/test";
import { AuthPage } from "../pages/auth-page";
import { takeErrorScreenshot } from "./screenshot-helper";

/**
 * Helper functions for authentication in tests
 */
export async function loginWithGoogleAccount(
  page: Page,
  authPage: AuthPage,
  forceNewAccount: boolean = false
): Promise<void> {
  // Navigate to login
  await page.goto("/login");

  // Wait to make sure page is fully loaded
  await page.waitForLoadState("networkidle");

  try {
    // Click Sign in with Google and wait for popup
    const popupPromise = page.waitForEvent("popup");
    await authPage.clickGoogleSignIn();

    // Handle the auth emulator popup
    const popupPage = await popupPromise;
    await popupPage.waitForLoadState("domcontentloaded");

    // Wait a bit to make sure the popup is fully loaded
    await popupPage.waitForTimeout(1000);

    // Check if we have a list of accounts
    const accountItems = popupPage.locator('[class*="mdc-list-item"]');
    const accountCount = await accountItems.count();

    if (accountCount > 0 && !forceNewAccount) {
      // Click the first account in the list
      console.log("Using existing account");
      await accountItems.first().click({ timeout: 10000 });
    } else {
      // Add new account if no accounts are available or forced to create new
      console.log("Creating new test account");

      // Check for add account button
      const addAccountButton = popupPage.getByText("Add new account");
      if (await addAccountButton.isVisible()) {
        await addAccountButton.click();
      }

      // Wait for form fields to be visible
      await popupPage.waitForSelector(
        'input[type="email"], input[type="text"]',
        { timeout: 10000 }
      );

      // Generate unique email to prevent profile completion status issues
      const randomId = Math.floor(Math.random() * 1000000);
      const uniqueEmail = `test-user-${randomId}@example.com`;

      // Fill in the new account details
      await popupPage.getByLabel("Email").fill(uniqueEmail);
      await popupPage
        .getByLabel("Display name", { exact: false })
        .fill(`Test User ${randomId}`);

      // Click the sign in button
      await popupPage.getByRole("button", { name: /sign in/i }).click();
    }

    // Wait for authentication to complete and redirect
    await page.waitForURL(/\/(dashboard|personalization)/, { timeout: 30000 });

    // Take screenshot after login
  } catch (error) {
    console.error("Authentication failed:", error);
    await takeErrorScreenshot(page, "auth-failed");
    throw error;
  }
}
