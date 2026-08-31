#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  root,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/vietnamese",
);
const correctionFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "Documentation/vietnamese-editorial-corrections.json");

const corrections = JSON.parse(fs.readFileSync(correctionFile, "utf8"));
const documents = fs.readdirSync(translationRoot)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => {
    const file = path.join(translationRoot, name);
    return { file, document: JSON.parse(fs.readFileSync(file, "utf8")), dirty: false };
  });

let applied = 0;
let alreadyApplied = 0;
for (const correction of corrections) {
  const matches = [];
  for (const item of documents) {
    for (const change of item.document.Changes ?? []) {
      if (
        change.Target === correction.target
        && Object.hasOwn(change.Entries ?? {}, correction.key)
      ) {
        matches.push({ item, change });
      }
    }
  }
  if (matches.length !== 1) {
    throw new Error(
      `${correction.target} :: ${correction.key}: expected one translation record, found ${matches.length}`,
    );
  }

  const [{ item, change }] = matches;
  const current = change.Entries[correction.key];
  const expectedCount = correction.count ?? 1;
  const oldCount = current.split(correction.search).length - 1;
  const newCount = current.split(correction.replace).length - 1;
  if (oldCount === expectedCount) {
    change.Entries[correction.key] = current.replaceAll(correction.search, correction.replace);
    item.dirty = true;
    applied += 1;
  } else if (oldCount === 0 && newCount >= expectedCount) {
    alreadyApplied += 1;
  } else {
    throw new Error(
      `${correction.target} :: ${correction.key}: expected ${expectedCount} occurrence(s) of ${JSON.stringify(correction.search)}, found ${oldCount}`,
    );
  }
}

for (const item of documents) {
  if (item.dirty) fs.writeFileSync(item.file, `${JSON.stringify(item.document, null, 2)}\n`);
}

console.log(JSON.stringify({ corrections: corrections.length, applied, alreadyApplied }, null, 2));
