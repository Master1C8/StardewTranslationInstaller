#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const batchFile = process.argv[2];
if (!batchFile) {
  console.error("Usage: node Scripts/apply-swahili-multifile-batch.mjs <batch.json>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
);
const batch = JSON.parse(fs.readFileSync(path.resolve(batchFile), "utf8"));
let total = 0;

for (const [relativeFile, entries] of Object.entries(batch)) {
  const file = path.join(translationRoot, relativeFile);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  const found = new Map();
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) {
      if (!Object.hasOwn(entries, key)) continue;
      found.set(key, (found.get(key) ?? 0) + 1);
      change.Entries[key] = entries[key];
    }
  }
  const missing = Object.keys(entries).filter((key) => !found.has(key));
  const duplicates = [...found].filter(([, count]) => count !== 1).map(([key]) => key);
  if (missing.length || duplicates.length) {
    throw new Error(
      `${relativeFile}: missing=${missing.join(",")}, duplicates=${duplicates.join(",")}`,
    );
  }
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
  total += Object.keys(entries).length;
}

console.log(`Applied ${total} translations across ${Object.keys(batch).length} Swahili files.`);
