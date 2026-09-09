#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const batchArgument = process.argv[2];
if (!batchArgument) throw new Error("Usage: node Scripts/apply-filipino-batch.mjs <batch.json>");
const root = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/filipino");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const batch = JSON.parse(fs.readFileSync(path.resolve(batchArgument), "utf8"));
if (!batch.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
  throw new Error("Batch requires id, kind, and records");
}
const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
if (batch.records.length < minimum || batch.records.length > maximum) {
  throw new Error(`${batch.id} has ${batch.records.length} records; expected ${minimum}-${maximum}`);
}

const files = fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort();
const documents = new Map();
const index = new Map();
for (const name of files) {
  const file = path.join(translationRoot, name);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  documents.set(file, document);
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (index.has(id)) throw new Error(`Duplicate record ${change.Target} :: ${key}`);
      index.set(id, { file, change });
    }
  }
}

const english = new Map();
function source(target, key) {
  if (!english.has(target)) {
    english.set(target, JSON.parse(fs.readFileSync(path.join(englishRoot, `${target}.json`), "utf8")).content);
  }
  return english.get(target)[key];
}

const seen = new Set();
const touched = new Set();
let changed = 0;
for (const record of batch.records) {
  const id = `${record.target}\u0000${record.key}`;
  if (seen.has(id)) throw new Error(`Duplicate batch record ${record.target} :: ${record.key}`);
  seen.add(id);
  const location = index.get(id);
  if (!location) throw new Error(`Unknown record ${record.target} :: ${record.key}`);
  const original = source(record.target, record.key);
  if (original !== record.source) throw new Error(`Source drift ${record.target} :: ${record.key}`);
  if (record.reviewedPreserve && !record.preserveReason) {
    throw new Error(`Preserve requires a reason ${record.target} :: ${record.key}`);
  }
  const result = record.reviewedPreserve ? original : record.translation;
  if (typeof result !== "string" || (!record.reviewedPreserve && !result)) {
    throw new Error(`Missing translation ${record.target} :: ${record.key}`);
  }
  const current = location.change.Entries[record.key];
  if (current !== original && current !== result) {
    throw new Error(`Refusing to overwrite another reviewed value ${record.target} :: ${record.key}`);
  }
  if (current !== result) {
    location.change.Entries[record.key] = result;
    touched.add(location.file);
    changed += 1;
  }
}
for (const file of touched) fs.writeFileSync(file, `${JSON.stringify(documents.get(file), null, 2)}\n`);
console.log(JSON.stringify({ batch: batch.id, records: batch.records.length, changed, files: touched.size }, null, 2));
