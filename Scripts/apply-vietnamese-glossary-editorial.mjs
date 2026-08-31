#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(root, "Documentation/glossary/glossary.vi.json");
const overridesPath = path.join(root, "Documentation/vietnamese-glossary-editorial-overrides.json");
const document = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));

if (!document.vi || Object.keys(document.vi).length !== 673) {
  throw new Error("Expected exactly 673 Vietnamese glossary entries");
}

for (const [id, patch] of Object.entries(overrides)) {
  if (!document.vi[id]) throw new Error(`Unknown Vietnamese glossary ID: ${id}`);
  for (const [field, value] of Object.entries(patch)) {
    if (field !== "term" && field !== "meaning") {
      throw new Error(`Unsupported override field ${id}.${field}`);
    }
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`Empty override ${id}.${field}`);
    }
  }
  Object.assign(document.vi[id], patch);
}

fs.writeFileSync(glossaryPath, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ${Object.keys(overrides).length} Vietnamese glossary editorial override records.`);
