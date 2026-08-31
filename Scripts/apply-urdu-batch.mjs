#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const batchArgument = process.argv[2];
if (!batchArgument) {
  console.error("Usage: node Scripts/apply-urdu-batch.mjs <batch.json>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationSlug = process.env.VNREVIVAL_TRANSLATION_SLUG ?? "urdu";
const languageName = process.env.VNREVIVAL_LANGUAGE_NAME ?? "Urdu";
const translationRoot = path.join(
  projectRoot,
  `Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/${translationSlug}`,
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const editorialPath = path.join(projectRoot, `Documentation/${translationSlug}-editorial-overrides.json`);
const batchPath = path.resolve(batchArgument);

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  }).sort();
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const batch = readJSON(batchPath);
if (batch.replaceReviewed != null && typeof batch.replaceReviewed !== "boolean") {
  throw new Error("replaceReviewed must be a boolean when provided.");
}
if (
  !batch.id?.trim()
  || (
    !Array.isArray(batch.records)
    && !Array.isArray(batch.preservedTargets)
    && (!batch.simpleFurniture || typeof batch.simpleFurniture !== "object")
    && (!batch.simpleTarget || typeof batch.simpleTarget !== "object")
    && !Array.isArray(batch.simpleTargets)
    && (!batch.simplePreserved || typeof batch.simplePreserved !== "object")
    && (!batch.simpleHats || typeof batch.simpleHats !== "object")
  )
  || !(
    batch.records?.length
    || batch.preservedTargets?.length
    || Object.keys(batch.simpleFurniture ?? {}).length
    || Object.keys(batch.simpleTarget?.entries ?? {}).length
    || (batch.simpleTargets ?? []).some((group) => Object.keys(group?.entries ?? {}).length)
    || batch.simplePreserved?.keys?.length
    || Object.keys(batch.simpleHats ?? {}).length
  )
) {
  throw new Error("Batch requires a non-empty id and review records.");
}
if ((batch.records?.length ?? 0) > 100) {
  throw new Error("A review batch may contain at most 100 explicit records.");
}
if (batch.simpleTarget) {
  if (
    typeof batch.simpleTarget.target !== "string"
    || !batch.simpleTarget.target
    || !batch.simpleTarget.entries
    || typeof batch.simpleTarget.entries !== "object"
    || Array.isArray(batch.simpleTarget.entries)
    || Object.keys(batch.simpleTarget.entries).length > 100
  ) throw new Error("A simple target batch requires a target and at most 100 entries.");
}
if (batch.simpleTargets) {
  if (
    !Array.isArray(batch.simpleTargets)
    || batch.simpleTargets.some((group) => (
      typeof group?.target !== "string"
      || !group.target
      || !group.entries
      || typeof group.entries !== "object"
      || Array.isArray(group.entries)
    ))
    || batch.simpleTargets.reduce((count, group) => count + Object.keys(group.entries).length, 0) > 100
  ) throw new Error("Simple target groups require targets and at most 100 total entries.");
}
if (batch.simplePreserved) {
  if (
    typeof batch.simplePreserved.target !== "string"
    || !batch.simplePreserved.target
    || typeof batch.simplePreserved.reason !== "string"
    || !batch.simplePreserved.reason.trim()
    || !Array.isArray(batch.simplePreserved.keys)
    || !batch.simplePreserved.keys.length
    || batch.simplePreserved.keys.length > 100
    || batch.simplePreserved.keys.some((key) => typeof key !== "string" || !key)
    || new Set(batch.simplePreserved.keys).size !== batch.simplePreserved.keys.length
  ) throw new Error("A simple preserved batch requires a target, technical reason, and at most 100 unique keys.");
}
if (Object.keys(batch.simpleHats ?? {}).length > 100) {
  throw new Error("A simple hats batch may contain at most 100 entries.");
}

const documents = new Map();
const index = new Map();
for (const relative of listJSONFiles(translationRoot)) {
  const file = path.join(translationRoot, relative);
  const document = readJSON(file);
  documents.set(file, document);
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (index.has(id)) throw new Error(`Duplicate ${languageName} record: ${id}`);
      index.set(id, { file, change });
    }
  }
}

const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    englishCache.set(target, readJSON(path.join(englishRoot, `${target}.json`)).content);
  }
  return englishCache.get(target);
}

const editorial = readJSON(editorialPath);
editorial.records ??= {};
editorial.preservedRecords ??= [];
editorial.preservedReasons ??= {};
editorial.preservedTargets ??= [];
editorial.preservedTargetReasons ??= {};
editorial.batches ??= {};
const previouslyAppliedBatch = editorial.batches[batch.id];
const preserved = new Set(editorial.preservedRecords);
const preservedTargets = new Set(editorial.preservedTargets);
const batchIds = new Set();
const normalized = [];

const inputRecords = [...(batch.records ?? [])];
for (const [key, fields] of Object.entries(batch.simpleHats ?? {})) {
  if (!Array.isArray(fields) || fields.length !== 4 || fields.some((value) => typeof value !== "string")) {
    throw new Error(`Invalid simple hat mapping: ${key}`);
  }
  const [sourceName, translationName, sourceDescription, translationDescription] = fields;
  const source = englishContent("Data/hats")?.[key];
  const parts = typeof source === "string" ? source.split("/") : [];
  if (parts.length < 6 || parts[0] !== sourceName || parts[1] !== sourceDescription || parts[5] !== sourceName) {
    throw new Error(`Structured English hat drift: Data/hats\u0000${key}`);
  }
  parts[0] = translationName;
  parts[1] = translationDescription;
  parts[5] = translationName;
  inputRecords.push({
    target: "Data/hats",
    key,
    source,
    translation: parts.join("/"),
  });
}
for (const [key, pair] of Object.entries(batch.simpleTarget?.entries ?? {})) {
  if (!Array.isArray(pair) || pair.length !== 2 || pair.some((value) => typeof value !== "string")) {
    throw new Error(`Invalid simple target mapping: ${key}`);
  }
  inputRecords.push({
    target: batch.simpleTarget.target,
    key,
    source: pair[0],
    translation: pair[1],
  });
}
for (const group of batch.simpleTargets ?? []) {
  for (const [key, pair] of Object.entries(group.entries)) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some((value) => typeof value !== "string")) {
      throw new Error(`Invalid grouped target mapping: ${group.target}\u0000${key}`);
    }
    inputRecords.push({
      target: group.target,
      key,
      source: pair[0],
      translation: pair[1],
    });
  }
}
for (const key of batch.simplePreserved?.keys ?? []) {
  const source = englishContent(batch.simplePreserved.target)?.[key];
  if (typeof source !== "string") {
    throw new Error(`Unknown simple preserved record: ${batch.simplePreserved.target}\u0000${key}`);
  }
  inputRecords.push({
    target: batch.simplePreserved.target,
    key,
    source,
    translation: source,
    reviewedPreserve: true,
    preserveReason: batch.simplePreserved.reason,
  });
}
for (const [key, pair] of Object.entries(batch.simpleFurniture ?? {})) {
  if (!Array.isArray(pair) || pair.length !== 2 || pair.some((value) => typeof value !== "string")) {
    throw new Error(`Invalid simple furniture mapping: ${key}`);
  }
  inputRecords.push({
    target: "Strings/Furniture",
    key,
    source: pair[0],
    translation: pair[1],
    mirrorFurnitureData: true,
  });
}
for (const item of inputRecords) {
  if (!item.mirrorFurnitureData) continue;
  const furniture = englishContent("Data/Furniture");
  const reference = `[LocalizedText Strings\\Furniture:${item.key}]`;
  for (const [key, value] of Object.entries(furniture)) {
    if (typeof value !== "string" || !value.includes(reference)) continue;
    if (value.startsWith(`${item.source}/`)) {
      inputRecords.push({
        target: "Data/Furniture",
        key,
        structuredPrefix: true,
        sourcePrefix: item.source,
        translationPrefix: item.translation,
      });
    } else {
      inputRecords.push({
        target: "Data/Furniture",
        key,
        source: value,
        translation: value,
        reviewedPreserve: true,
        preserveReason: "The leading value is an internal furniture identifier, and the player-facing name is supplied by the localized Strings/Furniture reference.",
      });
    }
  }
}
for (const item of batch.preservedTargets ?? []) {
  if (!item?.target || !item.reason?.trim()) {
    throw new Error(`Invalid preserved target: ${JSON.stringify(item)}`);
  }
  const locations = [...index.entries()].filter(([id]) => id.startsWith(`${item.target}\u0000`));
  if (!locations.length) throw new Error(`Unknown preserved target: ${item.target}`);
  for (const [id] of locations) {
    const split = id.indexOf("\u0000");
    const key = id.slice(split + 1);
    const source = englishContent(item.target)?.[key];
    inputRecords.push({
      target: item.target,
      key,
      source,
      translation: source,
      reviewedPreserve: true,
      preserveByTarget: true,
      preserveReason: item.reason,
    });
  }
}

for (const inputRecord of inputRecords) {
  let record = inputRecord;
  if (inputRecord?.translationReplacements) {
    if (
      !batch.replaceReviewed
      || !inputRecord.target
      || typeof inputRecord.key !== "string"
      || !Array.isArray(inputRecord.translationReplacements)
      || !inputRecord.translationReplacements.length
      || inputRecord.translationReplacements.some((pair) => (
        !Array.isArray(pair)
        || pair.length !== 2
        || pair.some((value) => typeof value !== "string" || !value)
        || pair[0] === pair[1]
      ))
    ) throw new Error(`Invalid reviewed translation replacements: ${JSON.stringify(inputRecord)}`);
    const id = `${inputRecord.target}\u0000${inputRecord.key}`;
    const reviewed = editorial.records[id];
    const english = englishContent(inputRecord.target)?.[inputRecord.key];
    if (!reviewed || reviewed.english !== english) {
      throw new Error(`Reviewed translation missing or stale: ${id}`);
    }
    let translation = reviewed.translation;
    for (const [replacementIndex, [before, after]] of inputRecord.translationReplacements.entries()) {
      if (translation.includes(before)) {
        if (after.includes(before)) {
          const marker = `\u0001reviewed-replacement-${replacementIndex}\u0001`;
          if (translation.includes(marker)) throw new Error(`Reviewed replacement marker collision: ${id}`);
          translation = translation
            .split(after).join(marker)
            .split(before).join(after)
            .split(marker).join(after);
        } else {
          translation = translation.split(before).join(after);
        }
      } else if (!translation.includes(after)) {
        throw new Error(`Reviewed replacement missing: ${id}: ${before}`);
      }
    }
    record = {
      ...inputRecord,
      source: english,
      translation,
    };
  } else if (inputRecord?.eventSegments) {
    if (
      !inputRecord.target
      || typeof inputRecord.key !== "string"
      || !Array.isArray(inputRecord.eventSegments)
      || !inputRecord.eventSegments.length
      || inputRecord.eventSegments.some((pair) => (
        !Array.isArray(pair)
        || pair.length !== 2
        || pair.some((value) => typeof value !== "string" || !value)
      ))
    ) throw new Error(`Invalid event-segments record: ${JSON.stringify(inputRecord)}`);
    const english = englishContent(inputRecord.target)?.[inputRecord.key];
    if (typeof english !== "string") {
      throw new Error(`Unknown event-segments record: ${inputRecord.target}\u0000${inputRecord.key}`);
    }
    let translation = english;
    for (const [sourceSegment, translationSegment] of inputRecord.eventSegments) {
      const first = translation.indexOf(sourceSegment);
      if (first < 0 || translation.indexOf(sourceSegment, first + sourceSegment.length) >= 0) {
        throw new Error(`Event segment missing or ambiguous: ${inputRecord.target}\u0000${inputRecord.key}: ${sourceSegment}`);
      }
      translation = `${translation.slice(0, first)}${translationSegment}${translation.slice(first + sourceSegment.length)}`;
    }
    record = {
      ...inputRecord,
      source: english,
      translation,
    };
  } else if (inputRecord?.structuredPrefix) {
    if (
      !inputRecord.target
      || typeof inputRecord.key !== "string"
      || typeof inputRecord.sourcePrefix !== "string"
      || typeof inputRecord.translationPrefix !== "string"
    ) throw new Error(`Invalid structured-prefix record: ${JSON.stringify(inputRecord)}`);
    const english = englishContent(inputRecord.target)?.[inputRecord.key];
    const separator = `${inputRecord.sourcePrefix}/`;
    if (typeof english !== "string" || !english.startsWith(separator)) {
      throw new Error(`Structured English prefix drift: ${inputRecord.target}\u0000${inputRecord.key}`);
    }
    record = {
      ...inputRecord,
      source: english,
      translation: `${inputRecord.translationPrefix}${english.slice(inputRecord.sourcePrefix.length)}`,
    };
  } else if (inputRecord?.structuredSuffix) {
    if (
      !inputRecord.target
      || typeof inputRecord.key !== "string"
      || typeof inputRecord.sourceSuffix !== "string"
      || typeof inputRecord.translationSuffix !== "string"
    ) throw new Error(`Invalid structured-suffix record: ${JSON.stringify(inputRecord)}`);
    const english = englishContent(inputRecord.target)?.[inputRecord.key];
    const suffix = `/${inputRecord.sourceSuffix}`;
    if (typeof english !== "string" || !english.endsWith(suffix)) {
      throw new Error(`Structured English suffix drift: ${inputRecord.target}\u0000${inputRecord.key}`);
    }
    record = {
      ...inputRecord,
      source: english,
      translation: `${english.slice(0, -inputRecord.sourceSuffix.length)}${inputRecord.translationSuffix}`,
    };
  } else if (inputRecord?.structuredBookends) {
    if (
      !inputRecord.target
      || typeof inputRecord.key !== "string"
      || typeof inputRecord.sourceLabel !== "string"
      || typeof inputRecord.translationLabel !== "string"
    ) throw new Error(`Invalid structured-bookends record: ${JSON.stringify(inputRecord)}`);
    const english = englishContent(inputRecord.target)?.[inputRecord.key];
    const prefix = `${inputRecord.sourceLabel}/`;
    const suffix = `/${inputRecord.sourceLabel}`;
    if (typeof english !== "string" || !english.startsWith(prefix) || !english.endsWith(suffix)) {
      throw new Error(`Structured English bookends drift: ${inputRecord.target}\u0000${inputRecord.key}`);
    }
    record = {
      ...inputRecord,
      source: english,
      translation: `${inputRecord.translationLabel}${english.slice(inputRecord.sourceLabel.length, -inputRecord.sourceLabel.length)}${inputRecord.translationLabel}`,
    };
  }
  if (!record?.target || typeof record.key !== "string" || typeof record.source !== "string") {
    throw new Error(`Invalid batch record: ${JSON.stringify(record)}`);
  }
  const id = `${record.target}\u0000${record.key}`;
  if (batchIds.has(id)) throw new Error(`Duplicate batch record: ${id}`);
  batchIds.add(id);
  const location = index.get(id);
  if (!location) throw new Error(`Unknown ${languageName} record: ${id}`);
  const english = englishContent(record.target)?.[record.key];
  if (english !== record.source) {
    throw new Error(`English source drift for ${id}`);
  }
  if (typeof record.translation !== "string" || (!record.translation && record.source)) {
    throw new Error(`Empty translation: ${id}`);
  }
  if (record.translation !== record.translation.normalize("NFC")) {
    throw new Error(`Non-NFC translation: ${id}`);
  }
  if (record.translation.includes("�")) throw new Error(`Replacement character: ${id}`);
  if (record.reviewedPreserve) {
    if (record.translation !== record.source) throw new Error(`Preserved record differs: ${id}`);
    const reason = record.preserveReason ?? batch.preserveReason;
    if (typeof reason !== "string" || !reason.trim()) {
      throw new Error(`Preserved record lacks a technical reason: ${id}`);
    }
  } else if (
    record.translation !== record.source
    && /[A-Za-z]{2}/.test(record.source)
    && !/[\u0600-\u06FF]/u.test(record.translation)
  ) {
    throw new Error(`Translation has no Urdu script: ${id}`);
  }
  const existing = editorial.records[id];
  const expectedEditorial = { english: record.source, translation: record.translation };
  if (
    existing
    && JSON.stringify(existing) !== JSON.stringify(expectedEditorial)
    && !batch.replaceReviewed
    && !previouslyAppliedBatch
  ) {
    throw new Error(`Refusing to replace reviewed editorial record: ${id}`);
  }
  if (
    preserved.has(id)
    && !record.reviewedPreserve
    && !batch.replacePreserved
    && !previouslyAppliedBatch
  ) {
    throw new Error(`Record is already preserved: ${id}`);
  }
  const current = location.change.Entries[record.key];
  const allowedReviewedTranslation = batch.replaceReviewed && existing?.english === record.source
    ? existing.translation
    : undefined;
  if (
    current !== record.source
    && current !== record.translation
    && current !== allowedReviewedTranslation
    && !previouslyAppliedBatch
  ) {
    throw new Error(`Refusing to overwrite different ${languageName} translation: ${id}`);
  }
  normalized.push({ ...record, id, location });
}

const existingBatch = previouslyAppliedBatch;
const batchRecordIds = normalized.map((record) => record.id);
if (existingBatch && JSON.stringify(existingBatch.records) !== JSON.stringify(batchRecordIds)) {
  throw new Error(`Batch id already records different entries: ${batch.id}`);
}
if (existingBatch) {
  console.log(JSON.stringify({
    batch: batch.id,
    records: normalized.length,
    changed: 0,
    editorialAdded: 0,
    editorialUpdated: 0,
    preservedAdded: 0,
    preservedTargetsAdded: 0,
    touchedFiles: 0,
    alreadyApplied: true,
  }, null, 2));
  process.exit(0);
}

const touchedFiles = new Set();
let changed = 0;
let preservedAdded = 0;
let preservedRemoved = 0;
let preservedTargetsAdded = 0;
let editorialAdded = 0;
let editorialUpdated = 0;
for (const record of normalized) {
  if (record.location.change.Entries[record.key] !== record.translation) {
    record.location.change.Entries[record.key] = record.translation;
    touchedFiles.add(record.location.file);
    changed += 1;
  }
  if (record.reviewedPreserve) {
    if (record.preserveByTarget) {
      if (!preservedTargets.has(record.target)) {
        preservedTargets.add(record.target);
        preservedTargetsAdded += 1;
      }
      editorial.preservedTargetReasons[record.target] = record.preserveReason;
    } else if (!preserved.has(record.id)) {
      preserved.add(record.id);
      preservedAdded += 1;
    }
    if (!record.preserveByTarget) {
      editorial.preservedReasons[record.id] = record.preserveReason ?? batch.preserveReason;
    }
  } else if (!editorial.records[record.id]) {
    if (batch.replacePreserved && preserved.delete(record.id)) {
      delete editorial.preservedReasons[record.id];
      preservedRemoved += 1;
    }
    editorial.records[record.id] = {
      english: record.source,
      translation: record.translation,
    };
    editorialAdded += 1;
  } else if (
    batch.replaceReviewed
    && editorial.records[record.id].translation !== record.translation
  ) {
    editorial.records[record.id] = {
      english: record.source,
      translation: record.translation,
    };
    editorialUpdated += 1;
  }
}
editorial.preservedRecords = [...preserved].sort();
editorial.preservedTargets = [...preservedTargets].sort();
editorial.batches[batch.id] = {
  records: batchRecordIds,
  reviewedAt: batch.reviewedAt ?? "2026-08-24",
};

for (const file of touchedFiles) {
  fs.writeFileSync(file, `${JSON.stringify(documents.get(file), null, 2)}\n`);
}
fs.writeFileSync(editorialPath, `${JSON.stringify(editorial, null, 2)}\n`);

console.log(JSON.stringify({
  batch: batch.id,
  records: normalized.length,
  changed,
  editorialAdded,
  editorialUpdated,
    preservedAdded,
    preservedRemoved,
    preservedTargetsAdded,
  touchedFiles: touchedFiles.size,
}, null, 2));
