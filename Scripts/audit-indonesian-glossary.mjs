#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(root, "Documentation/glossary/glossary.en.json");
const indonesianPath = path.join(root, "Documentation/glossary/glossary.id.json");
const overridesPath = path.join(root, "Documentation/indonesian-glossary-editorial-overrides.json");

const english = JSON.parse(fs.readFileSync(englishPath, "utf8"));
const indonesianDocument = JSON.parse(fs.readFileSync(indonesianPath, "utf8"));
const indonesian = indonesianDocument.id;
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
const errors = [];
const warnings = [];

if (!Array.isArray(english) || english.length !== 673) {
  errors.push(`English glossary count is ${english?.length ?? "invalid"}, expected 673`);
}
if (!indonesian || Object.keys(indonesian).length !== 673) {
  errors.push(`Indonesian glossary count is ${Object.keys(indonesian ?? {}).length}, expected 673`);
}

const englishIDs = english.map((entry) => entry.id);
if (new Set(englishIDs).size !== englishIDs.length) errors.push("English glossary IDs are not unique");
if (JSON.stringify(Object.keys(indonesian ?? {})) !== JSON.stringify(englishIDs)) {
  errors.push("Indonesian glossary ID set or order differs from English");
}

for (const entry of english) {
  const translated = indonesian?.[entry.id];
  if (!translated) continue;
  for (const field of ["term", "meaning"]) {
    const value = translated[field];
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`Missing Indonesian ${field}: ${entry.id}`);
      continue;
    }
    if (value !== value.normalize("NFC")) errors.push(`Non-NFC Indonesian ${field}: ${entry.id}`);
    if (value !== value.trim()) errors.push(`Outer whitespace in Indonesian ${field}: ${entry.id}`);
    if (value.includes("�")) errors.push(`Replacement character in Indonesian ${field}: ${entry.id}`);
  }
}

for (const [id, patch] of Object.entries(overrides)) {
  if (!indonesian?.[id]) {
    errors.push(`Unknown editorial override ID: ${id}`);
    continue;
  }
  for (const [field, expected] of Object.entries(patch)) {
    if (indonesian[id][field] !== expected) errors.push(`Unapplied editorial override: ${id}.${field}`);
  }
}

const stalePatterns = [
  /\bnon-host\b/i,
  /\bfarmhand\b/i,
  /\bminigame\b/i,
  /\bdi-host\b/i,
  /\bTruffle\b/,
  /\bDressed Spinner\b/,
  /\bSquidFest\b/,
  /\bQueen of Sauce\b/,
  /\bProduk Artisan\b/,
  /\bhasil ramban\b/i,
  /\bPegunungan\b/,
  /\bTambang Terbuka\b/,
  /\bTelur Ikan Tua\b/,
  /\bPapannya\b/,
  /\bGuanya\b/,
  /\bGamepad\b/,
];
for (const [id, translated] of Object.entries(indonesian ?? {})) {
  for (const pattern of stalePatterns) {
    if (pattern.test(`${translated.term}\n${translated.meaning}`)) {
      errors.push(`Stale Indonesian glossary wording ${pattern}: ${id}`);
    }
  }
}

const exactTerms = {
  "stardew-valley": "Stardew Valley",
  "pelican-town": "Kota Pelican",
  "farm": "ladang / Ladang",
  "farmer-farmhand": "petani / pekerja ladang",
  "foraging-skill": "Meramu",
  "forage-item": "barang hasil meramu",
  "the-mountain": "Gunung",
  "quarry": "Kuari",
  "sewers": "Saluran Pembuangan",
  "coop": "Kandang Ayam",
  "barn": "Kandang Ternak",
  "artisan-good": "Produk Perajin",
  "perfection-waiver": "Surat Pengecualian Kesempurnaan",
  "the-forge-location": "Bengkel Tempa",
  "mini-forge": "Bengkel Tempa Mini",
};
for (const [id, expected] of Object.entries(exactTerms)) {
  if (indonesian?.[id]?.term !== expected) errors.push(`Canonical term mismatch: ${id}`);
}

for (const [id, translated] of Object.entries(indonesian ?? {})) {
  if (translated.meaning.includes("Pelican Town")) errors.push(`Untranslated canonical location in meaning: ${id}`);
  if (/kandidat nikah/i.test(translated.meaning) || /kandidat nikah/i.test(translated.term)) {
    errors.push(`Stale relationship wording: ${id}`);
  }
}

console.log(JSON.stringify({
  entries: Object.keys(indonesian ?? {}).length,
  overrides: Object.keys(overrides).length,
  errors: errors.length,
  warnings: warnings.length,
}, null, 2));
for (const error of errors) console.error(`ERROR: ${error}`);
for (const warning of warnings) console.warn(`WARNING: ${warning}`);
if (errors.length || warnings.length) process.exitCode = 1;
