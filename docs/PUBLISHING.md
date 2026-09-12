# Publishing and releases

## Repository layout

Publish the contents of this project directory as the root of a standalone `lupango-suitecrm-skill` repository, titled **Lupango SuiteCRM Skill**. The installed skill identifier stays `suitecrm-expert-skill`. Do not publish its parent workspace with the older sibling projects. GitHub only discovers workflows at the repository root's `.github/workflows` path.

Include the source skill, runtime, tooling, tests, documentation, licensing, and the three current files in `dist`. Exclude `.validation-deps`, `node_modules`, `.worktrees`, local credentials, and `dist/archive`. Keep previous public releases in GitHub Releases.

## Initial repository setup

1. Create the public repository under the intended owner, with the project contents at its root.
2. Use the description: `SuiteCRM 8 agent skill for administration, customization, integrations and troubleshooting. Includes offline documentation and optional Node.js tools.`
3. Add topics: `suitecrm`, `suitecrm8`, `agent-skills`, `codex`, `opencode`.
4. Enable Issues, Discussions if you will maintain them, and private vulnerability reporting. Add a public maintainer contact for conduct reports.
5. Run CI, then configure branch protection for the actual CI check names. Require review for changes to release workflows.
6. Add a CI badge using the actual repository URL after the first run. Do not advertise an unexecuted workflow as passing.

The package has `private: true` to prevent accidental npm publication. GitHub distribution does not require changing it.

## Release procedure

1. Confirm `package.json`, skill metadata, changelog, and validation report agree on the intended release.
2. Run build, validate, tests, benchmark, and docs:check; commit updated packages and manifest with their sources.
3. Push the release commit and a matching version tag, for example `v2.1.0`.
4. The tag workflow repeats the six Windows/Linux and Node.js checks. It verifies version agreement, then creates a **draft** release with the exact Linux/Node 24 assets from that run.
5. Review the draft's notes, explain changes in English, and list actual validation and limitations. Use [the prepared 2.1.0 notes](releases/v2.1.0.md) for the first release.
6. Publish the draft. Tags should stay fixed once a release is public; fixes receive a new version.

If a draft already exists after a partial workflow failure, review and repair that draft rather than overwriting a published release. The workflow deliberately does not use `--clobber`.

## Community announcement

Suggested text:

> SuiteCRM Expert Skill is an independent, open-source SuiteCRM 8 skill for AI assistants. It combines practical workflows, 226 pinned documentation pages, and optional local search and inspection tools. Separate packages are available for Codex and OpenCode. Reproducible bug reports and tested improvements are welcome.

Add the actual repository/release link and one example from [EXAMPLES.md](EXAMPLES.md). Do not imply official endorsement, a marketplace listing, or tested live-CRM compatibility.
