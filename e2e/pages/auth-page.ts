import { Page } from "@playwright/test";

/**
 * Page Object Model for the authentication page
 */
export class AuthPage {
  constructor(private page: Page) {}

  async clickGoogleSignIn() {
    await this.page
      .getByRole("button", { name: /sign in with google/i })
      .click();
  }
}
