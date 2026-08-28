#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const apply = process.argv.includes("--apply");
const sourceRoot = process.argv.find((arg) => !arg.startsWith("--") && arg !== process.argv[0] && arg !== process.argv[1])
  ?? "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const root = path.resolve(import.meta.dirname, "..");
const translations = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian");
const fishPath = path.join(translations, "fish.json");
const objectsPath = path.join(translations, "objects.json");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const getEntries = (document, target, file) => {
  const change = document.Changes?.find((item) => item.Target === target);
  if (!change?.Entries || typeof change.Entries !== "object") {
    throw new Error(`Missing ${target} entries in ${file}`);
  }
  return change.Entries;
};

const fish = readJson(fishPath);
const objects = readJson(objectsPath);
const sourceFish = readJson(path.join(sourceRoot, "Data/Fish.json")).content;
const sourceObjects = readJson(path.join(sourceRoot, "Strings/Objects.json")).content;
const fishEntries = getEntries(fish, "Data/Fish", fishPath);
const objectEntries = getEntries(objects, "Strings/Objects", objectsPath);

const localizedByEnglishName = new Map();
for (const [key, english] of Object.entries(sourceObjects)) {
  if (!key.endsWith("_Name") || typeof english !== "string") continue;
  const localized = objectEntries[key];
  if (typeof localized !== "string") continue;
  const previous = localizedByEnglishName.get(english);
  if (previous && previous !== localized) {
    throw new Error(`Conflicting Indonesian object names for ${JSON.stringify(english)}: ${JSON.stringify(previous)} / ${JSON.stringify(localized)}`);
  }
  localizedByEnglishName.set(english, localized);
}

let changed = 0;
const missing = [];
for (const [key, englishRecord] of Object.entries(sourceFish)) {
  if (!(key in fishEntries) || typeof englishRecord !== "string") continue;
  const slash = englishRecord.indexOf("/");
  if (slash < 1) throw new Error(`Unexpected Data/Fish record ${key}: ${englishRecord}`);
  const englishName = englishRecord.slice(0, slash);
  const technicalSuffix = englishRecord.slice(slash);
  const localizedName = localizedByEnglishName.get(englishName);
  if (!localizedName) {
    missing.push(`${key}: ${englishName}`);
    continue;
  }
  const expected = localizedName + technicalSuffix;
  if (fishEntries[key] !== expected) {
    const currentSlash = fishEntries[key]?.indexOf("/");
    if (currentSlash < 1 || fishEntries[key].slice(currentSlash) !== technicalSuffix) {
      throw new Error(`Technical Data/Fish fields diverged for ${key}`);
    }
    fishEntries[key] = expected;
    changed += 1;
  }
}

if (missing.length) {
  throw new Error(`Missing reviewed Indonesian object names for ${missing.length} fish:\n${missing.join("\n")}`);
}
if (apply && changed) {
  fs.writeFileSync(fishPath, `${JSON.stringify(fish, null, 2)}\n`);
}
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", changed, mapped: Object.keys(fishEntries).length }, null, 2));
