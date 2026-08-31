# Support

Vireo Starter Template is a public `0.x` reference application maintained on a
best-effort basis. There is no guaranteed response or resolution time.

## Where to ask

- Use the bug form for a reproducible defect in the unmodified Template.
- Use the feature-request form for a proposal about the reusable Template baseline.
- Report a reusable Vireo package defect in the
  [Starter repository](https://github.com/vireocodedev/starter/issues).
- Follow [SECURITY.md](SECURITY.md) for suspected vulnerabilities. Never disclose
  vulnerability details in a public issue.

The maintainer-operated demo at <https://demo.vireocode.com> is a disposable
evaluation sandbox, not a hosted-service commitment. Report a reproducible outage
through the Template bug form. It is handled by repository maintainers on a
best-effort basis with no response-time or uptime SLA.

Include the Template revision or tag, exact Starter artifact versions, reproduction,
expected and actual behavior, and environment. Search existing issues first.

Release coordinates are published with the
[`starter-template@0.7.0` release contract](contracts/template-release-policy.json)
and its draft-and-publish
[GitHub release](https://github.com/vireocodedev/starter-template/releases/tag/starter-template%400.7.0).
Repository administrators must enable GitHub immutable releases before publishing.

## Immutable release recovery

Never move, delete, or recreate an immutable release tag. If a release workflow
needs recovery, use the reviewed `main` workflow-dispatch path with the existing
release tag and its expected commit
[`5b123e60bd1ce733ae70711796552a17aaa60fe3`](contracts/template-release-recovery.json).
Stop immediately if that tag already has a draft or published GitHub release;
investigate the existing release rather than attempting to replace it.

The `template-release` protected GitHub environment is the administrative
preflight gate. Its required reviewer checks immutable releases are still enabled
before approving a recovery or new release run. The workflow deliberately
does not attempt that administration-only API check with its repository token.
The update-and-deletion tag ruleset for `starter-template@0.6.0` must also be
active before recovery approval.

## Support boundary

The Template demonstrates integration; it is not a hosted service, generated
application, or private consulting engagement. Maintainers do not operate derived
applications or guarantee help with product-specific domain rules, authorization,
sensitive data, deployment, offline eligibility, conflict resolution, or changes
made after cloning. Application owners are responsible for those decisions and for
regularly integrating upstream fixes.

Issues may be closed when they cannot be reproduced on the unmodified Template,
concern unsupported versions, lack requested information, or belong to an
application or upstream package. An accepted report does not imply a delivery date.

Participation follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Use test data and
remove credentials, personal data, and confidential details from public reports.
