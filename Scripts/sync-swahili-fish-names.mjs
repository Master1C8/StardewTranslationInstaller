#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/sync-swahili-fish-names.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const swahiliRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
);
const objectsDocument = JSON.parse(fs.readFileSync(path.join(swahiliRoot, "objects.json"), "utf8"));
const fishFile = path.join(swahiliRoot, "fish.json");
const fishDocument = JSON.parse(fs.readFileSync(fishFile, "utf8"));
const englishObjects = JSON.parse(
  fs.readFileSync(path.join(sourceRoot, "Strings/Objects.json"), "utf8"),
).content;

const names = new Map();
for (const change of objectsDocument.Changes ?? []) {
  if (change.Target !== "Strings/Objects") continue;
  for (const [key, translated] of Object.entries(change.Entries ?? {})) {
    if (!key.endsWith("_Name") || typeof englishObjects[key] !== "string") continue;
    const source = englishObjects[key];
    if (names.has(source) && names.get(source) !== translated) {
      throw new Error(`Conflicting object-name translations for ${source}`);
    }
    names.set(source, translated);
  }
}

let updated = 0;
for (const change of fishDocument.Changes ?? []) {
  if (change.Target !== "Data/Fish") continue;
  for (const [key, value] of Object.entries(change.Entries ?? {})) {
    const fields = value.split("/");
    const translated = names.get(fields[0]);
    if (!translated) throw new Error(`No translated Strings/Objects name for fish ${key}: ${fields[0]}`);
    fields[0] = translated;
    change.Entries[key] = fields.join("/");
    updated += 1;
  }
}

fs.writeFileSync(fishFile, `${JSON.stringify(fishDocument, null, 2)}\n`);
console.log(`Synchronized ${updated} Data/Fish display names from translated English object names.`);
