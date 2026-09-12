# Targeted environment checks

Engineering checklist for SuiteCRM 8; [review status](../playbook-review.md). Read only the section relevant to an observed failure or planned environment change. These are inspection inputs, not supported-version claims. Establish exact-release support through [source policy](../source-policy.md), and use [operations](operations.md) for execution and recovery.

## Upload failure or request-size errors

Compare the failing request's size and status with the effective web PHP configuration: `upload_max_filesize`, `post_max_size`, `memory_limit`, `max_execution_time`, upload temporary directory and writable destination. Inspect proxy/ingress and web-server body limits and timeouts as well. A CLI configuration dump does not establish web PHP settings. Identify the rejecting layer before changing limits; validate with a non-sensitive sample near the intended boundary and retain an oversized rejection check. Do not raise all limits speculatively.

## Database move, encoding errors or inconsistent query behavior

Record supported source/target database versions, charset and collation at database/table/column levels, effective SQL mode, storage engines and relevant custom indexes. Compare connection settings as well as schema defaults; a changed default does not convert existing columns. Inspect a representative failing query or sanitized record before proposing conversions. Validate affected text, sorting/search, uniqueness and relationships after a staged migration. Preserve a consistent restore point; collation and SQL-mode changes can alter application behavior beyond the failing query.

## Composer or dependency failure after deployment

Compare the deployed release artifact, `composer.lock`, installed package metadata, Composer version and PHP platform/extensions in build and runtime environments. Establish whether dependencies were installed from the lock file or changed with `composer update`. Check custom package constraints and artifact ownership. Restore or rebuild a known release artifact using its documented process; do not resolve production failures through an uncontrolled update or ignored platform requirements. Verify the original request and scheduled execution if they use different PHP runtimes.

## Container restart or multiple application replicas

Confirm which volumes persist uploads and application-owned writable state, which image/release each workload runs, and which instance owns scheduling. Check readiness/liveness probe targets and failure history: a passing static page does not prove an authenticated CRM request or database path works; a dependency outage should not cause an unexplained restart loop. For multiple replicas, inspect session storage/routing, shared-file visibility and configuration consistency. Diagnose intermittent login or missing-file behavior per replica before choosing shared storage or affinity. These checks do not establish that a particular image or topology is supported.

For Kubernetes, inspect the relevant PVC mounts, resource limits, termination events and CronJob concurrency/history. Inspect only the presence and wiring of secrets needed for the diagnosis, never emit their values. Starting a Job, restarting a workload or changing a probe is a state-changing operation; use the existing authorization and validate the business effect, not only pod health.
