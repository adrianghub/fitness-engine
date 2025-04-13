import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy } from "react";
import { createPersonalizedLoader } from "../../lib/protected-route";

const ChallengeDetailView = lazy(() =>
  import("../../components/ChallengeDetail").then((module) => ({
    default: module.ChallengeDetail,
  }))
);

export const Route = createFileRoute("/challenges/$id")({
  component: ChallengeDetailView,
  loader: createPersonalizedLoader(async () => {
    // TODO: Find the challenge by ID
    const challenge = null;

    if (!challenge) {
      throw notFound();
    }

    return { challenge };
  }),
});
