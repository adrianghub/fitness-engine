import {
  createRootRoute,
  ErrorComponent,
  Outlet,
} from "@tanstack/react-router";
import { Suspense } from "react";

function RootLayout() {
  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-grow'>
        <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <Suspense fallback={<div>Ładowanie...</div>}>
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
