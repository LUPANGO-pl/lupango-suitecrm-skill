# Confirmed issue records

Engineering reference for SuiteCRM 8; [review status](../playbook-review.md). Consult this catalog when an incident matches a recorded symptom and environment. A matching symptom alone does not establish a cause. Follow [diagnostics](diagnostics.md) to distinguish competing explanations.

No confirmed incident records have been supplied for this catalog yet. HTTP 500, a blank page or a failed scheduler are symptom classes, not confirmed product defects. Do not invent cases to populate the catalog.

## Record a resolved case

Use this format after evidence establishes the cause and the fix has been checked:

- **ID and symptom:** stable case ID, observable failure and business impact.
- **Applies to:** exact SuiteCRM 8 release, relevant web/CLI runtime, deployment shape and affected request/job path. For retained legacy, record the evidence that 8 executes it.
- **Cause and discriminating evidence:** what confirmed the diagnosis; which plausible alternatives were excluded. Use sanitized fixtures or source references, not production log dumps.
- **Fix:** smallest verified change, prerequisites, activation and side effects. Distinguish a workaround from a root fix.
- **Validation:** original symptom, affected roles/callers and business result; date, environment and actual outcome.
- **Recovery:** reversal steps, data or external effects that reversal does not undo, and stopping conditions.
- **Sources and status:** exact-release source or issue URL where available, last review date, known limitations and conditions requiring revalidation.

Preserve useful technical facts while removing customer identifiers and secrets according to [diagnostics output rules](diagnostics.md). If sanitization removes the evidence needed to establish causality, keep the entry provisional outside the confirmed catalog. Do not generalize one installation's fix to all 8.x releases. Link a regression scenario to each reusable case; retire or narrow entries contradicted by later evidence.
