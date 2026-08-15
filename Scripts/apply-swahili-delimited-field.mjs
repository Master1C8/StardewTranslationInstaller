#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const relativeFile = process.argv[2];
const batchFile = process.argv[3];
const rawIndex = process.argv[4];
if (!relativeFile || !batchFile || rawIndex === undefined || !Number.isInteger(Number(rawIndex))) {
  console.error("Usage: node Scripts/apply-swahili-delimited-field.mjs <file.json> <batch.json> <field-index>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationFile = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
  relativeFile,
);
const document = JSON.parse(fs.readFileSync(translationFile, "utf8"));
const batch = JSON.parse(fs.readFileSync(path.resolve(batchFile), "utf8"));
const index = Number(rawIndex);
const found = new Set();

for (const change of document.Changes ?? []) {
  for (const [key, value] of Object.entries(change.Entries ?? {})) {
    if (!Object.hasOwn(batch, key)) continue;
    const fields = value.split("/");
    const resolvedIndex = index < 0 ? fields.length + index : index;
    if (resolvedIndex < 0 || resolvedIndex >= fields.length) {
      throw new Error(`Field index ${index} is invalid for ${key}`);
    }
    fields[resolvedIndex] = batch[key];
    change.Entries[key] = fields.join("/");
    found.add(key);
  }
}

const missing = Object.keys(batch).filter((key) => !found.has(key));
if (missing.length) throw new Error(`Batch keys not found: ${missing.join(",")}`);
fs.writeFileSync(translationFile, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ${found.size} delimited-field translations to ${relativeFile}.`);
