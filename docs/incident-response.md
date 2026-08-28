# Incident response

This playbook covers availability, integrity, confidentiality, and recovery events
for an application derived from the Template. Replace role placeholders and contact
channels before production. Suspected vulnerabilities follow [SECURITY.md](../SECURITY.md)
and must not be discussed in public issues.

## Severity and roles

| Severity | Working definition | Initial action |
| --- | --- | --- |
| SEV-1 | Active data loss/disclosure, broad outage, or critical security compromise | Page incident commander and technical/security owners immediately |
| SEV-2 | Material degradation, failed release with user impact, or credible contained security risk | Assign commander and responders; begin frequent updates |
| SEV-3 | Limited impact with a safe workaround and no evidence of data/security loss | Track with an owner and bounded update cadence |

Assign one incident commander, an operations/technical lead, a communications owner,
and a scribe. The commander coordinates and decides; responders investigate and
execute approved actions. Record UTC times, hypotheses, commands/changes, evidence,
decisions, owners, and customer impact in a restricted incident log.

## Response loop

1. **Detect and declare:** validate the signal, set severity, open the incident log,
   page the required roles, and identify the affected revision/environment.
2. **Protect evidence:** retain request IDs, relevant sanitized logs/metrics/traces,
   deployment events, database state, and access records. Do not copy secrets or
   personal data into chat or public tickets.
3. **Contain:** stop a rollout, remove traffic, revoke/rotate credentials, disable a
   vulnerable path, or isolate systems as appropriate. Prefer reversible, scoped
   changes and record who authorized them.
4. **Recover:** use the rehearsed deployment rollback or
   [database recovery](database-recovery.md) path. Check schema/data compatibility
   before routing old binaries or restoring data.
5. **Validate:** require readiness plus user-facing checks, data-integrity checks,
   security checks, and stable telemetry. Continue observation for an explicit
   period before resolving.
6. **Communicate:** state known impact, mitigation, and next update time without
   speculation or sensitive details. Notify affected parties and regulators through
   application-owned legal/privacy procedures when required.

## Closure and learning

Resolution requires a written end time, impact summary, confirmed current state,
and owners for remaining risk. Produce a blameless review for SEV-1/2 events covering
timeline, detection gap, contributing technical/organizational factors, what worked,
and corrective actions with due dates. Update tests, alerts, runbooks, threat model,
and recovery rehearsal when the event exposed a missing control. Verify corrective
actions rather than closing them on documentation alone.

