import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppProviders } from "./app.providers";
import { APP_PAGE_REGISTRY, APP_PAGES, type AppPageId } from "@/app/app.pages";
import { AppShellLayout } from "@/app/shell/layout/AppShellLayout";
import { AppSessionRecoveryProvider } from "@/app/shell/providers/AppSessionRecoveryProvider";
import { useAppAuth } from "./shell/hooks/useAppAuth";

const pages = Object.fromEntries(
  Object.entries(APP_PAGE_REGISTRY).map(([id, definition]) => [id, React.lazy(definition.load)]),
) as unknown as Record<AppPageId, React.LazyExoticComponent<React.ComponentType>>;

function LoadingPage() {
  return (
    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", minHeight: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}

function AppRoutes() {
  const { user, loading } = useAppAuth();
  if (loading) return <LoadingPage />;

  const LoginPage = pages.login;
  const NotFoundPage = pages.notFound;

  return (
    <React.Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path={APP_PAGES.login} element={<LoginPage />} />
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
                    element={<Page />}
                  />
                );
              })}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        ) : null}
        <Route path="*" element={<Navigate replace to={APP_PAGES.login} />} />
      </Routes>
    </React.Suspense>
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
