import AppLayout from "@/layouts/AppLayout";
import PublicLayout from "@/layouts/PublicLayout";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect } from "react";

import AssistantPage from "@/pages/Assistant";
import DashboardPage from "@/pages/Dashboard";
import LandingPage from "@/pages/Landing";
import SettingsPage from "@/pages/SettingsPage";

const DataUploadPage = lazy(() => import("@/pages/DataUploadPage"));
const DataAnalysisPage = lazy(() => import("@/pages/DataAnalysisPage"));

// ---- Query Client -------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

// ---- Routes -------------------------------------------------------------
const rootRoute = createRootRoute({ component: Outlet });

// Public routes (Landing page — no auth needed)
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});
const landingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: LandingPage,
});

// App routes (no auth guard — open access)
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppLayout,
});
const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});
const assistantRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/assistant",
  component: AssistantPage,
});
const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});
const uploadDataRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/upload-data",
  component: () => (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <DataUploadPage />
    </Suspense>
  ),
});
const dataAnalysisRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/data-analysis",
  component: () => (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <DataAnalysisPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([landingRoute]),
  appLayoutRoute.addChildren([
    dashboardRoute,
    uploadDataRoute,
    assistantRoute,
    dataAnalysisRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ---- App Initializer ------------------------------------------------
function AppInitializer() {
  const { loadFromStorage } = useSettingsStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  return <RouterProvider router={router} />;
}

// ---- Root Component -------------------------------------------------
export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AppInitializer />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
