import { fireEvent, render, screen } from "@testing-library/react";
import { AddRounded } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material";
import { VireoPageLayoutProvider, createVireoPageLayout } from "@vireocodedev/ui";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AppShellNavigationContext } from "@/app/shell/contexts/AppShellNavigationContext";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";

function renderHeader({ mobile, openNavigation = vi.fn() }: { mobile: boolean; openNavigation?: () => void }) {
  const onPrimaryAction = vi.fn();
  render(
    <ThemeProvider theme={createTheme()}>
      <VireoPageLayoutProvider value={createVireoPageLayout(mobile ? "compact" : "regular")}>
        <AppShellNavigationContext.Provider value={{ mobile, openNavigation }}>
          <MemoryRouter>
            <AppPageHeader
              title="Items"
              description="Manage workspace items."
              primaryAction={{ icon: <AddRounded />, label: "Create item", onClick: onPrimaryAction }}
            />
          </MemoryRouter>
        </AppShellNavigationContext.Provider>
      </VireoPageLayoutProvider>
    </ThemeProvider>,
  );
  return { onPrimaryAction };
}

describe("AppPageHeader", () => {
  it("renders one compact mobile app bar with navigation and an icon-only primary action", () => {
    const openNavigation = vi.fn();
    const { onPrimaryAction } = renderHeader({ mobile: true, openNavigation });
    const header = screen.getByRole("banner");

    expect(header).toHaveStyle({ height: "65px", maxHeight: "65px", minHeight: "65px" });
    expect(screen.getByRole("heading", { name: "Items" })).toBeVisible();
    expect(screen.queryByText("Manage workspace items.")).not.toBeInTheDocument();
    expect(screen.queryByText("Create item")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.click(screen.getByRole("button", { name: "Create item" }));
    expect(openNavigation).toHaveBeenCalledOnce();
    expect(onPrimaryAction).toHaveBeenCalledOnce();
  });

  it("keeps the description and labeled primary action on desktop", () => {
    const { onPrimaryAction } = renderHeader({ mobile: false });
    const header = screen.getByRole("banner");

    expect(header).toHaveStyle({ height: "81px", maxHeight: "81px", minHeight: "81px" });
    expect(screen.queryByRole("button", { name: "Open navigation" })).not.toBeInTheDocument();
    expect(screen.getByText("Manage workspace items.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Create item" }));
    expect(screen.getByText("Create item")).toBeVisible();
    expect(onPrimaryAction).toHaveBeenCalledOnce();
  });
});
