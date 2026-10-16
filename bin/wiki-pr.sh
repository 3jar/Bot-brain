#!/usr/bin/env bash
# wiki-pr.sh <slug>
# Turn work/<slug>/WIKI-CANDIDATE.md into an llm-wiki PR on branch wiki/<slug>.
# Stdout is one line: the PR URL, or no-candidate / no-change.
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

if [[ $# -ne 1 ]]; then
  echo "usage: wiki-pr.sh <slug>" >&2
  exit 1
fi
slug=$1
valid_slug "$slug" || die "bad slug '$slug'"
cand="$BRAIN/work/$slug/WIKI-CANDIDATE.md"
if [[ ! -f $cand ]]; then
  echo "no-candidate"
  exit 0
fi

cd "$WIKI" 2>/dev/null || die "wiki clone not found: $WIKI"
acquire_lock "$(git rev-parse --absolute-git-dir)/bot-wiki.lock" 1800 180
[[ -z $(git status --porcelain) ]] || die "wiki working tree is not clean: $WIKI"
git switch -q main
git pull -q --ff-only

branch="wiki/$slug"
if git show-ref --verify --quiet "refs/heads/$branch" ||
  git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  die "branch $branch already exists"
fi
git switch -q -c "$branch"
# Always leave the clone on a clean main; park leftovers in a stash instead of losing them.
on_exit "cd '$WIKI' && { [[ -z \$(git status --porcelain) ]] || git stash push -u -q -m 'bot: wiki-pr $slug leftover'; } && git switch -q main"

mkdir -p "$WORKSPACES/_logs"
log="$WORKSPACES/_logs/wiki-pr-$slug.log"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') wiki-pr $slug" >>"$log"

prompt="$(cat "$BRAIN/templates/wiki-ingest-prompt.md")

--- WIKI-CANDIDATE (bot-brain work/$slug) ---
$(cat "$cand")"

out=$(printf '%s\n' "$prompt" |
  run_claude "$WIKI" "${WIKI_MODEL:-sonnet}" "${INGEST_ALLOWED_TOOLS:-Read Edit Write Glob Grep}" 2>>"$log") ||
  die "claude failed during ingest, see $log"
printf '%s\n' "$out" >>"$log"

if [[ -z $(git status --porcelain) ]]; then
  git switch -q main
  git branch -q -D "$branch"
  echo "no-change"
  exit 0
fi

git add -A
git commit -q -m "wiki: $slug"
git push -q -u origin "$branch"

gh label create ingest --color 0E8A16 --description "Knowledge from a bot-brain ticket" >/dev/null 2>&1 || true
body="$(cat "$cand")

---
Source: bot-brain \`work/$slug/\`
Files changed: $(printf '%s\n' "$out" | last_line)"
gh pr create --base main --head "$branch" --title "wiki: $slug" --label ingest --body-file - <<<"$body"
