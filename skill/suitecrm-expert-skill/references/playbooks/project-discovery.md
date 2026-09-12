> **Non-official engineering playbook:** Use [version-matched sources](../source-policy.md) for product evidence.

# Project Discovery

Choose only the discovery steps needed for this task. This procedure targets SuiteCRM 8, including inherited components it still executes. A legacy version file inside an 8.x tree may describe the legacy component rather than the product release. Keep each candidate labelled by its origin and corroborate the deployed release.

## Read-Only Discovery

1. Locate the deployed application root from repository and deployment evidence. Do not assume the visible working directory is the webroot or active release.
2. Establish the exact minor and patch release from installed package or release metadata. Corroborate with a second project or runtime signal when available; report contradictions.
3. Map the present architecture: Symfony services and extensions, Angular sources and built assets, metadata, API routes, and `public/legacy`.
4. Trace the actual request, write, and render paths relevant to the task. A Symfony entry may delegate work to retained legacy code, while metadata may select frontend behavior.
5. Identify deployment shape: public webroot, proxy, PHP CLI and web runtimes, database, workers, scheduler, cache, writable storage, and release layout.
6. Identify customizations through manifests, extension registration, configuration, and clean-release comparison. Before proposing a new service, hook, API route, metadata rule, scheduler, or frontend extension, search for a comparable local implementation and assess whether it is active, supported and upgrade-safe. Treat legacy code as active only when evidence proves its route or lifecycle is reached.
7. Classify any next command: **read-only**, **low-risk local**, **state-changing**, **destructive**, or **production-critical**. Discovery must remain read-only; show the bounded purpose, success signal and recovery path before a consequential command.
8. Record confirmed facts, conflicts, unknowns, and the next smallest safe inspection. A core modification requires comparison with a clean copy of the exact installed release; a differing file alone is only a possible modification. Ask for only evidence unavailable through authorized project access.

Discovery is non-mutating. Do not clear caches, build assets, repair metadata, run migrations, enable modules, or change services during this phase.
