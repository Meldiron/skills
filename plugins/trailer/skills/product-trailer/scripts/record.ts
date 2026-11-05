/**
 * Headless recording helper for product trailers.
 *
 * Modes:
 *   frames  – clock-stepped PNG screenshots at DPR 2 (pixel-perfect). Convert with scripts/frames-to-mp4.sh
 *   smoke   – real-time run that only saves a screenshot at each h.snap(); use it to check the UI before recording
 *
 * Usage (copy into the trailer project, fill in `setup` and `shots`):
 *   npx tsx record.ts --take add --mode smoke  --out footage/smoke/add     # look at the PNGs first
 *   npx tsx record.ts --take add --mode frames --out footage/add --fps 60  # one take per shot
 *
 * Every click and typing burst is logged to `<out>.events.json` as { frame, seconds, kind, name } in SOURCE time,
 * so the composition can place click SFX and callouts without guessing (composition time = (t - trimBefore) / playbackRate).
 *
 * Requires: npm i -D playwright tsx @types/node   &&   npx playwright install chromium
 */
import { chromium, type Page, type BrowserContext, type Locator } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
type Mode = 'frames' | 'smoke'
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] ?? 'true'] : []).filter(Boolean))
const TAKE = args.take ?? 'demo'
const MODE = (args.mode ?? 'frames') as Mode
const OUT = args.out ?? `footage/${TAKE}`
const FPS = Number(args.fps ?? 60)
const APP = args.base ?? 'http://localhost:5173'
const PROJECT = args.project ?? 'my-project'
const VIEWPORT = { width: Number(args.width ?? 1600), height: Number(args.height ?? 900) }

const cursorCss = fs.readFileSync(path.join(__dirname, '../assets/templates/cursor.css'), 'utf8')
const cursorSvg = `<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M3 2l15 7.5-6.2 1.6L8 18z" fill="#fff" stroke="#19191C" stroke-width="1.4" stroke-linejoin="round"/></svg>`

// ---------- backend state for each take ----------
// context.request shares the cookie jar with the page, so sessions created here are already in the browser.
// Return anything the page needs seeded into localStorage (labels, feature flags); it is applied before load.
async function setup(context: BrowserContext, take: string): Promise<Record<string, unknown>> {
  const H = { 'X-Appwrite-Project': PROJECT, 'Content-Type': 'application/json', Origin: APP }
  const api = context.request
  if (take === 'demo') {
    const r = await api.post(`${APP}/v1/account/sessions/email`, { headers: H, data: { email: 'lena@northwind.example', password: 'password' } })
    if (!r.ok()) throw new Error(`session: ${r.status()} ${await r.text()}`)
  }
  return {}
}

// ---------- the shots you edit ----------
async function shots(page: Page, h: Human) {
  if (TAKE === 'demo') {
    await page.goto(`${APP}/`, { waitUntil: 'networkidle' })
    await h.settle(900); await h.snap('01-start')
    // const create = page.getByRole('button', { name: 'Create' })
    // await h.click(create, 'create'); await h.settle(600); await h.snap('02-dialog')
    // await h.click(page.getByLabel('Name'), 'name'); await h.type('orders')
    await h.settle(1200)
  }
}
// ----------------------------------------

type Event = { frame: number; seconds: number; kind: 'click' | 'type' | 'snap'; name: string }

class Human {
  constructor(private page: Page, private rec: Recorder) {}
  private cur = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 }
  async settle(ms: number) { await this.rec.advance(ms) }
  async snap(name: string) { await this.rec.snap(name) }
  async moveTo(target: Locator, opts: { offset?: [number, number] } = {}) {
    const box = await target.boundingBox(); if (!box) throw new Error('target not visible')
    const [ox, oy] = opts.offset ?? [0.5, 0.5]
    const to = { x: box.x + box.width * ox, y: box.y + box.height * oy }
    const dist = Math.hypot(to.x - this.cur.x, to.y - this.cur.y)
    const steps = Math.max(12, Math.min(40, Math.round(dist / 30)))
    const ms = Math.max(300, Math.min(700, dist * 0.9))
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, e = 1 - Math.pow(1 - t, 3) // ease-out cubic
      await this.page.mouse.move(this.cur.x + (to.x - this.cur.x) * e, this.cur.y + (to.y - this.cur.y) * e)
      await this.rec.advance(ms / steps)
    }
    this.cur = to
    await this.rec.advance(180) // hover before acting
  }
  /** Move to the target, press, release. `name` goes into the events log; the point is logged in 0-1 viewport coordinates too. */
  async click(target: Locator, name = 'click') {
    await this.moveTo(target)
    this.rec.log('click', name, this.cur)
    await this.page.mouse.down(); await this.rec.advance(70); await this.page.mouse.up()
    await this.rec.advance(260)
  }
  /** Type into the focused element with human rhythm. Click the field first. */
  async type(text: string, name = 'type') {
    this.rec.log('type', name, this.cur)
    for (const ch of text) {
      await this.page.keyboard.type(ch)
      await this.rec.advance(35 + Math.random() * 50 + (ch === '@' || ch === '.' || ch === ' ' ? 50 : 0))
    }
    await this.rec.advance(300)
  }
  async scroll(px: number) {
    await this.page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), px)
    await this.rec.advance(650)
  }
}

/** Advances the fake clock frame by frame, capturing PNGs, and keeps the events log. */
class Recorder {
  private frame = 0
  private carry = 0
  private events: (Event & { x?: number; y?: number })[] = []
  constructor(private page: Page, private mode: Mode) {}
  async start() {
    fs.mkdirSync(OUT, { recursive: true })
    if (this.mode === 'frames') {
      await this.page.clock.install({ time: new Date('2026-03-10T10:00:00') })
      // CSS transitions run on wall time. Capture is far slower than real time, so slow them down to span a few frames.
      const cdp = await this.page.context().newCDPSession(this.page)
      await cdp.send('Animation.enable')
      await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.25 })
    }
  }
  log(kind: Event['kind'], name: string, at?: { x: number; y: number }) {
    this.events.push({ frame: this.frame, seconds: Number((this.frame / FPS).toFixed(3)), kind, name, ...(at ? { x: Number((at.x / VIEWPORT.width).toFixed(3)), y: Number((at.y / VIEWPORT.height).toFixed(3)) } : {}) })
  }
  async advance(ms: number) {
    if (this.mode === 'smoke') { await this.page.waitForTimeout(ms); return }
    const frameMs = 1000 / FPS
    this.carry += ms
    while (this.carry >= frameMs) {
      await this.page.clock.runFor(frameMs)
      await this.page.waitForTimeout(frameMs)
      await this.page.screenshot({ path: path.join(OUT, `f_${String(this.frame++).padStart(5, '0')}.png`), type: 'png', scale: 'device', animations: 'allow', caret: 'hide' })
      this.carry -= frameMs
    }
  }
  async snap(name: string) {
    this.log('snap', name)
    if (this.mode !== 'smoke') return
    await this.page.screenshot({ path: path.join(OUT, `${name}.png`), type: 'png', scale: 'css' })
  }
  async stop() {
    fs.writeFileSync(`${OUT}.events.json`, JSON.stringify({ take: TAKE, fps: FPS, viewport: VIEWPORT, frames: this.frame, events: this.events }, null, 2))
    if (this.mode === 'frames') console.log(`${this.frame} frames in ${OUT}/ (${(this.frame / FPS).toFixed(1)}s), events in ${OUT}.events.json`)
    else console.log(`smoke screenshots in ${OUT}/`)
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, locale: 'en-US', timezoneId: 'Europe/Prague', colorScheme: 'dark' })
  const seed = await setup(context, TAKE)
  await context.addInitScript(({ css, svg, seed }) => {
    localStorage.setItem('theme', 'dark')
    for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
    addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style)
      const c = document.createElement('div'); c.id = '__trailer_cursor'; c.innerHTML = svg + '<div class="ripple"></div>'
      c.style.transform = 'translate(800px,450px)'
      document.body.appendChild(c)
      addEventListener('mousemove', (e) => { c.style.transform = `translate(${e.clientX}px,${e.clientY}px)` }, true)
      addEventListener('mousedown', () => c.classList.add('down'), true)
      addEventListener('mouseup', () => setTimeout(() => c.classList.remove('down'), 120), true)
    })
  }, { css: cursorCss, svg: cursorSvg, seed })
  const page = await context.newPage()
  await page.goto(APP, { waitUntil: 'networkidle' })
  await page.evaluate(() => (document as any).fonts.ready)
  const rec = new Recorder(page, MODE)
  await rec.start()
  await shots(page, new Human(page, rec))
  await rec.stop()
  await context.close(); await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
