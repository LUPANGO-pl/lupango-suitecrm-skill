# Legacy retained inside SuiteCRM 8

This is an engineering decision procedure for inherited components that SuiteCRM 8 still uses. It is not a SuiteCRM 7 administration or development guide.

Use the [retained-component evidence map](../legacy-in-8-index.md) only after classifying the SuiteCRM 8 task. Each retained page has a supporting 8.x document from the same pinned SuiteDocs revision. This documents relevance, not blanket applicability of every old example to every release.

1. Confirm the SuiteCRM 8 release, active webroot and relevant request, write or render path. A version reported by `public/legacy/suitecrm_version.php` describes that component; corroborate the product release separately.
2. Identify ownership: 8.x backend/frontend/metadata, a retained legacy lifecycle, or both. Verify actual callers and registration. A `custom/` folder or a similar word in a legacy guide is insufficient evidence.
3. Read only the retained reference needed: SugarBean, vardefs, metadata, hooks, Extension framework, configuration/language, jobs, Module Loader or delegated administration. Inspect the supporting 8.x page and exact-release source before choosing executable code or a menu path.
4. Use a deployment-owned extension for the active lifecycle, preserving ACL, validation and API/import writers. Check recursion and duplicated side effects when a new handler delegates to old code. Trace the complete frontend/backend contract; UI visibility is not authorization.
5. For old UI customizations being migrated into 8, recover the business requirement and select supported metadata or frontend extensions. Do not copy legacy JavaScript, view overrides or themes merely because backend legacy still exists.
6. Document why the inherited dependency remains necessary, which callers it covers, focused tests, activation steps, rollback and a possible supported replacement. Avoid expanding the dependency when the 8.x mechanism already satisfies the task.

Keep historical migration context only where it explains retained behavior or reimplementation in SuiteCRM 8. Do not load complete 7.x user, administrator or developer manuals.
