# Remotion for trailers

Remotion renders React components to video, one frame at a time. Everything in the trailer (slides, footage, logo sting, audio) is a React tree driven by `useCurrentFrame()`. That is what makes it reproducible: change a line of copy, re-render, done.

## Install the official Remotion skills first

Remotion maintains agent skills that are more detailed than this file and kept in sync with releases. Install them into the trailer project before writing Remotion code, then follow them for API specifics:

```bash
npx skills add remotion-dev/skills          # or: gh skill install remotion-dev/skills
```

Or as a Claude Code plugin: `claude plugin marketplace add remotion-dev/claude-code-plugin` then `claude plugin install remotion@remotion`. Skills you will use: `remotion-best-practices`, `remotion-create`, `remotion-render`, `remotion-multimedia`, `remotion-docs` (fetches any doc page as Markdown). Any docs URL also serves Markdown when you append `.md`, and `https://www.remotion.dev/llms.txt` lists them.

## License check

Remotion is free for individuals and companies with up to 3 people. A company with 4 or more people needs a Company License (https://www.remotion.dev/docs/license). Appwrite is above that threshold, so confirm the team has a licence before rendering anything that ships publicly, and say so in your first message if you do not know.

## Project setup

```bash
npx create-video@latest --yes --blank trailer   # --tailwind if you want utility classes
cd trailer
npx remotion add @remotion/transitions @remotion/media @remotion/google-fonts @remotion/fonts @remotion/motion-blur @remotion/paths @remotion/shapes @remotion/zod-types zod
```

`npx remotion add` pins packages to the installed Remotion version, which matters: mismatched versions are the most common broken-build cause.

Layout:

```
trailer/
├── public/            # footage/*.mp4, audio/*.mp3, fonts/*.woff2, logos/*.svg  → staticFile('footage/demo.mp4')
├── src/
│   ├── index.ts       # registerRoot(RemotionRoot)
│   ├── Root.tsx       # <Composition id="Trailer" fps={30} width={1920} height={1080} durationInFrames={...} />
│   ├── Trailer.tsx    # the TransitionSeries of scenes
│   ├── theme.ts       # tokens from design-tokens.md
│   ├── scenes/        # one file per scene
│   ├── layouts/       # reusable slide layouts from layouts.md
│   └── fx/            # transitions, cursor, glow, grain
└── script.json        # the beat sheet as data: scenes, copy, timings
```

Keep the beat sheet in `script.json` and feed it as `defaultProps` with a zod schema. The copy then lives in one place, the Studio shows editable props, and re-timing a scene is a number change.

Composition settings: 1920x1080 at 30fps is the default. Use 60fps only if the footage was captured at 60 and the motion is the point. 1080x1920 for a vertical cut; build the same scenes with layout switches rather than a second project. Composition `id` allows only letters, numbers and dashes.

## Core APIs you will use in every scene

```tsx
const frame = useCurrentFrame()
const { fps, durationInFrames, width, height } = useVideoConfig()

// Linear mapping with clamping. Default extrapolation is 'extend', which overshoots; clamp nearly always.
const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })

// Physical motion. damping 200 = no bounce, smooth settle. damping 12 = a visible overshoot.
const y = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 })
const translateY = interpolate(y, [0, 1], [24, 0])

// Delay a spring: spring({ frame, fps, delay: 10, ... })  — or offset frame yourself.
```

`<Sequence from={30} durationInFrames={90}>` shifts the child's frame 0 to global frame 30. Inside, `useCurrentFrame()` is local. Use this to build scenes that know nothing about their position in the film. `<AbsoluteFill>` is a flex column covering the frame; later siblings paint on top.

Easing: `Easing.out(Easing.cubic)` for entrances, `Easing.in(Easing.cubic)` for exits, `Easing.inOut(Easing.cubic)` for moves. `Easing.bezier(0.2, 0.8, 0.2, 1)` is a good "expo-ish" out for hero text.

## Footage

```tsx
import { Video } from '@remotion/media'   // preferred: fast, WebCodecs-based
<Video src={staticFile('footage/create-row.mp4')} trimBefore={45} playbackRate={1.25} volume={0} />
```

- Playwright WebM plays directly, but convert to H.264 mp4 anyway (`recording.md`) for faster renders and reliable seeking.
- `trimBefore` is in composition frames (seconds × composition fps), unaffected by `playbackRate`; cut footage with props, not CSS or offsets.
- Zoomed footage: wrap the `<Video>` in an `<AbsoluteFill style={{ scale, transformOrigin: `${x*100}% ${y*100}%` }}>` with one `scale`/origin per shot (see `layouts.md`, footage-zoom). The only motion on that container is a linear push: `scale * (1 + frame / durationInFrames * 0.015)`. Do not multiply it by `noise2D`; that is what made the UI look drunk in review. If the framing must change, use the smooth-zoom snippet in `transitions.md` (40+ frames, expo-out, log-interpolated scale). Put click-ring callouts inside the same container so they move with it. With `transformOrigin` at `100% 0%` the right and top edges stay pinned, which is what a top-right menu needs; an origin of `84% 20%` cut the menu off at the right edge in the first draft.
- `playbackRate` up to about 1.5 reads as "snappy", above 2 reads as a time-lapse. Speed up typing and waiting, never the moment the feature does its thing.
- Wrap footage in a device frame or a floating card (`layouts.md`) with the Console border and radius so it reads as a product shot, not a screen recording.
- `<OffthreadVideo>` is the fallback when `@remotion/media` cannot decode something. It downloads the whole file first; keep clips short and local.

## Audio

```tsx
import { Audio } from '@remotion/media'
<Audio src={staticFile('audio/music.mp3')}
  volume={(f) => interpolate(f, [0, fps, durationInFrames - 2 * fps, durationInFrames], [0, 0.6, 0.6, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
```

Write the volume as a function of frame so Studio draws the curve. Ducking: lower the middle value for the frames where an SFX or the proof-shot hits. Place SFX in a `<Sequence from={hitFrame}>` with its own `<Audio>`; 10-20 short sounds is normal for 60 seconds. See `audio.md` for sources and loudness.

Narration: one `<Sequence from={voice.start}>` with an `<Audio>` per line, and the music volume function walks `voiceWindows` from `script.json` to duck with fades (both already in composition frames since `voice-timeline.ts` subtracts transition overlaps). Build the SFX list from `script.json` (`sfx`, `clicks`, counter ticks) in one function and filter it against the voice windows, keeping only the hits:

```ts
const underVoice = (f: number) => voiceWindows.some((w) => f >= w.from - 6 && f <= w.to + 6)
events.filter((e) => e.file.endsWith('hit.wav') || !underVoice(e.frame))
```

Music: `<Audio src trimBefore={Math.round(music.trimBefore * fps)} volume={musicVolume} />`, where `trimBefore` was set so the drop lands on the reveal hit (`audio.md`). The pattern is in `voice.md`.

Get a music track's length to size the outro: `npx remotion` has no CLI for this, use `ffprobe -show_entries format=duration` or Mediabunny `getMediaMetadata()`.

## Transitions

```tsx
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { wipe } from '@remotion/transitions/wipe'

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={75}><Intro /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
  <TransitionSeries.Sequence durationInFrames={240}><Pain /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })} />
  ...
</TransitionSeries>
```

Rules: a transition must be shorter than both neighbours, two transitions cannot be adjacent, and the total length is the sum of scenes minus overlaps (compute `durationInFrames` for the Composition from the same numbers). Built-in presentations: `fade`, `slide`, `wipe` (8 directions), `flip`, `clockWipe`, `iris`, `cube`, `none` (then animate with `useTransitionProgress()`). Custom presentations receive `presentationProgress` 0-1 and `presentationDirection`, which is how the mask reveal, zoom-through and push-with-blur transitions in `transitions.md` are built. Use `TransitionSeries` for scene-to-scene cuts and plain `interpolate`/`spring` for motion inside a scene.

## Beat sheet as data

Keep `script.json` outside `src/` and import it (`import raw from '../../script.json'` with `resolveJsonModule`). Derive everything from it in one module: `sceneFrames`, `transitionFrames` (a table keyed by `transitionIn`, identical to the one in `voice-timeline.ts`), `sceneStart` (cumulative minus overlaps), `totalFrames`, the voice cues and the SFX events. The `Composition` reads `totalFrames` from there, so re-timing a scene never leaves the duration stale. Print the table with `npx tsx -e` when you need the frame of a scene for a music or voice calculation.

## Fonts

```tsx
import { loadFont } from '@remotion/google-fonts/Inter'
const inter = loadFont('normal', { weights: ['400', '500', '600'], subsets: ['latin'] })
// Local Aeonik Pro:
import { loadFont as loadLocal } from '@remotion/fonts'
loadLocal({ family: 'Aeonik Pro', url: staticFile('fonts/AeonikPro-Medium.woff2'), weight: '500' })
```

Call these at module top level in `theme.ts` so every scene shares them. Remotion waits for fonts before capturing frames.

## Useful helpers

- `@remotion/paths` `evolvePath(progress, d)` draws an SVG path over time: underlines, connectors, the Appwrite mark drawing itself in the intro.
- `@remotion/shapes` for rounded rects, circles, arrows without hand-writing SVG.
- `@remotion/motion-blur` `<CameraMotionBlur shutterAngle={180} samples={8}>` makes fast slides and whip pans look filmed instead of stepped. Expensive; use on 1-2 transitions.
- `@remotion/noise` `noise2D(seed, x, t)` for subtle drift on background glows so holds are not static.
- `@remotion/animation-utils` `interpolateStyles` and `makeTransform` to avoid string-building transforms.
- `@remotion/zod-types` `zColor()` for theme props in the Studio.

## Rendering and delivery targets

The primary delivery target is **Discord**: launch channels, the community server, internal announcements. Discord plays mp4 inline only when the file is under the upload limit, and the limit depends on who uploads: 20 MB for a free account, 50 MB with Nitro Basic or in a server boosted to level 2, 100 MB at level 3 (as of November 2026; check the limit the app shows when attaching). A 60-second 1080p render at CRF 18 is 40-80 MB, so a plain render will not post. Always produce the Discord file:

```bash
npx remotion render Trailer out/trailer.mp4 --codec h264 --crf 18     # master
scripts/render-discord.sh out/trailer.mp4                              # -> out/trailer-discord.mp4, under 19 MB
scripts/render-discord.sh out/trailer.mp4 48                           # for a boosted server or Nitro uploader
```

The script does a two-pass H.264 encode sized to the budget, 1080p when the budget allows at least 3.2 Mbit/s of video and 720p otherwise, AAC 128k, `+faststart` so Discord's player starts before the download finishes. UI footage with flat colours compresses well; 720p at 2 Mbit/s looks fine on a Discord embed, which is at most about 800px wide anyway. If the file still looks soft, cut length before raising bitrate.

Discord uses the first frame as the preview image. Frame 0 must already show the Appwrite mark on the brand background, not a blank frame that the logo animates into. Keep the mark at full opacity from frame 0 and animate the wordmark and glow around it.

Other targets, when asked: X accepts up to 512 MB and 140 seconds, render 1080p at CRF 20. YouTube wants the master. Website embeds want 720p at CRF 23 with `--muted` plus a poster PNG.


```bash
npx remotion studio                                   # preview, scrub, edit props
npx remotion render Trailer out/trailer.mp4 --codec h264 --crf 18
npx remotion render Trailer out/trailer-x.mp4 --codec h264 --crf 20   # X / YouTube cut if different from master
npx remotion still Trailer out/thumb.png --frame 45    # thumbnail from the intro hold
```

- `--concurrency` defaults to half the CPU threads; raise with care, too high and media loads fail. `npx remotion benchmark` finds the sweet spot.
- Frames that take longer than 30s hit the `delayRender` timeout. Usual causes: huge footage via OffthreadVideo, remote fonts, blur filters on large layers. Bake blurs and glows to PNGs.
- `--frames=0-150` renders a slice for quick checks of a single scene.
- Check the result: play it, scrub the first and last second, confirm audio does not clip (`audio.md` loudness check). An agent cannot play it: render `--scale 0.5 --crf 28` first (about a minute for 60 s), extract one still per scene with `ffmpeg -vf "select='eq(n,N)'" -frames:v 1` and read them. Then render the master.
- A narrated mix lands around -16 LUFS with the voice at 0.95 and music at 0.95 ducked to 0.3; pushing to -14 clips the voice peaks. Report the number instead of forcing it.
- `premountFor` only affects Studio and Player preview, the render is frame-exact regardless.
