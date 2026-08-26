# Routing and shell

`app.pages.ts` is the authoritative typed route registry. Each route declares an ID, path, eager or lazy render strategy, access metadata, loading presentation policy, navigation metadata, and path builders where parameters exist. Sidebar and mobile navigation derive from the same registry. Hidden routes remain addressable but do not appear in navigation.

Routes are lazy by default. Eager rendering is reserved for a small, synchronous, high-frequency route when splitting it would not materially reduce the entry bundle. Registry tests enforce the strategy and loading-policy pairing, unique IDs, and paths. Raw route paths must not be scattered through UI code.

## Render strategy

| Strategy | Use                                                                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eager`  | The route is synchronous, frequently reached, and its composition is already required by the entry shell or a fallback.                               |
| `lazy`   | The route owns feature code, is access-specific or infrequent, or benefits materially from a separate chunk. Intent prefetch warms navigation routes. |

Overview is eager. Its former skeleton imported the complete page composition synchronously, leaving only a tiny icon wrapper in the lazy chunk; removing that request is simpler and faster. Items, Settings, Login, Dev tools, examples, and exceptional routes remain lazy because their feature/access boundaries still provide useful code separation. This decision is explicit registry metadata and can be revisited with bundle evidence.

## Route-loading policy

Every lazy route must declare exactly one presentation policy. This metadata controls only what appears while its module is loading; it does not determine whether the route is eager or lazy.

| Policy     | Use                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `retain`   | Keep an established destination visible when the router transition can safely retain it.                |
| `progress` | Show Level C progress without inventing destination geometry. Use `page` or `application` framing.      |
| `skeleton` | Use a named synchronous composition shared with the loaded route. Never build an independent imitation. |
| `none`     | Render no waiting surface when silence is intentional and documented.                                   |

No production route currently uses `skeleton`: eager Overview has no route-code wait. `AppPageHomeView` retains its loaded/loading modes as the verified Level A reference composition in Storybook. Lazy authenticated routes use page-framed progress with their real localized static header. Login uses application-framed progress. The resolver in `AppLoadingSurface.tsx` remains exhaustive so a future route may adopt a named shared skeleton composition when bundle evidence supports it.

## Stable page-state architecture

- The application shell remains mounted for authenticated route waits.
- `AppPageLayout` owns the frame in loaded and loading states, so page-width preferences, compact padding, overlays, and scrolling stay consistent.
- Known localized page headers are rendered from registry metadata before the route chunk arrives.
- Exact skeleton routes compose the real page sections and replace only content leaves with `VireoSkeleton`.
- `VireoLoadingRegion` owns reveal delay, `aria-busy`, and the single polite announcement.
- Progress routes reserve a bounded content region and never imply table, form, card, or canvas geometry they cannot know.
- Route loading remains distinct from initial data loading and content-preserving refresh behavior.

The shell owns application chrome, responsive navigation, layout, session recovery, and unsaved-change providers. `main.tsx` only mounts `AppProviders` and `App`; `app.providers.tsx` is the single global provider composition point; `App.tsx` composes router, access boundary, shell, route outlet, and render error boundary.

Feature providers are mounted only around the routes that need them. Dev-only routes are gated by validated application configuration both in navigation and direct routing.
