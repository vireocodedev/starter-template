import { fireEvent, render, screen, within } from "@testing-library/react";
import { Button, createTheme, ThemeProvider } from "@mui/material";
import { PageOverlay, PageOverlayControllerProvider } from "@vireocodedev/starter-ui";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
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
        <MemoryRouter>
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
        </MemoryRouter>
      </ThemeProvider>,
    );

    const drawer = await screen.findByRole("complementary");
    expect(within(drawer).getByTestId("docked-overlay")).toBeVisible();
    expect(screen.getByText("Workspace")).toBeVisible();
  });

  it("restores the page scroll position when browser history returns to a route", () => {
    function FirstPage() {
      const navigate = useNavigate();
      return (
        <AppPageLayout>
          <Button onClick={() => void navigate("/second")}>Open second page</Button>
        </AppPageLayout>
      );
    }

    function SecondPage() {
      const navigate = useNavigate();
      return (
        <AppPageLayout>
          <Button onClick={() => void navigate(-1)}>Back to first page</Button>
        </AppPageLayout>
      );
    }

    const view = render(
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter initialEntries={["/first"]}>
          <AppPreferencesContext.Provider
            value={{ preferences: DEFAULT_APP_PREFERENCES, updatePreference: vi.fn(), resetPreferences: vi.fn() }}
          >
            <PageOverlayControllerProvider>
              <Routes>
                <Route path="/first" element={<FirstPage />} />
                <Route path="/second" element={<SecondPage />} />
              </Routes>
            </PageOverlayControllerProvider>
          </AppPreferencesContext.Provider>
        </MemoryRouter>
      </ThemeProvider>,
    );

    const firstScrollRegion = view.container.querySelector<HTMLElement>("[data-app-page-scroll-region]");
    expect(firstScrollRegion).not.toBeNull();
    if (!firstScrollRegion) return;
    firstScrollRegion.scrollTop = 180;

    fireEvent.click(screen.getByRole("button", { name: "Open second page" }));
    const secondScrollRegion = view.container.querySelector<HTMLElement>("[data-app-page-scroll-region]");
    expect(secondScrollRegion?.scrollTop).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Back to first page" }));
    expect(view.container.querySelector<HTMLElement>("[data-app-page-scroll-region]")?.scrollTop).toBe(180);
  });
});
