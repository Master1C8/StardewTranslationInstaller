#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const correctionArgument = process.argv[2];
if (!correctionArgument) {
  console.error("Usage: node Scripts/apply-tamil-editorial-corrections.mjs <corrections.json>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/tamil",
);
const correctionPath = path.resolve(correctionArgument);
const correctionSet = JSON.parse(fs.readFileSync(correctionPath, "utf8"));
if (!correctionSet.id || !Array.isArray(correctionSet.records) || !correctionSet.records.length) {
  throw new Error("Correction set requires a non-empty id and records array.");
}

const documents = new Map();
const index = new Map();
for (const fileName of fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json"))) {
  const file = path.join(translationRoot, fileName);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  documents.set(file, document);
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (index.has(id)) throw new Error(`Duplicate Tamil record: ${change.Target} :: ${key}`);
      index.set(id, { file, change });
    }
  }
}

const touchedFiles = new Set();
let changedRecords = 0;
let changedReplacements = 0;
let alreadyApplied = 0;
for (const replacement of correctionSet.globalReplacements ?? []) {
  if (!Array.isArray(replacement) || replacement.length !== 3) {
    throw new Error(`Invalid global replacement: ${JSON.stringify(replacement)}`);
  }
  const [before, after, expectedCount] = replacement;
  let beforeCount = 0;
  let afterCount = 0;
  const locations = [];
  for (const [file, document] of documents) {
    for (const change of document.Changes ?? []) {
      for (const [key, value] of Object.entries(change.Entries ?? {})) {
        const countBefore = value.split(before).length - 1;
        beforeCount += countBefore;
        afterCount += value.split(after).length - 1;
        if (countBefore) locations.push({ file, change, key, value });
      }
    }
  }
  if (beforeCount === expectedCount) {
    for (const location of locations) {
      location.change.Entries[location.key] = location.value.split(before).join(after);
      touchedFiles.add(location.file);
    }
    changedReplacements += 1;
  } else if (beforeCount === 0 && afterCount >= expectedCount) {
    alreadyApplied += 1;
  } else {
    throw new Error(
      `Unexpected global replacement count for ${JSON.stringify(before)}: `
        + `actual=${beforeCount}, expected=${expectedCount}`,
    );
  }
}
const seenRecords = new Set();
for (const record of correctionSet.records) {
  const id = `${record.target}\u0000${record.key}`;
  if (seenRecords.has(id)) throw new Error(`Duplicate correction record: ${record.target} :: ${record.key}`);
  seenRecords.add(id);
  const location = index.get(id);
  if (!location) throw new Error(`Unknown Tamil record: ${record.target} :: ${record.key}`);
  if (!Array.isArray(record.replacements) || !record.replacements.length) {
    throw new Error(`Missing replacements: ${record.target} :: ${record.key}`);
  }

  let value = location.change.Entries[record.key];
  let recordChanged = false;
  for (const replacement of record.replacements) {
    if (!Array.isArray(replacement) || replacement.length < 2 || replacement.length > 4) {
      throw new Error(`Invalid replacement: ${record.target} :: ${record.key}`);
    }
    const [before, after, expectedCount = 1, mode = "replace-before"] = replacement;
    if (!new Set(["replace-before", "prefer-after"]).has(mode)) {
      throw new Error(`Invalid replacement mode: ${record.target} :: ${record.key}`);
    }
    const beforeCount = value.split(before).length - 1;
    const afterCount = value.split(after).length - 1;
    if (mode === "prefer-after" && afterCount >= expectedCount) {
      alreadyApplied += 1;
    } else if (beforeCount === expectedCount) {
      value = value.split(before).join(after);
      changedReplacements += 1;
      recordChanged = true;
    } else if (beforeCount === 0 && afterCount >= expectedCount) {
      alreadyApplied += 1;
    } else {
      throw new Error(
        `Unexpected replacement count for ${record.target} :: ${record.key}: `
          + `${JSON.stringify(before)} actual=${beforeCount}, expected=${expectedCount}`,
      );
    }
  }
  if (recordChanged) {
    location.change.Entries[record.key] = value;
    touchedFiles.add(location.file);
    changedRecords += 1;
  }
}

for (const file of touchedFiles) {
  fs.writeFileSync(file, `${JSON.stringify(documents.get(file), null, 2)}\n`);
}

console.log(JSON.stringify({
  correctionSet: correctionSet.id,
  records: correctionSet.records.length,
  changedRecords,
  changedReplacements,
  alreadyApplied,
  touchedFiles: touchedFiles.size,
}, null, 2));
