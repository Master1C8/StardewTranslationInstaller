#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { decodeThai, mapsFromDocument, readClusterDocument } from "./thai-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/thai");
const batchRoot = path.join(projectRoot, "Documentation/thai-batches");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const errors = [];
const warnings = [];
const clusterMapFile = path.join(projectRoot, "Documentation/thai-cluster-map.json");
const clusterDecode = fs.existsSync(clusterMapFile)
  ? mapsFromDocument(readClusterDocument(clusterMapFile)).decode
  : new Map();

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
    percentSign: count(value, "%"),
    dollar: sortedMatches(value, /\$[A-Za-z0-9]+/g),
    dollarSign: count(value, "$"),
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(value, "^"),
    pipe: count(value, "|"),
    slash: count(value, "/"),
    backslash: count(value, "\\"),
    angleLeft: count(value, "<"),
    angleRight: count(value, ">"),
    newline: count(value, "\n"),
  };
}

const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    const file = path.join(englishRoot, `${target}.json`);
    if (!fs.existsSync(file)) {
      errors.push(`missing English asset: ${target}`);
      englishCache.set(target, {});
    } else {
      englishCache.set(target, JSON.parse(fs.readFileSync(file, "utf8")).content);
    }
  }
  return englishCache.get(target);
}

const records = new Map();
const translationFiles = listJSONFiles(translationRoot).sort();
for (const relative of translationFiles) {
  const file = path.join(translationRoot, relative);
  let document;
  try {
    document = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`invalid JSON: ${relative}: ${error.message}`);
    continue;
  }
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${relative}`);
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) {
    errors.push(`missing Changes: ${relative}`);
    continue;
  }
  for (const change of document.Changes) {
    if (change.Action !== "EditData" || typeof change.Target !== "string" || !change.Entries) {
      errors.push(`invalid change: ${relative}`);
      continue;
    }
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "th-vnrevival" })) {
      errors.push(`invalid language gate: ${relative}: ${change.Target}`);
    }
    for (const [key, value] of Object.entries(change.Entries)) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${change.Target} :: ${key}`);
      for (const character of value) {
        const codepoint = character.codePointAt(0);
        if (codepoint >= 0xE000 && codepoint <= 0xF8FF && !clusterDecode.has(character)) {
          errors.push(`unknown Thai cluster glyph: ${change.Target} :: ${key}: U+${codepoint.toString(16)}`);
        }
      }
      records.set(id, { target: change.Target, key, value: decodeThai(value, clusterDecode), relative });
    }
  }
}

const reviewed = new Map();
const batchFiles = listJSONFiles(batchRoot).sort();
for (const relative of batchFiles) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchRoot, relative), "utf8"));
  if (!batch.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
    errors.push(`invalid batch document: ${relative}`);
    continue;
  }
  const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
  const permittedFinalRemainder = batch.finalRemainder === true && batch.records.length > 0 && batch.records.length < minimum;
  if ((!permittedFinalRemainder && batch.records.length < minimum) || batch.records.length > maximum) {
    errors.push(`invalid batch size: ${relative}: ${batch.records.length}`);
  }
  for (const record of batch.records) {
    const id = `${record.target}\u0000${record.key}`;
    if (reviewed.has(id)) errors.push(`record reviewed more than once: ${record.target} :: ${record.key}`);
    reviewed.set(id, { ...record, batch: batch.id });
  }
}

for (const [id, record] of records) {
  const source = englishContent(record.target)?.[record.key];
  if (typeof source !== "string") {
    errors.push(`missing English source: ${record.target} :: ${record.key}`);
    continue;
  }
  const review = reviewed.get(id);
  if (!review) {
    if (record.value !== source) errors.push(`untracked translation: ${record.target} :: ${record.key}`);
    continue;
  }
  const expected = review.reviewedPreserve ? source : review.translation;
  if (review.source !== undefined && review.source !== source) errors.push(`source drift: ${record.target} :: ${record.key}`);
  if (record.value !== expected) errors.push(`reviewed value not applied: ${record.target} :: ${record.key}`);
  if (JSON.stringify(markerSignature(source)) !== JSON.stringify(markerSignature(record.value))) {
    errors.push(`marker mismatch: ${record.target} :: ${record.key}`);
  }
  if (!review.reviewedPreserve && !/\p{Script=Thai}/u.test(record.value)) errors.push(`reviewed value has no Thai: ${record.target} :: ${record.key}`);
  const proseOnly = record.value
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\$[A-Za-z0-9]+|%[a-z][A-Za-z0-9_]*/g, "");
  if (!review.reviewedPreserve && !review.reviewedEnglishResidue && /\b(?:the|and|with|from|for|your|you|this|that|fish|farm|festival|bundle)\b/i.test(proseOnly)) {
    warnings.push(`possible English residue: ${record.target} :: ${record.key}`);
  }
}

for (const [id, review] of reviewed) {
  if (!records.has(id)) errors.push(`reviewed record missing from patches: ${review.target} :: ${review.key}`);
}

const englishGlossary = JSON.parse(fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.en.json"), "utf8"));
const thaiGlossary = JSON.parse(fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.th.json"), "utf8")).th;
if (englishGlossary.length !== 673 || Object.keys(thaiGlossary).length !== 673) errors.push("invalid glossary count");
if (JSON.stringify(englishGlossary.map((entry) => entry.id)) !== JSON.stringify(Object.keys(thaiGlossary))) errors.push("glossary ID/order mismatch");

if (translationFiles.length !== 151) errors.push(`translation files ${translationFiles.length}, expected 151`);
if (records.size !== 14720) errors.push(`translation records ${records.size}, expected 14720`);
if (englishCache.size !== 187) errors.push(`English targets ${englishCache.size}, expected 187`);

const progress = Number(((reviewed.size / 14720) * 100).toFixed(3));
console.log(JSON.stringify({
  translationFiles: translationFiles.length,
  targets: englishCache.size,
  totalRecords: records.size,
  batchFiles: batchFiles.length,
  reviewedRecords: reviewed.size,
  remainingRecords: records.size - reviewed.size,
  projectProgressPercent: progress,
  glossaryEntries: Object.keys(thaiGlossary).length,
  errors: errors.length,
  warnings: warnings.length,
  details: [...errors, ...warnings],
}, null, 2));
if (errors.length || warnings.length) process.exit(1);
