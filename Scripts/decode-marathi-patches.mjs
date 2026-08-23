#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeMarathi,
  mapsFromDocument,
  readClusterDocument,
} from "./marathi-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/marathi",
);
const clusterMapFile = path.join(projectRoot, "Documentation/marathi-cluster-map.json");
const decode = mapsFromDocument(readClusterDocument(clusterMapFile)).decode;

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

let records = 0;
for (const relative of listJSONFiles(translationRoot).sort()) {
  const file = path.join(translationRoot, relative);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      change.Entries[key] = decodeMarathi(value, decode);
      records += 1;
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

if (records !== 14720) throw new Error(`unexpected Marathi coverage: ${records}`);
console.log(`Decoded ${records} Marathi records for editorial work.`);
