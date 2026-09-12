> **Non-official engineering playbook:** Use [version-matched sources](../source-policy.md) for product evidence.

# Integrations

1. Define direction, source of truth by entity and field, conflict ownership, reconciliation authority, and deletion semantics.
2. Establish the exact SuiteCRM release and deployed API V8 route. Retrieve authentication, endpoint, metadata, fields, filters, pagination, and errors from matching official and instance evidence.
3. Map stable external identifiers to SuiteCRM identifiers. Define uniqueness and lifecycle before synchronizing.
4. Make create, update, retry, and replay idempotent where duplicate delivery is possible. Persist a non-secret operation identifier and outcome.
5. Use a dedicated least-privileged integration identity with explicit module, record, and field permissions. Keep credentials outside source, URLs, examples, process arguments, logs, and shell history.
6. Validate request and response schemas. Bound timeouts and retries with backoff; retry only classified transient failures and respect rate limits.
7. Send exhausted operations to a controlled failure queue with correlation identifiers, value-free diagnostics, replay controls, and alert ownership.
8. Define compensation for partial cross-system success; a local database rollback cannot undo an accepted remote operation.
9. Test duplicates, reordering, stale updates, authorization failures, missing records, throttling, server failures, network loss, schema drift, reconciliation, and recovery.

Prefer supported APIs or controlled middleware over direct database writes. Minimize data leaving SuiteCRM and require authorization covering automated high-impact writes; preserve authorization already given. For AI output, erroneous batches and partial remote success, use [AI and recovery](integration-recovery.md).
