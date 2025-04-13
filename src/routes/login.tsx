import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";

const LoginView = lazy(() =>
  import("../components/Login").then((module) => ({
    default: module.Login,
  }))
);

export const Route = createFileRoute("/login")({
  component: LoginView,
  beforeLoad: async () => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem("auth") === "true";

    if (isAuthenticated) {
      // Check if personalization is needed
      const hasPersonalized = localStorage.getItem("personalized") === "true";

      if (!hasPersonalized) {
        return redirect({
          to: "/personalization",
          replace: true,
        });
      }

      // If already authenticated and personalized, go to dashboard
      return redirect({
        to: "/dashboard",
        replace: true,
      });
    }

    return {};
  },
});
