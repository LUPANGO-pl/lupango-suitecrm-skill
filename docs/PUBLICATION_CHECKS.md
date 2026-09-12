# Publication preparation checks

Date: 2026-09-12. Local environment: Windows, Node.js 24.14.0.

| Check | Actual result |
| --- | --- |
| `npm run build` | PASS; 253 core files, 226 upstream documents, two deterministic archives |
| `npm run validate` | PASS; both archives match their sources and manifest |
| `npm test` | 43 tests: 41 passed, 0 failed, 2 skipped because file symlinks are unavailable in this Windows environment |
| `npm run benchmark` | 24 cases; hit@3 1.0, recall@10 1.0, MRR 0.9375 |
| `npm run docs:check` | PASS; local integrity only |
| Community YAML files | All six files parsed successfully with the existing local PyYAML library |
| New English documentation links | 33 local links resolved |
| `git diff --check` | PASS; Git emitted a line-ending notice for the parent workspace's `.gitignore` |

The initial sandboxed build could not create its temporary directory, and the sandboxed YAML check could not load the existing library fully. Both checks passed after approved execution with the required local access.

Archive SHA-256 values:

- OpenAI: `e47cbee985b378fa9efe108c3cb1557ebd683c2d90ff350ece923d56e774de10`
- OpenCode: `b26b33f9464c72182c60354179f1141532cd0f17ca57555f108446da393f70dd`

GitHub-hosted CI, Linux/Node 20/22 runs, live assistant installation, hosted ZIP import, and live CRM operation have not been performed in this preparation run. Parsing workflow YAML is not execution on GitHub Actions. Refer to the actual workflow run before publishing CI status claims.
