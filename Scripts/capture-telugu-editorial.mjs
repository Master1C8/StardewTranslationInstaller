#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
const ids = process.argv.slice(3);
if (!sourceRoot || ids.length === 0) {
  console.error("Usage: node Scripts/capture-telugu-editorial.mjs <unpacked-English-assets-dir> <target\\0key> [...]");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/telugu",
);
const editorialFile = path.join(projectRoot, "Documentation/telugu-editorial-overrides.json");
const editorial = JSON.parse(fs.readFileSync(editorialFile, "utf8"));

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  });
}

const translations = new Map();
for (const file of listJSONFiles(translationRoot)) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      translations.set(`${change.Target}\u0000${key}`, value);
    }
  }
}

const sourceCache = new Map();
function englishValue(target, key) {
  if (!sourceCache.has(target)) {
    const file = path.join(sourceRoot, `${target}.json`);
    sourceCache.set(target, JSON.parse(fs.readFileSync(file, "utf8")).content);
  }
  return sourceCache.get(target)?.[key];
}

for (const rawId of ids) {
  const id = rawId.includes("::") ? rawId.replace("::", "\u0000") : rawId;
  const split = id.indexOf("\u0000");
  if (split < 1) throw new Error(`invalid record id: ${JSON.stringify(id)}`);
  const target = id.slice(0, split);
  const key = id.slice(split + 1);
  const english = englishValue(target, key);
  const translation = translations.get(id);
  if (typeof english !== "string") throw new Error(`missing English source: ${id}`);
  if (typeof translation !== "string") throw new Error(`missing Telugu patch record: ${id}`);
  if (translation === english) throw new Error(`translation is unchanged: ${id}`);
  editorial.records[id] = { english, translation };
}

fs.writeFileSync(editorialFile, `${JSON.stringify(editorial, null, 2)}\n`);
console.log(`Captured ${ids.length} Telugu editorial record(s).`);
