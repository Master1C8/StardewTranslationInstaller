#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { decodeThai, mapsFromDocument, readClusterDocument } from "./thai-clusters.mjs";

const batchArgument = process.argv[2];
if (!batchArgument) {
  console.error("Usage: node Scripts/audit-thai-batch.mjs <batch.json>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/thai");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const batch = JSON.parse(fs.readFileSync(path.resolve(batchArgument), "utf8"));
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

const records = new Map();
for (const relative of listJSONFiles(translationRoot).sort()) {
  const file = path.join(translationRoot, relative);
  let document;
  try {
    document = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`invalid JSON: ${relative}: ${error.message}`);
    continue;
  }
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${relative}`);
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) errors.push(`missing Changes: ${relative}`);
  for (const change of document.Changes ?? []) {
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "th-vnrevival" })) {
      errors.push(`invalid language gate: ${relative}: ${change.Target}`);
    }
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${change.Target} :: ${key}`);
      for (const character of value) {
        const codepoint = character.codePointAt(0);
        if (codepoint >= 0xE000 && codepoint <= 0xF8FF && !clusterDecode.has(character)) {
          errors.push(`unknown Thai cluster glyph: ${change.Target} :: ${key}: U+${codepoint.toString(16)}`);
        }
      }
      records.set(id, decodeThai(value, clusterDecode));
    }
  }
}

const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    englishCache.set(target, JSON.parse(fs.readFileSync(path.join(englishRoot, `${target}.json`), "utf8")).content);
  }
  return englishCache.get(target);
}

for (const record of batch.records ?? []) {
  const id = `${record.target}\u0000${record.key}`;
  const source = englishContent(record.target)?.[record.key];
  const current = records.get(id);
  const expected = record.reviewedPreserve ? source : record.translation;
  if (record.source !== undefined && source !== record.source) errors.push(`source drift: ${record.target} :: ${record.key}`);
  if (current !== expected) errors.push(`batch value not applied: ${record.target} :: ${record.key}`);
  if (JSON.stringify(markerSignature(source ?? "")) !== JSON.stringify(markerSignature(current ?? ""))) {
    errors.push(`marker mismatch: ${record.target} :: ${record.key}`);
  }
  if (!record.reviewedPreserve && !/\p{Script=Thai}/u.test(current ?? "")) errors.push(`no Thai script: ${record.target} :: ${record.key}`);
  const proseOnly = (current ?? "").replace(/\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\$[A-Za-z0-9]+|%[a-z][A-Za-z0-9_]*/g, "");
  if (!record.reviewedPreserve && !record.reviewedEnglishResidue && /\b(?:the|and|with|from|for|your|you|this|that|fish|farm|festival|bundle)\b/i.test(proseOnly)) {
    warnings.push(`possible English residue: ${record.target} :: ${record.key}`);
  }
}

if (records.size !== 14720) errors.push(`coverage structure is ${records.size}, expected 14720`);
console.log(JSON.stringify({ batch: batch.id, checkedRecords: batch.records?.length ?? 0, totalStructureRecords: records.size, errors: errors.length, warnings: warnings.length, details: [...errors, ...warnings] }, null, 2));
if (errors.length || warnings.length) process.exit(1);
