# trailer

A Claude Code plugin with one skill, `product-trailer`, for producing a 45-75 second product feature trailer as code.

The skill walks Claude through the whole pipeline: understanding the feature from a PR or a description, writing a three-movement story (feel the pain, meet the feature, see the result), starting a local Appwrite and seeding it with realistic data, recording crisp footage with a headless browser (Playwright, clock-stepped frames, injected cursor, human pacing), composing the film in Remotion using the Appwrite Console design tokens, choosing transitions, writing short plain on-screen copy as designed slides rather than subtitles, picking licensed music, generating sound effects with ffmpeg, mixing, rendering and producing a thumbnail.

## Install

```bash
claude plugin marketplace add meldiron/skills
claude plugin install trailer@meldiron
```

Then in any project: `/trailer:product-trailer <feature name, PR link or description>`, or just ask for a trailer; the skill triggers on its own.

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
