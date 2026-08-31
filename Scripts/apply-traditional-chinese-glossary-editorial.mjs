#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.zh-TW.json");
const overridesPath = path.join(
  projectRoot,
  "Documentation/traditional-chinese-glossary-editorial-overrides.json",
);
const document = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
const glossary = document["zh-TW"];

if (!glossary || typeof glossary !== "object" || Array.isArray(glossary)) {
  throw new Error("Traditional Chinese glossary document must contain an object at .zh-TW");
}

let applied = 0;
for (const [id, replacement] of Object.entries(overrides)) {
  if (!Object.hasOwn(glossary, id)) {
    throw new Error(`Unknown Traditional Chinese glossary id: ${id}`);
  }
  if (!replacement || typeof replacement !== "object" || Array.isArray(replacement)) {
    throw new Error(`Invalid Traditional Chinese glossary override: ${id}`);
  }
  for (const field of Object.keys(replacement)) {
    if (!new Set(["term", "meaning"]).has(field)) {
      throw new Error(`Unsupported Traditional Chinese glossary field ${id}.${field}`);
    }
  }
  for (const field of ["term", "meaning"]) {
    if (!Object.hasOwn(replacement, field)) continue;
    if (typeof replacement[field] !== "string" || !replacement[field].trim()) {
      throw new Error(`Empty Traditional Chinese glossary value: ${id}.${field}`);
    }
    glossary[id][field] = replacement[field];
  }
  applied += 1;
}

fs.writeFileSync(glossaryPath, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ${applied} Traditional Chinese glossary editorial override records.`);
