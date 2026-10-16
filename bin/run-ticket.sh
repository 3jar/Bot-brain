#!/usr/bin/env bash
# run-ticket.sh <agent> <slug> [model] [--resume]
# Run one ticket in Claude Code inside a fresh ~/workspaces/<slug>/.
# Stdout is exactly one line: <done|blocked|question>: <summary>. Grok bots read only this.
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

usage() {
  echo "usage: run-ticket.sh <agent> <slug> [model] [--resume]" >&2
  exit 1
}

resume=false
args=()
for a in "$@"; do
  case $a in
    --resume) resume=true ;;
    -*) usage ;;
    *) args+=("$a") ;;
  esac
done
[[ ${#args[@]} -eq 2 || ${#args[@]} -eq 3 ]] || usage
agent=${args[0]} slug=${args[1]} model=${args[2]:-}

[[ -f $BRAIN/log/$agent.md ]] || die "unknown agent '$agent' (no log/$agent.md)"
valid_slug "$slug" || die "bad slug '$slug'"
ticket_dir="$BRAIN/work/$slug"
spec="$ticket_dir/SPEC.md"
[[ -f $spec ]] || die "missing $spec (run new-ticket.sh first)"
if grep -q '^Goal:[[:space:]]*$' "$spec"; then die "SPEC.md has an empty Goal: line"; fi

if [[ -z $model ]]; then
  model=$(sed -n 's/^Model:[[:space:]]*\([A-Za-z0-9._-]*\).*/\1/p' "$spec" | head -n 1)
fi
model=${model:-sonnet}
[[ $model =~ ^[A-Za-z0-9._-]+$ ]] || die "bad model '$model'"

ws="$WORKSPACES/$slug"
if [[ -d $ws && -n $(ls -A "$ws" 2>/dev/null) ]] && ! $resume; then
  die "workspace $ws exists and is not empty (use --resume to reuse it)"
fi
mkdir -p "$ws" "$WORKSPACES/_logs"
log="$WORKSPACES/_logs/$slug.log"

# Prompt: preamble (paths resolved for this box) + SPEC.
preamble=$(cat "$BRAIN/templates/claude-ticket-preamble.md")
preamble=${preamble//'{{TICKET_DIR}}'/$ticket_dir}
preamble=${preamble//'~/repos/bot-brain'/$BRAIN}
prompt="$preamble

--- SPEC ---
$(cat "$spec")"

# Scoped tools: edits in the workspace (auto-accepted) and the ticket dir (--add-dir),
# read-only CHARTER, common dev commands. Override with TICKET_ALLOWED_TOOLS.
default_tools="Read Edit Write Glob Grep WebFetch WebSearch Read(/$BRAIN/CHARTER.md) \
Bash(git *) Bash(gh repo clone *) Bash(gh repo view *) \
Bash(ls) Bash(ls *) Bash(pwd) Bash(cat *) Bash(head *) Bash(tail *) Bash(wc *) Bash(date) Bash(date *) \
Bash(mkdir *) Bash(touch *) Bash(cp *) Bash(mv *) Bash(diff *) Bash(find *) Bash(grep *) Bash(sed *) Bash(echo *) \
Bash(python3 *) Bash(pip install *) Bash(pip3 install *) Bash(uv *) Bash(node *) Bash(npm *) Bash(npx *) Bash(pnpm *) Bash(make *)"
tools=${TICKET_ALLOWED_TOOLS:-$default_tools}

echo "=== $(date '+%Y-%m-%d %H:%M:%S') run-ticket $agent $slug model=$model resume=$resume" >>"$log"

rc=0
out=$(printf '%s\n' "$prompt" | run_claude "$ws" "$model" "$tools" --add-dir "$ticket_dir" 2>>"$log") || rc=$?
printf '%s\n' "$out" >>"$log"

summary=$(printf '%s\n' "$out" | last_line)
status=${summary%%:*}
if [[ $rc -ne 0 ]]; then
  status=blocked
  summary="blocked: claude exited with code $rc, see $log"
else
  case $status in
    done | blocked | question) ;;
    *)
      status=blocked
      summary="blocked: unparseable final line: ${summary:0:150}"
      ;;
  esac
fi
summary=${summary:0:300}
printf '%s\n' "$summary" >"$ticket_dir/SUMMARY.txt"

if ! "$BIN/log-line.sh" "$agent" "$slug" "$status" "$model" >&2; then
  echo "$summary"
  echo "error: bot-brain sync failed; ticket files are local only" >&2
  exit 3
fi
echo "$summary"
