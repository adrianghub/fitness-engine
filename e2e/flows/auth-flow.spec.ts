import { expect, test } from "../fixtures/auth-fixture";
import {
  ScreenshotCategory,
  takeErrorScreenshot,
  takeScreenshot,
} from "../pages/screenshot-helper";

test.describe("Authentication Flow", () => {
  test("should redirect to login when accessing protected route", async ({
    page,
  }) => {
    await page.goto("/personalization");
    await expect(page).toHaveURL("/login?redirect=%2Fpersonalization");
  });

  test("should successfully authenticate with Google", async ({
    page,
    authPage,
  }) => {
    // Start at the login page
    await page.goto("/login");

    // Take screenshot for reference
    await takeScreenshot(page, "login-page", ScreenshotCategory.AUTH);

    // Click Sign in with Google button and wait for popup
    const popupPromise = page.waitForEvent("popup");
    await authPage.clickGoogleSignIn();

    // Handle the auth emulator popup
    const popupPage = await popupPromise;
    await popupPage.waitForLoadState();

    // Take a screenshot of the popup for debugging
    await takeScreenshot(
      popupPage,
      "auth-emulator-popup",
      ScreenshotCategory.AUTH
    );

    try {
      console.log("No existing accounts, adding new one");
      const addAccountButton = popupPage.getByText("Add new account");

      if (await addAccountButton.isVisible()) {
        await addAccountButton.click();
      }

      // Fill in the new account details
      await popupPage.getByLabel("Email").fill("test-user@example.com");
      await popupPage
        .getByLabel("Display name", { exact: false })
        .fill("Test User");

      // Click the sign in button
      await popupPage.getByRole("button", { name: /sign in/i }).click();

      // After login, we can be redirected to either dashboard or personalization
      // depending on whether the user's profile is complete
      await page.waitForURL(/\/(dashboard|personalization)/, {
        timeout: 30000,
      });

      // Take screenshot to see where we landed
      await takeScreenshot(page, "after-login", ScreenshotCategory.AUTH);

      // Verify we're logged in by checking for header elements that should be visible for logged-in users
      await expect(page.getByRole("banner")).toBeVisible({ timeout: 5000 });
    } catch (error) {
      // Take screenshot on error to help with debugging
      await takeErrorScreenshot(page, "auth-error");
      throw error;
    }
  });

  test("should redirect to original page after login", async ({
    page,
    authPage,
  }) => {
    // Try to access protected page
    await page.goto("/personalization");

    // Should redirect to login with redirect param
    await expect(page).toHaveURL("/login?redirect=%2Fpersonalization");

    // Click Sign in with Google button and wait for popup
    const popupPromise = page.waitForEvent("popup");
    await authPage.clickGoogleSignIn();

    // Handle the auth emulator popup
    const popupPage = await popupPromise;
    await popupPage.waitForLoadState();

    await popupPage.getByText("Add new account").click();
    await popupPage.getByLabel("Email").fill("redirect-test@example.com");
    await popupPage
      .getByLabel("Display name", { exact: false })
      .fill("Redirect Test");
    await popupPage.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL("/personalization", { timeout: 30000 });
  });
});
