#!/usr/bin/env bash
# archive.sh [--days N] [--dry-run]
# Weekly chore: move done tickets older than N days (default 14) to work/_archive/
# and delete their ~/workspaces/<slug>/. Age = last commit touching SUMMARY.txt.
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

usage() {
  echo "usage: archive.sh [--days N] [--dry-run]" >&2
  exit 1
}
days=14 dry=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --days)
      [[ ${2:-} =~ ^[0-9]+$ ]] || usage
      days=$2
      shift 2
      ;;
    --dry-run)
      dry=true
      shift
      ;;
    *) usage ;;
  esac
done

cutoff=$(($(date +%s) - days * 86400))
moved=""
count=0
for dir in "$BRAIN"/work/*/; do
  slug=$(basename "$dir")
  valid_slug "$slug" || continue # skips _archive
  [[ -f $dir/SUMMARY.txt && $(head -c 5 "$dir/SUMMARY.txt") == "done:" ]] || continue
  ts=$(git -C "$BRAIN" log -1 --format=%ct -- "work/$slug/SUMMARY.txt")
  [[ -n $ts && $ts -lt $cutoff ]] || continue
  if [[ -e $BRAIN/work/_archive/$slug ]]; then
    echo "warning: work/_archive/$slug already exists, skipping" >&2
    continue
  fi
  count=$((count + 1))
  moved="$moved $slug"
  $dry && continue
  mv "$BRAIN/work/$slug" "$BRAIN/work/_archive/$slug"
  rm -rf "${WORKSPACES:?}/$slug" "$WORKSPACES/_logs/$slug.log"
done

if $dry; then
  echo "would archive $count:$moved"
  exit 0
fi
if [[ $count -gt 0 ]]; then
  "$BIN/git-sync.sh" "$BRAIN" "chore: archive $count tickets" >&2
fi
echo "archived $count:$moved"
