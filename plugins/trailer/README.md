# trailer

A Claude Code plugin with one skill, `product-trailer`, for producing a 45-75 second product feature trailer as code.

The skill walks Claude through the whole pipeline: understanding the feature from a PR or a description, writing a three-movement story (feel the pain, meet the feature, see the result), starting a local Appwrite and seeding it with realistic data, recording crisp footage with a headless browser (Playwright, clock-stepped frames, injected cursor, human pacing), composing the film in Remotion using the Appwrite Console design tokens, choosing transitions, writing short plain on-screen copy as designed slides rather than subtitles, picking licensed music, generating sound effects with ffmpeg, mixing, rendering and producing a thumbnail.

## Install

```bash
claude plugin marketplace add meldiron/skills
claude plugin install trailer@meldiron
```

Then in any project, ask the way you would ask a colleague. The skill triggers on its own, or call it with `/trailer:product-trailer`.

```
Make a trailer for the new API key rotation feature. PR is appwrite/appwrite#15300.
```

```
Can you make a 60s launch video for Database backups? It's in Console under Databases → Backups.
Dark theme, no voiceover, it's going on X.
```

```
We're shipping bulk row operations in TablesDB next week. Here's the docs page draft: docs/bulk.md.
Make a narrated trailer, calm Apple-style voice, and show it from the SDK side not the Console.
```

```
Record a 10 second clip of creating a bucket in my local Console, I'll cut it myself.
```

Claude will read the PR or docs, send back a short story outline, and only then start recording and composing. If it cannot tell what the feature does or who it is for, it asks first.

## Voiceover

Narration uses ElevenLabs through the MCP1 gateway. Connect it once:

```bash
claude mcp add --transport http appwrite https://mcp1.com/mcp/appwrite/general
```

Each spoken line is generated as its own clip, scenes are sized to the clips, sound effects are kept out of the voice windows, and the music ducks under every line with fades.

## Requirements on the machine

Docker (for local Appwrite), Node 20+, ffmpeg, Playwright's Chromium (`npx playwright install chromium`). Remotion needs a company licence for teams of 4 or more people. Aeonik Pro, the Console's display font, is licensed to Appwrite and is not bundled; the skill explains where to get it and falls back to Inter.

## Contents

```
skills/product-trailer/
├── SKILL.md                 # workflow, non-negotiables, reference map
├── references/              # intake, story, copy, local-appwrite, recording, remotion, design-tokens, layouts, transitions, audio
├── scripts/                 # record.ts, login.ts, frames-to-mp4.sh, make-sfx.sh, mix-check.sh
└── assets/                  # official Appwrite logo SVGs, cursor.css, fixtures.json, script.schema.json
```
