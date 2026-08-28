#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(root, "Documentation/glossary/glossary.en.json");
const bengaliPath = path.join(root, "Documentation/glossary/glossary.bn.json");
const overridePaths = [
  "Documentation/bengali-glossary-editorial-overrides.json",
  "Documentation/bengali-glossary-clean-pass-overrides.json",
  "Documentation/bengali-glossary-final-overrides.json",
  "Documentation/bengali-glossary-convergence-overrides.json",
].map((relative) => path.join(root, relative));

const english = JSON.parse(fs.readFileSync(englishPath, "utf8"));
const bengaliDocument = JSON.parse(fs.readFileSync(bengaliPath, "utf8"));
const bengali = bengaliDocument.bn;
const errors = [];
const warnings = [];

if (!Array.isArray(english)) errors.push("English glossary is not an array.");
if (!bengali || typeof bengali !== "object" || Array.isArray(bengali)) {
  errors.push("Bengali glossary does not contain a top-level bn object.");
}

const englishIds = Array.isArray(english) ? english.map((entry) => entry.id) : [];
const bengaliIds = bengali ? Object.keys(bengali) : [];
if (englishIds.length !== 673) errors.push(`English entry count is ${englishIds.length}, expected 673.`);
if (bengaliIds.length !== 673) errors.push(`Bengali entry count is ${bengaliIds.length}, expected 673.`);
if (JSON.stringify(englishIds) !== JSON.stringify(bengaliIds)) {
  errors.push("Bengali IDs or order differ from the English glossary.");
}
if (new Set(englishIds).size !== englishIds.length) errors.push("English glossary IDs are not unique.");

let banglaScriptEntries = 0;
for (const id of englishIds) {
  const value = bengali?.[id];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`Missing Bengali glossary entry: ${id}`);
    continue;
  }
  const fields = Object.keys(value);
  if (JSON.stringify(fields) !== JSON.stringify(["term", "meaning"])) {
    errors.push(`Unexpected fields or field order for ${id}: ${fields.join(", ")}`);
  }
  for (const field of ["term", "meaning"]) {
    const text = value[field];
    if (typeof text !== "string" || !text.trim()) errors.push(`Empty Bengali ${field}: ${id}`);
    if (text?.includes("�")) errors.push(`Replacement character in ${id}.${field}`);
    if (text !== text?.normalize("NFC")) errors.push(`Non-NFC Bengali text: ${id}.${field}`);
    if (/\s{2,}/u.test(text ?? "")) warnings.push(`Repeated whitespace: ${id}.${field}`);
  }
  if (!/[।!?…]$/u.test(value.meaning)) warnings.push(`Meaning lacks terminal punctuation: ${id}`);
  if (/\p{Script=Bengali}/u.test(`${value.term} ${value.meaning}`)) banglaScriptEntries += 1;
}
if (banglaScriptEntries !== 673) {
  errors.push(`Only ${banglaScriptEntries} entries contain Bengali script, expected 673.`);
}

const generated = structuredClone(bengaliDocument);
let overrideRecords = 0;
for (const overridePath of overridePaths) {
  const source = fs.readFileSync(overridePath, "utf8");
  const overrides = JSON.parse(source);
  const declarations = [...source.matchAll(/^  "([^"]+)": \{/gm)].map((match) => match[1]);
  const duplicateIds = [...new Set(
    declarations.filter((id, index) => declarations.indexOf(id) !== index),
  )];
  if (duplicateIds.length) errors.push(`Duplicate overrides in ${path.basename(overridePath)}: ${duplicateIds.join(", ")}`);
  for (const [id, patch] of Object.entries(overrides)) {
    if (!Object.hasOwn(bengali ?? {}, id)) {
      errors.push(`Unknown override ID in ${path.basename(overridePath)}: ${id}`);
      continue;
    }
    for (const field of Object.keys(patch)) {
      if (field !== "term" && field !== "meaning") errors.push(`Unsupported override field: ${id}.${field}`);
    }
    Object.assign(generated.bn[id], patch);
    overrideRecords += 1;
  }
}
if (JSON.stringify(generated) !== JSON.stringify(bengaliDocument)) {
  errors.push("Reapplying the editorial override stack changes the Bengali glossary.");
}

const forbiddenFragments = [
  "মাছধরা",
  "মেয়রের প্রাসাদ",
  "পুনর্মিশ্রিত",
  "ম্যাগনিফাইং গ্লাস",
  "চিবোতে ভালো",
  "র‍্যান্ডম",
  "আঘাতস্থান",
  "UI মাপ",
];
const serializedBengali = JSON.stringify(bengali);
for (const fragment of forbiddenFragments) {
  if (serializedBengali.includes(fragment)) errors.push(`Rejected glossary fragment remains: ${fragment}`);
}

const report = {
  entries: bengaliIds.length,
  idsInEnglishOrder: JSON.stringify(englishIds) === JSON.stringify(bengaliIds),
  bengaliScriptEntries: banglaScriptEntries,
  editorialOverrideRecords: overrideRecords,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length || warnings.length ? 1 : 0;
