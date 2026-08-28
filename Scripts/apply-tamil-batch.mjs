#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const batchArgument = process.argv[2];
if (!batchArgument) {
  console.error("Usage: node Scripts/apply-tamil-batch.mjs <batch.json>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/tamil",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const batchPath = path.resolve(batchArgument);
const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));

if (!batch.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
  throw new Error("Batch requires id, kind (short or long), and records.");
}
const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
if (batch.records.length < minimum || batch.records.length > maximum) {
  throw new Error(
    `${batch.kind} batch ${batch.id} has ${batch.records.length} records; expected ${minimum}-${maximum}.`,
  );
}

const files = fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort();
const documents = new Map();
const index = new Map();
for (const fileName of files) {
  const file = path.join(translationRoot, fileName);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  documents.set(file, document);
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (index.has(id)) throw new Error(`Duplicate Tamil record: ${change.Target} :: ${key}`);
      index.set(id, { file, change });
    }
  }
}

const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    const file = path.join(englishRoot, `${target}.json`);
    englishCache.set(target, JSON.parse(fs.readFileSync(file, "utf8")).content);
  }
  return englishCache.get(target);
}

const batchIds = new Set();
const touchedFiles = new Set();
let changed = 0;
let alreadyApplied = 0;
for (const record of batch.records) {
  const id = `${record.target}\u0000${record.key}`;
  if (batchIds.has(id)) throw new Error(`Duplicate batch record: ${record.target} :: ${record.key}`);
  batchIds.add(id);
  const location = index.get(id);
  if (!location) throw new Error(`Unknown Tamil record: ${record.target} :: ${record.key}`);
  const english = englishContent(record.target)?.[record.key];
  const source = record.source ?? english;
  if (english !== source) {
    throw new Error(
      `English source drift for ${record.target} :: ${record.key}: expected ${JSON.stringify(source)}, got ${JSON.stringify(english)}`,
    );
  }
  let translation = record.translation;
  if (Array.isArray(record.replacements)) {
    if (record.source !== undefined || record.translation !== undefined) {
      throw new Error(`Replacement record must omit source and translation: ${record.target} :: ${record.key}`);
    }
    translation = source;
    for (const replacement of record.replacements) {
      if (!Array.isArray(replacement) || replacement.length !== 2) {
        throw new Error(`Invalid replacement pair: ${record.target} :: ${record.key}`);
      }
      const [from, to] = replacement;
      const first = translation.indexOf(from);
      if (first < 0 || translation.indexOf(from, first + from.length) >= 0) {
        throw new Error(`Replacement source must occur exactly once: ${record.target} :: ${record.key} :: ${JSON.stringify(from)}`);
      }
      translation = `${translation.slice(0, first)}${to}${translation.slice(first + from.length)}`;
    }
  }
  if (typeof translation !== "string" || !translation.length) {
    throw new Error(`Empty translation: ${record.target} :: ${record.key}`);
  }
  if (!record.reviewedPreserve && !/\p{Script=Tamil}/u.test(translation)) {
    throw new Error(`Translation has no Tamil script: ${record.target} :: ${record.key}`);
  }
  if (record.reviewedPreserve && translation !== source) {
    throw new Error(`Reviewed preserve differs from source: ${record.target} :: ${record.key}`);
  }
  const current = location.change.Entries[record.key];
  if (current === translation) {
    alreadyApplied += 1;
    continue;
  }
  if (current !== source) {
    throw new Error(`Refusing to overwrite reviewed translation: ${record.target} :: ${record.key}`);
  }
  location.change.Entries[record.key] = translation;
  touchedFiles.add(location.file);
  changed += 1;
}

for (const file of touchedFiles) {
  fs.writeFileSync(file, `${JSON.stringify(documents.get(file), null, 2)}\n`);
}

console.log(
  JSON.stringify(
    {
      batch: batch.id,
      kind: batch.kind,
      records: batch.records.length,
      changed,
      alreadyApplied,
      touchedFiles: touchedFiles.size,
    },
    null,
    2,
  ),
);
