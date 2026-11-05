/**
 * Headless recording helper for product trailers.
 *
 * Two modes:
 *   frames   – clock-stepped PNG screenshots (pixel-perfect). Convert with scripts/frames-to-mp4.sh
 *   screencast – Playwright page.screencast (fast draft, WebM). Convert with ffmpeg (see references/recording.md)
 *
 * Usage (copy into the trailer project and edit the `shots` function):
 *   npx tsx scripts/record.ts --mode frames --out footage/take-01 --fps 60
 *
 * Requires: npm i -D playwright tsx   &&   npx playwright install chromium
 */
import { chromium, type Page, type BrowserContext } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

type Mode = 'frames' | 'screencast'

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] ?? 'true'] : []).filter(Boolean))
const MODE = (args.mode ?? 'frames') as Mode
const OUT = args.out ?? 'footage/take'
const FPS = Number(args.fps ?? 60)
const BASE = args.base ?? 'http://localhost/console'
const VIEWPORT = { width: Number(args.width ?? 1600), height: Number(args.height ?? 900) }
const STORAGE = args.auth ?? '.auth/state.json'

const cursorCss = fs.readFileSync(path.join(__dirname, '../assets/templates/cursor.css'), 'utf8')
const cursorSvg = `<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M3 2l15 7.5-6.2 1.6L8 18z" fill="#fff" stroke="#19191C" stroke-width="1.4" stroke-linejoin="round"/></svg>`

// ---------- the thing you edit ----------
async function shots(page: Page, h: Human) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await h.settle(700)
  // Example: open a project, go to a page, click a button.
  // const create = page.getByRole('button', { name: 'Create' })
  // await h.moveTo(create); await h.click(create)
  // await h.type(page.getByLabel('Name'), 'orders')
  await h.settle(1200)
}
// ----------------------------------------

class Human {
  constructor(private page: Page, private rec: Recorder) {}
  private cur = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 }
  async settle(ms: number) { await this.rec.advance(ms) }
  async moveTo(target: { boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null> }, opts: { offset?: [number, number] } = {}) {
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
  async click(target?: Parameters<Human['moveTo']>[0]) {
    if (target) await this.moveTo(target)
    await this.page.mouse.down(); await this.rec.advance(70); await this.page.mouse.up()
    await this.rec.advance(260)
  }
  async type(locator: { click(): Promise<void> }, text: string) {
    await locator.click()
    for (const ch of text) {
      await this.page.keyboard.type(ch)
      await this.rec.advance(35 + Math.random() * 50 + (ch === ' ' ? 40 : 0))
    }
    await this.rec.advance(300)
  }
  async scroll(px: number) {
    await this.page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), px)
    await this.rec.advance(650)
  }
}

/** Advances both the fake clock and real time by `ms`, capturing frames along the way. */
class Recorder {
  private frame = 0
  private carry = 0
  constructor(private page: Page, private mode: Mode) {}
  async start() {
    if (this.mode === 'frames') {
      fs.mkdirSync(OUT, { recursive: true })
      await this.page.clock.install({ time: new Date('2026-03-10T10:00:00') })
    } else {
      fs.mkdirSync(path.dirname(OUT), { recursive: true })
      await this.page.screencast.start({ path: `${OUT}.webm`, size: VIEWPORT, fps: FPS, quality: 90 })
    }
  }
  async advance(ms: number) {
    if (this.mode === 'screencast') { await this.page.waitForTimeout(ms); return }
    const frameMs = 1000 / FPS
    this.carry += ms
    while (this.carry >= frameMs) {
      await this.page.clock.runFor(frameMs)
      // CSS transitions run on wall time, so wait a matching slice of real time too.
      await this.page.waitForTimeout(frameMs)
      await this.page.screenshot({ path: path.join(OUT, `f_${String(this.frame++).padStart(5, '0')}.png`), type: 'png', scale: 'device', animations: 'allow', caret: 'hide' })
      this.carry -= frameMs
    }
  }
  async stop() {
    if (this.mode === 'screencast') await this.page.screencast.stop()
    console.log(this.mode === 'frames' ? `${this.frame} frames in ${OUT}/ (${(this.frame / FPS).toFixed(1)}s)` : `${OUT}.webm`)
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctxOpts: Parameters<typeof browser.newContext>[0] = {
    viewport: VIEWPORT, deviceScaleFactor: 2, locale: 'en-US', timezoneId: 'Europe/Prague', colorScheme: 'dark',
    ...(fs.existsSync(STORAGE) ? { storageState: STORAGE } : {}),
  }
  const context: BrowserContext = await browser.newContext(ctxOpts)
  await context.addInitScript(({ css, svg }) => {
    localStorage.setItem('theme', 'dark')
    addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style)
      const c = document.createElement('div'); c.id = '__trailer_cursor'; c.innerHTML = svg + '<div class="ripple"></div>'
      document.body.appendChild(c)
      addEventListener('mousemove', (e) => { c.style.transform = `translate(${e.clientX}px,${e.clientY}px)` }, true)
      addEventListener('mousedown', () => c.classList.add('down'), true)
      addEventListener('mouseup', () => setTimeout(() => c.classList.remove('down'), 120), true)
    })
  }, { css: cursorCss, svg: cursorSvg })
  const page = await context.newPage()
  const rec = new Recorder(page, MODE)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(() => (document as any).fonts.ready)
  await rec.start()
  await shots(page, new Human(page, rec))
  await rec.stop()
  await context.close(); await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
