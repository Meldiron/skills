---
name: product-trailer
description: Produce a ~60 second product feature trailer video as code. Covers the whole pipeline - story beats (pain, feature, celebration), copy rules, recording crisp footage with a headless browser against a locally running Appwrite, composing in Remotion with the Appwrite Console design language, slides instead of subtitles, transitions, music and sound effects, and rendering. Use this whenever someone asks for a trailer, launch video, promo, feature announcement video, demo video, teaser, or "a video for this PR/feature", even if they do not say Remotion or Playwright. Also use it for parts of that pipeline on their own - recording a product demo, making a logo intro, choosing transitions, or writing on-screen copy for a product video.
argument-hint: <feature name, PR link, or description>
---

# Product trailer

You are making a 45-75 second video that convinces a developer a feature is worth trying. Two things decide whether it works: the story is true to the feature, and every frame looks like it came out of Appwrite's own design team. The rest is tooling.

## Workflow

1. **Understand the feature.** Read the PR, branch, docs or description. Fill the brief in `references/intake.md`. If you cannot state the pain point in one sentence a developer would nod at, ask before building. Send a 5-8 line story outline back and get a yes (skip the wait if told to run autonomously).
2. **Pick the shape and the look.** One story shape from `references/story.md`, one set of variety choices from `references/layouts.md`. Write them down in `script.json` so the next person can see the decisions.
3. **Set up the backend.** Local Appwrite with seeded, realistic data: `references/local-appwrite.md`. Record against `http://localhost`, never against Cloud or real projects.
4. **Record footage.** Playwright, clock-stepped PNG frames, DPR 2, injected cursor, human pacing: `references/recording.md` and `scripts/record.ts`. Run every take in `--mode smoke` first and look at the PNGs, then record. One take per shot, each with its `.events.json` click log. Keep the full 3200x1800 frames: footage is shown zoomed in, so convert with `scripts/frames-to-mp4.sh` at scale 1.
5. **Compose in Remotion.** Install the official Remotion skills first (`npx skills add remotion-dev/skills`), then `references/remotion.md`. Theme from `references/design-tokens.md`, layouts from `references/layouts.md`, motion from `references/transitions.md`. Beat sheet lives in `script.json` and drives the composition.
6. **Write the copy** last, once the footage shows what it shows: `references/copy.md`. Short, concrete, no slop, no subtitles, and no labels sitting on footage either.
7. **Voice.** Trailers are narrated unless the brief says otherwise. Write one spoken line per scene, generate each line as its own clip with ElevenLabs through the MCP1 gateway, download the clips, then run `scripts/voice-timeline.ts` to size scenes to the clips and catch SFX collisions: `references/voice.md`.
8. **Audio.** Music chosen, licensed or generated per `references/audio.md`, its drop located with `scripts/find-drop.sh` and trimmed so it lands on the reveal, SFX generated with `scripts/make-sfx.sh`, music ducked under voice, mixed in Remotion, checked with `scripts/mix-check.sh`.
9. **Render and review.** Render a half-size preview first (`--scale 0.5 --crf 28`), pull stills from every scene and look at them. Then `npx remotion render Trailer out/trailer.mp4` for the master and `scripts/render-discord.sh out/trailer.mp4` for the file that actually gets posted (Discord caps free uploads at 20 MB; the script sizes the encode to fit). A still at frame 45 for the thumbnail. Walk `references/review.md` before sending; it is the list of things reviewers asked for on the first trailers. Write `CREDITS.md`.

## Non-negotiables

- **Opens on the Appwrite logo.** Frame 0 already shows the mark on the brand background, never an empty frame the logo fades into: Discord and most players use frame 0 as the preview. Animate the wordmark and glow around a mark that is already there. Frame 45 is a clean full logo for the thumbnail still.
- **Story has three movements:** feel the pain, meet the feature, see the result. A scene that does none of these gets cut. Details in `references/story.md`.
- **No subtitles, no labels on footage.** A label card in a corner of footage reads as a caption and was rejected on first review. Text is a designed slide between shots; what happens in a shot is said by the voice or shown by the footage. Layouts in `references/layouts.md`.
- **The camera does not move inside a shot, and footage never wobbles.** One framing per footage shot, zoomed so the smallest UI text is at least 28px and every element the shot uses (the button, the menu, the form) is inside the frame. Pans and zoom changes mid-shot were called "hard to follow"; a noise drift on the footage scale was called "drunk". The only motion on footage is a linear 1-2% push; a real framing change is 40+ frames, expo-out, once per video at most (`references/transitions.md`). Click rings tell the viewer where to look.
- **The music drop lands on the title.** Find the drop with `scripts/find-drop.sh`, trim the music so it hits the frame the feature name finishes landing, and put the hit on the same frame. A drop a second early feels wrong to everyone.
- **Copy is short and plain.** Headlines ≤ 6 words, nothing under 28px, product nouns not adjectives. Banned words and structures in `references/copy.md`.
- **Console design language.** Exact tokens, fonts, radii and badge colours from `references/design-tokens.md`. One pink accent per frame.
- **Footage is real.** Recorded from the Console or a demo app talking to local Appwrite. No mockups pretending to be the product, no stock footage.
- **The old way and the new way look different.** If the pain footage and the demo footage show the same screen (a sign-in form twice), the viewer cannot tell them apart. Change the surface: full-page flow for the old way, a popover or inline panel for the new one, and desaturate the pain shot.
- **Spoken copy is accurate and free of implementation detail.** "Right from the menu" is UI trivia; "the first one stays signed in" was wrong. Say what the product does in the product's own nouns (session, device, account), and check every claim against the PR.
- **Every video looks different.** Rotate story shape, theme, accent, intro variant, framing and transition family per `references/layouts.md`. If two trailers could swap their slides, one of them is wrong.
- **Voice owns its moment.** No sound effect plays while the voice speaks (the reveal and payoff hits are the exception), music dips under every line with fades, and the picture waits for the line to finish. The composition mutes any click or pop that falls inside a voice window. `references/voice.md`.
- **Posts on Discord.** The deliverable is the Discord-sized mp4 from `scripts/render-discord.sh`, under 20 MB unless the brief says the uploader has Nitro or a boosted server. The master render is kept alongside.
- **Licensed.** Music licence recorded in `CREDITS.md`. Remotion needs a company licence for teams of 4+ (`references/remotion.md`); confirm it exists.

## Reference map

| Read when | File |
|---|---|
| Starting, or the feature is unclear | `references/intake.md` |
| Planning beats and timings | `references/story.md` |
| Writing any text that appears on screen | `references/copy.md` |
| Starting or seeding the backend, recording the Console or a demo app | `references/local-appwrite.md` |
| Capturing footage, cursor, pacing, converting | `references/recording.md` |
| Building the composition, fonts, audio, rendering | `references/remotion.md` |
| Colours, type, radii, badges, logo files | `references/design-tokens.md` |
| Choosing a layout for a slide, making the video distinct | `references/layouts.md` |
| Choosing or building a transition, easing, text holds | `references/transitions.md` |
| Finding music, placing SFX, loudness | `references/audio.md` |
| Narration: writing lines, generating with ElevenLabs, syncing, ducking | `references/voice.md` |
| Before sending: the review checklist built from real feedback | `references/review.md` |

## Tools to connect

ElevenLabs (voice, and optionally music and SFX) is reached through the MCP1 gateway. If the `elevenlabs__creative_*` tools are not available in the session, add the server and let the user complete the OAuth prompt:

```bash
claude mcp add --transport http appwrite https://mcp1.com/mcp/appwrite/general
```

Bundled: `assets/logos/` (official SVGs), `assets/templates/cursor.css`, `assets/templates/fixtures.json` (fake data), `assets/templates/script.schema.json` (beat sheet schema), `scripts/record.ts` (takes, smoke mode, click log), `scripts/login.ts`, `scripts/frames-to-mp4.sh`, `scripts/ui-events.sh` (find UI reactions in old takes), `scripts/make-sfx.sh`, `scripts/find-drop.sh` (locate the music drop), `scripts/mix-check.sh`, `scripts/voice-timeline.ts`, `scripts/render-discord.sh`.

## Project layout you will produce

```
<feature>-trailer/
├── script.json          # beat sheet: shape, look, scenes, copy, timings, sfx
├── CREDITS.md           # music and SFX licences
├── seed/                # Appwrite CLI config + seed script
├── demo/                # the demo app, when the feature is shown outside the Console
├── record/              # record.ts, one `--take` per shot, .auth/state.json
├── footage/             # PNG frames, <take>.events.json click logs, converted mp4 per take
├── remotion/public/audio/voice/   # one mp3 per narrated line
└── remotion/            # the Remotion project (public/, src/)
```

## Timing defaults (30fps)

Intro 0-2.5s, pain 2.5-12s, reveal 12-17s, demo 17-47s, payoff 47-53s, outro 53-60s. Move the boundaries to fit the feature and the music, keep the order. Text holds at least `words / 2.5 + 0.5` seconds. Cuts on beats. A narrated trailer ends up around 55-60 s with 35 s of speech; a code slide holds only as long as its spoken line (4-6 s, never 8). Footage plays at 1.3-1.5x in demos and 2.5x in the pain shot; slower read as "slow and boring" on review.

## When you are done

Deliver: the Discord mp4 and the master mp4, the thumbnail PNG, `script.json` (with voice timings if narrated), `CREDITS.md`, and a 3-line note saying what the story is, which look was chosen, and anything that still needs a human (a licence, a Cloud-only screen you could not record, a claim to verify, a listen to the voice takes if you could not audition them). Expect a round of feedback; keep the sidecar, the demo app and the frame sequences until the reviewer has signed off, because re-recording is the expensive part.
