#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const fragmentFile = path.resolve(
  process.env.BURMESE_FRAGMENT_CACHE_FILE
    || path.join(projectRoot, "../burmese-fragment-cache.json"),
);
const recordFile = path.resolve(
  process.env.BURMESE_CACHE_FILE
    || path.join(projectRoot, "../burmese-translation-cache.json"),
);
const inputFile = path.resolve(
  process.env.BURMESE_LOCAL_INPUT_FILE
    || path.join(projectRoot, "../burmese-local-input.json"),
);

const fragments = JSON.parse(fs.readFileSync(fragmentFile, "utf8"));
const job = JSON.parse(fs.readFileSync(inputFile, "utf8"));
const technicalCharacters = ["#", "@", "^", "|", "_", "$", "%", "\\"];
let sanitized = 0;

for (const [source, translated] of Object.entries(fragments)) {
  let result = translated;
  for (const character of technicalCharacters) {
    const sourceCount = [...source].filter((value) => value === character).length;
    let translatedCount = [...result].filter((value) => value === character).length;
    while (translatedCount > sourceCount) {
      const index = result.lastIndexOf(character);
      result = result.slice(0, index) + result.slice(index + character.length);
      translatedCount -= 1;
    }
  }
  if (result !== translated) {
    fragments[source] = result;
    sanitized += 1;
  }
}

const cache = {};
for (const item of job.items) {
  const pieces = [];
  let complete = true;
  for (const part of item.parts) {
    if (part.literal !== undefined) pieces.push(part.literal);
    else if (Object.hasOwn(fragments, part.text)) pieces.push(fragments[part.text]);
    else complete = false;
  }
  if (complete) cache[item.source] = pieces.join("");
}

fs.writeFileSync(fragmentFile, `${JSON.stringify(fragments, null, 2)}\n`);
fs.writeFileSync(recordFile, `${JSON.stringify(cache, null, 2)}\n`);
console.log(JSON.stringify({ sanitizedFragments: sanitized, cachedRecords: Object.keys(cache).length }));
