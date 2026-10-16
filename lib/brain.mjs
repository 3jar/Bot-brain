// Core of bot-brain: the event contract and the deterministic fold from events to views.
// Pure functions, no dependencies. Used by the MCP server (api/mcp.js) to build events
// and by the fold Action (scripts/fold.mjs) to merge them into main.

export const SCHEMA_VERSION = 1;
export const TYPES = ["log", "handoff", "note", "doc"];
export const STATUSES = ["done", "blocked", "question", "cancelled"];
export const LIMITS = { summary: 300, ref: 300, handoff: 4000, note: 4000, doc: 200000 };

// Paths the fold owns on main. Everything under them is regenerated from the journal.
export const GENERATED_ROOTS = ["agents", "log", "work"];
export const INDEX_PATH = "index.json";
export const RECENT_LIMIT = 30;

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DOC_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}\.md$/;
const ID = /^(\d{8}T\d{9}Z)-([a-z0-9-]+)-([a-z0-9]{6})$/;

export function isSlug(s, max = 60) {
  return typeof s === "string" && s.length <= max && SLUG.test(s);
}

// 2026-10-17T06:48:12.345Z -> 20261017T064812345Z (sorts chronologically as a string)
function compactTs(iso) {
  return iso.replace(/[-:.]/g, "");
}

export function newEventId(agent, date = new Date(), rand = Math.random) {
  const suffix = Array.from({ length: 6 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(rand() * 36)]).join("");
  return `${compactTs(date.toISOString())}-${agent}-${suffix}`;
}

// events/YYYY/MM/DD/<id>.json on the journal branch.
export function eventPath(id) {
  return `events/${id.slice(0, 4)}/${id.slice(4, 6)}/${id.slice(6, 8)}/${id}.json`;
}

export function makeEvent(agent, type, data, date = new Date()) {
  const event = { v: SCHEMA_VERSION, id: newEventId(agent, date), ts: date.toISOString(), agent, type, data };
  const err = validateEvent(event);
  if (err) throw new Error(err);
  return event;
}

function oneLine(s, max) {
  return typeof s === "string" && s.trim().length > 0 && s.length <= max && !/[\r\n]/.test(s);
}

function text(s, max) {
  return typeof s === "string" && s.trim().length > 0 && s.length <= max;
}

// Returns null when valid, otherwise a short reason. The single source of truth for the contract
// in schema/event.schema.json.
export function validateEvent(e) {
  if (!e || typeof e !== "object" || Array.isArray(e)) return "event must be an object";
  if (e.v !== SCHEMA_VERSION) return `v must be ${SCHEMA_VERSION}`;
  if (!isSlug(e.agent, 40)) return "agent must be a lowercase slug (max 40)";
  if (typeof e.ts !== "string" || Number.isNaN(Date.parse(e.ts)) || new Date(e.ts).toISOString() !== e.ts)
    return "ts must be an ISO-8601 UTC timestamp";
  const m = typeof e.id === "string" && e.id.match(ID);
  if (!m || m[1] !== compactTs(e.ts) || m[2] !== e.agent) return "id must be <compact ts>-<agent>-<6 chars>";
  if (!TYPES.includes(e.type)) return `type must be one of ${TYPES.join("|")}`;
  const d = e.data;
  if (!d || typeof d !== "object" || Array.isArray(d)) return "data must be an object";
  switch (e.type) {
    case "log":
      if (!isSlug(d.topic)) return "log.topic must be a lowercase slug (max 60)";
      if (!STATUSES.includes(d.status)) return `log.status must be one of ${STATUSES.join("|")}`;
      if (!oneLine(d.summary, LIMITS.summary)) return `log.summary must be one line, max ${LIMITS.summary}`;
      if (d.ref !== undefined && !oneLine(d.ref, LIMITS.ref)) return `log.ref must be one line, max ${LIMITS.ref}`;
      break;
    case "handoff":
      if (!text(d.body, LIMITS.handoff)) return `handoff.body must be non-empty, max ${LIMITS.handoff}`;
      break;
    case "note":
      if (d.topic !== undefined && !isSlug(d.topic)) return "note.topic must be a lowercase slug (max 60)";
      if (!text(d.text, LIMITS.note)) return `note.text must be non-empty, max ${LIMITS.note}`;
      break;
    case "doc":
      if (!isSlug(d.topic)) return "doc.topic must be a lowercase slug (max 60)";
      if (typeof d.name !== "string" || !DOC_NAME.test(d.name)) return "doc.name must look like NAME.md (letters, digits, . _ -)";
      if (!text(d.body, LIMITS.doc)) return `doc.body must be non-empty, max ${LIMITS.doc}`;
      break;
  }
  return null;
}

// "2026-10-17 15:48" in the given time zone.
export function formatTime(iso, tz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

const cell = (s) => String(s).replace(/\|/g, "\\|");

// CHARTER session log format: YYYY-MM-DD HH:MM | agent | topic | status | summary | ref
export function logLine(e, tz) {
  const d = e.data;
  return `- ${formatTime(e.ts, tz)} | ${e.agent} | ${d.topic} | ${d.status} | ${cell(d.summary)} | ${d.ref ? cell(d.ref) : "-"}`;
}

const GENERATED = "<!-- Generated by the fold Action from the journal branch. Do not edit; write with the brain_* MCP tools. -->";

function noteBlock(e, tz) {
  const head = `## ${formatTime(e.ts, tz)} · ${e.agent}${e.data.topic ? ` · ${e.data.topic}` : ""}`;
  return `${head}\n\n${e.data.text.trim()}\n`;
}

function sortedObject(entries) {
  return Object.fromEntries([...entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/**
 * Fold journal events into the files that live on main.
 * @param {{path: string, raw: string}[]} inputs  journal files (path relative to the journal root)
 * @param {{tz?: string}} opts
 * @returns {{files: Map<string, string>, index: object, rejected: string[]}}
 *   Deterministic: the same events always produce byte-identical files.
 */
export function fold(inputs, { tz = "Asia/Seoul" } = {}) {
  const rejected = [];
  const byId = new Map();
  for (const { path, raw } of inputs) {
    let e;
    try {
      e = JSON.parse(raw);
    } catch {
      rejected.push(`${path}: invalid JSON`);
      continue;
    }
    const err = validateEvent(e) ?? (path !== eventPath(e.id) ? `path does not match id ${e.id}` : null);
    if (err) {
      rejected.push(`${path}: ${err}`);
      continue;
    }
    if (!byId.has(e.id)) byId.set(e.id, e);
  }
  rejected.sort();
  const events = [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : 1)); // oldest first

  const agents = new Map(); // name -> {logs: [], notes: [], handoff, lastSeen}
  const topics = new Map(); // topic -> {logs: [], notes: [], docs: Map(name -> event)}
  const agent = (n) => agents.get(n) ?? agents.set(n, { logs: [], notes: [], handoff: null, lastSeen: null }).get(n);
  const topic = (t) => topics.get(t) ?? topics.set(t, { logs: [], notes: [], docs: new Map() }).get(t);

  for (const e of events) {
    const a = agent(e.agent);
    a.lastSeen = e.ts;
    if (e.type === "log") {
      a.logs.push(e);
      topic(e.data.topic).logs.push(e);
    } else if (e.type === "handoff") {
      a.handoff = e;
    } else if (e.type === "note") {
      a.notes.push(e);
      if (e.data.topic) topic(e.data.topic).notes.push(e);
    } else if (e.type === "doc") {
      topic(e.data.topic).docs.set(e.data.name, e);
    }
  }

  const files = new Map();
  const newestFirst = (list) => [...list].reverse();
  const tzNote = `Times are ${tz}. Newest first.`;

  for (const [name, a] of agents) {
    if (a.handoff) {
      files.set(`agents/${name}/HANDOFF.md`, `# ${name} handoff — updated ${formatTime(a.handoff.ts, tz)}\n${GENERATED}\n\n${a.handoff.data.body.trim()}\n`);
    }
    if (a.notes.length) {
      files.set(`agents/${name}/NOTES.md`, `# ${name} notes\n${GENERATED}\n${tzNote}\n\n${newestFirst(a.notes).map((e) => noteBlock(e, tz)).join("\n")}`);
    }
    if (a.logs.length) {
      files.set(`log/${name}.md`, `# ${name} session log\n${GENERATED}\n${tzNote}\n\n${newestFirst(a.logs).map((e) => logLine(e, tz)).join("\n")}\n`);
    }
  }
  for (const [name, t] of topics) {
    for (const [doc, e] of t.docs) files.set(`work/${name}/${doc}`, e.data.body.endsWith("\n") ? e.data.body : `${e.data.body}\n`);
    if (t.logs.length) {
      files.set(`work/${name}/_log.md`, `# ${name} log (all agents)\n${GENERATED}\n${tzNote}\n\n${newestFirst(t.logs).map((e) => logLine(e, tz)).join("\n")}\n`);
    }
    if (t.notes.length) {
      files.set(`work/${name}/_notes.md`, `# ${name} notes (all agents)\n${GENERATED}\n${tzNote}\n\n${newestFirst(t.notes).map((e) => noteBlock(e, tz)).join("\n")}`);
    }
  }

  const logSummary = (e) => ({ ts: e.ts, agent: e.agent, topic: e.data.topic, status: e.data.status, summary: e.data.summary, ...(e.data.ref ? { ref: e.data.ref } : {}) });
  const allLogs = events.filter((e) => e.type === "log");
  const index = {
    v: SCHEMA_VERSION,
    timezone: tz,
    folded_through: events.length ? events[events.length - 1].id : null,
    events: events.length,
    rejected,
    agents: sortedObject(
      [...agents].map(([name, a]) => [
        name,
        {
          last_seen: a.lastSeen,
          handoff_updated: a.handoff ? a.handoff.ts : null,
          logs: a.logs.length,
          notes: a.notes.length,
          last_log: a.logs.length ? logSummary(a.logs[a.logs.length - 1]) : null,
        },
      ]),
    ),
    topics: sortedObject(
      [...topics].map(([name, t]) => {
        const stamps = [...t.logs, ...t.notes, ...t.docs.values()].map((e) => e.ts).sort();
        return [
          name,
          {
            updated: stamps[stamps.length - 1],
            agents: [...new Set([...t.logs, ...t.notes, ...t.docs.values()].map((e) => e.agent))].sort(),
            last_status: t.logs.length ? t.logs[t.logs.length - 1].data.status : null,
            docs: sortedObject([...t.docs].map(([doc, e]) => [doc, { updated: e.ts, by: e.agent }])),
          },
        ];
      }),
    ),
    recent: newestFirst(allLogs).slice(0, RECENT_LIMIT).map(logSummary),
  };
  files.set(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);
  return { files, index, rejected };
}

// One-line description of an event, used for "pending" overlays and tool replies.
export function describeEvent(e, tz = "Asia/Seoul") {
  const when = formatTime(e.ts, tz);
  switch (e.type) {
    case "log":
      return `${when} ${e.agent} log ${e.data.topic} ${e.data.status}: ${e.data.summary}`;
    case "handoff":
      return `${when} ${e.agent} handoff updated`;
    case "note":
      return `${when} ${e.agent} note${e.data.topic ? ` (${e.data.topic})` : ""}: ${e.data.text.split("\n")[0].slice(0, 120)}`;
    case "doc":
      return `${when} ${e.agent} doc work/${e.data.topic}/${e.data.name}`;
  }
  return `${when} ${e.agent} ${e.type}`;
}
