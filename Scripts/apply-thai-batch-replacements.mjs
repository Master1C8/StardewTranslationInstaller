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

const batchName = path.basename(batchPath);
const applicableReplacements = replacements.filter(
  (entry) => entry.batch === undefined || entry.batch === batchName,
);
if (applicableReplacements.length === 0) {
  throw new Error(`Replacement file has no entries for batch: ${batchName}`);
}

let applied = 0;
let alreadyApplied = 0;

function isSuperseded(entry, index, translation) {
  let chainedValue = entry.to;
  for (let laterIndex = index + 1; laterIndex < applicableReplacements.length; laterIndex += 1) {
    const later = applicableReplacements[laterIndex];
    if (later.target !== entry.target || later.key !== entry.key || later.from !== chainedValue) continue;
    chainedValue = later.to;
    if (translation === chainedValue) return true;
  }
  return false;
}

function occurrenceIndexes(value, needle) {
  const indexes = [];
  let offset = 0;
  while (offset <= value.length - needle.length) {
    const index = value.indexOf(needle, offset);
    if (index === -1) break;
    indexes.push(index);
    offset = index + needle.length;
  }
  return indexes;
}

for (const [index, entry] of applicableReplacements.entries()) {
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
  const fromIndexes = occurrenceIndexes(record.translation, from);
  const toIndexes = occurrenceIndexes(record.translation, to);
  const uncoveredFromIndexes = fromIndexes.filter(
    (fromIndex) =>
      !toIndexes.some(
        (toIndex) => fromIndex >= toIndex && fromIndex + from.length <= toIndex + to.length,
      ),
  );
  if (isSuperseded(entry, index, record.translation)) {
    alreadyApplied += 1;
    continue;
  }
  if (uncoveredFromIndexes.length === 0 && toIndexes.length === 1) {
    alreadyApplied += 1;
    continue;
  }
  if (uncoveredFromIndexes.length === 1) {
    const fromIndex = uncoveredFromIndexes[0];
    record.translation = `${record.translation.slice(0, fromIndex)}${to}${record.translation.slice(fromIndex + from.length)}`;
    applied += 1;
    continue;
  }
  {
    throw new Error(
      `Expected one exact source or final translation occurrence for ${target} :: ${key}, found from=${fromIndexes.length}, uncoveredFrom=${uncoveredFromIndexes.length}, to=${toIndexes.length}: ${from}`,
    );
  }
}

fs.writeFileSync(batchPath, `${JSON.stringify(batch, null, 2)}\n`);
console.log(JSON.stringify({
  batch: batchFile,
  replacements: applicableReplacements.length,
  manifestReplacements: replacements.length,
  applied,
  alreadyApplied,
}, null, 2));
