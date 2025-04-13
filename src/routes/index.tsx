import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // TODO: Check auth provider
    const isAuthenticated = localStorage.getItem("auth") === "true";

    if (!isAuthenticated) {
      return redirect({
        to: "/login",
        replace: true,
      });
    }

    // TODO: Check if user has completed personalization
    const hasPersonalized = localStorage.getItem("personalized") === "true";

    if (!hasPersonalized) {
      return redirect({
        to: "/personalization",
        replace: true,
      });
    }

    return redirect({
      to: "/dashboard",
      replace: true,
    });
  },
});
