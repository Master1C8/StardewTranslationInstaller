#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
const canonicalGlossaryFile = process.argv.slice(3).find((argument) => !argument.startsWith("--"));
if (!sourceRoot) {
  console.error(
    "Usage: node Scripts/audit-indonesian.mjs <unpacked-English-assets-dir> [glossary-translations.json]",
  );
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const payloadRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const translationRoot = path.join(payloadRoot, "assets/translations/indonesian");
const errors = [];
const warnings = [];
const sourceCache = new Map();
const records = new Map();
let eventRecords = 0;

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

function duplicateJSONKeys(text) {
  let offset = 0;
  const duplicates = [];
  const skipWhitespace = () => {
    while (/\s/.test(text[offset] ?? "")) offset += 1;
  };
  const parseString = () => {
    const start = offset;
    offset += 1;
    while (offset < text.length) {
      if (text[offset] === "\\") offset += 2;
      else if (text[offset] === '"') {
        offset += 1;
        return JSON.parse(text.slice(start, offset));
      } else offset += 1;
    }
    throw new Error("unterminated string");
  };
  const parseValue = (jsonPath) => {
    skipWhitespace();
    if (text[offset] === "{") return parseObject(jsonPath);
    if (text[offset] === "[") return parseArray(jsonPath);
    if (text[offset] === '"') return parseString();
    while (offset < text.length && !/[\s,\]}]/.test(text[offset])) offset += 1;
    return undefined;
  };
  const parseObject = (jsonPath) => {
    const keys = new Set();
    offset += 1;
    skipWhitespace();
    if (text[offset] === "}") {
      offset += 1;
      return;
    }
    while (offset < text.length) {
      skipWhitespace();
      const key = parseString();
      const keyPath = `${jsonPath}.${key}`;
      if (keys.has(key)) duplicates.push(keyPath);
      keys.add(key);
      skipWhitespace();
      if (text[offset] !== ":") throw new Error(`expected colon at ${offset}`);
      offset += 1;
      parseValue(keyPath);
      skipWhitespace();
      if (text[offset] === "}") {
        offset += 1;
        return;
      }
      if (text[offset] !== ",") throw new Error(`expected comma at ${offset}`);
      offset += 1;
    }
  };
  const parseArray = (jsonPath) => {
    offset += 1;
    skipWhitespace();
    if (text[offset] === "]") {
      offset += 1;
      return;
    }
    let index = 0;
    while (offset < text.length) {
      parseValue(`${jsonPath}[${index}]`);
      index += 1;
      skipWhitespace();
      if (text[offset] === "]") {
        offset += 1;
        return;
      }
      if (text[offset] !== ",") throw new Error(`expected comma at ${offset}`);
      offset += 1;
    }
  };
  parseValue("$");
  return duplicates;
}

function readJSON(file) {
  try {
    const text = fs.readFileSync(file, "utf8");
    for (const duplicate of duplicateJSONKeys(text)) {
      errors.push(`duplicate JSON key: ${file}: ${duplicate}`);
    }
    return JSON.parse(text);
  } catch (error) {
    errors.push(`invalid JSON: ${file}: ${error.message}`);
    return null;
  }
}

function sourceContent(target) {
  if (!sourceCache.has(target)) {
    const json = readJSON(path.join(sourceRoot, `${target}.json`));
    sourceCache.set(target, json?.content);
  }
  return sourceCache.get(target);
}

function sortedMatches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}

function count(value, character) {
  return [...value].filter((item) => item === character).length;
}

function withoutGenderBranches(value) {
  return value.replace(/\$\{[^{}]*\^[^{}]*\}\$/g, "");
}

function markerSignature(value) {
  return {
    contentPatcher: sortedMatches(value, /\{\{[^}]+\}\}/g),
    substitutions: sortedMatches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: sortedMatches(
      value,
      /\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g,
    ),
    percent: sortedMatches(value, /%[a-z][A-Za-z0-9_]*/g),
    dollar: sortedMatches(value, /\$[A-Za-z0-9]+/g),
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sortedMatches(value, /https?:\/\/[^\s)]+/g),
    genderBranches: [...value.matchAll(/\$\{[^{}]*\^[^{}]*\}\$/g)].length,
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(withoutGenderBranches(value), "^"),
    pipe: count(value, "|"),
    underscore: count(value, "_"),
    backslash: count(value, "\\"),
    newline: count(value, "\n"),
  };
}

function eventSkeleton(value) {
  return value
    .replace(/"(?:\\.|[^"\\])*"/g, '"TEXT"')
    .replace(/\/quickQuestion .*?\(break\)/g, "/quickQuestion CHOICES(break)");
}

function isEventScript(target, value) {
  if (target.startsWith("Data/Events/")) return true;
  if (
    !target.startsWith("Data/Festivals/")
    && target !== "Strings/1_6_Strings"
    && target !== "Strings/Locations"
  ) return false;
  return /(?:^|\/)(?:speak|message|question|quickQuestion|textAboveHead|pause|move|warp|faceDirection|playSound|viewport|skippable|end)(?: |\/|$)/.test(value);
}

const files = listJSONFiles(translationRoot).sort();
for (const relative of files) {
  const document = readJSON(path.join(translationRoot, relative));
  if (!document) continue;
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${relative}`);
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) {
    errors.push(`missing Changes: ${relative}`);
    continue;
  }

  for (const change of document.Changes) {
    if (change.Action !== "EditData" || typeof change.Target !== "string") {
      errors.push(`invalid EditData change: ${relative}`);
      continue;
    }
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "id-vnrevival" })) {
      errors.push(`invalid Language condition: ${relative}`);
    }
    if (!change.Entries || typeof change.Entries !== "object") {
      errors.push(`missing Entries: ${relative}`);
      continue;
    }
    const source = sourceContent(change.Target);
    if (!source) {
      errors.push(`missing English target: ${change.Target}`);
      continue;
    }

    for (const [key, translated] of Object.entries(change.Entries)) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${change.Target} :: ${key}`);
      if (typeof translated !== "string") {
        errors.push(`non-string translation: ${change.Target} :: ${key}`);
        continue;
      }
      if (!Object.hasOwn(source, key) || typeof source[key] !== "string") {
        errors.push(`missing English record: ${change.Target} :: ${key}`);
        continue;
      }
      const original = source[key];
      records.set(id, { target: change.Target, key, original, translated, relative });
      if (!translated.length && original.length) errors.push(`empty translation: ${id}`);
      if (translated.includes("�")) errors.push(`replacement character: ${id}`);
      const originalMarkers = markerSignature(original);
      const translatedMarkers = markerSignature(translated);
      if (JSON.stringify(originalMarkers) !== JSON.stringify(translatedMarkers)) {
        errors.push(
          `marker mismatch: ${change.Target} :: ${key} (${relative}): English=${JSON.stringify(originalMarkers)} Indonesian=${JSON.stringify(translatedMarkers)}`,
        );
      }
      if (
        /^Data\/(?:Achievements|AquariumFish|Boots|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|Quests|SecretNotes|animationDescriptions|hats)$/.test(change.Target)
        && count(original, "/") !== count(translated, "/")
      ) {
        errors.push(`structured slash mismatch: ${change.Target} :: ${key} (${relative})`);
      }
      if (isEventScript(change.Target, original)) {
        eventRecords += 1;
        if (eventSkeleton(original) !== eventSkeleton(translated)) {
          errors.push(`event structure mismatch: ${change.Target} :: ${key} (${relative})`);
        }
      }
    }
  }
}

function collectReferenceRecords(language) {
  const directory = path.join(payloadRoot, `assets/translations/${language}`);
  const result = new Set();
  for (const relative of listJSONFiles(directory)) {
    const document = readJSON(path.join(directory, relative));
    for (const change of document?.Changes ?? []) {
      for (const key of Object.keys(change.Entries ?? {})) {
        result.add(`${change.Target}\u0000${key}`);
      }
    }
  }
  return result;
}

for (const language of ["russian", "polish"]) {
  const reference = collectReferenceRecords(language);
  const missing = [...reference].filter((id) => !records.has(id));
  const extra = [...records.keys()].filter((id) => !reference.has(id));
  if (missing.length || extra.length) {
    errors.push(`${language} structure differs: missing=${missing.length}, extra=${extra.length}`);
  }
}

const englishGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
const indonesianGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.id.json"))?.id;
if (!Array.isArray(englishGlossary) || englishGlossary.length !== 673) {
  errors.push(`English glossary count is ${englishGlossary?.length ?? "invalid"}, expected 673`);
}
if (!indonesianGlossary || Object.keys(indonesianGlossary).length !== 673) {
  errors.push(`Indonesian glossary count is ${Object.keys(indonesianGlossary ?? {}).length}, expected 673`);
}
for (const entry of englishGlossary ?? []) {
  const translated = indonesianGlossary?.[entry.id];
  if (!translated?.term?.trim() || !translated?.meaning?.trim()) {
    errors.push(`missing Indonesian glossary entry: ${entry.id}`);
  }
}
if (canonicalGlossaryFile) {
  const canonical = readJSON(path.resolve(canonicalGlossaryFile))?.id;
  if (JSON.stringify(indonesianGlossary) !== JSON.stringify(canonical)) {
    errors.push("local Indonesian glossary differs from canonical SiteForMods layer");
  }
}

const content = readJSON(path.join(payloadRoot, "content.json"));
const includes = (content?.Changes ?? [])
  .filter((change) => change.Action === "Include")
  .map((change) => change.FromFile);
if (new Set(includes).size !== includes.length) errors.push("duplicate Include entries");
const indonesianIncludes = includes.filter((file) => file.startsWith("assets/translations/indonesian/"));
if (indonesianIncludes.length && indonesianIncludes.length !== files.length) {
  errors.push(`partial Indonesian Include set: actual=${indonesianIncludes.length}, expected=${files.length}`);
}

const changedFromEnglish = [...records.values()].filter(
  (record) => record.translated !== record.original,
).length;
const automaticallyPreservedRecords = [...records.values()].filter(
  (record) => record.translated === record.original && !/[A-Za-z]/.test(record.original),
);
const glossaryExactMap = new Map();
const glossaryConflicts = new Set();
function addGlossaryExact(source, translated) {
  if (!source || !translated) return;
  if (glossaryExactMap.has(source) && glossaryExactMap.get(source) !== translated) {
    glossaryConflicts.add(source);
  } else {
    glossaryExactMap.set(source, translated);
  }
}
for (const entry of englishGlossary ?? []) {
  const translated = indonesianGlossary?.[entry.id]?.term;
  addGlossaryExact(entry.term, translated);
  const sourceParts = entry.term.split(" / ");
  const translatedParts = translated?.split(" / ") ?? [];
  if (sourceParts.length === translatedParts.length) {
    sourceParts.forEach((source, index) => addGlossaryExact(source, translatedParts[index]));
  }
}
for (const conflict of glossaryConflicts) glossaryExactMap.delete(conflict);
const automaticallyPreservedIds = new Set(
  automaticallyPreservedRecords.map((record) => `${record.target}\u0000${record.key}`),
);
const glossaryPreserved = [...records.values()].filter((record) => {
  const id = `${record.target}\u0000${record.key}`;
  return record.translated === record.original
    && !automaticallyPreservedIds.has(id)
    && glossaryExactMap.get(record.original) === record.original;
}).length;
const automaticallyPreserved = automaticallyPreservedRecords.length;
const preservedValues = readJSON(
  path.join(projectRoot, "Documentation/indonesian-preserved-values.json"),
);
const explicitPreservedIds = new Set();
for (const item of preservedValues ?? []) {
  if (!item?.target || !item?.key || !item?.reason?.trim()) {
    errors.push(`invalid explicit preserved-value entry: ${JSON.stringify(item)}`);
    continue;
  }
  const targetIds = [...records.keys()].filter((id) => id.startsWith(`${item.target}\u0000`));
  const ids = item.key === "*"
    ? targetIds
    : item.key === "*exact"
      ? targetIds.filter((id) => records.get(id)?.translated === records.get(id)?.original)
      : [`${item.target}\u0000${item.key}`];
  if (item.key === "*exact" && item.expected !== ids.length) {
    errors.push(
      `explicit exact-value count differs for ${item.target}: actual=${ids.length}, expected=${item.expected}`,
    );
  }
  if (!ids.length) errors.push(`explicit preserved target does not exist: ${item.target}`);
  for (const id of ids) {
    if (explicitPreservedIds.has(id)) errors.push(`duplicate explicit preserved value: ${id}`);
    explicitPreservedIds.add(id);
    const record = records.get(id);
    if (!record) errors.push(`explicit preserved value does not exist: ${id}`);
    else if (record.translated !== record.original) {
      errors.push(`explicit preserved value is no longer source-identical: ${id}`);
    }
  }
}
const explicitPreserved = [...explicitPreservedIds].filter(
  (id) => !automaticallyPreservedIds.has(id)
    && records.get(id)?.translated === records.get(id)?.original
    && glossaryExactMap.get(records.get(id)?.original) !== records.get(id)?.original,
).length;
const reviewedConservative = changedFromEnglish
  + automaticallyPreserved
  + glossaryPreserved
  + explicitPreserved;
const progressPercent = records.size
  ? Number(((reviewedConservative / records.size) * 100).toFixed(2))
  : 0;
const unreviewedExact = records.size - reviewedConservative;
if (unreviewedExact > 0) {
  warnings.push(`${unreviewedExact} source-identical records still require review or an explicit allowlist`);
}

// Indonesian compact-UI budgets are added after the corresponding strings are translated
// and verified against the rendered layouts; Swahili-specific limits do not transfer.

if (process.argv.includes("--unreviewed-by-target")) {
  const byTarget = new Map();
  for (const [id, record] of records) {
    if (record.translated !== record.original) continue;
    if (automaticallyPreservedIds.has(id) || explicitPreservedIds.has(id)) continue;
    if (glossaryExactMap.get(record.original) === record.original) continue;
    byTarget.set(record.target, (byTarget.get(record.target) ?? 0) + 1);
  }
  console.log(
    [...byTarget]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([target, total]) => `${String(total).padStart(4)} ${target}`)
      .join("\n"),
  );
}
const unreviewedTargetArgument = process.argv.find((argument) =>
  argument.startsWith("--unreviewed-target="),
);
if (unreviewedTargetArgument) {
  const requestedTarget = unreviewedTargetArgument.slice("--unreviewed-target=".length);
  for (const [id, record] of records) {
    if (record.target !== requestedTarget || record.translated !== record.original) continue;
    if (automaticallyPreservedIds.has(id) || explicitPreservedIds.has(id)) continue;
    if (glossaryExactMap.get(record.original) === record.original) continue;
    console.log(`${record.key}\t${JSON.stringify(record.original)}`);
  }
}
if (process.argv.includes("--unreviewed-event-summary")) {
  const summaries = [];
  for (const [id, record] of records) {
    if (!record.target.startsWith("Data/Events/") || record.translated !== record.original) continue;
    if (automaticallyPreservedIds.has(id) || explicitPreservedIds.has(id)) continue;
    if (glossaryExactMap.get(record.original) === record.original) continue;
    const quoted = [...record.original.matchAll(/"(?:\\.|[^"\\])*"/g)].length;
    summaries.push({ target: record.target, key: record.key, length: record.original.length, quoted });
  }
  console.log(
    summaries
      .sort((left, right) => left.length - right.length || left.target.localeCompare(right.target))
      .map(({ target, key, length, quoted }) => `${String(length).padStart(6)} ${String(quoted).padStart(3)} ${target}\t${key}`)
      .join("\n"),
  );
}
const eventValuesArgument = process.argv.find((argument) =>
  argument.startsWith("--unreviewed-event-values-limit="),
);
if (eventValuesArgument) {
  const limit = Number(eventValuesArgument.slice("--unreviewed-event-values-limit=".length));
  const values = [];
  for (const [id, record] of records) {
    if (!record.target.startsWith("Data/Events/") || record.translated !== record.original) continue;
    if (automaticallyPreservedIds.has(id) || explicitPreservedIds.has(id)) continue;
    if (glossaryExactMap.get(record.original) === record.original) continue;
    values.push(record);
  }
  console.log(
    values
      .sort((left, right) => left.original.length - right.original.length || left.target.localeCompare(right.target))
      .slice(0, Number.isFinite(limit) ? limit : 0)
      .map((record) => `${record.target}\t${record.key}\t${JSON.stringify(record.original)}`)
      .join("\n"),
  );
}

const report = {
  files: files.length,
  records: records.size,
  sourceTargets: sourceCache.size,
  eventRecords,
  changedFromEnglish,
  automaticallyPreserved,
  glossaryPreserved,
  explicitPreserved,
  reviewedConservative,
  unreviewedExact,
  progressPercent,
  indonesianIncludes: indonesianIncludes.length,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
