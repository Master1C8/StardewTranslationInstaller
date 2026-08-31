#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const english = JSON.parse(fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.en.json"), "utf8"));
const thaiDocument = JSON.parse(fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.th.json"), "utf8"));
const overrides = JSON.parse(fs.readFileSync(path.join(projectRoot, "Documentation/thai-glossary-editorial-overrides.json"), "utf8"));
const thai = thaiDocument.th;
const errors = [];
const warnings = [];

if (!Array.isArray(english) || english.length !== 673) errors.push(`English glossary count is ${english?.length ?? "invalid"}, expected 673`);
if (!thai || typeof thai !== "object" || Array.isArray(thai)) errors.push("Thai glossary layer is invalid");

const englishIds = english.map((entry) => entry.id);
const thaiIds = Object.keys(thai ?? {});
if (JSON.stringify(englishIds) !== JSON.stringify(thaiIds)) errors.push("Thai glossary ID set or order differs from English");

for (const entry of english) {
  const translation = thai?.[entry.id];
  if (!translation || typeof translation.term !== "string" || !translation.term.trim()) {
    errors.push(`Missing Thai term: ${entry.id}`);
    continue;
  }
  if (typeof translation.meaning !== "string" || !translation.meaning.trim()) {
    errors.push(`Missing Thai meaning: ${entry.id}`);
    continue;
  }
  if (!/[\u0E00-\u0E7F]/u.test(translation.meaning)) warnings.push(`Meaning has no Thai script: ${entry.id}`);
}

for (const [id, replacement] of Object.entries(overrides)) {
  if (!Object.hasOwn(thai ?? {}, id)) {
    errors.push(`Override references unknown ID: ${id}`);
    continue;
  }
  for (const [field, expected] of Object.entries(replacement)) {
    if (thai[id][field] !== expected) errors.push(`Applied glossary differs from override: ${id}.${field}`);
  }
}

console.log(JSON.stringify({
  entries: thaiIds.length,
  overrides: Object.keys(overrides).length,
  errors: errors.length,
  warnings: warnings.length,
}, null, 2));
for (const error of errors) console.error(`ERROR ${error}`);
for (const warning of warnings) console.error(`WARNING ${warning}`);
if (errors.length || warnings.length) process.exitCode = 1;
