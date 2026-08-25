import { render, screen, within } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { PageOverlay, PageOverlayControllerProvider } from "@vireocodedev/starter-ui";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";
import { DEFAULT_APP_PREFERENCES } from "@/app/ui/preferences/models/AppPreferences";

describe("AppPageLayout", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: "",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("places a docked page overlay in the page body's drawer sibling", async () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <AppPreferencesContext.Provider
          value={{
            preferences: { ...DEFAULT_APP_PREFERENCES, desktopSurface: "dockedSidePanel" },
            updatePreference: vi.fn(),
            resetPreferences: vi.fn(),
          }}
        >
          <PageOverlayControllerProvider>
            <AppPageLayout>
              <div>Workspace</div>
              <PageOverlay open onRequestClose={vi.fn()} render={<div data-testid="docked-overlay">Editor</div>} />
            </AppPageLayout>
          </PageOverlayControllerProvider>
        </AppPreferencesContext.Provider>
      </ThemeProvider>,
    );

    const drawer = await screen.findByRole("complementary");
    expect(within(drawer).getByTestId("docked-overlay")).toBeVisible();
    expect(screen.getByText("Workspace")).toBeVisible();
  });
});
