import { createProtectedLoader } from "@/lib/protected-route";
import { challengeService } from "@/modules/challenges/ChallengeService";
import { createFileRoute, redirect } from "@tanstack/react-router";
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
  loader: createProtectedLoader(async ({ params, context }) => {
    const { id } = params;
    const userId = context?.user?.uid;

    if (!userId) {
      throw redirect({
        to: "/login",
        search: {
          redirect: `/challenges/${id}`,
        },
      });
    }

    try {
      const challenge = await challengeService.getChallengeWithTemplate(
        id,
        userId
      );

      if (!challenge) {
        return { notFound: true };
      }

      return {
        challenge,
      };
    } catch (error) {
      console.error(`Error loading challenge ${id}:`, error);
      return { error: "Failed to load challenge details" };
    }
  }),
});
