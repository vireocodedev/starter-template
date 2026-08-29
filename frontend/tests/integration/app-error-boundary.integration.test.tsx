import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppErrorBoundary } from "@/app/shell/components/AppErrorBoundary";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AppErrorBoundary", () => {
  it("reports render failures, hides error details, and recovers on retry", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reportError = vi.fn();
    let shouldThrow = true;

    function UnstablePage() {
      if (shouldThrow) throw new Error("private customer record 42");
      return <p>Page recovered</p>;
    }

    render(
      <AppErrorBoundary onError={reportError} scope="route">
        <UnstablePage />
      </AppErrorBoundary>,
    );

    const heading = screen.getByRole("heading", { name: "Something went wrong" });
    expect(heading).toHaveFocus();
    expect(screen.queryByText(/private customer record/i)).not.toBeInTheDocument();
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Error),
        scope: "route",
      }),
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Page recovered")).toBeVisible();
  });

  it("catches rejected lazy modules and exposes every configured recovery action", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const goHome = vi.fn();
    const reload = vi.fn();
    const logout = vi.fn();
    const reportError = vi.fn();
    const BrokenLazyPage = React.lazy(() => Promise.reject(new Error("private chunk URL")));

    render(
      <AppErrorBoundary onError={reportError} onHome={goHome} onLogout={logout} onReload={reload} scope="root">
        <React.Suspense fallback={<p>Loading page</p>}>
          <BrokenLazyPage />
        </React.Suspense>
      </AppErrorBoundary>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("This page could not be displayed");
    expect(screen.queryByText(/private chunk URL/i)).not.toBeInTheDocument();
    expect(reportError).toHaveBeenCalledWith(expect.objectContaining({ scope: "root" }));

    fireEvent.click(screen.getByRole("button", { name: "Go home" }));
    fireEvent.click(screen.getByRole("button", { name: "Reload application" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(goHome).toHaveBeenCalledOnce();
    expect(reload).toHaveBeenCalledOnce();
    expect(logout).toHaveBeenCalledOnce();
  });
});
