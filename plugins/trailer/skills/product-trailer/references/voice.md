# Voiceover with ElevenLabs

A narrated trailer sounds like an Apple keynote segment: a calm voice says one short thing per scene, the picture proves it, then silence and music until the next line. The voice is not a script read over the top of the video; it is cut into the video like any other element, and everything else gets out of its way.

## Where the voice comes from

ElevenLabs is reachable through the MCP1 gateway. Make sure it is connected before starting (once per machine):

```bash
claude mcp add --transport http appwrite https://mcp1.com/mcp/appwrite/general
```

The first call opens an OAuth sign-in. The tools are prefixed `elevenlabs__creative_*`. The ones you need, in order:

| Step | Tool | Notes |
|---|---|---|
| Pick a voice | `elevenlabs__creative_list_voices` | Filter: `use_cases: ["advertisement","narrative_story"]`, `descriptives: ["calm","confident","professional"]`, `languages: ["en"]`. Pick one voice for the whole trailer and write its `voice_id` into `script.json`. Never invent an id |
| Group the takes | `elevenlabs__creative_create_flow` | One flow per trailer, named after the feature, so all lines sit together on the canvas |
| Generate a line | `elevenlabs__creative_generate_speech` | `model_id: "eleven_v4"`, `flow_id`, `voice_id`, `prompt` = the line, `generations_count: 2`. Returns `session_ids` and `node_id`. Pass `estimate_only: true` first on the longest line to see the credit cost, then tell the user the total before generating all lines |
| Wait | `elevenlabs__creative_get_flow_run_status` | Poll with `flow_id` + `session_ids` until `all_completed`. Honour `poll_after_seconds` |
| Download | `elevenlabs__creative_get_generations` | Returns `full_res_url` per generation. `curl -L -o public/audio/voice/03-reveal.mp3 "<url>"`. URLs are signed and expire, so download immediately |

One call per line, never one call for the whole script. Separate files are what make sync possible: each clip's length is measured and the scene is sized to it. A line costs about one to two cents, so regenerating after a copy note is nothing; say so when you hand over. Generate two takes per line only when someone can audition them; an agent that cannot listen should generate one take and flag it for a human ear. Do not call `generate_speech` again to "retry" a line that is still running; that charges a second generation. All nine lines of a trailer can be fired in one turn as parallel calls, then collected with a single `creative_get_flow_run_status` carrying every session id.

`eleven_v4` understands inline direction tags: `[pause]`, `[softly]`, `[slower]`, `[confident]`. Use at most one per line. Read the model guide once with `elevenlabs__creative_get_model_guide` if a line comes out wrong.

The same gateway can also generate music (`node_type: "music"`, `model_id: "eleven_music_v2_5"`) and sound effects (`node_type: "sfx"`, `model_id: "eleven_text_to_sound_v2"`) through `elevenlabs__creative_generate_in_flow`. See `audio.md`.

## Writing the narration

The narration follows the same three movements as the picture (`story.md`) and the same copy rules as the slides (`copy.md`), but it is spoken, so it can be a little warmer and a little longer than on-screen text.

- **One line per scene, 4-14 words.** At a calm pace that is 1.5-5 seconds of audio. A 60-second trailer has 6-10 lines and 25-35 seconds of speech. The rest is music and picture.
- **Say what the viewer cannot see; show what you do not say.** If the slide says "Key rotation", the voice does not say "key rotation". It says "Your old key keeps working for a day."
- **Spoken English.** Contractions, short clauses, no colons, no parentheses, no product-name-as-adjective. Read every line aloud before generating it.
- **Pain lines are observations, not complaints.** "Today, rotating a key means four screens and a prayer." is fine. "Are you tired of..." is not.
- **The reveal line is "Introducing... <Feature name>."** in a calm, serious read. No `[confident]` tag, no exclamation: the first draft with the bare name read as shouting. Start the clip before the cut so "Introducing" plays over the zoom into the reveal and the name begins right after the music drop (see `offsetFrames` below). Measure the pause in the clip with `ffmpeg -af silencedetect=noise=-35dB:d=0.15` to place it.
- **No implementation detail, and technically exact.** See "Spoken copy" in `copy.md`; two of the first nine lines had to be rewritten for this.
- **The last line is an instruction.** "It's in Settings today." "Try it on any plan."
- **No line over footage of typing or waiting.** The voice speaks when something has just happened or is about to.

Write the lines in `script.json` under each scene as `voice.text` before generating. Store the chosen take as `voice.file` and its measured length as `voice.seconds`.

## Syncing voice to picture

The rule is simple: the picture waits for the voice, never the other way round. `scripts/voice-timeline.ts` applies it, run it after downloading the clips:

```bash
npx tsx scripts/voice-timeline.ts script.json      # measures clips with ffprobe, writes timings back, reports problems
```

What it computes, per scene with a voice line:

1. `voice.start` = scene start + lead-in (+ `voice.offsetFrames`, which may be negative to start a line before the cut). Lead-in is 8 frames (0.27s) after a cut, 15 frames after a big transition such as a reveal. If the scene has a transition sound at its top (a whoosh or hit in `sfx` before the lead-in), the lead-in moves past the end of that sound plus a 6-frame guard, so the voice never speaks over it. Scene starts are composition frames: the script subtracts each scene's `transitionIn` overlap using the same table as the Remotion project, so `voice.start` and `voiceWindows` go straight into `<Sequence from>`. Override a non-default length with `transitionFrames` on the scene.
2. Minimum scene duration = lead-in + `voice.seconds` + tail. Tail is 18 frames (0.6s) so the last word is not cut by the next transition. If the scene was shorter in the plan, it is lengthened and every later scene shifts.
3. The scene may be longer than the voice (footage needs its time); then the voice sits at the start and the picture finishes the thought in silence.

Keep the slide's text hold rule from `transitions.md` as well: when a slide has both voice and text, the hold is the longer of the two.

## Sound effects and voice never overlap

A click or whoosh under a word reads as a mistake and masks a consonant. The timeline script marks every frame where voice is playing, plus a 6-frame guard on each side, as a no-SFX zone and reports any `sfx` entry inside it. Fix by moving the SFX before the voice starts or after it ends, or by dropping it: a scene with narration rarely needs more than the transition whoosh before the first word and one pop after the last. Footage clicks (`clicks`) are only reported, because the composition drops them automatically: build the SFX list in Remotion, then filter out anything inside a voice window (`remotion.md` has the snippet). The reveal and payoff hits are exempt; they may sit under a word.

Transition sounds belong in the gap between lines. That is why the lead-in exists: the whoosh plays over the cut, finishes, then the voice begins.

## Music under voice

Music drops when the voice speaks and comes back when it stops, with fades long enough that nobody notices the move:

- Normal level 0.55-0.7, under voice 0.22-0.3 (roughly -8 dB).
- Fade down over 12 frames ending 4 frames before the first word. Fade up over 18 frames starting at the last word. Down is quicker than up; a slow return feels natural, a slow drop feels late.
- Consecutive lines closer than 1.5 seconds share one duck; do not pump the music up and down between them.
- The reveal hit and the payoff hit are exempt from ducking rules: they sit in the gap, at full level, and the voice resumes after.

In Remotion, write the music volume as a function of frame that walks the `voice` windows from `script.json`:

```tsx
const duckAt = (f: number) => {
  for (const w of voiceWindows) {            // [{from, to}] in frames, merged when gaps < 45 frames
    if (f >= w.from - 16 && f < w.from - 4) return interpolate(f, [w.from - 16, w.from - 4], [1, DUCK])
    if (f >= w.from - 4 && f <= w.to) return DUCK
    if (f > w.to && f < w.to + 18) return interpolate(f, [w.to, w.to + 18], [DUCK, 1])
  }
  return 1
}
<Audio src={staticFile('audio/music.mp3')} volume={(f) => BASE * duckAt(f) * fadeInOut(f)} />
```

Each voice clip is its own `<Sequence from={voice.start}><Audio src={staticFile(voice.file)} volume={0.95} /></Sequence>`. The voice is the loudest element in the mix; after render, `scripts/mix-check.sh` should still land near -14 LUFS.

## Without a voice

Narration is the default; the first trailer shipped without it and came back with "it should be spoken voice instead". A trailer for a small feature, or one meant for X where most people watch muted, works better with slides only. Decide in the brief (`intake.md`, field "Narration: yes/no"). A trailer with voice must still make sense on mute, so every spoken line has a visual that carries the same meaning.
