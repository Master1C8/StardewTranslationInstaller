#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2).map((value) => path.resolve(value));
if (!files.length) {
  throw new Error("Pass one or more Marathi cache JSON files.");
}

function normalizeTerminalPunctuation(source, translated) {
  if (typeof translated !== "string") return translated;
  const leading = translated.match(/^\s*/u)?.[0] ?? "";
  const trailing = translated.match(/\s*$/u)?.[0] ?? "";
  const sourceCore = source.trim();
  const sourcePunctuation = sourceCore.match(/[.!?…।:;]+$/u)?.[0] ?? "";
  const translatedCore = translated
    .trim()
    .replace(/<{2,}\s*([^<>\n]+?)\s*>{2,}/gu, "$1")
    .replace(/[.!?…।]{8,}/gu, "...")
    .replace(/[.!?…।:;]+$/u, "")
    .trimEnd();
  return `${leading}${translatedCore}${sourcePunctuation}${trailing}`;
}

for (const file of files) {
  const cache = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = 0;
  for (const [cacheKey, translated] of Object.entries(cache)) {
    let source = cacheKey;
    try {
      const structuredKey = JSON.parse(cacheKey);
      if (typeof structuredKey?.text === "string") source = structuredKey.text;
    } catch {
      // Plain record and fragment cache keys are the English source itself.
    }
    const normalized = normalizeTerminalPunctuation(source, translated);
    if (normalized !== translated) {
      cache[cacheKey] = normalized;
      changed += 1;
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(cache, null, 2)}\n`);
  console.log(`${path.basename(file)}: normalized ${changed}/${Object.keys(cache).length} entries.`);
}
