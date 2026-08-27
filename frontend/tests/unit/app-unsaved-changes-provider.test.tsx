import { Button } from "@mui/material";
import {
  VireoConfirmationProvider,
  useUnsavedChangesRegistration,
  useUnsavedChangesRequestDiscard,
} from "@vireocodedev/ui";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppUnsavedChangesProvider } from "@/app/shell/providers/AppUnsavedChangesProvider";

function DirtyFormClose({ onClose }: { onClose: () => void }) {
  useUnsavedChangesRegistration({ dirty: true });
  const requestClose = useUnsavedChangesRequestDiscard(onClose);

  return <Button onClick={requestClose}>Close form</Button>;
}

describe("AppUnsavedChangesProvider", () => {
  it("requires confirmation before a dirty form closes", async () => {
    const onClose = vi.fn();
    render(
      <VireoConfirmationProvider>
        <AppUnsavedChangesProvider>
          <DirtyFormClose onClose={onClose} />
        </AppUnsavedChangesProvider>
      </VireoConfirmationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close form" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Discard unsaved changes?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});
