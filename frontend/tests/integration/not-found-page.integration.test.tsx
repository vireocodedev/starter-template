import { fireEvent, render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { PageOverlayControllerProvider } from "@vireocodedev/ui";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { APP_PAGES } from "@/app/app.pages";
import { AppShellNavigationContext } from "@/app/shell/contexts/AppShellNavigationContext";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";
import { DEFAULT_APP_PREFERENCES } from "@/app/ui/preferences/models/AppPreferences";
import { AppPageNotFound } from "@/pages/not-found/AppPageNotFound";

describe("AppPageNotFound", () => {
  it("renders the unknown path and returns to the overview", async () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <AppPreferencesContext.Provider
          value={{ preferences: DEFAULT_APP_PREFERENCES, updatePreference: vi.fn(), resetPreferences: vi.fn() }}
        >
          <PageOverlayControllerProvider>
            <AppShellNavigationContext.Provider value={{ mobile: false, openNavigation: vi.fn() }}>
              <MemoryRouter initialEntries={["/missing-page"]}>
                <Routes>
                  <Route path={APP_PAGES.home} element={<h1>Overview</h1>} />
                  <Route path="*" element={<AppPageNotFound />} />
                </Routes>
              </MemoryRouter>
            </AppShellNavigationContext.Provider>
          </PageOverlayControllerProvider>
        </AppPreferencesContext.Provider>
      </ThemeProvider>,
    );

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeVisible();
    expect(screen.getByText("No application route matches /missing-page.")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Return to overview" }));

    expect(screen.getByRole("heading", { name: "Overview" })).toBeVisible();
  });
});
