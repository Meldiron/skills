# Slide layouts and variety

Text never sits in a caption bar at the bottom of footage. Every piece of text is a slide or a label designed into the frame. Below are the layouts to compose from. Each trailer should use 4-6 of them, chosen to fit the content, and should not look like the last trailer.

All layouts use the tokens in `design-tokens.md`: Console background, 1px borders, 8-10px radii, Aeonik Pro (or Inter) for headlines, Inter for lines, pink for exactly one element.

## Layouts

**logo-sting** (intro, 2-3s). Brand background. Mark enters first (draw-on via `evolvePath`, or scale from 0.6 with `springs.soft`, or slide up through a mask), wordmark follows 8 frames later. A faint radial glow behind the mark, pink at 8-12% opacity, drifting. Frame 45 (1.5s) must be a complete logo on a clean background: that is the thumbnail. Variants: mark centred then slides left to make room for the wordmark; mark alone on pink `#FD366E` with white mark, then dip to the dark theme; the mark drawn as a single stroke.

**hero-center** (reveal, payoff). One headline, 96-128px, centred, optional 32-40px line below in muted foreground. The largest motion of the video happens here. Keep at least 20% of the frame empty on every side.

**hero-left** (pain, reveal, outro). Headline left-aligned in the left 55%, baseline at 60% height, with the right side empty or holding a small floating UI fragment (a badge, a button, a code snippet). Feels editorial; use when the hero-center was already used in this video.

**footage-card** (demo). Footage inside a card: 1px border, 10px radius, card background, 72-96px margins from the frame edge, optional window header strip with three 10px dots in muted foreground. Label in a corner. Card enters with `springs.soft` scale, footage fades in after.

**footage-full** (demo, pain). Footage fills the frame edge to edge with a 1.05→1 slow scale over the shot. Use for the one shot where the whole Console is the point, or for the pain shot at 2x speed.

**footage-zoom** (demo). Footage at DPR-2 resolution scaled to 1.6-2.2x, centred on the element that matters, panning slowly (ease inOut) from one point of interest to the next. Store `zoom.x/y/scale` per scene. Pair with a label.

**label-footage** (demo). Any footage layout plus a label card: 28-36px text, 1px border, 6px radius, muted background at 85% opacity, anchored top-left, bottom-left or next to the cursor. Labels are 1-4 words. Enter with a 10-frame slide from the anchor edge, exit 8 frames before the cut.

**split** (payoff, before/after). Two halves with a 1px border between. Left: before, right: after. Each half can be footage or a number. Halves enter from opposite sides (`slide` presentation per half) or the divider wipes from left to reveal the after half. Headlines 72px per half, sitting above the content, not over it.

**code-reveal** (demo). A code card: editor background `#141416`, 10px radius, 1px border, mono font at 30-36px, 5-10 lines max, syntax colours from the tokens. Lines stagger in top to bottom (3 frames apart) or type on; the key line gets a highlight bar. A file-name tab in the header strip. Optional: the result of the code appears as a small footage card sliding in from the right after the code finishes.

**counter** (payoff). One number at 160-220px in tabular numerals with a suffix (`ms`, `lines`, `steps`), a 32px line under it. Rolls from a start value with `ease.out` over 25-35 frames, `tick` SFX every 2 frames, `hit` on stop. Variant: two counters side by side (before/after), the before one counts up slowly and the after one snaps.

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
- **Backgrounds**: flat Console background; a soft radial glow; a faint 1px grid at 4% opacity; a slow noise-driven gradient. One per video.

Reject a draft if it has: a centred headline on every slide, the same transition on every cut, every shot in the same card, or text that could belong to any other feature.

## Checklist for every slide

- Smallest text ≥ 28px at 1080p. Headlines ≥ 72px.
- One accent element. If two things are pink, one of them is wrong.
- The slide holds for `words / 2.5 + 0.5` seconds after it finishes entering.
- Nothing is cut off at the edges; 72px safe margin.
- Still frame test: pause anywhere and it should look like a designed poster, not a mid-animation mess.
