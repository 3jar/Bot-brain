# bot-brain-mcp handoff
Active: bot-brain-mcp
State: MCP server live at https://botbrain-gamma.vercel.app/mcp. Writes go to the journal branch; the fold Action rebuilds views on main. Static files are not exposed (only public/). Registered in Claude Code on the MacBook (user scope).
Next step: connect the other agents (Grok bots) and set each one's built-in memory to "On wake, call brain_bootstrap(agent=<you>)."
Blocked on: whether Grok Bot supports remote MCP over HTTP with a bearer header.
Pointers: README.md, CHARTER.md, schema/event.schema.json
