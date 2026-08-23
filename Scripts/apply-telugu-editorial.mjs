#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/apply-telugu-editorial.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/telugu",
);
const editorialFile = path.join(projectRoot, "Documentation/telugu-editorial-overrides.json");
const editorial = JSON.parse(fs.readFileSync(editorialFile, "utf8"));
if (
  editorial?.format !== 1
  || typeof editorial.records !== "object"
  || (editorial.preservedRecords !== undefined && !Array.isArray(editorial.preservedRecords))
  || (editorial.preservedTargets !== undefined && !Array.isArray(editorial.preservedTargets))
) {
  throw new Error("invalid Telugu editorial file");
}

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  }).sort();
}

const locations = new Map();
const documents = [];
for (const relative of listJSONFiles(translationRoot)) {
  const file = path.join(translationRoot, relative);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  documents.push({ file, document });
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (locations.has(id)) throw new Error(`duplicate Telugu patch record: ${id}`);
      locations.set(id, { change, key });
    }
  }
}

const sourceCache = new Map();
function englishValue(target, key) {
  if (!sourceCache.has(target)) {
    const file = path.join(sourceRoot, `${target}.json`);
    const content = JSON.parse(fs.readFileSync(file, "utf8")).content;
    sourceCache.set(target, content);
  }
  return sourceCache.get(target)?.[key];
}

let applied = 0;
for (const [id, record] of Object.entries(editorial.records)) {
  const split = id.indexOf("\u0000");
  if (split < 1) throw new Error(`invalid Telugu editorial id: ${JSON.stringify(id)}`);
  const target = id.slice(0, split);
  const key = id.slice(split + 1);
  const original = englishValue(target, key);
  if (typeof original !== "string") throw new Error(`missing English source: ${id}`);
  if (record.english !== original) throw new Error(`stale English source in Telugu editorial record: ${id}`);
  if (typeof record.translation !== "string" || (!record.translation && original)) {
    throw new Error(`invalid Telugu translation: ${id}`);
  }
  const location = locations.get(id);
  if (!location) throw new Error(`missing Telugu patch location: ${id}`);
  location.change.Entries[location.key] = record.translation.normalize("NFC");
  applied += 1;
}

const preservedIds = new Set(editorial.preservedRecords ?? []);
const preservedTargets = new Set(editorial.preservedTargets ?? []);
for (const id of locations.keys()) {
  const split = id.indexOf("\u0000");
  if (preservedTargets.has(id.slice(0, split)) && !editorial.records[id]) preservedIds.add(id);
}

for (const id of preservedIds) {
  if (editorial.records[id]) throw new Error(`duplicate preserved Telugu editorial id: ${id}`);
  const split = id.indexOf("\u0000");
  if (split < 1) throw new Error(`invalid preserved Telugu editorial id: ${JSON.stringify(id)}`);
  const target = id.slice(0, split);
  const key = id.slice(split + 1);
  const original = englishValue(target, key);
  if (typeof original !== "string") throw new Error(`missing English source: ${id}`);
  const location = locations.get(id);
  if (!location) throw new Error(`missing Telugu patch location: ${id}`);
  location.change.Entries[location.key] = original;
  applied += 1;
}

for (const { file, document } of documents) {
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

console.log(`Applied ${applied} reviewed Telugu records to ${documents.length} patch files.`);
