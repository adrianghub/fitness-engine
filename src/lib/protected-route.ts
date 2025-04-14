import { getCurrentUser } from "@/lib/firebase";
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
    const user = await getCurrentUser();

    if (!user) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(args.location.pathname)}`;
      throw redirect({ to: redirectUrl });
    }

    if (originalLoader) {
      return originalLoader(args);
    }

    return {} as T;
  };
}
