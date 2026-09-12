# Contributing

Contributions in English or Polish are welcome. Please follow the [code of conduct](CODE_OF_CONDUCT.md).

## Report a problem

Use a bug report for incorrect guidance, broken installation, or tool failures. Include the skill version and variant, assistant environment, SuiteCRM version if relevant, sanitized reproduction steps, expected behavior, and actual behavior. Report security vulnerabilities through [SECURITY.md](SECURITY.md).

## Propose a change

Discuss large changes in an issue first. For a focused correction, open a pull request directly. Explain the problem, the resulting behavior, and the evidence supporting the change. Keep unrelated changes separate.

The canonical instructions live in `skill/suitecrm-expert-skill/`; optional tools live in `runtime/`; packaging lives in `tooling/`. Edit sources, then regenerate both ZIPs. Do not edit archive contents directly.

Use Node.js 20+ and run from the repository root:

```sh
npm run build
npm run validate
npm test
npm run benchmark
npm run docs:check
```

No dependency installation is needed. Include regenerated `dist` files when package contents change. Add meaningful regression coverage for behavior changes. Report skipped checks and explain what was not tested.

## Content and evidence

- Keep the scope to SuiteCRM 8 and legacy actually used within it.
- Link release-matched primary sources for technical corrections.
- Preserve source bytes, provenance, hashes, attribution, and third-party licenses when updating the corpus. Follow [MAINTENANCE.md](MAINTENANCE.md).
- Use synthetic or anonymized examples. Do not submit credentials, customer records, private prompts, or production dumps.
- Distinguish automated package checks, retrieval benchmarks, model evaluations, and live CRM tests. A checklist is not a test result.
- For changes to guidance, use the [behavior rubric](tests/behavior/rubric.md) and update the review register where relevant.

By submitting original contributions, you agree to distribute them under this project's MIT license. Third-party material retains its applicable license and attribution; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
