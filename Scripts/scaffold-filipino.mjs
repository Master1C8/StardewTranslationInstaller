#!/usr/bin/env node

// Create a source-faithful Filipino patch skeleton. This script preserves the
// English wording; translation and reviewed-preserve decisions are applied only
// through explicit editorial batch files.
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const layoutRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/thai",
);
const destinationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/filipino",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const languageCode = "fil-vnrevival";

if (fs.existsSync(destinationRoot)) {
  throw new Error(`Refusing to overwrite existing Filipino translation directory: ${destinationRoot}`);
}

const layoutFiles = fs.readdirSync(layoutRoot).filter((name) => name.endsWith(".json")).sort();
const englishCache = new Map();
const seenRecords = new Set();
let recordCount = 0;
let changeCount = 0;

function getEnglishContent(target) {
  if (!englishCache.has(target)) {
    const englishPath = path.join(englishRoot, `${target}.json`);
    if (!fs.existsSync(englishPath)) throw new Error(`Missing English asset for ${target}`);
    const document = JSON.parse(fs.readFileSync(englishPath, "utf8"));
    if (!document.content || typeof document.content !== "object") {
      throw new Error(`English asset has no content object: ${englishPath}`);
    }
    englishCache.set(target, document.content);
  }
  return englishCache.get(target);
}

fs.mkdirSync(destinationRoot, { recursive: true });
for (const fileName of layoutFiles) {
  const layoutPath = path.join(layoutRoot, fileName);
  const layout = JSON.parse(fs.readFileSync(layoutPath, "utf8"));
  if (Object.hasOwn(layout, "Format")) throw new Error(`Secondary Format: ${layoutPath}`);
  if (!Array.isArray(layout.Changes) || layout.Changes.length === 0) {
    throw new Error(`Missing Changes: ${layoutPath}`);
  }
  const output = {
    Changes: layout.Changes.map((change) => {
      if (change.Action !== "EditData" || !change.Target || !change.Entries) {
        throw new Error(`Unsupported layout change: ${layoutPath}`);
      }
      const english = getEnglishContent(change.Target);
      const entries = {};
      for (const key of Object.keys(change.Entries)) {
        if (typeof english[key] !== "string") {
          throw new Error(`Missing string ${change.Target} :: ${key}`);
        }
        const id = `${change.Target}\u0000${key}`;
        if (seenRecords.has(id)) throw new Error(`Duplicate record ${change.Target} :: ${key}`);
        seenRecords.add(id);
        entries[key] = english[key];
        recordCount += 1;
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
  fs.writeFileSync(path.join(destinationRoot, fileName), `${JSON.stringify(output, null, 2)}\n`);
}

if (layoutFiles.length !== 151 || englishCache.size !== 187 || recordCount !== 14720) {
  throw new Error(
    `Unexpected totals: ${layoutFiles.length} files, ${englishCache.size} targets, ${recordCount} records`,
  );
}
console.log(
  `Created Filipino scaffold: ${layoutFiles.length} files, ${changeCount} changes, ${englishCache.size} targets, ${recordCount} records.`,
);
