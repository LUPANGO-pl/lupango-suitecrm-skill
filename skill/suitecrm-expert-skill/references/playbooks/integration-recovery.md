# AI integration and recovery

Extend [integrations](integrations.md) for AI output or incorrect external writes. This is engineering guidance; verify the actual release/API contract.

## AI-assisted workflows

Identify the business decision, data sent outside CRM, model-output schema and authorized write scope. Treat retrieved CRM text and model output as untrusted data. Minimize personal data; exclude credentials. Validate structure, identifiers, permitted values and business constraints server-side before a write. Model confidence is not authorization. Use human review for high-impact decisions; preserve existing user authorization for low-impact bounded automation. Handle timeout, malformed output and duplicate deliveries without duplicate writes. Do not invent an OpenAI/Ollama endpoint or tool connection from the brief.

## Incorrect records or partial success

1. Determine whether the writer is still active and how to contain it without interrupting unrelated work. Obtain any missing authorization before disabling a production integration. Preserve evidence and operation identifiers.
2. Identify the exact batch using stable external/correlation IDs, integration identity and audit history. A broad timestamp is only a search clue. Distinguish newly created records from updates, relationships and legitimate subsequent user edits.
3. Establish previous values and affected relationships, attachments and audit implications. Prepare a bounded report and recovery copy locally; do not publish raw client records.
4. Choose compensation restoring known values, supported deletion of positively identified erroneous creations, or idempotent reprocessing from the source of truth. Do not produce executable mass cleanup SQL from guesses. Define stop conditions, dry-run output and recovery for the chosen change.
5. For success in one system and failure in another, reconcile both systems. A local transaction rollback cannot undo an accepted remote operation. Assign compensation/reconciliation ownership and prevent stale retries overwriting newer data.
6. Validate exact records, counts, relationships, UI/API visibility, audit trail and business process. Resume/replay only within authorized scope after fixing the root cause and protecting against duplicates.
