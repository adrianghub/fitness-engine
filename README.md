# FitnessEngine

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
FitnessEngine is a progressive web application (PWA) designed to boost motivation and promote consistency in fitness training. The app offers users personalized workout challenges tailored to their experience level, opportunities to compete against fictional opponents, and clear progress tracking. It addresses common issues such as the lack of personalized training plans, insufficient competitive elements, and unclear progress monitoring.

## Tech Stack
- **Frontend:** Vite, React 19, TypeScript 5, Tailwind CSS, Shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Functions)
  - Authentication via Google Auth using Firebase Auth
  - Data storage with Firestore for user profiles, challenges, and leaderboards
  - Serverless functions (Firebase Functions) for API endpoints and scheduled tasks
- **Type Safety:** TypeSync for generating type-safe Firestore models
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions
- **Optional Integrations:** GenkitAI for personalized challenges and enhanced PWA capabilities - https://firebase.google.com/docs/genkit

## Project Structure
```
fitness-engine/
├── src/                    # Frontend application code
│   ├── types/             # TypeScript type definitions
│   │   └── models.ts      # Generated Firestore models for client SDK
│   ├── components/        # React components
│   ├── routes/           # Application routes
│   └── ...
├── functions/             # Firebase Cloud Functions
│   ├── src/
│   │   ├── types/        # TypeScript type definitions
│   │   │   └── models.ts # Generated Firestore models for Admin SDK
│   │   └── ...
└── ...
```

## Getting Started Locally
1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd fitness-engine
   ```
2. **Set the Node.js version:**
   Use the Node.js version specified in the `.nvmrc` file:
   ```sh
   nvm use
   ```
3. **Install dependencies:**
   Using pnpm (preferred):
   ```sh
   pnpm install
   ```
4. **Run the development server:**
   Using pnpm:
   ```sh
   pnpm run dev
   ```

## Available Scripts
- `dev`: Starts the Vite development server.
- `build`: Builds the project for production (runs TypeScript compilation and bundles with Vite).
- `lint`: Runs ESLint for code quality checks.
- `preview`: Previews the production build.
- `generate:types`: Regenerates TypeScript types for Firestore models using [TypeSync](https://github.com/kafkas/typesync).

## Project Scope
### In Scope (MVP)
- **User Authentication:** Google authentication via Firebase and initial data collection (experience level, fitness goals, availability, workout frequency).
- **Personalization:** Customized workout challenges based on the user's chosen level (beginner, intermediate, advanced).
- **Workout Challenges:**
  - 25 pre-defined challenges per level.
  - Daily refreshed challenge with a designated "Challenge of the Day".
  - Challenge status management (not started, in progress, completed).
- **Progress Tracking:** Recording progress and awarding points for completed challenges.
- **Competition:** Simulated competitive element with fictional opponents and dynamic leaderboard updates.
- **Daily Refresh:** Scheduled daily updates for challenges and leaderboard to maintain engagement.

### Out of Scope (for MVP)
- Advanced social features or community interactions.
- User-created custom challenges.
- Integration with external fitness applications.
- Detailed statistics and advanced analytics.
- Push notifications and an administrative panel.

## Project Status
This project is currently in the MVP stage with core functionalities implemented.

## License
This project is licensed under the MIT License.