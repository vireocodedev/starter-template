const en = {
  header: { title: "Dev tools", description: "Explore focused examples of the template's application patterns." },
  sections: { examples: "Example pages", errors: "Error pages" },
  actions: { openExample: "Open example", openPage: "Open page" },
  empty: "No example pages are available.",
  pages: {
    basic: {
      title: "Basic page",
      description: "A minimal page with the standard application header and content layout.",
      open: "Open Basic page",
    },
    form: {
      title: "Basic form page",
      description: "A responsive, validated form using several Vireo field and layout contracts.",
      open: "Open Basic form page",
    },
    filters: {
      title: "Entity query filters",
      description: "Build metadata-driven, typed Item filters and inspect the canonical committed document.",
      open: "Open Entity query filters",
    },
    related: {
      title: "Related record creation",
      description: "Create a missing Buyer without losing the state of the parent Invoice form.",
      open: "Open Related record creation",
    },
    multiStep: {
      title: "Multi-step form page",
      description: "Guide one validated form through details, preferences, and a final review step.",
      open: "Open Multi-step form page",
    },
    advancedFieldForm: {
      title: "Advanced field form",
      description: "Exercise richer Vireo fields, translated Zod validation, and canonical form values.",
      open: "Open Advanced field form",
    },
    urlState: {
      title: "URL-synchronized state",
      description: "Persist tabs and view preferences in typed URL search parameters.",
      open: "Open URL-synchronized state",
    },
    asyncStates: {
      title: "Async data states",
      description: "Review loading, success, empty, retry, and failure behavior through one query boundary.",
      open: "Open Async data states",
    },
    offlineCrud: {
      title: "Offline-first CRUD",
      description: "Queue optimistic local writes and replay them after connectivity returns.",
      open: "Open Offline-first CRUD",
    },
    realtime: {
      title: "Realtime updates",
      description: "Validate cross-tab events before applying them to live application state.",
      open: "Open Realtime updates",
    },
    dragDrop: {
      title: "Drag-and-drop board",
      description: "Reorder tasks and move them between typed drop zones.",
      open: "Open Drag-and-drop board",
    },
    canvas: {
      title: "Infinite canvas",
      description: "Pan, zoom, reset, and fullscreen an unbounded workspace.",
      open: "Open Infinite canvas",
    },
    regional: {
      title: "Regional formatting",
      description: "Render canonical numbers and dates using the active application locale.",
      open: "Open Regional formatting",
    },
    browser: {
      title: "Browser capabilities",
      description: "Use connectivity, fullscreen, debouncing, and download behavior safely.",
      open: "Open Browser capabilities",
    },
    initialization: {
      title: "Initialization readiness",
      description: "Gate protected descendants behind asynchronous dependency readiness.",
      open: "Open Initialization readiness",
    },
    forbidden: {
      title: "Forbidden",
      description: "Preview the authenticated page shown when an account cannot access a route.",
      open: "Open Forbidden page",
    },
    notFound: {
      title: "Not found",
      description: "Preview the authenticated catch-all page for an unknown application route.",
      open: "Open Not found page",
    },
  },
} as const;
export default en;
