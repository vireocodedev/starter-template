import React from "react";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { APP_THEME } from "@/app/ui/theme/config/theme";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, useColorScheme } from "@mui/material/styles";
import { VireoThemeColorMeta } from "@vireocodedev/starter-ui";

type AppThemeMode = "light" | "dark";

function AppThemeModeSynchronizer({ children, mode }: React.PropsWithChildren<{ mode: AppThemeMode }>) {
  const { mode: activeMode, setMode } = useColorScheme();

  React.useEffect(() => {
    if (activeMode !== mode) setMode(mode);
  }, [activeMode, mode, setMode]);

  return children;
}

export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const { preferences } = useAppPreferences();
  const mode: AppThemeMode = preferences.darkMode ? "dark" : "light";

  return (
    <ThemeProvider
      theme={APP_THEME}
      defaultMode={mode}
      storageManager={null}
      noSsr
      disableTransitionOnChange
      forceThemeRerender
    >
      <AppThemeModeSynchronizer mode={mode}>
        <CssBaseline />
        <VireoThemeColorMeta />
        {children}
      </AppThemeModeSynchronizer>
    </ThemeProvider>
  );
}
