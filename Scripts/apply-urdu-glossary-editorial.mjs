#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.ur.json");
const overridesPath = path.join(projectRoot, "Documentation/urdu-glossary-editorial-overrides.json");

const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));

if (!glossary.ur || Object.keys(glossary.ur).length !== 673) {
  throw new Error("Expected exactly 673 Urdu glossary entries.");
}

for (const [id, value] of Object.entries(overrides)) {
  if (!Object.hasOwn(glossary.ur, id)) throw new Error(`Unknown glossary id: ${id}`);
  if (!value?.term?.trim() || !value?.meaning?.trim()) {
    throw new Error(`Incomplete Urdu editorial override: ${id}`);
  }
  glossary.ur[id] = { term: value.term, meaning: value.meaning };
}

const output = `${JSON.stringify(glossary, null, 2)}\n`;
const previous = fs.readFileSync(glossaryPath, "utf8");
if (output !== previous) fs.writeFileSync(glossaryPath, output);

console.log(`Applied ${Object.keys(overrides).length} Urdu glossary editorial overrides.`);
