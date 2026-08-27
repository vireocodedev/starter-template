# Verification performance budget

The authoritative gate records wall-clock duration for its four coarse stages and
enforces deliberately conservative CI regression tripwires:

| Stage             | Budget |
| ----------------- | -----: |
| Frontend contract |  240 s |
| Browser smoke     |  150 s |
| JVM build         |  120 s |
| Container context |   10 s |
| Complete gate     |  420 s |

The budgets are reliability limits, not performance targets. A passing command that
crosses one limit fails the gate, and CI retains `.verification-evidence/latest.json`
for 14 days. Review the stage output before increasing a limit; optimize or split the
work unless the added cost is intentional and documented.

The browser stage includes its `pretest` backend assembly plus Playwright's
full-stack startup. Its 150-second ceiling accommodates the 124.2-second cold
GitHub-hosted run observed during the public-package registry migration while
the unchanged 420-second complete-gate limit still catches aggregate regressions.

Wall-clock timing is now enforced. Peak memory and longer-term trend dashboards remain
follow-up evidence because heterogeneous developer hosts cannot provide comparable
RSS measurements. The retained CI records establish the canonical Ubuntu trend source.
