#!/usr/bin/env bash
# Find the moments a recorded take visibly reacts (menu opens, page swaps) from frame-to-frame change scores.
#   scripts/ui-events.sh footage/take.mp4 [threshold=0.06]
# Prints (frame, seconds, peak) per event in SOURCE time. Convert to composition time with
# (t - trimBefore) / playbackRate. Use these for pop/click SFX and to decide where a shot should cut.
# Prefer the click log written by scripts/record.ts (<out>.events.json); this is the fallback for old takes.
set -euo pipefail
IN="${1:?take.mp4}"; THR="${2:-0.06}"
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=nw=1:nk=1 "$IN" | awk -F/ '{printf "%.3f", $1/$2}')
ffmpeg -loglevel info -i "$IN" -vf "scale=640:-2,scdet=threshold=100,metadata=print:key=lavfi.scd.score" -f null - 2>&1 \
  | grep -o "lavfi.scd.score=[0-9.]*" | cut -d= -f2 \
  | awk -v thr="$THR" -v fps="$FPS" '
    { v[NR-1]=$1; n=NR }
    END {
      i=0
      while (i<n) {
        if (v[i]>thr) { j=i; peak=0; while (j<n && (v[j]>thr || j-i<10)) { if (v[j]>peak) peak=v[j]; j++ }
          printf "frame %d  %.2fs  peak %.2f\n", i, i/fps, peak; i=j }
        else i++
      }
    }'
