#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const translationRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/traditional-chinese");
const overridePath = path.join(projectRoot, "Documentation/traditional-chinese-editorial-overrides.json");
const englishGlossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const targetGlossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.zh-TW.json");
const document = JSON.parse(fs.readFileSync(overridePath, "utf8"));
if (document?.format !== 1 || !Array.isArray(document.records)) throw new Error("Invalid Traditional Chinese editorial override document.");
if (!Array.isArray(document.globalReplacements)
  || document.globalReplacements.some((pair) => !Array.isArray(pair) || pair.length !== 2
    || pair.some((value) => typeof value !== "string") || !pair[0])) {
  throw new Error("Invalid Traditional Chinese global editorial replacements.");
}

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? listJSONFiles(file) : entry.name.endsWith(".json") ? [file] : [];
  });
}

const index = new Map();
const documents = new Map();
for (const file of listJSONFiles(translationRoot)) {
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  documents.set(file, json);
  for (const change of json.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) index.set(`${change.Target}\0${key}`, { file, change });
  }
}

let changed = 0;
const touched = new Set();
for (const [file, json] of documents) {
  for (const change of json.Changes ?? []) {
    for (const [key, original] of Object.entries(change.Entries ?? {})) {
      let value = original;
      for (const [from, to] of document.globalReplacements) value = value.split(from).join(to);
      if (value !== original) {
        change.Entries[key] = value;
        touched.add(file);
        changed += 1;
      }
    }
  }
}

if (document.exactGlossaryLabels) {
  const englishGlossary = JSON.parse(fs.readFileSync(englishGlossaryPath, "utf8"));
  const targetGlossary = JSON.parse(fs.readFileSync(targetGlossaryPath, "utf8"))["zh-TW"];
  const exactLabels = new Map();
  for (const entry of englishGlossary) {
    const target = targetGlossary?.[entry.id]?.term;
    if (!target) continue;
    const englishTerms = entry.term.split(/\s*\/\s*/);
    const targetTerms = target.split("／");
    if (targetTerms.length === 1) {
      for (const english of englishTerms) exactLabels.set(english, targetTerms[0]);
    } else if (targetTerms.length === englishTerms.length) {
      englishTerms.forEach((english, index) => exactLabels.set(english, targetTerms[index]));
    }
  }
  const englishCache = new Map();
  for (const [file, json] of documents) {
    for (const change of json.Changes ?? []) {
      if (!englishCache.has(change.Target)) {
        const english = JSON.parse(fs.readFileSync(path.join(englishRoot, `${change.Target}.json`), "utf8"));
        englishCache.set(change.Target, english.content);
      }
      for (const [key, original] of Object.entries(change.Entries ?? {})) {
        const canonical = exactLabels.get(englishCache.get(change.Target)?.[key]);
        if (canonical !== undefined && original !== canonical) {
          change.Entries[key] = canonical;
          touched.add(file);
          changed += 1;
        }
      }
    }
  }
}

for (const record of document.records) {
  const location = index.get(`${record.target}\0${record.key}`);
  if (!location || !Array.isArray(record.replacements)) throw new Error(`Invalid override record: ${record.target} :: ${record.key}`);
  let value = location.change.Entries[record.key];
  for (const [from, to] of record.replacements) {
    const occurrences = value.split(from).length - 1;
    if (occurrences === 1) value = value.replace(from, to);
    else if (occurrences === 0 && value.includes(to)) continue;
    else throw new Error(`Override source occurs ${occurrences} times: ${record.target} :: ${record.key}: ${from}`);
  }
  if (value !== location.change.Entries[record.key]) {
    location.change.Entries[record.key] = value;
    touched.add(location.file);
    changed += 1;
  }
}
for (const file of touched) fs.writeFileSync(file, `${JSON.stringify(documents.get(file), null, 2)}\n`);
console.log(`Applied ${changed} Traditional Chinese editorial override records.`);
