import { Locator, Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Get the current directory path in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Screenshot categories to organize files
 */
export enum ScreenshotCategory {
  AUTH = "auth",
  PERSONALIZATION = "personalization",
  DASHBOARD = "dashboard",
  DEBUG = "debug",
}

const screenshotsBaseDir = path.join(__dirname, "..", "screenshots");

/**
 * Ensures the directory for a given category exists.
 * @param category The category of the screenshot.
 */
function ensureDirectoryExists(category: ScreenshotCategory) {
  const dirPath = path.join(screenshotsBaseDir, category);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * Generates a unique filename for the screenshot.
 * @param name A descriptive name for the screenshot.
 */
function generateFilename(name: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${name}-${timestamp}.png`;
}

/**
 * Helper function to take a screenshot and save it to the appropriate directory
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  category: ScreenshotCategory = ScreenshotCategory.DEBUG,
  waitForLocator?: Locator
): Promise<void> {
  const dirPath = ensureDirectoryExists(category);
  const filename = generateFilename(name);
  const screenshotPath = path.join(dirPath, filename);

  try {
    if (!page || page.isClosed()) {
      console.warn(
        `Cannot take screenshot for ${name}: page is closed or null`
      );
      return;
    }

    // Wait for basic page load state first
    await page.waitForLoadState("load", { timeout: 10000 });

    // If a specific locator is provided, wait for it to be visible
    if (waitForLocator) {
      try {
        await waitForLocator.waitFor({ state: "visible", timeout: 15000 }); // Increased timeout slightly
      } catch (locatorError) {
        console.warn(
          `Failed to find waitForLocator before screenshot ${screenshotPath}:`,
          locatorError
        );
        // Decide if you want to proceed with screenshot anyway or fail
        // Proceeding for now, but log the warning
      }
    }

    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.log(`Screenshot saved: ${screenshotPath}`);
  } catch (error) {
    console.error(`Failed to take screenshot ${screenshotPath}:`, error);
  }
}

/**
 * Helper function to take a screenshot during an error
 */
export async function takeErrorScreenshot(
  page: Page,
  testName: string
): Promise<void> {
  const dirPath = path.join(
    screenshotsBaseDir,
    ScreenshotCategory.AUTH,
    "errors"
  );
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filename = generateFilename(`error-${testName}`);
  const screenshotPath = path.join(dirPath, filename);

  try {
    if (!page || page.isClosed()) {
      console.warn(
        `Cannot take error screenshot for ${testName}: page is closed or null`
      );
      return;
    }

    // Wait for network idle before taking the error screenshot
    await page.waitForLoadState("load", { timeout: 5000 });
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.log(`Error screenshot saved: ${screenshotPath}`);
  } catch (error) {
    console.error(`Failed to take error screenshot ${screenshotPath}:`, error);
  }
}

/**
 * Helper to get a screenshot path (without taking one) - useful for specific assertions
 */
export function getScreenshotPath(
  name: string,
  category: ScreenshotCategory = ScreenshotCategory.DEBUG
): string {
  const dirPath = ensureDirectoryExists(category);
  const filename = generateFilename(name);
  return path.join(dirPath, filename);
}
