# Platform support evidence

The merge gate remains intentionally fast and deterministic: Ubuntu 24.04, Java 21,
Node 24.18.1/npm 12.0.2, H2, and desktop/mobile Chromium. The scheduled and manually
dispatchable `Support evidence` workflow samples compatibility outside that canonical
lane without making ordinary pull requests depend on a large matrix.

## Recurring lanes

| Lane                 | Contract exercised                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Java 25              | Java 21 compilation target with the complete JVM test suite launched on Java 25                                      |
| Firefox and WebKit   | The full-stack login and CRUD browser smoke contracts in Playwright's current Firefox and WebKit engines             |
| PostgreSQL 17 and 18 | Real Flyway startup plus authenticated CRUD through the browser against each PostgreSQL major, with the image digest |

Each lane fails if its required runtime is unavailable. It writes a structured JSON
record containing the source commit, workflow/run identity, platform and toolchain,
scenario details, and final job result. GitHub retains each record for 14 days even
when the compatibility command fails.

These jobs provide recurring compatibility evidence; they do not by themselves prove
the complete public support promise. Playwright's bundled engines sample Firefox and
WebKit rather than proving two branded Firefox releases or Safari on macOS. Physical
mobile devices, installed-PWA behavior, Ubuntu 26.04, macOS, and Windows/WSL remain
separate hosted/manual evidence requirements.

## Local focused checks

The ordinary Chromium/H2 contract remains:

```bash
cd frontend
corepack npm run test:e2e
```

With Firefox or WebKit installed, select one compatibility lane explicitly:

```bash
VIREO_E2E_BROWSER=firefox corepack npm run test:e2e
VIREO_E2E_BROWSER=webkit corepack npm run test:e2e
```

To exercise an externally managed database, export the normal Spring datasource
variables and set `VIREO_E2E_EXTERNAL_DATABASE=true`. The Playwright server then
inherits that configuration instead of forcing its disposable H2 URL.
