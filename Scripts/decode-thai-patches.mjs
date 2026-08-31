#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { decodeThai, mapsFromDocument, readClusterDocument } from "./thai-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/thai");
const decode = mapsFromDocument(readClusterDocument(path.join(projectRoot, "Documentation/thai-cluster-map.json"))).decode;
let records = 0;
for (const relative of fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort()) {
  const file = path.join(translationRoot, relative);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const change of document.Changes ?? []) for (const [key, value] of Object.entries(change.Entries ?? {})) {
    change.Entries[key] = decodeThai(value, decode);
    records += 1;
  }
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}
if (records !== 14720) throw new Error(`unexpected Thai coverage: ${records}`);
console.log(`Decoded ${records} Thai records for editorial work.`);
