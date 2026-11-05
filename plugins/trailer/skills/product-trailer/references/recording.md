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

Caveats: CSS transitions and animations are not driven by the fake clock, they run on wall time. The Console's 150-200ms transitions will look instantaneous unless you either (a) also pause for real time between frames, or (b) slow them with CDP `Animation.setPlaybackRate` to match. The bundled `scripts/record.ts` handles this by stepping the clock and sleeping a matching real interval so CSS transitions span the right number of frames. Network requests still happen in real time; the local Appwrite responds in milliseconds, so this is rarely visible.

### Screencast

```ts
await page.screencast.start({ path: 'take.webm', size: { width: 1920, height: 1080 }, fps: 60, quality: 90 })
// ... interact ...
await page.screencast.stop()
```

Also available: `page.screencast.showActions({ cursor: 'pointer' })` draws an animated pointer for you. Convert to H.264 before Remotion (below).

## Viewport and scale

Record at `viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2` for footage that will be shown inside a card or device frame on a 1920x1080 canvas; the 3200x1800 source lets you zoom to a region without softness. Record at `1920x1080, DPR 2` only when the footage fills the frame. The Console E2E suite uses 1920x1080; its sidebar is 200px and header 56px, so at 1600 wide everything still fits.

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

## Shot checklist

Before you call a take good: the cursor is visible in every frame it should be; no selection highlight or focus ring left behind; no real emails or names; the outcome is on screen for at least a second; the whole take is one clean thought.
