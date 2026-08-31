#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const batchArgument = process.argv[2];
if (!batchArgument) {
  console.error("Usage: node Scripts/apply-vietnamese-batch.mjs <batch.json>");
  process.exit(2);
}

const root = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  root,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/vietnamese",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const batchPath = path.resolve(batchArgument);
const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));

if (!batch.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
  throw new Error("Batch requires id, kind (short or long), and records.");
}
const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
if (
  (batch.records.length < minimum || batch.records.length > maximum)
  && !batch.complexityReason?.trim()
) {
  throw new Error(
    `${batch.kind} batch ${batch.id} has ${batch.records.length} records; expected ${minimum}-${maximum}.`,
  );
}

function markerSignature(value) {
  const matches = (expression) => [...value.matchAll(expression)].map((match) => match[0]).sort();
  const count = (character) => [...value].filter((item) => item === character).length;
  const withoutGenderBranches = value.replace(/\$\{[^{}]*\^[^{}]*\}\$/g, "");
  return {
    contentPatcher: matches(/\{\{[^}]+\}\}/g),
    substitutions: matches(/\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: matches(/\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: matches(/%[a-z][A-Za-z0-9_]*/g),
    dollar: matches(/\$[A-Za-z0-9]+/g),
    typedItems: matches(/\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: matches(/https?:\/\/[^\s)]+/g),
    genderBranches: [...value.matchAll(/\$\{[^{}]*\^[^{}]*\}\$/g)].length,
    at: count("@"),
    hash: count("#"),
    caret: [...withoutGenderBranches].filter((item) => item === "^").length,
    pipe: count("|"),
    underscore: count("_"),
    backslash: count("\\"),
    newline: count("\n"),
  };
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
      if (index.has(id)) throw new Error(`Duplicate Vietnamese record: ${change.Target} :: ${key}`);
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
  if (!location) throw new Error(`Unknown Vietnamese record: ${record.target} :: ${record.key}`);
  const source = englishContent(record.target)?.[record.key];
  if (source !== record.source) {
    throw new Error(
      `English source drift for ${record.target} :: ${record.key}: expected ${JSON.stringify(record.source)}, got ${JSON.stringify(source)}`,
    );
  }
  const translation = record.translation;
  if (typeof translation !== "string" || (!translation.length && !(record.reviewedPreserve && source === ""))) {
    throw new Error(`Empty translation: ${record.target} :: ${record.key}`);
  }
  if (translation !== translation.normalize("NFC")) {
    throw new Error(`Translation is not NFC: ${record.target} :: ${record.key}`);
  }
  if (record.reviewedPreserve) {
    if (translation !== source || !record.reason?.trim()) {
      throw new Error(`Invalid reviewed preserve: ${record.target} :: ${record.key}`);
    }
  } else if (translation === source) {
    throw new Error(`Source-identical translation must be an explicit reviewed preserve: ${record.target} :: ${record.key}`);
  }
  if (JSON.stringify(markerSignature(source)) !== JSON.stringify(markerSignature(translation))) {
    throw new Error(`Marker mismatch: ${record.target} :: ${record.key}`);
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

console.log(JSON.stringify({
  batch: batch.id,
  kind: batch.kind,
  records: batch.records.length,
  changed,
  alreadyApplied,
  touchedFiles: touchedFiles.size,
}, null, 2));
