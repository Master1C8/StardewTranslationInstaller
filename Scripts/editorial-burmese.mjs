#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeBurmese,
  encodeBurmese,
  mapsFromDocument,
  readClusterDocument,
} from "./burmese-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/burmese",
);
const overridesFile = path.join(projectRoot, "Documentation/burmese-editorial-overrides.json");
const overrides = JSON.parse(fs.readFileSync(overridesFile, "utf8"));
const { encode, decode } = mapsFromDocument(
  readClusterDocument(path.join(projectRoot, "Documentation/burmese-cluster-map.json")),
);

let records = 0;
let strippedGlossaryWrappers = 0;
let collapsedCorruptRepetitions = 0;
let appliedOverrides = 0;
const seenOverrides = new Set();

for (const file of fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json"))) {
  const fullPath = path.join(translationRoot, file);
  const document = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  for (const change of document.Changes ?? []) {
    for (const [key, encoded] of Object.entries(change.Entries ?? {})) {
      records += 1;
      const id = `${change.Target}\u0000${key}`;
      let value = decodeBurmese(encoded, decode);
      value = value.replace(/<([^<>\n]+)>/g, (_, content) => {
        strippedGlossaryWrappers += 1;
        return content;
      });
      let previous;
      do {
        previous = value;
        value = value.replace(
          /([\u1000-\u103F\u1050-\u109F\uA9E0-\uA9FF\uAA60-\uAA7F]{2,16})\1{2,}/gu,
          (match, unit) => {
            collapsedCorruptRepetitions += 1;
            return unit;
          },
        );
      } while (value !== previous);
      value = value.replace(
        /([\u1000-\u103F\u1050-\u109F\uA9E0-\uA9FF\uAA60-\uAA7F]{1,16})(?:\s+\1){5,}/gu,
        (match, unit) => {
          collapsedCorruptRepetitions += 1;
          return unit;
        },
      );
      if (Object.hasOwn(overrides, id)) {
        value = overrides[id];
        seenOverrides.add(id);
        appliedOverrides += 1;
      }
      change.Entries[key] = encodeBurmese(value, encode);
    }
  }
  fs.writeFileSync(fullPath, `${JSON.stringify(document, null, 2)}\n`);
}

const missingOverrides = Object.keys(overrides).filter((id) => !seenOverrides.has(id));
if (missingOverrides.length) {
  throw new Error(`editorial overrides not found: ${missingOverrides.join(", ")}`);
}

console.log(JSON.stringify({
  records,
  strippedGlossaryWrappers,
  collapsedCorruptRepetitions,
  appliedOverrides,
  missingOverrides: missingOverrides.length,
}, null, 2));
