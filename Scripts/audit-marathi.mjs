#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeMarathi,
  mapsFromDocument,
  readClusterDocument,
} from "./marathi-clusters.mjs";

const sourceRoot = process.argv[2];
const canonicalGlossaryFile = process.argv[3];
if (!sourceRoot) {
  console.error(
    "Usage: node Scripts/audit-marathi.mjs <unpacked-English-assets-dir> [glossary-translations.json]",
  );
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const rawMode = process.argv.includes("--raw");
const payloadRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const translationRoot = path.join(payloadRoot, "assets/translations/marathi");
const errors = [];
const warnings = [];
const sourceCache = new Map();
const records = new Map();
let eventRecords = 0;
let privateUseGlyphs = 0;
let rawMarathiScalars = 0;
let unknownPrivateUseGlyphs = 0;
const clusterDocument = rawMode
  ? { entries: [] }
  : readClusterDocument(path.join(projectRoot, "Documentation/marathi-cluster-map.json"));
const decode = rawMode ? new Map() : mapsFromDocument(clusterDocument).decode;

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

function collectReferenceValues(language) {
  const directory = path.join(payloadRoot, `assets/translations/${language}`);
  const result = new Map();
  for (const relative of listJSONFiles(directory)) {
    const document = readJSON(path.join(directory, relative));
    for (const change of document?.Changes ?? []) {
      for (const [key, value] of Object.entries(change.Entries ?? {})) {
        result.set(`${change.Target}\0${key}`, value);
      }
    }
  }
  return result;
}

const referenceValues = {
  russian: collectReferenceValues("russian"),
  polish: collectReferenceValues("polish"),
};

function referenceTechnicalMismatches(id, target, original, translated) {
  if (!/^Data\/(?:Achievements|AquariumFish|Boots|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|Quests|SecretNotes|animationDescriptions|hats)$/.test(target)) {
    return [];
  }
  const mismatches = [];
  for (const delimiter of ["^", "/"]) {
    const sourceParts = original.split(delimiter);
    const russianParts = referenceValues.russian.get(id)?.split(delimiter) ?? [];
    const polishParts = referenceValues.polish.get(id)?.split(delimiter) ?? [];
    const marathiParts = translated.split(delimiter);
    if (
      sourceParts.length < 2
      || sourceParts.length !== russianParts.length
      || sourceParts.length !== polishParts.length
      || sourceParts.length !== marathiParts.length
    ) continue;
    for (let index = 0; index < sourceParts.length; index += 1) {
      if (
        russianParts[index] === sourceParts[index]
        && polishParts[index] === sourceParts[index]
        && marathiParts[index] !== sourceParts[index]
      ) mismatches.push(`${JSON.stringify(delimiter)} field ${index}`);
    }
  }
  return mismatches;
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
    // These arguments are internal dialogue state/response identifiers, not
    // player-facing prose. Translating them silently breaks dialogue branches.
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

function eventSkeleton(value, target) {
  if (target === "Data/ExtraDialogue") {
    let result = value;
    const firstQuote = result.indexOf('"');
    if (firstQuote > 0 && !result.slice(0, firstQuote).includes("/")) {
      result = `TEXT${result.slice(firstQuote)}`;
    }
    return result.replace(
      /((?:^|\/)(?:speak\s+\S+|message|textAboveHead\s+\S+)\s+)"(?:\\.|[^"\\])*"/g,
      '$1"TEXT"',
    );
  }
  return value
    .replace(/"(?:\\.|[^"\\])*"/g, '"TEXT"')
    .replace(/\/quickQuestion .*?\(break\)/g, "/quickQuestion CHOICES(break)");
}

function isEventScript(target, value) {
  if (target.startsWith("Data/Events/")) return true;
  if (
    !target.startsWith("Data/Festivals/")
    && target !== "Data/ExtraDialogue"
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
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "mr-vnrevival" })) {
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

    for (const [key, gameFacing] of Object.entries(change.Entries)) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${change.Target} :: ${key}`);
      if (typeof gameFacing !== "string") {
        errors.push(`non-string translation: ${change.Target} :: ${key}`);
        continue;
      }
      if (!Object.hasOwn(source, key) || typeof source[key] !== "string") {
        errors.push(`missing English record: ${change.Target} :: ${key}`);
        continue;
      }
      const original = source[key];
      for (const character of gameFacing) {
        const scalar = character.codePointAt(0);
        if (scalar >= 0xE000 && scalar <= 0xF8FF) {
          privateUseGlyphs += 1;
          if (!decode.has(character)) unknownPrivateUseGlyphs += 1;
        }
        if ((scalar >= 0x0900 && scalar <= 0x097F) || (scalar >= 0xA8E0 && scalar <= 0xA8FF)) {
          rawMarathiScalars += 1;
        }
      }
      const translated = decodeMarathi(gameFacing, decode);
      records.set(id, { target: change.Target, key, original, translated, gameFacing, relative });
      if (!translated.length && original.length) errors.push(`empty translation: ${id}`);
      if (translated.includes("�")) errors.push(`replacement character: ${id}`);
      if (/(?:<+\s*ID\s*\d+\s*>+|@\s*VNRTERM\s*\d+)/iu.test(translated)) {
        errors.push(`unrestored translation placeholder: ${id}`);
      }
      if (/<{2,}[^<>\n]+>{2,}/u.test(translated)) {
        errors.push(`leaked glossary wrapper: ${id}`);
      }
      for (const mismatch of referenceTechnicalMismatches(id, change.Target, original, translated)) {
        errors.push(`reference technical field changed: ${id} (${relative}, ${mismatch})`);
      }
      if (/[.!?…।]{8,}/u.test(translated) && !/[.!?…।]{8,}/u.test(original)) {
        errors.push(`generated punctuation run: ${id}`);
      }
      const originalMarkers = markerSignature(original);
      const translatedMarkers = markerSignature(translated);
      if (JSON.stringify(originalMarkers) !== JSON.stringify(translatedMarkers)) {
        errors.push(
          `marker mismatch: ${change.Target} :: ${key} (${relative}): English=${JSON.stringify(originalMarkers)} Marathi=${JSON.stringify(translatedMarkers)}`,
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
        if (eventSkeleton(original, change.Target) !== eventSkeleton(translated, change.Target)) {
          errors.push(`event structure mismatch: ${change.Target} :: ${key} (${relative})`);
        }
        const originalTemporaryActors = sortedMatches(
          original,
          /(?:^|\/)addTemporaryActor\s+"(?:\\.|[^"\\])*"/g,
        );
        const translatedTemporaryActors = sortedMatches(
          translated,
          /(?:^|\/)addTemporaryActor\s+"(?:\\.|[^"\\])*"/g,
        );
        if (JSON.stringify(originalTemporaryActors) !== JSON.stringify(translatedTemporaryActors)) {
          errors.push(`event internal actor mismatch: ${change.Target} :: ${key} (${relative})`);
        }
      }
    }
  }
}

if (rawMode) {
  if (privateUseGlyphs > 0) errors.push(`raw Marathi patches contain ${privateUseGlyphs} private-use glyphs`);
  if (rawMarathiScalars === 0) errors.push("raw Marathi patches contain no Devanagari scalars");
} else {
  if (privateUseGlyphs === 0) errors.push("Marathi patches contain no shaped private-use glyphs");
  if (rawMarathiScalars > 0) errors.push(`Marathi patches contain ${rawMarathiScalars} raw Devanagari scalars`);
}
if (unknownPrivateUseGlyphs > 0) errors.push(`Marathi patches contain ${unknownPrivateUseGlyphs} unknown private-use glyphs`);

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
const marathiGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.mr.json"))?.mr;
if (!Array.isArray(englishGlossary) || englishGlossary.length !== 673) {
  errors.push(`English glossary count is ${englishGlossary?.length ?? "invalid"}, expected 673`);
}
if (!marathiGlossary || Object.keys(marathiGlossary).length !== 673) {
  errors.push(`Marathi glossary count is ${Object.keys(marathiGlossary ?? {}).length}, expected 673`);
}
for (const entry of englishGlossary ?? []) {
  const translated = marathiGlossary?.[entry.id];
  if (!translated?.term?.trim() || !translated?.meaning?.trim()) {
    errors.push(`missing Marathi glossary entry: ${entry.id}`);
  }
}
if (canonicalGlossaryFile) {
  const canonical = readJSON(path.resolve(canonicalGlossaryFile))?.mr;
  if (JSON.stringify(marathiGlossary) !== JSON.stringify(canonical)) {
    errors.push("local Marathi glossary differs from canonical SiteForMods layer");
  }
}

const content = readJSON(path.join(payloadRoot, "content.json"));
const includes = (content?.Changes ?? [])
  .filter((change) => change.Action === "Include")
  .map((change) => change.FromFile);
if (new Set(includes).size !== includes.length) errors.push("duplicate Include entries");
const marathiIncludes = includes.filter((file) => file.startsWith("assets/translations/marathi/"));
const expectedIncludes = files.map((file) => `assets/translations/marathi/${file}`);
if (JSON.stringify([...marathiIncludes].sort()) !== JSON.stringify(expectedIncludes)) {
  errors.push(`Marathi Include set differs: actual=${marathiIncludes.length}, expected=${files.length}`);
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
  const translated = marathiGlossary?.[entry.id]?.term;
  addGlossaryExact(entry.term, translated);
  const sourceParts = entry.term.split(" / ");
  const translatedParts = translated?.split(" / ") ?? [];
  if (sourceParts.length === translatedParts.length) {
    sourceParts.forEach((source, index) => addGlossaryExact(source, translatedParts[index]));
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
      `glossary exact mismatch: ${record.target} :: ${record.key} `
        + `(expected ${JSON.stringify(expected)}, got ${JSON.stringify(record.translated)})`,
    );
  }
}
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
  path.join(projectRoot, "Documentation/marathi-preserved-values.json"),
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

const compactUILimits = new Map([
  ["Strings/UI\0Character_FavoriteThing", 6],
  ["Strings/UI\0Character_Animal", 6],
  ["Strings/UI\0Character_EyeColor", 8],
  ["Strings/UI\0Character_HairColor", 8],
  ["Strings/UI\0Character_PantsColor", 8],
  ["Strings/UI\0Character_ShirtColor", 8],
  ["Strings/UI\0Character_DyeColor", 6],
  ["Strings/UI\0Character_Accessory", 6],
  ["Strings/UI\0Tailor_Feed", 8],
  ["Strings/UI\0Clothes_Dyeable", 16],
  ["Strings/UI\0AGO_CCB_Remixed", 12],
  ["Strings/UI\0PondQuery_EmptyPond", 13],
  ["Strings/UI\0CoopMenu_HostNewFarm", 22],
  ["Strings/UI\0mobile_options_date_time_size", 16],
  ["Strings/UI\0ParrotPlatform_Archaeology", 18],
  ["Strings/UI\0ShippingBin_LastItem", 16],
  ["Strings/UI\0ExitToTitle", 13],
  ["Strings/UI\0mobile_options_auto_save", 18],
  ["Strings/UI\0save_backup", 18],
  ["Strings/UI\0mobile_options_toolbar_slot_size", 15],
]);
const marathiSegmenter = new Intl.Segmenter("mr", { granularity: "grapheme" });
const graphemeLength = (value) => [...marathiSegmenter.segment(value)].length;
for (const [id, limit] of compactUILimits) {
  const value = records.get(id)?.translated;
  if (!value) {
    errors.push(`missing compact UI record: ${id.replace("\0", " :: ")}`);
    continue;
  }
  const longestLine = Math.max(...value.split("\n").map(graphemeLength));
  if (longestLine > limit) {
    errors.push(
      `compact UI text too long: ${id.replace("\0", " :: ")} (${longestLine} > ${limit})`,
    );
  }
}
const dateTemplate = records.get("Strings/StringsFromCSFiles\0Utility.cs.5678")?.translated;
const longestDate = dateTemplate
  ?.replace("{0}", "28")
  .replace("{1}", "वसंत ऋतू")
  .replace("{2}", "99");
if (!longestDate || graphemeLength(longestDate) > 36) {
  errors.push(`inventory date text too long: ${JSON.stringify(longestDate)}`);
}

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

const report = {
  files: files.length,
  records: records.size,
  sourceTargets: sourceCache.size,
  eventRecords,
  changedFromEnglish,
  automaticallyPreserved,
  glossaryPreserved,
  glossaryExactRecords,
  explicitPreserved,
  reviewedConservative,
  unreviewedExact,
  progressPercent,
  marathiIncludes: marathiIncludes.length,
  privateUseGlyphs,
  rawMarathiScalars,
  shapedClusters: clusterDocument.entries.length,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
