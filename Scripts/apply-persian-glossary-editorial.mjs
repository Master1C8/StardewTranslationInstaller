#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const glossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.fa.json");
const overridesPath = path.join(projectRoot, "Documentation/persian-glossary-editorial-overrides.json");

const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));

if (!glossary.fa || Object.keys(glossary.fa).length !== 673) {
  throw new Error("Expected exactly 673 Persian glossary entries.");
}

for (const [id, value] of Object.entries(overrides)) {
  if (!Object.hasOwn(glossary.fa, id)) throw new Error(`Unknown glossary id: ${id}`);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid Persian editorial override: ${id}`);
  }
  const fields = Object.keys(value);
  if (fields.length === 0 || fields.some((field) => !["term", "meaning"].includes(field))) {
    throw new Error(`Unsupported Persian editorial override field: ${id}`);
  }
  for (const field of fields) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      throw new Error(`Empty Persian editorial override field: ${id}.${field}`);
    }
  }
  glossary.fa[id] = { ...glossary.fa[id], ...value };
}

const output = `${JSON.stringify(glossary, null, 2)}\n`;
const previous = fs.readFileSync(glossaryPath, "utf8");
if (output !== previous) fs.writeFileSync(glossaryPath, output);

console.log(`Applied ${Object.keys(overrides).length} Persian glossary editorial overrides.`);
