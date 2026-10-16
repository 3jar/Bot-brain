#!/usr/bin/env bash
# new-ticket.sh <slug>
# Create work/<slug>/SPEC.md from templates/SPEC.md and print its path.
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

if [[ $# -ne 1 ]]; then
  echo "usage: new-ticket.sh <slug>   (slug: lowercase, digits, hyphens)" >&2
  exit 1
fi
slug=$1
valid_slug "$slug" || die "bad slug '$slug' (lowercase, digits, hyphens)"
dir="$BRAIN/work/$slug"
[[ ! -e $dir && ! -e $BRAIN/work/_archive/$slug ]] || die "ticket '$slug' already exists"

mkdir -p "$dir"
sed "1s/<slug>/$slug/" "$BRAIN/templates/SPEC.md" >"$dir/SPEC.md"
echo "$dir/SPEC.md"
