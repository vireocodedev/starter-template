# Verification performance policy

The authoritative gate records wall-clock duration and GNU time peak resident set
size for all five stages. The machine policy is
[`contracts/verification-budget-policy.json`](../contracts/verification-budget-policy.json);
CI retains each run's `.verification-evidence/latest.json` for 90 days.

## Comparable evidence

- **Canonical host:** GitHub-hosted Ubuntu 24.04 x86-64.
- **Cache state:** clean checkout and `npm ci`; ordinary hosted Gradle/npm caches may
  be restored, and each artifact records the observed runner image.
- **Duration:** one wall-clock measurement per stage and for the complete gate.
- **Memory:** GNU time maximum RSS in KiB for each stage process tree; complete-gate
  peak RSS is the maximum stage value rather than a sum.
- **Baseline method:** the checked-in initial verified reference is replaced by the
  median of the latest five successful canonical-host runs when five comparable
  artifacts exist.

Measurements from heterogeneous developer hosts remain diagnostic and cannot change
the canonical baseline.

## Thresholds

| Stage             | Duration warning | Duration failure | RSS warning | RSS failure |
| ----------------- | ---------------: | ---------------: | ----------: | ----------: |
| Public contract   |              5 s |             10 s |     256 MiB |     512 MiB |
| Frontend contract |            180 s |            240 s |       6 GiB |       8 GiB |
| Browser smoke     |            110 s |            150 s |       3 GiB |       4 GiB |
| JVM build         |             90 s |            120 s |     1.5 GiB |       2 GiB |
| Container context |              5 s |             10 s |     256 MiB |     512 MiB |
| Complete gate     |            300 s |            420 s |       6 GiB |       8 GiB |

The initial complete-gate reference is 130 seconds and 4.02 GiB peak RSS. A warning
keeps the gate green but requires review before release; a failure threshold fails the
gate. The browser duration threshold retains the existing allowance for cold backend
assembly and Playwright startup.

## Baseline review and exceptions

Review the latest five canonical artifacts before changing a threshold. Use their
median and range, identify whether cache state or hosted-runner changes explain the
movement, and optimize or split work before increasing a limit.

A threshold increase requires a reviewed change recording:

1. the affected stage and canonical run artifacts;
2. the five-run median, range, and cache state;
3. the product or dependency change that caused the increase;
4. optimization or lane-splitting alternatives considered;
5. the smallest justified new warning/failure values; and
6. an owner and review date no more than 90 days later.

Emergency exceptions must be time-bounded, retain the failed evidence, and name the
condition that restores the original threshold or publicly revises the affected
support claim.
