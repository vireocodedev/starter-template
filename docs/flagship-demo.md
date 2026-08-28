# Flagship demo operations

The repository contains a deployment-ready public-demo profile, deterministic synthetic data, a destructive reset procedure scoped to a dedicated Compose project, and an hourly synthetic read-only journey. It does **not** currently claim a public URL or uptime: those claims begin only after an external host is connected and evidence is recorded in `contracts/flagship-demo-policy.json`.

## Safety boundary

The flagship is a public sandbox, not a production or private test environment. It accepts synthetic public data only. Never connect its database, credentials, object storage, telemetry, or backups to another environment. The `demo` / `demo123` account is intentionally public and must have no access beyond this disposable deployment.

The Compose overlay activates `prod,demo`: production-safe error, documentation, and cookie defaults remain enabled while the deterministic development seed is installed into an otherwise empty dedicated database.

## Deploy

Build the normal production artifacts, then deploy with both Compose descriptors:

```bash
POSTGRES_PASSWORD=replace-with-a-dedicated-secret \
  docker compose -f compose.yaml -f compose.demo.yaml \
  --project-name vireo-flagship-demo up --build --detach --wait
```

Terminate TLS at the public ingress, retain the frontend security headers and same-origin `/api` proxy, and keep `SESSION_COOKIE_SECURE=true`. Publish only the frontend origin. The database and backend remain private network services.

## Reset

The reset destroys only the named demo project's volumes, rebuilds the deployment, runs migrations, and restores the deterministic seed. Run it at least every 24 hours and after abuse, unexpected content, or a failed evaluation journey:

```bash
POSTGRES_PASSWORD=replace-with-the-same-dedicated-secret \
VIREO_DEMO_RESET_CONFIRM=reset-vireo-demo \
  ./scripts/reset-flagship-demo.sh
```

This is intentionally destructive. Do not override `VIREO_DEMO_COMPOSE_PROJECT` with a shared or production Compose project.

## Availability evidence

After a host exists:

1. Set the repository variable `VIREO_DEMO_BASE_URL` to its HTTPS origin.
2. Set `VIREO_DEMO_USERNAME=demo` as a repository variable and `VIREO_DEMO_PASSWORD=demo123` as an Actions secret.
3. Run the **Flagship demo** workflow manually and require a green read-only journey.
4. Replace `publicUrl: null` in the policy with the verified URL and change `availabilityClaim` only when a measured claim and response owner exist.
5. Configure the host's scheduler to run the reset command within the 24-hour maximum interval.

The hourly journey verifies the public shell, authentication, live overview data, navigation, and seeded inventory without modifying shared state. A failure is deployment evidence, not automatically an uptime incident until an owner and service objective are explicitly assigned.
