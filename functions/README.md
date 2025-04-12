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
  - `/types` - TypeScript type definitions
    - `models.ts` - Generated Firestore models (Admin SDK)
    - `challenge-template.ts` - Types for challenge templates
    - `user.ts` - Types for user-related data
  - `/data` - Static data files
    - `challenge-templates.ts` - Challenge template data
  - `/seed` - Data seeding functions
  - `/shared` - Shared utilities
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

- `dailyOpponentsUpdate` - Updates opponent scores daily based on user training frequency

## Development

### Prerequisites

- Node.js v18 or higher
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