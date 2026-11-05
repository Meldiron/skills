# skills

Claude Code plugins and Agent Skills by [Matej Bačo](https://github.com/meldiron) and colleagues.

## Install

```bash
claude plugin marketplace add meldiron/skills
claude plugin install trailer@meldiron
```

Update later with `claude plugin update trailer@meldiron`. To make it part of a repo for everyone who opens it, run the first command with `--scope project` inside that repo; it writes `extraKnownMarketplaces` and `enabledPlugins` into `.claude/settings.json`.

## Plugins

| Plugin | Skills | What it does |
|---|---|---|
| `trailer` | `product-trailer` | Produce a ~60s feature trailer: story beats, headless-browser recordings against local Appwrite, Remotion composition in Appwrite Console style, music, SFX, transitions, render |

## Repository layout

```
.claude-plugin/marketplace.json       # lists the plugins
plugins/<plugin>/.claude-plugin/plugin.json
plugins/<plugin>/skills/<skill>/SKILL.md
plugins/<plugin>/skills/<skill>/{references,scripts,assets}/
```

Validate a change with `claude plugin validate plugins/<plugin>` before pushing.

## Licence

MIT. Appwrite logos in `plugins/trailer/skills/product-trailer/assets/logos` are Appwrite's and follow the [brand guidelines](https://appwrite.io/assets).
