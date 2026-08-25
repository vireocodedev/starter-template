import { render, screen, waitFor } from "@testing-library/react";
import { createTheme, Switch, ThemeProvider } from "@mui/material";
import {
  createVireoPageLayout,
  VireoPageLayoutProvider,
  VireoPreferencePanel,
  vireoPreferencePanelClasses,
  type VireoPreferenceSectionDefinition,
} from "@vireocodedev/starter-ui";
import { describe, expect, it } from "vitest";

const sections: VireoPreferenceSectionDefinition[] = [
  {
    id: "appearance",
    title: "Appearance",
    items: [
      {
        id: "theme",
        icon: <span aria-hidden>icon</span>,
        title: "Dark mode",
        description: "Use the dark workspace palette.",
        control: <Switch slotProps={{ input: { "aria-label": "Dark mode" } }} />,
      },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    items: [
      {
        id: "lock-navigation",
        icon: <span aria-hidden>icon</span>,
        title: "Lock navigation",
        description: "Keep navigation expanded.",
        control: <Switch slotProps={{ input: { "aria-label": "Lock navigation" } }} />,
      },
    ],
  },
];

function renderPanel(mode: "compact" | "regular" = "regular", search = "") {
  return render(
    <ThemeProvider theme={createTheme()}>
      <VireoPageLayoutProvider value={createVireoPageLayout(mode)}>
        <VireoPreferencePanel
          sections={sections}
          searchQuery={search}
          emptyState="No preferences found."
          defaultExpandedSectionIds={["appearance"]}
        />
      </VireoPageLayoutProvider>
    </ThemeProvider>,
  );
}

describe("settings preference panel integration", () => {
  it("keeps compact sticky section headers at the top of their existing page scroller", () => {
    renderPanel("compact");

    const header = screen.getByText("Appearance").closest(`.${vireoPreferencePanelClasses.sectionHeader}`);
    expect(header).toHaveStyle({ position: "sticky", top: "0px" });

    const switchRoot = screen.getByRole("switch", { name: "Dark mode" }).closest(".MuiSwitch-root");
    expect(switchRoot?.parentElement).toHaveStyle({ gridColumn: "2", width: "100%" });
  });

  it("opens collapsed sections while their rows match the controlled settings search", async () => {
    renderPanel("regular", "lock navigation");

    await waitFor(() => expect(screen.getByText("Lock navigation")).toBeVisible());
  });
});
