import type { AppSurfacePalette } from "@/app/ui/theme/config/theme.surfaces";

declare module "@mui/material/styles" {
  interface Palette {
    surface: AppSurfacePalette;
  }

  interface PaletteOptions {
    surface?: AppSurfacePalette;
  }
}

export {};
