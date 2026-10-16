# bot-brain-mcp result (2026-10-17)

## What it is

Shared notebook and logbook for every agent the owner runs (Claude Code sessions, Grok bots, other MCP clients). Separate from llm-wiki by owner decision. New sessions learn the system from this repo (README.md, CHARTER.md); the old BUILD.md outside the repo is superseded.

## Architecture

- MCP endpoint https://botbrain-gamma.vercel.app/mcp: Vercel function api/mcp.js -> lib/server.mjs (mcp-handler 2.x, MCP SDK v2). Bearer auth: BRAIN_MCP_TOKEN (shared) and optional BRAIN_TOKENS (agent-bound; a bound token can only write as its agent).
- Reads: GitHub contents API on main.
- Writes: one immutable event file per call on the orphan journal branch (events/YYYY/MM/DD/<id>.json), then repository_dispatch "brain-fold". The server never writes main.
- .github/workflows/fold.yml is the only writer of agents/, log/, work/ and index.json on main. It re-folds the whole journal deterministically with lib/brain.mjs (concurrency group "fold", daily safety run 03:17 KST). Invalid events are skipped and listed in index.json "rejected".
- brain_bootstrap also shows journal events not folded yet (read-your-writes).
- Vercel serves only public/ (vercel.json outputDirectory); .vercelignore keeps data out of deployments; the journal branch and data-only commits do not deploy.

## Tools

brain_bootstrap, brain_read, brain_index, brain_log, brain_handoff, brain_note, brain_write_doc.

## Decisions

- Event journal + fold instead of agents pushing to main: no write conflicts, schema-checked (schema/event.schema.json), full history kept in the journal.
- repository_dispatch instead of a push trigger on journal: push-triggered workflows run the workflow file of the pushed branch, dispatch always runs main's.
- GitHub token: fine-grained, Bot-brain only, Contents read and write, no Workflows permission.
- Removed the earlier git-clone scripts (run-ticket.sh and friends) and the llm-wiki templates.

## Verification

- npm test: 15 tests (fold contract, server over a local store, GitHub client).
- Local: two real Claude Code sessions handed work over through the dev server.
- Live: claude-macbook wrote a doc, a note and a log -> 3 journal events -> fold commits on main, 0 rejected -> a cold session (grok-home) read the state back through brain_bootstrap.
- Owner connected the Grok bots; first external writer seen: skku-icampus-bot (topic skku-canvas-sync).

## Open items

- Optional: per-agent tokens via BRAIN_TOKENS.
- Renew the GitHub token before it expires; brain_* calls fail with 403 when it does.
- Agent naming (<tool>-<role>) is advisory; skku-icampus-bot does not follow it.
