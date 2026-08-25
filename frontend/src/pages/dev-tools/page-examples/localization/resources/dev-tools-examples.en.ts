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
      title: "Offline-first CRUD",
      description: "Optimistic local records and queued commands replay when connectivity returns.",
    },
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
