# Engineering playbook review register

This register covers authored procedures, not official SuiteDocs pages. Official page identity and hashes remain in [provenance.json](provenance.json). A review date records an editorial scope/consistency review; it does not certify current product compatibility or a successful live test.

| Procedures | Editorial review | Scope | Evidence and verification limits | Review trigger |
| --- | --- | --- | --- | --- |
| All existing files in `playbooks/` except the two additions below | 2026-09-12 | SuiteCRM 8; legacy only on a proven 8.x path | Compared with the 2.0.1 entrypoint, source policy and supplied GPT package; inherited recommendations, no new live-instance or current-online verification | Contradictory case, relevant release/interface change or behavioral regression |
| [Environment checks](playbooks/environment-checks.md) | 2026-09-12 | SuiteCRM 8 deployment diagnosis | Adapted from supplied Knowledge 10 and 15; conditional inspection guidance, no certified runtime combinations or live results | Runtime/deployment change, failed upload, dependency or topology incident |
| [Known issues](playbooks/known-issues.md) | 2026-09-12 | Confirmed SuiteCRM 8 cases only | Record schema adapted from Knowledge 11 and 14; catalog currently contains no confirmed cases | Resolved incident with reusable evidence; later contradiction |

Primary decision sources are defined in [source-policy.md](source-policy.md). Supplied GPT checklists are engineering input, not official product evidence. Do not use a generic confidence score in place of exact-release applicability and a recorded observation.

When changing a procedure, give it a specific row if its review date, scope or evidence differs from the grouped row. Record what was actually verified and what remains unverified. For product-sensitive claims, record an exact-release source and verification date; for incident claims, record the case and test result. Do not advance dates for untouched procedures during a version bump. Recheck affected procedures after a relevant release or confirmed failure; periodically triage outstanding review triggers without claiming all sources were refreshed.
