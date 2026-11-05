# Music, sound effects, mixing

Audio is half the feel. A trailer with a good track and ten well-placed clicks reads as finished; the same visuals in silence read as a screen recording. Everything here must be legally usable in company marketing on YouTube, X and the website, so licence first, taste second.

## Music

Pick one track, 60-90 seconds usable, that fits the tone from the brief. Look for: a clear beat (you will cut on it), a build or drop you can place at the reveal, a natural ending or a point where a 2-second fade sounds intentional. Avoid vocals, anything with a famous melody, and "corporate uplifting" piano-and-claps loops.

Sources, with what an agent can actually do:

| Source | Licence | Agent-fetchable | Notes |
|---|---|---|---|
| **Mixkit** (mixkit.co/free-stock-music) | Free, commercial OK, no attribution | Yes, direct MP3 URLs once you find the track page | First stop for free. Filter by mood "Corporate" or "Technology", 60-120 BPM |
| **Pixabay Music** | Free, commercial OK, no attribution | No (browser download, no audio API) | Ask the user to download, or fetch the page in a browser session |
| **Freesound** | Per-sound CC; filter CC0 | Yes, API with a free token; previews (128 kbps mp3) without OAuth | SFX more than music. `filter=license:"Creative Commons 0"` |
| **Uppbeat** | Free tier needs credit in the description, individuals only | No | Business use needs a paid plan |
| **Free Music Archive** | Mixed CC; only CC0 is attribution-free, NC and ND are unusable | Partly | Check every track |
| **YouTube Audio Library** | Treat as YouTube-only | No | Skip for cross-platform |
| **Epidemic Sound, Artlist, Musicbed, Soundstripe** | Paid subscription, covers ads and social | No | If the company has one, use it. Ask |

ElevenLabs can also compose a track through the MCP1 gateway (`voice.md` has the setup): `elevenlabs__creative_generate_in_flow` with `node_type: "music"`, `model_id: "eleven_music_v2_5"` and a prompt like "calm confident electronic, 112 BPM, no vocals, soft build at 12 seconds, 65 seconds, clean ending". Generated music is owned by the workspace, so there is nothing to credit, and you can ask for the exact length and tempo instead of trimming a library track. Generate 2-4 variations, pick by ear in Studio.

Check what the team already pays for before hunting free tracks. If a track needs attribution, put it in the video description and in `CREDITS.md` next to the render.

Store as `public/audio/music.mp3`. Note BPM and the time of the first downbeat in `script.json`; tap it out in Studio or run `ffmpeg -i music.mp3 -af "ebur128" -f null -` and look at the loudness momentary peaks if the beat is clear. Many library tracks state BPM in their title or tags.

## Sound effects

Clicks, pops, whooshes, a riser, a hit, ticks. Ten to twenty per minute is normal; fewer than five feels dead, more than thirty is a cartoon. Generate the set yourself first with `scripts/make-sfx.sh` (ffmpeg, 48 kHz WAV, no licences to track). Replace individual sounds from Freesound CC0 or Mixkit SFX if a synthetic one sounds thin.

Where each one goes:

| Sound | On |
|---|---|
| `click` / `click-soft` | Every cursor click in footage. Soft for secondary actions |
| `pop` | A badge flips, a toast appears, a row is created, a check lands |
| `whoosh` | Push, slide, wipe transitions. Start 2-3 frames before the visual |
| `whoosh-long` + `riser` | Into the reveal. Riser ends exactly on the beat the title lands |
| `hit` | Title lands, logo lands, the payoff number stops |
| `tick` | Each step of a counter roll, every 2-3 frames |

The same gateway makes one-off sound effects: `node_type: "sfx"`, `model_id: "eleven_text_to_sound_v2"`, prompt "short soft UI click, no reverb". Useful when the synthetic set is too plain for the reveal.

Rules: one sound per event, never stacked. **Never under a voice line**: when the trailer is narrated, every SFX sits in the gaps between lines (`voice.md`, enforced by `scripts/voice-timeline.ts`). Sounds sit 10-14 dB under the music peak, except the reveal hit which can match it. Nothing in the first 10 frames except the music fade-in and the logo hit.

## Mixing in Remotion

Do the mix in Remotion, not in a DAW, so re-renders stay consistent:

- Music `<Audio>` at volume 0.55-0.7 with a 1-second fade in and a 2-second fade out, written as a function of frame.
- Duck the music by 0.15-0.25 for 10 frames around the reveal hit and the payoff hit; `interpolate` the volume with the hit frames as input range.
- With narration, duck to 0.22-0.3 under every voice window with a 12-frame fade down and an 18-frame fade up; the windows come from `script.json` after `scripts/voice-timeline.ts` runs. Details and code in `voice.md`.
- Each SFX in its own `<Sequence from={frame}>` with `<Audio volume={0.4-0.8}>`.
- Keep the last frame of audio before the last frame of video; a video that ends on a sound tail feels unfinished.

## Loudness

Target about -14 LUFS integrated, true peak ≤ -1 dBTP (what YouTube and X normalise to). After rendering: `scripts/mix-check.sh out/trailer.mp4`. If you are off by more than 2 LU, scale the master volumes in Remotion and re-render; do not post-process the mp4, you will lose the single source of truth.

ffmpeg reference recipes, if you must prepare a stem outside Remotion:

```bash
# trim a 70s section with fades, to mp3
ffmpeg -i music-full.wav -af "atrim=12:82,asetpts=PTS-STARTPTS,afade=t=in:d=0.5,afade=t=out:st=68:d=2" -c:a libmp3lame -q:a 2 public/audio/music.mp3
# two-pass loudness normalise a stem to -14 LUFS
ffmpeg -i in.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2> pass1.json   # read measured_* values
ffmpeg -i in.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=-20.1:measured_TP=-3.2:measured_LRA=6.5:measured_thresh=-30.4:offset=0.1:linear=true" out.wav
# duck music under an SFX track and mix
ffmpeg -i music.wav -i sfx.wav -filter_complex "[0:a][1:a]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[d];[d][1:a]amix=inputs=2:weights=1 1:normalize=0" -c:a aac -b:a 192k mix.m4a
```

## Credits file

Write `CREDITS.md` beside the render with the music title, author, source URL and licence, and the same for any downloaded SFX. Whoever posts the video needs it, and it answers the takedown email before it arrives.
