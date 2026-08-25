import type { AppSurfacePalette } from "@/app/ui/theme/config/theme.surfaces";
import type { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";

type AppMotionTokens = (typeof APP_THEME_TOKENS)["motion"];

declare module "@mui/material/styles" {
  interface Palette {
    surface: AppSurfacePalette;
  }

  interface PaletteOptions {
    surface?: AppSurfacePalette;
  }

  interface Theme {
    appMotion: AppMotionTokens;
  }

  interface ThemeOptions {
    appMotion?: AppMotionTokens;
  }
}

export {};
