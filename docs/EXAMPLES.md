# Usage examples

These are prompts and review criteria, not transcripts or evidence of completed operations. Share the SuiteCRM release, relevant sanitized files, and the desired result. The assistant can respond in your language.

## Investigate a scheduler

```text
Use suitecrm-expert-skill. My SuiteCRM 8 scheduler works when started manually,
but scheduled jobs do not run. Inspect the shared project and ask for any missing
runtime evidence. Explain the likely causes and how each can be verified.
```

Look for a distinction between repository evidence and actual scheduler runtime, release-appropriate commands, and an explicit way to verify the repair. A missing log or unknown service state should remain unknown.

## Plan validation across entry points

```text
Use suitecrm-expert-skill. Design Account validation for our SuiteCRM 8 release
that applies to the UI, API, and imports. Find an existing customization pattern
in the project and propose a small implementation with verification steps.
```

Look for the active save path, evidence supporting the extension point, and checks covering all requested entry points. UI-only validation does not establish API or import behavior.

## Recover from an integration error

```text
Use suitecrm-expert-skill. An n8n synchronization updated incorrect Account
records. Prepare a recovery plan using the sanitized mapping and execution
details I provide. Identify the affected records, backup needs, and verification
steps before proposing writes.
```

Look for explicit assumptions, a bounded affected set, and a recoverable procedure. Do not use real customer data in public bug reports.

For structured evaluation, use the [behavior rubric](../tests/behavior/rubric.md) and [scenarios](../tests/behavior/scenarios.md).
