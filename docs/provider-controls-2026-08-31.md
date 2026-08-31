# Provider-control desired state — 2026-08-31

Status: **source-reviewed desired state; not live-provider evidence**

The Template's `.github/settings/actions.json` (including SHA pinning) and
`selected-actions.json` are separate GitHub REST PUT payloads. The `template-release.json` environment PUT
payload is separate from its `.deployment-branch-policies.json` POST collection;
they must not be sent as one combined payload.

`template-release.live-assertions.json` retains the required no-administrator-
bypass state. GitHub does not expose that environment setting through the
documented REST or GraphQL schemas used here, so a maintainer must disable it in
the GitHub UI and retain both UI confirmation and an authenticated environment GET
export. The sole currently evidenced owner is `@brunotot`; independent review and
a backup-owner recovery exercise remain open until a second trusted maintainer is
available.
