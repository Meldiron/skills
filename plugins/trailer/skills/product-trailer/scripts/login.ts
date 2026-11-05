/**
 * Sign in to the local Appwrite Console once and save the session for recordings.
 *   npx tsx scripts/login.ts --email admin@example.com --password 'secret' [--base http://localhost/console]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
const a = Object.fromEntries(process.argv.slice(2).map((x, i, arr) => x.startsWith('--') ? [x.slice(2), arr[i + 1]] : []).filter(Boolean))
const BASE = a.base ?? 'http://localhost/console'
;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(a.email)
  await page.locator('input[name="password"]').fill(a.password)
  await page.getByRole('button', { name: /^(Login|Sign in)$/ }).click()
  await page.waitForURL((u) => /\/console\/(organization|account|project)/.test(u.pathname) || u.pathname === '/console/', { timeout: 30_000 })
  fs.mkdirSync('.auth', { recursive: true })
  await ctx.storageState({ path: '.auth/state.json' })
  console.log('saved .auth/state.json')
  await browser.close()
})()
