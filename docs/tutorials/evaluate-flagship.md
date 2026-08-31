# Evaluate the flagship in 10 minutes

This walkthrough proves the supported golden path without asking you to trust a screenshot.

For a read-only preview, open <https://demo.vireocode.com> and sign in with `demo` /
`demo123`. The hosted sandbox proves the live presentation and request path; continue
with the local steps below to evaluate mutation, customization, and verification.

## 1. Start from public artifacts

```bash
npm create vireo@latest my-vireo-evaluation
cd my-vireo-evaluation
corepack npm run doctor
corepack npm run dev
```

Open <http://localhost:3000> and sign in with `admin` / `admin123`.

## 2. Exercise the product path

On Overview, confirm that the API-backed snapshot shows active, draft, archived, and low-stock states. Open inventory, search for `scanner`, clear the search, create a temporary Item, edit its quantity, inspect its history, and delete it.

## 3. Make an app-owned change

Follow the [attention-threshold recipe](../recipes/overview-threshold.md), refresh Overview, and confirm that the operations queue follows the new policy. No package fork or framework source edit is involved.

## 4. Verify the result

Stop the development process and run:

```bash
./scripts/verify.sh
```

The gate covers application architecture, formatting, lint, types, unit/integration tests, Storybook accessibility and state contracts, production builds, browser journeys, the JVM build, and policy checks.

## Decide honestly

Continue only if ordinary React/Spring source, the supported generator boundary, and the published package surface match your team's preferences. Read [comparison boundaries](../comparison.md), [flagship limitations](../flagship.md#honest-boundary), and the Vireo [evaluation guide](https://github.com/vireocodedev/vireo/blob/main/docs/EVALUATION.md). This exercise proves technical connection and changeability, not production readiness or fit for your domain.
