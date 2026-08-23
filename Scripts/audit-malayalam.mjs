#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeMalayalam,
  mapsFromDocument,
  readClusterDocument,
} from "./malayalam-clusters.mjs";

const sourceRoot = process.argv[2];
const canonicalGlossaryFile = process.argv[3];
const EXPECTED_RECORDS = 14720;
const EXPECTED_GLOSSARY_RECORDS = 673;
const LANGUAGE = "ml-vnrevival";
const LOCALE = "malayalam";
const MALAYALAM = /[\u0D00-\u0D7F]/u;

if (!sourceRoot) {
  console.error(
    "Usage: node Scripts/audit-malayalam.mjs <unpacked-English-assets-dir> [glossary-translations.json]",
  );
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const payloadRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const translationRoot = path.join(payloadRoot, `assets/translations/${LOCALE}`);
const referenceRoot = path.join(payloadRoot, "assets/translations/polish");
const clusterMapFile = path.join(projectRoot, "Documentation/malayalam-cluster-map.json");
const clusterDocument = readClusterDocument(clusterMapFile);
const { decode: clusterDecode } = mapsFromDocument(clusterDocument);
const errors = [];
const warnings = [];
const sourceCache = new Map();
const records = new Map();
let eventRecords = 0;

function listJSONFiles(directory, prefix = "") {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(fullPath, relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  }).sort();
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
    throw new Error("unterminated object");
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
    throw new Error("unterminated array");
  };
  parseValue("$");
  skipWhitespace();
  if (offset !== text.length) throw new Error(`unexpected trailing data at ${offset}`);
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
    dialogueControl: sortedMatches(
      value,
      /%item\b[\s\S]*?%%|%revealtaste:[^%#$^|/\n]*|\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+)|(?<=#)\$\d+\s+[^#]+(?=#)/g,
    ),
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sortedMatches(value, /https?:\/\/[^\s)]+/g),
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

function collectSourceRecords() {
  const result = new Set();
  for (const relative of listJSONFiles(sourceRoot)) {
    const json = readJSON(path.join(sourceRoot, relative));
    const content = json?.content;
    if (!content || typeof content !== "object") continue;
    const target = relative.slice(0, -5);
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === "string") result.add(`${target}\u0000${key}`);
    }
  }
  return result;
}

const files = listJSONFiles(translationRoot);
const expectedFiles = listJSONFiles(referenceRoot);
if (!fs.existsSync(translationRoot)) {
  errors.push(`missing Malayalam translation directory: ${translationRoot}`);
}
const missingFiles = expectedFiles.filter((file) => !files.includes(file));
const extraFiles = files.filter((file) => !expectedFiles.includes(file));
if (missingFiles.length || extraFiles.length) {
  errors.push(
    `Malayalam translation file set differs from Polish reference: missing=${missingFiles.length}, extra=${extraFiles.length}`,
  );
}

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
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: LANGUAGE })) {
      errors.push(`invalid Language condition: ${relative}`);
    }
    if (!change.Entries || typeof change.Entries !== "object" || Array.isArray(change.Entries)) {
      errors.push(`missing Entries: ${relative}`);
      continue;
    }

    const source = sourceContent(change.Target);
    if (!source || typeof source !== "object") {
      errors.push(`missing English target: ${change.Target}`);
      continue;
    }

    for (const [key, encoded] of Object.entries(change.Entries)) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${change.Target} :: ${key}`);
      if (typeof encoded !== "string") {
        errors.push(`non-string translation: ${change.Target} :: ${key}`);
        continue;
      }
      const translated = decodeMalayalam(encoded, clusterDecode);
      if (MALAYALAM.test(encoded)) errors.push(`unencoded Malayalam cluster: ${id}`);
      for (const character of encoded) {
        const codepoint = character.codePointAt(0);
        if (codepoint >= 0xE000 && codepoint <= 0xF8FF && !clusterDecode.has(character)) {
          errors.push(`unknown Malayalam cluster glyph U+${codepoint.toString(16).toUpperCase()}: ${id}`);
        }
      }
      if (!Object.hasOwn(source, key) || typeof source[key] !== "string") {
        errors.push(`missing English record: ${change.Target} :: ${key}`);
        continue;
      }

      const original = source[key];
      records.set(id, { target: change.Target, key, original, translated, relative });
      if (!translated.length && original.length) errors.push(`empty translation: ${id}`);
      if (translated.includes("�")) errors.push(`replacement character: ${id}`);
      if (translated !== translated.normalize("NFC")) errors.push(`non-NFC translation: ${id}`);
      if (translated !== original && /[A-Za-z]/.test(translated) && !MALAYALAM.test(translated)) {
        errors.push(`translation lacks Malayalam script: ${id}`);
      }
      const originalMarkers = markerSignature(original);
      const translatedMarkers = markerSignature(translated);
      if (JSON.stringify(originalMarkers) !== JSON.stringify(translatedMarkers)) {
        errors.push(
          `marker mismatch: ${change.Target} :: ${key} (${relative}): English=${JSON.stringify(originalMarkers)} Malayalam=${JSON.stringify(translatedMarkers)}`,
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
        const originalActors = sortedMatches(original, /(?:^|\/)addTemporaryActor\s+"(?:\\.|[^"\\])*"/g);
        const translatedActors = sortedMatches(translated, /(?:^|\/)addTemporaryActor\s+"(?:\\.|[^"\\])*"/g);
        if (JSON.stringify(originalActors) !== JSON.stringify(translatedActors)) {
          errors.push(`event internal actor mismatch: ${change.Target} :: ${key} (${relative})`);
        }
      }
    }
  }
}

const sourceRecords = collectSourceRecords();
if (sourceRecords.size !== EXPECTED_RECORDS) {
  errors.push(`English source key count is ${sourceRecords.size}, expected ${EXPECTED_RECORDS}`);
}
if (records.size !== EXPECTED_RECORDS) {
  errors.push(`Malayalam record count is ${records.size}, expected ${EXPECTED_RECORDS}`);
}
const sourceMissing = [...sourceRecords].filter((id) => !records.has(id));
const sourceExtra = [...records.keys()].filter((id) => !sourceRecords.has(id));
if (sourceMissing.length || sourceExtra.length) {
  errors.push(`English source parity differs: missing=${sourceMissing.length}, extra=${sourceExtra.length}`);
}

const content = readJSON(path.join(payloadRoot, "content.json"));
if (content?.Format !== "2.9.0") errors.push("root content Format is not 2.9.0");
const includes = (content?.Changes ?? [])
  .filter((change) => change.Action === "Include")
  .map((change) => change.FromFile);
if (new Set(includes).size !== includes.length) errors.push("duplicate Include entries");
const expectedIncludes = expectedFiles.map((file) => `assets/translations/${LOCALE}/${file}`);
const actualIncludes = includes.filter((file) => file.startsWith(`assets/translations/${LOCALE}/`)).sort();
if (JSON.stringify(actualIncludes) !== JSON.stringify(expectedIncludes)) {
  errors.push(`Malayalam Include set differs: actual=${actualIncludes.length}, expected=${expectedIncludes.length}`);
}

const englishGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
const malayalamGlossaryDocument = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.ml.json"));
const malayalamGlossary = malayalamGlossaryDocument?.ml;
const englishGlossaryIds = (englishGlossary ?? []).map((entry) => entry.id);
if (!Array.isArray(englishGlossary) || englishGlossary.length !== EXPECTED_GLOSSARY_RECORDS) {
  errors.push(`English glossary count is ${englishGlossary?.length ?? "invalid"}, expected ${EXPECTED_GLOSSARY_RECORDS}`);
}
if (!malayalamGlossary || Object.keys(malayalamGlossary).length !== EXPECTED_GLOSSARY_RECORDS) {
  errors.push(`Malayalam glossary count is ${Object.keys(malayalamGlossary ?? {}).length}, expected ${EXPECTED_GLOSSARY_RECORDS}`);
}
if (malayalamGlossary && JSON.stringify(Object.keys(malayalamGlossary)) !== JSON.stringify(englishGlossaryIds)) {
  errors.push("Malayalam glossary ID/order differs from English glossary");
}
for (const entry of englishGlossary ?? []) {
  const translated = malayalamGlossary?.[entry.id];
  if (!translated || typeof translated.term !== "string" || typeof translated.meaning !== "string") {
    errors.push(`missing Malayalam glossary entry: ${entry.id}`);
    continue;
  }
  for (const field of ["term", "meaning"]) {
    if (!translated[field].trim()) errors.push(`empty Malayalam glossary ${field}: ${entry.id}`);
    if (translated[field] !== translated[field].normalize("NFC")) {
      errors.push(`non-NFC Malayalam glossary ${field}: ${entry.id}`);
    }
    if (translated[field].includes("�")) errors.push(`replacement character in Malayalam glossary ${field}: ${entry.id}`);
  }
  if (!MALAYALAM.test(translated.meaning)) errors.push(`Malayalam glossary meaning lacks Malayalam script: ${entry.id}`);
}
if (canonicalGlossaryFile) {
  const canonical = readJSON(path.resolve(canonicalGlossaryFile))?.ml;
  if (JSON.stringify(malayalamGlossary) !== JSON.stringify(canonical)) {
    errors.push("local Malayalam glossary differs from canonical SiteForMods layer");
  }
}

const glossaryExactMap = new Map();
const glossaryConflicts = new Set();
const warnedGlossaryConflicts = new Set();
function addGlossaryExact(source, translated, id) {
  if (!source || !translated) return;
  if (glossaryExactMap.has(source) && glossaryExactMap.get(source) !== translated) {
    glossaryConflicts.add(source);
    if (!warnedGlossaryConflicts.has(source)) {
      warnings.push(`glossary term has context variants: ${JSON.stringify(source)} (${id})`);
      warnedGlossaryConflicts.add(source);
    }
  } else {
    glossaryExactMap.set(source, translated);
  }
}
for (const entry of englishGlossary ?? []) {
  const translated = malayalamGlossary?.[entry.id]?.term;
  addGlossaryExact(entry.term, translated, entry.id);
  const sourceParts = entry.term.split(" / ");
  const translatedParts = translated?.split(" / ") ?? [];
  if (sourceParts.length === translatedParts.length) {
    sourceParts.forEach((source, index) => addGlossaryExact(source, translatedParts[index], entry.id));
  }
}
for (const conflict of glossaryConflicts) glossaryExactMap.delete(conflict);
let glossaryExactRecords = 0;
for (const record of records.values()) {
  const expected = glossaryExactMap.get(record.original);
  if (expected === undefined) continue;
  glossaryExactRecords += 1;
  if (record.translated !== expected) {
    errors.push(
      `glossary exact mismatch: ${record.target} :: ${record.key} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(record.translated)})`,
    );
  }
}

// These are deliberate technical labels or source tokens that the game expects
// to remain ASCII. Other visible source-identical English values are fallback.
const allowedExact = new Set([
  "Strings/BigCraftables\u0000Foroguemon_Name",
  "Strings/BigCraftables\u0000Foroguemon_Description",
  "Strings/Objects\u0000DeluxeSpeedGro_Name",
  "Strings/Objects\u0000HyperSpeedGro_Name",
  "Strings/Objects\u0000SpeedGro_Name",
  "Strings/BigCraftables\u0000HMTGF_Name",
  "Strings/BigCraftables\u0000HMTGF_Description",
  "Strings/BigCraftables\u0000PinkyLemon_Name",
  "Strings/BigCraftables\u0000PinkyLemon_Description",
  "Strings/StringsFromCSFiles\u0000Tab",
  "Strings/StringsFromCSFiles\u0000Enter",
  "Strings/StringsFromCSFiles\u0000CapsLock",
  "Strings/StringsFromCSFiles\u0000Kana",
  "Strings/StringsFromCSFiles\u0000Kanji",
  "Strings/StringsFromCSFiles\u0000Escape",
  "Strings/StringsFromCSFiles\u0000NumLock",
  "Strings/StringsFromCSFiles\u0000EnlW",
  "Strings/StringsFromCSFiles\u0000Attn",
  "Strings/StringsFromCSFiles\u0000Crsel",
  "Strings/StringsFromCSFiles\u0000Exsel",
  "Strings/StringsFromCSFiles\u0000GameLocation.cs.8214",
  "Strings/Notes\u000020",
  "Strings/UI\u0000Options_Vsync",
  "Data/NPCGiftTastes\u0000Universal_Neutral",
  "Data/NPCGiftTastes\u0000Universal_Dislike",
]);
const allowedExactTargets = new Set([
  "Data/AquariumFish",
  "Data/ChairTiles",
  "Data/CookingRecipes",
  "Data/CraftingRecipes",
  "Data/Furniture",
  "Data/HairData",
  "Data/PaintData",
  "Data/animationDescriptions",
  "Strings/credits",
]);
const likelyVisibleTarget = /^(Characters\/Dialogue|Strings\/(?!credits)|Data\/(Achievements|Boots|Bundles|EngagementDialogue|ExtraDialogue|Fish|Furniture|Monsters|NPCGiftTastes|Quests|SecretNotes|mail|hats))/;
const actionableExact = [];
for (const [id, record] of records) {
  if (
    record.translated === record.original
    && /[A-Za-z]{3}/.test(record.translated)
    && likelyVisibleTarget.test(record.target)
    && !allowedExact.has(id)
    && !allowedExactTargets.has(record.target)
    && !/^!image \d+$/.test(record.translated)
    && !/[\d\s-]+(?:book_item|Book_PriceCatalogue|category_trinket)$/.test(record.translated)
    && record.translated !== "???/???/hide/true//???"
  ) {
    actionableExact.push(`${record.target} :: ${record.key} (${record.relative})`);
  }
}
if (actionableExact.length) {
  errors.push(...actionableExact.map((item) => `untranslated English fallback: ${item}`));
}

const report = {
  locale: LANGUAGE,
  translationDirectory: translationRoot,
  files: files.length,
  expectedFiles: expectedFiles.length,
  records: records.size,
  expectedRecords: EXPECTED_RECORDS,
  sourceRecords: sourceRecords.size,
  sourceMissing: sourceMissing.length,
  sourceExtra: sourceExtra.length,
  sourceTargets: sourceCache.size,
  eventRecords,
  glossaryRecords: Object.keys(malayalamGlossary ?? {}).length,
  glossaryExactRecords,
  glossaryConflicts: glossaryConflicts.size,
  shapedClusters: clusterDocument.entries.length,
  actionableExact: actionableExact.length,
  malayalamIncludes: actualIncludes.length,
  expectedIncludes: expectedIncludes.length,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
