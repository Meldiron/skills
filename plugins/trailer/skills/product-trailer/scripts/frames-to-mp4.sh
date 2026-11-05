#!/usr/bin/env bash
# Convert a PNG frame sequence from scripts/record.ts into an H.264 mp4 for Remotion.
#   scripts/frames-to-mp4.sh footage/take-01 60 [scale]   -> footage/take-01.mp4
# scale: 1 keeps DPR-2 size (3200x1800), 0.5 halves it. Default 1 so you can zoom in Remotion.
set -euo pipefail
DIR="${1:?frames dir}"; FPS="${2:-60}"; SCALE="${3:-1}"
ffmpeg -y -framerate "$FPS" -i "$DIR/f_%05d.png" \
  -vf "scale=trunc(iw*${SCALE}/2)*2:trunc(ih*${SCALE}/2)*2:flags=lanczos" \
  -c:v libx264 -pix_fmt yuv420p -crf 16 -preset slow -movflags +faststart "$DIR.mp4"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames -of default=noprint_wrappers=1 "$DIR.mp4"
