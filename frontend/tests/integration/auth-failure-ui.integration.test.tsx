import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configureAppAuthApi, AppAuthApiOnline } from "@/app/data/network/api/app-auth.api.online";
import type { AppAuthFailure, AppAuthFailureKind } from "@/app/data/network/models/AppAuthFailure";
import { AppAuthFailureAlert } from "@/app/shell/components/AppAuthFailureAlert";
import { useAppAuth } from "@/app/shell/hooks/useAppAuth";
import { AppAuthProvider } from "@/app/shell/providers/AppAuthProvider";

const OUTCOME_MESSAGES: Record<AppAuthFailureKind, string> = {
  unauthenticated: "Sign in to continue.",
  "invalid-credentials": "The username or password is incorrect.",
  forbidden: "Your account is not allowed to access this workspace.",
  "expired-session": "Your session expired. Sign in again.",
  offline: "The sign-in service cannot be reached. Check your connection and try again.",
  server: "The sign-in service is temporarily unavailable. Try again later.",
  "malformed-response": "The sign-in service returned an unexpected response. Try again or contact support.",
  "logout-failure": "Sign out could not be completed. You are still signed in; please try again.",
};

function LogoutHarness() {
  const { loading, logout, user } = useAppAuth();
  if (loading) return <div>Loading</div>;
  return (
    <div>
      <span>{user?.username}</span>
      <button onClick={() => void logout().catch(() => undefined)}>Sign out</button>
    </div>
  );
}

afterEach(() => configureAppAuthApi(new AppAuthApiOnline()));

describe("accessible authentication failure UI", () => {
  it.each(Object.entries(OUTCOME_MESSAGES))("announces the %s outcome", (kind, message) => {
    render(<AppAuthFailureAlert failure={{ kind } as AppAuthFailure} />);

    expect(screen.getByRole("alert")).toHaveTextContent(message);
  });

  it("keeps the authenticated user and announces an explicit logout failure", async () => {
    const logout = vi.fn().mockRejectedValue(new Error("service unavailable"));
    configureAppAuthApi({
      login: vi.fn(),
      logout,
      me: vi.fn().mockResolvedValue({ username: "admin", role: "SUPERADMIN" }),
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <AppAuthProvider>
          <LogoutHarness />
        </AppAuthProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("admin")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(OUTCOME_MESSAGES["logout-failure"]);
    expect(screen.getByText("admin")).toBeVisible();
    expect(logout).toHaveBeenCalledOnce();
  });
});
