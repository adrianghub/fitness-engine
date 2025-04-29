import { Page } from "@playwright/test";

/**
 * Page Object Model for the personalization flow
 */
export class PersonalizationPage {
  constructor(private page: Page) {}

  async fillDisplayName(name: string) {
    await this.page.getByLabel("Display Name").fill(name);
  }

  async selectFitnessLevel(level: "beginner" | "intermediate" | "advanced") {
    // Use the capitalized level name displayed in the UI
    const displayLevel = level.charAt(0).toUpperCase() + level.slice(1);

    // Click on the section containing the fitness level
    await this.page
      .locator(`div:has-text("${displayLevel}")`)
      .locator(`span:text-is("${displayLevel}")`)
      .first()
      .click({ timeout: 10000 });

    // Wait for the click to register (animation or state change)
    await this.page.waitForTimeout(500);
  }

  async selectEquipment(types: string[]) {
    for (const type of types) {
      // Equipment items have the label capitalized in the UI
      const displayType =
        type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " "); // Convert kebab-case to space-separated

      // Click directly on the equipment card using the span text
      await this.page
        .locator(".cursor-pointer")
        .filter({ hasText: displayType })
        .first()
        .click({ timeout: 10000, force: true });

      // Wait for the click to register (animation or state change)
      await this.page.waitForTimeout(500);
    }
  }

  async selectGoals(goals: string[]) {
    // For the goals section, directly use the textarea
    await this.page
      .getByPlaceholder("Describe what you want to achieve...")
      .fill(goals.join(", "));

    // Alternatively, if selecting from the suggested goals:
    // for (const goal of goals) {
    //   await this.page
    //     .locator('div.p-4.bg-muted')
    //     .filter({ hasText: goal })
    //     .first()
    //     .click({ timeout: 10000 });
    // }
  }
}
