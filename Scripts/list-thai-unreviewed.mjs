#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [targetFilter = "*", offsetArgument = "0", countArgument = "30"] = process.argv.slice(2);
const offset = Number(offsetArgument);
const count = Number(countArgument);
if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(count) || count < 1) {
  throw new Error("offset and count must be non-negative/positive integers");
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const batchRoot = path.join(projectRoot, "Documentation/thai-batches");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/thai",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

const reviewed = new Set();
for (const relative of listJSONFiles(batchRoot).sort()) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchRoot, relative), "utf8"));
  for (const record of batch.records ?? []) reviewed.add(`${record.target}\u0000${record.key}`);
}

const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    const file = path.join(englishRoot, `${target}.json`);
    englishCache.set(target, JSON.parse(fs.readFileSync(file, "utf8")).content);
  }
  return englishCache.get(target);
}

const remaining = [];
for (const relative of listJSONFiles(translationRoot).sort()) {
  const document = JSON.parse(fs.readFileSync(path.join(translationRoot, relative), "utf8"));
  for (const change of document.Changes ?? []) {
    if (targetFilter !== "*" && change.Target !== targetFilter) continue;
    for (const [key, translation] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (reviewed.has(id)) continue;
      remaining.push({
        target: change.Target,
        key,
        source: englishContent(change.Target)?.[key],
        translation,
      });
    }
  }
}

console.log(JSON.stringify({
  target: targetFilter,
  total: remaining.length,
  offset,
  count: Math.min(count, Math.max(0, remaining.length - offset)),
  records: remaining.slice(offset, offset + count),
}, null, 2));
