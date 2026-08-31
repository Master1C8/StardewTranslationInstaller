#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
const force = process.argv.includes("--force");
if (!sourceRoot) {
  console.error("Usage: node Scripts/scaffold-traditional-chinese.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations",
);
const templateRoot = path.join(translationRoot, "hindi");
const outputRoot = path.join(translationRoot, "traditional-chinese");

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

if (fs.existsSync(outputRoot) && !force) {
  throw new Error(`Refusing to overwrite existing Traditional Chinese work: ${outputRoot}`);
}

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

fs.mkdirSync(outputRoot, { recursive: true });
const seen = new Set();
let records = 0;
const files = listJSONFiles(templateRoot).sort();
for (const relative of files) {
  const template = readJSON(path.join(templateRoot, relative));
  const output = {
    Changes: (template.Changes ?? []).map((change) => {
      if (change.Action !== "EditData" || typeof change.Target !== "string") {
        throw new Error(`Unsupported template structure in ${relative}`);
      }
      const source = englishContent(change.Target);
      const entries = {};
      for (const key of Object.keys(change.Entries ?? {})) {
        const id = `${change.Target}\u0000${key}`;
        if (seen.has(id)) throw new Error(`Duplicate template record: ${change.Target} :: ${key}`);
        if (!Object.hasOwn(source, key) || typeof source[key] !== "string") {
          throw new Error(`Missing English source: ${change.Target} :: ${key}`);
        }
        seen.add(id);
        entries[key] = source[key];
        records += 1;
      }
      return {
        Action: "EditData",
        Target: change.Target,
        When: { Language: "zh-TW-vnrevival" },
        Entries: entries,
      };
    }),
  };
  const destination = path.join(outputRoot, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(output, null, 2)}\n`);
}

if (files.length !== 151 || records !== 14720 || seen.size !== records) {
  throw new Error(`Unexpected baseline: ${files.length} files, ${records} records, ${seen.size} unique`);
}

console.log(JSON.stringify({ files: files.length, records, targets: sourceCache.size }, null, 2));
