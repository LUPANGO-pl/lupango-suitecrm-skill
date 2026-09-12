# SuiteCRM operations

Engineering guidance scoped to SuiteCRM. Retrieve the actual release procedure through [sources](../source-policy.md). Diagnose before tuning; preserve minimal evidence and use [production safety](production-safety.md) for consequential changes.

## Scheduler and background work

If manual execution works, compare the automated invocation with it: identity, working directory, PHP CLI version/config versus web PHP, environment availability, paths, permissions, timezone, frequency and concurrent runners. Determine whether execution is cron, systemd timer, container process, Kubernetes CronJob or hosting-panel scheduling. Inspect the configured command; never invent a universal scheduler command across releases and legacy runtimes.

Check enabled jobs, last successful run and queued/failed status. In containers verify persistent paths and which instance owns scheduling; in Kubernetes verify schedule/timezone, concurrency, resources and job status. Do not create another runner as a speculative fix. Running a job can send mail or change records: replay only after classifying side effects and authorization. Verify timestamp advancement and the intended business result, not only exit status.

## Email

Separate inbound retrieval, outbound transport and queued campaign/notification work. Check the relevant account and provider mode, SMTP/IMAP transport, OAuth/token expiry, network reachability, sender restrictions and scheduler dependency. Do not print tokens or request complete credentials. A live send requires authorization; use a controlled recipient and verify provider acceptance and actual delivery when authorized.

## Performance and runtime

Measure an affected request/job against a known-good sample: latency, error rate, data volume and role. Locate the bottleneck among queries/indexes, expensive hooks, external latency, PHP-FPM saturation, memory limits, disk, background load or frontend network/assets. Index or configuration changes need query/runtime evidence, not speculative tuning. A CLI PHP check does not prove web PHP compatibility.

For HTTP 500 or blank page, correlate the first error with recent code/dependency/runtime changes before cache repair. Verify active release, document root, assets, ownership and writable directories. Do not use broad permission changes or expose sensitive paths/configuration.

## Deployment and recovery

For a deployment, inventory code/configuration, database, uploads, secrets and persistent storage; establish how to restore their consistent state. Verify image/tag or release identity, webroot, proxy/TLS and worker strategy from evidence. Stage and test changes proportionally to impact. A successful rollback of files alone may not reverse schema changes, remote integrations or user writes since cutover.

For task-specific PHP upload limits, database settings, Composer artifacts or replica/session checks, use [targeted environment checks](environment-checks.md). Load only the section needed to distinguish the observed failure or validate the planned change.
