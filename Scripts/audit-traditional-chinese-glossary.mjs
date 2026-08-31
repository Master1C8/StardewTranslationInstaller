#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const chinesePath = path.join(projectRoot, "Documentation/glossary/glossary.zh-TW.json");
const overridesPath = path.join(
  projectRoot,
  "Documentation/traditional-chinese-glossary-editorial-overrides.json",
);
const english = JSON.parse(fs.readFileSync(englishPath, "utf8"));
const chineseDocument = JSON.parse(fs.readFileSync(chinesePath, "utf8"));
const overrideSource = fs.readFileSync(overridesPath, "utf8");
const overrides = JSON.parse(overrideSource);
const chinese = chineseDocument["zh-TW"];
const errors = [];
const warnings = [];

if (!Array.isArray(english)) errors.push("English glossary is not an array.");
if (!chinese || typeof chinese !== "object" || Array.isArray(chinese)) {
  errors.push("Traditional Chinese glossary does not contain a top-level zh-TW object.");
}

const englishIds = Array.isArray(english) ? english.map((entry) => entry.id) : [];
const chineseIds = chinese ? Object.keys(chinese) : [];
if (englishIds.length !== 673) errors.push(`English entry count is ${englishIds.length}, expected 673.`);
if (chineseIds.length !== 673) errors.push(`Traditional Chinese entry count is ${chineseIds.length}, expected 673.`);
if (JSON.stringify(englishIds) !== JSON.stringify(chineseIds)) {
  errors.push("Traditional Chinese IDs or order differ from the English glossary.");
}
if (new Set(englishIds).size !== englishIds.length) {
  errors.push("English glossary IDs are not unique.");
}

const declarations = [...overrideSource.matchAll(/^  "([^"]+)": \{/gm)].map((match) => match[1]);
const duplicateDeclarations = [...new Set(
  declarations.filter((id, index) => declarations.indexOf(id) !== index),
)];
if (duplicateDeclarations.length) {
  errors.push(`Duplicate override IDs: ${duplicateDeclarations.join(", ")}`);
}

let hanEntries = 0;
let englishProseEntries = 0;
for (const id of englishIds) {
  const value = chinese?.[id];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`Missing Traditional Chinese glossary entry: ${id}`);
    continue;
  }
  const fields = Object.keys(value);
  if (JSON.stringify(fields) !== JSON.stringify(["term", "meaning"])) {
    errors.push(`Unexpected fields or field order for ${id}: ${fields.join(", ")}`);
  }
  for (const field of ["term", "meaning"]) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      errors.push(`Empty Traditional Chinese ${field}: ${id}`);
    }
    if (value[field]?.includes("�")) errors.push(`Replacement character in ${id}.${field}`);
  }
  const combined = `${value.term} ${value.meaning}`;
  if (/\p{Script=Han}/u.test(combined)) hanEntries += 1;
  if (/\b(?:the|and|with|from|used|player|game|item|where|that|this|when|for|into|while)\b/i.test(value.meaning)) {
    englishProseEntries += 1;
    warnings.push(`Possible English prose in meaning: ${id}`);
  }
}
if (hanEntries !== 673) {
  errors.push(`Only ${hanEntries} entries contain Han script, expected 673.`);
}

for (const [id, patch] of Object.entries(overrides)) {
  if (!Object.hasOwn(chinese ?? {}, id)) errors.push(`Unknown override ID: ${id}`);
  for (const [field, expected] of Object.entries(patch)) {
    if (chinese?.[id]?.[field] !== expected) errors.push(`Unapplied override: ${id}.${field}`);
  }
}

const report = {
  entries: chineseIds.length,
  idsInEnglishOrder: JSON.stringify(englishIds) === JSON.stringify(chineseIds),
  hanEntries,
  editorialOverrides: Object.keys(overrides).length,
  overrideDeclarations: declarations.length,
  englishProseEntries,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length || warnings.length ? 1 : 0;
