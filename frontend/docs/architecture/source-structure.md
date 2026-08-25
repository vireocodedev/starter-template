# Source structure

```text
src/
├── @types/                 ambient declarations and module augmentation only
├── app/                    global composition and infrastructure
├── features/               reusable application capabilities
├── pages/                  route entry points and page-private code
├── main.css                browser and root-element fundamentals only
├── main.tsx                React bootstrap only
└── vite-env.d.ts
```

`app` has this stable shape:

```text
app/
├── App.tsx
├── app.localization.ts
├── app.pages.ts
├── app.providers.tsx
├── config/
├── data/network/
├── data/query/
├── shell/{components,contexts,hooks,layout,providers}/
└── ui/{assets,localization,preferences,theme}/
```

A feature uses only the directories it needs:

```text
features/<feature>/
├── public.ts
├── api/
├── assets/
├── components/
├── contexts/
├── hooks/
├── localization/
├── models/
├── offline/
├── providers/
├── services/
├── state/
├── storybook/              feature-level fixtures and stories when separation is clearer
└── tests/                  feature-local test support when it is not a repository-level test
```

Every reusable React component gets a PascalCase directory with its same-named implementation, test, and—when valuable—story. Component-private complexity goes under `internal/`. There are no component `index.ts` barrels.

Pages use kebab-case route directories. The route component lives directly in the page directory; private collaborators live in `internal/`. Pages do not export `public.ts` and never import other pages. Dev-tool page examples may mirror feature structure locally, without a nested `src/` directory.

File names are PascalCase for React components, contexts, providers, and model contracts; hooks start with `use`; non-React modules use descriptive kebab-case suffixes such as `.api`, `.query`, and `.localization`.
