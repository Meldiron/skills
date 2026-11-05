#!/usr/bin/env bash
# Print the loudness envelope of a music track at 50 ms resolution so you can find the drop (and the ending).
#   scripts/find-drop.sh public/audio/music.mp3 [from_s=10] [to_s=20]
# Read it like this: a run of quiet windows followed by a sustained jump of 8+ dB is the drop. Note the time
# of the first loud window and set music.trimBefore = drop - (frame of the reveal hit / fps) in script.json.
set -euo pipefail
IN="${1:?music file}"; FROM="${2:-10}"; TO="${3:-20}"
ffmpeg -i "$IN" -af "asetnsamples=2205,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" -f null - 2>/dev/null \
  | grep -o "RMS_level=.*" | cut -d= -f2 \
  | awk -v from="$FROM" -v to="$TO" '{ t=(NR-1)*0.05; if (t>=from && t<=to) printf "%.2f:%.0f ", t, $1 } END { print "" }'
echo "(seconds:dBFS, 50 ms windows)"
