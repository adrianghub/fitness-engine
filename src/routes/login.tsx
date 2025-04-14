import { getCurrentUser } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import { LoginForm } from "@/modules/login/LoginForm";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";

const LoginView = lazy(async () => {
  return {
    default: () => (
      <div className='flex justify-center items-center min-h-[80vh]'>
        <LoginForm />
      </div>
    ),
  };
});

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: search.redirect as string | undefined,
    };
  },
  component: LoginView,
  beforeLoad: async ({ search }) => {
    try {
      const currentUser = await getCurrentUser();

      if (currentUser) {
        throw redirect({
          to: search.redirect || "/dashboard",
          replace: true,
        });
      }

      return {};
    } catch (error) {
      if (error instanceof Error && error.name === "RedirectError") {
        throw error;
      }
      logger.warn("Login", "Error checking current user:", error);
      return {};
    }
  },
});
