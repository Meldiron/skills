# Recording footage with a headless browser

Footage is the proof in the trailer. It has to be crisp, smooth and paced like a confident person using the product, not like a test runner. Playwright gives you all three if you avoid its defaults.

## Pick a capture method

| Method | Quality | Effort | Use when |
|---|---|---|---|
| **Clock-stepped screenshots** (recommended) | Pixel-perfect, any fps, DPR 2 | Medium. Script interactions against a frozen clock | Final footage. Anything with typing, hover states, or animated UI |
| `page.screencast.start()` (Playwright ≥ 1.59, JPEG frames → VP9 WebM) | Good, 60fps possible, slight JPEG softness | Low | Quick drafts, long scroll sessions, when the UI relies on real network timing |
| `recordVideo` on the context | Soft, 25fps default, VP9 realtime | Lowest | Never for the final cut. Fine to check a flow works |
| CDP `Page.startScreencast` with PNG | Pixel-perfect, variable frame rate | Medium | When the app fights the fake clock (websockets, long polling) but you need PNG quality |

### Clock-stepped screenshots

Freeze time, advance it by one frame, screenshot, repeat. The browser renders every frame fully. It is slower than real time (around 10-20 fps capture speed at 1600x900 DPR 2) but output is perfect.

```ts
await page.clock.install({ time: new Date('2026-03-10T10:00:00') })
const fps = 60
for (let i = 0; i < totalFrames; i++) {
  await page.clock.runFor(1000 / fps)
  await page.screenshot({ path: `frames/f_${String(i).padStart(5, '0')}.png`, type: 'png', scale: 'device', animations: 'allow', caret: 'hide' })
}
```

Caveats: CSS transitions and animations are not driven by the fake clock, they run on wall time. The Console's 150-200ms transitions will look instantaneous unless you slow them down: the bundled `scripts/record.ts` sends CDP `Animation.setPlaybackRate 0.25` so a 160 ms menu animation spans a few captured frames. Capture runs at roughly 3-6 frames per second of wall time at 1600x900 DPR 2 (slower when several takes record in parallel); a 15-second take takes 3-5 minutes. Network requests still happen in real time; the local Appwrite responds in milliseconds, so this is rarely visible.

`record.ts` is organised as named takes (`--take pain|add|switch`), each with a `setup()` that creates the backend state through `context.request` (it shares the cookie jar with the page, so sessions created there are already in the browser) and a `shots()` block. Run every take with `--mode smoke` first: it plays in real time and saves a screenshot at each `h.snap()`, which is how you catch a wrong layout before spending five minutes on frames.

Every `h.click()` and `h.type()` is written to `<out>.events.json` with its frame, seconds and 0-1 viewport coordinates. That file is the source for click SFX and click-ring callouts in the composition; convert to composition time with `(t - trimBefore) / playbackRate`. Detecting clicks afterwards from the pixels does not work (the pink ripple is too small for colour keying); for a take recorded without the log, `scripts/ui-events.sh` finds the frames where the page visibly changed, which is where pops belong.

### Screencast

```ts
await page.screencast.start({ path: 'take.webm', size: { width: 1920, height: 1080 }, fps: 60, quality: 90 })
// ... interact ...
await page.screencast.stop()
```

Also available: `page.screencast.showActions({ cursor: 'pointer' })` draws an animated pointer for you. Convert to H.264 before Remotion (below).

## Viewport and scale

Record at `viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2` and keep the 3200x1800 output (`frames-to-mp4.sh` at scale 1). Footage is shown zoomed to 1.3-1.9x so the UI is legible on a phone, and a 1920x1080 encode goes soft at that zoom. The Console E2E suite uses 1920x1080; its sidebar is 200px and header 56px, so at 1600 wide everything still fits. UI footage compresses to well under 1 MB per take at CRF 16, so file size is not a reason to downscale. The Console E2E suite uses 1920x1080; its sidebar is 200px and header 56px, so at 1600 wide everything still fits.

For 9:16 cuts, record a second take at `1080x1920`-friendly proportions or plan a zoom-and-pan over the 16:9 take. Do not stretch.

## Cursor

Headless Chromium draws no pointer. Inject one that follows the mouse and shows clicks. `scripts/record.ts` injects the CSS in `assets/templates/cursor.css` via `addInitScript`: a 20px cursor with a 120ms eased transform so motion looks hand-made, a ripple on mousedown. Move the mouse with `page.mouse.move(x, y, { steps: 25 })` so it travels instead of teleporting; a 400-600ms travel for a cross-screen move is natural. Hover for 150-250ms before clicking. Click with `page.mouse.click(x, y, { delay: 70 })` so the pressed state is visible.

To find coordinates, use locators: `const box = await page.getByRole('button', { name: 'Create' }).boundingBox()` then move to the box centre. Never hard-code pixels.

## Pacing like a human

- Typing: `page.keyboard.type(text, { delay: 55 })` with the delay varied ±25ms per character (see `humanType` in the script). Real typing has rhythm; uniform delay reads as a bot.
- Pauses: 400-800ms after a page loads, 250ms after a click before the next move, 1.0-1.5s on the outcome so the viewer registers it. You will speed footage up in Remotion anyway; record slow and clean.
- Scrolling: `page.evaluate(() => window.scrollBy({ top: 480, behavior: 'smooth' }))` then wait 600ms. One scroll per shot at most.
- Keep animations on. `reducedMotion` stays `no-preference`.
- Record each shot as its own take, 5-15 seconds. Short takes are easier to trim, re-record and speed independently.

## Stabilise the frame

- `await page.goto(url, { waitUntil: 'networkidle' })`, then `await page.evaluate(() => document.fonts.ready)`.
- Headless Chromium already hides scrollbars and mutes audio. If scrollbars appear anyway, inject `::-webkit-scrollbar { display: none }`.
- Pin time: `page.clock.install({ time })` or `setFixedTime` so "2 minutes ago" is stable across takes.
- Set `timezoneId: 'Europe/Prague'` and `locale: 'en-US'` in the context for consistent formatting.
- Theme: `addInitScript(() => localStorage.setItem('theme', 'dark'))` before the Console loads.
- Dismiss onboarding: cookie banners and wizards show up only locally; click them away in the setup step, or set the localStorage flags they write.
- Fixtures: use the names and data in `assets/templates/fixtures.json`, never real accounts or colleagues.

## Authentication

Log in once in a setup script, save `await context.storageState({ path: '.auth/state.json' })`, load it with `newContext({ storageState })` for every take. Console login: fill `input[name="email"]`, `input[name="password"]`, click the `Login` button, wait for the URL to contain `/console/`.

## Convert for Remotion

Remotion plays WebM, but H.264 mp4 renders faster and seeks reliably. Always transcode:

```bash
# screencast or recordVideo output
ffmpeg -i take.webm -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow -movflags +faststart take.mp4
# frame sequence at 60fps, downscaled from DPR 2 to 1600x900 (or keep full size and zoom in Remotion)
ffmpeg -framerate 60 -i frames/f_%05d.png -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -crf 16 -preset slow take.mp4
# trim
ffmpeg -ss 1.2 -to 8.4 -i take.mp4 -c:v libx264 -crf 18 -pix_fmt yuv420p trimmed.mp4
# probe
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames -of default=noprint_wrappers=1 take.mp4
```

`scripts/frames-to-mp4.sh` wraps the second command. Keep the PNG frames until the final render is approved; re-encoding from PNG is free, re-recording is not.

## Designing the demo app for the camera

When the feature is shown in a demo app you wrote, design its surfaces so the shots read differently. A full-page sign-in for the old way and a popover with the same fields for the new way look like two different features; two full pages look like the same shot twice. Put the interaction the trailer is about in one corner (a top-right account menu, a side panel) so one static framing holds the trigger, the panel and the outcome. Give every clickable a `data-testid` so `record.ts` can find it, and keep the app one screen.

## Shot checklist

Before you call a take good: the cursor is visible in every frame it should be; no selection highlight or focus ring left behind; no real emails or names; the outcome is on screen for at least a second; the whole take is one clean thought.
