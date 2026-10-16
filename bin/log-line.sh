#!/usr/bin/env bash
# log-line.sh <agent> <slug> <status> <model>
# Append one CHARTER-format session line to log/<agent>.md, then git-sync bot-brain.
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

if [[ $# -ne 4 ]]; then
  echo "usage: log-line.sh <agent> <slug> <done|blocked|question|cancelled> <model>" >&2
  exit 1
fi
agent=$1 slug=$2 status=$3 model=$4
logfile="$BRAIN/log/$agent.md"
[[ -f $logfile ]] || die "unknown agent '$agent' (no $logfile)"
valid_slug "$slug" || die "bad slug '$slug' (lowercase, digits, hyphens)"
case $status in done | blocked | question | cancelled) ;; *) die "bad status '$status'" ;; esac
[[ $model =~ ^[A-Za-z0-9._-]+$ ]] || die "bad model '$model'"

echo "$(date '+%Y-%m-%d %H:%M') | $agent | $slug | $status | $model | work/$slug/RESULT.md" >>"$logfile"
"$BIN/git-sync.sh" "$BRAIN" "log($agent): $slug $status"
