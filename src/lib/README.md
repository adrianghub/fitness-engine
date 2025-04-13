# FitnessEngine Router Implementation

This directory contains the routing implementation for the FitnessEngine application using TanStack Router v1.

## Router Structure

The routing is implemented in the `src/routes` directory with the following structure:

- `__root.tsx` - The root layout that wraps all routes
- `index.tsx` - The index route (redirects to login or dashboard)
- `login.tsx` - The login page
- `personalization.tsx` - User personalization page for first-time setup
- `dashboard.tsx` - Main application dashboard
- `challenge.$id.tsx` - Challenge details page with dynamic parameters
- `leaderboard.tsx` - User rankings/leaderboard

The route tree is defined in `src/routeTree.gen.ts`.

## Route Protection

Routes are protected using two utility functions in `src/lib/protected-route.ts`:

1. `createProtectedLoader` - Ensures user is authenticated
2. `createPersonalizedLoader` - Ensures user is authenticated and has completed personalization

## Lazy Loading

All components are lazy loaded to optimize the initial bundle size and improve performance.