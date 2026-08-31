#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [batchArgument, ...options] = process.argv.slice(2);
const updateReviewed = options.includes("--update-reviewed");
if (!batchArgument) {
  console.error("Usage: node Scripts/apply-thai-batch.mjs <batch.json> [--update-reviewed]");
  process.exit(2);
}
if (options.some((option) => option !== "--update-reviewed")) {
  throw new Error(`Unknown option: ${options.find((option) => option !== "--update-reviewed")}`);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/thai",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const batch = JSON.parse(fs.readFileSync(path.resolve(batchArgument), "utf8"));

if (!batch.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
  throw new Error("Batch requires id, kind (short or long), and records.");
}
const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
const permittedFinalRemainder = batch.finalRemainder === true && batch.records.length > 0 && batch.records.length < minimum;
if ((!permittedFinalRemainder && batch.records.length < minimum) || batch.records.length > maximum) {
  throw new Error(`${batch.kind} batch ${batch.id} has ${batch.records.length} records; expected ${minimum}-${maximum}.`);
}

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

function sortedMatches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}

function count(value, character) {
  return [...value].filter((item) => item === character).length;
}

function markerSignature(value) {
  return {
    contentPatcher: sortedMatches(value, /\{\{[^}]+\}\}/g),
    substitutions: sortedMatches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: sortedMatches(value, /\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: sortedMatches(value, /%[a-z][A-Za-z0-9_]*/g),
    dollar: sortedMatches(value, /\$[A-Za-z0-9]+/g),
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(value, "^"),
    pipe: count(value, "|"),
    slash: count(value, "/"),
    backslash: count(value, "\\"),
    newline: count(value, "\n"),
  };
}

const documents = new Map();
const index = new Map();
for (const relative of listJSONFiles(translationRoot).sort()) {
  const file = path.join(translationRoot, relative);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  documents.set(file, document);
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (index.has(id)) throw new Error(`Duplicate Thai record: ${change.Target} :: ${key}`);
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
  if (!location) throw new Error(`Unknown Thai record: ${record.target} :: ${record.key}`);
  const source = englishContent(record.target)?.[record.key];
  if (record.source !== undefined && source !== record.source) {
    throw new Error(`English source drift for ${record.target} :: ${record.key}`);
  }
  const translation = record.reviewedPreserve ? source : record.translation;
  if (typeof translation !== "string" || (!translation.length && !record.reviewedPreserve)) {
    throw new Error(`Empty translation: ${record.target} :: ${record.key}`);
  }
  if (!record.reviewedPreserve && !/\p{Script=Thai}/u.test(translation)) {
    throw new Error(`Translation has no Thai script: ${record.target} :: ${record.key}`);
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
    if (!updateReviewed) {
      throw new Error(`Refusing to overwrite reviewed translation: ${record.target} :: ${record.key}`);
    }
    if (typeof current !== "string" || !/\p{Script=Thai}/u.test(current)) {
      throw new Error(`Reviewed value is not an existing Thai translation: ${record.target} :: ${record.key}`);
    }
    if (JSON.stringify(markerSignature(source)) !== JSON.stringify(markerSignature(current))) {
      throw new Error(`Reviewed value marker mismatch: ${record.target} :: ${record.key}`);
    }
  }
  location.change.Entries[record.key] = translation;
  touchedFiles.add(location.file);
  changed += 1;
}

for (const file of touchedFiles) {
  fs.writeFileSync(file, `${JSON.stringify(documents.get(file), null, 2)}\n`);
}

console.log(JSON.stringify({ batch: batch.id, kind: batch.kind, records: batch.records.length, changed, alreadyApplied, touchedFiles: touchedFiles.size }, null, 2));
