# Developing against local Starter libraries

The template can use either published Starter packages or locally built packages from the adjacent `vireo` repository. Published packages are always the default for both the TypeScript frontend and JVM backend; local resolution must be selected explicitly.

The expected workspace layout is:

```text
vireocode/
├── vireo/
└── vireo-template/
    └── frontend/
```

## Normal published-package development

Published frontend packages come from the public npm registry and install
anonymously:

```bash
cd vireo-template/frontend
corepack npm ci
```

Start the frontend with:

```bash
cd vireo-template/frontend
corepack npm run dev
```

This mode:

- runs the application against the installed, published Starter packages;
- selects the published Starter TypeScript project automatically;
- makes VS Code and command-line TypeScript validate the published API.

Normal tests, Storybook, E2E, builds, and `corepack npm run verify` follow the same published-package rule. The presence of an adjacent `vireo` checkout never changes a default command implicitly.

The JVM build resolves published Vireo artifacts anonymously from Maven Central. No Gradle credentials are required. A plain Gradle command never reads artifacts from Maven Local.

You can select the published TypeScript mode without starting Vite:

```bash
corepack npm run starter:mode:published
```

## Local Starter development

When changing Starter and testing those changes in the template, run only:

```bash
cd vireo-template/frontend
corepack npm run dev:local-starter
```

This mode:

- consumes Starter TypeScript source directly through Vite;
- provides HMR without running all Starter package watchers;
- ignores Starter `dist` changes so they cannot cause a watcher feedback loop;
- selects the local Starter TypeScript project automatically;
- deduplicates shared React, Emotion, MUI, TanStack, Day.js, Sonner, and Zod runtimes.

Do not run Starter's monorepo `corepack npm run dev` alongside this command. The template's Vite process owns the required source watcher.

For the JVM libraries, first publish the Starter artifacts to Maven Local and then opt the template build into that repository explicitly:

```bash
cd vireo/jvm
./gradlew publishToMavenLocal

cd ../../vireo-template
./gradlew bootRun -PuseLocalStarter=true
```

The `useLocalStarter` Gradle property affects only JVM dependency resolution. Without it, Maven Local is not consulted, even when the adjacent Starter repository exists.

You can select local TypeScript resolution without starting Vite:

```bash
corepack npm run starter:mode:local
```

## How VS Code TypeScript resolution works

The active mode is represented by the first project reference in [`frontend/tsconfig.json`](../frontend/tsconfig.json):

- `./tsconfig.app.json` resolves installed, published packages;
- `./tsconfig.local-starter.json` resolves declaration files from the adjacent local Starter repository.

The `starter:mode:*` commands update that reference. VS Code normally notices the project change automatically. If stale diagnostics remain, run **TypeScript: Restart TS Server** from the command palette.

The local project deliberately consumes Starter's emitted declaration files instead of pulling Starter source into the template's TypeScript project. This preserves each repository's compiler boundary and prevents duplicate React types and package-internal diagnostics from appearing in the template.

## Refreshing local declarations

Vite sees implementation changes immediately in local source mode. When a Starter public type or component API changes, rebuild the affected package so VS Code receives updated declaration files.

For Starter UI:

```bash
cd vireo
corepack npm run build --workspace @vireocodedev/ui
```

For changes across several Starter packages:

```bash
cd vireo
corepack npm run build
```

The template's local TypeScript mode will read the refreshed declarations automatically.

## Testing emitted package output

Use dist mode when validating the actual JavaScript and declarations emitted by Starter rather than source-mode HMR:

```bash
cd vireo
corepack npm run build

cd ../vireo-template/frontend
corepack npm run dev:local-starter:dist
```

This is an integration check, not the normal local development loop.

## Verification

Validate the template against local Starter declarations and emitted output with:

```bash
cd vireo-template/frontend
corepack npm run typecheck:local-starter
corepack npm run build:local-starter
corepack npm run verify:local-starter
```

Use the normal verification workflow when validating a release-compatible template:

```bash
corepack npm run verify
```

`verify` always selects and exercises published packages. `verify:local-starter` is the explicit integration suite for an adjacent `vireo` checkout.

## Command summary

| Command                                    | Starter runtime        | TypeScript API     |
| ------------------------------------------ | ---------------------- | ------------------ |
| `corepack npm run dev`                     | Published packages     | Published packages |
| `corepack npm run dev:local-starter`       | Local source           | Local declarations |
| `corepack npm run dev:local-starter:dist`  | Local emitted output   | Local declarations |
| `corepack npm run starter:mode:published`  | Does not start runtime | Published packages |
| `corepack npm run starter:mode:local`      | Does not start runtime | Local declarations |
| `corepack npm run build`                   | Published packages     | Published packages |
| `corepack npm run build:local-starter`     | Local emitted output   | Local declarations |
| `corepack npm run test`                    | Published packages     | Published packages |
| `corepack npm run test:local-starter`      | Local emitted output   | Local declarations |
| `corepack npm run storybook`               | Published packages     | Published packages |
| `corepack npm run storybook:local-starter` | Local source           | Local declarations |
| `corepack npm run test:e2e`                | Published packages     | Published packages |
| `corepack npm run test:e2e:local-starter`  | Local source           | Local declarations |
| `corepack npm run verify`                  | Published packages     | Published packages |
| `corepack npm run verify:local-starter`    | Local emitted output   | Local declarations |

The equivalent JVM distinction is:

| Command                                    | Starter JVM artifacts |
| ------------------------------------------ | --------------------- |
| `./gradlew build`                          | Published packages    |
| `./gradlew build -PuseLocalStarter=true`   | Maven Local           |
| `./gradlew bootRun -PuseLocalStarter=true` | Maven Local           |
