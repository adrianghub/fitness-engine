import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { createPersonalizedLoader } from "../lib/protected-route";

const LeaderboardView = lazy(() =>
  import("../components/Leaderboard").then((module) => ({
    default: module.Leaderboard,
  }))
);

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardView,
  loader: createPersonalizedLoader(async () => {
    // TODO: Fetch leaderboard data
    return {
      rankings: [
        { id: "u1", name: "Sarah Jones", points: 1250, rank: 1 },
        { id: "current", name: "John Doe", points: 980, rank: 2 },
        { id: "u2", name: "Mike Smith", points: 870, rank: 3 },
        { id: "u3", name: "Emma Wilson", points: 820, rank: 4 },
        { id: "u4", name: "Alex Turner", points: 750, rank: 5 },
      ],
    };
  }),
});
