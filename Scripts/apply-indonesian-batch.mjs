#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const relativeFile = process.argv[2];
const batchFile = process.argv[3];
const targetFilter = process.argv[4];
if (!relativeFile || !batchFile) {
  console.error("Usage: node Scripts/apply-indonesian-batch.mjs <translation-file.json> <batch.json> [Target]");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationFile = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian",
  relativeFile,
);
const document = JSON.parse(fs.readFileSync(translationFile, "utf8"));
const batch = JSON.parse(fs.readFileSync(path.resolve(batchFile), "utf8"));
const found = new Map();

for (const change of document.Changes ?? []) {
  if (targetFilter && change.Target !== targetFilter) continue;
  for (const key of Object.keys(change.Entries ?? {})) {
    if (!Object.hasOwn(batch, key)) continue;
    const matches = found.get(key) ?? [];
    matches.push(change.Entries);
    found.set(key, matches);
  }
}

const missing = Object.keys(batch).filter((key) => !found.has(key));
const duplicates = [...found].filter(([, matches]) => matches.length !== 1).map(([key]) => key);
if (missing.length || duplicates.length) {
  throw new Error(
    `Batch keys do not match uniquely: missing=${missing.join(",")}, duplicates=${duplicates.join(",")}`,
  );
}

for (const [key, value] of Object.entries(batch)) {
  found.get(key)[0][key] = value;
}

fs.writeFileSync(translationFile, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ${Object.keys(batch).length} translations to ${relativeFile}.`);
