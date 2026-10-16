# bot-brain

The shared notebook and logbook of every agent the owner runs (Claude Code sessions, Grok bots, any MCP client). Agents record what they did and leave handoffs here, so the next session or agent continues from bot-brain instead of the owner pasting context again.

Rules for every agent: [CHARTER.md](CHARTER.md). This repo is not llm-wiki; it holds working memory only.

## How it works

```text
 agent (any MCP client)
   │  MCP over HTTPS, bearer token
   ▼
 Vercel: /mcp  (api/mcp.js → lib/server.mjs)
   ├─ reads ─────────► main      generated views: agents/ log/ work/ index.json  + CHARTER.md
   └─ writes ────────► journal   one immutable JSON event per write: events/YYYY/MM/DD/<id>.json
                         │  repository_dispatch "brain-fold"
                         ▼
                GitHub Action fold.yml  → validate every event → rebuild views → commit to main
```

- **Nobody writes main by hand.** The MCP server only appends new files to the `journal` branch, so concurrent writers never conflict. The fold Action is the only writer of the generated views on main.
- **The fold is deterministic.** It rebuilds the views from the whole journal with [lib/brain.mjs](lib/brain.mjs), so the same events always give the same files. Missed or collapsed triggers lose nothing, because the next run folds everything. Invalid events are skipped and listed in `index.json` under `rejected`.
- **Reads see your own writes.** `brain_bootstrap` also shows journal events the fold has not merged yet, so an agent that wrote a handoff a few seconds ago still sees it.
- **Contract:** [schema/event.schema.json](schema/event.schema.json) documents the event format. `validateEvent` in lib/brain.mjs is the executable version, and both the server and the fold use it.

## Tools

| Tool | What it does |
|---|---|
| `brain_bootstrap(agent, topic?)` | Call first. Returns the CHARTER, your handoff, the topic's handoff and log, recent activity, and unmerged writes. |
| `brain_read(path)` | Read one file from main (CHARTER.md, README.md, index.json, agents/, log/, work/, templates/, schema/). |
| `brain_index()` | The index of agents and topics, plus the 30 latest log entries. |
| `brain_log(agent, topic, status, summary, ref?)` | One session line, at the end of every session. |
| `brain_handoff(agent, body)` | Replace `agents/<agent>/HANDOFF.md`. |
| `brain_note(agent, text, topic?)` | Append a memo to your notes (and the topic's). |
| `brain_write_doc(agent, topic, name, body)` | Create or replace `work/<topic>/<name>.md` (SPEC, PLAN, RESULT, HANDOFF, BUILD, ...). |

## Layout on main

| Path | Written by | What |
|---|---|---|
| `CHARTER.md`, `README.md`, `templates/`, code | owner | Rules and the system itself |
| `agents/<agent>/HANDOFF.md`, `NOTES.md` | fold | One agent's current state and memos |
| `log/<agent>.md` | fold | One agent's session lines, newest first |
| `work/<topic>/*.md` | fold | Docs of one piece of work |
| `work/<topic>/_log.md`, `_notes.md` | fold | Every agent's log lines and notes for that topic |
| `index.json` | fold | Agents, topics, recent activity, `folded_through`, `rejected` |

## Connect an agent

Use the deployment URL plus `/mcp`, and send the token as `Authorization: Bearer <token>`.

Claude Code:

```bash
claude mcp add --transport http --scope user bot-brain https://<deployment>/mcp \
  --header "Authorization: Bearer $BRAIN_TOKEN"
```

Any client that takes a JSON config:

```json
{ "bot-brain": { "type": "http", "url": "https://<deployment>/mcp", "headers": { "Authorization": "Bearer <token>" } } }
```

Then set each agent's built-in memory to the single pointer in the CHARTER: `On wake, call brain_bootstrap(agent=<you>).`

## Deploy (owner, once)

1. GitHub: create a fine-grained token for this repo only, with **Contents: read and write**. That also covers `repository_dispatch`. Do not grant Workflows.
2. Vercel: import this repo (framework preset "Other", no build command; `vercel.json` sets the output to `public/`, so only a placeholder page is served statically and data never ships in a deployment), then set these environment variables:
   - `BRAIN_REPO` = `3jar/Bot-brain`
   - `BRAIN_GITHUB_TOKEN` = the token from step 1
   - `BRAIN_MCP_TOKEN` = a long random string shared by all agents, and/or `BRAIN_TOKENS` = `agent:token,agent2:token2` (a bound token can only write as its agent)
   - optional `BRAIN_TZ` (default `Asia/Seoul`)
   - never `BRAIN_STORE` (local development only)
3. GitHub → Settings → Actions → General → Workflow permissions: **Read and write**. If main gets a ruleset, give GitHub Actions bypass, or the fold cannot push.

`vercel.json` skips deployments of the `journal` branch, and of main commits that touch only data (fold commits).

## Develop

```bash
npm install
npm test                                   # fold contract, server over a local store, GitHub client
mkdir -p /tmp/brain/main && cp CHARTER.md /tmp/brain/main/
BRAIN_STORE=local:/tmp/brain BRAIN_MCP_TOKEN=dev-token-0123456789 npm run dev   # http://localhost:3333/mcp
node scripts/fold.mjs <journal-checkout> <main-checkout>                         # what the Action runs
```

In local mode, `<dir>/main` and `<dir>/journal` stand in for the two branches, and every write is folded immediately.
