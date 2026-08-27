export default {
  common: {
    back: "Back to developer tools",
    cancel: "Cancel",
    save: "Save example",
  },
  validation: {
    minimum: "Enter at least three characters.",
    required: "Choose a value.",
    minimumValue: "Enter a value greater than zero.",
  },
  advancedForm: {
    header: {
      title: "Advanced field form",
      description: "A production-shaped form combining Vireo's richer field contracts.",
    },
    section: { title: "Work order", description: "Schedule, assign, classify, and attach supporting material." },
  },
  urlState: {
    header: {
      title: "URL-synchronized state",
      description: "Tabs, filters, and view preferences survive refresh and browser navigation.",
    },
  },
  asyncStates: {
    header: {
      title: "Async data states",
      description: "Loading, success, empty, and recoverable failure states share one query boundary.",
    },
  },
  offlineCrud: {
    header: {
      title: "Offline state simulation",
      description: "Inspect optimistic local and queued presentation states without a server synchronization claim.",
    },
    limitation:
      "This developer example uses localStorage only. Replay changes local display state; it does not contact a server, persist an idempotency key, or resolve a conflict.",
    status: {
      online: "Online simulation — new records use the server-aligned display state.",
      offline: "Offline simulation — new records use the queued display state.",
    },
    actions: {
      useBrowserStatus: "Use browser status",
      simulateOffline: "Simulate offline",
      create: "Create",
      replay: "Replay state {{count}}",
      delete: "Delete record",
    },
    recordName: "Record name",
    record: {
      optimistic: "Optimistic local record",
      aligned: "Server-aligned display state",
      queued: "queued",
      synced: "displayed as synced",
    },
    empty: "No local records.",
  },
  realtime: {
    header: {
      title: "Realtime updates",
      description: "Validated cross-tab events update the activity feed without page refreshes.",
    },
  },
  dragDrop: {
    header: {
      title: "Drag-and-drop board",
      description: "Accessible task reordering and cross-lane movement using Vireo's DnD integration.",
    },
  },
  canvas: {
    header: {
      title: "Infinite canvas workspace",
      description: "Pan, zoom, reset, and fullscreen controls around transformed world content.",
    },
  },
  regional: {
    header: {
      title: "Regional formatting",
      description: "Canonical values rendered through the application's active locale.",
    },
  },
  browser: {
    header: {
      title: "Browser capabilities",
      description: "Connectivity, fullscreen, debouncing, and browser downloads in one focused example.",
    },
  },
  initialization: {
    header: {
      title: "Initialization readiness",
      description: "Gate application content behind asynchronous dependency initialization.",
    },
  },
} as const;
