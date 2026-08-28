# Recipe: change the overview attention threshold

The low-stock rule is application policy. Change it without modifying a Vireo package.

1. Open `frontend/src/pages/home/home-overview.ts`.
2. Change the exported threshold, for example:

```ts
export const HOME_LOW_STOCK_THRESHOLD = 8;
```

3. Update the expectation in `frontend/tests/unit/home-overview.test.ts` if the fixture's attention set changes.
4. Run the focused proof, then the full frontend gate:

```bash
corepack npm --prefix frontend run test -- --run tests/unit/home-overview.test.ts
corepack npm --prefix frontend run verify
```

The dashboard and operations queue consume the same projection, so there is no second threshold to synchronize.

