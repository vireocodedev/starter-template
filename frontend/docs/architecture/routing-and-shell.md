# Routing and shell

`app.pages.ts` is the authoritative typed route registry. Each route declares an ID, path, lazy component, access metadata, navigation metadata, and path builders where parameters exist. Sidebar and mobile navigation derive from the same registry. Hidden routes remain addressable but do not appear in navigation.

Routes are lazy by default. Registry tests enforce unique IDs and paths. Raw route paths must not be scattered through UI code.

The shell owns application chrome, responsive navigation, layout, session recovery, and unsaved-change providers. `main.tsx` only mounts `AppProviders` and `App`; `app.providers.tsx` is the single global provider composition point; `App.tsx` composes router, access boundary, shell, route outlet, and render error boundary.

Feature providers are mounted only around the routes that need them. Dev-only routes are gated by validated application configuration both in navigation and direct routing.
