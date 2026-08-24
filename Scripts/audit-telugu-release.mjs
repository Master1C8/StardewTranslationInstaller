#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeTelugu,
  mapsFromDocument,
  readClusterDocument,
} from "./telugu-clusters.mjs";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/audit-telugu-release.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const EXPECTED_FILES = 151;
const EXPECTED_RECORDS = 14720;
const EXPECTED_GLOSSARY = 673;
const LANGUAGE = "te-vnrevival";
const projectRoot = path.resolve(import.meta.dirname, "..");
const resourcesRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources");
const payloadRoot = path.join(resourcesRoot, "ModPayload");
const translationRoot = path.join(payloadRoot, "assets/translations/telugu");
const editorial = JSON.parse(fs.readFileSync(
  path.join(projectRoot, "Documentation/telugu-editorial-overrides.json"),
  "utf8",
));
const clusterDocument = readClusterDocument(
  path.join(projectRoot, "Documentation/telugu-cluster-map.json"),
);
const { decode: clusterDecode } = mapsFromDocument(clusterDocument);
const errors = [];
const warnings = [];

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  }).sort();
}

function duplicateJSONKeys(text) {
  let offset = 0;
  const duplicates = [];
  const skip = () => { while (/\s/.test(text[offset] ?? "")) offset += 1; };
  const string = () => {
    const start = offset++;
    while (offset < text.length) {
      if (text[offset] === "\\") offset += 2;
      else if (text[offset++] === '"') return JSON.parse(text.slice(start, offset));
    }
    throw new Error("unterminated string");
  };
  const value = (jsonPath) => {
    skip();
    if (text[offset] === "{") return object(jsonPath);
    if (text[offset] === "[") return array(jsonPath);
    if (text[offset] === '"') return string();
    while (offset < text.length && !/[\s,\]}]/.test(text[offset])) offset += 1;
  };
  const object = (jsonPath) => {
    const keys = new Set();
    offset += 1; skip();
    if (text[offset] === "}") { offset += 1; return; }
    while (offset < text.length) {
      skip(); const key = string(); const nextPath = `${jsonPath}.${key}`;
      if (keys.has(key)) duplicates.push(nextPath);
      keys.add(key); skip();
      if (text[offset++] !== ":") throw new Error("expected colon");
      value(nextPath); skip();
      if (text[offset] === "}") { offset += 1; return; }
      if (text[offset++] !== ",") throw new Error("expected comma");
    }
    throw new Error("unterminated object");
  };
  const array = (jsonPath) => {
    offset += 1; skip();
    if (text[offset] === "]") { offset += 1; return; }
    let index = 0;
    while (offset < text.length) {
      value(`${jsonPath}[${index++}]`); skip();
      if (text[offset] === "]") { offset += 1; return; }
      if (text[offset++] !== ",") throw new Error("expected comma");
    }
    throw new Error("unterminated array");
  };
  value("$"); skip();
  if (offset !== text.length) throw new Error("trailing data");
  return duplicates;
}

function readJSON(file) {
  try {
    const text = fs.readFileSync(file, "utf8");
    for (const duplicate of duplicateJSONKeys(text)) errors.push(`duplicate JSON key: ${file}: ${duplicate}`);
    return JSON.parse(text);
  } catch (error) {
    errors.push(`invalid JSON: ${file}: ${error.message}`);
    return null;
  }
}

function matches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}
function count(value, character) {
  return [...value].filter((item) => item === character).length;
}
function markerSignature(value) {
  return {
    contentPatcher: matches(value, /\{\{[^}]+\}\}/g),
    substitutions: matches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: matches(value, /\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: matches(value, /%[a-z][A-Za-z0-9_]*/g),
    dollar: matches(value, /\$[A-Za-z0-9]+/g),
    typedItems: matches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: matches(value, /https?:\/\/[^\s)]+/g),
    at: count(value, "@"), hash: count(value, "#"), caret: count(value, "^"),
    pipe: count(value, "|"), underscore: count(value, "_"), backslash: count(value, "\\"),
    newline: count(value, "\n"), plus: count(value, "+"), percentCharacter: count(value, "%"),
    dollarCharacter: count(value, "$"), lessThan: count(value, "<"), greaterThan: count(value, ">"),
    openSquareBracket: count(value, "["), closeSquareBracket: count(value, "]"), trailingSpace: / $/.test(value),
  };
}
function eventSkeleton(value) {
  return value.replace(/"(?:\\.|[^"\\])*"/g, '"TEXT"')
    .replace(/\/quickQuestion .*?\(break\)/g, "/quickQuestion CHOICES(break)");
}
function isEvent(target, value) {
  if (target.startsWith("Data/Events/")) return true;
  if (!target.startsWith("Data/Festivals/") && target !== "Strings/1_6_Strings" && target !== "Strings/Locations") return false;
  return /(?:^|\/)(?:speak|message|question|quickQuestion|textAboveHead|pause|move|warp|faceDirection|playSound|viewport|skippable|end)(?: |\/|$)/.test(value);
}

const sourceCache = new Map();
function englishContent(target) {
  if (!sourceCache.has(target)) sourceCache.set(target, readJSON(path.join(sourceRoot, `${target}.json`))?.content);
  return sourceCache.get(target);
}

const files = listJSONFiles(translationRoot);
const records = new Map();
let eventRecords = 0;
for (const relative of files) {
  const document = readJSON(path.join(translationRoot, relative));
  if (!document) continue;
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${relative}`);
  if (!Array.isArray(document.Changes) || !document.Changes.length) errors.push(`empty Changes: ${relative}`);
  for (const change of document.Changes ?? []) {
    if (change.Action !== "EditData" || typeof change.Target !== "string") errors.push(`invalid change: ${relative}`);
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: LANGUAGE })) errors.push(`invalid language gate: ${relative}`);
    if (!change.Entries || typeof change.Entries !== "object" || Array.isArray(change.Entries)) errors.push(`invalid Entries: ${relative}`);
    const source = englishContent(change.Target);
    if (!source) { errors.push(`missing English target: ${change.Target}`); continue; }
    for (const [key, encoded] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${id}`);
      if (typeof encoded !== "string") { errors.push(`non-string record: ${id}`); continue; }
      if (/[\u0C00-\u0C7F]/u.test(encoded)) errors.push(`unencoded Telugu text: ${id}`);
      for (const character of encoded) {
        const codepoint = character.codePointAt(0);
        if (codepoint >= 0xE000 && codepoint <= 0xF8FF && !clusterDecode.has(character)) {
          errors.push(`unknown Telugu cluster glyph: ${id}`);
        }
      }
      const translated = decodeTelugu(encoded, clusterDecode);
      const original = source[key];
      if (typeof original !== "string") { errors.push(`missing English record: ${id}`); continue; }
      records.set(id, { original, translated });
      const reviewed = editorial.records?.[id];
      const preserved = (editorial.preservedRecords ?? []).includes(id)
        || ((editorial.preservedTargets ?? []).includes(change.Target) && !reviewed);
      if (preserved ? translated !== original : reviewed?.english !== original || reviewed?.translation !== translated) {
        errors.push(`editorial mismatch: ${id}`);
      }
      if (translated !== translated.normalize("NFC")) errors.push(`non-NFC translation: ${id}`);
      if (JSON.stringify(markerSignature(original)) !== JSON.stringify(markerSignature(translated))) errors.push(`marker mismatch: ${id}`);
      if (isEvent(change.Target, original)) {
        eventRecords += 1;
        if (eventSkeleton(original) !== eventSkeleton(translated)) errors.push(`event structure mismatch: ${id}`);
      }
    }
  }
}

if (files.length !== EXPECTED_FILES) errors.push(`file count ${files.length}, expected ${EXPECTED_FILES}`);
if (records.size !== EXPECTED_RECORDS) errors.push(`record count ${records.size}, expected ${EXPECTED_RECORDS}`);

const content = readJSON(path.join(payloadRoot, "content.json"));
if (content?.Format !== "2.9.0") errors.push("invalid root Format");
const includes = (content?.Changes ?? []).filter((change) => change.Action === "Include").map((change) => change.FromFile);
if (new Set(includes).size !== includes.length) errors.push("duplicate Include entries");
const teluguIncludes = includes.filter((file) => file.startsWith("assets/translations/telugu/")).sort();
const expectedIncludes = files.map((file) => `assets/translations/telugu/${file}`);
if (JSON.stringify(teluguIncludes) !== JSON.stringify(expectedIncludes)) errors.push(`Telugu Include mismatch: ${teluguIncludes.length}/${expectedIncludes.length}`);
const additional = (content?.Changes ?? []).find((change) => change.Action === "EditData" && change.Target === "Data/AdditionalLanguages")?.Entries?.["{{ModId}}_Telugu"];
if (additional?.LanguageCode !== LANGUAGE || additional?.FontFile !== "Fonts/Telugu" || additional?.UseLatinFont !== false) errors.push("invalid Telugu AdditionalLanguages entry");
for (const required of [
  "assets/button-telugu.png", "assets/title/TitleButtons-telugu.png",
  "assets/fonts/telugu/SpriteFont1.xnb", "assets/fonts/telugu/SmallFont.xnb",
  "assets/fonts/telugu/Telugu.xnb", "assets/fonts/telugu/Telugu_0.xnb",
]) if (!fs.existsSync(path.join(payloadRoot, required))) errors.push(`missing asset: ${required}`);

const packageConfig = readJSON(path.join(resourcesRoot, "PackageConfig.json"));
if ((packageConfig?.languageCodes ?? []).filter((code) => code === LANGUAGE).length !== 1) errors.push("PackageConfig lacks exact Telugu language code");
const englishGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
const teluguGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.te.json"))?.te;
if (!Array.isArray(englishGlossary) || englishGlossary.length !== EXPECTED_GLOSSARY) errors.push("invalid English glossary count");
if (Object.keys(teluguGlossary ?? {}).length !== EXPECTED_GLOSSARY) errors.push("invalid Telugu glossary count");
if (JSON.stringify(Object.keys(teluguGlossary ?? {})) !== JSON.stringify((englishGlossary ?? []).map((entry) => entry.id))) errors.push("Telugu glossary ID/order mismatch");
for (const entry of englishGlossary ?? []) {
  const translated = teluguGlossary?.[entry.id];
  if (!translated?.term?.trim() || !translated?.meaning?.trim() || !/[\u0C00-\u0C7F]/u.test(translated.meaning)) errors.push(`invalid Telugu glossary entry: ${entry.id}`);
}

const report = {
  locale: LANGUAGE, files: files.length, records: records.size, sourceTargets: sourceCache.size,
  eventRecords, glossaryRecords: Object.keys(teluguGlossary ?? {}).length,
  shapedClusters: clusterDocument.entries.length, teluguIncludes: teluguIncludes.length,
  warnings: warnings.length, errors: errors.length,
};
console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
