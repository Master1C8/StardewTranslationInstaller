#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const write = process.argv.includes("--write");
const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

const english = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
const swahili = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.sw.json")).sw;
const candidates = new Map();
const conflicts = new Set();

function addCandidate(source, translated) {
  if (!source || !translated) return;
  if (candidates.has(source) && candidates.get(source) !== translated) conflicts.add(source);
  else candidates.set(source, translated);
}

for (const entry of english) {
  const translated = swahili[entry.id]?.term;
  if (!translated) continue;
  addCandidate(entry.term, translated);
  const sourceParts = entry.term.split(" / ");
  const translatedParts = translated.split(" / ");
  if (sourceParts.length === translatedParts.length) {
    sourceParts.forEach((source, index) => addCandidate(source, translatedParts[index]));
  }
}
for (const conflict of conflicts) candidates.delete(conflict);

let replacements = 0;
let preserved = 0;
const touchedFiles = [];
for (const relative of listJSONFiles(translationRoot).sort()) {
  const file = path.join(translationRoot, relative);
  const document = readJSON(file);
  let touched = false;
  for (const change of document.Changes ?? []) {
    for (const [key, current] of Object.entries(change.Entries ?? {})) {
      const canonical = candidates.get(current);
      if (canonical === undefined) continue;
      if (canonical === current) {
        preserved += 1;
        continue;
      }
      change.Entries[key] = canonical;
      replacements += 1;
      touched = true;
    }
  }
  if (touched) {
    touchedFiles.push(relative);
    if (write) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
  }
}

console.log(
  JSON.stringify(
    {
      mode: write ? "write" : "dry-run",
      unambiguousGlossaryForms: candidates.size,
      conflicts: conflicts.size,
      replacements,
      preserved,
      touchedFiles: touchedFiles.length,
    },
    null,
    2,
  ),
);
