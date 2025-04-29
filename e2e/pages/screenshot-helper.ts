import { Page } from "@playwright/test";
import path from "path";

/**
 * Screenshot categories to organize files
 */
export enum ScreenshotCategory {
  AUTH = "auth",
  PERSONALIZATION = "personalization",
  DASHBOARD = "dashboard",
  DEBUG = "debug",
}

/**
 * Helper function to take a screenshot and save it to the appropriate directory
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  category: ScreenshotCategory = ScreenshotCategory.DEBUG
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join("e2e/screenshots", category, filename);

  await page.screenshot({ path: filepath });
  console.log(`Screenshot saved: ${filepath}`);
}

/**
 * Helper function to take a screenshot during an error
 */
export async function takeErrorScreenshot(
  page: Page,
  testName: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  const filename = `error-${testName}-${timestamp}.png`;
  const filepath = path.join("e2e/screenshots/debug", filename);

  await page.screenshot({ path: filepath });
  console.log(`Error screenshot saved: ${filepath}`);
}

/**
 * Helper to get a screenshot path (without taking one) - useful for specific assertions
 */
export function getScreenshotPath(
  name: string,
  category: ScreenshotCategory = ScreenshotCategory.DEBUG
): string {
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  const filename = `${name}-${timestamp}.png`;
  return path.join("e2e/screenshots", category, filename);
}
