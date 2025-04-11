# Handlers Directory

This directory contains the business logic handlers for the FitnessEngine application. The code has been organized into logical modules that handle different aspects of the application's functionality.

## Structure

- `index.ts` - Exports all handlers for easy importing
- `personalization.ts` - Handles user personalization and profile setup
- `generateChallenges.ts` - Generates user challenges based on their level
- `generateOpponents.ts` - Generates opponents and manages the leaderboard
- `promoteUser.ts` - Handles user level progression

## Responsibility Breakdown

### Personalization

The personalization handler is responsible for:
- Validating user personalization data
- Ensuring uniqueness of display names
- Applying personalization settings to a user profile

### Challenge Generation

The challenge generation handler is responsible for:
- Generating user-specific challenges based on level
- Always including universal challenges
- Randomly selecting level-specific challenges
- Avoiding repetition of challenges from previous days

### Opponent Generation

The opponent generation handler is responsible for:
- Creating opponents with appropriate difficulty based on user level
- Managing the leaderboard rankings
- Updating opponent scores based on training frequency
- Determining when opponents should be regenerated

### User Promotion

The user promotion handler is responsible for:
- Checking if a user qualifies for promotion to the next level
- Promoting users to higher levels upon qualification
- Resetting user points after promotion
- Regenerating challenges and opponents for the new level

## Usage

All handlers are exported from the `index.ts` file and can be imported as follows:

```typescript
import {
  applyPersonalization,
  generateUserChallenges,
  generateUserOpponents,
  promoteUser,
  // etc.
} from "./handlers";
```