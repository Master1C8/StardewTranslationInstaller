#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const persianPath = path.join(projectRoot, "Documentation/glossary/glossary.fa.json");
const overridesPath = path.join(projectRoot, "Documentation/persian-glossary-editorial-overrides.json");
const errors = [];
const warnings = [];

function duplicateJSONKeys(text) {
  let offset = 0;
  const duplicates = [];
  const skip = () => { while (/\s/u.test(text[offset] ?? "")) offset += 1; };
  const string = () => {
    const start = offset++;
    while (offset < text.length) {
      if (text[offset] === "\\") offset += 2;
      else if (text[offset++] === '"') return JSON.parse(text.slice(start, offset));
    }
    throw new Error("unterminated string");
  };
  const value = (jsonPath) => {
    skip();
    if (text[offset] === "{") return object(jsonPath);
    if (text[offset] === "[") return array(jsonPath);
    if (text[offset] === '"') return string();
    while (offset < text.length && !/[\s,\]}]/u.test(text[offset])) offset += 1;
  };
  const object = (jsonPath) => {
    const keys = new Set();
    offset += 1;
    skip();
    if (text[offset] === "}") { offset += 1; return; }
    while (offset < text.length) {
      skip();
      const key = string();
      const nextPath = `${jsonPath}.${key}`;
      if (keys.has(key)) duplicates.push(nextPath);
      keys.add(key);
      skip();
      if (text[offset++] !== ":") throw new Error(`expected colon at ${offset - 1}`);
      value(nextPath);
      skip();
      if (text[offset] === "}") { offset += 1; return; }
      if (text[offset++] !== ",") throw new Error(`expected comma at ${offset - 1}`);
    }
    throw new Error("unterminated object");
  };
  const array = (jsonPath) => {
    offset += 1;
    skip();
    if (text[offset] === "]") { offset += 1; return; }
    let index = 0;
    while (offset < text.length) {
      value(`${jsonPath}[${index++}]`);
      skip();
      if (text[offset] === "]") { offset += 1; return; }
      if (text[offset++] !== ",") throw new Error(`expected comma at ${offset - 1}`);
    }
    throw new Error("unterminated array");
  };
  value("$");
  skip();
  if (offset !== text.length) throw new Error(`unexpected content at ${offset}`);
  return duplicates;
}

function readJSON(file) {
  try {
    const text = fs.readFileSync(file, "utf8");
    for (const duplicate of duplicateJSONKeys(text)) {
      errors.push(`duplicate JSON key: ${path.relative(projectRoot, file)}:${duplicate}`);
    }
    return JSON.parse(text);
  } catch (error) {
    errors.push(`invalid JSON: ${path.relative(projectRoot, file)}: ${error.message}`);
    return null;
  }
}

const english = readJSON(englishPath);
const persian = readJSON(persianPath)?.fa;
const overrides = readJSON(overridesPath);
const expected = 673;

if (!Array.isArray(english) || english.length !== expected) {
  errors.push(`English glossary must contain ${expected} entries; found ${english?.length ?? "invalid"}`);
}
if (!persian || Object.keys(persian).length !== expected) {
  errors.push(`Persian glossary must contain ${expected} entries; found ${Object.keys(persian ?? {}).length}`);
}

const englishIds = (english ?? []).map((entry) => entry.id);
const persianIds = Object.keys(persian ?? {});
if (JSON.stringify(persianIds) !== JSON.stringify(englishIds)) {
  errors.push("Persian glossary ID set or order differs from the English glossary");
}

const allowedLatinIds = new Set([
  "fall",
  "experience-xp",
  "fishing-rod-pole",
  "mr-qi",
  "gold-currency",
  "vsync",
  "join-lan-game",
  "enter-ip",
  "speed-gro",
  "training-bamboo-fiberglass-iridium-rod",
]);
const allowedSourceIdenticalTerms = new Set(["speed-gro"]);
const stalePatterns = [
  /مرکز اجتماع(?:[ .،؛]|$)/u,
  /میوهٔ ستاره‌ای/u,
  /استادی/u,
  /کوره‌گاه/u,
  /میکدهٔ میوه/u,
  /فروشگاه عمومی پیر/u,
  /درهٔ استاردیو/u,
  /معدن معدن/u,
  /نرخ گازگرفتن/u,
  /شیشهٔ ترشی/u,
  /تخم ماهی رسیده/u,
  /شمارهٔ [۱۲] خیابان/u,
  /خیابان ویلو/u,
  /خیابان ریور/u,
];

let persianScriptEntries = 0;
for (const entry of english ?? []) {
  const value = persian?.[entry.id];
  if (!value?.term?.trim() || !value?.meaning?.trim()) {
    errors.push(`missing Persian content: ${entry.id}`);
    continue;
  }
  for (const [field, text] of Object.entries(value)) {
    if (text.includes("�")) errors.push(`replacement character: ${entry.id}.${field}`);
    if (/[\u0000-\u001F\u007F-\u009F]/u.test(text)) {
      errors.push(`control character: ${entry.id}.${field}`);
    }
    if (text !== text.normalize("NFC")) errors.push(`non-NFC text: ${entry.id}.${field}`);
    if (/\s{2,}/u.test(text)) errors.push(`repeated whitespace: ${entry.id}.${field}`);
    if (/[يك]/u.test(text)) errors.push(`Arabic-form yeh/kaf: ${entry.id}.${field}`);
    for (const pattern of stalePatterns) {
      if (pattern.test(text)) errors.push(`stale editorial fragment: ${entry.id}.${field}: ${pattern}`);
    }
  }
  const combined = `${value.term} ${value.meaning}`;
  if (/\p{Script=Arabic}/u.test(combined)) persianScriptEntries += 1;
  if (/[A-Za-z]/u.test(combined) && !allowedLatinIds.has(entry.id)) {
    errors.push(`unexpected Latin text: ${entry.id}`);
  }
  if (
    (value.term === entry.term && !allowedSourceIdenticalTerms.has(entry.id))
    || value.meaning === entry.meaning
  ) {
    errors.push(`source-identical Persian field: ${entry.id}`);
  }
}

if (persianScriptEntries !== expected) {
  errors.push(`Persian script is absent from ${expected - persianScriptEntries} entries`);
}

for (const [id, override] of Object.entries(overrides ?? {})) {
  if (!Object.hasOwn(persian ?? {}, id)) {
    errors.push(`unknown Persian override ID: ${id}`);
    continue;
  }
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    errors.push(`invalid Persian override: ${id}`);
    continue;
  }
  for (const [field, text] of Object.entries(override)) {
    if (!["term", "meaning"].includes(field) || typeof text !== "string" || !text.trim()) {
      errors.push(`invalid Persian override field: ${id}.${field}`);
    } else if (persian[id][field] !== text) {
      errors.push(`applied glossary differs from override: ${id}.${field}`);
    }
  }
}

console.log(JSON.stringify({
  entries: Object.keys(persian ?? {}).length,
  overrides: Object.keys(overrides ?? {}).length,
  persianScriptEntries,
  errors: errors.length,
  warnings: warnings.length,
}, null, 2));
for (const error of errors) console.error(`ERROR ${error}`);
for (const warning of warnings) console.error(`WARNING ${warning}`);
if (errors.length || warnings.length) process.exit(1);
