#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const gameContentRoot = process.argv[2];
const outputRoot = process.argv[3];
if (!gameContentRoot || !outputRoot) {
  console.error(
    "Usage: node Scripts/prepare-english-xnb-input.mjs <game-content-dir> <output-dir>",
  );
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
);

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".json") ? [absolute] : [];
  });
}

const targets = new Set();
for (const file of listJSONFiles(translationRoot)) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const change of document.Changes ?? []) targets.add(change.Target);
}

let copied = 0;
for (const target of [...targets].sort()) {
  const source = path.join(path.resolve(gameContentRoot), `${target}.xnb`);
  const destination = path.join(path.resolve(outputRoot), `${target}.xnb`);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing English XNB: ${source}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  copied += 1;
}

console.log(`Copied ${copied} English XNB targets.`);
