#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const apply = process.argv.includes("--apply");
const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/burmese",
);
const stringsFile = path.join(translationRoot, "furniture.json");
const dataFile = path.join(translationRoot, "furniture-data-polish.json");

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const stringsDocument = read(stringsFile);
const dataDocument = read(dataFile);
const strings = stringsDocument.Changes.find((change) => change.Target === "Strings/Furniture")?.Entries;
if (!strings) throw new Error("Strings/Furniture entries not found");

let synchronized = 0;
const unresolved = [];
for (const change of dataDocument.Changes ?? []) {
  if (change.Target !== "Data/Furniture") continue;
  for (const [recordKey, value] of Object.entries(change.Entries ?? {})) {
    const fields = value.split("/");
    const localized = fields.find((field) => field.startsWith("[LocalizedText Strings\\Furniture:"));
    const match = localized?.match(/^\[LocalizedText Strings\\Furniture:([^\]]+)\]$/);
    const stringKey = match?.[1];
    const translated = stringKey ? strings[stringKey] : undefined;
    if (!translated) {
      unresolved.push([recordKey, localized ?? "missing LocalizedText field"]);
      continue;
    }
    fields[0] = translated;
    change.Entries[recordKey] = fields.join("/");
    synchronized += 1;
  }
}

for (const [key, reason] of unresolved) console.log(`${key}\t${reason}`);
console.error(`Furniture data synchronization prepared: synchronized=${synchronized}, unresolved=${unresolved.length}`);
if (apply && unresolved.length === 0) {
  fs.writeFileSync(dataFile, `${JSON.stringify(dataDocument, null, 2)}\n`);
  console.error(`Synchronized ${synchronized} Data/Furniture records.`);
} else if (apply) {
  console.error("No changes written because unresolved records remain.");
  process.exitCode = 1;
}
