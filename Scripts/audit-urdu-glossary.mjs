#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const urduPath = path.join(projectRoot, "Documentation/glossary/glossary.ur.json");
const overridesPath = path.join(projectRoot, "Documentation/urdu-glossary-editorial-overrides.json");
const errors = [];
const warnings = [];

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`invalid JSON: ${path.relative(projectRoot, file)}: ${error.message}`);
    return null;
  }
}

const english = readJSON(englishPath);
const urdu = readJSON(urduPath)?.ur;
const overrides = readJSON(overridesPath);

if (!Array.isArray(english) || english.length !== 673) {
  errors.push(`English glossary must contain 673 entries; found ${english?.length ?? "invalid"}`);
}
if (!urdu || Object.keys(urdu).length !== 673) {
  errors.push(`Urdu glossary must contain 673 entries; found ${Object.keys(urdu ?? {}).length}`);
}
if (!overrides || Object.keys(overrides).length !== 673) {
  errors.push(`Urdu editorial overrides must contain 673 entries; found ${Object.keys(overrides ?? {}).length}`);
}

const englishIds = (english ?? []).map((entry) => entry.id);
const urduIds = Object.keys(urdu ?? {});
const overrideIds = Object.keys(overrides ?? {});
if (JSON.stringify(urduIds) !== JSON.stringify(englishIds)) {
  errors.push("Urdu glossary ID set or order differs from the English glossary");
}
if (JSON.stringify(overrideIds) !== JSON.stringify(englishIds)) {
  errors.push("Urdu override ID set or order differs from the English glossary");
}

let urduScriptEntries = 0;
const allowedSourceIdenticalTerms = new Set(["vsync"]);
for (const entry of english ?? []) {
  const value = urdu?.[entry.id];
  const override = overrides?.[entry.id];
  if (!value?.term?.trim() || !value?.meaning?.trim()) {
    errors.push(`missing Urdu content: ${entry.id}`);
    continue;
  }
  if (JSON.stringify(value) !== JSON.stringify(override)) {
    errors.push(`applied glossary differs from editorial override: ${entry.id}`);
  }
  for (const [field, text] of Object.entries(value)) {
    if (text.includes("�")) errors.push(`replacement character: ${entry.id}.${field}`);
    if (/\p{C}/u.test(text)) errors.push(`control character: ${entry.id}.${field}`);
    if (text !== text.normalize("NFC")) errors.push(`non-NFC text: ${entry.id}.${field}`);
    if (/\s{2,}/u.test(text)) errors.push(`repeated whitespace: ${entry.id}.${field}`);
  }
  if (/\p{Script=Arabic}/u.test(`${value.term}${value.meaning}`)) urduScriptEntries += 1;
  if (
    (value.term === entry.term && !allowedSourceIdenticalTerms.has(entry.id))
    || value.meaning === entry.meaning
  ) {
    errors.push(`source-identical Urdu field: ${entry.id}`);
  }
}

if (urduScriptEntries !== 673) {
  errors.push(`Urdu script is absent from ${673 - urduScriptEntries} entries`);
}

console.log(JSON.stringify({
  entries: Object.keys(urdu ?? {}).length,
  overrides: Object.keys(overrides ?? {}).length,
  urduScriptEntries,
  errors: errors.length,
  warnings: warnings.length,
}, null, 2));
for (const error of errors) console.error(`ERROR ${error}`);
for (const warning of warnings) console.error(`WARNING ${warning}`);
if (errors.length || warnings.length) process.exit(1);
