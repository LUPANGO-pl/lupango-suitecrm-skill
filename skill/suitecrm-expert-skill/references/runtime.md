# Optional runtime tools

OpenCode packages include these scripts. The OpenAI package deliberately works through direct reference reads and contains no scripts. In the source repository the same tools are in `runtime/`.

Run from the installed skill directory, using an absolute script path if the current directory differs:

```text
node scripts/search-docs.mjs --scope suitecrm-8 --limit 3 "save handlers"
node scripts/search-docs.mjs --scope legacy-in-8 --limit 3 "logic hooks"
node scripts/search-docs.mjs --scope shared-api-v8 --limit 3 "authentication"
node scripts/inspect-suitecrm.mjs /absolute/path/to/application
```

Search accepts `--json`, `--scope`, `--topic`, `--limit` and an English documentation query. Translate a Polish request into a concise English query while answering in Polish. Choose scope before searching; returned matches are evidence to inspect, not a complete answer. Results disclose scope, source URL and freshness. Inspection reads only known version metadata and reports architecture/deployment presence plus a presence-only inventory of manifests and common customization surfaces. It does not execute PHP, start services, traverse logs, print configuration, list custom names, or diagnose core edits. Version candidates are not proof of the deployed web release; a SuiteCRM 8 tree may contain legacy version metadata. Follow the discovery procedure to corroborate them.
