import { Page } from "@playwright/test";
import fs from "fs";
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
  try {
    if (!page || page.isClosed()) {
      console.warn(
        `Cannot take screenshot for ${name}: page is closed or null`
      );
      return;
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const filename = `${name}-${timestamp}.png`;
    const dirPath = path.join("e2e/screenshots", category);
    const filepath = path.join(dirPath, filename);

    // Ensure directory exists
    fs.mkdirSync(dirPath, { recursive: true });

    // Use a timeout to prevent hanging
    const screenshotPromise = page.screenshot({
      path: filepath,
      timeout: 5000,
    });
    await screenshotPromise;
    console.log(`Screenshot saved: ${filepath}`);
  } catch (error) {
    console.warn(`Failed to take screenshot for ${name}: ${error.message}`);
  }
}

/**
 * Helper function to take a screenshot during an error
 */
export async function takeErrorScreenshot(
  page: Page,
  testName: string
): Promise<void> {
  try {
    if (!page || page.isClosed()) {
      console.warn(
        `Cannot take error screenshot for ${testName}: page is closed or null`
      );
      return;
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const filename = `error-${testName}-${timestamp}.png`;
    const dirPath = path.join("e2e/screenshots/debug");
    const filepath = path.join(dirPath, filename);

    // Ensure directory exists
    fs.mkdirSync(dirPath, { recursive: true });

    // Use a timeout to prevent hanging
    await page.screenshot({ path: filepath, timeout: 5000 });
    console.log(`Error screenshot saved: ${filepath}`);
  } catch (error) {
    console.warn(
      `Failed to take error screenshot for ${testName}: ${error.message}`
    );
  }
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
