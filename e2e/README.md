# End-to-End Tests with Playwright

This directory contains the end-to-end tests for the Fitness Engine application. These tests verify complete user flows through the application using Playwright.

## Test Structure

- `pages/`: Page Object Models that encapsulate actions and assertions for specific pages
- `fixtures/`: Test fixtures and helpers
- `flows/`: Test flows that encapsulate a complete user flow through the application
- `utils/`: Utility functions for test setup and cleanup

## Getting Started

1. Install Playwright dependencies:
   ```bash
   pnpm run test:e2e:install
   ```

2. Make sure you have the Firebase emulators installed:
   ```bash
   npm install -g firebase-tools
   ```

## Running Tests

To run all e2e tests with emulator cleanup:
```bash
pnpm run test:e2e
```

For a completely fresh environment (kills all ports, removes data, restarts emulators):
```bash
pnpm run test:e2e:fresh
```

To run tests with the Playwright UI:
```bash
pnpm run test:e2e:ui
```

To generate test code using the Playwright codegen tool:
```bash
pnpm run test:e2e:codegen
```

## Emulator Management

We provide several utilities to manage Firebase emulators for testing:

### Reset Emulators

The `pnpm emulators:reset` command:
1. Stops any running emulators
2. Kills processes using emulator ports
3. Starts fresh emulators with clean state
4. Cleans up old screenshots

The `test:e2e` and `test:e2e:ci` commands automatically reset emulators before tests.

### Kill Ports

If you're having issues with port conflicts, use:
```bash
pnpm killports
```

This aggressively kills any processes using the emulator ports.

### Clean Environment

For a completely fresh state:
```bash
pnpm test:e2e:fresh
```

This:
1. Kills all processes on emulator ports
2. Removes the firebase-data directory
3. Starts emulators with a fresh state
4. Runs the tests

### Firebase Cleanup

The utils directory contains `firebase-cleanup.ts` with functions for:
- Resetting all emulators
- Cleaning up test users
- Cleaning up test data from specific collections

Individual test files also include cleanup in their `beforeAll` and `afterAll` hooks for targeted cleanup.

## Page Object Model Pattern

We use the Page Object Model (POM) pattern for our tests:
- Each page has its own class that encapsulates interactions with that page
- Tests should interact with pages through these models, not directly with page elements
- This makes tests more maintainable as UI changes only require updates to the page models

## Testing with Firebase Emulators

All tests run against Firebase emulators:
- Auth emulator runs on port 9099
- Firestore emulator runs on port 8080
- Functions emulator runs on port 5001
- Emulator UI runs on port 4000 (or 4001 if 4000 is taken)

## Screenshots and Visual Testing

We use screenshots for both visual testing and debugging:

- All screenshots are stored in the `e2e/screenshots` directory
- Tests automatically capture screenshots on failure
- Use `toHaveScreenshot()` for visual comparison testing
- Screenshots are organized into categories:
  - `auth`: Authentication-related screenshots
  - `personalization`: Personalization flow screenshots
  - `dashboard`: Dashboard-related screenshots
  - `debug`: Error screenshots and debugging images

To take a screenshot in your tests, use the screenshot helper:

```typescript
import { ScreenshotCategory, takeScreenshot } from "../pages/screenshot-helper";

// Take a screenshot with automatic timestamp and categorization
await takeScreenshot(page, "my-feature", ScreenshotCategory.AUTH);

// For error conditions, use the error screenshot helper
await takeErrorScreenshot(page, "test-name");
```

### Screenshot Cleanup

To prevent screenshot directories from growing too large over time, we have an automated cleanup script:

```bash
# Clean up screenshots, keeping the 5 most recent screenshots in each category
pnpm run screenshots:cleanup

# Clean up screenshots with a custom keep count
pnpm run screenshots:cleanup -- --keep=10
```

The cleanup script:
- Processes each category directory (`auth`, `debug`, etc.) separately
- Keeps the most recent N screenshots in each category (default: 5)
- Removes older screenshots based on modification time
- Runs automatically before each test suite via the `emulators:reset` command

This script is also run in CI/CD pipelines to keep the repository size manageable.

## Writing New Tests

1. Create or update page object models as needed
2. Create test files in the appropriate directory
3. Follow the existing patterns:
   - Use descriptive test names
   - Group related tests with `test.describe`
   - Keep tests focused on specific user flows
   - Include proper cleanup in beforeAll and afterAll hooks

## Best Practices

- Tests should be independent and runnable in isolation
- Use unique identifiers (e.g., timestamps) to prevent data collisions
- Clean up test data when possible
- Focus on testing from the user's perspective
- Keep tests simple and focused on one aspect of functionality

## Troubleshooting

If you're experiencing issues with the tests:

1. **Database issues**: Verify the Firestore emulator is running at http://localhost:8080
2. **Emulator UI**: Check the Emulator UI at http://localhost:4000 (or http://localhost:4001)