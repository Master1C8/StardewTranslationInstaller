#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/reuse-swahili-translations.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
);
const sourceCache = new Map();

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".json") ? [absolute] : [];
  });
}

function sourceContent(target) {
  if (!sourceCache.has(target)) {
    const file = path.join(path.resolve(sourceRoot), `${target}.json`);
    sourceCache.set(target, JSON.parse(fs.readFileSync(file, "utf8")).content);
  }
  return sourceCache.get(target);
}

const files = listJSONFiles(translationRoot).sort();
const documents = files.map((file) => ({
  file,
  document: JSON.parse(fs.readFileSync(file, "utf8")),
}));
const candidates = new Map();

for (const { document } of documents) {
  for (const change of document.Changes ?? []) {
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries ?? {})) {
      const original = source[key];
      if (typeof original !== "string" || translated === original) continue;
      if (!candidates.has(original)) candidates.set(original, new Set());
      candidates.get(original).add(translated);
    }
  }
}

const memory = new Map(
  [...candidates]
    .filter(([, translations]) => translations.size === 1)
    .map(([original, translations]) => [original, [...translations][0]]),
);
let applied = 0;
let changedFiles = 0;

for (const { file, document } of documents) {
  let changed = false;
  for (const change of document.Changes ?? []) {
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries ?? {})) {
      const original = source[key];
      const replacement = memory.get(original);
      if (translated !== original || !replacement || replacement === original) continue;
      change.Entries[key] = replacement;
      applied += 1;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
    changedFiles += 1;
  }
}

console.log(
  `Reused ${applied} unambiguous exact translations across ${changedFiles} files from ${memory.size} translation-memory entries.`,
);
