#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/filipino");
const batchRoot = path.join(root, "Documentation/filipino-batches");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const errors = [];
const warnings = [];
const supplementalEvidence = JSON.parse(fs.readFileSync(
  path.join(root, "Documentation/filipino/supplemental-visible-fields.json"),
  "utf8",
));
const supplementalSources = new Map(
  supplementalEvidence.directVisibleFields.map((record) => [
    `${record.target}\u0000${record.path.join(".")}`,
    record.source,
  ]),
);

function listJSON(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((name) => name.endsWith(".json")).sort();
}
function matches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}
function count(value, character) {
  return [...value].filter((item) => item === character).length;
}
function signature(value) {
  return {
    contentPatcher: matches(value, /\{\{[^}]+\}\}/g),
    genderChoices: [...value.matchAll(/\$\{.*?\}\$/gs)]
      .map((match) => count(match[0], "^"))
      .sort((left, right) => left - right),
    substitutions: matches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: matches(value, /\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: matches(value, /%[a-z][A-Za-z0-9_]*/g),
    dollarTokens: matches(value, /\$[A-Za-z0-9]+/g),
    typedItems: matches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    at: count(value, "@"), hash: count(value, "#"), caret: count(value, "^"),
    percentSign: count(value, "%"), dollarSign: count(value, "$"),
    pipe: count(value, "|"), slash: count(value, "/"), backslash: count(value, "\\"),
    underscore: count(value, "_"), newline: count(value, "\n"),
    squareLeft: count(value, "["), squareRight: count(value, "]"),
    angleLeft: count(value, "<"), angleRight: count(value, ">"),
  };
}
function fingerprint(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

const english = new Map();
function source(target) {
  if (!english.has(target)) {
    const file = path.join(englishRoot, `${target}.json`);
    if (!fs.existsSync(file)) errors.push(`missing English asset: ${target}`);
    else english.set(target, JSON.parse(fs.readFileSync(file, "utf8")).content);
  }
  return english.get(target) ?? {};
}

const records = new Map();
const translationFiles = listJSON(translationRoot);
for (const relative of translationFiles) {
  let document;
  try { document = JSON.parse(fs.readFileSync(path.join(translationRoot, relative), "utf8")); }
  catch (error) { errors.push(`invalid JSON ${relative}: ${error.message}`); continue; }
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${relative}`);
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) errors.push(`empty Changes: ${relative}`);
  for (const change of document.Changes ?? []) {
    const hasEntries = change.Entries && typeof change.Entries === "object";
    const hasFields = change.Fields && typeof change.Fields === "object";
    if (change.Action !== "EditData" || typeof change.Target !== "string" || hasEntries === hasFields) {
      errors.push(`invalid change: ${relative}`); continue;
    }
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "fil-vnrevival" })) {
      errors.push(`invalid language gate: ${relative} :: ${change.Target}`);
    }
    const flattened = hasEntries
      ? Object.entries(change.Entries)
      : Object.entries(change.Fields).flatMap(([entry, fields]) =>
        Object.entries(fields).map(([field, value]) => [`${entry}.${field}`, value]));
    for (const [key, value] of flattened) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate patch record: ${change.Target} :: ${key}`);
      records.set(id, { target: change.Target, key, value, relative, supplemental: hasFields });
    }
  }
}

const reviewed = new Map();
for (const relative of listJSON(batchRoot)) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchRoot, relative), "utf8"));
  if (!batch.id || !["short", "long", "supplemental"].includes(batch.kind) || !Array.isArray(batch.records)) {
    errors.push(`invalid batch: ${relative}`); continue;
  }
  const [minimum, maximum] = batch.kind === "short"
    ? [40, 80]
    : batch.kind === "long"
      ? [15, 30]
      : [1, 20];
  if (batch.records.length < minimum || batch.records.length > maximum) {
    errors.push(`invalid batch size: ${relative}: ${batch.records.length}`);
  }
  for (const record of batch.records) {
    const id = `${record.target}\u0000${record.key}`;
    if (reviewed.has(id)) errors.push(`reviewed twice: ${record.target} :: ${record.key}`);
    if (record.reviewedPreserve && !record.preserveReason) errors.push(`preserve without reason: ${record.target} :: ${record.key}`);
    if (!record.reviewedPreserve && typeof record.translation !== "string") errors.push(`missing translation: ${record.target} :: ${record.key}`);
    reviewed.set(id, { ...record, batch: batch.id });
  }
}

for (const [id, record] of records) {
  const original = record.supplemental
    ? supplementalSources.get(id)
    : source(record.target)[record.key];
  if (typeof original !== "string") { errors.push(`missing source: ${record.target} :: ${record.key}`); continue; }
  const review = reviewed.get(id);
  if (!review) {
    if (record.value !== original) errors.push(`untracked change: ${record.target} :: ${record.key}`);
    continue;
  }
  if (review.source !== original) errors.push(`source drift: ${record.target} :: ${record.key}`);
  const expected = review.reviewedPreserve ? original : review.translation;
  if (record.value !== expected) errors.push(`batch value not applied: ${record.target} :: ${record.key}`);
  if (!review.reviewedPreserve && expected === original) errors.push(`unchanged translation lacks preserve decision: ${record.target} :: ${record.key}`);
  if (JSON.stringify(signature(original)) !== JSON.stringify(signature(expected))) errors.push(`marker mismatch: ${record.target} :: ${record.key}`);
  const prose = expected.replace(/https?:\/\/\S+|\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\$[A-Za-z0-9]+|%[a-z][A-Za-z0-9_]*/g, "");
  if (!review.reviewedPreserve && !review.reviewedEnglishResidue && /\b(?:the|and|with|from|your|you|this|that|please|building|farm|money|items|caught|found|level)\b/i.test(prose)) {
    warnings.push(`possible English residue: ${record.target} :: ${record.key}`);
  }
}
for (const [id, record] of reviewed) if (!records.has(id)) errors.push(`batch record absent: ${record.target} :: ${record.key}`);

const glossaryFile = path.join(root, "Documentation/glossary/glossary.fil.json");
const glossary = JSON.parse(fs.readFileSync(glossaryFile, "utf8")).fil;
const englishGlossary = JSON.parse(fs.readFileSync(path.join(root, "Documentation/glossary/glossary.en.json"), "utf8"));
if (englishGlossary.length !== 673 || Object.keys(glossary).length !== 673) errors.push("invalid glossary coverage");
if (JSON.stringify(englishGlossary.map((entry) => entry.id)) !== JSON.stringify(Object.keys(glossary))) errors.push("glossary ID/order mismatch");

const exactGlossary = new Map();
const conflictingExactTerms = new Set();
for (const entry of englishGlossary) {
  const sourceTerms = entry.term.split(" / ");
  const translatedTerms = glossary[entry.id].term.split(" / ");
  if (sourceTerms.length !== translatedTerms.length) continue;
  for (let index = 0; index < sourceTerms.length; index += 1) {
    const sourceTerm = sourceTerms[index];
    const translatedTerm = translatedTerms[index];
    if (exactGlossary.has(sourceTerm) && exactGlossary.get(sourceTerm) !== translatedTerm) {
      conflictingExactTerms.add(sourceTerm);
    } else {
      exactGlossary.set(sourceTerm, translatedTerm);
    }
  }
}
for (const term of conflictingExactTerms) exactGlossary.delete(term);
for (const [id, record] of records) {
  const original = record.supplemental
    ? supplementalSources.get(id)
    : source(record.target)[record.key];
  const expected = exactGlossary.get(original);
  if (expected !== undefined && !reviewed.get(id)?.reviewedPreserve && record.value !== expected) {
    errors.push(`exact glossary label mismatch: ${record.target} :: ${record.key}`);
  }
}

if (translationFiles.length !== 152) errors.push(`translation files ${translationFiles.length}, expected 152`);
if (records.size !== 14721) errors.push(`records ${records.size}, expected 14721`);
if (english.size !== 187) errors.push(`English targets ${english.size}, expected 187`);

const progress = Number(((reviewed.size / 14721) * 100).toFixed(3));
console.log(JSON.stringify({
  translationFiles: translationFiles.length, targets: english.size + new Set(
    [...records.values()].filter((record) => record.supplemental).map((record) => record.target),
  ).size, totalRecords: records.size,
  reviewedRecords: reviewed.size, remainingRecords: records.size - reviewed.size,
  projectProgressPercent: progress, glossaryEntries: Object.keys(glossary).length,
  glossarySHA256: fingerprint(fs.readFileSync(glossaryFile)),
  errors: errors.length, warnings: warnings.length, details: [...errors, ...warnings],
}, null, 2));
if (errors.length || warnings.length) process.exit(1);
