# Doctor diagnostics and remedies

Run `corepack npm run doctor` for readable output or `corepack npm run doctor:json` for the stable machine-readable schema. Output contains versions and project-relative facts only; it does not print environment variables, credentials, or absolute personal paths.

| Code              | Meaning                                     | Remedy                                                                                                                                               |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VIR-ENV-001`     | Node is outside the supported major.        | Install Node 24.15 or newer, below 25.                                                                                                               |
| `VIR-ENV-002`     | Corepack npm is not 12.0.2.                 | Enable Corepack and activate npm 12.0.2.                                                                                                             |
| `VIR-ENV-003`     | A supported JDK is unavailable.             | Install JDK 21 and set `JAVA_HOME`.                                                                                                                  |
| `VIR-ENV-004`     | Optional Git initialization unavailable.    | Install Git if local version control is wanted.                                                                                                      |
| `VIR-PROJECT-001` | Vireo metadata is absent or malformed.      | Restore `.vireo/project.json` or recreate into a new directory.                                                                                      |
| `VIR-DEPS-001`    | Frontend install has not run.               | Run `corepack npm run setup`.                                                                                                                        |
| `VIR-DEPS-002`    | Vireo package declarations are unsupported. | Use a combination admitted by `contracts/vireo-package-compatibility.json`; packages are independently versioned and need not use identical strings. |
| `VIR-PORT-001`    | Port 8080 is occupied.                      | Stop or reconfigure the existing backend.                                                                                                            |
| `VIR-PORT-002`    | Port 3000 is occupied.                      | Stop or reconfigure the existing frontend.                                                                                                           |
| `VIR-DB-001`      | The selected database cannot start.         | For PostgreSQL, start Docker and verify `docker compose version`; H2 needs no service.                                                               |
| `VIR-PWA-001`     | PWA configuration is incomplete.            | Restore `VitePWA` configuration in `frontend/vite.config.ts`.                                                                                        |

After applying a remedy, rerun doctor. If the same code remains, include the JSON report in a support request; review it before sharing as you would any diagnostic output.
