import { createProtectedLoader } from "@/lib/protected-route";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy } from "react";

const ChallengeDetailView = lazy(() =>
  import("../../modules/challenges/components/ChallengeDetails").then(
    (module) => ({
      default: module.ChallengeDetails,
    })
  )
);

export const Route = createFileRoute("/challenges/$id")({
  component: ChallengeDetailView,
  loader: createProtectedLoader(async () => {
    // TODO: Find the challenge by ID
    const challenge = null;

    if (!challenge) {
      throw notFound();
    }

    return { challenge };
  }),
});
