# 30-minute vertical slice

This exercise changes the existing Item slice without adding framework abstractions. Budget 5 minutes to start, 15 to change the slice, and 10 to verify it.

## 0–5 minutes: prove the baseline

```bash
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

Open <http://localhost:3000>, sign in with `demo` / `demo123`, and create one Item. Keep the processes running.

## 5–20 minutes: add an Item description

1. Add a nullable `description` column in a new numbered migration under `src/main/resources/db/migration`.
2. Carry `description` through the Item entity, request/response DTOs, MapStruct mapper, and service tests.
3. Add the field to `frontend/src/features/item` schema, model, API mapping, form, localization resources, and form test.
4. Render it on the Items page. Preserve the existing query keys, history integration, authorization, and loading behavior.

The vertical order is deliberate: migration → server contract → browser contract → UI. Compile or typecheck after each boundary so a failure stays local.

## 20–30 minutes: verify the real path

Create and edit an Item with the new value in the browser, reload it, and confirm the value survives. Then run:

```bash
corepack npm run verify
```

Success means the behavior works through the actual database, HTTP, mapping, query, localization, UI, and test boundaries. If doctor blocks startup, use the stable code in [the remedy table](../troubleshooting.md).
