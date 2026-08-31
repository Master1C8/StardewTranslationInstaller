#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildClusterDocument, decodeThai, encodeThai, mapsFromDocument } from "./thai-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/thai");
const clusterMapFile = path.join(projectRoot, "Documentation/thai-cluster-map.json");
const oldDecode = fs.existsSync(clusterMapFile) ? mapsFromDocument(JSON.parse(fs.readFileSync(clusterMapFile, "utf8"))).decode : new Map();
const files = fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort();
const documents = files.map((relative) => {
  const file = path.join(translationRoot, relative);
  return { file, document: JSON.parse(fs.readFileSync(file, "utf8")) };
});
const values = [];
let records = 0;
for (const { document } of documents) {
  for (const change of document.Changes ?? []) {
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "th-vnrevival" })) throw new Error(`invalid Thai language condition for ${change.Target}`);
    for (const value of Object.values(change.Entries ?? {})) {
      if (typeof value !== "string") throw new Error(`non-string Thai entry in ${change.Target}`);
      const decoded = decodeThai(value, oldDecode);
      for (const character of decoded) {
        const codepoint = character.codePointAt(0);
        if (codepoint >= 0xE000 && codepoint <= 0xF8FF) throw new Error(`unknown pre-existing PUA glyph U+${codepoint.toString(16)}`);
      }
      values.push(decoded.normalize("NFC"));
      records += 1;
    }
  }
}
if (files.length !== 151 || records !== 14720) throw new Error(`unexpected Thai coverage: files=${files.length}, records=${records}`);
const clusterDocument = buildClusterDocument(values);
const { encode } = mapsFromDocument(clusterDocument);
let valueIndex = 0;
for (const { file, document } of documents) {
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) change.Entries[key] = encodeThai(values[valueIndex++], encode);
  }
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}
fs.writeFileSync(clusterMapFile, `${JSON.stringify(clusterDocument, null, 2)}\n`);
console.log(`Encoded ${records} Thai records in ${files.length} files with ${clusterDocument.entries.length} shaped clusters.`);
