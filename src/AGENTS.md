# Template backend

The backend demonstrates application ownership on top of published Vireo JVM modules.

- Keep Flyway migrations append-only after they have been used outside a disposable local database.
- Put authorization, tenancy, validation, and domain rules at the service boundary; generated wiring is not a substitute for application policy.
- Preserve the separation between application runtime credentials and migration/schema-owner credentials.
- Do not change generated capability files manually unless the capability was explicitly ejected and the new ownership is recorded.

Use the nearest existing module, migration, and integration test as the primary local pattern.
