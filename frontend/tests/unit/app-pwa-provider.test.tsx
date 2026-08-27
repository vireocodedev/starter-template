import { Button } from "@mui/material";
import { VireoConfirmationProvider, useUnsavedChangesRegistration } from "@vireocodedev/ui";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AppPwaProvider } from "@/app/shell/providers/AppPwaProvider";
import { AppUnsavedChangesProvider } from "@/app/shell/providers/AppUnsavedChangesProvider";
import {
  resetPwaRegistrationState,
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
});
