import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from "@tanstack/react-router";
import {
  render as rtlRender,
  type RenderOptions,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { ReactElement, ReactNode } from "react";
import { routeTree } from "../../routeTree.gen";

interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

// Create a custom render function that includes router and query client
function createWrapper({
  queryClient = new QueryClient(),
}: { queryClient?: QueryClient } = {}) {
  return function AllProviders({ children }: AllProvidersProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme='light' enableSystem={false}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    );
  };
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

function render(
  ui: ReactElement,
  { queryClient = new QueryClient(), ...options }: CustomRenderOptions = {}
) {
  const AllProviders = createWrapper({ queryClient });
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: AllProviders, ...options }),
  };
}

interface CustomRouterRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  initialPath?: string;
  context?: Record<string, unknown>;
}

// Custom render with router provider
function renderWithRouter(
  initialPath: string = "/",
  {
    queryClient = new QueryClient(),
    context = {},
    ...options
  }: CustomRouterRenderOptions = {}
) {
  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
    context,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return {
    user: userEvent.setup(),
    router,
    ...rtlRender(<RouterProvider router={router} />, {
      wrapper: createWrapper({ queryClient }),
      ...options,
    }),
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
export { render, renderWithRouter };
