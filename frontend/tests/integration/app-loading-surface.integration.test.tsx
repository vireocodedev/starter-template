import { render, screen, waitFor } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { PageOverlayControllerProvider } from "@vireocodedev/starter-ui";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AppRouteFallback } from "@/app/shell/components/AppLoadingSurface";
import { AppShellNavigationContext } from "@/app/shell/contexts/AppShellNavigationContext";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";
import { DEFAULT_APP_PREFERENCES } from "@/app/ui/preferences/models/AppPreferences";

describe("AppRouteFallback", () => {
  it("uses the real page geometry and the preferred body width for Overview", async () => {
    const view = render(
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter>
          <AppShellNavigationContext.Provider value={{ mobile: false, openNavigation: vi.fn() }}>
            <AppPreferencesContext.Provider
              value={{
                preferences: { ...DEFAULT_APP_PREFERENCES, pageWidth: "md" },
                resetPreferences: vi.fn(),
                updatePreference: vi.fn(),
              }}
            >
              <PageOverlayControllerProvider>
                <AppRouteFallback variant="overview" />
              </PageOverlayControllerProvider>
            </AppPreferencesContext.Provider>
          </AppShellNavigationContext.Provider>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(view.container.querySelector("header")).not.toBeNull();
    expect(view.container.querySelector(".MuiContainer-maxWidthMd")).not.toBeNull();
    expect(await screen.findByRole("status", { name: "Loading page" })).toBeVisible();
    await waitFor(() =>
      expect(view.container.querySelector('[data-app-route-fallback-variant="overview"]')).not.toBeNull(),
    );
  });
});
