> **Non-official engineering playbook:** Use [version-matched sources](../source-policy.md) for product evidence.

# Production Safety

Apply this procedure to consequential production work, not ordinary questions or reversible local edits. Preserve authorization already given. Prepare a concrete bounded action before asking for missing approval; do not infer deployment permission from code-edit permission.

## Before Change

1. Contain incidents without destroying evidence. Record the timeline, first error, affected scope, active writers, and accountable owner.
2. Reproduce the topology and data shape in staging or explain why an equivalent rehearsal is impossible.
3. Create backups for every coupled state: code, configuration, database, user files, keys, and relevant queues. Verify integrity and rehearse restore.
4. Positively identify affected records and paths. Broad timestamps or guesses do not justify deletes or mass updates.
5. Define the change window, communications, writer/worker controls, monitoring, acceptance checks, rollback trigger, and restore order.
6. Confirm that authorization covers the destructive or high-impact action and its scope. If it does not, obtain it after presenting impact and recovery evidence.

## During And After

Apply the smallest bounded reversible change through a supported mechanism. Make failures observable; do not let logging pipelines hide command status. For database work, understand transaction and application-side effects before mutation, and prefer rollback during rehearsal.

Validate affected roles, UI, API, jobs, data reconciliation, performance, and logs against stated success criteria. Preserve failed-state evidence before rollback. Reopen traffic under the agreed acceptance and authorization conditions, then monitor through the rollback window.
