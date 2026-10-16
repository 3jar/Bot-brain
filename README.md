# bot-brain journal

Append-only event log behind bot-brain. Every `brain_*` write through the MCP server adds one
immutable file here: `events/YYYY/MM/DD/<id>.json` (format: `schema/event.schema.json` on main).
The fold Action on main reads this branch as data and rebuilds main's generated views.

Never edit, rewrite, or force-push this branch. Nothing here is executed.
