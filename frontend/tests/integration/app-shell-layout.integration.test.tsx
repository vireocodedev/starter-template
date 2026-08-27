import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShellLayout } from "@/app/shell/layout/AppShellLayout";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";
import { DEFAULT_APP_PREFERENCES, type AppPreferences } from "@/app/ui/preferences/models/AppPreferences";
import { AppAuthContext } from "@/app/shell/contexts/AppAuthContext";

const navigationPropsSpy = vi.hoisted(() => vi.fn());
const onlineStatusSpy = vi.hoisted(() => vi.fn(() => true));

vi.mock("@vireocodedev/ui", () => ({
  useVireoOnlineStatus: onlineStatusSpy,
  VireoApplicationNavigation: ({
    children,
    mode,
    open,
    variant,
    ...props
  }: {
    children: React.ReactNode | ((state: { mode: "compact" | "expanded"; toggleMode: () => void }) => React.ReactNode);
    mode: "compact" | "expanded";
    open: boolean;
    variant: "permanent" | "temporary";
    [key: string]: unknown;
  }) => {
    navigationPropsSpy({ mode, open, variant, ...props });
    if (variant === "temporary" && !open) return null;
    const resolvedMode = variant === "temporary" ? "expanded" : mode;
    return (
      <aside>
        {typeof children === "function"
          ? children({ mode: resolvedMode, toggleMode: props.onModeChange as () => void })
          : children}
      </aside>
    );
  },
  VireoApplicationNavigationItem: ({
    icon,
    label,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }) => (
    <button onClick={onClick}>
      {icon}
      {label}
    </button>
  ),
  VireoMobileBottomNavigation: ({
    items,
    onChange,
    value,
  }: {
    items: readonly { icon: React.ReactNode; label: string; value: string }[];
    onChange: (value: string, event: React.SyntheticEvent) => void;
    value: string | false;
  }) => (
    <nav aria-label="Quick navigation">
      {items.map(item => (
        <button
          aria-current={item.value === value ? "page" : undefined}
          key={item.value}
          onClick={event => onChange(item.value, event)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  ),
  VireoPageHeader: ({
    actions,
    leading,
    title,
  }: {
    actions?: React.ReactNode;
    leading?: React.ReactNode;
    title?: React.ReactNode;
  }) => (
    <header>
      {leading}
      {title}
      {actions}
    </header>
  ),
}));

function setDesktop(desktop: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: desktop,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderShell(preferenceOverrides: Partial<AppPreferences> = {}) {
  const preferences = { ...DEFAULT_APP_PREFERENCES, ...preferenceOverrides };
  return render(
    <ThemeProvider theme={createTheme()}>
      <AppPreferencesContext.Provider value={{ preferences, updatePreference: vi.fn(), resetPreferences: vi.fn() }}>
        <AppAuthContext.Provider
          value={{
            user: { username: "admin", role: "SUPERADMIN" },
            loading: false,
            expireSession: vi.fn(),
            login: vi.fn(),
            logout: vi.fn().mockResolvedValue(undefined),
          }}
        >
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route element={<AppShellLayout />}>
                <Route index element={<AppPageHeader title="Overview" description="Page description" />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppAuthContext.Provider>
      </AppPreferencesContext.Provider>
    </ThemeProvider>,
  );
}

describe("AppShellLayout", () => {
  beforeEach(() => {
    navigationPropsSpy.mockClear();
    onlineStatusSpy.mockReturnValue(true);
  });

  it("lets unlocked desktop navigation resize independently of the overlay resize preference", async () => {
    setDesktop(true);
    renderShell({ allowSidePanelResize: false, navigationLocked: false, navigationMode: "compact" });

    expect(navigationPropsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ locked: false, resizable: true }));
    expect(screen.getByRole("button", { name: "Expand navigation" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Dev tools" })).toBeVisible();
    expect(screen.queryByText("V")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open account menu" }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());
    expect(screen.getByText("admin")).toBeVisible();
    expect(screen.getByText("SUPERADMIN")).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
  });

  it("preserves compact navigation while locked and replaces its caret with the logo", () => {
    setDesktop(true);
    renderShell({ navigationLocked: true, navigationMode: "compact" });

    expect(navigationPropsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ locked: true, resizable: false }));
    expect(screen.queryByRole("button", { name: "Expand navigation" })).not.toBeInTheDocument();
    expect(screen.getByText("V")).toBeVisible();
  });

  it("provides an explicit close action in full-screen mobile navigation", () => {
    setDesktop(false);
    renderShell();

    expect(screen.getByRole("heading", { name: "Overview" })).toBeVisible();
    expect(screen.queryByText("Page description")).not.toBeInTheDocument();
    expect(screen.queryByText("Vireo Starter")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close navigation" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("button", { name: "Close navigation" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(screen.queryByRole("button", { name: "Close navigation" })).not.toBeInTheDocument();
  });

  it("shows a calm status message without replacing page content while offline", () => {
    onlineStatusSpy.mockReturnValue(false);
    setDesktop(false);
    renderShell();

    expect(screen.getByRole("status")).toHaveTextContent("You are offline");
    expect(screen.getByRole("heading", { name: "Overview" })).toBeVisible();
  });
});
