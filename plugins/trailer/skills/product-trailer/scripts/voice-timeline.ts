/**
 * Fit voice clips into the beat sheet and check that nothing collides with them.
 *
 *   npx tsx scripts/voice-timeline.ts script.json [--fps 30] [--write]
 *
 * For every scene with voice.file: measures the clip with ffprobe, sets voice.seconds, voice.start (frames),
 * extends scene.duration when the clip does not fit, shifts later scenes, and reports:
 *   - SFX inside a voice window (plus a 6-frame guard)   -> move or drop the SFX
 *   - text holds shorter than the reading rule           -> lengthen the scene
 * Prints the merged voice windows (for music ducking) and the total length. With --write, saves timings back.
 * Needs: ffprobe on PATH, Node 20+, tsx.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

type Sfx = { at: number; file: string; gain?: number }
type Scene = {
  id: string; beat: string; duration: number; layout: string; headline?: string; line?: string; label?: string
  transitionIn?: string; sfx?: Sfx[]
  voice?: { text?: string; file?: string; seconds?: number; start?: number; leadFrames?: number }
}
type Script = { fps?: number; scenes: Scene[]; voiceWindows?: { from: number; to: number }[] }

const file = process.argv[2]
if (!file) { console.error('usage: voice-timeline.ts script.json [--fps 30] [--write]'); process.exit(2) }
const flags = process.argv.slice(3)
const script: Script = JSON.parse(fs.readFileSync(file, 'utf8'))
const fps = Number(flags.includes('--fps') ? flags[flags.indexOf('--fps') + 1] : script.fps ?? 30)
const root = path.dirname(path.resolve(file))
const publicDir = fs.existsSync(path.join(root, 'remotion/public')) ? path.join(root, 'remotion/public') : path.join(root, 'public')

const BIG = new Set(['zoom-through', 'whip', 'mask', 'iris', 'wipe'])
const TAIL = 18, GUARD = 6, MERGE_GAP = 45
const probe = (p: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', p]).toString().trim())
const words = (s?: string) => (s ?? '').trim().split(/\s+/).filter(Boolean).length

let cursor = 0, problems = 0
const windows: { from: number; to: number }[] = []

for (const sc of script.scenes) {
  const startF = cursor
  let durF = Math.round(sc.duration * fps)
  // reading hold for on-screen text, after a 14-frame entrance
  const textWords = words(sc.headline) + words(sc.line) + words(sc.label)
  if (textWords) {
    const hold = Math.ceil((textWords / 2.5 + 0.5) * fps) + 14
    if (durF < hold) { console.log(`• ${sc.id}: text needs ${hold}f, scene is ${durF}f → extended`); durF = hold }
  }
  if (sc.voice?.file) {
    const abs = path.isAbsolute(sc.voice.file) ? sc.voice.file : path.join(publicDir, sc.voice.file)
    if (!fs.existsSync(abs)) { console.log(`✗ ${sc.id}: voice file missing: ${abs}`); problems++; continue }
    const secs = probe(abs)
    let lead = sc.voice.leadFrames ?? (BIG.has(sc.transitionIn ?? '') ? 15 : 8)
    // A transition sound at the top of the scene (whoosh, hit) must finish before the first word: push the lead past it.
    for (const s of sc.sfx ?? []) {
      const atF = Math.round(s.at * fps)
      if (atF < lead) {
        const sAbs = path.isAbsolute(s.file) ? s.file : path.join(publicDir, s.file)
        const sDur = fs.existsSync(sAbs) ? probe(sAbs) : 0.6
        const endF = atF + Math.ceil(sDur * fps) + GUARD
        if (endF > lead) { console.log(`• ${sc.id}: lead-in moved from ${lead}f to ${endF}f so "${s.file}" finishes before the voice`); lead = endF }
      }
    }
    const vFrames = Math.ceil(secs * fps)
    const need = lead + vFrames + TAIL
    if (durF < need) { console.log(`• ${sc.id}: voice ${secs.toFixed(2)}s needs ${need}f, scene was ${durF}f → extended`); durF = need }
    sc.voice.seconds = Number(secs.toFixed(3)); sc.voice.start = startF + lead
    windows.push({ from: startF + lead, to: startF + lead + vFrames })
    for (const s of sc.sfx ?? []) {
      const atF = startF + Math.round(s.at * fps)
      if (atF >= startF + lead - GUARD && atF <= startF + lead + vFrames + GUARD) {
        console.log(`✗ ${sc.id}: sfx "${s.file}" at ${s.at}s lands inside the voice window (${((lead - GUARD) / fps).toFixed(2)}s–${((lead + vFrames + GUARD) / fps).toFixed(2)}s). Move it or drop it.`); problems++
      }
    }
  }
  sc.duration = Number((durF / fps).toFixed(3))
  cursor += durF
}

// merge windows closer than MERGE_GAP so the music does not pump between consecutive lines
const merged: typeof windows = []
for (const w of windows.sort((a, b) => a.from - b.from)) {
  const last = merged[merged.length - 1]
  if (last && w.from - last.to < MERGE_GAP) last.to = Math.max(last.to, w.to); else merged.push({ ...w })
}
script.voiceWindows = merged
const speech = windows.reduce((a, w) => a + (w.to - w.from), 0)
console.log(`\nTotal ${(cursor / fps).toFixed(1)}s (${cursor}f). Speech ${(speech / fps).toFixed(1)}s in ${windows.length} lines, ${merged.length} duck windows.`)
console.log('voiceWindows (frames):', JSON.stringify(merged))
if (cursor / fps > 75) { console.log('✗ Over 75 seconds. Cut a scene or shorten lines.'); problems++ }
if (flags.includes('--write')) { fs.writeFileSync(file, JSON.stringify(script, null, 2) + '\n'); console.log(`wrote ${file}`) }
process.exit(problems ? 1 : 0)
