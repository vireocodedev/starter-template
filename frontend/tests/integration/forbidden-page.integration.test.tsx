import { fireEvent, render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { PageOverlayControllerProvider } from "@vireocodedev/starter-ui";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { APP_PAGES } from "@/app/app.pages";
import { AppShellNavigationContext } from "@/app/shell/contexts/AppShellNavigationContext";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";
import { DEFAULT_APP_PREFERENCES } from "@/app/ui/preferences/models/AppPreferences";
import { AppPageForbidden } from "@/pages/forbidden/AppPageForbidden";

describe("AppPageForbidden", () => {
  it("explains the denied access and returns to the overview", () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <AppPreferencesContext.Provider
          value={{ preferences: DEFAULT_APP_PREFERENCES, updatePreference: vi.fn(), resetPreferences: vi.fn() }}
        >
          <PageOverlayControllerProvider>
            <AppShellNavigationContext.Provider value={{ mobile: false, openNavigation: vi.fn() }}>
              <MemoryRouter initialEntries={[APP_PAGES.forbidden]}>
                <Routes>
                  <Route path={APP_PAGES.home} element={<h1>Overview</h1>} />
                  <Route path={APP_PAGES.forbidden} element={<AppPageForbidden />} />
                </Routes>
              </MemoryRouter>
            </AppShellNavigationContext.Provider>
          </PageOverlayControllerProvider>
        </AppPreferencesContext.Provider>
      </ThemeProvider>,
    );

    expect(screen.getByRole("heading", { name: "Access denied" })).toBeVisible();
    expect(screen.getByText("403")).toBeVisible();
    expect(screen.getByText("Contact an administrator if you believe you should have access.")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Return to overview" }));

    expect(screen.getByRole("heading", { name: "Overview" })).toBeVisible();
  });
});
