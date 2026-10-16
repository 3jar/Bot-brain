#!/usr/bin/env bash
# git-sync.sh <repo-dir> <message>
# Stage everything, commit if changed, then pull --rebase and push (3 tries).
# Exit 2 with the conflicting paths on a persistent rebase conflict.
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

if [[ $# -ne 2 || -z $2 ]]; then
  echo "usage: git-sync.sh <repo-dir> <message>" >&2
  exit 1
fi
repo=$1 msg=$2
[[ -d $repo ]] || die "not a directory: $repo"
cd "$repo"
gitdir=$(git rev-parse --absolute-git-dir) || die "not a git repo: $repo"

acquire_lock "$gitdir/bot-sync.lock" 120 10

git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "$msg"
fi

branch=$(git symbolic-ref --short HEAD)
conflicts=""
for try in 1 2 3; do
  if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    pull_ok=true
    git pull -q --rebase || pull_ok=false
  elif git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    pull_ok=true
    git pull -q --rebase origin "$branch" || pull_ok=false
  else
    pull_ok=true # remote branch does not exist yet; first push creates it
  fi

  if $pull_ok && git push -q -u origin "$branch"; then
    exit 0
  fi

  if [[ -d $gitdir/rebase-merge || -d $gitdir/rebase-apply ]]; then
    conflicts=$(git diff --name-only --diff-filter=U)
    git rebase --abort
  fi
  sleep $((try * 2))
done

if [[ -n $conflicts ]]; then
  echo "conflict: git-sync failed in $repo; conflicting paths:" >&2
  echo "$conflicts" >&2
  exit 2
fi
die "git-sync failed in $repo after 3 tries (network or auth?)"
