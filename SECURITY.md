# Security policy

## Supported versions

The current `main` branch and the latest tagged template release receive security updates. Applications created from the template own their deployed versions and must regularly merge or port upstream fixes.

## Reporting a vulnerability

Do not open a public issue. Use GitHub private vulnerability reporting for `vireocodedev/starter-template` and include the affected revision, reproduction steps, impact, and proposed mitigation when available.

Maintainers target acknowledgement of a complete report within five business days.
This is a response target, not a guaranteed remediation deadline. Confirmed issues
are handled through a private advisory and coordinated disclosure when appropriate.

The `dev` profile intentionally creates documented sample users. It must never be enabled in a public environment. Never include production credentials or personal data in a report.

GitHub secret scanning and push protection supplement the repository-owned weekly
full-history Gitleaks scan. A clean scan reduces known exposure; it does not prove a
credential was never copied or exposed elsewhere.
