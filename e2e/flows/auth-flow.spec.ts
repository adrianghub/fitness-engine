import { expect, test } from "../fixtures/auth-fixture";
import {
  ScreenshotCategory,
  takeErrorScreenshot,
  takeScreenshot,
} from "../helpers/screenshot-helper";

test.describe("Authentication Flow", () => {
  test("should redirect to login when accessing protected route", async ({
    page,
  }) => {
    await page.goto("/personalization");
    await expect(page).toHaveURL("/login?redirect=%2Fpersonalization");
  });

  test("should successfully authenticate with Google", async ({ page }) => {
    try {
      // Start at the login page
      await page.goto("/login");

      await expect(page.getByTestId("login-form-card")).toBeVisible();
      await expect(page.getByTestId("google-signin-button")).toBeVisible();

      // Take screenshot for reference
      await takeScreenshot(page, "login-page", ScreenshotCategory.AUTH);

      // Click Sign in with Google button using testId and wait for popup
      const popupPromise = page.waitForEvent("popup");
      await page.getByTestId("google-signin-button").click();

      // Handle the auth emulator popup
      const popupPage = await popupPromise;
      await popupPage.waitForLoadState("domcontentloaded", { timeout: 10000 });

      // Take a screenshot of the popup for debugging
      await takeScreenshot(
        popupPage,
        "auth-emulator-popup",
        ScreenshotCategory.AUTH
      );

      try {
        console.log("No existing accounts, adding new one");

        // Check for add account button with proper timeout
        const addAccountButton = popupPage.getByText("Add new account");
        if (await addAccountButton.isVisible()) {
          await addAccountButton.click();
        }

        // Generate unique email to prevent conflicts
        const randomId = Math.floor(Math.random() * 1000000);
        const testEmail = `test-user-${randomId}@example.com`;

        // Fill in the new account details with proper waits
        await popupPage.getByLabel("Email").waitFor({ state: "visible" });
        await popupPage.getByLabel("Email").fill(testEmail);

        await popupPage
          .getByLabel("Display name", { exact: false })
          .waitFor({ state: "visible" });
        await popupPage
          .getByLabel("Display name", { exact: false })
          .fill(`Test User ${randomId}`);

        // Click the sign in button
        const signInButton = popupPage.getByRole("button", {
          name: /sign in/i,
        });
        await signInButton.waitFor({ state: "visible" });
        await signInButton.click();

        // Wait for redirection - using a more robust approach
        await Promise.race([
          popupPage.waitForEvent("close", { timeout: 15000 }).catch(() => {}),
          page.waitForURL(/\/(dashboard|personalization)/, { timeout: 30000 }),
        ]);

        // Check for a element that should be visible after login
        await expect(page.getByRole("banner")).toBeVisible();
        console.log("Banner is visible.");

        console.log("Try block completed successfully.");
      } catch (error) {
        // Take screenshot of any error in the popup handling
        if (popupPage && !popupPage.isClosed()) {
          await takeErrorScreenshot(popupPage, "popup-error");
        }

        // Re-throw to be caught by outer try-catch
        throw error;
      }
    } catch (error) {
      // Take screenshot on error to help with debugging
      if (page && !page.isClosed()) {
        await takeErrorScreenshot(page, "auth-error-in-try");
      }

      console.error("Test failed with error:", error);
      throw error;
    }
    console.log("Test function body finished.");
  });

  test("should redirect to original page after login", async ({ page }) => {
    // Try to access protected page
    await page.goto("/personalization");

    // Should redirect to login with redirect param
    await expect(page).toHaveURL("/login?redirect=%2Fpersonalization");

    // Verify login form elements are visible
    await expect(page.getByTestId("login-form-card")).toBeVisible();
    await expect(page.getByTestId("google-signin-button")).toBeVisible();

    try {
      // Click Sign in with Google button using testId and wait for popup
      const popupPromise = page.waitForEvent("popup");
      await page.getByTestId("google-signin-button").click();

      // Handle the auth emulator popup
      const popupPage = await popupPromise;
      await popupPage.waitForLoadState("domcontentloaded", { timeout: 10000 });

      // Generate unique credentials
      const randomId = Math.floor(Math.random() * 1000000);
      const email = `redirect-test-${randomId}@example.com`;
      const displayName = `Redirect Test ${randomId}`;

      await popupPage.getByText("Add new account").click();
      await popupPage.getByLabel("Email").waitFor({ state: "visible" });
      await popupPage.getByLabel("Email").fill(email);

      await popupPage
        .getByLabel("Display name", { exact: false })
        .waitFor({ state: "visible" });
      await popupPage
        .getByLabel("Display name", { exact: false })
        .fill(displayName);

      await popupPage.getByRole("button", { name: /sign in/i }).click();

      await Promise.race([
        popupPage.waitForEvent("close", { timeout: 15000 }).catch(() => {}),
        page.waitForURL("/personalization", { timeout: 30000 }),
      ]);

      // Verify we landed on the correct page
      await expect(page).toHaveURL("/personalization");
    } catch (error) {
      // Take screenshot on error
      if (page && !page.isClosed()) {
        await takeErrorScreenshot(page, "redirect-test-error");
      }
      throw error;
    }
  });
});
