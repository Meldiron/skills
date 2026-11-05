# Slide layouts and variety

Text never sits in a caption bar at the bottom of footage. Every piece of text is a slide or a label designed into the frame. Below are the layouts to compose from. Each trailer should use 4-6 of them, chosen to fit the content, and should not look like the last trailer.

All layouts use the tokens in `design-tokens.md`: Console background, 1px borders, 8-10px radii, Aeonik Pro (or Inter) for headlines, Inter for lines, pink for exactly one element.

## Layouts

**logo-sting** (intro, 2-3s). Brand background. The mark is fully visible at frame 0 (it is the Discord preview frame); it may then breathe, slide, or gain a glow, and the wordmark follows 8 frames later (slide out from behind the mark, stagger letters, or mask-reveal). A faint radial glow behind the mark, pink at 8-12% opacity, drifting. Frame 45 (1.5s) must be a complete logo on a clean background: that is the thumbnail. Variants: mark centred then slides left to make room for the wordmark; white mark alone on pink `#FD366E`, then dip to the dark theme; mark static while a pink glow blooms behind it and the wordmark wipes in. The draw-on stroke variant only works if the mark is drawn in a muted colour first and fills to pink, so frame 0 is still a logo.

**hero-center** (reveal, payoff). One headline, 96-128px, centred, optional 32-40px line below in muted foreground. The largest motion of the video happens here. Keep at least 20% of the frame empty on every side.

**hero-left** (pain, reveal, outro). Headline left-aligned in the left 55%, baseline at 60% height, with the right side empty or holding a small floating UI fragment (a badge, a button, a code snippet). Feels editorial; use when the hero-center was already used in this video.

**footage-card** (demo, rarely). Footage inside a card: 1px border, 10px radius, card background, 72-96px margins from the frame edge, optional window header strip with three 10px dots in muted foreground. Card enters with `springs.soft` scale, footage fades in after. At 1x the Console's 13px text is illegible on a phone, which is why `footage-zoom` is the default; use the card only for a shot where the whole page is the point.

**footage-full** (demo, pain). Footage fills the frame edge to edge with a 1.05→1 slow scale over the shot. Use for the one shot where the whole Console is the point, or for the pain shot at 2x speed.

**footage-zoom** (demo, pain). The default footage layout. Footage at DPR-2 resolution scaled to 1.3-1.9x with `transform-origin` at the corner that holds the action (`x: 1, y: 0` for a top-right menu), framed once so the trigger, the panel and the outcome are all inside the frame. No pans and no zoom changes inside a shot: the first cut with camera moves came back as "hard to follow". A 1-2% drift over the shot is enough to keep it alive. Store one `zoomKeys` entry per scene. Pair with click rings (below), not labels.

**click-ring** (callout on footage). A 64px pink ring at the click point that scales 1.6 → 1 and fades over 16 frames, rendered inside the zoomed footage container so it rides with the zoom. Positions and times come from the `.events.json` written by `scripts/record.ts` (`clickPoints: [{ t, x, y }]` in script.json). This is how the viewer knows where to look when the camera does not move.

**label-footage** (retired). A label card on footage reads as a caption; the first reviewer called it "terrible". Say it with the voice, or put a hero slide between shots. Keep the badge style for chips on slides only.

**split** (payoff, before/after). Two halves with a 1px border between. Left: before, right: after. Each half can be footage or a number. Halves enter from opposite sides (`slide` presentation per half) or the divider wipes from left to reveal the after half. Headlines 72px per half, sitting above the content, not over it.

**code-reveal** (demo). A code card: editor background `#141416`, 10px radius, 1px border, mono font at 34-36px, 1500-1650px wide, **at most 5 lines** (two calls and two comments), syntax colours from the tokens. Lines stagger in top to bottom (2 frames apart); the key line gets a pink highlight bar sliding in from the left. A file-name tab in the header strip. The slide holds only as long as its spoken line, 4-6 seconds; the first draft's 8-second, 9-line cards were the first thing the reviewer cut. Check the longest line fits the card at the final width.

**counter** (payoff). One number at 160-220px in tabular numerals with a suffix (`ms`, `lines`, `steps`), a 32px line under it. Set the digits in Inter 600, not Aeonik Pro: Aeonik's "1" has a foot and reads as a different typeface next to the "5". Rolls from a start value with `ease.out` over 25-35 frames, `tick` SFX every 2 frames, `hit` on stop. Variant: two counters side by side (before/after), the before one counts up slowly and the after one snaps.

**stack** (use cases). Three to four short lines that stack in with a stagger, each with a small Lucide-style icon or a bullet dash, left-aligned at 44-56px. Use once per video at most, and only for the "widen" beat where you list use cases. Never for feature bullet points.

**end-card** (outro). Logo (wordmark) top-centre or left, one CTA line 44-56px, one location or URL line 32px in mono. Everything settles with no motion in the last 20 frames except the glow drift. Music ends with the picture.

## Variety: do not ship the same video twice

Before composing, write a one-line "look" in `script.json` or the plan and vary these on purpose:

- **Story shape** (see `story.md`): before/after, problem-widen, cold open, one number, walkthrough.
- **Theme**: dark is the default; light theme for a feature whose users mostly work in light mode, or to make a launch stand out in a feed of dark videos.
- **Secondary accent**: none, purple, mint, orange, blue. One per video, with one meaning.
- **Intro variant**: three listed under logo-sting.
- **Headline alignment**: centre-heavy or left-heavy, pick one and keep it.
- **Footage framing**: cards with window chrome, bare cards, full-bleed, zoomed. Pick two.
- **Transition family**: pushes and wipes (mechanical), fades and dips (soft), zooms and masks (cinematic). Pick one family plus cuts.
- **Music tempo and mood**: 90-100 BPM calm, 110-125 BPM confident, 128+ punchy. Match the tone in the brief.
- **Type scale**: big-and-few (two slides with 120px headlines) or many-and-medium (six labels at 32px). Not both.
- **Cursor presence**: visible pointer with ripple, or no pointer and the UI reacts on its own (for keyboard-driven or API features).
- **Backgrounds**: flat Console background; a soft radial glow; a faint 1px grid at 4% opacity; a slow noise-driven gradient. One per video, and never static: drift the grid by a fraction of a pixel per frame and let the glow breathe with `noise2D`, or holds read as frozen.

Reject a draft if it has: a centred headline on every slide, the same transition on every cut, every shot in the same card, or text that could belong to any other feature.

## Checklist for every slide

- Smallest text ≥ 28px at 1080p. Headlines ≥ 72px.
- One accent element. If two things are pink, one of them is wrong.
- The slide holds for `words / 2.5 + 0.5` seconds after it finishes entering.
- Nothing is cut off at the edges; 72px safe margin.
- Still frame test: pause anywhere and it should look like a designed poster, not a mid-animation mess.
