#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const batchRoot = path.join(root, "Documentation/bengali-batches");
const translationRoot = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/bengali");
const english = JSON.parse(fs.readFileSync(path.join(root, "Documentation/glossary/glossary.en.json"), "utf8"));
const bengali = JSON.parse(fs.readFileSync(path.join(root, "Documentation/glossary/glossary.bn.json"), "utf8")).bn;

const exact = new Map();
const conflicts = new Set();
function add(source, translated) {
  if (!source || !translated) return;
  if (exact.has(source) && exact.get(source) !== translated) conflicts.add(source);
  else exact.set(source, translated);
}
for (const entry of english) {
  const translated = bengali[entry.id]?.term;
  add(entry.term, translated);
  const sources = entry.term.split(" / ");
  const translations = translated?.split(" / ") ?? [];
  if (sources.length === translations.length) sources.forEach((source, index) => add(source, translations[index]));
}
for (const conflict of conflicts) exact.delete(conflict);

const batchDocuments = [];
const records = new Map();
for (const relative of fs.readdirSync(batchRoot).filter((name) => name.endsWith(".json")).sort()) {
  const file = path.join(batchRoot, relative);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  batchDocuments.push({ file, document, changed: false });
  for (const record of document.records ?? []) records.set(`${record.target}\0${record.key}`, { record, owner: batchDocuments.at(-1) });
}

const translationDocuments = [];
const patchRecords = new Map();
for (const relative of fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort()) {
  const file = path.join(translationRoot, relative);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  translationDocuments.push({ file, document, changed: false });
  for (const change of document.Changes ?? []) for (const key of Object.keys(change.Entries ?? {})) {
    patchRecords.set(`${change.Target}\0${key}`, { change, key, owner: translationDocuments.at(-1) });
  }
}

let changed = 0;
for (const { record, owner } of records.values()) {
  const expected = exact.get(record.source);
  if (expected === undefined) continue;
  if (record.translation === expected) {
    if (expected === record.source && !record.reviewedPreserve) {
      record.reviewedPreserve = true;
      record.reason = "এটি গ্লসারিতে নির্ধারিত ভাষা-নিরপেক্ষ প্রযুক্তিগত নাম; হুবহু রাখা হয়েছে।";
      owner.changed = true;
      changed += 1;
    }
    continue;
  }
  if (record.reviewedPreserve) throw new Error(`glossary exact conflicts with reviewed preserve: ${record.target} :: ${record.key}`);
  record.translation = expected;
  if (expected === record.source) {
    record.reviewedPreserve = true;
    record.reason = "এটি গ্লসারিতে নির্ধারিত ভাষা-নিরপেক্ষ প্রযুক্তিগত নাম; হুবহু রাখা হয়েছে।";
  }
  owner.changed = true;
  const patch = patchRecords.get(`${record.target}\0${record.key}`);
  if (!patch) throw new Error(`missing Bengali patch record: ${record.target} :: ${record.key}`);
  patch.change.Entries[patch.key] = expected;
  patch.owner.changed = true;
  changed += 1;
}
for (const item of batchDocuments) if (item.changed) fs.writeFileSync(item.file, `${JSON.stringify(item.document)}\n`);
for (const item of translationDocuments) if (item.changed) fs.writeFileSync(item.file, `${JSON.stringify(item.document, null, 2)}\n`);
console.log(`Applied ${changed} exact Bengali glossary correction(s).`);
