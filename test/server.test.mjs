import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createBrainHandler } from "../lib/server.mjs";
import { LocalStore } from "../lib/store.mjs";

const SHARED = "shared-token-0123456789";
const BOUND = "grok-home-token-0123456789";

async function setup() {
  const dir = await mkdtemp(join(tmpdir(), "brain-mcp-"));
  await mkdir(join(dir, "main"), { recursive: true });
  await writeFile(join(dir, "main/CHARTER.md"), "# CHARTER\nbe terse\n");
  const store = new LocalStore(dir);
  const handler = createBrainHandler({ getStore: () => store, env: { BRAIN_MCP_TOKEN: SHARED, BRAIN_TOKENS: `grok-home:${BOUND}` } });
  let id = 0;
  async function rpc(method, params, token = SHARED) {
    const res = await handler(
      new Request("http://localhost/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          "mcp-protocol-version": "2025-06-18",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
      }),
    );
    const text = await res.text();
    if (res.status !== 200) return { status: res.status, text };
    const json = text.trimStart().startsWith("{") ? JSON.parse(text) : JSON.parse(text.split("\n").find((l) => l.startsWith("data:")).slice(5));
    return { status: 200, json };
  }
  const call = async (name, args, token) => {
    const r = await rpc("tools/call", { name, arguments: args }, token);
    assert.equal(r.status, 200, r.text);
    assert.ok(r.json.result, JSON.stringify(r.json));
    return { text: r.json.result.content.map((c) => c.text).join(""), isError: !!r.json.result.isError };
  };
  await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } });
  return { dir, store, rpc, call };
}

test("rejects requests without a valid token", async () => {
  const { rpc } = await setup();
  assert.equal((await rpc("tools/list", {}, null)).status, 401);
  assert.equal((await rpc("tools/list", {}, "wrong-token-0123456789")).status, 401);
});

test("lists the brain_* tools", async () => {
  const { rpc } = await setup();
  const r = await rpc("tools/list", {});
  const names = r.json.result.tools.map((t) => t.name).sort();
  assert.deepEqual(names, ["brain_bootstrap", "brain_handoff", "brain_index", "brain_log", "brain_note", "brain_read", "brain_write_doc"]);
});

test("writes go to the journal only; bootstrap shows them as pending, then folded", async () => {
  const { dir, store, call } = await setup();
  const w1 = await call("brain_write_doc", { agent: "claude-macbook", topic: "trip", name: "HANDOFF.md", body: "book KTX next" });
  assert.equal(w1.isError, false, w1.text);
  await call("brain_log", { agent: "claude-macbook", topic: "trip", status: "done", summary: "drafted plan" });
  await call("brain_handoff", { agent: "claude-macbook", body: "Active: trip" });
  await call("brain_note", { agent: "claude-macbook", topic: "trip", text: "KTX sells out on Fridays" });

  assert.deepEqual(await readdir(join(dir, "main")), ["CHARTER.md"], "main untouched before fold");
  let boot = await call("brain_bootstrap", { agent: "claude-macbook", topic: "trip" });
  assert.match(boot.text, /be terse/);
  assert.match(boot.text, /not merged yet[\s\S]*Active: trip/);
  assert.match(boot.text, /### HANDOFF.md\n\nbook KTX next/);
  assert.match(boot.text, /Written but not merged into main yet[\s\S]*log trip done: drafted plan/);

  await store.fold();
  boot = await call("brain_bootstrap", { agent: "claude-macbook", topic: "trip" });
  assert.doesNotMatch(boot.text, /not merged/);
  assert.match(boot.text, /# claude-macbook handoff — updated .*\n[\s\S]*Active: trip/);
  assert.match(boot.text, /\| claude-macbook \| trip \| done \| drafted plan \| -/);
  assert.match(boot.text, /### Notes \(newest 5\)\n\n## .* · claude-macbook · trip\n\nKTX sells out on Fridays/);
  assert.equal((await call("brain_read", { path: "work/trip/HANDOFF.md" })).text, "book KTX next\n");
});

test("validation errors and path rules come back as tool errors", async () => {
  const { call } = await setup();
  assert.match((await call("brain_log", { agent: "Claude", topic: "t", status: "done", summary: "x" })).text, /agent/);
  assert.match((await call("brain_write_doc", { agent: "a", topic: "t", name: "../x.md", body: "x" })).text, /name/);
  const r = await call("brain_read", { path: "../.env" });
  assert.equal(r.isError, true);
  assert.equal((await call("brain_read", { path: "api/mcp.js" })).isError, true);
});

test("a bound token can only act as its agent", async () => {
  const { call } = await setup();
  const r = await call("brain_note", { agent: "claude-macbook", text: "spoof" }, BOUND);
  assert.equal(r.isError, true);
  assert.match(r.text, /bound to agent 'grok-home'/);
  const ok = await call("brain_note", { text: "real" }, BOUND);
  assert.match(ok.text, /Saved note \d{8}T\d{9}Z-grok-home-/);
});
