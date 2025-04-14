import { useAuth } from "@/useAuth";
import {
  createRootRoute,
  ErrorComponent,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { Suspense, useEffect } from "react";

function RootLayout() {
  const navigate = useNavigate();
  const { userData, isLoading, currentUser } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const currentPath = window.location.pathname;
    const isPersonalizationPage = currentPath === "/personalization";
    const isLoginPage = currentPath === "/login";
    const isRootPage = currentPath === "/";

    if (!currentUser) {
      if (!isLoginPage) {
        navigate({ to: "/login", search: { redirect: "/dashboard" } });
      }
      return;
    }

    if (userData === null) return;

    if (!userData.isProfileComplete) {
      if (!isPersonalizationPage) {
        navigate({ to: "/personalization", search: {} });
      }
      return;
    }

    if (isRootPage || isPersonalizationPage) {
      navigate({ to: "/dashboard", search: {} });
    }
  }, [userData, navigate, isLoading, currentUser]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-grow'>
        <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <Suspense
            fallback={
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
      {process.env.NODE_ENV === "development" && (
        <div className='fixed bottom-4 right-4 p-2 bg-black bg-opacity-50 text-white text-xs rounded'>
          Dev Mode
        </div>
      )}
    </div>
  );
}

function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <h1 className='text-2xl font-bold text-red-500 mb-4'>
        Coś poszło nie tak!
      </h1>
      <ErrorComponent error={error} />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorBoundary,
});
