#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot =
  process.argv.slice(2).find((argument) => !argument.startsWith("--"))
  ?? "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const priority = process.argv.find((argument) => argument.startsWith("--priority="))?.split("=")[1];
const requestedIds = new Set(
  (process.argv.find((argument) => argument.startsWith("--id="))?.split("=")[1] ?? "")
    .split(",")
    .filter(Boolean),
);
const limit = Number(process.argv.find((argument) => argument.startsWith("--limit="))?.split("=")[1] ?? 300);
const sampleLimit = Number(
  process.argv.find((argument) => argument.startsWith("--sample="))?.split("=")[1] ?? 8,
);
const summaryOnly = process.argv.includes("--summary");
const compactOnly = process.argv.includes("--compact");
const contains = process.argv.find((argument) => argument.startsWith("--contains="))?.split("=")[1];
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian",
);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(full);
    return entry.isFile() && entry.name.endsWith(".json") ? [full] : [];
  });
}

function normalize(text) {
  return text
    .normalize("NFC")
    .toLocaleLowerCase("id")
    .replaceAll("’", "'")
    .replace(/\s+/g, " ");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsEnglishTerm(text, term) {
  return new RegExp(`(?<![a-z])${escapeRegExp(term)}(?![a-z])`, "iu").test(text);
}

function containsIndonesianTerm(text, term) {
  return new RegExp(`(?<!\\p{L})${escapeRegExp(term)}(?!\\p{L})`, "iu").test(text);
}

function excerpt(text, marker) {
  const normalizedText = text.toLocaleLowerCase("id");
  const index = normalizedText.indexOf(marker.toLocaleLowerCase("id"));
  if (index < 0) return text.slice(0, 240);
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + marker.length + 100);
  return `${start ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

const englishGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
const indonesianGlossary = readJSON(
  path.join(projectRoot, "Documentation/glossary/glossary.id.json"),
).id;
const termPairs = [];

for (const entry of englishGlossary) {
  if (priority && entry.priority !== priority) continue;
  if (requestedIds.size && !requestedIds.has(entry.id)) continue;
  const translated = indonesianGlossary[entry.id]?.term;
  if (!translated) continue;
  const sources = entry.term.split(" / ");
  const targets = translated.split(" / ");
  if (sources.length === targets.length) {
    sources.forEach((source, index) => termPairs.push({ entry, source, target: targets[index] }));
  } else {
    termPairs.push({ entry, source: entry.term, target: translated });
  }
}

const records = [];
for (const file of listJSONFiles(translationRoot)) {
  const document = readJSON(file);
  for (const change of document.Changes ?? []) {
    for (const [key, translation] of Object.entries(change.Entries ?? {})) {
      if (typeof translation === "string") records.push({ target: change.Target, key, translation });
    }
  }
}

const sourceCache = new Map();
function getSource(target, key) {
  if (!sourceCache.has(target)) {
    sourceCache.set(target, readJSON(path.join(sourceRoot, `${target}.json`)).content);
  }
  return sourceCache.get(target)?.[key];
}

const missing = new Map();
for (const record of records) {
  if (contains && !normalize(record.translation).includes(normalize(contains))) continue;
  const source = getSource(record.target, record.key);
  if (typeof source !== "string") continue;
  const normalizedSource = normalize(source);
  const normalizedTranslation = normalize(record.translation);
  for (const pair of termPairs) {
    const sourceTerm = normalize(pair.source);
    const targetTerm = normalize(pair.target);
    if (
      sourceTerm.length < 4
      || !containsEnglishTerm(normalizedSource, sourceTerm)
      || containsIndonesianTerm(normalizedTranslation, targetTerm)
    ) continue;
    const item = missing.get(pair.entry.id) ?? {
      id: pair.entry.id,
      priority: pair.entry.priority,
      source: pair.source,
      expected: pair.target,
      totalRecords: 0,
      records: [],
    };
    item.totalRecords += 1;
    if (item.records.length < sampleLimit) {
      item.records.push({
        target: record.target,
        key: record.key,
        source,
        translation: record.translation,
      });
    }
    missing.set(pair.entry.id, item);
  }
}

let output = [...missing.values()]
  .sort((left, right) => left.priority.localeCompare(right.priority) || left.id.localeCompare(right.id))
  .slice(0, limit);
if (summaryOnly) {
  output = output.map((item) => ({
    id: item.id,
    priority: item.priority,
    source: item.source,
    expected: item.expected,
    records: item.totalRecords,
  }));
} else if (compactOnly) {
  output = output.map((item) => ({
    ...item,
    records: item.records.map((record) => ({
      target: record.target,
      key: record.key,
      source: excerpt(record.source, item.source),
      translation: excerpt(record.translation, contains ?? item.expected),
    })),
  }));
}
console.log(JSON.stringify({ candidates: missing.size, shown: output.length, output }, null, 2));
