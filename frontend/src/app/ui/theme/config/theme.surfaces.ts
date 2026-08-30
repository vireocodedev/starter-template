export type AppSurfacePalette = {
  /** Full-page application environment. */
  canvas: string;
  /** Continuous compact-screen surface. Unlike `canvas`, this is application content rather than an environment. */
  screen: string;
  /** Recessed groups that separate controls or secondary content from their parent. */
  recessed: string;
  /** Primary working surface for panels, tables, and ordinary cards. */
  content: string;
  /** Interactive field surface. Controls must not sit directly on the same visual role. */
  control: string;
  /** Nested content that sits above an ordinary working surface. */
  elevated: string;
  /** Persistent application chrome such as headers and navigation bars. */
  chrome: string;
  /** Temporary elevated shells such as dialogs, drawers, and side panels. */
  overlay: string;
  /** @deprecated Use `recessed`; retained for Vireo package compatibility. */
  sunken: string;
  /** @deprecated Use `content`; retained for Vireo package compatibility. */
  base: string;
  /** @deprecated Use `elevated`; retained for Vireo package compatibility. */
  raised: string;
};

// Semantic roles intentionally share a small neutral ramp. Components keep
// meaningful role names without turning every structural layer into a new hue.
export const APP_SURFACES_LIGHT: AppSurfacePalette = {
  canvas: "#f6f7f9",
  screen: "#ffffff",
  recessed: "#f0f2f4",
  content: "#ffffff",
  control: "#f6f7f9",
  elevated: "#f0f2f4",
  chrome: "#ffffff",
  overlay: "#ffffff",
  sunken: "#f0f2f4",
  base: "#ffffff",
  raised: "#f0f2f4",
};

export const APP_SURFACES_DARK: AppSurfacePalette = {
  canvas: "#0b0c0e",
  screen: "#111315",
  recessed: "#0b0c0e",
  content: "#111315",
  control: "#181a1e",
  elevated: "#1a1c20",
  chrome: "#1a1c20",
  overlay: "#111315",
  sunken: "#0b0c0e",
  base: "#111315",
  raised: "#1a1c20",
};
