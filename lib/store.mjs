// Storage backends for the MCP server. Same interface, two implementations:
//   GitHubStore  production: reads main, appends events to the journal branch, dispatches the fold
//   LocalStore   development/tests: <dir>/main and <dir>/journal on disk, folds in-process
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { foldDirs } from "./fold-fs.mjs";

const API = "https://api.github.com";

export class GitHubStore {
  constructor({ repo, token, main = "main", journal = "journal", fetchImpl = fetch }) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo ?? "")) throw new Error("BRAIN_REPO must be owner/name");
    if (!token) throw new Error("BRAIN_GITHUB_TOKEN is not set");
    Object.assign(this, { repo, token, main, journal, fetch: fetchImpl });
  }

  async #api(path, { method = "GET", accept = "application/vnd.github+json", body } = {}) {
    return this.fetch(`${API}/repos/${this.repo}${path}`, {
      method,
      headers: {
        Accept: accept,
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "bot-brain-mcp",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static #contents(path, ref) {
    return `/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`;
  }

  async #fail(res, what) {
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    return new Error(`GitHub ${what} failed: ${res.status} ${detail}`);
  }

  // File content from main, or null if it does not exist.
  async readFile(path) {
    const res = await this.#api(GitHubStore.#contents(path, this.main), { accept: "application/vnd.github.raw+json" });
    if (res.status === 404) return null;
    if (!res.ok) throw await this.#fail(res, `read ${path}`);
    return res.text();
  }

  // File names in a journal directory, or [] if it does not exist.
  async listJournal(dir) {
    const res = await this.#api(GitHubStore.#contents(dir, this.journal));
    if (res.status === 404) return [];
    if (!res.ok) throw await this.#fail(res, `list ${dir}`);
    const items = await res.json();
    return Array.isArray(items) ? items.filter((i) => i.type === "file").map((i) => i.name) : [];
  }

  async readJournal(path) {
    const res = await this.#api(GitHubStore.#contents(path, this.journal), { accept: "application/vnd.github.raw+json" });
    if (res.status === 404) return null;
    if (!res.ok) throw await this.#fail(res, `read journal ${path}`);
    return res.text();
  }

  // Create one new file on the journal branch. New unique paths never conflict in content;
  // a 409 only means the branch moved under us, so retry.
  async appendEvent(path, content, message) {
    const body = { message, branch: this.journal, content: Buffer.from(content, "utf8").toString("base64") };
    for (let attempt = 1; ; attempt++) {
      const res = await this.#api(`/contents/${path.split("/").map(encodeURIComponent).join("/")}`, { method: "PUT", body });
      if (res.ok) return;
      if (res.status === 409 && attempt < 5) {
        await new Promise((r) => setTimeout(r, 200 * attempt + Math.random() * 300));
        continue;
      }
      throw await this.#fail(res, `append ${path}`);
    }
  }

  // Ask the fold Action to run. Best effort: the event is already durable, and any later
  // dispatch (or the daily schedule) folds it too.
  async requestFold() {
    const res = await this.#api("/dispatches", { method: "POST", body: { event_type: "brain-fold" } });
    if (!res.ok) throw await this.#fail(res, "dispatch fold");
  }
}

export class LocalStore {
  constructor(dir, { tz, autoFold = false } = {}) {
    Object.assign(this, { dir, tz, autoFold });
  }

  async #read(path) {
    try {
      return await readFile(join(this.dir, path), "utf8");
    } catch (err) {
      if (err.code === "ENOENT") return null;
      throw err;
    }
  }

  readFile(path) {
    return this.#read(join("main", path));
  }

  readJournal(path) {
    return this.#read(join("journal", path));
  }

  async listJournal(dir) {
    try {
      const items = await readdir(join(this.dir, "journal", dir), { withFileTypes: true });
      return items.filter((i) => i.isFile()).map((i) => i.name);
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  async appendEvent(path, content) {
    const full = join(this.dir, "journal", path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content, { flag: "wx" });
  }

  // autoFold mimics the Action; tests leave it off to observe the pending state.
  async requestFold() {
    if (this.autoFold) await this.fold();
  }

  fold() {
    return foldDirs(join(this.dir, "journal"), join(this.dir, "main"), { tz: this.tz });
  }
}

export function storeFromEnv(env = process.env) {
  if (env.BRAIN_STORE?.startsWith("local:")) return new LocalStore(env.BRAIN_STORE.slice("local:".length), { tz: env.BRAIN_TZ, autoFold: true });
  return new GitHubStore({ repo: env.BRAIN_REPO, token: env.BRAIN_GITHUB_TOKEN });
}
