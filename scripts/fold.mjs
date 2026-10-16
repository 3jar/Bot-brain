#!/usr/bin/env node
// node scripts/fold.mjs <journal-dir> <main-dir>
// Merge every event on the journal checkout into the generated views of the main checkout.
// Run by .github/workflows/fold.yml. Reads journal files as data only; never executes them.
import { foldDirs } from "../lib/fold-fs.mjs";

const [journalDir, mainDir] = process.argv.slice(2);
if (!journalDir || !mainDir) {
  console.error("usage: node scripts/fold.mjs <journal-dir> <main-dir>");
  process.exit(1);
}

const { index, rejected, written, removed } = await foldDirs(journalDir, mainDir, { tz: process.env.BRAIN_TZ || undefined });
for (const r of rejected) console.warn(`rejected ${r}`);
console.log(`folded ${index.events} events through ${index.folded_through ?? "-"}: ${written} written, ${removed} removed, ${rejected.length} rejected`);
