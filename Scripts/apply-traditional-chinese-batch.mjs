#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const batchArgument = process.argv[2];
if (!batchArgument) {
  console.error("Usage: node Scripts/apply-traditional-chinese-batch.mjs <batch.json>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/traditional-chinese",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const batchPath = path.resolve(batchArgument);
const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));
const editorialDocument = JSON.parse(fs.readFileSync(
  path.join(projectRoot, "Documentation/traditional-chinese-editorial-overrides.json"),
  "utf8",
));
const englishGlossary = JSON.parse(fs.readFileSync(
  path.join(projectRoot, "Documentation/glossary/glossary.en.json"),
  "utf8",
));
const targetGlossary = JSON.parse(fs.readFileSync(
  path.join(projectRoot, "Documentation/glossary/glossary.zh-TW.json"),
  "utf8",
))["zh-TW"];

if (!batch.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
  throw new Error("Batch requires id, kind (short or long), and records.");
}
if (editorialDocument?.format !== 1 || !Array.isArray(editorialDocument.globalReplacements)
  || !Array.isArray(editorialDocument.records)) {
  throw new Error("Invalid Traditional Chinese editorial override document.");
}

const exactGlossaryLabels = new Map();
for (const entry of englishGlossary) {
  const target = targetGlossary?.[entry.id]?.term;
  if (!target) continue;
  const englishTerms = entry.term.split(/\s*\/\s*/);
  const targetTerms = target.split("／");
  if (targetTerms.length === 1) {
    for (const english of englishTerms) exactGlossaryLabels.set(english, targetTerms[0]);
  } else if (targetTerms.length === englishTerms.length) {
    englishTerms.forEach((english, index) => exactGlossaryLabels.set(english, targetTerms[index]));
  }
}
const editorialByRecord = new Map(editorialDocument.records.map((record) => [
  `${record.target}\u0000${record.key}`,
  record.replacements,
]));
const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
if (batch.records.length < minimum || batch.records.length > maximum) {
  throw new Error(`${batch.kind} batch ${batch.id} has ${batch.records.length} records; expected ${minimum}-${maximum}.`);
}

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
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
      if (index.has(id)) throw new Error(`Duplicate Traditional Chinese record: ${change.Target} :: ${key}`);
      index.set(id, { file, change });
    }
  }
}

const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    englishCache.set(
      target,
      JSON.parse(fs.readFileSync(path.join(englishRoot, `${target}.json`), "utf8")).content,
    );
  }
  return englishCache.get(target);
}

function markerSignature(value) {
  const sorted = (expression) => [...value.matchAll(expression)].map((match) => match[0]).sort();
  const count = (character) => [...value].filter((item) => item === character).length;
  return {
    contentPatcher: sorted(/\{\{[^}]+\}\}/g),
    substitutions: sorted(/\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    genderTokens: sorted(/\$\{[^}]+\}\$/g),
    brackets: sorted(/\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: sorted(/%[a-z][A-Za-z0-9_]*/g),
    dollar: sorted(/\$[A-Za-z0-9]+/g),
    typedItems: sorted(/\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sorted(/https?:\/\/[^\s)]+/g),
    at: count("@"), hash: count("#"), caret: count("^"), pipe: count("|"),
    slash: count("/"), backslash: count("\\"), angle: count("<"), newline: count("\n"),
  };
}

function materializeTranslation(record, source) {
  if (typeof record.translation === "string") return record.translation;
  if (!Array.isArray(record.replacements) && !Array.isArray(record.quotedTranslations)) return undefined;
  let translation = source;
  for (const replacement of record.replacements ?? []) {
    if (!Array.isArray(replacement) || ![2, 3].includes(replacement.length)
      || typeof replacement[0] !== "string" || !replacement[0].length
      || typeof replacement[1] !== "string"
      || (replacement[2] !== undefined && (!Number.isInteger(replacement[2]) || replacement[2] < 1))) {
      throw new Error(`Invalid replacement: ${record.target} :: ${record.key}`);
    }
    const [from, to, expectedOccurrences = 1] = replacement;
    const occurrences = translation.split(from).length - 1;
    if (occurrences !== expectedOccurrences) {
      throw new Error(`Replacement source occurs ${occurrences} times: ${record.target} :: ${record.key}: ${from}`);
    }
    translation = translation.split(from).join(to);
  }
  if (record.quotedTranslations !== undefined) {
    if (!Array.isArray(record.quotedTranslations)
      || record.quotedTranslations.some((value) => typeof value !== "string")) {
      throw new Error(`Invalid quoted translations: ${record.target} :: ${record.key}`);
    }
    let quotedIndex = 0;
    translation = translation.replace(/"((?:\\.|[^"\\])*)"/g, (match) => {
      if (quotedIndex >= record.quotedTranslations.length) return match;
      return `"${record.quotedTranslations[quotedIndex++]}"`;
    });
    if (quotedIndex !== record.quotedTranslations.length
      || quotedIndex !== [...source.matchAll(/"((?:\\.|[^"\\])*)"/g)].length) {
      throw new Error(`Quoted translation count mismatch: ${record.target} :: ${record.key}`);
    }
  }
  return translation;
}

function isEarlierReplacementRevision(record, source, current) {
  if (!Array.isArray(record.replacements)) return false;
  let candidate = source;
  for (const [from, to, expectedOccurrences = 1] of record.replacements) {
    if (current.includes(to) && candidate.split(from).length - 1 === 1) {
      candidate = expectedOccurrences === 1 ? candidate.replace(from, to) : candidate.split(from).join(to);
    }
  }
  return candidate === current;
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
  if (!location) throw new Error(`Unknown Traditional Chinese record: ${record.target} :: ${record.key}`);
  const source = englishContent(record.target)?.[record.key];
  if (typeof source !== "string") throw new Error(`Missing English source: ${record.target} :: ${record.key}`);
  if (record.source !== undefined && record.source !== source) {
    throw new Error(`English source drift: ${record.target} :: ${record.key}`);
  }
  let translation = record.reviewedPreserve && record.translation === undefined && record.replacements === undefined
    ? source
    : materializeTranslation(record, source);
  if (typeof translation !== "string" || (!translation.length && !record.reviewedPreserve)) {
    throw new Error(`Empty translation: ${record.target} :: ${record.key}`);
  }
  if (record.reviewedPreserve && translation !== source) {
    throw new Error(`Reviewed preserve differs from source: ${record.target} :: ${record.key}`);
  }
  for (const [from, to] of editorialDocument.globalReplacements) translation = translation.split(from).join(to);
  if (editorialDocument.exactGlossaryLabels) {
    const canonical = exactGlossaryLabels.get(source);
    if (canonical !== undefined) translation = canonical;
  }
  for (const [from, to] of editorialByRecord.get(id) ?? []) {
    const occurrences = translation.split(from).length - 1;
    if (occurrences !== 1) throw new Error(`Editorial replacement source occurs ${occurrences} times: ${record.target} :: ${record.key}: ${from}`);
    translation = translation.replace(from, to);
  }
  if (translation !== source && !/\p{Script=Han}/u.test(translation)) {
    throw new Error(`Translation has no Han script: ${record.target} :: ${record.key}`);
  }
  if (JSON.stringify(markerSignature(source)) !== JSON.stringify(markerSignature(translation))) {
    throw new Error(`Marker mismatch: ${record.target} :: ${record.key}`);
  }
  const current = location.change.Entries[record.key];
  if (current === translation) {
    alreadyApplied += 1;
    continue;
  }
  if (current !== source && !isEarlierReplacementRevision(record, source, current)) {
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
