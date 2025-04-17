import { Header } from "@/components/Header";
import { Loader } from "@/components/Loader";
import { useAuth } from "@/useAuth";
import {
  createRootRoute,
  ErrorComponent,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Suspense, useEffect, useState } from "react";

function RootLayout() {
  const navigate = useNavigate();
  const { userData, isLoading, currentUser } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const currentPath = window.location.pathname;
    const isPersonalizationPage = currentPath === "/personalization";
    const isRootPage = currentPath === "/";

    if (userData === null) return;

    if (!userData.isProfileComplete) {
      if (!isPersonalizationPage) {
        setIsNavigating(true);
        navigate({ to: "/personalization", search: {} }).finally(() => {
          setIsNavigating(false);
        });
      }
      return;
    }

    if (isRootPage || isPersonalizationPage) {
      setIsNavigating(true);
      navigate({ to: "/dashboard", search: {} }).finally(() => {
        setIsNavigating(false);
      });
    }
  }, [userData, navigate, isLoading, currentUser]);

  return (
    <>
      <div className='min-h-screen flex flex-col bg-gradient-to-br from-secondary/80 to-primary/80'>
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <Header />

          {isLoading || isNavigating ? (
            <Loader />
          ) : (
            <main className='flex-1'>
              <Suspense fallback={<Loader />}>
                <Outlet />
              </Suspense>
            </main>
          )}
          {process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
        </div>
      </div>
    </>
  );
}

function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className='h-screen flex flex-col bg-gradient-to-br from-secondary/50 to-primary/50'>
      <Header />
      <main className='flex-1 flex items-center justify-center'>
        <div className='max-w-xl w-full mx-auto px-4'>
          <div className='bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-6'>
            <h1 className='text-2xl font-bold text-red-500 mb-4'>
              Coś poszło nie tak!
            </h1>
            <ErrorComponent error={error} />
          </div>
        </div>
      </main>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorBoundary,
});
