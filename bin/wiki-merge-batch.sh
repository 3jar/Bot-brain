#!/usr/bin/env bash
# wiki-merge-batch.sh
# Run the curator over every open llm-wiki PR labeled `ingest`.
# Stdout: one line per PR "<number> <merged|edited+merged|closed|needs-owner|error>", then a total line.
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

if [[ $# -ne 0 ]]; then
  echo "usage: wiki-merge-batch.sh" >&2
  exit 1
fi
model=${CURATOR_MODEL:-sonnet}
curator_tools=${CURATOR_ALLOWED_TOOLS:-"Read Edit Write Glob Grep \
Bash(git status) Bash(git diff) Bash(git diff *) Bash(git log *) Bash(git add *) Bash(git commit *) Bash(git push) \
Bash(gh pr view *) Bash(gh pr diff *) Bash(gh pr merge *) Bash(gh pr close *) Bash(gh pr edit *) Bash(gh pr comment *)"}

cd "$WIKI" 2>/dev/null || die "wiki clone not found: $WIKI"
acquire_lock "$(git rev-parse --absolute-git-dir)/bot-wiki.lock" 1800 180
[[ -z $(git status --porcelain) ]] || die "wiki working tree is not clean: $WIKI"
git switch -q main
git pull -q --ff-only

gh label create needs-owner --color D93F0B --description "Curator wants the owner to decide" >/dev/null 2>&1 || true

mkdir -p "$WORKSPACES/_logs"
day=$(date '+%Y%m%d')
log="$WORKSPACES/_logs/wiki-batch-$day.log"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') wiki-merge-batch" >>"$log"

# "<number> <true|false>" where the flag says the PR already waits for the owner.
prs=$(gh pr list --state open --label ingest --limit 100 --json number,labels \
  --jq '.[] | "\(.number) \(any(.labels[]; .name == "needs-owner"))"')

# Back to a clean, current main after each PR; park curator leftovers in a stash.
restore_main() {
  [[ -z $(git status --porcelain) ]] || git stash push -u -q -m "bot: curator leftover PR #$1"
  git switch -q main
  git pull -q --ff-only || true
  if [[ -n ${2:-} ]] && git show-ref --verify --quiet "refs/heads/$2"; then git branch -q -D "$2"; fi
}
on_exit "cd '$WIKI' && git switch -q main 2>/dev/null"

results=""
total=0 n_merged=0 n_edited=0 n_closed=0 n_owner=0 n_error=0
# Read the PR list on fd 3 so gh/claude inside the loop cannot consume it.
while read -r num waiting <&3; do
  [[ -n $num ]] || continue
  total=$((total + 1))
  decision=error

  if [[ $waiting == true ]]; then
    decision=needs-owner
  else
    head=$(gh pr view "$num" --json headRefName --jq .headRefName 2>>"$log" || true)
    if [[ -n $head ]] && gh pr checkout "$num" >>"$log" 2>&1; then
      meta=$(gh pr view "$num" --json title,body,additions,deletions,changedFiles \
        --jq '"Title: \(.title)\nStats: +\(.additions) -\(.deletions), \(.changedFiles) files\n\nBody:\n\(.body)"' 2>>"$log") || meta=""
      diff=$({ gh pr diff "$num" 2>>"$log" || true; } | head -c 100000)
      prompt="$(cat "$BRAIN/templates/wiki-curator-prompt.md")

--- PR #$num (branch $head, checked out in the current directory) ---
$meta

--- DIFF (first 100 KB) ---
$diff"
      echo "--- PR #$num" >>"$log"
      out=$(printf '%s\n' "$prompt" | run_claude "$WIKI" "$model" "$curator_tools" 2>>"$log") || out=""
      printf '%s\n' "$out" >>"$log"

      line=$(printf '%s\n' "$out" | last_line)
      claimed=${line#"$num" }
      [[ $line == "$num "* ]] || claimed=""
      # Trust the PR's real state on GitHub, not the model's claim.
      state=$(gh pr view "$num" --json state,labels --jq '.state + " " + ([.labels[].name] | join(","))' 2>>"$log" || true)
      if [[ ($claimed == merged || $claimed == edited+merged) && $state == MERGED* ]] ||
        [[ $claimed == closed && $state == CLOSED* ]] ||
        [[ $claimed == needs-owner && $state == OPEN*needs-owner* ]]; then
        decision=$claimed
      fi
      restore_main "$num" "$head"
    else
      restore_main "$num"
    fi
  fi

  case $decision in
    merged) n_merged=$((n_merged + 1)) ;;
    edited+merged) n_edited=$((n_edited + 1)) ;;
    closed) n_closed=$((n_closed + 1)) ;;
    needs-owner) n_owner=$((n_owner + 1)) ;;
    *) n_error=$((n_error + 1)) ;;
  esac
  echo "$num $decision"
  results="$results$num $decision"$'\n'
done 3<<<"$prs"

summary="total=$total merged=$n_merged edited+merged=$n_edited closed=$n_closed needs-owner=$n_owner error=$n_error"
echo "$summary"
[[ $total -gt 0 ]] || exit 0 # nothing to curate: no log line, no commit

slug="batch-$day"
dir="$BRAIN/work/$slug"
mkdir -p "$dir"
{
  echo "## $(date '+%Y-%m-%d %H:%M') wiki-merge-batch"
  printf '%s' "$results"
  echo "$summary"
  echo
} >>"$dir/RESULT.md"
status=done
[[ $n_error -eq 0 ]] || status=blocked
echo "$status: $summary" >"$dir/SUMMARY.txt"
"$BIN/log-line.sh" wiki "$slug" "$status" "$model" >&2
