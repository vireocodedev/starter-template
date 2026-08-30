# Recipe: rehearse the disposable demo

Use a dedicated local Compose project and an HTTP-only cookie override for this local rehearsal:

```bash
POSTGRES_OWNER_PASSWORD=local-demo-owner-only \
POSTGRES_RUNTIME_PASSWORD=local-demo-runtime-only \
SESSION_COOKIE_SECURE=false \
  docker compose -f compose.yaml -f compose.demo.yaml \
  --project-name vireo-flagship-demo-local up --build --detach --wait
```

Open <http://localhost:3000> and sign in with `demo` / `demo123`. The account can read the seeded flagship but cannot mutate inventory.

Reset only that disposable project:

```bash
POSTGRES_OWNER_PASSWORD=local-demo-owner-only \
POSTGRES_RUNTIME_PASSWORD=local-demo-runtime-only \
SESSION_COOKIE_SECURE=false \
VIREO_DEMO_COMPOSE_PROJECT=vireo-flagship-demo-local \
VIREO_DEMO_RESET_CONFIRM=reset-vireo-demo \
  ./scripts/reset-flagship-demo.sh
```

The second command destroys the named project's volumes. Never point it at an environment containing data that must survive.
