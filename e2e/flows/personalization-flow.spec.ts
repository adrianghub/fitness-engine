import { expect, test } from "../fixtures/auth-fixture";
import { loginWithGoogleAccount } from "../helpers/auth-helper";
import {
  ScreenshotCategory,
  takeErrorScreenshot,
  takeScreenshot,
} from "../helpers/screenshot-helper";

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

      // Take screenshot to debug, waiting for the step description
      await takeScreenshot(
        page,
        "personalization-start",
        ScreenshotCategory.PERSONALIZATION,
        page.getByTestId("personalization-form-step-description")
      );

      // Complete Step 1: Display Name
      // Use testId to verify step description
      await expect(
        page.getByTestId("personalization-form-step-description")
      ).toHaveText("Step 1 of 4", { timeout: 15000 });

      // The display name might be pre-filled from auth
      const displayNameInput = page.getByTestId("display-name-input");
      await displayNameInput.waitFor({ state: "visible", timeout: 10000 });

      const currentValue = await displayNameInput.inputValue();
      if (!currentValue) {
        await personalizationPage.fillDisplayName("Test User");
      }

      // Use the new POM method
      await personalizationPage.clickNext();

      // Complete Step 2: Fitness Level
      await expect(
        page.getByTestId("personalization-form-step-description")
      ).toHaveText("Step 2 of 4", { timeout: 10000 });
      await takeScreenshot(
        page,
        "personalization-step2",
        ScreenshotCategory.PERSONALIZATION
      );

      // Use the page object method to select fitness level
      await personalizationPage.selectFitnessLevel("beginner");

      // Use the new POM method
      await personalizationPage.clickNext();

      // Complete Step 3: Equipment
      await expect(
        page.getByTestId("personalization-form-step-description")
      ).toHaveText("Step 3 of 4", { timeout: 10000 });
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

      // Use the new POM method
      await personalizationPage.clickNext();

      // Step 4: Goals - Interact with the UI elements before checking if button is enabled
      await expect(
        page.getByTestId("personalization-form-step-description")
      ).toHaveText("Step 4 of 4", { timeout: 10000 });
      await takeScreenshot(
        page,
        "personalization-step4",
        ScreenshotCategory.PERSONALIZATION
      );

      // Verify UI elements on the Goals step using testIds
      await expect(page.getByTestId("goals-step")).toBeVisible();
      await expect(page.getByTestId("goals-textarea")).toBeVisible();
      await expect(page.getByTestId("suggested-goals-section")).toBeVisible();

      // Use the new POM method to click a suggested goal
      await personalizationPage.selectSuggestedGoal(
        "Improve overall fitness level"
      );

      // Wait a moment for the form to update (already included in POM method)
      // await page.waitForTimeout(500);

      // Verify the final button is visible and enabled using its testId
      const finalButton = page.getByTestId("personalization-submit-button");
      await expect(finalButton).toBeVisible();
      await expect(finalButton).toBeEnabled();
      await expect(finalButton).toHaveText("Start Your Journey");

      // Take a screenshot showing the completed form
      await takeScreenshot(
        page,
        "personalization-goals-completed",
        ScreenshotCategory.PERSONALIZATION
      );

      // Intentionally stopping here without completing the flow
      console.log(
        "Successfully validated all personalization steps using testIds"
      );
    } catch (error) {
      // Take screenshot on error to help with debugging
      await takeErrorScreenshot(page, "personalization-flow-error");
      console.error("Test failed with error:", error);
      throw error;
    }
  });
});
