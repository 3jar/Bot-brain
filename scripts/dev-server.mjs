#!/usr/bin/env node
// Local MCP server for development: serves the same handler as api/mcp.js on node:http.
//   BRAIN_STORE=local:/tmp/brain BRAIN_MCP_TOKEN=... node scripts/dev-server.mjs
// With BRAIN_STORE=local:<dir>, <dir>/main and <dir>/journal stand in for the two branches.
import { createServer } from "node:http";
import { createBrainHandler } from "../lib/server.mjs";
import { storeFromEnv } from "../lib/store.mjs";

const store = storeFromEnv();
const handler = createBrainHandler({ getStore: () => store });
const port = Number(process.env.PORT || 3333);

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    if (url.pathname !== "/mcp" && url.pathname !== "/api/mcp") return res.writeHead(404).end();
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const response = await handler(new Request(url, { method: req.method, headers, body: hasBody ? Buffer.concat(chunks) : undefined }));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) for await (const chunk of response.body) res.write(chunk);
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
}).listen(port, () => console.log(`bot-brain MCP listening on http://localhost:${port}/mcp`));
