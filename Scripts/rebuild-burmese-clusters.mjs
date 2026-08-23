#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildClusterDocument,
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
const clusterMapFile = path.join(projectRoot, "Documentation/burmese-cluster-map.json");
const overrides = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "Documentation/burmese-editorial-overrides.json"), "utf8"),
);
const oldDecode = mapsFromDocument(readClusterDocument(clusterMapFile)).decode;
const documents = fs.readdirSync(translationRoot)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => {
    const file = path.join(translationRoot, name);
    return { file, document: JSON.parse(fs.readFileSync(file, "utf8")) };
  });

const rawValues = [];
const seenOverrides = new Set();
let records = 0;
for (const { document } of documents) {
  for (const change of document.Changes ?? []) {
    for (const [key, encoded] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      let value = decodeBurmese(encoded, oldDecode);
      value = value.replace(/<([^<>\n]+)>/g, "$1");
      if (Object.hasOwn(overrides, id)) {
        value = overrides[id];
        seenOverrides.add(id);
      }
      change.Entries[key] = value;
      rawValues.push(value);
      records += 1;
    }
  }
}
const missingOverrides = Object.keys(overrides).filter((id) => !seenOverrides.has(id));
if (missingOverrides.length) throw new Error(`editorial overrides not found: ${missingOverrides.join(", ")}`);
if (documents.length !== 151 || records !== 14720) {
  throw new Error(`unexpected Burmese coverage: files=${documents.length}, records=${records}`);
}

const clusterDocument = buildClusterDocument(rawValues);
const { encode } = mapsFromDocument(clusterDocument);
for (const { file, document } of documents) {
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      change.Entries[key] = encodeBurmese(value, encode);
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}
fs.writeFileSync(clusterMapFile, `${JSON.stringify(clusterDocument, null, 2)}\n`);
console.log(JSON.stringify({
  files: documents.length,
  records,
  overrides: seenOverrides.size,
  shapedClusters: clusterDocument.entries.length,
}, null, 2));
