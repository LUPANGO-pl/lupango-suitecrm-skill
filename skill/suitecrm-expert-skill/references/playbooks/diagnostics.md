> **Non-official engineering playbook:** Use [version-matched sources](../source-policy.md) for product evidence.

# Diagnostics

## Investigation

1. State the observable symptom, scope, onset, frequency, last known good state, and relevant recent change without turning assumptions into facts.
2. Assign the failing layer: proxy/runtime, Symfony backend, Angular frontend, metadata/cache, API V8, database/queue, or a proven `public/legacy` lifecycle.
3. Collect the minimum local evidence that distinguishes likely causes: exact release, correlated request identifier, first error, service state, browser network state, queue state, or relevant project diff.
4. Rank hypotheses by evidence fit and blast radius. Run the smallest read-only check that separates the leading causes before retry, repair, or mutation.
5. Apply the root fix through documented configuration or an extension point. Gate cache repair, task replay, schema changes, and data edits on production safety controls.
6. Validate the original symptom, adjacent paths, affected roles, data integrity, and new errors. State what remains untested.

## Shareable Output

Diagnostics intended for sharing may contain only allowlisted key names, aggregate counts, approved relative paths, and non-secret hashes. They must not contain complete lines, values, or logs. Do not emit environment contents, request bodies, assertions, tokens, connection strings, personal data, or arbitrary matched text.

Redaction by pattern is not proof that output is safe. If safe redaction cannot be guaranteed, request local review instead of producing or sharing diagnostic output. Give the reviewer categories to check, not a command that prints potentially sensitive source material.

## Reusable cases and environment detail

For a potentially recurring incident, consult [confirmed issue records](known-issues.md); match release and evidence before reusing a fix. After a verified resolution, use its record format to propose a sanitized reusable case. For upload, database, dependency or multi-replica failures, read the relevant section of [targeted environment checks](environment-checks.md). Authored procedure review limits are in the [review register](../playbook-review.md).
