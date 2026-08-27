#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.resolve(
  process.argv.slice(2).find((argument) => !argument.startsWith("--"))
    ?? "/Users/antonkrutov/Developer/data/stardew-english-unpacked",
);
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations",
);
const structureRoot = path.join(translationRoot, "uzbek");
const destinationRoot = path.join(translationRoot, "urdu");
const languageCode = "ur-vnrevival";
const expected = { files: 463, changes: 489, targets: 187, records: 14720 };

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  }).sort();
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

if (fs.existsSync(destinationRoot)) {
  throw new Error(`Refusing to overwrite existing Urdu translation directory: ${destinationRoot}`);
}

const files = listJSONFiles(structureRoot);
const englishCache = new Map();
const seenRecords = new Set();
let changeCount = 0;

function englishContent(target) {
  if (!englishCache.has(target)) {
    const file = path.join(sourceRoot, `${target}.json`);
    if (!fs.existsSync(file)) throw new Error(`Missing English asset: ${target}`);
    const content = readJSON(file).content;
    if (!content || typeof content !== "object") {
      throw new Error(`English asset has no content object: ${file}`);
    }
    englishCache.set(target, content);
  }
  return englishCache.get(target);
}

fs.mkdirSync(destinationRoot, { recursive: true });
for (const relative of files) {
  const template = readJSON(path.join(structureRoot, relative));
  if (Object.hasOwn(template, "Format")) {
    throw new Error(`Secondary translation file must omit Format: ${relative}`);
  }
  if (!Array.isArray(template.Changes) || template.Changes.length === 0) {
    throw new Error(`Translation file has no Changes: ${relative}`);
  }
  const output = {
    Changes: template.Changes.map((change) => {
      if (
        change.Action !== "EditData"
        || typeof change.Target !== "string"
        || !change.Entries
        || typeof change.Entries !== "object"
        || Array.isArray(change.Entries)
      ) {
        throw new Error(`Unsupported structural change: ${relative}`);
      }
      const english = englishContent(change.Target);
      const entries = {};
      for (const key of Object.keys(change.Entries)) {
        if (!Object.hasOwn(english, key) || typeof english[key] !== "string") {
          throw new Error(`Missing English string: ${change.Target} :: ${key}`);
        }
        const id = `${change.Target}\u0000${key}`;
        if (seenRecords.has(id)) throw new Error(`Duplicate record: ${change.Target} :: ${key}`);
        seenRecords.add(id);
        entries[key] = english[key];
      }
      changeCount += 1;
      return {
        Action: "EditData",
        Target: change.Target,
        When: { Language: languageCode },
        Entries: entries,
      };
    }),
  };
  const destination = path.join(destinationRoot, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(output, null, 2)}\n`);
}

const actual = {
  files: files.length,
  changes: changeCount,
  targets: englishCache.size,
  records: seenRecords.size,
};
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`Unexpected Urdu scaffold totals: ${JSON.stringify(actual)}`);
}

console.log(`Created Urdu scaffold: ${JSON.stringify(actual)}`);
