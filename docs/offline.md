# Offline behavior

The unmodified Template supports an **offline application shell**, not offline Item
CRUD or arbitrary synchronization.

After one successful production load, the service worker can start the static React
shell without the backend. The connectivity indicator separately reports browser
offline, checking, backend reachable, backend unavailable, or mock mode. Browser
online is only a hint: the HTTP readiness probe treats any received response,
including 4xx and 5xx, as reachability evidence. API routes are explicitly
`NetworkOnly`, so Item search, create, edit, and delete require a live authenticated
server connection and are not acknowledged as queued.

Generated schema v1 also fixes `capabilities.offline` to `false`. This avoids
creating a plausible-looking queue without domain eligibility, temporary-ID,
authorization, conflict, privacy, and recovery decisions.

## Enabling a real disconnected workflow

Use Vireo's SQLite and server replay modules only after completing the framework's
[offline guarantees and admission checklist](https://github.com/vireocodedev/vireo/blob/main/docs/OFFLINE_GUARANTEES.md).
At minimum, the application must own:

- which reads and mutations are safe offline;
- user-and-tenant storage identity and logout/switch cleanup;
- command dependency, idempotency, temporary-ID, and transaction rules;
- retry, permanent-failure, conflict, cancel/discard, and recovery UX;
- local-data classification, quota, corruption, migration, and purge policy; and
- adversarial tests across tabs, devices, versions, session expiry, storage failure,
  network interruption, and server schema changes.

Do not change the Workbox API handler from `NetworkOnly` to a cache-first strategy.
Authenticated API response caching needs a separate data-isolation and invalidation
design; a generic service-worker cache can expose stale data across users.

## Current limits

- Offline before the first successful load cannot provision the shell or sign in.
- Refreshing an already-provisioned production build can load the shell but not
  server data.
- No Item writes are durably queued by the Template.
- No generated conflict UI, multi-device merge, background sync, or cross-version
  command migration is claimed.
- Installed-PWA behavior is automated where browser tooling permits; physical iOS
  and Android evidence remains a manual release row.

## Update and recovery procedure

The application checks for a waiting worker when it registers and at a conservative
hourly interval. It prompts before activation and preserves the unsaved-change
confirmation guard. A registration or activation failure leaves the current page in
place and shows a recoverable warning. The PWA test fixture builds revision A and B
sequentially, switches only its test-owned static selector, and proves discovery,
prompt, activation, reload, and revision-B control; it does not add a production
endpoint or bypass the prompt.

For a worker/cache incident, first preserve the browser console and deployed build
revision. Then use the browser's site-data controls to unregister the worker and
clear this application's storage, reload online, and confirm the current manifest
and `/sw.js` are served with `Cache-Control: no-cache`. This removes the offline
shell and any application-owned local state, so product teams must provide a
domain-specific recovery path before they persist user data offline.
