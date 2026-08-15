#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const relativeFile = process.argv[2];
const batchFile = process.argv[3];
const targetFilter = process.argv[4];
if (!relativeFile || !batchFile) {
  console.error("Usage: node Scripts/apply-swahili-event-text-replacements.mjs <translation-file.json> <batch.json>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationFiles = relativeFile.split(",").map((file) => ({
  file,
  path: path.join(
    projectRoot,
    "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
    file,
  ),
}));
for (const translationFile of translationFiles) {
  translationFile.document = JSON.parse(fs.readFileSync(translationFile.path, "utf8"));
}
const batch = JSON.parse(fs.readFileSync(path.resolve(batchFile), "utf8"));
const entriesByKey = new Map();

for (const translationFile of translationFiles) {
  for (const change of translationFile.document.Changes ?? []) {
    if (targetFilter && change.Target !== targetFilter) continue;
    for (const key of Object.keys(change.Entries ?? {})) {
      if (!Object.hasOwn(batch, key)) continue;
      const matches = entriesByKey.get(key) ?? [];
      matches.push(change.Entries);
      entriesByKey.set(key, matches);
    }
  }
}

for (const [key, replacements] of Object.entries(batch)) {
  const matches = entriesByKey.get(key) ?? [];
  if (matches.length !== 1) {
    throw new Error(`Event key must match exactly once: ${key} matched ${matches.length}`);
  }
  if (!Array.isArray(replacements) || replacements.length === 0) {
    throw new Error(`Event key has no replacement list: ${key}`);
  }

  let value = matches[0][key];
  for (const replacement of replacements) {
    const { source, target } = replacement;
    if (typeof source !== "string" || typeof target !== "string" || source === target) {
      throw new Error(`Invalid replacement for ${key}`);
    }
    const occurrences = value.split(source).length - 1;
    if (occurrences !== 1) {
      throw new Error(`Expected one exact source occurrence for ${key}, found ${occurrences}: ${source}`);
    }
    value = value.replace(source, target);
  }
  matches[0][key] = value;
}

for (const translationFile of translationFiles) {
  fs.writeFileSync(translationFile.path, `${JSON.stringify(translationFile.document, null, 2)}\n`);
}
console.log(`Applied text-only replacements to ${Object.keys(batch).length} event records in ${relativeFile}.`);
