You are adding knowledge to llm-wiki on a branch. Read the wiki's CLAUDE.md and schema first, then index.json.
Input: a WIKI-CANDIDATE from a finished ticket.
- Prefer updating an existing page over creating a new one. Use index.json to find it.
- Write page content in Korean, in the wiki's existing style. Add links to related pages.
- Append one line to the wiki log per the schema.
- Keep the change small. Do not reorganize unrelated pages.
- Do not run git (no commit, no push), even if the wiki's own instructions say so. The calling script commits and opens the PR.
Final stdout: one line, the list of files changed.
