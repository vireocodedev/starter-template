# Developing against local Starter libraries

The template can use either the published `@vireocodedev/starter-*` packages from `node_modules` or locally built packages from the adjacent `starter` repository.

The expected workspace layout is:

```text
vireocode/
├── starter/
└── starter-tenplate/
    └── frontend/
```

## Normal published-package development

Start the frontend with:

```bash
cd starter-tenplate/frontend
npm run dev
```

This mode:

- runs the application against the installed, published Starter packages;
- selects the published Starter TypeScript project automatically;
- makes VS Code and command-line TypeScript validate the published API.

You can select the published TypeScript mode without starting Vite:

```bash
npm run starter:mode:published
```

## Local Starter development

When changing Starter and testing those changes in the template, run only:

```bash
cd starter-tenplate/frontend
npm run dev:local-starter
```

This mode:

- consumes Starter TypeScript source directly through Vite;
- provides HMR without running all Starter package watchers;
- ignores Starter `dist` changes so they cannot cause a watcher feedback loop;
- selects the local Starter TypeScript project automatically;
- deduplicates shared React, Emotion, MUI, TanStack, Day.js, Sonner, and Zod runtimes.

Do not run Starter's monorepo `npm run dev` alongside this command. The template's Vite process owns the required source watcher.

You can select local TypeScript resolution without starting Vite:

```bash
npm run starter:mode:local
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
cd starter
npm run build --workspace @vireocodedev/starter-ui
```

For changes across several Starter packages:

```bash
cd starter
npm run build
```

The template's local TypeScript mode will read the refreshed declarations automatically.

## Testing emitted package output

Use dist mode when validating the actual JavaScript and declarations emitted by Starter rather than source-mode HMR:

```bash
cd starter
npm run build

cd ../starter-tenplate/frontend
npm run dev:local-starter:dist
```

This is an integration check, not the normal local development loop.

## Verification

Validate the template against local Starter declarations and emitted output with:

```bash
cd starter-tenplate/frontend
npm run typecheck:local-starter
npm run build:local-starter
```

Use the normal verification workflow after selecting published mode when validating a release-compatible template:

```bash
npm run starter:mode:published
npm run verify
```

## Command summary

| Command                          | Starter runtime        | TypeScript API     |
| -------------------------------- | ---------------------- | ------------------ |
| `npm run dev`                    | Published packages     | Published packages |
| `npm run dev:local-starter`      | Local source           | Local declarations |
| `npm run dev:local-starter:dist` | Local emitted output   | Local declarations |
| `npm run starter:mode:published` | Does not start runtime | Published packages |
| `npm run starter:mode:local`     | Does not start runtime | Local declarations |
| `npm run build`                  | Published packages     | Published packages |
| `npm run build:local-starter`    | Local emitted output   | Local declarations |
