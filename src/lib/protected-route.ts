import { redirect } from "@tanstack/react-router";

interface LoaderFunctionArgs {
  context: unknown;
  location: {
    href: string;
    pathname: string;
  };
  params: Record<string, string>;
}

type LoaderFunction<T = unknown> = (args: LoaderFunctionArgs) => Promise<T> | T;

/**
 * Creates a loader function that checks if the user is authenticated
 * and redirects to the login page if not authenticated
 */
export function createProtectedLoader<T = unknown>(
  originalLoader?: LoaderFunction<T>
): LoaderFunction<T | Record<string, never>> {
  return async (args: LoaderFunctionArgs) => {
    // TODO: Check auth provider
    const isAuthenticated = localStorage.getItem("auth") === "true";

    if (!isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(args.location.pathname)}`;
      throw redirect({ to: redirectUrl });
    }

    if (originalLoader) {
      return originalLoader(args);
    }

    return {} as T;
  };
}

/**
 * Creates a loader function that checks if the user has completed the personalization step
 * and redirects to personalization if not completed
 */
export function createPersonalizedLoader<T = unknown>(
  originalLoader?: LoaderFunction<T>
): LoaderFunction<T | Record<string, never>> {
  return async (args: LoaderFunctionArgs) => {
    // TODO: First check authentication
    const isAuthenticated = localStorage.getItem("auth") === "true";

    if (!isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(args.location.pathname)}`;
      throw redirect({ to: redirectUrl });
    }

    // TODO: Then check if user has completed personalization
    const hasPersonalized = localStorage.getItem("personalized") === "true";

    if (!hasPersonalized) {
      throw redirect({
        to: "/personalization",
      });
    }

    if (originalLoader) {
      return originalLoader(args);
    }

    return {} as T;
  };
}
