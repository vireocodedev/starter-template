export type AppSurfacePalette = {
  /** Recessed page canvas and nested content areas. */
  sunken: string;
  /** Default content surface for cards, tables, and panels. */
  base: string;
  /** In-page elements that sit above ordinary content. */
  raised: string;
};

export const APP_SURFACES_LIGHT: AppSurfacePalette = {
  sunken: "#eff1ec",
  base: "#fafbf7",
  raised: "#ffffff",
};

export const APP_SURFACES_DARK: AppSurfacePalette = {
  sunken: "#0d100e",
  base: "#151916",
  raised: "#1d231e",
};
