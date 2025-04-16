# Handlers Directory

This directory contains the business logic handlers for the FitnessEngine application. The code has been organized into logical modules that handle different aspects of the application's functionality.

## Structure

- `index.ts` - Exports all handlers for easy importing
- `personalization.ts` - Handles user personalization and profile setup
- `generateChallenges.ts` - Generates user challenges based on their level
- `generateOpponents.ts` - Generates opponents and manages the leaderboard
- `promoteUser.ts` - Handles user level progression
- `refreshChallenges.ts` - Handles daily challenge refresh and penalties

## Responsibility Breakdown

### Personalization

The personalization handler is responsible for:
- Validating user personalization data
- Ensuring uniqueness of display names
- Applying personalization settings to a user profile
- Generating initial fitness goals and challenges

### Challenge Generation

The challenge generation handler is responsible for:
- Generating user-specific challenges based on level
- Always including universal challenges
- Randomly selecting level-specific challenges
- Maintaining the standard challenge distribution (1 daily + 4-5 regular + 3-4 universal)
- Using AI recommendations for regular challenges when available

### Challenge Refresh

The challenge refresh handler is responsible for:
- Processing incomplete challenges from the previous day
- Applying point penalties for incomplete challenges
- Tracking and preventing repetition of regular challenges
- Generating new daily challenges
- Coordinating with the opponent update process

### Opponent Generation

The opponent generation handler is responsible for:
- Creating opponents with appropriate difficulty based on user level
- Managing the leaderboard rankings
- Updating opponent scores daily based on the user's level

### User Promotion

The user promotion handler is responsible for:
- Checking if a user qualifies for promotion to the next level
- Promoting users to higher levels upon qualification
- Resetting user points after promotion
- Regenerating challenges and opponents for the new level