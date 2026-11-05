#!/usr/bin/env bash
# Encode a rendered trailer so it uploads and plays inline on Discord.
#   scripts/render-discord.sh out/trailer.mp4 [budget_mb=19] [out=out/trailer-discord.mp4]
# Two-pass H.264 sized to the budget. Picks 1080p when the budget allows >= 3.2 Mbit/s video, otherwise 720p.
# Discord limits (Nov 2026): free 20 MB, Nitro Basic / boost level 2: 50 MB, boost level 3: 100 MB. Default budget 19 MB.
set -euo pipefail
IN="${1:?input mp4}"; BUDGET_MB="${2:-19}"; OUT="${3:-${IN%.*}-discord.mp4}"
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$IN")
AUDIO_K=128
TOTAL_K=$(python3 -c "print(int($BUDGET_MB*8*1000*0.96/$DUR))")          # kbit/s, 4% container headroom
VIDEO_K=$((TOTAL_K - AUDIO_K))
if [ "$VIDEO_K" -ge 3200 ]; then SCALE="1920:-2"; else SCALE="1280:-2"; fi
if [ "$VIDEO_K" -lt 900 ]; then echo "Budget too small for ${DUR}s ($VIDEO_K kbit/s). Shorten the video or raise the budget." >&2; exit 1; fi
echo "duration ${DUR}s, budget ${BUDGET_MB} MB -> video ${VIDEO_K}k + audio ${AUDIO_K}k, scale ${SCALE}"
LOG=$(mktemp -d)/ffpass
ffmpeg -y -loglevel error -i "$IN" -vf "scale=${SCALE}:flags=lanczos" -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p \
  -b:v "${VIDEO_K}k" -maxrate "$((VIDEO_K*12/10))k" -bufsize "$((VIDEO_K*2))k" -preset slow -pass 1 -passlogfile "$LOG" -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i "$IN" -vf "scale=${SCALE}:flags=lanczos" -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p \
  -b:v "${VIDEO_K}k" -maxrate "$((VIDEO_K*12/10))k" -bufsize "$((VIDEO_K*2))k" -preset slow -pass 2 -passlogfile "$LOG" \
  -c:a aac -b:a "${AUDIO_K}k" -ar 48000 -movflags +faststart "$OUT"
SIZE=$(stat -f%z "$OUT" 2>/dev/null || stat -c%s "$OUT")
echo "$OUT: $((SIZE/1024/1024)) MB ($SIZE bytes)"
if [ "$SIZE" -gt $((BUDGET_MB*1024*1024)) ]; then echo "Over budget. Re-run with a smaller budget or a shorter cut." >&2; exit 1; fi
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,profile,width,height,r_frame_rate -of default=nw=1 "$OUT"
