#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/audit-amharic.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const payloadRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const translationRoot = path.join(payloadRoot, "assets/translations/amharic");

const errors = [];
const warnings = [];
const sourceCache = new Map();
const records = new Map();
let eventRecords = 0;

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`invalid JSON: ${file}: ${error.message}`);
    return null;
  }
}

function sourceContent(target) {
  if (!sourceCache.has(target)) {
    const file = path.join(sourceRoot, `${target}.json`);
    const json = readJSON(file);
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
    at: count(value, "@"),
    hash: count(value, "#"),
    // Translators may add an Amharic male/female branch even when the English
    // source uses a gender-neutral form. Carets inside ${male^female}$ are not
    // line separators and therefore must not affect the structural signature.
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

const files = fs
  .readdirSync(translationRoot)
  .filter((file) => file.endsWith(".json"))
  .sort();

for (const fileName of files) {
  const file = path.join(translationRoot, fileName);
  const document = readJSON(file);
  if (!document) continue;
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${fileName}`);
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) {
    errors.push(`missing Changes: ${fileName}`);
    continue;
  }

  for (const change of document.Changes) {
    if (change.Action !== "EditData" || typeof change.Target !== "string") {
      errors.push(`invalid EditData change: ${fileName}`);
      continue;
    }
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "am-vnrevival" })) {
      errors.push(`invalid Language condition: ${fileName}`);
    }
    if (!change.Entries || typeof change.Entries !== "object") {
      errors.push(`missing Entries: ${fileName}`);
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
      records.set(id, { target: change.Target, key, translated, original, fileName });
      if (!translated.length && original.length) {
        errors.push(`empty translation: ${change.Target} :: ${key} (${fileName})`);
      }
      if (translated.includes("�")) {
        errors.push(`replacement character: ${change.Target} :: ${key} (${fileName})`);
      }
      if (translated.includes("ድረስ ድረስ")) {
        errors.push(`duplicated phrase: ${change.Target} :: ${key} (${fileName})`);
      }
      const before = markerSignature(original);
      const after = markerSignature(translated);
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        errors.push(`marker mismatch: ${change.Target} :: ${key} (${fileName})`);
      }

      if (
        /^Data\/(?:Achievements|AquariumFish|Boots|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|Quests|SecretNotes|animationDescriptions|hats)$/.test(change.Target)
        && count(original, "/") !== count(translated, "/")
      ) {
        errors.push(`structured slash mismatch: ${change.Target} :: ${key} (${fileName})`);
      }

      if (isEventScript(change.Target, original)) {
        eventRecords += 1;
        if (eventSkeleton(original) !== eventSkeleton(translated)) {
          errors.push(`event structure mismatch: ${change.Target} :: ${key} (${fileName})`);
        }
      }
    }
  }
}

function collectReferenceRecords(language) {
  const directory = path.join(payloadRoot, `assets/translations/${language}`);
  if (!fs.existsSync(directory)) return null;
  const result = new Set();
  for (const fileName of fs.readdirSync(directory).filter((file) => file.endsWith(".json"))) {
    const document = readJSON(path.join(directory, fileName));
    for (const change of document?.Changes ?? []) {
      for (const key of Object.keys(change.Entries ?? {})) {
        result.add(`${change.Target}\u0000${key}`);
      }
    }
  }
  return result;
}

for (const language of ["polish", "uzbek"]) {
  const reference = collectReferenceRecords(language);
  if (!reference) continue;
  const missing = [...reference].filter((id) => !records.has(id));
  const extra = [...records.keys()].filter((id) => !reference.has(id));
  if (missing.length || extra.length) {
    errors.push(`${language} structure differs: missing=${missing.length}, extra=${extra.length}`);
  }
}

const content = readJSON(path.join(payloadRoot, "content.json"));
if (content?.Format !== "2.9.0") errors.push("root content Format is not 2.9.0");
const includes = (content?.Changes ?? [])
  .filter((change) => change.Action === "Include")
  .map((change) => change.FromFile);
const expectedIncludes = files.map((file) => `assets/translations/amharic/${file}`);
const amharicIncludes = includes.filter((file) => file.startsWith("assets/translations/amharic/"));
if (JSON.stringify([...amharicIncludes].sort()) !== JSON.stringify(expectedIncludes)) {
  errors.push(`Amharic Include set differs: actual=${amharicIncludes.length}, expected=${expectedIncludes.length}`);
}
if (new Set(includes).size !== includes.length) errors.push("duplicate Include entries");

const allowedExact = new Set([
  "Strings/Objects\u0000DeluxeSpeedGro_Name",
  "Strings/Objects\u0000HyperSpeedGro_Name",
  "Strings/Objects\u0000SpeedGro_Name",
  "Strings/BigCraftables\u0000HMTGF_Name",
  "Strings/BigCraftables\u0000HMTGF_Description",
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

const likelyVisibleTarget = /^(Characters\/Dialogue|Strings\/(?!credits)|Data\/(Achievements|Boots|Bundles|EngagementDialogue|ExtraDialogue|Fish|Furniture|Monsters|NPCGiftTastes|Quests|SecretNotes|mail|hats))/;
const actionableExact = [];
for (const [id, record] of records) {
  if (
    record.translated === record.original
    && /[A-Za-z]{3}/.test(record.translated)
    && likelyVisibleTarget.test(record.target)
    && !allowedExact.has(id)
    && !/^!image \d+$/.test(record.translated)
    && !/^[\d\s-]+(?:book_item|Book_PriceCatalogue|category_trinket)$/.test(record.translated)
    && record.translated !== "???/???/hide/true//???"
  ) {
    actionableExact.push(`${record.target} :: ${record.key} (${record.fileName})`);
  }
}
if (actionableExact.length) {
  errors.push(...actionableExact.map((item) => `untranslated exact value: ${item}`));
}

const asciiGenderBranches = [...records.values()].filter((record) =>
  /\$\{[^}]*[A-Za-z][^}]*\}\$/.test(record.translated),
);
if (asciiGenderBranches.length) {
  errors.push(
    ...asciiGenderBranches.map(
      (record) => `English gender branch: ${record.target} :: ${record.key} (${record.fileName})`,
    ),
  );
}

const asciiChoiceLabels = [...records.values()].filter(
  (record) => /\$y\b/.test(record.translated) && /_[A-Za-z][A-Za-z ]+_/.test(record.translated),
);
if (asciiChoiceLabels.length) {
  errors.push(
    ...asciiChoiceLabels.map(
      (record) => `English choice label: ${record.target} :: ${record.key} (${record.fileName})`,
    ),
  );
}

const report = {
  files: files.length,
  records: records.size,
  eventRecords,
  includes: includes.length,
  sourceTargets: sourceCache.size,
  actionableExact: actionableExact.length,
  asciiGenderBranches: asciiGenderBranches.length,
  asciiChoiceLabels: asciiChoiceLabels.length,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
