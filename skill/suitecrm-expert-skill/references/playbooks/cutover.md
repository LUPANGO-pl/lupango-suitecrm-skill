# Migration acceptance and cutover

Use with [upgrades and migrations](upgrades-migrations.md). Decide using evidence, not the fact that the new login page loads.

Inventory source and target release/runtime, custom fields/modules/relationships, core patches, frontend changes, workflows, reports, jobs, mail, authentication and API consumers. Record for each customization: retain with exact-target evidence, reimplement at a supported surface, or retire with business agreement. Verify both legacy and new paths where applicable.

Before cutover, reconcile record and relationship counts and inspect representative data, uploaded files and audit history. Test actual roles including denied access, key create/edit/search/report flows, workflows, scheduler, inbound/outbound mail and integration contracts. Compare performance to an agreed baseline and collect business-user acceptance.

Define go/no-go criteria, owner, downtime, writer freeze/delta synchronization, monitoring and rollback window. Establish backup consistency and restore order across database, files, uploads, configuration and remote integrations. Decide how post-cutover writes would be preserved or reconciled if reverting. Document explicit rollback triggers and point after which rollback requires a new data reconciliation plan.

Prepare the concrete deployment and validation before asking for missing execution approval. Existing cutover authorization need not be requested again. Reopen traffic or resume workers only within agreed acceptance criteria and authorization; report unresolved failures instead of declaring success from partial checks.
