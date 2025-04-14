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

  return (
    <>
      <Header />
      <div className='h-full flex flex-col'>
        {isLoading ? (
          <Loader />
        ) : (
          <main className='flex-grow'>
            <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
              <Suspense fallback={<Loader />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        )}
        {process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
      </div>
    </>
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
