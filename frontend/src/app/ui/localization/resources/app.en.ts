const en = {
  brand: { name: "Vireo Starter", tagline: "Full-stack PWA" },
  navigation: {
    OVERVIEW: "Overview",
    ITEMS: "Items",
    SETTINGS: "Settings",
    DEV_TOOLS: "Dev tools",
    EXPAND: "Expand navigation",
    COMPACT: "Compact navigation",
    CLOSE: "Close navigation",
    OPEN: "Open navigation",
    QUICK: "Quick navigation",
  },
  account: { OPEN_MENU: "Open account menu", SIGN_OUT: "Sign out" },
  actions: { BACK: "Back" },
  loading: { application: "Loading application", page: "Loading page" },
  pwa: {
    later: "Later",
    offline: "You are offline. Server-backed data may be unavailable.",
    offlineReady: "The app shell is ready for limited offline use. Server data still requires a connection.",
    update: "Update",
    updateReady: "A new version is ready.",
  },
  unsavedChanges: {
    title: "Discard unsaved changes?",
    message: "Your changes will be lost if you close this form.",
    keepEditing: "Keep editing",
    discard: "Discard changes",
  },
} as const;

export default en;
