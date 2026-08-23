#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeBurmese,
  mapsFromDocument,
  readClusterDocument,
} from "./burmese-clusters.mjs";

const root = path.resolve(import.meta.dirname, "..");
const target = process.argv[2];
if (!target) throw new Error("Usage: dump-burmese-target.mjs <target>");
const keyPattern = process.argv[3] ? new RegExp(process.argv[3]) : null;

const manifest = JSON.parse(fs.readFileSync(path.join(root, "ml-scaffold-manifest.json"), "utf8"));
const english = new Map(
  manifest.rows
    .filter((row) => row.target === target)
    .map((row) => [row.key, row.englishValue]),
);
const { decode } = mapsFromDocument(
  readClusterDocument(path.join(root, "Documentation/burmese-cluster-map.json")),
);
const translationRoot = path.join(
  root,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/burmese",
);

for (const name of fs.readdirSync(translationRoot).filter((entry) => entry.endsWith(".json"))) {
  const document = JSON.parse(fs.readFileSync(path.join(translationRoot, name), "utf8"));
  for (const change of document.Changes ?? []) {
    if (change.Target !== target) continue;
    for (const [key, encoded] of Object.entries(change.Entries ?? {})) {
      if (keyPattern && !keyPattern.test(key)) continue;
      console.log(`KEY: ${key}`);
      console.log(`EN: ${english.get(key) ?? "<missing>"}`);
      console.log(`MY: ${decodeBurmese(encoded, decode)}`);
      console.log();
    }
  }
}
