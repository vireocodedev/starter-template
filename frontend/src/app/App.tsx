import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppProviders } from "./app.providers";
import { APP_PAGE_REGISTRY, APP_PAGES, loadAppPage, type AppPageId } from "@/app/app.pages";
import { AppBootstrapFallback, AppRouteFallback } from "@/app/shell/components/AppLoadingSurface";
import { AppErrorBoundary } from "@/app/shell/components/AppErrorBoundary";
import { AppShellLayout } from "@/app/shell/layout/AppShellLayout";
import { AppSessionRecoveryProvider } from "@/app/shell/providers/AppSessionRecoveryProvider";
import { useAppAuth } from "./shell/hooks/useAppAuth";

const lazyPages = Object.fromEntries(
  Object.entries(APP_PAGE_REGISTRY)
    .filter(([, definition]) => definition.render === "lazy")
    .map(([id]) => [id, React.lazy(() => loadAppPage(id as AppPageId))]),
) as Partial<Record<AppPageId, React.LazyExoticComponent<React.ComponentType>>>;

function AppPageRoute({ id }: { id: AppPageId }) {
  const definition = APP_PAGE_REGISTRY[id];
  if (definition.render === "eager") {
    const Page = definition.component;
    return <Page />;
  }

  const Page = lazyPages[id];
  if (!Page) throw new Error(`Missing lazy page component for ${id}`);

  return (
    <React.Suspense fallback={<AppRouteFallback loading={definition.loading} />}>
      <Page />
    </React.Suspense>
  );
}

function AppRoutes() {
  const { user, loading } = useAppAuth();
  if (loading) return <AppBootstrapFallback />;

  return (
    <Routes>
      <Route path={APP_PAGES.login} element={<AppPageRoute id="login" />} />
      {user ? (
        <Route element={<AppShellLayout />}>
          {Object.entries(APP_PAGE_REGISTRY)
            .filter(([id, definition]) => definition.access === "AUTHENTICATED" && id !== "notFound")
            .map(([id, definition]) => {
              return (
                <Route
                  key={id}
                  index={id === "home"}
                  path={id === "home" ? undefined : definition.path}
                  element={<AppPageRoute id={id as AppPageId} />}
                />
              );
            })}
          <Route path="*" element={<AppPageRoute id="notFound" />} />
        </Route>
      ) : null}
      <Route path="*" element={<Navigate replace to={APP_PAGES.login} />} />
    </Routes>
  );
}

function AppRouteErrorBoundary({ children }: React.PropsWithChildren) {
  const { logout } = useAppAuth();

  const signOut = React.useCallback(() => {
    void logout()
      .catch(() => undefined)
      .finally(() => window.location.assign(APP_PAGES.login));
  }, [logout]);

  return (
    <AppErrorBoundary onLogout={signOut} scope="route">
      {children}
    </AppErrorBoundary>
  );
}

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRouteErrorBoundary>
          <AppSessionRecoveryProvider>
            <AppRoutes />
          </AppSessionRecoveryProvider>
        </AppRouteErrorBoundary>
      </BrowserRouter>
    </AppProviders>
  );
}
