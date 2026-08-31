# G-108 verification trend review — 2026-09-01

Status: **closed for machine-controlled evidence**.

This review uses five successful comparable GitHub-hosted Ubuntu 24.04 x64
verification artifacts. Each uses a clean checkout and `npm ci`; normal hosted
Gradle/npm caches may have been restored. The artifacts use the schema-2 duration
and GNU-time peak-RSS method from
[`contracts/verification-budget-policy.json`](../contracts/verification-budget-policy.json).

| Reviewed run artifacts |
| --- |
| [33440030679](https://github.com/vireocodedev/vireo-template/actions/runs/33440030679), [33440602221](https://github.com/vireocodedev/vireo-template/actions/runs/33440602221), [33442142616](https://github.com/vireocodedev/vireo-template/actions/runs/33442142616), [33442996549](https://github.com/vireocodedev/vireo-template/actions/runs/33442996549), and [33447132389](https://github.com/vireocodedev/vireo-template/actions/runs/33447132389) |

| Reviewed metric | Median | Range |
| --- | ---: | --- |
| Complete duration | 230,245 ms | 185,006–238,340 ms |
| Complete peak RSS | 2,782,792 KiB | 2,715,396–2,884,548 KiB |
| Frontend-contract duration | 166,632 ms | 123,529–169,543 ms |
| Frontend-contract peak RSS | 2,782,792 KiB | 2,715,396–2,884,548 KiB |

Each linked run retains `.verification-evidence/latest.json` for 90 days, including
the schema, observed host, cache statement, durations, and peak RSS. All five runs
were clean.

## Decision

The policy adopts every observed stage and complete-gate duration/RSS median as its
baseline. Warning and failure limits are
unchanged because the comparable records did not approach them. Review again after
the next five comparable canonical-host records or before changing a relevant gate.

This closes G-108's machine evidence only. It does not pass any independent,
unfamiliar-user, physical-device, assistive-technology, recovery-witness, or
adopter gate.
