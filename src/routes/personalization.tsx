import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import { createProtectedLoader } from "../lib/protected-route";

const PersonalizationView = lazy(() =>
  import("../components/Personalization").then((module) => ({
    default: module.Personalization,
  }))
);

export const Route = createFileRoute("/personalization")({
  component: PersonalizationView,
  loader: createProtectedLoader(async () => {
    // TODO: Check if user has already completed personalization
    const hasPersonalized = localStorage.getItem("personalized") === "true";

    if (hasPersonalized) {
      throw redirect({
        to: "/dashboard",
        replace: true,
      });
    }

    return {};
  }),
});
