#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [batchArg, replacementsArg] = process.argv.slice(2);
if (!batchArg || !replacementsArg) {
  console.error("Usage: node Scripts/apply-thai-event-replacements.mjs <batch.json> <replacements.json>");
  process.exit(1);
}

const batchPath = path.resolve(batchArg);
const replacementsPath = path.resolve(replacementsArg);
const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));
const edits = JSON.parse(fs.readFileSync(replacementsPath, "utf8"));

for (const edit of edits) {
  const record = batch.records.find(
    (candidate) => candidate.target === edit.target && candidate.key === edit.key,
  );
  if (!record) {
    throw new Error(`Batch record not found: ${edit.target} :: ${edit.key}`);
  }

  for (const replacement of edit.replacements) {
    const parts = record.translation.split(replacement.from);
    if (parts.length !== 2) {
      throw new Error(
        `Expected one occurrence, found ${parts.length - 1}: ${edit.target} :: ${edit.key} :: ${replacement.from}`,
      );
    }
    record.translation = `${parts[0]}${replacement.to}${parts[1]}`;
  }
}

fs.writeFileSync(batchPath, `${JSON.stringify(batch, null, 2)}\n`);
console.log(JSON.stringify({ batch: batch.id, editedRecords: edits.length }, null, 2));
