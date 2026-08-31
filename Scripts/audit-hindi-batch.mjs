#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const batchArgument = process.argv[2];
if (!batchArgument) {
  console.error("Usage: node Scripts/audit-hindi-batch.mjs <batch.json>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/hindi",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const batch = JSON.parse(fs.readFileSync(path.resolve(batchArgument), "utf8"));
const errors = [];
const warnings = [];

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
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sortedMatches(value, /https?:\/\/[^\s)]+/g),
    numericFields: sortedMatches(value, /(?<=^|\/)\d+(?=\/|$)/g),
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(value, "^"),
    pipe: count(value, "|"),
    slash: count(value, "/"),
    backslash: count(value, "\\"),
    angleHeart: count(value, "<"),
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
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) {
    errors.push(`missing Changes: ${relative}`);
    continue;
  }
  for (const change of document.Changes) {
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "hi-vnrevival" })) {
      errors.push(`invalid language gate: ${relative}: ${change.Target}`);
    }
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${change.Target} :: ${key}`);
      records.set(id, value);
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

function expectedTranslation(record, source) {
  if (record.reviewedPreserve && record.translation === undefined && !Array.isArray(record.replacements)) return source;
  if (!Array.isArray(record.replacements)) return record.translation;
  let result = source;
  for (const [from, to] of record.replacements) {
    const first = result.indexOf(from);
    if (first < 0 || result.indexOf(from, first + from.length) >= 0) {
      errors.push(`invalid unique replacement: ${record.target} :: ${record.key} :: ${JSON.stringify(from)}`);
      return "";
    }
    result = `${result.slice(0, first)}${to}${result.slice(first + from.length)}`;
  }
  return result;
}

for (const record of batch.records ?? []) {
  const id = `${record.target}\u0000${record.key}`;
  const source = englishContent(record.target)?.[record.key];
  const current = records.get(id);
  if (record.source !== undefined && source !== record.source) errors.push(`source drift: ${record.target} :: ${record.key}`);
  if (current !== expectedTranslation(record, source)) errors.push(`batch value not applied: ${record.target} :: ${record.key}`);
  if (JSON.stringify(markerSignature(source ?? "")) !== JSON.stringify(markerSignature(current ?? ""))) {
    errors.push(`marker mismatch: ${record.target} :: ${record.key}`);
  }
  if (!record.reviewedPreserve && !/\p{Script=Devanagari}/u.test(current ?? "")) {
    errors.push(`no Devanagari: ${record.target} :: ${record.key}`);
  }
  const proseOnly = (current ?? "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\bchangeLocation Farm\b/g, "")
    .replace(/\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\$[A-Za-z0-9]+|%farm Farm|%[a-z][A-Za-z0-9_]*/g, "");
  if (!record.reviewedPreserve && /\b(?:the|and|with|from|for|your|you|this|that|fish|farm|festival|bundle)\b/i.test(proseOnly)) {
    warnings.push(`possible English residue: ${record.target} :: ${record.key}`);
  }
}

if (records.size !== 14720) errors.push(`coverage structure is ${records.size}, expected 14720`);
console.log(JSON.stringify({
  batch: batch.id,
  checkedRecords: batch.records?.length ?? 0,
  totalStructureRecords: records.size,
  errors: errors.length,
  warnings: warnings.length,
  details: [...errors, ...warnings],
}, null, 2));
if (errors.length || warnings.length) process.exit(1);
