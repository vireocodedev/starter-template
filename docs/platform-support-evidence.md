# Platform support evidence

The merge gate remains intentionally fast and deterministic: Ubuntu 24.04, Java 21,
Node 24.18.1/npm 12.0.2, H2, and desktop/mobile Chromium. The scheduled and manually
dispatchable `Support evidence` workflow samples compatibility outside that canonical
lane without making ordinary pull requests depend on a large matrix.

The identical machine-readable snapshot in
[`contracts/platform-support-policy.json`](../contracts/platform-support-policy.json)
is checked against the Template toolchain, documentation, and local workflow jobs.
The scheduled `platform-policy-sync` lane also compares it with Starter's public
canonical policy so cross-repository drift cannot remain invisible.

## Current enforced matrix

| Policy row                  | Current status | Evidence requirement | Cadence   |
| --------------------------- | -------------- | -------------------- | --------- |
| `node-npm`                  | supported      | required             | merge     |
| `java-boot-gradle`          | supported      | required             | merge     |
| `frontend-stack`            | supported      | required             | merge     |
| `chromium-tab`              | supported      | required             | merge     |
| `postgresql`                | supported      | required             | scheduled |
| `h2-development`            | supported      | required             | merge     |
| `ubuntu-24-x64`             | supported      | required             | merge     |
| `public-artifact-consumers` | supported      | required             | scheduled |
| `linux-x64-deployment`      | supported      | required             | merge     |
| `java-25-runtime`           | compatible     | advisory             | scheduled |
| `firefox-webkit-engines`    | compatible     | advisory             | scheduled |
| `advanced-browser-storage`  | experimental   | advisory             | merge     |
| `installed-pwa`             | experimental   | advisory             | merge     |
| `ubuntu-26`                 | untested       | none                 | manual    |
| `macos-apple-silicon`       | untested       | manual               | manual    |
| `windows-11-wsl2`           | untested       | manual               | manual    |
| `branded-browsers`          | untested       | manual               | manual    |
| `physical-mobile`           | untested       | manual               | manual    |
| `linux-arm64`               | untested       | none                 | manual    |

`supported` means required automated evidence exists at the stated cadence.
`compatible` is advisory recurring evidence, `experimental` is opt-in, and
`untested` makes no compatibility promise. Manual rows are promotion requirements,
not evidence that has already been collected.

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
WebKit rather than proving two branded Firefox releases or Safari on macOS.
Production Chromium verifies identity-driven manifest metadata, service-worker
registration, deep-link offline-shell launch, reconnect, NetworkOnly API behavior,
and the absence of API entries in service-worker caches. Source and built PWA
contract checks also validate policy, PNG dimensions, generated metadata, worker
output, and the declared Nginx cache/header configuration; the deployment smoke
checks the emitted service-worker and manifest no-cache headers. The PWA fixture
also produces two sequential production builds and proves waiting-worker discovery,
the update prompt, activation, reload, and revision-B control without a production
control endpoint. Physical installation/update behavior, branded browsers, Ubuntu
26.04, macOS, and Windows/WSL remain separate manual evidence requirements.

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

After building the production frontend, run the browser/PWA and Lighthouse evidence
locally with:

```bash
corepack npm run test:pwa
corepack npm run performance:audit
```

The [manual platform checklist](manual-platform-checklist.md) is required for
branded Safari/Edge/Firefox, physical Android/iOS installation, and assistive
technology evidence.
