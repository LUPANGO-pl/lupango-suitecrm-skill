> **Non-official engineering playbook:** Use [version-matched sources](../source-policy.md) for product evidence.

# Upgrades And Migrations

1. Establish exact source and target patch releases from installation and release artifacts. Do not substitute a minor family or an assumed newest release.
2. Verify official release, upgrade, migration, compatibility, support, and security material live when possible. When offline, identify the pinned evidence date and leave changing requirements unconfirmed.
3. Match version-sensitive commands and code to the installed or target release. Moving development branches are discovery leads, not release proof.
4. Inventory extensions, metadata, `public/legacy/custom`, core differences, schema, integrations, jobs, authentication, files, and generated assets.
5. Build a compatibility matrix across each step: PHP CLI and web runtimes, database, operating environment, frontend toolchain, package type, and supported intermediate releases.
6. Rehearse the exact artifacts and command sequence on a restored production clone. Prove expected source and destination layouts before any destructive step.
7. Reconcile code, metadata, schema, records, relationships, files, queues, roles, APIs, jobs, and business invariants.
8. Set measurable go/no-go criteria for restore readiness, duration, tests, unexplained errors, data reconciliation, and rollback viability.
9. Roll back coupled code, database, files, configuration, and routing in a rehearsed order. Preserve failed-state evidence first.

For SuiteCRM 7 to SuiteCRM 8 migration, do not transplant legacy UI or core modifications. Re-evaluate each customization against the exact SuiteCRM 8 architecture and prove any retained legacy path remains active.
