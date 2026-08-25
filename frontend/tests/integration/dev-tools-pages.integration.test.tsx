import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { PageOverlayControllerProvider, VireoConfirmationProvider } from "@vireocodedev/starter-ui";
import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { APP_PAGES } from "@/app/app.pages";
import { AppShellNavigationContext } from "@/app/shell/contexts/AppShellNavigationContext";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";
import { DEFAULT_APP_PREFERENCES } from "@/app/ui/preferences/models/AppPreferences";
import { AppUnsavedChangesProvider } from "@/app/shell/providers/AppUnsavedChangesProvider";
import { AppPageDevTools } from "@/pages/dev-tools/AppPageDevTools";
import { AppPageForbidden } from "@/pages/forbidden/AppPageForbidden";
import { AppPageNotFound } from "@/pages/not-found/AppPageNotFound";
import { AppPageBasicPage } from "@/pages/dev-tools/page-examples/basic-page/AppPageBasicPage";
import { AppPageBasicFormPage } from "@/pages/dev-tools/page-examples/basic-form-page/AppPageBasicFormPage";
import { AppPageMultiStepFormPage } from "@/pages/dev-tools/page-examples/multi-step-form-page/AppPageMultiStepFormPage";
import { AppPageRelatedRecordCreation } from "@/pages/dev-tools/page-examples/related-record-creation/AppPageRelatedRecordCreation";

function renderDevTools(initialPath: string = APP_PAGES.devTools) {
  return render(
    <ThemeProvider theme={createTheme()}>
      <AppPreferencesContext.Provider
        value={{ preferences: DEFAULT_APP_PREFERENCES, updatePreference: vi.fn(), resetPreferences: vi.fn() }}
      >
        <VireoTemporalLocalizationProvider locale="en">
          <VireoConfirmationProvider>
            <AppUnsavedChangesProvider>
              <PageOverlayControllerProvider>
                <AppShellNavigationContext.Provider value={{ mobile: false, openNavigation: vi.fn() }}>
                  <MemoryRouter initialEntries={[initialPath]}>
                    <Routes>
                      <Route path={APP_PAGES.devTools} element={<AppPageDevTools />} />
                      <Route path={APP_PAGES.devToolsBasicPage} element={<AppPageBasicPage />} />
                      <Route path={APP_PAGES.devToolsBasicFormPage} element={<AppPageBasicFormPage />} />
                      <Route path={APP_PAGES.devToolsMultiStepFormPage} element={<AppPageMultiStepFormPage />} />
                      <Route
                        path={APP_PAGES.devToolsRelatedRecordCreation}
                        element={<AppPageRelatedRecordCreation />}
                      />
                      <Route path={APP_PAGES.forbidden} element={<AppPageForbidden />} />
                      <Route path="*" element={<AppPageNotFound />} />
                    </Routes>
                  </MemoryRouter>
                </AppShellNavigationContext.Provider>
              </PageOverlayControllerProvider>
            </AppUnsavedChangesProvider>
          </VireoConfirmationProvider>
        </VireoTemporalLocalizationProvider>
      </AppPreferencesContext.Provider>
    </ThemeProvider>,
  );
}

describe("Dev tools pages", () => {
  it("opens the basic page from the example directory", () => {
    renderDevTools();

    expect(screen.getByRole("heading", { name: "Dev tools" })).toBeVisible();
    fireEvent.click(screen.getByRole("link", { name: "Open Basic page" }));
    expect(screen.getByRole("heading", { name: "Basic page" })).toBeVisible();
    expect(screen.getByText("Simple page content")).toBeVisible();
  });

  it.each([
    ["Open Forbidden page", "Access denied"],
    ["Open Not found page", "Page not found"],
  ])("opens the error page from %s", (linkName, heading) => {
    renderDevTools();

    fireEvent.click(screen.getByRole("link", { name: linkName }));

    expect(screen.getByRole("heading", { name: heading })).toBeVisible();
  });

  it("opens the validated form example and reports whole-form validation errors", async () => {
    renderDevTools();

    fireEvent.click(screen.getByRole("link", { name: "Open Basic form page" }));
    expect(screen.getByRole("heading", { name: "Basic form page" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));

    expect(await screen.findByText("Enter at least three characters.")).toBeVisible();
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(screen.getByText("Choose a department.")).toBeVisible();
    expect(screen.getByText("Choose at least one environment.")).toBeVisible();
    expect(screen.getByText("Describe the project in at least 20 characters.")).toBeVisible();
    expect(screen.getByText("Confirm that the example data may be submitted.")).toBeVisible();
  });

  it("returns to Dev tools from the standard page-header back action", () => {
    renderDevTools(APP_PAGES.devToolsBasicPage);

    fireEvent.click(screen.getByRole("button", { name: "Back to Dev tools" }));
    expect(screen.getByRole("heading", { name: "Dev tools" })).toBeVisible();
  });

  it("validates and advances through the multi-step form", async () => {
    renderDevTools();

    fireEvent.click(screen.getByRole("link", { name: "Open Multi-step form page" }));
    expect(screen.getByRole("heading", { name: "Multi-step form page" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Workspace details", level: 2 })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect((await screen.findAllByText("Enter at least three characters.")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Enter a valid owner email.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Choose a workspace type.").length).toBeGreaterThan(0);

    const workspaceName = screen.getByRole("textbox", { name: "Workspace name" });
    fireEvent.change(workspaceName, { target: { value: "a" } });
    fireEvent.change(workspaceName, { target: { value: "ab" } });
    fireEvent.change(workspaceName, { target: { value: "abc" } });
    fireEvent.change(workspaceName, { target: { value: "Northstar workspace" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Owner email" }), {
      target: { value: "owner@northstar.example" },
    });
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Workspace type" }));
    fireEvent.click(await screen.findByRole("option", { name: "Product team" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByRole("heading", { name: "Workspace preferences", level: 2 })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByRole("heading", { name: "Review workspace", level: 2 })).toBeVisible();
    expect(screen.getByText("Northstar workspace")).toBeVisible();
    const confirmation = screen.getByRole("checkbox", {
      name: "I reviewed these workspace details and they are correct.",
    });
    fireEvent.click(confirmation);
    fireEvent.blur(confirmation);
    await waitFor(() => expect(confirmation).toBeChecked());
    expect(screen.getByText("Confirmed")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Create workspace" }));

    expect(await screen.findByText("Workspace “Northstar workspace” was submitted successfully.")).toBeVisible();
  });

  it("creates a missing Buyer and returns it to the preserved Invoice form", async () => {
    renderDevTools();

    fireEvent.click(screen.getByRole("link", { name: "Open Related record creation" }));
    expect(screen.getByRole("heading", { name: "Related record creation" })).toBeVisible();

    const invoiceNumber = screen.getByRole("textbox", { name: "Invoice number" });
    fireEvent.change(invoiceNumber, { target: { value: "INV-PRESERVED" } });

    const buyer = screen.getByRole("combobox", { name: "Buyer" });
    fireEvent.mouseDown(buyer);
    fireEvent.focus(buyer);
    fireEvent.click(buyer);
    fireEvent.change(buyer, { target: { value: "Atlas Studio" } });
    fireEvent.click(await screen.findByRole("button", { name: "Create “Atlas Studio”" }));

    expect(screen.getByRole("heading", { name: "Create buyer" })).toBeVisible();
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Buyer name" })).toHaveValue("Atlas Studio"));

    fireEvent.change(screen.getByRole("textbox", { name: "Billing email" }), {
      target: { value: "billing@atlas.example" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "City" }), { target: { value: "Zagreb" } });
    fireEvent.click(screen.getByRole("button", { name: "Create buyer" }));

    expect(await screen.findByRole("heading", { name: "Related record creation" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Buyer" })).toHaveValue("Atlas Studio");
    expect(screen.getByRole("textbox", { name: "Invoice number" })).toHaveValue("INV-PRESERVED");
  });
});
