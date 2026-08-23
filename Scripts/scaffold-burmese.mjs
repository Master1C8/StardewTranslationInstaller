#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
const force = process.argv.includes("--force");
if (!sourceRoot) {
  console.error("Usage: node Scripts/scaffold-burmese.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations",
);
const polishRoot = path.join(translationRoot, "polish");
const russianRoot = path.join(translationRoot, "russian");
const outputRoot = path.join(translationRoot, "burmese");

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function collectStructure(directory) {
  const records = new Set();
  for (const relative of listJSONFiles(directory)) {
    const document = readJSON(path.join(directory, relative));
    for (const change of document.Changes ?? []) {
      for (const key of Object.keys(change.Entries ?? {})) {
        records.add(`${change.Target}\u0000${key}`);
      }
    }
  }
  return records;
}

const polishStructure = collectStructure(polishRoot);
const russianStructure = collectStructure(russianRoot);
const missingFromRussian = [...polishStructure].filter((id) => !russianStructure.has(id));
const missingFromPolish = [...russianStructure].filter((id) => !polishStructure.has(id));
if (missingFromRussian.length || missingFromPolish.length) {
  throw new Error(
    `Russian/Polish structure differs: russian missing ${missingFromRussian.length}, Polish missing ${missingFromPolish.length}`,
  );
}

if (fs.existsSync(outputRoot) && !force) {
  throw new Error(`Refusing to overwrite existing Burmese work: ${outputRoot}`);
}
fs.mkdirSync(outputRoot, { recursive: true });

const sourceCache = new Map();
function englishContent(target) {
  if (!sourceCache.has(target)) {
    const file = path.join(sourceRoot, `${target}.json`);
    if (!fs.existsSync(file)) throw new Error(`Missing English asset: ${target}`);
    const content = readJSON(file).content;
    if (!content || typeof content !== "object") {
      throw new Error(`English asset has no content object: ${target}`);
    }
    sourceCache.set(target, content);
  }
  return sourceCache.get(target);
}

let records = 0;
const files = listJSONFiles(polishRoot).sort();
for (const relative of files) {
  const template = readJSON(path.join(polishRoot, relative));
  const output = {
    Changes: (template.Changes ?? []).map((change) => {
      if (change.Action !== "EditData" || typeof change.Target !== "string") {
        throw new Error(`Unsupported Polish structure in ${relative}`);
      }
      const source = englishContent(change.Target);
      const entries = {};
      for (const key of Object.keys(change.Entries ?? {})) {
        if (!Object.hasOwn(source, key) || typeof source[key] !== "string") {
          throw new Error(`Missing English source: ${change.Target} :: ${key}`);
        }
        entries[key] = source[key];
        records += 1;
      }
      return {
        Action: "EditData",
        Target: change.Target,
        When: { Language: "my-vnrevival" },
        Entries: entries,
      };
    }),
  };
  const destination = path.join(outputRoot, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(output, null, 2)}\n`);
}

if (records !== polishStructure.size) {
  throw new Error(`Expected ${polishStructure.size} unique records, wrote ${records}`);
}

console.log(
  `Created ${files.length} Burmese files with ${records} English-source records from ${sourceCache.size} assets.`,
);
