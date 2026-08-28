#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.ta.json");
const overridesPath = path.join(
  projectRoot,
  "Documentation/tamil-glossary-editorial-overrides.json",
);

const document = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
const locale = document.ta;

if (!locale || typeof locale !== "object" || Array.isArray(locale)) {
  throw new Error("Tamil glossary must contain a top-level ta object.");
}

for (const [id, patch] of Object.entries(overrides)) {
  if (!Object.hasOwn(locale, id)) throw new Error(`Unknown Tamil glossary id: ${id}`);
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error(`Invalid Tamil glossary override: ${id}`);
  }
  for (const field of Object.keys(patch)) {
    if (field !== "term" && field !== "meaning") {
      throw new Error(`Unsupported Tamil glossary field ${field}: ${id}`);
    }
    if (typeof patch[field] !== "string" || !patch[field].trim()) {
      throw new Error(`Empty Tamil glossary ${field}: ${id}`);
    }
  }
  locale[id] = { ...locale[id], ...patch };
}

fs.writeFileSync(glossaryPath, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ${Object.keys(overrides).length} Tamil glossary editorial overrides.`);
