#!/usr/bin/env bash
# Generate a small set of clean synthetic sound effects with ffmpeg. No downloads, no licences.
#   scripts/make-sfx.sh public/audio/sfx
# Produces: click, click-soft, pop, whoosh, whoosh-long, riser, hit, tick. 48 kHz WAV.
set -euo pipefail
OUT="${1:-sfx}"; mkdir -p "$OUT"
F() { ffmpeg -y -loglevel error "$@"; }
# UI click: short bright transient
F -f lavfi -i "sine=frequency=2200:duration=0.03" -af "afade=t=out:st=0:d=0.03,volume=0.7,aresample=48000" "$OUT/click.wav"
# Softer click for secondary actions
F -f lavfi -i "sine=frequency=1400:duration=0.025" -af "afade=t=out:st=0:d=0.025,volume=0.45,aresample=48000" "$OUT/click-soft.wav"
# Pop: badge flips, toasts, checkmarks
F -f lavfi -i "sine=frequency=620:duration=0.09" -af "afade=t=out:st=0:d=0.09:curve=exp,volume=0.8,aresample=48000" "$OUT/pop.wav"
# Whoosh: scene transitions (600 ms)
F -f lavfi -i "anoisesrc=color=pink:amplitude=0.5:duration=0.6:seed=11" -af "lowpass=f=2600,highpass=f=320,afade=t=in:st=0:d=0.25:curve=qsin,afade=t=out:st=0.25:d=0.35:curve=qsin,volume=0.9,aresample=48000" "$OUT/whoosh.wav"
# Longer whoosh for the reveal (1 s)
F -f lavfi -i "anoisesrc=color=brown:amplitude=0.6:duration=1.0:seed=12" -af "lowpass=f=1800,highpass=f=200,afade=t=in:st=0:d=0.5:curve=qsin,afade=t=out:st=0.5:d=0.5:curve=qsin,aresample=48000" "$OUT/whoosh-long.wav"
# Riser: 2 s swell into the reveal
F -f lavfi -i "anoisesrc=color=white:amplitude=0.4:duration=2:seed=21" -f lavfi -i "sine=frequency=180:duration=2" \
  -filter_complex "[0]highpass=f=400,afade=t=in:d=2:curve=exp[n];[1]vibrato=f=7:d=0.4,afade=t=in:d=2:curve=cub[s];[n][s]amix=inputs=2:weights=1 0.5:normalize=0,afade=t=out:st=1.9:d=0.1,aresample=48000" "$OUT/riser.wav"
# Hit: low thump when a title lands
F -f lavfi -i "sine=frequency=60:duration=0.5" -af "afade=t=out:st=0.05:d=0.45:curve=exp,volume=1.0,aresample=48000" "$OUT/hit.wav"
# Tick: counters rolling
F -f lavfi -i "sine=frequency=3000:duration=0.012" -af "afade=t=out:st=0:d=0.012,volume=0.35,aresample=48000" "$OUT/tick.wav"
ls -la "$OUT"
