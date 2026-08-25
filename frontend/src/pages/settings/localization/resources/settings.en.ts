const en = {
  header: { title: "Settings", description: "Personalize how this workspace behaves and presents data." },
  search: { placeholder: "Search settings", empty: "No preferences match “{{search}}”." },
  sections: { appearance: "Appearance", layout: "Layout", defaults: "Defaults" },
  language: {
    title: "Language",
    description: "Choose the language and regional formatting used throughout the application.",
    ENGLISH: "English",
    CROATIAN: "Hrvatski",
  },
  theme: { title: "Dark mode", description: "Use the dark workspace palette throughout the application." },
  tableDensity: {
    title: "Table density",
    description: "Choose how much vertical space responsive data tables use.",
    COMPACT: "Compact",
    COMFORTABLE: "Comfortable",
  },
  pageWidth: {
    title: "Page content width",
    description: "Constrain content for readability or let it use all available space.",
    MEDIUM: "Medium",
    LARGE: "Large",
    EXTRA_LARGE: "Extra large",
    FULL: "No maximum",
  },
  desktopSurface: {
    title: "Desktop form surface",
    description: "Choose how responsive form overlays appear on desktop.",
    DIALOG: "Dialog",
    OVERLAY: "Overlay side panel",
    DOCKED: "Docked side panel",
  },
  resizablePanels: {
    title: "Resizable panels",
    description: "Allow pointer resizing for desktop side-panel form surfaces.",
  },
  lockNavigation: {
    title: "Lock navigation",
    description: "Prevent resizing while preserving the navigation's current expanded or compact mode.",
  },
  reset: {
    title: "Reset application preferences",
    description: "Restore every local presentation preference to its original value.",
    action: "Reset preferences",
  },
} as const;
export default en;
