import { expect, test } from "../fixtures/auth-fixture";
import { loginWithGoogleAccount } from "../pages/auth-helper";
import {
  ScreenshotCategory,
  takeErrorScreenshot,
  takeScreenshot,
} from "../pages/screenshot-helper";

test.describe("Personalization Flow", () => {
  // Simple test to verify we get redirected to login when not authenticated
  test("should redirect to login when accessing personalization without auth", async ({
    page,
  }) => {
    await page.goto("/personalization");
    await expect(page).toHaveURL("/login?redirect=%2Fpersonalization");
  });

  // Test the personalization flow steps without finalizing the process
  test("should navigate through all personalization steps", async ({
    page,
    authPage,
    personalizationPage,
  }) => {
    // First, make sure we're authenticated with a NEW account
    // Force new account creation to ensure personalization flow is accessible
    try {
      await loginWithGoogleAccount(page, authPage, true);

      // Navigate directly to personalization page
      await page.goto("/personalization");

      // Take screenshot to debug
      await takeScreenshot(
        page,
        "personalization-start",
        ScreenshotCategory.PERSONALIZATION
      );

      // Complete Step 1: Display Name
      await expect(
        page.getByText("Personalize Your Fitness Journey")
      ).toBeVisible({ timeout: 15000 });
      await expect(page.getByText("Step 1 of 4")).toBeVisible();

      // The display name might be pre-filled from auth
      const displayNameInput = page.getByLabel("Display Name");
      await displayNameInput.waitFor({ state: "visible", timeout: 10000 });

      const currentValue = await displayNameInput.inputValue();

      if (!currentValue) {
        await personalizationPage.fillDisplayName("Test User");
      }

      await page.getByRole("button", { name: "Next" }).click();
      await page.waitForTimeout(1000); // Wait for transition

      // Complete Step 2: Fitness Level
      await expect(page.getByText("Step 2 of 4")).toBeVisible({
        timeout: 10000,
      });
      await takeScreenshot(
        page,
        "personalization-step2",
        ScreenshotCategory.PERSONALIZATION
      );

      // Use the page object method to select fitness level
      await personalizationPage.selectFitnessLevel("beginner");
      await page.getByRole("button", { name: "Next" }).click();
      await page.waitForTimeout(1000); // Wait for transition

      // Complete Step 3: Equipment
      await expect(page.getByText("Step 3 of 4")).toBeVisible({
        timeout: 10000,
      });
      await takeScreenshot(
        page,
        "personalization-step3",
        ScreenshotCategory.PERSONALIZATION
      );

      // Use the updated page object method for equipment selection
      await personalizationPage.selectEquipment([
        "dumbbells",
        "resistance-bands",
      ]);
      await page.getByRole("button", { name: "Next" }).click();
      await page.waitForTimeout(1000); // Wait for transition

      // Step 4: Goals - Interact with the UI elements before checking if button is enabled
      await expect(page.getByText("Step 4 of 4")).toBeVisible({
        timeout: 10000,
      });
      await takeScreenshot(
        page,
        "personalization-step4",
        ScreenshotCategory.PERSONALIZATION
      );

      // Verify UI elements on the Goals step
      await expect(
        page.getByText("Tell us about your fitness goals")
      ).toBeVisible();

      // Option 1: Click on a suggested goal
      // First verify that the suggested goals section is visible
      await expect(page.getByText("Suggested Goals")).toBeVisible();

      // Click on one of the suggested goals
      await page.getByText("Improve overall fitness level").click();

      // Alternative option: Fill the textarea directly (uncomment if needed)
      // const goalsTextarea = page.getByPlaceholder("Describe what you want to achieve...");
      // await goalsTextarea.fill("I want to build more muscle and improve my cardio endurance");

      // Wait a moment for the form to update
      await page.waitForTimeout(500);

      // Verify the final button is visible and enabled
      const finalButton = page.getByRole("button", {
        name: "Start Your Journey",
      });
      await expect(finalButton).toBeVisible();
      await expect(finalButton).toBeEnabled();

      // Take a screenshot showing the completed form
      await takeScreenshot(
        page,
        "personalization-goals-completed",
        ScreenshotCategory.PERSONALIZATION
      );

      // Intentionally stopping here without completing the flow
      console.log("Successfully validated all personalization steps");
    } catch (error) {
      // Take screenshot on error to help with debugging
      await takeErrorScreenshot(page, "personalization-flow-error");
      console.error("Test failed with error:", error);
      throw error;
    }
  });
});
