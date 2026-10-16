// Apply the fold to directories on disk: <journal>/events/** in, generated views on <main> out.
import { mkdir, readdir, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fold, GENERATED_ROOTS, INDEX_PATH } from "./brain.mjs";

async function walk(dir) {
  let items;
  try {
    items = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  const out = [];
  for (const item of items) {
    const full = join(dir, item.name);
    if (item.isDirectory()) out.push(...(await walk(full)));
    else if (item.isFile()) out.push(full);
  }
  return out;
}

const posix = (p) => p.split(sep).join("/");

export async function readEvents(journalDir) {
  const paths = (await walk(join(journalDir, "events"))).filter((p) => p.endsWith(".json"));
  return Promise.all(paths.map(async (p) => ({ path: posix(relative(journalDir, p)), raw: await readFile(p, "utf8") })));
}

// Rewrites main so that the generated paths equal fold(journal) exactly: writes changed files,
// deletes generated files that no longer come from any event. Never touches other paths.
export async function foldDirs(journalDir, mainDir, { tz } = {}) {
  const { files, index, rejected } = fold(await readEvents(journalDir), { tz });
  let written = 0;
  let removed = 0;

  for (const root of GENERATED_ROOTS) {
    for (const full of await walk(join(mainDir, root))) {
      if (!files.has(posix(relative(mainDir, full)))) {
        await rm(full);
        removed++;
      }
    }
    await pruneEmptyDirs(join(mainDir, root));
  }

  for (const [path, content] of files) {
    if (!GENERATED_ROOTS.some((r) => path.startsWith(`${r}/`)) && path !== INDEX_PATH) throw new Error(`fold produced a path outside generated roots: ${path}`);
    const full = join(mainDir, path);
    const current = await readFile(full, "utf8").catch(() => null);
    if (current === content) continue;
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content);
    written++;
  }
  return { index, rejected, written, removed };
}

async function pruneEmptyDirs(dir) {
  let items;
  try {
    items = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const item of items) if (item.isDirectory()) await pruneEmptyDirs(join(dir, item.name));
  if ((await readdir(dir)).length === 0) await rmdir(dir);
}
