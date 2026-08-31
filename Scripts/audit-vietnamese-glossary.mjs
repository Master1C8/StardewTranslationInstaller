#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(root, "Documentation/glossary/glossary.en.json");
const vietnamesePath = path.join(root, "Documentation/glossary/glossary.vi.json");
const overridesPath = path.join(root, "Documentation/vietnamese-glossary-editorial-overrides.json");
const endpointPath = process.argv.find((argument) => argument.startsWith("--endpoint="))
  ?.slice("--endpoint=".length);

const english = JSON.parse(fs.readFileSync(englishPath, "utf8"));
const vietnameseDocument = JSON.parse(fs.readFileSync(vietnamesePath, "utf8"));
const vietnamese = vietnameseDocument.vi;
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
const errors = [];
const warnings = [];

if (!Array.isArray(english) || english.length !== 673) {
  errors.push(`English glossary count is ${english?.length ?? "invalid"}, expected 673`);
}
if (!vietnamese || Object.keys(vietnamese).length !== 673) {
  errors.push(`Vietnamese glossary count is ${Object.keys(vietnamese ?? {}).length}, expected 673`);
}

const englishIDs = english.map((entry) => entry.id);
if (new Set(englishIDs).size !== englishIDs.length) errors.push("English glossary IDs are not unique");
if (JSON.stringify(Object.keys(vietnamese ?? {})) !== JSON.stringify(englishIDs)) {
  errors.push("Vietnamese glossary ID set or order differs from English");
}

for (const entry of english) {
  const translated = vietnamese?.[entry.id];
  if (!translated) continue;
  for (const field of ["term", "meaning"]) {
    const value = translated[field];
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`Missing Vietnamese ${field}: ${entry.id}`);
      continue;
    }
    if (value !== value.normalize("NFC")) errors.push(`Non-NFC Vietnamese ${field}: ${entry.id}`);
    if (value !== value.trim()) errors.push(`Outer whitespace in Vietnamese ${field}: ${entry.id}`);
    if (value.includes("�")) errors.push(`Replacement character in Vietnamese ${field}: ${entry.id}`);
  }
}

for (const [id, patch] of Object.entries(overrides)) {
  if (!vietnamese?.[id]) {
    errors.push(`Unknown editorial override ID: ${id}`);
    continue;
  }
  for (const [field, expected] of Object.entries(patch)) {
    if (vietnamese[id][field] !== expected) errors.push(`Unapplied editorial override: ${id}.${field}`);
  }
}

const stalePatterns = [
  /người làm thuê/i,
  /trò nhỏ/i,
  /Thùng Gửi bán/,
  /Nhà nông trại/,
  /Chuồng nhỏ(?: |$)/,
  /Chuồng lớn(?: |$)/,
  /Hốc tinh thể/,
  /Máy hun cá/,
  /Cá Hun/,
  /Giấy Miễn Hoàn mỹ/,
  /Qi Bí ẩn/,
  /Thoát ra Máy tính/,
  /giai đoạn lớn/,
  /thời gian lớn/,
  /lời chúc ngẫu nhiên/,
  /Mực Phép/,
];
for (const [id, translated] of Object.entries(vietnamese ?? {})) {
  for (const pattern of stalePatterns) {
    if (pattern.test(`${translated.term}\n${translated.meaning}`)) {
      errors.push(`Stale Vietnamese glossary wording ${pattern}: ${id}`);
    }
  }
}

const exactTerms = {
  "stardew-valley": "Thung lũng Stardew",
  "pelican-town": "Thị trấn Pelican",
  "farmer-farmhand": "nông dân / người chơi phụ",
  "grandpa": "Ông",
  "coop": "Chuồng gia cầm",
  "barn": "Chuồng gia súc",
  "shipping-bin": "Thùng giao hàng",
  "farmhouse": "Nhà ở nông trại",
  "fish-smoker": "Lò hun cá",
  "fish-smoked-fish": "Cá hun khói",
  "perfection-waiver": "Giấy miễn trừ Hoàn mỹ",
};
for (const [id, expected] of Object.entries(exactTerms)) {
  if (vietnamese?.[id]?.term !== expected) errors.push(`Canonical term mismatch: ${id}`);
}

for (const [id, translated] of Object.entries(vietnamese ?? {})) {
  if (/\b(?:The|and|with|from|for|your|you|this|that|fish|farm|festival|bundle)\b/i.test(
    `${translated.term}\n${translated.meaning}`,
  )) warnings.push(`Possible English residue: ${id}`);
  if (translated.meaning.includes("ở Pelican") || translated.meaning.includes("tới Pelican")) {
    errors.push(`Shortened canonical Pelican Town in meaning: ${id}`);
  }
}

if (endpointPath) {
  const endpoint = JSON.parse(fs.readFileSync(path.resolve(endpointPath), "utf8"));
  const endpointIDs = endpoint.entries?.map((entry) => entry.id) ?? [];
  if (endpoint.total !== 673 || endpointIDs.length !== 673) {
    errors.push(`Endpoint glossary count is total=${endpoint.total}, entries=${endpointIDs.length}`);
  }
  if (JSON.stringify(endpointIDs) !== JSON.stringify(englishIDs)) {
    errors.push("Endpoint stable ID set or order differs from English");
  }
}

console.log(JSON.stringify({
  entries: Object.keys(vietnamese ?? {}).length,
  overrides: Object.keys(overrides).length,
  errors: errors.length,
  warnings: warnings.length,
}, null, 2));
for (const error of errors) console.error(`ERROR: ${error}`);
for (const warning of warnings) console.warn(`WARNING: ${warning}`);
if (errors.length || warnings.length) process.exitCode = 1;
