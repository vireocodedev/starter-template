import { DEFAULT_APP_PREFERENCES } from "@/app/ui/preferences/models/AppPreferences";
import { AppPreferencesProvider } from "@/app/ui/preferences/providers/AppPreferencesProvider";
import { AppThemeProvider } from "@/app/ui/theme/AppThemeProvider";
import { useTheme } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

const PREFERENCES_STORAGE_KEY = "starter-tenplate:preferences";

function ThemeProbe() {
  const theme = useTheme();
  return (
    <output data-testid="theme" data-mode={theme.palette.mode} data-background={theme.palette.background.default} />
  );
}

describe("AppThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes the selected dark scheme through the active MUI palette", () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_APP_PREFERENCES,
        darkMode: true,
      }),
    );

    render(
      <AppPreferencesProvider>
        <AppThemeProvider>
          <ThemeProbe />
        </AppThemeProvider>
      </AppPreferencesProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveAttribute("data-mode", "dark");
    expect(screen.getByTestId("theme")).toHaveAttribute("data-background", "#0c111d");
  });
});
