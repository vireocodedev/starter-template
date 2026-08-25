import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appSessionExpiry } from "@/app/data/network/services/appSessionExpiry";
import { AppSessionRecoveryProvider } from "@/app/shell/providers/AppSessionRecoveryProvider";
import { AppAuthContext } from "@/app/shell/contexts/AppAuthContext";

function LoginRoute() {
  const location = useLocation();
  return <div>Login destination: {String((location.state as { from?: string } | null)?.from)}</div>;
}

describe("application session recovery", () => {
  beforeEach(() => appSessionExpiry.reset());

  it("clears authenticated state and redirects to login with the interrupted location", async () => {
    const expireSession = vi.fn();

    render(
      <AppAuthContext.Provider
        value={{
          user: { username: "admin", role: "SUPERADMIN" },
          loading: false,
          expireSession,
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter initialEntries={["/items?search=active"]}>
          <AppSessionRecoveryProvider>
            <Routes>
              <Route path="/items" element={<div>Items</div>} />
              <Route path="/login" element={<LoginRoute />} />
            </Routes>
          </AppSessionRecoveryProvider>
        </MemoryRouter>
      </AppAuthContext.Provider>,
    );

    act(() => {
      appSessionExpiry.notifySessionExpired();
    });

    expect(await screen.findByText("Login destination: /items?search=active")).toBeVisible();
    expect(expireSession).toHaveBeenCalledOnce();
  });
});
