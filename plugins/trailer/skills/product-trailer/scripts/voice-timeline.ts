/**
 * Fit voice clips into the beat sheet and check that nothing collides with them.
 *
 *   npx tsx scripts/voice-timeline.ts script.json [--fps 30] [--write]
 *
 * For every scene with voice.file: measures the clip with ffprobe, sets voice.seconds and voice.start,
 * extends scene.duration when the clip does not fit, shifts later scenes, and reports:
 *   - SFX or footage clicks inside a voice window (plus a 6-frame guard)  -> move or drop them (hits are exempt)
 *   - text holds shorter than the reading rule                            -> lengthen the scene
 * Prints the merged voice windows (for music ducking) and the total length. With --write, saves timings back.
 *
 * Frames are COMPOSITION frames: scene starts subtract the transition overlap of each scene's `transitionIn`
 * (same table as the Remotion project, override per scene with `transitionFrames`), so `voice.start` and
 * `voiceWindows` can be used directly in <Sequence from>. `voice.offsetFrames` shifts a line (negative = it
 * begins before the cut, e.g. "Introducing..." over the zoom into the reveal).
 * Needs: ffprobe on PATH, Node 20+, tsx.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

type Sfx = { at: number; file: string; gain?: number }
type Scene = {
  id: string; beat: string; duration: number; layout: string; headline?: string; line?: string; label?: string
  transitionIn?: string; transitionFrames?: number; sfx?: Sfx[]; clicks?: number[]
  voice?: { text?: string; file?: string; seconds?: number; start?: number; leadFrames?: number; offsetFrames?: number }
}
type Script = { fps?: number; scenes: Scene[]; voiceWindows?: { from: number; to: number }[] }

const file = process.argv[2]
if (!file) { console.error('usage: voice-timeline.ts script.json [--fps 30] [--write]'); process.exit(2) }
const flags = process.argv.slice(3)
const script: Script = JSON.parse(fs.readFileSync(file, 'utf8'))
const fps = Number(flags.includes('--fps') ? flags[flags.indexOf('--fps') + 1] : script.fps ?? 30)
const root = path.dirname(path.resolve(file))
const publicDir = fs.existsSync(path.join(root, 'remotion/public')) ? path.join(root, 'remotion/public') : path.join(root, 'public')

/** Default transition lengths in frames at 30 fps. Keep in sync with the Remotion project (src/script.ts). */
const TRANSITION_FRAMES: Record<string, number> = { cut: 0, fade: 12, dip: 14, push: 15, slide: 15, wipe: 16, whip: 11, 'zoom-through': 18, iris: 16, mask: 14, 'scale-blur': 12, match: 0 }
const BIG = new Set(['zoom-through', 'whip', 'mask', 'iris', 'wipe'])
const TAIL = 18, GUARD = 6, MERGE_GAP = 45
const probe = (p: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', p]).toString().trim())
const words = (s?: string) => (s ?? '').trim().split(/\s+/).filter(Boolean).length
const abs = (p: string) => (path.isAbsolute(p) ? p : path.join(publicDir, p))

let cursor = 0, problems = 0
const windows: { from: number; to: number }[] = []

script.scenes.forEach((sc, i) => {
  const overlap = i === 0 ? 0 : sc.transitionFrames ?? TRANSITION_FRAMES[sc.transitionIn ?? 'cut'] ?? 0
  const startF = cursor - overlap
  let durF = Math.round(sc.duration * fps)
  // reading hold for on-screen text, after a 14-frame entrance
  const textWords = words(sc.headline) + words(sc.line) + words(sc.label)
  if (textWords) {
    const hold = Math.ceil((textWords / 2.5 + 0.5) * fps) + 14
    if (durF < hold) { console.log(`• ${sc.id}: text needs ${hold}f, scene is ${durF}f → extended`); durF = hold }
  }
  if (sc.voice?.file) {
    const clip = abs(sc.voice.file)
    if (!fs.existsSync(clip)) { console.log(`✗ ${sc.id}: voice file missing: ${clip}`); problems++ }
    else {
      const secs = probe(clip)
      let lead = sc.voice.leadFrames ?? (BIG.has(sc.transitionIn ?? '') ? 15 : 8)
      // A transition sound at the top of the scene (whoosh, hit) must finish before the first word: push the lead past it.
      for (const s of sc.sfx ?? []) {
        const atF = Math.round(s.at * fps)
        if (atF < lead) {
          const sAbs = abs(s.file)
          const sDur = fs.existsSync(sAbs) ? probe(sAbs) : 0.6
          const endF = atF + Math.ceil(sDur * fps) + GUARD
          if (endF > lead) { console.log(`• ${sc.id}: lead-in moved from ${lead}f to ${endF}f so "${s.file}" finishes before the voice`); lead = endF }
        }
      }
      const offset = sc.voice.offsetFrames ?? 0
      const vFrames = Math.ceil(secs * fps)
      const need = lead + offset + vFrames + TAIL
      if (durF < need) { console.log(`• ${sc.id}: voice ${secs.toFixed(2)}s needs ${need}f, scene was ${durF}f → extended`); durF = need }
      const from = startF + lead + offset
      sc.voice.seconds = Number(secs.toFixed(3)); sc.voice.start = from
      windows.push({ from, to: from + vFrames })
      const inside = (f: number) => f >= from - GUARD && f <= from + vFrames + GUARD
      for (const s of sc.sfx ?? []) {
        if (s.file.includes('hit')) continue // the reveal and payoff hits may sit under a word
        const atF = startF + Math.round(s.at * fps)
        if (inside(atF)) { console.log(`✗ ${sc.id}: sfx "${s.file}" at ${s.at}s lands inside the voice window. Move it or drop it.`); problems++ }
      }
      const hiddenClicks = (sc.clicks ?? []).filter((t) => inside(startF + Math.round(t * fps)))
      if (hiddenClicks.length) console.log(`• ${sc.id}: ${hiddenClicks.length} footage click(s) fall under the voice (${hiddenClicks.join(', ')}s); the composition should mute them`)
    }
  }
  sc.duration = Number((durF / fps).toFixed(3))
  cursor = startF + durF
})

// merge windows closer than MERGE_GAP so the music does not pump between consecutive lines
const merged: typeof windows = []
for (const w of windows.sort((a, b) => a.from - b.from)) {
  const last = merged[merged.length - 1]
  if (last && w.from - last.to < MERGE_GAP) last.to = Math.max(last.to, w.to); else merged.push({ ...w })
}
script.voiceWindows = merged
const speech = windows.reduce((a, w) => a + (w.to - w.from), 0)
console.log(`\nTotal ${(cursor / fps).toFixed(1)}s (${cursor}f, transitions subtracted). Speech ${(speech / fps).toFixed(1)}s in ${windows.length} lines, ${merged.length} duck windows.`)
console.log('voiceWindows (composition frames):', JSON.stringify(merged))
if (cursor / fps > 75) { console.log('✗ Over 75 seconds. Cut a scene or shorten lines.'); problems++ }
if (flags.includes('--write')) { fs.writeFileSync(file, JSON.stringify(script, null, 2) + '\n'); console.log(`wrote ${file}`) }
process.exit(problems ? 1 : 0)
