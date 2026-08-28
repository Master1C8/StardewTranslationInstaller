#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { decodeBengali, mapsFromDocument, readClusterDocument } from "./bengali-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/bengali");
const decode = mapsFromDocument(readClusterDocument(path.join(projectRoot, "Documentation/bengali-cluster-map.json"))).decode;
let records = 0;
for (const relative of fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort()) {
  const file = path.join(translationRoot, relative);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const change of document.Changes ?? []) for (const [key, value] of Object.entries(change.Entries ?? {})) {
    change.Entries[key] = decodeBengali(value, decode);
    records += 1;
  }
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}
if (records !== 14720) throw new Error(`unexpected Bengali coverage: ${records}`);
console.log(`Decoded ${records} Bengali records for editorial work.`);
