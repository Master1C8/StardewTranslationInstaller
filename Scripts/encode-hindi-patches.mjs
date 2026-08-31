#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildClusterDocument,
  decodeHindi,
  encodeHindi,
  mapsFromDocument,
  readClusterDocument,
} from "./hindi-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/hindi",
);
const clusterMapFile = path.join(projectRoot, "Documentation/hindi-cluster-map.json");

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
let encodedRecords = 0;
let rawHindiRecords = 0;
for (const { document } of documents) {
  for (const change of document.Changes ?? []) {
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "hi-vnrevival" })) {
      throw new Error(`invalid Hindi language condition for ${change.Target}`);
    }
    for (const value of Object.values(change.Entries ?? {})) {
      if (typeof value !== "string") throw new Error(`non-string Hindi entry in ${change.Target}`);
      if (/[\uE000-\uF8FF]/u.test(value)) encodedRecords += 1;
      if (/[\u0900-\u097F\uA8E0-\uA8FF]/u.test(value)) rawHindiRecords += 1;
      values.push(value);
      records += 1;
    }
  }
}
if (files.length !== 151 || records !== 14720) {
  throw new Error(`unexpected Hindi coverage: files=${files.length}, records=${records}`);
}

if (encodedRecords) {
  if (rawHindiRecords) {
    throw new Error(`mixed raw and encoded Hindi patches: encoded=${encodedRecords}, raw=${rawHindiRecords}`);
  }
  if (!fs.existsSync(clusterMapFile)) throw new Error("encoded Hindi patches lack a cluster map");
  const existingDocument = readClusterDocument(clusterMapFile);
  const { decode } = mapsFromDocument(existingDocument);
  const decodedValues = values.map((value) => decodeHindi(value, decode));
  if (decodedValues.some((value) => /[\uE000-\uF8FF]/u.test(value))) {
    throw new Error("encoded Hindi patches contain glyphs absent from the cluster map");
  }
  const rebuiltDocument = buildClusterDocument(decodedValues);
  if (JSON.stringify(rebuiltDocument) !== JSON.stringify(existingDocument)) {
    throw new Error("encoded Hindi patches and cluster map are out of sync");
  }
  console.log(
    `Hindi patches are already encoded: ${records} records in ${files.length} files with ${existingDocument.entries.length} shaped clusters.`,
  );
  process.exit(0);
}

const clusterDocument = buildClusterDocument(values);
const { encode } = mapsFromDocument(clusterDocument);
for (const { file, document } of documents) {
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      change.Entries[key] = encodeHindi(value, encode);
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}
fs.writeFileSync(clusterMapFile, `${JSON.stringify(clusterDocument, null, 2)}\n`);
console.log(
  `Encoded ${records} Hindi records in ${files.length} files with ${clusterDocument.entries.length} shaped clusters.`,
);
