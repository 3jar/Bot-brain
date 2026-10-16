import assert from "node:assert/strict";
import { test } from "node:test";
import { GitHubStore } from "../lib/store.mjs";

function fakeFetch(responses) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, ...init, body: init.body ? JSON.parse(init.body) : undefined });
    const r = responses.shift() ?? { status: 200, body: "" };
    const body = r.status === 204 ? null : typeof r.body === "string" ? r.body : JSON.stringify(r.body);
    return new Response(body, { status: r.status });
  };
  return { fn, calls };
}

const make = (responses) => {
  const f = fakeFetch(responses);
  return { store: new GitHubStore({ repo: "3jar/Bot-brain", token: "t0ken", fetchImpl: f.fn }), calls: f.calls };
};

test("reads main as raw content and maps 404 to null", async () => {
  const { store, calls } = make([{ status: 200, body: "# CHARTER" }, { status: 404, body: "" }]);
  assert.equal(await store.readFile("CHARTER.md"), "# CHARTER");
  assert.equal(await store.readFile("work/a b/X.md"), null);
  assert.equal(calls[0].url, "https://api.github.com/repos/3jar/Bot-brain/contents/CHARTER.md?ref=main");
  assert.equal(calls[0].headers.Accept, "application/vnd.github.raw+json");
  assert.equal(calls[0].headers.Authorization, "Bearer t0ken");
  assert.equal(calls[1].url, "https://api.github.com/repos/3jar/Bot-brain/contents/work/a%20b/X.md?ref=main");
});

test("lists journal directories on the journal branch", async () => {
  const { store, calls } = make([{ status: 200, body: [{ type: "file", name: "a.json" }, { type: "dir", name: "x" }] }, { status: 404, body: "" }]);
  assert.deepEqual(await store.listJournal("events/2026/10/17"), ["a.json"]);
  assert.deepEqual(await store.listJournal("events/2026/10/18"), []);
  assert.match(calls[0].url, /\/contents\/events\/2026\/10\/17\?ref=journal$/);
});

test("appends an event to the journal, retrying when the branch moved", async () => {
  const { store, calls } = make([{ status: 409, body: "conflict" }, { status: 201, body: {} }]);
  await store.appendEvent("events/2026/10/17/x.json", '{"v":1}', "log(a): t done");
  assert.equal(calls.length, 2);
  assert.equal(calls[1].method, "PUT");
  assert.equal(calls[1].body.branch, "journal");
  assert.equal(Buffer.from(calls[1].body.content, "base64").toString(), '{"v":1}');
});

test("fails loudly on other errors and dispatches the fold", async () => {
  const { store, calls } = make([{ status: 403, body: "nope" }, { status: 204, body: "" }]);
  await assert.rejects(store.appendEvent("events/x.json", "{}", "m"), /append events\/x.json failed: 403 nope/);
  await store.requestFold();
  assert.equal(calls[1].url, "https://api.github.com/repos/3jar/Bot-brain/dispatches");
  assert.deepEqual(calls[1].body, { event_type: "brain-fold" });
});

test("refuses to start without repo or token", () => {
  assert.throws(() => new GitHubStore({ repo: "bad", token: "x" }), /BRAIN_REPO/);
  assert.throws(() => new GitHubStore({ repo: "a/b" }), /BRAIN_GITHUB_TOKEN/);
});
