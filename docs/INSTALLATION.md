# Installation

Download the appropriate ZIP and `manifest.json` from the same release. Extract into your SuiteCRM project, not into this skill's source repository unless you intend to use the skill there.

## Codex

Use `suitecrm-expert-skill-openai.zip`. From the target project's root, after placing the downloaded ZIP there:

PowerShell:

```powershell
Expand-Archive -LiteralPath ./suitecrm-expert-skill-openai.zip -DestinationPath ./.agents/skills
```

macOS/Linux (requires `unzip`):

```sh
mkdir -p .agents/skills
unzip suitecrm-expert-skill-openai.zip -d .agents/skills
```

The final path must be `.agents/skills/suitecrm-expert-skill/SKILL.md`. Invoke `$suitecrm-expert-skill` in Codex. If it does not appear, restart Codex and check the folder nesting. For personal installation across projects, Codex also supports `~/.agents/skills/`.

Alternatively, ask `$skill-installer` to install `skill/suitecrm-expert-skill` from this repository's GitHub URL. This installs the instruction-only source variant.

Official reference: [OpenAI skills documentation](https://learn.chatgpt.com/docs/build-skills). OpenAI recommends plugins for reusable distribution; this repository currently ships standalone skill folders, not a published plugin.

## OpenCode

Use `suitecrm-expert-skill-opencode.zip`.

PowerShell:

```powershell
Expand-Archive -LiteralPath ./suitecrm-expert-skill-opencode.zip -DestinationPath ./.opencode/skills
```

macOS/Linux:

```sh
mkdir -p .opencode/skills
unzip suitecrm-expert-skill-opencode.zip -d .opencode/skills
```

The final path must be `.opencode/skills/suitecrm-expert-skill/SKILL.md`. Ask OpenCode to load the skill by name. Check your skill permissions if it is not available. The optional scripts require Node.js 20+:

```sh
node .opencode/skills/suitecrm-expert-skill/scripts/search-docs.mjs --scope suitecrm-8 --limit 3 "save handlers"
node .opencode/skills/suitecrm-expert-skill/scripts/inspect-suitecrm.mjs .
```

Official reference: [OpenCode agent skills](https://opencode.ai/docs/skills/).

## Verify your download

Compare the SHA-256 against `variants.openai.sha256` or `variants.opencode.sha256` in the same release's manifest.

PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath ./suitecrm-expert-skill-openai.zip
```

Linux: `sha256sum suitecrm-expert-skill-openai.zip`. macOS: `shasum -a 256 suitecrm-expert-skill-openai.zip`. A matching checksum checks file integrity; it does not establish compatibility with your CRM.

## Update or uninstall

Keep a backup of any local edits outside the assistant's skill discovery folders. Replace the old skill folder with the new release; overlaying files can leave obsolete content. Avoid installing both variants under the same skill name. To uninstall, remove only the installed `suitecrm-expert-skill` folder from the chosen skills directory.

## Other OpenAI products

Use ZIP import only if the application exposes a compatible skill import feature. A successful local build does not establish acceptance by a hosted product. No API credentials, CRM credentials, or additional blanket shell permissions are needed just to read the skill.
