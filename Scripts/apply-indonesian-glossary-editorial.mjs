#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(root, "Documentation/glossary/glossary.id.json");
const overridesPath = path.join(root, "Documentation/indonesian-glossary-editorial-overrides.json");
const document = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));

if (!document.id || Object.keys(document.id).length !== 673) {
  throw new Error("Expected exactly 673 Indonesian glossary entries");
}

for (const [id, patch] of Object.entries(overrides)) {
  if (!document.id[id]) throw new Error(`Unknown Indonesian glossary ID: ${id}`);
  for (const [field, value] of Object.entries(patch)) {
    if (field !== "term" && field !== "meaning") {
      throw new Error(`Unsupported override field ${id}.${field}`);
    }
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`Empty override ${id}.${field}`);
    }
  }
  Object.assign(document.id[id], patch);
}

fs.writeFileSync(glossaryPath, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ${Object.keys(overrides).length} Indonesian glossary editorial override records.`);
