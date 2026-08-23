#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/repair-burmese-event-actors.mjs <English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/burmese",
);
const sourceCache = new Map();
const actorExpression = /(?:^|\/)addTemporaryActor\s+"(?:\\.|[^"\\])*"/g;

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sourceContent(target) {
  if (!sourceCache.has(target)) {
    sourceCache.set(target, readJSON(path.join(sourceRoot, `${target}.json`)).content);
  }
  return sourceCache.get(target);
}

let repaired = 0;
for (const fileName of fs.readdirSync(translationRoot).filter((file) => file.endsWith(".json"))) {
  const file = path.join(translationRoot, fileName);
  const document = readJSON(file);
  let changed = false;
  for (const change of document.Changes ?? []) {
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries ?? {})) {
      const original = source[key];
      if (typeof original !== "string" || typeof translated !== "string") continue;
      const expected = [...original.matchAll(actorExpression)].map((match) => match[0]);
      const actual = [...translated.matchAll(actorExpression)];
      if (!expected.length) continue;
      if (expected.length !== actual.length) {
        throw new Error(`Cannot align temporary actors: ${change.Target} :: ${key}`);
      }
      let result = translated;
      for (let index = actual.length - 1; index >= 0; index -= 1) {
        if (actual[index][0] === expected[index]) continue;
        result = result.slice(0, actual[index].index)
          + expected[index]
          + result.slice(actual[index].index + actual[index][0].length);
      }
      if (result !== translated) {
        change.Entries[key] = result;
        repaired += 1;
        changed = true;
      }
    }
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

console.log(JSON.stringify({ repaired }));
