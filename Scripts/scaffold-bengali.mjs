#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/kannada",
);
const destinationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/bengali",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const languageCode = "bn-vnrevival";

if (fs.existsSync(destinationRoot)) {
  throw new Error(`Refusing to overwrite existing Bengali translation directory: ${destinationRoot}`);
}

const sourceFiles = fs.readdirSync(sourceRoot).filter((name) => name.endsWith(".json")).sort();
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

for (const fileName of sourceFiles) {
  const sourcePath = path.join(sourceRoot, fileName);
  const sourceDocument = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  if (Object.hasOwn(sourceDocument, "Format")) {
    throw new Error(`Secondary translation file must omit Format: ${sourcePath}`);
  }
  if (!Array.isArray(sourceDocument.Changes) || sourceDocument.Changes.length === 0) {
    throw new Error(`Translation file has no Changes: ${sourcePath}`);
  }

  const outputDocument = {
    Changes: sourceDocument.Changes.map((change) => {
      if (change.Action !== "EditData" || !change.Target || !change.Entries) {
        throw new Error(`Unsupported change in ${sourcePath}`);
      }
      const english = getEnglishContent(change.Target);
      const entries = {};
      for (const key of Object.keys(change.Entries)) {
        if (!Object.hasOwn(english, key)) {
          throw new Error(`Missing English key ${change.Target} :: ${key}`);
        }
        if (typeof english[key] !== "string") {
          throw new Error(`Non-string English value ${change.Target} :: ${key}`);
        }
        const recordId = `${change.Target}\u0000${key}`;
        if (seenRecords.has(recordId)) throw new Error(`Duplicate record ${change.Target} :: ${key}`);
        seenRecords.add(recordId);
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

  fs.writeFileSync(
    path.join(destinationRoot, fileName),
    `${JSON.stringify(outputDocument, null, 2)}\n`,
  );
}

if (sourceFiles.length !== 151 || englishCache.size !== 187 || recordCount !== 14720) {
  throw new Error(
    `Unexpected scaffold totals: ${sourceFiles.length} files, ${englishCache.size} targets, ${recordCount} records`,
  );
}

console.log(
  `Created Bengali scaffold: ${sourceFiles.length} files, ${changeCount} changes, ${englishCache.size} targets, ${recordCount} records.`,
);
