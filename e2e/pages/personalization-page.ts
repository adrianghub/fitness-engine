import { Page } from "@playwright/test";

/**
 * Page Object Model for the personalization flow
 */
export class PersonalizationPage {
  constructor(private page: Page) {}

  async fillDisplayName(name: string) {
    await this.page.getByTestId("display-name-input").fill(name);
  }

  async selectFitnessLevel(level: "beginner" | "intermediate" | "advanced") {
    await this.page
      .getByTestId(`fitness-level-option-${level}`)
      .click({ timeout: 10000 });

    await this.page.waitForTimeout(500);
  }

  async selectEquipment(types: string[]) {
    for (const type of types) {
      await this.page
        .getByTestId(`equipment-option-${type}`)
        .click({ timeout: 10000, force: true });

      await this.page.waitForTimeout(500);
    }
  }

  async selectGoals(goals: string[]) {
    await this.page.getByTestId("goals-textarea").fill(goals.join(", "));
  }

  async clickNext() {
    await this.page.getByTestId("personalization-submit-button").click();
    await this.page.waitForTimeout(1000);
  }

  async clickBack() {
    await this.page.getByTestId("personalization-back-button").click();
    await this.page.waitForTimeout(1000);
  }

  async clickStartYourJourney() {
    await this.page.getByTestId("personalization-submit-button").click();
  }

  async selectSuggestedGoal(goal: string) {
    const goalId = goal.toLowerCase().replace(/\s+/g, "-");
    await this.page
      .getByTestId(`suggested-goal-${goalId}`)
      .click({ timeout: 10000 });
    await this.page.waitForTimeout(500);
  }
}
