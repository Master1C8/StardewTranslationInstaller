#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
const relative = process.argv[3];
if (!sourceRoot || !relative) {
  console.error("Usage: node Scripts/export-marathi-editorial.mjs <English-root> <Marathi-file>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const file = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/marathi",
  relative,
);
const document = JSON.parse(fs.readFileSync(file, "utf8"));
const sourceCache = new Map();
function source(target) {
  if (!sourceCache.has(target)) {
    const sourceFile = path.join(sourceRoot, `${target}.json`);
    sourceCache.set(target, JSON.parse(fs.readFileSync(sourceFile, "utf8")).content);
  }
  return sourceCache.get(target);
}

const output = [];
for (const change of document.Changes ?? []) {
  const english = source(change.Target);
  for (const [key, marathi] of Object.entries(change.Entries ?? {})) {
    output.push({ id: `${change.Target}\0${key}`, english: english[key], marathi });
  }
}
console.log(JSON.stringify(output, null, 2));
