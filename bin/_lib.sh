# Shared helpers for bin/*.sh. Source this file; do not run it.
# Compatible with bash 3.2 (macOS) and bash 5 (Linux box).

BRAIN=${BRAIN_DIR:-$HOME/repos/bot-brain}
WIKI=${WIKI_DIR:-$HOME/repos/llm-wiki}
WORKSPACES=${WORKSPACES_DIR:-$HOME/workspaces}
BIN="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

die() { echo "error: $*" >&2; exit 1; }

valid_slug() { [[ $1 =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; }

# Cleanup actions run in reverse order on exit. Scripts use on_exit instead of trap.
_CLEANUP=()
_run_cleanup() {
  local i
  for ((i = ${#_CLEANUP[@]} - 1; i >= 0; i--)); do eval "${_CLEANUP[i]}" || true; done
}
trap _run_cleanup EXIT
on_exit() { _CLEANUP+=("$1"); }

# acquire_lock <lock-dir> <max-wait-seconds> <stale-after-minutes>
# Portable mutex (mkdir is atomic); all agents share one clone per repo on the box.
acquire_lock() {
  local lock=$1 max_wait=$2 stale=$3 waited=0
  until mkdir "$lock" 2>/dev/null; do
    if [[ -n $(find "$lock" -maxdepth 0 -mmin "+$stale" 2>/dev/null) ]]; then
      rm -rf "$lock"
      continue
    fi
    if ((waited >= max_wait)); then die "timed out waiting for lock $lock"; fi
    sleep 1
    waited=$((waited + 1))
  done
  on_exit "rmdir '$lock' 2>/dev/null"
}

# Tools no agent may use, whatever the allow list says.
DENY_TOOLS="Read(~/.config/botenv) Edit(~/.config/botenv) Bash(cat ~/.config/*) Bash(env) Bash(env *) Bash(printenv) Bash(printenv *) Bash(sudo *) Bash(git push --force *) Bash(git push -f *) Bash(git push --force-with-lease *)"

# run_claude <workdir> <model> <allowed-tools> [extra claude args...]
# Reads the prompt from stdin, prints Claude's stdout. Never skips permissions:
# a scoped permission mode plus an explicit allow list; anything else is denied in -p mode.
run_claude() {
  local workdir=$1 model=$2 allowed=$3
  shift 3
  local -a cmd
  cmd=(claude -p
    --model "$model"
    --permission-mode "${CLAUDE_PERMISSION_MODE:-acceptEdits}"
    --allowedTools "$allowed"
    --disallowedTools "$DENY_TOOLS"
    --output-format text)
  local t
  for t in timeout gtimeout; do
    if [[ -n ${CLAUDE_TIMEOUT:-} ]] && command -v "$t" >/dev/null 2>&1; then
      cmd=("$t" "$CLAUDE_TIMEOUT" "${cmd[@]}")
      break
    fi
  done
  (cd "$workdir" && "${cmd[@]}" "$@")
}

# Last non-empty line of stdin, trimmed.
last_line() { awk 'NF { line = $0 } END { sub(/^[ \t]+/, "", line); sub(/[ \t\r]+$/, "", line); print line }'; }
