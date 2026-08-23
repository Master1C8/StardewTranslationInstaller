#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/audit-telugu-progress.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const EXPECTED_FILES = 151;
const EXPECTED_RECORDS = 14720;
const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/telugu",
);
const editorial = JSON.parse(fs.readFileSync(
  path.join(projectRoot, "Documentation/telugu-editorial-overrides.json"),
  "utf8",
));
const errors = [];
const warnings = [];

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  }).sort();
}

function all(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}

function count(value, character) {
  return [...value].filter((item) => item === character).length;
}

function markerSignature(value) {
  return {
    contentPatcher: all(value, /\{\{[^}]+\}\}/g),
    substitutions: all(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: all(
      value,
      /\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g,
    ),
    percent: all(value, /%[a-z][A-Za-z0-9_]*/g),
    dollar: all(value, /\$[A-Za-z0-9]+/g),
    typedItems: all(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: all(value, /https?:\/\/[^\s)]+/g),
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(value, "^"),
    pipe: count(value, "|"),
    underscore: count(value, "_"),
    backslash: count(value, "\\"),
    newline: count(value, "\n"),
    plus: count(value, "+"),
    percentCharacter: count(value, "%"),
    dollarCharacter: count(value, "$"),
    lessThan: count(value, "<"),
    greaterThan: count(value, ">"),
    openSquareBracket: count(value, "["),
    closeSquareBracket: count(value, "]"),
    trailingSpace: / $/.test(value),
  };
}

const sourceCache = new Map();
function englishValue(target, key) {
  if (!sourceCache.has(target)) {
    const file = path.join(sourceRoot, `${target}.json`);
    if (!fs.existsSync(file)) {
      errors.push(`missing English target: ${target}`);
      sourceCache.set(target, null);
    } else {
      sourceCache.set(target, JSON.parse(fs.readFileSync(file, "utf8")).content);
    }
  }
  return sourceCache.get(target)?.[key];
}

const files = listJSONFiles(translationRoot);
const patches = new Map();
for (const relative of files) {
  const document = JSON.parse(fs.readFileSync(path.join(translationRoot, relative), "utf8"));
  for (const change of document.Changes ?? []) {
    if (change.Action !== "EditData" || typeof change.Target !== "string") {
      errors.push(`invalid EditData change: ${relative}`);
      continue;
    }
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "te-vnrevival" })) {
      errors.push(`invalid Language condition: ${relative} :: ${change.Target}`);
    }
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (patches.has(id)) errors.push(`duplicate Telugu patch record: ${id}`);
      patches.set(id, { value, relative });
    }
  }
}

const preserved = new Set(editorial.preservedRecords ?? []);
const preservedTargets = new Set(editorial.preservedTargets ?? []);
for (const id of patches.keys()) {
  const split = id.indexOf("\u0000");
  if (preservedTargets.has(id.slice(0, split)) && !editorial.records?.[id]) preserved.add(id);
}
const reviewed = new Set([...Object.keys(editorial.records ?? {}), ...preserved]);
if (reviewed.size !== Object.keys(editorial.records ?? {}).length + preserved.size) {
  errors.push("duplicate Telugu editorial record across translated and preserved sets");
}
for (const [id, patch] of patches) {
  const split = id.indexOf("\u0000");
  const target = id.slice(0, split);
  const key = id.slice(split + 1);
  const english = englishValue(target, key);
  if (typeof english !== "string") {
    errors.push(`missing English record: ${id}`);
    continue;
  }
  const record = editorial.records?.[id];
  if (preserved.has(id)) {
    if (patch.value !== english) errors.push(`preserved technical record changed: ${id}`);
    continue;
  }
  if (!record) {
    if (patch.value !== english) errors.push(`unreviewed Telugu mutation: ${id}`);
    continue;
  }
  if (record.english !== english) errors.push(`stale reviewed English source: ${id}`);
  if (record.translation !== patch.value) errors.push(`reviewed patch mismatch: ${id}`);
  if (patch.value !== patch.value.normalize("NFC")) errors.push(`non-NFC Telugu: ${id}`);
  if (patch.value.includes("�")) errors.push(`replacement character: ${id}`);
  if (
    JSON.stringify(markerSignature(english)) !== JSON.stringify(markerSignature(patch.value))
  ) errors.push(`marker mismatch: ${id}`);
  if (/[A-Za-z]{2}/.test(english) && patch.value !== english && !/[\u0C00-\u0C7F]/u.test(patch.value)) {
    errors.push(`reviewed translation lacks Telugu script: ${id}`);
  }
}

for (const id of reviewed) {
  if (!patches.has(id)) errors.push(`reviewed record missing from patches: ${id}`);
}
if (files.length !== EXPECTED_FILES) errors.push(`file count ${files.length}, expected ${EXPECTED_FILES}`);
if (patches.size !== EXPECTED_RECORDS) errors.push(`record count ${patches.size}, expected ${EXPECTED_RECORDS}`);

const report = {
  locale: "te-vnrevival",
  files: files.length,
  records: patches.size,
  reviewed: reviewed.size,
  unreviewed: patches.size - reviewed.size,
  completionPercent: Number((reviewed.size / EXPECTED_RECORDS * 100).toFixed(3)),
  sourceTargets: sourceCache.size,
  warnings: warnings.length,
  errors: errors.length,
};
console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
