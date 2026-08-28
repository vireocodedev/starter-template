# Offline behavior

The unmodified Template supports an **offline application shell**, not offline Item
CRUD or arbitrary synchronization.

After one successful production load, the service worker can start the static React
shell without the backend. The UI reports that it is offline. API routes are
explicitly `NetworkOnly`, so Item search, create, edit, and delete require a live
authenticated server connection and are not acknowledged as queued.

Generated schema v1 also fixes `capabilities.offline` to `false`. This avoids
creating a plausible-looking queue without domain eligibility, temporary-ID,
authorization, conflict, privacy, and recovery decisions.

## Enabling a real disconnected workflow

Use Vireo's SQLite and server replay modules only after completing the framework's
[offline guarantees and admission checklist](https://github.com/vireocodedev/starter/blob/main/docs/OFFLINE_GUARANTEES.md).
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
