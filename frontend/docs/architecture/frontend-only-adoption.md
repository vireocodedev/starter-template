# Frontend-only adoption

The Vireo frontend is a normal React and Vite application. It can run in the
full-stack Template against the reference Spring Boot API, or independently
against adapters owned by a frontend team.

## Adapter boundary

The application composition root may replace any subset of the default HTTP
implementations before React renders:

```ts
import { configureAppAdapters } from "@/app/adapters/public";

configureAppAdapters({
  auth: companyAuthApi,
  items: companyItemApi,
  history: companyHistoryApi,
  query: companyQueryApi,
});
```

Each adapter is a small TypeScript interface. The company adapter may wrap a
generated OpenAPI client, `fetch`, Axios, GraphQL, a BFF, or another transport.
Domain and transport schemas remain separate, and untrusted responses should be
parsed at the adapter boundary.

The backend remains authoritative for authentication and authorization. History,
saved-query, and offline replay features must be disabled or adapted when the
company API does not provide their required contracts. Vireo does not infer safe
offline mutation semantics for an arbitrary backend.

## Independent development

Set `VITE_API_MODE=mock` to install the in-memory adapters. The mock path supports
login (`demo` / `demo123`), Item search and CRUD, query metadata, and an empty
history feed without starting Java or a database. Mock state is process-local and
is not a persistence or integration-test claim.

Use `VITE_API_MODE=http` (the default) for the reference API or for a company-owned
HTTP adapter. Keep the backend contract version pinned in frontend CI and run a
separate integration lane against the shared environment; ordinary frontend pull
requests should not require a backend checkout.
