#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.hi.json");
const document = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overridePaths = [
  "Documentation/hindi-glossary-editorial-overrides.json",
  "Documentation/hindi-glossary-editorial-pass3.json",
].map((relative) => path.join(projectRoot, relative));
const glossary = document.hi;

if (!glossary || typeof glossary !== "object" || Array.isArray(glossary)) {
  throw new Error("Hindi glossary document must contain an object at .hi");
}

let applied = 0;
for (const overridesPath of overridePaths) {
  const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
  for (const [id, replacement] of Object.entries(overrides)) {
    if (!Object.hasOwn(glossary, id)) throw new Error(`Unknown Hindi glossary id: ${id}`);
    if (!replacement || typeof replacement !== "object" || Array.isArray(replacement)) {
      throw new Error(`Invalid Hindi glossary override: ${id}`);
    }
    for (const field of Object.keys(replacement)) {
      if (!new Set(["term", "meaning"]).has(field)) {
        throw new Error(`Unsupported Hindi glossary field ${id}.${field}`);
      }
    }
    for (const field of ["term", "meaning"]) {
      if (Object.hasOwn(replacement, field)) {
        if (typeof replacement[field] !== "string" || !replacement[field].trim()) {
          throw new Error(`Empty Hindi glossary value: ${id}.${field}`);
        }
        glossary[id][field] = replacement[field];
      }
    }
    applied += 1;
  }
}

fs.writeFileSync(glossaryPath, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ${applied} Hindi glossary editorial override records.`);
