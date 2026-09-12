# Lupango SuiteCRM Skill

Practical SuiteCRM 8 guidance for AI coding assistants: administration, customization, integrations, migrations, troubleshooting, and operations.

[Polski](README_PL.md) · [Installation](docs/INSTALLATION.md) · [Examples](docs/EXAMPLES.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

An independent community project, unaffiliated with SalesAgility, OpenAI, or OpenCode. It does not connect to your CRM by itself. The installed skill identifier remains `suitecrm-expert-skill`.

## What it helps with

- Diagnose scheduler, email, installation, and application problems.
- Plan SuiteCRM 8 customizations across backend, frontend, metadata, and API boundaries.
- Design integrations and recovery procedures with explicit verification steps.
- Find relevant material in a bundled snapshot of 226 SuiteDocs documents.

**Scope:** SuiteCRM 8. Legacy components are covered only where used inside SuiteCRM 8, including migration of customizations. Standalone SuiteCRM 7 administration and development are excluded.

## Get started

Download one ZIP from the repository's **Releases** page, or use the included files in [dist](dist/). Extract it into the destination below, keeping the `suitecrm-expert-skill` folder intact.

| Environment | Archive | Destination in your project | Requirements |
| --- | --- | --- | --- |
| Codex | `suitecrm-expert-skill-openai.zip` | `.agents/skills/` | Access to local skills |
| OpenCode | `suitecrm-expert-skill-opencode.zip` | `.opencode/skills/` | Node.js 20+ for optional scripts |

For Codex, start with:

```text
$suitecrm-expert-skill My SuiteCRM 8 scheduler works manually but not automatically. Help me investigate the project I shared.
```

For OpenCode, ask the assistant to load `suitecrm-expert-skill` and describe your task. Both packages have the same instructions and references; the OpenCode package additionally includes local search and inspection scripts. Install only one copy per environment.

See [installation, updates, and troubleshooting](docs/INSTALLATION.md), including Windows and macOS/Linux commands. Importing ZIP files into other OpenAI surfaces depends on that product's available import feature; acceptance has not been verified. A plugin-directory listing is not part of this release.

## Examples

```text
Design Account validation for SuiteCRM 8 covering UI, API, and imports.
Help me configure a sales report grouped by salesperson.
Plan recovery after an incorrect n8n synchronization; identify what to verify before any writes.
```

The [worked usage examples](docs/EXAMPLES.md) explain what context to provide and how to assess the result. They are example prompts, not recorded successful CRM operations.

## Build and verify

From this repository's root, with Node.js 20+ and npm available:

```sh
npm run build
npm run validate
npm test
npm run benchmark
npm run docs:check
```

No npm dependencies or install step are required. Build before running tests: the tests also inspect the generated archives. CI is configured for Windows and Linux on Node.js 20, 22, and 24.

The build checks source hashes and authored links, builds each archive twice, and checks byte-for-byte parity. [dist/manifest.json](dist/manifest.json) records archive SHA-256 checksums and file hashes. `docs:check` checks local integrity, not upstream freshness.

The optional source tools can also be run directly:

```sh
npm run search -- --scope suitecrm-8 --limit 3 "save handlers"
node runtime/inspect-suitecrm.mjs /path/to/suitecrm
```

## Evidence and limitations

See [validation history](VALIDATION.md) and the [current behavior rubric](tests/behavior/rubric.md). Retrieval scores measure finding labelled documents; they do not measure model answer correctness. Historical model results for version 1.x do not establish behavior quality for 2.x. Live CRM tests and host-app installation acceptance are not claimed.

The inspector reads selected metadata and checks architecture paths. It does not execute PHP, read `.env` files or logs, or establish live server health. A legacy component's version may differ from the SuiteCRM product version.

The documentation snapshot is pinned to SuiteDocs commit `663619ebfbdc28ba828cbe6a34fc685460b920a9`, retrieved on 2026-09-06. Its 22 retained legacy documents each have linked SuiteCRM 8 evidence. Verify applicability to the actual installed release before implementing changes.

## Contribute and maintain

Bug reports, reproducible examples, documentation corrections, and tested improvements are welcome in English or Polish. Start with [CONTRIBUTING.md](CONTRIBUTING.md). See [maintenance](MAINTENANCE.md), [security reporting](SECURITY.md), and the [code of conduct](CODE_OF_CONDUCT.md).

## Licensing

Original project code and instructions use the [MIT license](LICENSE). Copied SuiteDocs documentation retains **GFDL-1.3-or-later**, with its [license](skill/suitecrm-expert-skill/references/LICENSE-GFDL.md) and [attribution](skill/suitecrm-expert-skill/references/NOTICE.md). The MIT license does not relicense third-party documentation. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
