# Provider-control desired state and evidence — 2026-08-31

Status: **live machine controls applied and authenticated; environment administrator-bypass UI action open**

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

At `2026-08-31T21:05:49Z`, authenticated reads confirmed active no-bypass main
ruleset `21958166`, immutable-tag rulesets `21958135` for 0.7.0 and `21926710`
for 0.6.0, the exact selected/SHA-pinned Actions policy, read-only workflow
defaults without PR approval, an empty CODEOWNERS error list, and
`template-release` policies limited to branch `main` and tag pattern
`starter-template@*`. The environment still reports `can_admins_bypass: true`;
disabling that UI-only toggle and retaining a new authenticated GET response is
the remaining machine-provider action.
