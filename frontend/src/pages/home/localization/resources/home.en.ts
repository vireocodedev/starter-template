const en = {
  header: {
    title: "Overview",
    description: "A concise tour of the production-shaped workflows included in this template.",
  },
  version: "Starter 0.1.0 · UI 6.0.0",
  title: "A clean starting point for the next Vireo application.",
  introduction:
    "This repository is deliberately small, but every included workflow is production-shaped and backed by the latest Starter libraries.",
  cards: {
    entity: { title: "Complete entity flow", body: "Search, create, edit and delete a real Spring Data entity." },
    contracts: {
      title: "Current Vireo contracts",
      body: "Responsive tables, overlays and TanStack/Zod forms come from Starter.",
    },
    pwa: { title: "PWA baseline", body: "Installable shell with explicit API network behavior and update support." },
  },
} as const;
export default en;
