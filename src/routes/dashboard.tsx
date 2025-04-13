import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { createPersonalizedLoader } from "../lib/protected-route";

const DashboardView = lazy(() =>
  import("../components/Dashboard").then((module) => ({
    default: module.Dashboard,
  }))
);

export const Route = createFileRoute("/dashboard")({
  component: DashboardView,
  loader: createPersonalizedLoader(async () => {
    // TODO: Fetch user data, challenges, etc.
    return {
      user: {
        displayName: "John Doe",
        level: "intermediate",
        fitnessGoals: ["Strength", "Weight Loss"],
      },
      userChallenges: [
        { id: "1", title: "Burpees", progress: 0.3 },
        { id: "2", title: "Push-ups", progress: 0.7 },
      ],
    };
  }),
});
