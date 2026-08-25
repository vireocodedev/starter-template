import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppProviders } from "./app.providers";
import { APP_PAGE_REGISTRY, APP_PAGES, loadAppPage, type AppPageId } from "@/app/app.pages";
import { AppBootstrapFallback, AppRouteFallback } from "@/app/shell/components/AppLoadingSurface";
import { AppShellLayout } from "@/app/shell/layout/AppShellLayout";
import { AppSessionRecoveryProvider } from "@/app/shell/providers/AppSessionRecoveryProvider";
import { useAppAuth } from "./shell/hooks/useAppAuth";

const pages = Object.fromEntries(
  Object.keys(APP_PAGE_REGISTRY).map(id => [id, React.lazy(() => loadAppPage(id as AppPageId))]),
) as unknown as Record<AppPageId, React.LazyExoticComponent<React.ComponentType>>;

function AppRoutes() {
  const { user, loading } = useAppAuth();
  if (loading) return <AppBootstrapFallback />;

  const LoginPage = pages.login;
  const NotFoundPage = pages.notFound;

  return (
    <Routes>
      <Route
        path={APP_PAGES.login}
        element={
          <React.Suspense fallback={<AppBootstrapFallback />}>
            <LoginPage />
          </React.Suspense>
        }
      />
      {user ? (
        <Route element={<AppShellLayout />}>
          {Object.entries(APP_PAGE_REGISTRY)
            .filter(([id, definition]) => definition.access === "AUTHENTICATED" && id !== "notFound")
            .map(([id, definition]) => {
              const Page = pages[id as AppPageId];
              return (
                <Route
                  key={id}
                  index={id === "home"}
                  path={id === "home" ? undefined : definition.path}
                  element={
                    <React.Suspense fallback={<AppRouteFallback />}>
                      <Page />
                    </React.Suspense>
                  }
                />
              );
            })}
          <Route
            path="*"
            element={
              <React.Suspense fallback={<AppRouteFallback />}>
                <NotFoundPage />
              </React.Suspense>
            }
          />
        </Route>
      ) : null}
      <Route path="*" element={<Navigate replace to={APP_PAGES.login} />} />
    </Routes>
  );
}

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppSessionRecoveryProvider>
          <AppRoutes />
        </AppSessionRecoveryProvider>
      </BrowserRouter>
    </AppProviders>
  );
}
