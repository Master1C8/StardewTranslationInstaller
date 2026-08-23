#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildClusterDocument,
  encodeBurmese,
  mapsFromDocument,
} from "./burmese-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/burmese",
);
const clusterMapFile = path.join(
  projectRoot,
  "Documentation/burmese-cluster-map.json",
);

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

const files = listJSONFiles(translationRoot).sort();
const documents = files.map((relative) => {
  const file = path.join(translationRoot, relative);
  return { file, document: JSON.parse(fs.readFileSync(file, "utf8")) };
});
const values = [];
let records = 0;
for (const { document } of documents) {
  for (const change of document.Changes ?? []) {
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "my-vnrevival" })) {
      throw new Error(`invalid Burmese language condition for ${change.Target}`);
    }
    for (const value of Object.values(change.Entries ?? {})) {
      if (typeof value !== "string") throw new Error(`non-string Burmese entry in ${change.Target}`);
      if (/[\uE000-\uF8FF]/u.test(value)) {
        throw new Error("Burmese patches are already cluster-encoded; reapply the raw translation first");
      }
      values.push(value);
      records += 1;
    }
  }
}
if (files.length !== 151 || records !== 14720) {
  throw new Error(`unexpected Burmese coverage: files=${files.length}, records=${records}`);
}

const clusterDocument = buildClusterDocument(values);
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
console.log(
  `Encoded ${records} Burmese records in ${files.length} files with ${clusterDocument.entries.length} shaped clusters.`,
);
