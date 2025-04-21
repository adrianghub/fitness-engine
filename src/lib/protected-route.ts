import { getCurrentUser } from "@/lib/firebase";
import { redirect } from "@tanstack/react-router";
import { User } from "firebase/auth";

interface LoaderFunctionArgs {
  context: {
    user?: User;
  };
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

    const contextWithUser = {
      ...args,
      context: {
        ...args.context,
        user,
      },
    };

    if (originalLoader) {
      return originalLoader(contextWithUser);
    }

    return {} as T;
  };
}
