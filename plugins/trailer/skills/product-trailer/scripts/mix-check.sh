#!/usr/bin/env bash
# Measure integrated loudness and true peak of a rendered trailer. Target: about -14 LUFS, peak <= -1 dBTP.
#   scripts/mix-check.sh out/trailer.mp4
set -euo pipefail
ffmpeg -hide_banner -i "${1:?file}" -af "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=summary" -f null - 2>&1 | sed -n '/Input Integrated/,/Target Offset/p'
