import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { createProtectedLoader } from "../lib/protected-route";
const LeaderboardView = lazy(() =>
  import("../modules/leaderboard/Leaderboard").then((module) => ({
    default: module.Leaderboard,
  }))
);

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardView,
  loader: createProtectedLoader(),
});
