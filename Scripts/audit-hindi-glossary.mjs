#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const hindiPath = path.join(projectRoot, "Documentation/glossary/glossary.hi.json");
const english = JSON.parse(fs.readFileSync(englishPath, "utf8"));
const hindiDocument = JSON.parse(fs.readFileSync(hindiPath, "utf8"));
const overridePaths = [
  "Documentation/hindi-glossary-editorial-overrides.json",
  "Documentation/hindi-glossary-editorial-pass3.json",
].map((relative) => path.join(projectRoot, relative));
const overrideLayers = overridePaths.map((file) => ({
  source: fs.readFileSync(file, "utf8"),
  values: JSON.parse(fs.readFileSync(file, "utf8")),
}));
const overrides = {};
for (const layer of overrideLayers) {
  for (const [id, patch] of Object.entries(layer.values)) {
    overrides[id] = { ...(overrides[id] ?? {}), ...patch };
  }
}
const hindi = hindiDocument.hi;
const errors = [];
const warnings = [];

if (!Array.isArray(english)) errors.push("English glossary is not an array.");
if (!hindi || typeof hindi !== "object" || Array.isArray(hindi)) {
  errors.push("Hindi glossary does not contain a top-level hi object.");
}

const englishIds = Array.isArray(english) ? english.map((entry) => entry.id) : [];
const hindiIds = hindi ? Object.keys(hindi) : [];
if (englishIds.length !== 673) errors.push(`English entry count is ${englishIds.length}, expected 673.`);
if (hindiIds.length !== 673) errors.push(`Hindi entry count is ${hindiIds.length}, expected 673.`);
if (JSON.stringify(englishIds) !== JSON.stringify(hindiIds)) {
  errors.push("Hindi IDs or order differ from the English glossary.");
}
if (new Set(englishIds).size !== englishIds.length) errors.push("English glossary IDs are not unique.");

let overrideDeclarations = 0;
for (const layer of overrideLayers) {
  const declarations = [...layer.source.matchAll(/^  "([^"]+)": \{/gm)].map((match) => match[1]);
  overrideDeclarations += declarations.length;
  const duplicates = [...new Set(
    declarations.filter((id, index) => declarations.indexOf(id) !== index),
  )];
  if (duplicates.length) errors.push(`Duplicate override IDs in one layer: ${duplicates.join(", ")}`);
}

let hindiScriptEntries = 0;
let englishProseEntries = 0;
let foreignIndicEntries = 0;
for (const id of englishIds) {
  const value = hindi?.[id];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`Missing Hindi glossary entry: ${id}`);
    continue;
  }
  const fields = Object.keys(value);
  if (JSON.stringify(fields) !== JSON.stringify(["term", "meaning"])) {
    errors.push(`Unexpected fields or field order for ${id}: ${fields.join(", ")}`);
  }
  for (const field of ["term", "meaning"]) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      errors.push(`Empty Hindi ${field}: ${id}`);
    }
    if (value[field]?.includes("�")) errors.push(`Replacement character in ${id}.${field}`);
  }
  const combined = `${value.term} ${value.meaning}`;
  if (/\p{Script=Devanagari}/u.test(combined)) hindiScriptEntries += 1;
  if (/[\u0980-\u0DFF]/u.test(combined)) {
    foreignIndicEntries += 1;
    errors.push(`Non-Hindi Indic script in ${id}`);
  }
  if (/\b(?:the|and|with|from|used|player|game|item|where|that|this|when|for|into|while)\b/i.test(value.meaning)) {
    englishProseEntries += 1;
    warnings.push(`Possible English prose in meaning: ${id}`);
  }
}
if (hindiScriptEntries !== 673) {
  errors.push(`Only ${hindiScriptEntries} entries contain Devanagari, expected 673.`);
}

for (const [id, patch] of Object.entries(overrides)) {
  if (!Object.hasOwn(hindi ?? {}, id)) errors.push(`Unknown override ID: ${id}`);
  for (const [field, expected] of Object.entries(patch)) {
    if (hindi?.[id]?.[field] !== expected) errors.push(`Unapplied override: ${id}.${field}`);
  }
}

const report = {
  entries: hindiIds.length,
  idsInEnglishOrder: JSON.stringify(englishIds) === JSON.stringify(hindiIds),
  hindiScriptEntries,
  foreignIndicEntries,
  editorialOverrides: Object.keys(overrides).length,
  overrideDeclarations,
  englishProseEntries,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length || warnings.length ? 1 : 0;
