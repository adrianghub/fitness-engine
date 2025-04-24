import { FloatingChallengeTimer } from "@/components/FloatingChallengeTimer";
import { Toaster } from "@/components/ui/sonner";
import { useChallengeSyncFirestore } from "@/modules/challenges/hooks/useChallengeSyncFirestore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { routeTree } from "./routeTree.gen";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({ routeTree, scrollRestoration: true });

const queryClient = new QueryClient();

function AppContent() {
  const { hasActiveChallenge, isLoading } = useChallengeSyncFirestore();

  useEffect(() => {
    if (!isLoading) {
      console.log(
        `Challenge status: ${hasActiveChallenge ? "Active" : "No active"} challenges`
      );
    }
  }, [hasActiveChallenge, isLoading]);

  return (
    <>
      <RouterProvider router={router} />
      <FloatingChallengeTimer />
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster richColors position='top-right' />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
