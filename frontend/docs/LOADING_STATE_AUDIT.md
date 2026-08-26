# Loading-State and Skeleton Audit

**Phase:** 4 — template page conventions

**Status:** Route and page-loading conventions remediated

**Audited against:** [Vireo Loading-State and Skeleton Standard](LOADING_STATES.md)

**Scope:** Starter Template route boundaries, page compositions, queries, mutations, and loading verification

## Purpose

This document is the Phase 2 compliance baseline for the Starter Template frontend. It records every current loading owner, separates route-code loading from data and action loading, assigns geometry expectations, and establishes the application remediation queue.

This phase does not decide whether a route should remain lazy or become eager. It audits the behavior required whenever a route or its content is pending.

## Rating and priority

| Rating         | Meaning                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Aligned        | The audited behavior follows the applicable standard. Broader verification may still be open.                                          |
| Partial        | The treatment is directionally correct, but ownership, timing, geometry, accessibility, state handling, or verification is incomplete. |
| Non-compliant  | The implementation contradicts a `MUST` or `MUST NOT` requirement.                                                                     |
| Not applicable | The route or component has no independent asynchronous visual state beyond route-code loading.                                         |

| Priority | Meaning                                                                |
| -------- | ---------------------------------------------------------------------- |
| P0       | Application-wide policy or a highly visible reference workflow.        |
| P1       | Material feature, geometry, state, or accessibility gap.               |
| P2       | Narrower consistency, error handling, documentation, or coverage work. |

## Executive baseline

The template already distinguishes initial item loading, retained refresh, incremental pagination, empty results, query errors, and busy mutations in several important paths. Overview also demonstrates the correct structural technique: loaded and loading modes share one page composition and replace only leaves.

The Phase 4 baseline is:

1. Every lazy route now declares its loading presentation policy in the route registry.
2. Unknown route structures use progress-only Level C treatment instead of an invented detailed skeleton.
3. Route, bootstrap, and Overview loading surfaces consume the shared Starter loading boundary and skeleton leaves.
4. Items, overlays, and widgets retain loading-ownership and recovery gaps for later vertical-slice phases.
5. Only Overview and the shared responsive table have alignment contracts; template workflow coverage remains narrower than the standard requires.

## Route-code loading inventory

All route modules in `APP_PAGE_REGISTRY` remain loaded through `React.lazy`. The registry now requires an explicit `retain`, `progress`, `skeleton`, or `none` presentation policy independently of that loading strategy.

| Effective route group                 | Route IDs                                                                           | Current fallback                                                                                                        | Geometry                       | Rating  | Priority |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------- | -------- |
| Application bootstrap and login chunk | `login`, plus authentication recovery before route selection                        | Branded application progress with separate labels, one shared boundary, and delayed visible feedback.                   | C, progress-only               | Aligned | —        |
| Overview route                        | `home`                                                                              | `AppPageHomeView loading`; loaded and loading states share the real header, page body, frame, grid, and card structure. | A                              | Partial | P1       |
| Progress-only authenticated routes    | `items`, `settings`, `devTools`, every `devTools*` example, `forbidden`, `notFound` | Real shell, page layout, width preference, and localized static header with bounded progress-only content.              | C; stable frame/header anchors | Aligned | —        |

The progress-only group contains 20 routes. Its fallback preserves the application shell, `AppPageLayout`, the user's page-width preference, localized static header content, and known back navigation. It deliberately does not speculate about destination actions, tables, forms, cards, canvases, or vertical geometry.

### Required route-policy direction

Every registry entry now declares a policy. A `skeleton` policy remains valid only when the route imports a shared synchronous structure also used by its loaded page; Overview is currently the sole qualifying route.

The later eager-versus-lazy review may remove waits from static routes, but it is deliberately separate from this policy remediation.

## Application surface inventory

| Surface                          | Wait type and category                     | Current treatment                                                                                                             | Geometry target    | Rating                                      | Priority | Owner                      |
| -------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------- | -------- | -------------------------- |
| `AppBootstrapFallback`           | Auth/bootstrap; `boundary`                 | Branded full-screen progress through one shared delayed loading boundary.                                                     | C                  | Aligned                                     | —        | App shell                  |
| `AppRouteFallback` — Overview    | Route code; `boundary`, `skeleton-capable` | Reuses `AppPageHomeView`; skeletonizes leaves in the real page composition through the shared boundary.                       | A                  | Partial                                     | P1       | App shell + Overview       |
| `AppRouteFallback` — progress    | Route code; `boundary`                     | Reuses the page frame, width preference, localized static header, and bounded progress region without invented content.       | C                  | Aligned                                     | —        | App shell + route registry |
| `AppPageHomeView loading`        | Route code; `skeleton-capable`             | Reuses real header, width preference, frame, card grid, typography, and localized text geometry with shared skeleton leaves.  | A                  | Partial                                     | P1       | Overview page              |
| Items initial query              | Initial data; `skeleton-capable`           | Keeps search/filter controls and table frame; delegates unknown rows to the remediated shared `VireoResponsiveTable`.         | B; A outer anchors | Partial; template pilot remains             | P0       | Items feature + Starter UI |
| Items background refresh         | Refresh; `content-preserving`              | Keeps usable rows and controls; adds a two-pixel top progress line with reduced-motion handling.                              | A                  | Partial                                     | P1       | Items feature              |
| Items incremental mobile page    | Pagination; `content-preserving`           | Keeps loaded rows and adds local progress below them.                                                                         | B                  | Aligned                                     | P2       | Items feature + Starter UI |
| Items empty result               | Empty                                      | Keeps table region and renders filtered/first-item/no-data copy with contextual actions.                                      | B                  | Aligned                                     | P2       | Items feature              |
| Items query error                | Error/recovery                             | Shows an alert above the table; a no-data error also allows the table empty state to render.                                  | B                  | Partial                                     | P1       | Items feature              |
| Item form create/update          | Mutation; `busy-action`                    | Keeps the form and overlay, disables closing, and delegates submit feedback to `VireoFormSubmitButton`.                       | A                  | Partial, inherits Starter action contract   | P1       | Item feature + Starter UI  |
| Item delete confirmation         | Mutation; `busy-action`                    | Keeps target context and delegates pending behavior to `VireoConfirmationDialog`.                                             | A                  | Partial, inherits Starter action contract   | P1       | Item feature + Starter UI  |
| Item history overlay             | Initial data; `skeleton-capable`           | Keeps overlay/header but draws an independent generic skeleton stack for history content. Retains records on refresh failure. | B                  | Non-compliant                               | P1       | Item feature               |
| Entity-filter definition overlay | Initial data; `boundary`                   | Keeps overlay/header/footer and uses centered progress in a reserved content region.                                          | C                  | Partial                                     | P1       | Query-filter feature       |
| Relation value editor            | Widget query; `content-preserving`         | Keeps the autocomplete control/value and uses MUI local loading behavior.                                                     | A control frame    | Partial                                     | P2       | Query-filter feature       |
| Login submission                 | Mutation; `busy-action`                    | Keeps the login form and delegates pending behavior to `VireoFormSubmitButton`; error remains local.                          | A                  | Partial, inherits Starter action contract   | P1       | Login page + Starter UI    |
| Async data-state example         | Initial data/error; `boundary`             | Demonstrates Suspense success, empty, and error through `VireoQueryBoundary`.                                                 | C by default       | Partial, inherits Starter boundary contract | P2       | Dev tools + Starter UI     |
| Initialization-readiness example | Initialization; `boundary`                 | Keeps the page and card, replaces the card body with step progress, and delegates lifecycle to `VireoInitializationBoundary`. | B                  | Partial                                     | P2       | Dev tools + Starter UI     |
| Remaining page content           | `static`                                   | No independent data-loading surface was found; only route-code loading applies.                                               | Not applicable     | Not applicable                              | —        | Owning route               |

## Detailed findings

### T-01 — route policies are explicit and exhaustive

**Rating:** Aligned

**Priority:** Remediated in Phase 4

Every route remains lazy but now declares its presentation policy in `APP_PAGE_REGISTRY`. `AppRouteFallback` exhaustively resolves that metadata without making eager-versus-lazy decisions.

**Remediation record:** The registry requires presentation-only policy metadata and the route boundary resolves it exhaustively. Eager-versus-lazy strategy remains separate.

### T-02 — unknown route structures use progress only

**Rating:** Aligned

**Priority:** Remediated in Phase 4

The generic detailed skeleton has been removed. Progress routes preserve only structure known synchronously: shell, page frame, width preference, localized static header, known back navigation, and a bounded Level C content region.

**Remediation record:** The invented generic skeleton was replaced with page-framed Level C progress. Route-specific skeletons require a synchronously shared loaded structure.

### T-03 — shared loading foundations are adopted at page level

**Rating:** Partial

**Priority:** P1

`AppLoadingSurface`, `AppSkeletonText`, and `AppPageHomeView` now consume `VireoLoadingRegion` and `VireoSkeleton`. `ItemHistoryOverlay` remains on a separate raw skeleton/timing implementation and is deferred to the overlay migration phase.

**Remaining remediation:** Migrate `ItemHistoryOverlay` from raw skeletons and independent timing to the shared foundation during the overlay phase.

### T-04 — Overview proves the structural pattern but remains partially verified

**Rating:** Partial

**Priority:** P1, intentionally paused for later visual remediation

Overview shares one real page structure across loading and loaded modes. `AppSkeletonText` preserves real localized typography and wrapping geometry, page width flows through `AppPageLayout`, and one shared boundary now owns delay, `aria-busy`, and announcement semantics. The broader width/localization/responsive/theme matrix remains intentionally paused for later verification.

**Remaining remediation:** Expand the existing Level A contract across supported widths, localization, responsive modes, and themes without creating a second skeleton tree.

### T-05 — Items initial loading is ready for the template pilot

**Rating:** Partial

**Priority:** P0 pilot

Search, filters, page frame, table frame, headings, and pagination remain in place. Initial row placeholders are correctly selected only when there is no usable data. The shared table now owns one delayed loading boundary and derives desktop and mobile placeholders from real row/cell structures. The template still needs to reserve or intentionally bound result-count geometry and prove the complete Items state matrix.

**Remaining remediation:** In Phase 5, integrate the shared table contract with result-count geometry, exclusive error/empty behavior, refresh ownership, and desktop/mobile density-aware alignment coverage.

### T-06 — Items refresh and error ownership needs tightening

**Rating:** Partial

**Priority:** P1

`useItemSearchQuery` distinguishes `isLoading`, `isRefreshing`, and `isFetchingNextPage` and retains previous data, which is the desired state model. The refresh progress indicator does not establish a single busy region. When the first request errors with no records, the error alert and the table's ordinary empty state can appear together, communicating two incompatible outcomes.

**Required remediation:** Give the Items data region one busy/announcement owner for refresh. Render an exclusive no-data error state inside the table/list content region, while preserving stale rows and a warning on refresh failure.

### T-07 — Item history duplicates layout in a separate skeleton tree

**Rating:** Non-compliant  
**Priority:** P1

The overlay frame and title remain stable, but the loading content is a hard-coded text bar plus two rectangular blocks rather than the real `VireoHistoryEntry` structure. The skeleton owns its own reveal timing, and its 240 px reservation does not constitute a declared geometry contract.

**Required remediation:** Introduce a loading mode or reusable structure for history entries that shares the loaded frame, skeletonize only unknown leaves, and let the overlay content boundary own timing and announcements.

### T-08 — filter-definition progress lacks complete boundary semantics

**Rating:** Partial  
**Priority:** P1

Because the server determines the filter schema, a progress-only Level C content region is appropriate. The progress control has an accessible label, but the stable content region has no `aria-busy`/status ownership. The error branch also replaces the form whenever `isError` is true, even if usable definition data is available.

**Required remediation:** Put busy and status semantics on the smallest stable overlay content region, keep the indicator decorative within it, and preserve usable form content with a refresh warning when stale definition data exists.

### T-09 — relation-option loading has no visible recovery contract

**Rating:** Partial  
**Priority:** P2

The relation autocomplete correctly preserves its input and selected values during option loading. Query failure currently collapses into an ordinary no-options experience, so a failed request is indistinguishable from a valid empty result.

**Required remediation:** Define local empty, error, retry, and retained-value behavior and verify that the field remains operable and announced without replacing its frame.

### T-10 — bootstrap and login-route ownership are distinct

**Rating:** Aligned

**Priority:** Remediated in Phase 4

Authentication bootstrap and login route-code loading now provide separate labels through the same presentation primitive. Each uses one stable busy region and reveals its progress indicator and polite status through the shared delay contract.

**Remediation record:** Bootstrap and login route loading retain separate labels while sharing the same application-progress presentation primitive and boundary semantics.

### T-11 — verification is concentrated on Overview

**Rating:** Non-compliant  
**Priority:** P0

Overview has a Storybook alignment contract and an integration assertion for the `md` page-width preference. Route-policy exhaustiveness, localized header keys, delayed visibility, and single-boundary ownership now have focused coverage. No equivalent contract yet covers Items initial/refresh/error states, overlays, reduced motion, longest localization, all supported page widths, or the broader announcement matrix.

**Required remediation:** Add tests alongside each remediation. Route-policy exhaustiveness, Level A/B anchors, state transitions, accessibility ownership, responsive modes, table density, themes, localization, reduced motion, and CLS thresholds must all become executable contracts.

## State-transition coverage baseline

| Transition                                    | Best current reference                | Gap                                                              |
| --------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Initial loading → content                     | Overview and Items                    | Overview coverage is narrow; Items template integration remains. |
| Initial loading → empty                       | Items and async-state example         | Items transition has no alignment contract.                      |
| Initial loading → error                       | Query/filter/history surfaces         | No-data error ownership is inconsistent.                         |
| Content → refresh → updated                   | Items                                 | Busy semantics and automated coverage are missing.               |
| Content → refresh error with retained content | Item history                          | Not generalized; filter definition may replace stale content.    |
| Content → mutation → success/error            | Item form, delete confirmation, login | Shared busy-action semantics remain incomplete.                  |
| Route code → destination                      | Overview and page progress            | Overview is exact; other routes preserve known anchors only.     |

## Remediation order

1. **Route contract (complete):** typed per-route policies replace the invented generic fallback with a compliant Level C treatment.
2. **Starter foundation adoption (complete for Phase 4 surfaces):** route, bootstrap, and Overview loading use shared boundaries, tokens, and skeleton leaves.
3. **Items pilot:** complete responsive-table integration, result-count geometry, exclusive error/empty behavior, and refresh ownership.
4. **Overlay migration:** remediate item history, filter definition, and relation-option states.
5. **Busy-action integration:** adopt the finalized Starter form and confirmation contracts in item and login flows.
6. **Verification sweep:** add the full route, state, geometry, accessibility, motion, localization, theme, and responsive matrix.
7. **Separate route strategy review:** only after visual contracts are stable, decide which static routes should be eager or lazy.

## Phase 2 exit record

- [x] All 22 lazy routes inventoried.
- [x] Route-code, initial-data, refresh, pagination, mutation, empty, and error states separated.
- [x] Application loading surfaces classified.
- [x] Geometry targets assigned.
- [x] Accessibility and announcement ownership gaps recorded.
- [x] Remediation priorities and repository owners assigned.
- [x] Eager-versus-lazy decisions explicitly deferred.
- [x] Phase 4 route-policy and page-loading convention findings remediated.
- [ ] Remaining Items, overlay, widget, busy-action, and verification findings remediated in later phases.
