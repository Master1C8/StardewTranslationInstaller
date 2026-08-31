#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const descriptorPath = path.resolve(
  process.argv[2] ?? path.join(projectRoot, "Documentation/arabic-batches/0480-editorial-pass3-tanween-orthography.json"),
);
const translationsRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/arabic",
);
const ledgerPath = path.join(projectRoot, "Documentation/arabic-editorial-overrides.json");
const glossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.ar.json");
const glossaryCorrectionScriptPath = path.join(projectRoot, "Scripts/apply-arabic-glossary-editorial.mjs");
const legacy = /اً/g;

function countLegacy(value) {
  return typeof value === "string" ? (value.match(legacy) ?? []).length : 0;
}

function normalize(value) {
  return value.replaceAll("اً", "ًا").normalize("NFC");
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

const descriptor = JSON.parse(fs.readFileSync(descriptorPath, "utf8"));
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
const glossaryDocument = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const glossary = glossaryDocument.ar;
const correctionScript = fs.readFileSync(glossaryCorrectionScriptPath, "utf8");
const translationUpdates = [];
const normalizedRecordIds = [];
let translationFiles = 0;
let translationRecords = 0;
let translationOccurrences = 0;

for (const filename of fs.readdirSync(translationsRoot).filter((name) => name.endsWith(".json")).sort()) {
  const file = path.join(translationsRoot, filename);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  let fileChanged = false;
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      const occurrences = countLegacy(value);
      if (!occurrences) continue;
      change.Entries[key] = normalize(value);
      normalizedRecordIds.push(`${change.Target}\u0000${key}`);
      translationRecords += 1;
      translationOccurrences += occurrences;
      fileChanged = true;
    }
  }
  if (fileChanged) {
    translationFiles += 1;
    translationUpdates.push({ file, document });
  }
}

let ledgerRecords = 0;
let ledgerOccurrences = 0;
for (const record of Object.values(ledger.records ?? {})) {
  const occurrences = countLegacy(record.translation);
  if (!occurrences) continue;
  record.translation = normalize(record.translation);
  ledgerRecords += 1;
  ledgerOccurrences += occurrences;
}

let glossaryEntries = 0;
let glossaryOccurrences = 0;
for (const entry of Object.values(glossary ?? {})) {
  let entryChanged = false;
  for (const field of ["term", "meaning"]) {
    const occurrences = countLegacy(entry[field]);
    if (!occurrences) continue;
    entry[field] = normalize(entry[field]);
    glossaryOccurrences += occurrences;
    entryChanged = true;
  }
  if (entryChanged) glossaryEntries += 1;
}

const glossaryCorrectionScriptOccurrences = countLegacy(correctionScript);
const actual = {
  translationFiles,
  translationRecords,
  translationOccurrences,
  ledgerRecords,
  ledgerOccurrences,
  glossaryEntries,
  glossaryOccurrences,
  glossaryCorrectionScriptOccurrences,
};
const totalOccurrences = Object.entries(actual)
  .filter(([key]) => key.endsWith("Occurrences"))
  .reduce((sum, [, value]) => sum + value, 0);

if (ledger.batches?.[descriptor.id]) {
  if (totalOccurrences) {
    throw new Error(`Normalization ${descriptor.id} is recorded, but ${totalOccurrences} legacy sequences remain`);
  }
  console.log(JSON.stringify({ id: descriptor.id, alreadyApplied: true, ...actual }, null, 2));
  process.exit(0);
}

for (const [key, expected] of Object.entries(descriptor.expected)) {
  if (actual[key] !== expected) {
    throw new Error(`Unexpected ${key}: found ${actual[key]}, expected ${expected}`);
  }
}
if (new Set(normalizedRecordIds).size !== normalizedRecordIds.length) {
  throw new Error("Arabic translation patches contain duplicate normalized target/key records");
}
if (ledgerRecords !== translationRecords || ledgerOccurrences !== translationOccurrences) {
  throw new Error("Arabic editorial ledger is out of sync with translation patches");
}

for (const update of translationUpdates) writeJson(update.file, update.document);
ledger.batches ??= {};
ledger.batches[descriptor.id] = {
  records: normalizedRecordIds,
  reviewedAt: descriptor.reviewedAt,
  rule: descriptor.rule,
  occurrences: translationOccurrences,
};
writeJson(ledgerPath, ledger);
writeJson(glossaryPath, glossaryDocument);
fs.writeFileSync(glossaryCorrectionScriptPath, normalize(correctionScript));

console.log(JSON.stringify({ id: descriptor.id, alreadyApplied: false, ...actual }, null, 2));
