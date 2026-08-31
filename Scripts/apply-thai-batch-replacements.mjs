#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const batchFile = process.argv[2];
const replacementsFile = process.argv[3];

if (!batchFile || !replacementsFile) {
  console.error("Usage: node Scripts/apply-thai-batch-replacements.mjs <batch.json> <replacements.json>");
  process.exit(2);
}

const batchPath = path.resolve(batchFile);
const replacementsPath = path.resolve(replacementsFile);
const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));
const replacements = JSON.parse(fs.readFileSync(replacementsPath, "utf8"));

if (!Array.isArray(batch.records)) {
  throw new Error(`Batch has no records array: ${batchFile}`);
}
if (!Array.isArray(replacements) || replacements.length === 0) {
  throw new Error(`Replacement file must contain a non-empty array: ${replacementsFile}`);
}

for (const entry of replacements) {
  const { target, key, from, to } = entry;
  if (![target, key, from, to].every((value) => typeof value === "string")) {
    throw new Error("Each replacement needs string target, key, from, and to fields");
  }
  if (!from || from === to) {
    throw new Error(`Invalid replacement for ${target} :: ${key}`);
  }

  const matches = batch.records.filter((record) => record.target === target && record.key === key);
  if (matches.length !== 1) {
    throw new Error(`Record must match exactly once: ${target} :: ${key} matched ${matches.length}`);
  }

  const record = matches[0];
  const occurrences = record.translation.split(from).length - 1;
  if (occurrences !== 1) {
    throw new Error(
      `Expected one exact translation occurrence for ${target} :: ${key}, found ${occurrences}: ${from}`,
    );
  }
  record.translation = record.translation.replace(from, to);
}

fs.writeFileSync(batchPath, `${JSON.stringify(batch, null, 2)}\n`);
console.log(`Applied ${replacements.length} Thai batch replacements to ${batchFile}.`);
