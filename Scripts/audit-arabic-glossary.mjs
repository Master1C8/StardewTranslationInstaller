#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const arabicPath = path.join(projectRoot, "Documentation/glossary/glossary.ar.json");
const publicArgument = process.argv.find((argument) => argument.startsWith("--public="));
const publicPath = publicArgument ? path.resolve(publicArgument.slice("--public=".length)) : null;
const errors = [];
const warnings = [];

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`invalid JSON: ${file}: ${error.message}`);
    return null;
  }
}

const english = readJSON(englishPath);
const arabic = readJSON(arabicPath)?.ar;
const expectedIds = Array.isArray(english) ? english.map((entry) => entry.id) : [];
const actualIds = arabic && typeof arabic === "object" ? Object.keys(arabic) : [];

if (expectedIds.length !== 673) errors.push(`English glossary has ${expectedIds.length} entries, expected 673`);
if (actualIds.length !== 673) errors.push(`Arabic glossary has ${actualIds.length} entries, expected 673`);
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) errors.push("Arabic glossary ID/order mismatch");

// Latin text is allowed only where the glossary explicitly documents an English
// source spelling, network acronym, currency suffix, or fixed in-game brand.
const latinAllowed = new Set([
  "farm",
  "fall",
  "fishing-rod-pole",
  "wizard-rasmodius",
  "mr-qi",
  "gold-currency",
  "bath-house",
  "join-lan-game",
  "enter-ip",
  "online-local-communication",
  "speed-gro",
  "pet",
  "training-bamboo-fiberglass-iridium-rod",
  "mine-floor",
  "bait-types",
]);
const latinOnlyTermAllowed = new Set(["speed-gro"]);

for (const entry of english ?? []) {
  const translated = arabic?.[entry.id];
  if (!translated || typeof translated.term !== "string" || typeof translated.meaning !== "string") {
    errors.push(`missing Arabic entry: ${entry.id}`);
    continue;
  }
  for (const field of ["term", "meaning"]) {
    const value = translated[field];
    if (!value.trim()) errors.push(`empty Arabic ${field}: ${entry.id}`);
    if (value.includes("�")) errors.push(`replacement character in Arabic ${field}: ${entry.id}`);
    if (value !== value.normalize("NFC")) errors.push(`non-NFC Arabic ${field}: ${entry.id}`);
    if (
      !/[\u0600-\u06FF]/u.test(value)
      && !(field === "term" && latinOnlyTermAllowed.has(entry.id))
    ) errors.push(`Arabic ${field} lacks Arabic script: ${entry.id}`);
    if (/[A-Za-z]/.test(value) && !latinAllowed.has(entry.id)) {
      errors.push(`unjustified Latin text in Arabic ${field}: ${entry.id}`);
    }
  }
}

let publicDiffs = null;
if (publicPath) {
  const publicDocument = readJSON(publicPath);
  const publicEntries = publicDocument?.entries;
  if (!Array.isArray(publicEntries) || publicDocument?.total !== 673 || publicEntries.length !== 673) {
    errors.push("public Arabic glossary snapshot is not a complete 673-entry export");
  } else {
    const publicIds = publicEntries.map((entry) => entry.id);
    if (JSON.stringify(publicIds) !== JSON.stringify(expectedIds)) {
      errors.push("public Arabic glossary ID/order mismatch");
    }
    publicDiffs = publicEntries.filter((entry) => (
      JSON.stringify(entry.translation) !== JSON.stringify(arabic?.[entry.id])
    )).length;
  }
}

const report = {
  locale: "ar",
  englishRecords: expectedIds.length,
  glossaryRecords: actualIds.length,
  publicDiffs,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
