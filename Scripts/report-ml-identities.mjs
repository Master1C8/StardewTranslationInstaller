#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cache = JSON.parse(fs.readFileSync(path.join(root, "ml-translation-cache.json"), "utf8")).entries;
const rows = Object.entries(cache)
  .filter(([, entry]) => entry.translation === entry.englishValue)
  .map(([id, entry]) => ({ id, target: entry.target, key: entry.key, value: entry.englishValue }));

const output = path.join(root, "ml-identity-report.json");
fs.writeFileSync(output, `${JSON.stringify(rows, null, 2)}\n`);
console.log(JSON.stringify({ count: rows.length, output }, null, 2));
