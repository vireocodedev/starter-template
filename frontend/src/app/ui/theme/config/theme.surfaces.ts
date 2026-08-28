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

export const APP_SURFACES_LIGHT: AppSurfacePalette = {
  canvas: "#f7f9fc",
  screen: "#ffffff",
  recessed: "#edf3f8",
  content: "#ffffff",
  control: "#f7f9fc",
  elevated: "#f4f8fc",
  chrome: "#ffffff",
  overlay: "#ffffff",
  sunken: "#edf3f8",
  base: "#ffffff",
  raised: "#f4f8fc",
};

export const APP_SURFACES_DARK: AppSurfacePalette = {
  canvas: "#07111f",
  screen: "#07111f",
  recessed: "#07111f",
  content: "#102137",
  control: "#183552",
  elevated: "#1e4164",
  chrome: "#162b45",
  overlay: "#0a1728",
  sunken: "#07111f",
  base: "#102137",
  raised: "#1e4164",
};
