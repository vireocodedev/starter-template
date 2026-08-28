const en = {
  header: {
    title: "Overview",
    description: "A live operational view of the inventory workflow included in this template.",
  },
  title: "Keep field operations supplied and moving.",
  introduction:
    "Track active inventory, spot low-stock lines and move directly into the complete Item workflow. Every figure below comes from the live API.",
  status: {
    live: "Live snapshot",
    api: "API connected",
    offline: "Offline-ready shell",
  },
  actions: { openInventory: "Open inventory", retry: "Retry" },
  metrics: {
    units: "Units on hand",
    active: "Active lines",
    attention: "Need attention",
    draft: "Draft plans",
  },
  health: {
    title: "Inventory health",
    description: "Status mix across {{count}} inventory lines.",
    active: "Active",
    draft: "Draft",
    archived: "Archived",
  },
  attention: {
    title: "Operations queue",
    description: "Low stock and draft lines to review next.",
    units: "{{count}} units",
    clear: "No inventory lines need attention.",
    emptyInventory: "No inventory yet. Open inventory to create the first line.",
  },
  error: "The live inventory snapshot could not be loaded. The rest of the application remains available.",
} as const;
export default en;
