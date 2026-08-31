# Governance

Vireo Starter Template is currently stewarded by the Vireo Code maintainers. This
document defines public decision authority without promising staffing or response
times.

## Roles and authority

- Contributors may propose issues, documentation, code, tests, and design feedback.
- Maintainers triage and review changes, manage releases and security, and preserve
  the Template's application/framework boundary.
- Ownership requests are declared in [`.github/CODEOWNERS`](.github/CODEOWNERS).
  Code ownership does not itself grant merge or release authority.
- Vireo Code maintainers make final roadmap, merge, release, moderation, security,
  and compatibility decisions.

There is no elected governing body or guaranteed route to maintainer status.
Maintainers may invite trusted contributors based on sustained technical judgment,
constructive participation, security practices, and capacity.

## Decisions, merge, and release

Routine decisions are made in issues and pull requests. Material changes must state
the user problem, alternatives, framework-versus-application ownership, migration
impact, and verification. Maintainers seek rough consensus when practical and record
the final trade-off in the relevant pull request or roadmap record.

Changes require independent review and the authoritative verification gate once a
second trusted maintainer is available. The current single-maintainer interim state
requires the same checks and resolved conversations but cannot enforce independent
approval without lockout; its [provider-control and backup-owner limitation](docs/provider-controls-2026-08-31.md)
remains open. Only authorized maintainers may merge, tag releases, approve protected environments, or coordinate
security fixes. The roadmap communicates intent, not a delivery commitment.

Compatibility and upgrades follow
[the Template compatibility policy](docs/starter-compatibility.md). General requests
follow [SUPPORT.md](SUPPORT.md), conduct concerns follow
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and vulnerabilities follow
[SECURITY.md](SECURITY.md).
