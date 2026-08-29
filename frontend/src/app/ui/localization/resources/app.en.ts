const en = {
  brand: {
    name: "Vireo Starter",
    tagline: "Full-stack PWA",
    online: "System online",
    offline: "Connection offline",
  },
  navigation: {
    PRIMARY: "Primary navigation",
    OVERVIEW: "Overview",
    ITEMS: "Items",
    SETTINGS: "Settings",
    EXPAND: "Expand navigation",
    COMPACT: "Compact navigation",
    CLOSE: "Close navigation",
    OPEN: "Open navigation",
    QUICK: "Quick navigation",
  },
  account: { OPEN_MENU: "Open account menu", SIGN_OUT: "Sign out" },
  auth: {
    outcomes: {
      unauthenticated: "Sign in to continue.",
      invalidCredentials: "The username or password is incorrect.",
      forbidden: "Your account is not allowed to access this workspace.",
      expiredSession: "Your session expired. Sign in again.",
      offline: "The sign-in service cannot be reached. Check your connection and try again.",
      server: "The sign-in service is temporarily unavailable. Try again later.",
      malformedResponse: "The sign-in service returned an unexpected response. Try again or contact support.",
      logoutFailure: "Sign out could not be completed. You are still signed in; please try again.",
    },
  },
  actions: { BACK: "Back" },
  loading: { application: "Loading application", page: "Loading page" },
  session: { expired: "Your session expired. Sign in again." },
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
