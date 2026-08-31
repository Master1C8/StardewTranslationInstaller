#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.th.json");
const overridesPath = path.join(projectRoot, "Documentation/thai-glossary-editorial-overrides.json");

const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));

if (!glossary.th || typeof glossary.th !== "object") {
  throw new Error("Thai glossary layer is missing");
}

let fieldsChanged = 0;
for (const [id, replacement] of Object.entries(overrides)) {
  if (!Object.hasOwn(glossary.th, id)) throw new Error(`Unknown Thai glossary ID: ${id}`);
  for (const field of ["term", "meaning"]) {
    if (!Object.hasOwn(replacement, field)) continue;
    if (typeof replacement[field] !== "string" || replacement[field].trim() === "") {
      throw new Error(`Invalid Thai glossary override: ${id}.${field}`);
    }
    if (glossary.th[id][field] !== replacement[field]) fieldsChanged += 1;
    glossary.th[id][field] = replacement[field];
  }
}

fs.writeFileSync(glossaryPath, `${JSON.stringify(glossary, null, 2)}\n`);
console.log(`Applied ${Object.keys(overrides).length} Thai glossary overrides; ${fieldsChanged} fields changed.`);
