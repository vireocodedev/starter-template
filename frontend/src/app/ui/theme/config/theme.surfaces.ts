export type AppSurfacePalette = {
  /** Recessed page canvas and nested content areas. */
  sunken: string;
  /** Default content surface for cards, tables, and panels. */
  base: string;
  /** In-page elements that sit above ordinary content. */
  raised: string;
};

export const APP_SURFACES_LIGHT: AppSurfacePalette = {
  sunken: "#f9fafb",
  base: "#ffffff",
  raised: "#ffffff",
};

export const APP_SURFACES_DARK: AppSurfacePalette = {
  sunken: "#0c111d",
  base: "#101828",
  raised: "#16202e",
};
