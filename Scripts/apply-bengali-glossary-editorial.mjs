#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(root, "Documentation/glossary/glossary.bn.json");
const document = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overridePaths = [
  "Documentation/bengali-glossary-editorial-overrides.json",
  "Documentation/bengali-glossary-clean-pass-overrides.json",
  "Documentation/bengali-glossary-final-overrides.json",
  "Documentation/bengali-glossary-convergence-overrides.json",
].map((relative) => path.join(root, relative));

if (!document.bn || Object.keys(document.bn).length !== 673) {
  throw new Error("Expected exactly 673 Bengali glossary entries");
}

let overrideCount = 0;
for (const overridesPath of overridePaths) {
  const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
  for (const [id, patch] of Object.entries(overrides)) {
    if (!document.bn[id]) throw new Error(`Unknown Bengali glossary ID: ${id}`);
    for (const field of Object.keys(patch)) {
      if (field !== "term" && field !== "meaning") {
        throw new Error(`Unsupported override field ${id}.${field}`);
      }
      if (typeof patch[field] !== "string" || patch[field].trim() === "") {
        throw new Error(`Empty override ${id}.${field}`);
      }
    }
    Object.assign(document.bn[id], patch);
    overrideCount += 1;
  }
}

fs.writeFileSync(glossaryPath, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ${overrideCount} Bengali glossary editorial override records.`);
