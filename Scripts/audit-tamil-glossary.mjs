#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const tamilPath = path.join(projectRoot, "Documentation/glossary/glossary.ta.json");
const overridesPath = path.join(
  projectRoot,
  "Documentation/tamil-glossary-editorial-overrides.json",
);

const english = JSON.parse(fs.readFileSync(englishPath, "utf8"));
const tamilDocument = JSON.parse(fs.readFileSync(tamilPath, "utf8"));
const overridesSource = fs.readFileSync(overridesPath, "utf8");
const overrides = JSON.parse(overridesSource);
const tamil = tamilDocument.ta;
const errors = [];
const warnings = [];

if (!Array.isArray(english)) errors.push("English glossary is not an array.");
if (!tamil || typeof tamil !== "object" || Array.isArray(tamil)) {
  errors.push("Tamil glossary does not contain a top-level ta object.");
}

const englishIds = Array.isArray(english) ? english.map((entry) => entry.id) : [];
const tamilIds = tamil ? Object.keys(tamil) : [];
if (englishIds.length !== 673) errors.push(`English entry count is ${englishIds.length}, expected 673.`);
if (tamilIds.length !== 673) errors.push(`Tamil entry count is ${tamilIds.length}, expected 673.`);
if (JSON.stringify(englishIds) !== JSON.stringify(tamilIds)) {
  errors.push("Tamil IDs or order differ from the English glossary.");
}
if (new Set(englishIds).size !== englishIds.length) errors.push("English glossary IDs are not unique.");

const overrideDeclarations = [...overridesSource.matchAll(/^  "([^"]+)": \{/gm)].map(
  (match) => match[1],
);
const duplicateOverrideIds = [...new Set(
  overrideDeclarations.filter((id, index) => overrideDeclarations.indexOf(id) !== index),
)];
if (duplicateOverrideIds.length) {
  errors.push(`Duplicate override IDs: ${duplicateOverrideIds.join(", ")}`);
}

let tamilScriptEntries = 0;
let englishProseEntries = 0;
for (const id of englishIds) {
  const value = tamil?.[id];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`Missing Tamil glossary entry: ${id}`);
    continue;
  }
  const fields = Object.keys(value);
  if (JSON.stringify(fields) !== JSON.stringify(["term", "meaning"])) {
    errors.push(`Unexpected fields or field order for ${id}: ${fields.join(", ")}`);
  }
  for (const field of ["term", "meaning"]) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      errors.push(`Empty Tamil ${field}: ${id}`);
    }
    if (value[field]?.includes("�")) errors.push(`Replacement character in ${id}.${field}`);
  }
  if (/\p{Script=Tamil}/u.test(`${value.term} ${value.meaning}`)) tamilScriptEntries += 1;
  if (/\b(?:the|and|with|from|used|player|game|item|where|that|this|when)\b/i.test(value.meaning)) {
    englishProseEntries += 1;
    warnings.push(`Possible English prose in meaning: ${id}`);
  }
}
if (tamilScriptEntries !== 673) {
  errors.push(`Only ${tamilScriptEntries} entries contain Tamil script, expected 673.`);
}

for (const [id, patch] of Object.entries(overrides)) {
  if (!Object.hasOwn(tamil ?? {}, id)) errors.push(`Unknown override ID: ${id}`);
  for (const [field, expected] of Object.entries(patch)) {
    if (tamil?.[id]?.[field] !== expected) errors.push(`Unapplied override: ${id}.${field}`);
  }
}

const report = {
  entries: tamilIds.length,
  idsInEnglishOrder: JSON.stringify(englishIds) === JSON.stringify(tamilIds),
  tamilScriptEntries,
  editorialOverrides: Object.keys(overrides).length,
  overrideDeclarations: overrideDeclarations.length,
  englishProseEntries,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length || warnings.length ? 1 : 0;
