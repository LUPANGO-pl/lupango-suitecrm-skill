> **Non-official engineering playbook:** Use [version-matched sources](../source-policy.md) for product evidence.

# Customization Routing

The table classifies SuiteCRM 8 concerns; it does not establish a universal Symfony write path. Use [retained legacy](legacy-in-8.md) only when a SuiteCRM 8 route or lifecycle requires it.

| Proven concern | Preferred surface | Evidence required |
| --- | --- | --- |
| Business rule or server-side record flow | Backend extension on the proven lifecycle; may delegate to legacy | Exact installed interface and every actual write path |
| Interactive client behavior | Angular frontend extension | Release-matched scaffold, component path, and build contract |
| Fields, layouts, actions, or view logic | Metadata before custom code | Resolved metadata and actual render path |
| External JSON/OAuth behavior | API V8 or controlled middleware | Deployed route, grants, schema, ACL, and error contract |
| Executed legacy lifecycle | `public/legacy/custom` extension | Exact release source and runtime proof that the legacy path is active |

Use backend enforcement for authorization, integrity, and critical business rules across all proven writers. Frontend validation can improve interaction but is not the security boundary.

For example, a save-validation request is not automatically Angular work: use metadata if it expresses the rule, Angular for interaction, backend enforcement for critical validity, and retained legacy only when the observed save path reaches it.

Before copy-paste code, verify the complete release-matched contract between consumer and producer: payload, operation discriminator, registration, ACL convention, activation, and failure response. If any side remains unproven, provide a verification procedure instead of executable code.

Place changes in a deployment-owned extension. Record callers covered and excluded, activation/cache/build effects, focused tests, upgrade implications, and a disable or removal rollback. Do not edit core or generated assets when a documented extension exists.
