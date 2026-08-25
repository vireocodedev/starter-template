# Deployment

The template produces one Spring Boot artifact containing the compiled PWA. Production runs therefore deploy one JVM process and one PostgreSQL database.

## Build the artifact

The build needs read access to the Vireo GitHub Packages registries. Configure the credentials described in [Getting started](./getting-started.md), then run:

```bash
./gradlew clean bootJar
```

The deployable artifact is `build/libs/app.jar`. The deterministic name is intentional: the checked-in Dockerfile never guesses between a Spring Boot archive and a plain Java archive.

## Build and run the container

```bash
docker build -t starter-template:local .
POSTGRES_PASSWORD=change-me SESSION_COOKIE_SECURE=false docker compose up
```

`SESSION_COOKIE_SECURE=false` is only for an HTTP-only local container check. Keep the production default (`true`) behind HTTPS.

The image runs as an unprivileged user. Compose waits for PostgreSQL and probes `/actuator/health/readiness`; only Actuator health is publicly reachable. Do not expose the database port or the Actuator endpoint beyond the network boundaries that need them.

## Required production configuration

<table>
  <thead>
    <tr><th>Variable</th><th>Purpose</th></tr>
  </thead>
  <tbody>
    <tr><td><code>SPRING_DATASOURCE_URL</code></td><td>PostgreSQL JDBC URL</td></tr>
    <tr><td><code>SPRING_DATASOURCE_USERNAME</code></td><td>Database account</td></tr>
    <tr><td><code>SPRING_DATASOURCE_PASSWORD</code></td><td>Database secret</td></tr>
    <tr><td><code>SPRING_PROFILES_ACTIVE=prod</code></td><td>Enables production-safe application defaults</td></tr>
    <tr><td><code>SESSION_COOKIE_SECURE</code></td><td>Defaults to <code>true</code>; disable only for local HTTP checks</td></tr>
  </tbody>
</table>

Terminate TLS at the ingress or reverse proxy, forward the standard proxy headers, retain the default `HttpOnly` and `SameSite=Lax` session cookie settings, and store secrets in the deployment platform rather than an image or repository file.

## Release check

Before producing the image, run the same merge gate as CI:

```bash
./scripts/verify.sh
```

After deployment, verify readiness and then exercise login plus one authenticated API request through the public origin.
