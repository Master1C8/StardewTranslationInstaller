#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { decodeBengali, mapsFromDocument, readClusterDocument } from "./bengali-clusters.mjs";

const sourceRoot = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
if (!sourceRoot) {
  console.error("Usage: node Scripts/audit-bengali.mjs <unpacked-English-assets-dir> [--require-includes]");
  process.exit(2);
}

const root = path.resolve(import.meta.dirname, "..");
const payloadRoot = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload");
const translationRoot = path.join(payloadRoot, "assets/translations/bengali");
const batchRoot = path.join(root, "Documentation/bengali-batches");
const clusterMapFile = path.join(root, "Documentation/bengali-cluster-map.json");
const clusterDecode = fs.existsSync(clusterMapFile)
  ? mapsFromDocument(readClusterDocument(clusterMapFile)).decode
  : new Map();
const errors = [];
const warnings = [];
const sourceCache = new Map();
const records = new Map();

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
}

function duplicateJsonKeys(text) {
  let offset = 0;
  const duplicates = [];
  const skip = () => { while (/\s/u.test(text[offset] ?? "")) offset += 1; };
  const parseString = () => {
    const start = offset++;
    while (offset < text.length) {
      if (text[offset] === "\\") offset += 2;
      else if (text[offset] === '"') return JSON.parse(text.slice(start, ++offset));
      else offset += 1;
    }
    throw new Error("unterminated string");
  };
  const parseValue = (jsonPath) => {
    skip();
    if (text[offset] === "{") return parseObject(jsonPath);
    if (text[offset] === "[") return parseArray(jsonPath);
    if (text[offset] === '"') return parseString();
    while (offset < text.length && !/[\s,\]}]/u.test(text[offset])) offset += 1;
    return undefined;
  };
  const parseObject = (jsonPath) => {
    const keys = new Set();
    offset += 1;
    skip();
    if (text[offset] === "}") { offset += 1; return; }
    while (offset < text.length) {
      skip();
      const key = parseString();
      const keyPath = `${jsonPath}.${key}`;
      if (keys.has(key)) duplicates.push(keyPath);
      keys.add(key);
      skip();
      if (text[offset++] !== ":") throw new Error(`expected colon at ${offset - 1}`);
      parseValue(keyPath);
      skip();
      if (text[offset] === "}") { offset += 1; return; }
      if (text[offset++] !== ",") throw new Error(`expected comma at ${offset - 1}`);
    }
  };
  const parseArray = (jsonPath) => {
    offset += 1;
    skip();
    if (text[offset] === "]") { offset += 1; return; }
    let index = 0;
    while (offset < text.length) {
      parseValue(`${jsonPath}[${index++}]`);
      skip();
      if (text[offset] === "]") { offset += 1; return; }
      if (text[offset++] !== ",") throw new Error(`expected comma at ${offset - 1}`);
    }
  };
  parseValue("$");
  return duplicates;
}

function readJson(file) {
  try {
    const text = fs.readFileSync(file, "utf8");
    for (const duplicate of duplicateJsonKeys(text)) errors.push(`duplicate JSON key: ${file}: ${duplicate}`);
    return JSON.parse(text);
  } catch (error) {
    errors.push(`invalid JSON: ${file}: ${error.message}`);
    return null;
  }
}

function sourceContent(target) {
  if (!sourceCache.has(target)) {
    const document = readJson(path.join(sourceRoot, `${target}.json`));
    sourceCache.set(target, document?.content);
  }
  return sourceCache.get(target);
}

function sortedMatches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}

function characterCount(value, character) {
  return [...value].filter((item) => item === character).length;
}

function eventSkeleton(value) {
  const firstQuote = value.indexOf('"');
  const prefix = firstQuote < 0 ? value : value.slice(0, firstQuote);
  const commandBeforeFirstQuote = /(?:^|\/)(?:speak|message|question|quickQuestion|textAboveHead|spriteText|end dialogue)\b/.test(prefix);
  let insideText = firstQuote >= 0 && !commandBeforeFirstQuote;
  let result = insideText ? "TEXT" : "";
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '"') {
      let backslashes = 0;
      for (let offset = index - 1; offset >= 0 && value[offset] === "\\"; offset -= 1) backslashes += 1;
      if (backslashes % 2 === 1) {
        if (!insideText) result += character;
        continue;
      }
      if (insideText) result += '"';
      else result += '"TEXT';
      insideText = !insideText;
    } else if (!insideText) result += character;
  }
  if (insideText) result += '"';
  return result.replace(/\/quickQuestion .*?\(break\)/g, "/quickQuestion CHOICES(break)");
}

function isEventScript(target, value) {
  if (target.startsWith("Data/Events/")) return true;
  return /(?:^|\/)(?:speak|message|question|quickQuestion|textAboveHead|pause|move|warp|faceDirection|playSound|viewport|skippable|end)(?: |\/|$)/.test(value);
}

const commonEnglishWords = new Set(`
about after again all also always am an and animal another any are around as ask at away back be because been before being best better big both but buy by can cannot come could day did do does doing don down each even ever every feel find first for found friend from get give go going good got had has have he hello help her here him his home how i if in into is it its just know last leave let like little long look made make many may me might more most much must my need never new no not now of off oh old on one only or other our out over own people please really right said say see she should so some something still take tell than thank that the their them then there they thing think this those time to today too try up us very want was way we well were what when where which who why will with work would year yes yet you your
`.trim().split(/\s+/));

function playerFacingText(target, original, translation) {
  if (target === "Strings/credits") return "";
  if (/^Data\/(?:AquariumFish|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|animationDescriptions|hats)$/.test(target)) return "";
  let value = translation;
  if (isEventScript(target, original)) value = [...translation.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((match) => match[1]).join(" ");
  if (target === "Data/Achievements") value = translation.split("^").slice(0, 2).join(" ");
  if (target === "Data/Quests") {
    const parts = translation.split("/");
    value = [parts[1], parts[2], parts[3], parts.at(-1)].join(" ");
  }
  return value
    .replace(/Xbox (?:One|360)/g, " ")
    .replace(/\/[A-Za-z][A-Za-z0-9_-]*(?:\s+[A-Za-z][A-Za-z0-9_-]*)?/g, " ")
    .replace(/%item\b[\s\S]*?%%/g, " ")
    .replace(/%revealtaste:[^%#$^|/\n]*/g, " ")
    .replace(/%[A-Za-z_][A-Za-z0-9_]*/g, " ")
    .replace(/\$query\s+[^#|]*/g, " ")
    .replace(/\$[qrdcp]\s+[^#|]*/g, " ")
    .replace(/#\$\d+\s+[^#]+#/g, " ")
    .replace(/\{\{[^}]+\}\}|\{[^}]+\}|\[[^\]]+\]|\$\{[^}]+\}\$/g, " ")
    .replace(/\$[A-Za-z0-9]+/g, " ")
    .replace(/https?:\/\/[^\s)]+/g, " ");
}

function markerSignature(value) {
  const withoutGenderBranches = value.replace(/\$\{[^{}]*\^[^{}]*\}\$/g, "");
  return {
    contentPatcher: sortedMatches(value, /\{\{[^}]+\}\}/g),
    substitutions: sortedMatches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: sortedMatches(value, /\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: sortedMatches(value, /%[a-z][A-Za-z0-9_]*/g),
    dollar: sortedMatches(value, /\$[A-Za-z0-9]+/g),
    dialogueControl: sortedMatches(
      value,
      /%item\b[\s\S]*?%%|%revealtaste:[^%#$^|/\n]*|\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+)|(?<=#)\$\d+\s+[^#]+(?=#)/g,
    ),
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sortedMatches(value, /https?:\/\/[^\s)]+/g),
    at: characterCount(value, "@"),
    hash: characterCount(value, "#"),
    caret: characterCount(withoutGenderBranches, "^"),
    pipe: characterCount(value, "|"),
    underscore: characterCount(value, "_"),
    backslash: characterCount(value, "\\"),
    newline: characterCount(value, "\n"),
  };
}

const files = listJsonFiles(translationRoot);
for (const relative of files) {
  const document = readJson(path.join(translationRoot, relative));
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
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "bn-vnrevival" })) {
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
    for (const [key, encoded] of Object.entries(change.Entries)) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${change.Target} :: ${key}`);
      const original = source[key];
      if (typeof original !== "string") errors.push(`missing English record: ${change.Target} :: ${key}`);
      if (typeof encoded !== "string") errors.push(`non-string translation: ${change.Target} :: ${key}`);
      const translation = typeof encoded === "string" ? decodeBengali(encoded, clusterDecode) : encoded;
      records.set(id, { target: change.Target, key, original, translation, relative });
      if (typeof translation !== "string" || typeof original !== "string") continue;
      if (process.argv.includes("--require-encoded") && /\p{Script=Bengali}/u.test(encoded)) {
        errors.push(`unencoded Bengali cluster: ${change.Target} :: ${key}`);
      }
      for (const character of encoded) {
        const codepoint = character.codePointAt(0);
        if (codepoint >= 0xE000 && codepoint <= 0xF8FF && !clusterDecode.has(character)) {
          errors.push(`unknown Bengali cluster glyph U+${codepoint.toString(16).toUpperCase()}: ${change.Target} :: ${key}`);
        }
      }
      if (!translation.length && original.length) errors.push(`empty translation: ${change.Target} :: ${key}`);
      if (translation.includes("�")) errors.push(`replacement character: ${change.Target} :: ${key}`);
      if (translation !== translation.normalize("NFC")) errors.push(`non-NFC translation: ${change.Target} :: ${key}`);
      if (JSON.stringify(markerSignature(original)) !== JSON.stringify(markerSignature(translation))) {
        errors.push(`marker mismatch: ${change.Target} :: ${key} (${relative})`);
      }
      if (
        /^Data\/(?:Achievements|AquariumFish|Boots|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|Quests|SecretNotes|animationDescriptions|hats)$/.test(change.Target)
        && characterCount(original, "/") !== characterCount(translation, "/")
      ) {
        errors.push(`structured slash mismatch: ${change.Target} :: ${key} (${relative})`);
      }
      if (isEventScript(change.Target, original) && eventSkeleton(original) !== eventSkeleton(translation)) {
        errors.push(`event structure mismatch: ${change.Target} :: ${key} (${relative})`);
      }
    }
  }
}

function referenceRecordIds(language) {
  const directory = path.join(payloadRoot, `assets/translations/${language}`);
  const result = new Set();
  for (const relative of listJsonFiles(directory)) {
    const document = readJson(path.join(directory, relative));
    for (const change of document?.Changes ?? []) {
      for (const key of Object.keys(change.Entries ?? {})) result.add(`${change.Target}\u0000${key}`);
    }
  }
  return result;
}

for (const language of ["polish"]) {
  const reference = referenceRecordIds(language);
  const missing = [...reference].filter((id) => !records.has(id));
  const extra = [...records.keys()].filter((id) => !reference.has(id));
  if (missing.length || extra.length) errors.push(`${language} structure differs: missing=${missing.length}, extra=${extra.length}`);
}

const reviewedIds = new Set();
const batchFiles = listJsonFiles(batchRoot);
let shortBatches = 0;
let longBatches = 0;
for (const relative of batchFiles) {
  const batch = readJson(path.join(batchRoot, relative));
  if (!batch?.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
    errors.push(`invalid batch document: ${relative}`);
    continue;
  }
  const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
  if (batch.kind === "short") shortBatches += 1;
  else longBatches += 1;
  if ((batch.records.length < minimum || batch.records.length > maximum) && !batch.complexityReason?.trim()) {
    errors.push(`batch size outside ${minimum}-${maximum} without complexity reason: ${relative}`);
  }
  for (const item of batch.records) {
    const id = `${item.target}\u0000${item.key}`;
    if (reviewedIds.has(id)) errors.push(`record appears in multiple batches: ${item.target} :: ${item.key}`);
    reviewedIds.add(id);
    const record = records.get(id);
    if (!record) {
      errors.push(`batch record does not exist: ${item.target} :: ${item.key}`);
      continue;
    }
    if (item.source !== record.original) errors.push(`batch English source drift: ${item.target} :: ${item.key}`);
    if (item.translation !== record.translation) errors.push(`batch translation not applied: ${item.target} :: ${item.key}`);
    if (item.reviewedPreserve) {
      if (item.translation !== item.source) errors.push(`reviewed preserve differs from English: ${item.target} :: ${item.key}`);
      if (!item.reason?.trim()) errors.push(`reviewed preserve lacks reason: ${item.target} :: ${item.key}`);
    } else {
      if (item.translation === item.source) errors.push(`source-identical record lacks reviewed preserve: ${item.target} :: ${item.key}`);
      if (!/\p{Script=Bengali}/u.test(item.translation ?? "")) errors.push(`translation has no Bengali script: ${item.target} :: ${item.key}`);
    }
    if (JSON.stringify(markerSignature(item.source ?? "")) !== JSON.stringify(markerSignature(item.translation ?? ""))) {
      errors.push(`batch marker mismatch: ${item.target} :: ${item.key}`);
    }
  }
}

for (const [id, record] of records) {
  if (record.translation !== record.original && !reviewedIds.has(id)) {
    errors.push(`changed translation is not in a completed batch: ${record.target} :: ${record.key}`);
  }
}

for (const [id, record] of records) {
  if (reviewedIds.has(id) && record.translation === record.original) continue;
  const visible = playerFacingText(record.target, record.original, record.translation);
  const residues = [...visible.matchAll(/(?<![A-Za-z%_])[A-Za-z]{3,}(?![A-Za-z_])/g)]
    .map((match) => match[0].toLowerCase())
    .filter((word) => commonEnglishWords.has(word));
  if (residues.length) {
    errors.push(`probable untranslated English word(s) ${[...new Set(residues)].join(", ")}: ${record.target} :: ${record.key}`);
  }
}

const bannedEditorialForms = new Map([
  ["সেবাস্তিয়ান", "সেবাস্টিয়ান"],
  ["ক্যারোলাইন", "ক্যারোলিন"],
  ["লাইন্যাস", "লিনাস"],
  ["ডিমেট্রিয়াস", "ডিমিট্রিয়াস"],
  ["ডেমেট্রিয়াস", "ডিমিট্রিয়াস"],
  ["হ্যালি", "হেইলি"],
  ["হেলি", "হেইলি"],
  ["ইভলিন", "এভলিন"],
  ["অ্যাবিগেল", "অ্যাবিগেইল"],
  ["হার্ভে", "হার্ভি"],
  ["রাজ্যপাল", "গভর্নর"],
  ["চাষাবাদ", "কৃষিকাজ"],
  ["পিকঅ্যাক্স", "পিক্যাক্স"],
  ["মরসুম", "ঋতু"],
]);
const untranslatedNarrationNames = /%(?:Abigail|Caroline|Clint|Demetrius|Elliott|Emily|Harvey|Marnie|Pam|Shane|Vincent)(?![A-Za-z])/;
for (const record of records.values()) {
  if (record.translation === record.original) continue;
  for (const [rejected, expected] of bannedEditorialForms) {
    if (record.translation.includes(rejected)) {
      errors.push(`noncanonical Bengali form ${JSON.stringify(rejected)}; expected ${JSON.stringify(expected)}: ${record.target} :: ${record.key}`);
    }
  }
  const untranslatedNarration = record.translation.match(untranslatedNarrationNames)?.[0];
  if (untranslatedNarration) {
    errors.push(`untranslated narrative name ${JSON.stringify(untranslatedNarration)}: ${record.target} :: ${record.key}`);
  }
}

const contextDependentDuplicateSources = new Set([
  "Hi, {0}",
  "None",
  "Blacksmith",
  "Question",
  "Hi!",
  "Honey",
  "Are you having fun, @? You need to remember to take breaks now and then too!",
  "her",
  "Ship 100,000g worth of freshly cooked items.",
  "Give 50 loved gifts in one week.",
]);
const translationsBySource = new Map();
for (const record of records.values()) {
  if (record.translation === record.original) continue;
  if (!translationsBySource.has(record.original)) translationsBySource.set(record.original, new Set());
  translationsBySource.get(record.original).add(record.translation);
}
for (const [source, translations] of translationsBySource) {
  if (translations.size > 1 && !contextDependentDuplicateSources.has(source)) {
    errors.push(`inconsistent duplicate source has ${translations.size} Bengali variants: ${JSON.stringify(source)}`);
  }
}

const englishGlossary = readJson(path.join(root, "Documentation/glossary/glossary.en.json"));
const bengaliGlossary = readJson(path.join(root, "Documentation/glossary/glossary.bn.json"))?.bn;
if (!Array.isArray(englishGlossary) || englishGlossary.length !== 673) errors.push("English glossary must contain 673 entries");
if (!bengaliGlossary || Object.keys(bengaliGlossary).length !== 673) errors.push("Bengali glossary must contain 673 entries");

const glossaryExactMap = new Map();
const glossaryConflicts = new Set();
function addGlossaryExact(source, translated) {
  if (!source || !translated) return;
  if (glossaryExactMap.has(source) && glossaryExactMap.get(source) !== translated) glossaryConflicts.add(source);
  else glossaryExactMap.set(source, translated);
}
for (const entry of englishGlossary ?? []) {
  const translated = bengaliGlossary?.[entry.id]?.term;
  addGlossaryExact(entry.term, translated);
  const sourceParts = entry.term.split(" / ");
  const translatedParts = translated?.split(" / ") ?? [];
  if (sourceParts.length === translatedParts.length) sourceParts.forEach((source, index) => addGlossaryExact(source, translatedParts[index]));
}
for (const conflict of glossaryConflicts) glossaryExactMap.delete(conflict);
for (const record of records.values()) {
  const expected = glossaryExactMap.get(record.original);
  if (expected !== undefined && record.translation !== expected) {
    errors.push(`glossary exact mismatch: ${record.target} :: ${record.key}; expected ${JSON.stringify(expected)}`);
  }
}

const content = readJson(path.join(payloadRoot, "content.json"));
const includes = (content?.Changes ?? []).filter((change) => change.Action === "Include").map((change) => change.FromFile);
if (new Set(includes).size !== includes.length) errors.push("duplicate Include entries");
const bengaliIncludes = includes.filter((file) => file.startsWith("assets/translations/bengali/"));
const expectedIncludes = files.map((file) => `assets/translations/bengali/${file}`);
if (
  (bengaliIncludes.length > 0 || process.argv.includes("--require-includes"))
  && JSON.stringify([...bengaliIncludes].sort()) !== JSON.stringify(expectedIncludes)
) {
  errors.push(`Bengali Include set differs: actual=${bengaliIncludes.length}, expected=${files.length}`);
}

const additionalLanguages = (content?.Changes ?? []).find(
  (change) => change.Action === "EditData" && change.Target === "Data/AdditionalLanguages",
)?.Entries;
const bengaliLanguage = additionalLanguages?.["{{ModId}}_Bengali"];
if (
  bengaliLanguage?.LanguageCode !== "bn-vnrevival"
  || bengaliLanguage?.ButtonTexture !== "Mods/{{ModId}}/ButtonBengali"
  || bengaliLanguage?.UseLatinFont !== false
  || bengaliLanguage?.FontFile !== "Fonts/Bengali"
  || bengaliLanguage?.FontPixelZoom !== 3
) errors.push("invalid Bengali AdditionalLanguages entry");
const requiredLoads = [
  ["Mods/{{ModId}}/ButtonBengali", undefined, "assets/button-bengali.png"],
  ["Minigames/TitleButtons", "bn-vnrevival", "assets/title/TitleButtons-bengali.png"],
  ["Fonts/SpriteFont1", "bn-vnrevival", "assets/fonts/bengali/SpriteFont1.xnb"],
  ["Fonts/SmallFont", "bn-vnrevival", "assets/fonts/bengali/SmallFont.xnb"],
  ["Fonts/Bengali", undefined, "assets/fonts/bengali/Bengali.xnb"],
  ["Fonts/Bengali_0", undefined, "assets/fonts/bengali/Bengali_0.xnb"],
];
for (const [target, locale, file] of requiredLoads) {
  const matches = (content?.Changes ?? []).filter(
    (change) => change.Action === "Load" && change.Target === target && change.TargetLocale === locale && change.FromFile === file,
  );
  if (matches.length !== 1) errors.push(`missing or duplicate Bengali Load: ${target} (${locale ?? "global"})`);
  if (!fs.existsSync(path.join(payloadRoot, file))) errors.push(`missing Bengali runtime asset: ${file}`);
}
const packageConfig = readJson(path.join(root, "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"));
if ((packageConfig?.languageCodes ?? []).filter((code) => code === "bn-vnrevival").length !== 1) errors.push("PackageConfig lacks exact Bengali language code");

const reviewed = reviewedIds.size;
const progressPercent = records.size ? Number(((reviewed / records.size) * 100).toFixed(3)) : 0;
const report = {
  files: files.length,
  records: records.size,
  sourceTargets: sourceCache.size,
  completedBatchFiles: batchFiles.length,
  shortBatches,
  longBatches,
  reviewed,
  unreviewed: records.size - reviewed,
  progressPercent,
  shapedClusters: clusterDecode.size,
  bengaliIncludes: bengaliIncludes.length,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length || warnings.length ? 1 : 0;
