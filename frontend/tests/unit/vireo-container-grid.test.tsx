import { APP_THEME } from "@/app/ui/theme/config/theme";
import { VireoContainerGrid } from "@/app/ui/toolkit/components/layout/VireoContainerGrid";
import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("VireoContainerGrid", () => {
  it("renders a container-aware grid with numeric item spans", () => {
    render(
      <ThemeProvider theme={APP_THEME}>
        <VireoContainerGrid container columns={{ xs: 4, sm: 8 }} spacing={1}>
          <VireoContainerGrid size={{ xs: 4, sm: 4 }}>First item</VireoContainerGrid>
          <VireoContainerGrid size={{ xs: 4, sm: 4 }}>Second item</VireoContainerGrid>
        </VireoContainerGrid>
      </ThemeProvider>,
    );

    const firstItem = screen.getByText("First item");
    const layout = firstItem.parentElement;
    const containmentRoot = layout?.parentElement;

    expect(firstItem).not.toBeNull();
    expect(layout).not.toBeNull();
    expect(containmentRoot).not.toBeNull();
    expect(getComputedStyle(containmentRoot!).containerType).toBe("inline-size");
    expect(getComputedStyle(layout!).display).toBe("grid");
    expect(getComputedStyle(layout!).gap).toContain("--mui-spacing");
    expect(getComputedStyle(layout!).gridTemplateColumns).toBe("repeat(4, minmax(0, 1fr))");
    expect(getComputedStyle(firstItem).gridColumn).toBe("span 4");

    const generatedStyles = Array.from(document.styleSheets)
      .flatMap(styleSheet => Array.from(styleSheet.cssRules, rule => rule.cssText))
      .join(" ");
    expect(generatedStyles).toMatch(/@container \(min-width:\s*600px\)/);
    expect(generatedStyles).toContain("repeat(8, minmax(0, 1fr))");
  });
});
