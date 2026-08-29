# Test coverage policy

The JVM `check` gate enforces whole-application JaCoCo floors of 65% line and
55% branch coverage. These floors sit below the reviewed 2026-08-30 baseline
(about 69% line and 60% branch) so ordinary instrumentation variation does not
make the gate flaky, while a material untested regression fails the build.

Coverage is a non-regression signal, not a substitute for contract, migration,
security, or browser tests. Raise the floors after adding meaningful tests. A
reduction requires a reviewed rationale in the same change; do not exclude new
production packages merely to preserve the percentage.
