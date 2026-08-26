# Loading-State and Skeleton Audit

**Phase:** 2 — repository audit  
**Status:** Baseline  
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

The systemic gaps are:

1. None of the 22 lazy routes declares a loading policy in the route registry.
2. Twenty destination routes receive the same invented page skeleton even though their real structures differ.
3. Application loading surfaces use raw skeletons and component-local timing instead of shared Starter loading tokens and leaves.
4. Loading ownership and accessibility are inconsistent across page, table, and overlay boundaries.
5. Only Overview has an alignment contract, and its verification matrix is still narrower than the standard requires.

## Route-code loading inventory

All route modules in `APP_PAGE_REGISTRY` are loaded through `React.lazy`. The registry currently declares access, path, navigation, and loader metadata, but no `retain`, `progress`, `skeleton`, or `none` loading policy.

| Effective route group                  | Route IDs                                                                           | Current fallback                                                                                                                | Geometry                                     | Rating        | Priority |
| -------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------- | -------- |
| Application bootstrap and login chunk  | `login`, plus authentication recovery before route selection                        | Full-screen branded loader; status region mounts immediately and spinner appears after 150 ms.                                  | C, progress-only                             | Partial       | P1       |
| Overview route                         | `home`                                                                              | Delayed `AppPageHomeView loading`; loaded and loading states share the real header, page body, frame, grid, and card structure. | A                                            | Partial       | P1       |
| Generic authenticated/not-found routes | `items`, `settings`, `devTools`, every `devTools*` example, `forbidden`, `notFound` | Delayed generic page header plus 48 px and 180 px skeleton blocks.                                                              | C in reality, presented as detailed skeleton | Non-compliant | P0       |

The generic group contains 20 routes. Its fallback preserves the application shell, `AppPageLayout`, and the user's page-width preference, but it cannot know the destination's actual header actions, back navigation, content frame, responsive layout, or vertical geometry. The detailed blocks therefore invent structure.

### Required route-policy direction

Phase 3 must add an explicit policy to every registry entry. Until a synchronously available destination structure exists, a route must use retained content or progress rather than a detailed skeleton. A `skeleton` policy is valid only when the route imports a shared structure that is also used by its loaded page.

The later eager-versus-lazy review may remove waits from static routes, but it is deliberately separate from this policy remediation.

## Application surface inventory

| Surface                           | Wait type and category                     | Current treatment                                                                                                             | Geometry target    | Rating                                      | Priority | Owner                      |
| --------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------- | -------- | -------------------------- |
| `AppBootstrapFallback`            | Auth/bootstrap or login route; `boundary`  | Branded full-screen status with delayed progress.                                                                             | C                  | Partial                                     | P1       | App shell                  |
| `AppRouteFallback` — Overview     | Route code; `boundary`, `skeleton-capable` | Reuses `AppPageHomeView`; skeletonizes leaves in the real page composition.                                                   | A                  | Partial                                     | P1       | App shell + Overview       |
| `AppRouteFallback` — generic page | Route code; `boundary`                     | Reuses the page frame but invents destination header/body skeleton geometry.                                                  | C                  | Non-compliant                               | P0       | App shell + route registry |
| `AppPageHomeView loading`         | Route code; `skeleton-capable`             | Reuses real header, width preference, frame, card grid, typography, and localized text geometry.                              | A                  | Partial                                     | P1       | Overview page              |
| Items initial query               | Initial data; `skeleton-capable`           | Keeps search/filter controls and table frame; delegates unknown rows to `VireoResponsiveTable`.                               | B; A outer anchors | Partial, blocked by Starter table gaps      | P0       | Items feature + Starter UI |
| Items background refresh          | Refresh; `content-preserving`              | Keeps usable rows and controls; adds a two-pixel top progress line with reduced-motion handling.                              | A                  | Partial                                     | P1       | Items feature              |
| Items incremental mobile page     | Pagination; `content-preserving`           | Keeps loaded rows and adds local progress below them.                                                                         | B                  | Aligned                                     | P2       | Items feature + Starter UI |
| Items empty result                | Empty                                      | Keeps table region and renders filtered/first-item/no-data copy with contextual actions.                                      | B                  | Aligned                                     | P2       | Items feature              |
| Items query error                 | Error/recovery                             | Shows an alert above the table; a no-data error also allows the table empty state to render.                                  | B                  | Partial                                     | P1       | Items feature              |
| Item form create/update           | Mutation; `busy-action`                    | Keeps the form and overlay, disables closing, and delegates submit feedback to `VireoFormSubmitButton`.                       | A                  | Partial, inherits Starter action contract   | P1       | Item feature + Starter UI  |
| Item delete confirmation          | Mutation; `busy-action`                    | Keeps target context and delegates pending behavior to `VireoConfirmationDialog`.                                             | A                  | Partial, inherits Starter action contract   | P1       | Item feature + Starter UI  |
| Item history overlay              | Initial data; `skeleton-capable`           | Keeps overlay/header but draws an independent generic skeleton stack for history content. Retains records on refresh failure. | B                  | Non-compliant                               | P1       | Item feature               |
| Entity-filter definition overlay  | Initial data; `boundary`                   | Keeps overlay/header/footer and uses centered progress in a reserved content region.                                          | C                  | Partial                                     | P1       | Query-filter feature       |
| Relation value editor             | Widget query; `content-preserving`         | Keeps the autocomplete control/value and uses MUI local loading behavior.                                                     | A control frame    | Partial                                     | P2       | Query-filter feature       |
| Login submission                  | Mutation; `busy-action`                    | Keeps the login form and delegates pending behavior to `VireoFormSubmitButton`; error remains local.                          | A                  | Partial, inherits Starter action contract   | P1       | Login page + Starter UI    |
| Async data-state example          | Initial data/error; `boundary`             | Demonstrates Suspense success, empty, and error through `VireoQueryBoundary`.                                                 | C by default       | Partial, inherits Starter boundary contract | P2       | Dev tools + Starter UI     |
| Initialization-readiness example  | Initialization; `boundary`                 | Keeps the page and card, replaces the card body with step progress, and delegates lifecycle to `VireoInitializationBoundary`. | B                  | Partial                                     | P2       | Dev tools + Starter UI     |
| Remaining page content            | `static`                                   | No independent data-loading surface was found; only route-code loading applies.                                               | Not applicable     | Not applicable                              | —        | Owning route               |

## Detailed findings

### T-01 — route policies are implicit and global

**Rating:** Non-compliant  
**Priority:** P0

Every route is lazy, but `APP_PAGE_REGISTRY` cannot declare how its code-loading wait should be presented. `App.tsx` instead selects Overview or generic behavior by checking one route ID. This prevents policy review, type-enforced completeness, and route-specific verification.

**Required remediation:** Add a required route-loading policy to the registry and make the route boundary exhaustively resolve it. Policy metadata must describe presentation only; it must not decide eager versus lazy loading.

### T-02 — the generic route fallback invents destination geometry

**Rating:** Non-compliant  
**Priority:** P0

The generic fallback uses a plausible page header, a short block, and a large block for 20 structurally different destinations. It cannot align with tables, settings panels, forms, index cards, canvases, status pages, or route-specific actions.

**Required remediation:** Replace the detailed generic skeleton with retained content or a progress-only Level C treatment. Add route-specific skeletons only when loaded and loading modes share synchronously available structure.

### T-03 — application skeleton timing and visuals are locally defined

**Rating:** Non-compliant  
**Priority:** P0, dependent on Starter foundation

`AppLoadingSurface`, `AppSkeletonText`, `AppPageHomeView`, and `ItemHistoryOverlay` use raw MUI skeletons and local timing values. History uses a general exit-duration token as its reveal delay. No application-level contract guarantees one pulse style, semantic colors/radius, or reduced-motion behavior.

**Required remediation:** Consume the shared Starter loading tokens and skeleton leaves once available. Remove loading literals and unrelated motion-token aliases.

### T-04 — Overview proves the structural pattern but remains partially verified

**Rating:** Partial  
**Priority:** P1, intentionally paused for later visual remediation

Overview correctly shares one real page structure across loading and loaded modes. `AppSkeletonText` preserves real localized typography and wrapping geometry, and the page-width preference flows through `AppPageLayout`. The boundary has a status but no `aria-busy`, raw skeleton motion has no explicit reduced-motion path, and current tests cover one preferred width plus a single Storybook alignment fixture rather than the full width/localization/responsive/theme matrix.

**Required remediation:** Keep the shared structure. Adopt the shared tokens/leaves, establish one busy boundary, and expand the Level A contract without creating a second skeleton tree.

### T-05 — Items initial loading is structurally sound at the page level but inherits table violations

**Rating:** Partial  
**Priority:** P0 pilot

Search, filters, page frame, table frame, headings, and pagination remain in place. Initial row placeholders are correctly selected only when there is no usable data. However, the table currently duplicates busy ownership and independently reproduces mobile row anatomy. The result-count chip also appears only after data arrives, which can shift the command row.

**Required remediation:** Remediate the public table first, then reserve or intentionally bound result-count geometry and add desktop/mobile density-aware alignment coverage in the template.

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

### T-10 — bootstrap ownership is incomplete

**Rating:** Partial  
**Priority:** P1

The branded loader is appropriate for authentication recovery and application bootstrap. Its status region announces immediately while only the spinner is delayed, and it does not apply `aria-busy` to the stable application region. The same fallback is also used for login route-code loading, coupling two waits with different ownership.

**Required remediation:** Define bootstrap versus login-route ownership, apply the shared reveal semantics, and give the smallest stable region one status/busy contract.

### T-11 — verification is concentrated on Overview

**Rating:** Non-compliant  
**Priority:** P0

Overview has a Storybook alignment contract and an integration assertion for the `md` page-width preference. No equivalent contract covers Items initial/refresh/error states, overlays, route policies, reduced motion, longest localization, all supported page widths, or announcement uniqueness.

**Required remediation:** Add tests alongside each remediation. Route-policy exhaustiveness, Level A/B anchors, state transitions, accessibility ownership, responsive modes, table density, themes, localization, reduced motion, and CLS thresholds must all become executable contracts.

## State-transition coverage baseline

| Transition                                    | Best current reference                | Gap                                                           |
| --------------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Initial loading → content                     | Overview and Items                    | Overview coverage is narrow; Items inherits table gaps.       |
| Initial loading → empty                       | Items and async-state example         | Items transition has no alignment contract.                   |
| Initial loading → error                       | Query/filter/history surfaces         | No-data error ownership is inconsistent.                      |
| Content → refresh → updated                   | Items                                 | Busy semantics and automated coverage are missing.            |
| Content → refresh error with retained content | Item history                          | Not generalized; filter definition may replace stale content. |
| Content → mutation → success/error            | Item form, delete confirmation, login | Shared busy-action semantics remain incomplete.               |
| Route code → destination                      | Overview                              | Twenty other routes use invented generic geometry.            |

## Remediation order

1. **Route contract:** add typed per-route policies and replace the invented generic fallback with a compliant Level C treatment.
2. **Starter foundation adoption:** consume shared loading tokens and skeleton leaves after they land in Starter UI.
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
- [ ] Findings remediated. This begins in the next implementation phase.
