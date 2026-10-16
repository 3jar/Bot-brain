import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { eventPath, fold, makeEvent, validateEvent } from "../lib/brain.mjs";
import { foldDirs } from "../lib/fold-fs.mjs";

const at = (s) => new Date(`2026-10-17T${s}Z`);
const input = (e) => ({ path: eventPath(e.id), raw: JSON.stringify(e) });

test("makeEvent builds ids that sort by time and match the path", () => {
  const e = makeEvent("claude-macbook", "log", { topic: "bot-brain", status: "done", summary: "built it" }, at("06:48:12.345"));
  assert.match(e.id, /^20261017T064812345Z-claude-macbook-[a-z0-9]{6}$/);
  assert.equal(eventPath(e.id), `events/2026/10/17/${e.id}.json`);
  assert.equal(validateEvent(e), null);
});

test("validateEvent rejects bad fields", () => {
  const good = makeEvent("a", "log", { topic: "t", status: "done", summary: "s" });
  const bad = (patch) => validateEvent({ ...good, ...patch });
  assert.match(bad({ agent: "Bad Name" }), /agent/);
  assert.match(bad({ type: "delete" }), /type/);
  assert.match(bad({ id: good.id.replace(/-a-/, "-b-") }), /id/);
  assert.match(bad({ data: { ...good.data, status: "maybe" } }), /status/);
  assert.match(bad({ data: { ...good.data, summary: "two\nlines" } }), /summary/);
  assert.match(validateEvent({ ...makeEvent("a", "doc", { topic: "t", name: "SPEC.md", body: "x" }), data: { topic: "t", name: "_log.md", body: "x" } }), /name/);
  assert.throws(() => makeEvent("a", "handoff", { body: "" }), /handoff.body/);
});

test("fold renders logs newest first, latest handoff and doc win, topic views", () => {
  const events = [
    makeEvent("grok-home", "log", { topic: "trip", status: "question", summary: "need dates" }, at("01:00:00.000")),
    makeEvent("grok-home", "handoff", { body: "old" }, at("01:00:01.000")),
    makeEvent("claude-macbook", "doc", { topic: "trip", name: "SPEC.md", body: "v1" }, at("01:00:02.000")),
    makeEvent("claude-macbook", "doc", { topic: "trip", name: "SPEC.md", body: "v2" }, at("01:00:03.000")),
    makeEvent("grok-home", "handoff", { body: "new" }, at("01:00:04.000")),
    makeEvent("claude-macbook", "log", { topic: "trip", status: "done", summary: "a | b", ref: "work/trip/SPEC.md" }, at("01:00:05.000")),
    makeEvent("claude-macbook", "note", { topic: "trip", text: "KTX books 30 days ahead" }, at("01:00:06.000")),
  ];
  const { files, index, rejected } = fold(events.map(input));
  assert.deepEqual(rejected, []);
  assert.match(files.get("agents/grok-home/HANDOFF.md"), /updated 2026-10-17 10:00\n.*\n\nnew\n$/s);
  assert.equal(files.get("work/trip/SPEC.md"), "v2\n");
  const topicLog = files.get("work/trip/_log.md").split("\n").filter((l) => l.startsWith("- "));
  assert.deepEqual(topicLog, [
    "- 2026-10-17 10:00 | claude-macbook | trip | done | a \\| b | work/trip/SPEC.md",
    "- 2026-10-17 10:00 | grok-home | trip | question | need dates | -",
  ]);
  assert.match(files.get("agents/claude-macbook/NOTES.md"), /KTX books 30 days ahead/);
  assert.match(files.get("work/trip/_notes.md"), /claude-macbook · trip/);
  assert.equal(index.folded_through, events.at(-1).id);
  assert.deepEqual(index.topics.trip.agents, ["claude-macbook", "grok-home"]);
  assert.equal(index.topics.trip.last_status, "done");
  assert.equal(index.topics.trip.docs["SPEC.md"].by, "claude-macbook");
  assert.equal(index.recent[0].summary, "a | b");
});

test("fold is deterministic and order independent, and rejects junk", () => {
  const events = [1, 2, 3].map((i) => makeEvent("a", "log", { topic: "t", status: "done", summary: `n${i}` }, at(`02:00:0${i}.000`)));
  const inputs = events.map(input);
  const junk = [
    { path: "events/2026/10/17/x.json", raw: "{not json" },
    { path: "events/2026/10/17/moved.json", raw: JSON.stringify(events[0]) },
    inputs[1], // duplicate
  ];
  const a = fold(inputs);
  const b = fold([...junk, ...[...inputs].reverse()]);
  assert.deepEqual([...b.files.keys()].sort(), [...a.files.keys()].sort());
  for (const [k, v] of a.files) if (k !== "index.json") assert.equal(b.files.get(k), v);
  assert.equal(b.rejected.length, 2);
  assert.equal(b.index.events, 3);
});

test("foldDirs writes views, removes stale generated files, leaves other files alone", async () => {
  const root = await mkdtemp(join(tmpdir(), "brain-"));
  const journal = join(root, "journal");
  const main = join(root, "main");
  const e = makeEvent("a", "doc", { topic: "t", name: "PLAN.md", body: "plan" });
  await mkdir(dirname(join(journal, eventPath(e.id))), { recursive: true });
  await writeFile(join(journal, eventPath(e.id)), JSON.stringify(e));
  await mkdir(join(main, "work/stale"), { recursive: true });
  await writeFile(join(main, "work/stale/OLD.md"), "old");
  await writeFile(join(main, "CHARTER.md"), "rules");

  const r1 = await foldDirs(journal, main);
  assert.equal(await readFile(join(main, "work/t/PLAN.md"), "utf8"), "plan\n");
  assert.equal(await readFile(join(main, "CHARTER.md"), "utf8"), "rules");
  assert.deepEqual(await readdir(join(main, "work")), ["t"]);
  assert.equal(r1.removed, 1);
  const r2 = await foldDirs(journal, main);
  assert.equal(r2.written, 0, "second fold is a no-op");
});
