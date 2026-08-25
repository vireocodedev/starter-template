# Entity query filters

The template uses one consistent split for searchable entity lists:

- `searchText` is an independent, immediately editable quick search. It commits after 300 ms, on Enter, or immediately when cleared.
- pagination and sorting remain table state.
- structured filters are stored as a typed `QueryFilterDocument | null` and become JSON only at the HTTP boundary.
- Query Engine metadata is the authority for available fields, operators, enum values, and relations.
- application presentation overrides may translate or improve labels, but must not invent backend capabilities.

Shared application code lives under `frontend/src/app/management/filters`. An entity owns only its presentation overrides and the point where committed filters are attached to its search request.

## Commit model

The filter overlay works with a private draft. `Apply` validates and commits the complete document, `Cancel` discards the draft, and `Clear` immediately commits `null`. Incomplete and duplicate rules remain visible and block Apply; they are never silently removed.

Entity-list toolbars expose the committed state without requiring the overlay to be reopened. The Filters button contains the active-rule count, each rule appears as a readable removable summary, and Clear all remains a low-emphasis action beside Filters. Removing an individual summary or clearing the document resets pagination to the first page. Desktop toolbars also show the current result count; mobile keeps that secondary information out of the constrained header area.

Committed list state is retained in memory per entity for the current application session. Draft filter edits are never persisted. Opening another page and returning restores search, filters, pagination, and sorting, while a browser reload starts from defaults.

## Responsive result loading

The Items page uses one search contract with two presentation-specific loading strategies:

- regular layouts keep server pagination and a contained table viewport; the page header and search toolbar remain fixed while only the table body scrolls,
- compact layouts accumulate server pages with TanStack Query's infinite-query contract; reaching the end of the virtualized mobile list requests the next page automatically.

Quick search, structured filters, and sorting remain part of the query key in both layouts. Changing any of them therefore starts compact loading again from page zero instead of appending results from an obsolete search. The responsive table receives the merged compact pages but the server's `totalElements` remains authoritative.

## Backend contract

Entities expose filter capabilities with Query Engine annotations. The request `entity` must match the backend registry key, every row uses `parameterized: false`, and rows are combined as a flat logical AND. Multiple values use `IN`; arbitrary nested boolean groups, saved filters, and offline filter persistence are intentionally outside this template baseline.

The Items page is the canonical production-shaped integration. Dev Tools → Entity query filters is the focused interactive reference for the draft and canonical-document behavior.
