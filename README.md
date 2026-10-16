# bot-brain

Working memory for the Grok Bot orchestration stack: handoffs, session logs, ticket specs and results.
Append-only, written straight to `main`, no PRs. Long-term knowledge for the owner lives in `llm-wiki`, never here.

Rules for every agent: [CHARTER.md](CHARTER.md).

## Layout

| Path | What |
|---|---|
| `agents/<agent>/HANDOFF.md` | Current state of one agent. Overwritten, max one screen. |
| `log/<agent>.md` | One line per session, append-only (format in CHARTER). |
| `work/<slug>/` | One ticket: `SPEC.md`, `RESULT.md`, `SUMMARY.txt`, optional `WIKI-CANDIDATE.md`. |
| `work/_archive/` | Done tickets older than 14 days (`bin/archive.sh`). |
| `templates/` | SPEC, HANDOFF, and the prompts the scripts send to Claude Code. |
| `bin/` | The only way agents run Claude Code. |

## Scripts

All scripts print usage on bad arguments and exit non-zero on failure. Paths come from
`BRAIN_DIR` (default `~/repos/bot-brain`), `WIKI_DIR` (default `~/repos/llm-wiki`) and
`WORKSPACES_DIR` (default `~/workspaces`).

| Script | Output (what a Grok bot reads) |
|---|---|
| `new-ticket.sh <slug>` | Path of the new `work/<slug>/SPEC.md` |
| `run-ticket.sh <agent> <slug> [model] [--resume]` | `<done\|blocked\|question>: <summary>` |
| `wiki-pr.sh <slug>` | PR URL, `no-candidate`, or `no-change` |
| `wiki-merge-batch.sh` | `<number> <decision>` per PR, then a `total=...` line |
| `log-line.sh <agent> <slug> <status> <model>` | nothing (appends to the log and syncs) |
| `git-sync.sh <repo-dir> <message>` | nothing; exit 2 and conflicting paths on conflict |
| `archive.sh [--days N] [--dry-run]` | `archived N: <slugs>` |

Claude Code runs with `claude -p`, a scoped permission mode (`acceptEdits`) and an explicit
allow list per script; permissions are never skipped. Full Claude output goes to
`~/workspaces/_logs/`, outside both repos.

Optional overrides: `CLAUDE_PERMISSION_MODE`, `CLAUDE_TIMEOUT` (seconds, needs `timeout`),
`TICKET_ALLOWED_TOOLS`, `INGEST_ALLOWED_TOOLS`, `CURATOR_ALLOWED_TOOLS`, `WIKI_MODEL`, `CURATOR_MODEL`.

## Ticket flow

```
bin/new-ticket.sh fix-login          # then fill work/fix-login/SPEC.md (max 10 lines)
bin/run-ticket.sh dev fix-login      # -> done: ...
bin/wiki-pr.sh fix-login             # -> PR URL or no-candidate
bin/wiki-merge-batch.sh              # daily, Wiki curator desk
```
