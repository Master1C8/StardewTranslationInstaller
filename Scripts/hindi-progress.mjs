#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const batchRoot = path.join(projectRoot, "Documentation/hindi-batches");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/hindi",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

const current = new Map();
for (const relative of listJSONFiles(translationRoot)) {
  const document = JSON.parse(fs.readFileSync(path.join(translationRoot, relative), "utf8"));
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      current.set(`${change.Target}\u0000${key}`, value);
    }
  }
}

const reviewed = new Map();
const batches = [];
const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    const document = JSON.parse(fs.readFileSync(path.join(englishRoot, `${target}.json`), "utf8"));
    englishCache.set(target, document.content);
  }
  return englishCache.get(target);
}

function expectedTranslation(record) {
  if (record.reviewedPreserve && record.translation === undefined && !Array.isArray(record.replacements)) {
    return englishContent(record.target)?.[record.key];
  }
  if (!Array.isArray(record.replacements)) return record.translation;
  let result = englishContent(record.target)?.[record.key];
  for (const [from, to] of record.replacements) {
    const first = result.indexOf(from);
    if (first < 0 || result.indexOf(from, first + from.length) >= 0) {
      throw new Error(`invalid unique replacement: ${record.target} :: ${record.key} :: ${from}`);
    }
    result = `${result.slice(0, first)}${to}${result.slice(first + from.length)}`;
  }
  return result;
}
for (const relative of listJSONFiles(batchRoot).sort()) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchRoot, relative), "utf8"));
  for (const record of batch.records ?? []) {
    const id = `${record.target}\u0000${record.key}`;
    if (reviewed.has(id)) throw new Error(`record appears in multiple batches: ${id}`);
    if (!current.has(id)) throw new Error(`batch references unknown record: ${id}`);
    if (current.get(id) !== expectedTranslation(record)) throw new Error(`applied value differs from checkpoint: ${id}`);
    reviewed.set(id, record);
  }
  batches.push({ id: batch.id, kind: batch.kind, records: batch.records?.length ?? 0 });
}

const total = current.size;
const completed = reviewed.size;
console.log(JSON.stringify({
  completed,
  total,
  percent: Number((completed * 100 / total).toFixed(3)),
  batches,
}, null, 2));
