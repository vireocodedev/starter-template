import { Button } from "@mui/material";
import { VireoConfirmationProvider, useUnsavedChangesRegistration } from "@vireocodedev/ui";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { APP_PWA_UPDATE_DISCOVERY_INTERVAL_MS, AppPwaProvider } from "@/app/shell/providers/AppPwaProvider";
import { AppUnsavedChangesProvider } from "@/app/shell/providers/AppUnsavedChangesProvider";
import {
  resetPwaRegistrationState,
  registrationUpdateMock,
  setPwaRegistrationState,
  updateServiceWorkerMock,
} from "../mocks/pwa-register-react";

function DirtyRegistration() {
  useUnsavedChangesRegistration({ dirty: true });
  return null;
}

function renderProvider({ dirty = false }: { dirty?: boolean } = {}) {
  return render(
    <VireoConfirmationProvider>
      <AppUnsavedChangesProvider>
        <AppPwaProvider>
          {dirty && <DirtyRegistration />}
          <Button>Application content</Button>
        </AppPwaProvider>
      </AppUnsavedChangesProvider>
    </VireoConfirmationProvider>,
  );
}

describe("AppPwaProvider", () => {
  beforeEach(() => {
    resetPwaRegistrationState();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("lets the user apply a ready update", async () => {
    setPwaRegistrationState({ needRefresh: true });
    renderProvider();

    expect(screen.getByText("A new version is ready.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => expect(updateServiceWorkerMock).toHaveBeenCalledWith(true));
  });

  it("requires confirmation before an update can discard dirty state", async () => {
    setPwaRegistrationState({ needRefresh: true });
    renderProvider({ dirty: true });

    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(updateServiceWorkerMock).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Discard unsaved changes?" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    await waitFor(() => expect(updateServiceWorkerMock).toHaveBeenCalledWith(true));
  });

  it("reports registration diagnostics without exposing the browser error", () => {
    setPwaRegistrationState({ registrationError: new Error("registration diagnostic") });
    renderProvider();

    expect(
      screen.getByText("Offline support could not be enabled. Reload the page or contact support if this persists."),
    ).toBeVisible();
    expect(screen.queryByText("registration diagnostic")).not.toBeInTheDocument();
  });

  it("contains update activation failures instead of leaving a rejected promise", async () => {
    setPwaRegistrationState({ needRefresh: true });
    updateServiceWorkerMock.mockRejectedValueOnce(new Error("activation diagnostic"));
    renderProvider();

    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() =>
      expect(
        screen.getByText("The update could not be applied. Keep working, then reload when it is safe."),
      ).toBeVisible(),
    );
  });

  it("checks a registered worker for updates hourly and cleans up on unmount", async () => {
    vi.useFakeTimers();
    setPwaRegistrationState({
      registration: { update: registrationUpdateMock } as unknown as ServiceWorkerRegistration,
    });
    const { unmount } = renderProvider();

    await act(async () => undefined);
    act(() => vi.advanceTimersByTime(APP_PWA_UPDATE_DISCOVERY_INTERVAL_MS));
    expect(registrationUpdateMock).toHaveBeenCalledTimes(1);

    unmount();
    act(() => vi.advanceTimersByTime(APP_PWA_UPDATE_DISCOVERY_INTERVAL_MS));
    expect(registrationUpdateMock).toHaveBeenCalledTimes(1);
  });

  it("reports a failed hourly update discovery without an unhandled rejection", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    registrationUpdateMock.mockRejectedValueOnce(new Error("update discovery diagnostic"));
    setPwaRegistrationState({
      registration: { update: registrationUpdateMock } as unknown as ServiceWorkerRegistration,
    });
    renderProvider();

    await act(async () => undefined);
    await act(async () => vi.advanceTimersByTimeAsync(APP_PWA_UPDATE_DISCOVERY_INTERVAL_MS));
    expect(
      screen.getByText("The update could not be applied. Keep working, then reload when it is safe."),
    ).toBeVisible();
  });
});
