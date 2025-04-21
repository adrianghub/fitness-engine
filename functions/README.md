# Fitness Engine Cloud Functions

This module contains Firebase Cloud Functions for the Fitness Engine application.

## Structure

The code is organized as follows:

- `/src` - Source code
  - `/handlers` - Business logic handlers
    - `personalization.ts` - User personalization logic
    - `generateChallenges.ts` - Challenge generation logic
    - `generateOpponents.ts` - Opponent generation logic
    - `promoteUser.ts` - User level progression logic
    - `refreshChallenges.ts` - Daily challenge refresh logic
  - `/types` - TypeScript type definitions
    - `models.ts` - Generated Firestore models (Admin SDK)
    - `challenge-template.ts` - Types for challenge templates
    - `user.ts` - Types for user-related data
  - `/data` - Static data files
    - `challenge-templates.ts` - Challenge template data
  - `/seed` - Data seeding functions
  - `/shared` - Shared utilities
  - `/docs` - Documentation files
    - `points-distribution.md` - Points system documentation
    - `challenge-refresh.md` - Daily challenge refresh process
  - `index.ts` - Main entry point for all functions

## Type Safety

This project uses [TypeSync](https://github.com/kafkas/typesync) to generate type-safe Firestore models. The types are generated from a shared schema definition and are automatically kept in sync between the frontend and backend.

### Type Definitions

- `src/types/models.ts` contains the generated TypeScript types for use with the Firebase Admin SDK
- These types match the frontend types but use the Admin SDK's Firestore types
- The types are generated from the schema in `../schema-definitions/models.yml`

### Regenerating Types

To regenerate the types after schema changes:

```bash
npm run generate:types
```

## Cloud Functions

### HTTP Endpoints

- `seedChallengeTemplates` - Seeds challenge templates into the database
- `manualUserLevelUp` - Manually triggers a user level up

### Firestore Triggers

- `onUserProfileComplete` - Triggered when a user completes their profile setup

### Scheduled Functions

- `dailyChallengeAndOpponentUpdate` - Daily function (00:00 Europe/Warsaw) that:
  - Processes incomplete challenges and applies penalties
  - Generates new challenges for users
  - Updates opponent scores based on user training frequency
  - Maintains leaderboard rankings

## Challenge Expiration Logic

The challenge expiration system follows these rules:

1. When a challenge timer expires, the client calls the `checkChallengeExpirationEndpoint` function.
2. The function verifies if the challenge has indeed expired based on server time.
3. If expired, the challenge is marked as "uncompleted" and the retry count is incremented.
4. Users can retry an uncompleted challenge up to 3 times within the same day.
5. After 3 unsuccessful attempts on the same day, the user cannot retry the challenge again that day.
6. Penalties are not applied when a challenge expires during the day - instead, all incomplete challenges receive penalties during the nightly refresh at midnight.
7. All challenges (including those with remaining retries) are refreshed at midnight.

## Development

### Prerequisites

- Node.js v22 or higher
- Firebase Tools

### Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Set up environment variables
   ```bash
   cp .env.example .env
   ```

3. Run the emulator
   ```bash
   npm run serve
   ```

### Deployment

```bash
npm run deploy
```

## Documentation

Detailed documentation for various processes can be found in the `/docs` directory:
- `points-distribution.md` - Details about the points system
- `challenge-refresh.md` - Daily challenge refresh process and penalties