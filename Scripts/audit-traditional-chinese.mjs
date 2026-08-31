#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const payloadRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload");
const translationRoot = path.join(payloadRoot, "assets/translations/traditional-chinese");
const batchRoot = path.join(projectRoot, "Documentation/traditional-chinese-batches");
const overridePath = path.join(projectRoot, "Documentation/traditional-chinese-editorial-overrides.json");
const englishGlossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const targetGlossaryPath = path.join(projectRoot, "Documentation/glossary/glossary.zh-TW.json");
const allowIncomplete = process.argv.includes("--allow-incomplete");
const errors = [];
const warnings = [];

function listJSONFiles(directory, prefix = "") {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

function duplicateJSONKeys(text) {
  let offset = 0;
  const duplicates = [];
  const skipWhitespace = () => { while (/\s/.test(text[offset] ?? "")) offset += 1; };
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
    if (text[offset] === "}") { offset += 1; return; }
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
      if (text[offset] === "}") { offset += 1; return; }
      if (text[offset] !== ",") throw new Error(`expected comma at ${offset}`);
      offset += 1;
    }
  };
  const parseArray = (jsonPath) => {
    offset += 1;
    skipWhitespace();
    if (text[offset] === "]") { offset += 1; return; }
    let index = 0;
    while (offset < text.length) {
      parseValue(`${jsonPath}[${index}]`);
      index += 1;
      skipWhitespace();
      if (text[offset] === "]") { offset += 1; return; }
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
      errors.push(`duplicate JSON key: ${path.relative(projectRoot, file)}: ${duplicate}`);
    }
    return JSON.parse(text);
  } catch (error) {
    errors.push(`invalid JSON: ${path.relative(projectRoot, file)}: ${error.message}`);
    return null;
  }
}

function markerSignature(value) {
  const sorted = (expression) => [...value.matchAll(expression)].map((match) => match[0]).sort();
  const count = (character) => [...value].filter((item) => item === character).length;
  return {
    contentPatcher: sorted(/\{\{[^}]+\}\}/g),
    substitutions: sorted(/\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    genderTokens: sorted(/\$\{[^}]+\}\$/g),
    brackets: sorted(/\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: sorted(/%[a-z][A-Za-z0-9_]*/g),
    dollar: sorted(/\$[A-Za-z0-9]+/g),
    typedItems: sorted(/\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sorted(/https?:\/\/[^\s)]+/g),
    at: count("@"), hash: count("#"), caret: count("^"), pipe: count("|"),
    slash: count("/"), backslash: count("\\"), angle: count("<"), newline: count("\n"),
  };
}

function materializeTranslation(record, source) {
  if (typeof record.translation === "string") return record.translation;
  if (!Array.isArray(record.replacements) && !Array.isArray(record.quotedTranslations)) return undefined;
  let translation = source;
  for (const replacement of record.replacements ?? []) {
    if (!Array.isArray(replacement) || ![2, 3].includes(replacement.length)
      || typeof replacement[0] !== "string" || !replacement[0].length
      || typeof replacement[1] !== "string"
      || (replacement[2] !== undefined && (!Number.isInteger(replacement[2]) || replacement[2] < 1))) {
      errors.push(`invalid replacement: ${record.target} :: ${record.key}`);
      return undefined;
    }
    const [from, to, expectedOccurrences = 1] = replacement;
    const occurrences = translation.split(from).length - 1;
    if (occurrences !== expectedOccurrences) {
      errors.push(`replacement source occurs ${occurrences} times: ${record.target} :: ${record.key}: ${from}`);
      return undefined;
    }
    translation = translation.split(from).join(to);
  }
  if (record.quotedTranslations !== undefined) {
    if (!Array.isArray(record.quotedTranslations)
      || record.quotedTranslations.some((value) => typeof value !== "string")) {
      errors.push(`invalid quoted translations: ${record.target} :: ${record.key}`);
      return undefined;
    }
    let quotedIndex = 0;
    translation = translation.replace(/"((?:\\.|[^"\\])*)"/g, (match) => {
      if (quotedIndex >= record.quotedTranslations.length) return match;
      return `"${record.quotedTranslations[quotedIndex++]}"`;
    });
    if (quotedIndex !== record.quotedTranslations.length
      || quotedIndex !== [...source.matchAll(/"((?:\\.|[^"\\])*)"/g)].length) {
      errors.push(`quoted translation count mismatch: ${record.target} :: ${record.key}`);
      return undefined;
    }
  }
  return translation;
}

const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    const document = readJSON(path.join(englishRoot, `${target}.json`));
    englishCache.set(target, document?.content);
  }
  return englishCache.get(target);
}

const translationFiles = listJSONFiles(translationRoot).sort();
const actual = new Map();
for (const relative of translationFiles) {
  const document = readJSON(path.join(translationRoot, relative));
  if (!document) continue;
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${relative}`);
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) {
    errors.push(`missing Changes: ${relative}`);
    continue;
  }
  for (const change of document.Changes) {
    if (change.Action !== "EditData" || typeof change.Target !== "string") {
      errors.push(`invalid change: ${relative}`);
      continue;
    }
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "zh-TW-vnrevival" })) {
      errors.push(`invalid language gate: ${relative}: ${change.Target}`);
    }
    if (!change.Entries || typeof change.Entries !== "object" || Array.isArray(change.Entries)) {
      errors.push(`missing Entries: ${relative}: ${change.Target}`);
      continue;
    }
    for (const [key, value] of Object.entries(change.Entries)) {
      const id = `${change.Target}\u0000${key}`;
      if (actual.has(id)) errors.push(`duplicate translation record: ${change.Target} :: ${key}`);
      if (typeof value !== "string") errors.push(`non-string translation: ${change.Target} :: ${key}`);
      actual.set(id, value);
    }
  }
}

const reviewed = new Map();
let reviewedPreserves = 0;
const overrideDocument = readJSON(overridePath);
const editorialOverrides = new Map();
let globalReplacements = [];
if (overrideDocument?.format !== 1 || !Array.isArray(overrideDocument?.records)
  || !Array.isArray(overrideDocument?.globalReplacements)) {
  errors.push("invalid Traditional Chinese editorial override document");
} else {
  globalReplacements = overrideDocument.globalReplacements;
  for (const replacement of globalReplacements) {
    if (!Array.isArray(replacement) || replacement.length !== 2
      || replacement.some((value) => typeof value !== "string") || !replacement[0]) {
      errors.push("invalid global Traditional Chinese editorial replacement");
    }
  }
  for (const record of overrideDocument.records) {
    const id = `${record.target}\u0000${record.key}`;
    if (editorialOverrides.has(id) || !Array.isArray(record.replacements)) errors.push(`invalid editorial override: ${record.target} :: ${record.key}`);
    editorialOverrides.set(id, record.replacements);
  }
}
const englishGlossary = readJSON(englishGlossaryPath) ?? [];
const targetGlossary = readJSON(targetGlossaryPath)?.["zh-TW"] ?? {};
const exactGlossaryLabels = new Map();
for (const entry of englishGlossary) {
  const target = targetGlossary[entry.id]?.term;
  if (!target) continue;
  const englishTerms = entry.term.split(/\s*\/\s*/);
  const targetTerms = target.split("／");
  if (targetTerms.length === 1) {
    for (const english of englishTerms) exactGlossaryLabels.set(english, targetTerms[0]);
  } else if (targetTerms.length === englishTerms.length) {
    englishTerms.forEach((english, index) => exactGlossaryLabels.set(english, targetTerms[index]));
  }
}
const batchFiles = listJSONFiles(batchRoot).sort();
for (const relative of batchFiles) {
  const batch = readJSON(path.join(batchRoot, relative));
  if (!batch) continue;
  if (!batch.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
    errors.push(`invalid batch header: ${relative}`);
    continue;
  }
  const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
  if (batch.records.length < minimum || batch.records.length > maximum) {
    errors.push(`invalid batch size: ${relative}: ${batch.records.length}`);
  }
  for (const record of batch.records) {
    const id = `${record.target}\u0000${record.key}`;
    if (reviewed.has(id)) errors.push(`duplicate reviewed record: ${record.target} :: ${record.key}`);
    reviewed.set(id, relative);
    const source = englishContent(record.target)?.[record.key];
    if (typeof source !== "string") {
      errors.push(`missing English source: ${record.target} :: ${record.key}`);
      continue;
    }
    if (record.source !== undefined && record.source !== source) {
      errors.push(`English source drift: ${record.target} :: ${record.key}`);
    }
    let expected = record.reviewedPreserve && record.translation === undefined && record.replacements === undefined
      ? source
      : materializeTranslation(record, source);
    if (typeof expected !== "string") {
      errors.push(`missing reviewed translation: ${record.target} :: ${record.key}`);
      continue;
    }
    if (record.reviewedPreserve && expected !== source) {
      errors.push(`invalid reviewed preserve base value: ${record.target} :: ${record.key}`);
    }
    for (const [from, to] of globalReplacements) expected = expected.split(from).join(to);
    if (overrideDocument?.exactGlossaryLabels) {
      const canonical = exactGlossaryLabels.get(source);
      if (canonical !== undefined) expected = canonical;
    }
    for (const replacement of editorialOverrides.get(id) ?? []) {
      if (!Array.isArray(replacement) || replacement.length !== 2 || !replacement.every((value) => typeof value === "string")) {
        errors.push(`invalid editorial replacement: ${record.target} :: ${record.key}`);
        continue;
      }
      const [from, to] = replacement;
      const occurrences = expected.split(from).length - 1;
      if (occurrences !== 1) errors.push(`editorial replacement source occurs ${occurrences} times: ${record.target} :: ${record.key}: ${from}`);
      else expected = expected.replace(from, to);
    }
    const finalPreserve = record.reviewedPreserve && expected === source;
    if (finalPreserve) reviewedPreserves += 1;
    else if (!/\p{Script=Han}/u.test(expected)) errors.push(`no Han script: ${record.target} :: ${record.key}`);
    if (actual.get(id) !== expected) errors.push(`reviewed value mismatch: ${record.target} :: ${record.key}`);
    if (JSON.stringify(markerSignature(source)) !== JSON.stringify(markerSignature(expected))) {
      errors.push(`marker mismatch: ${record.target} :: ${record.key}`);
    }
    const proseOnly = expected
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\$\{[^}]+\}\$/g, "")
      .replace(/\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\$[A-Za-z0-9]+|%[a-z][A-Za-z0-9_]*/g, "");
    if (!finalPreserve && (/\b(?:the|and|with|from|for|your|you|this|that|festival|bundle)\b/i.test(proseOnly)
      || /\bfarm\b/.test(proseOnly))) {
      errors.push(`English prose residue: ${record.target} :: ${record.key}`);
    }
  }
}

for (const id of editorialOverrides.keys()) if (!reviewed.has(id)) errors.push(`editorial override has no reviewed record: ${id.replace("\u0000", " :: ")}`);

for (const [from, to] of globalReplacements) {
  for (const [id, value] of actual) {
    if (value.includes(from)) {
      errors.push(`non-canonical Traditional Chinese form ${JSON.stringify(from)}; use ${JSON.stringify(to)}: ${id.replace("\u0000", " :: ")}`);
    }
  }
}

for (const [id, value] of actual) {
  if (/\p{Script=Han}Joja|Joja\p{Script=Han}/u.test(value)) {
    errors.push(`missing spacing around Joja: ${id.replace("\u0000", " :: ")}`);
  }
  const visibleEnglishName = value.match(/%[A-Z][a-z]+/);
  if (visibleEnglishName) {
    errors.push(`untranslated visible name ${JSON.stringify(visibleEnglishName[0])}: ${id.replace("\u0000", " :: ")}`);
  }
}

// Characters whose modern standard Traditional Chinese forms are unambiguous.
// Deliberately omit shared/ambiguous forms such as 划, 后, 里, and 么.
const simplifiedOnly = /[这们为与还对从会发时门问开关进过远边实头车电机级让给该总处务产动风鱼鸟马龙东乐长尔贝币习乡书买卖画话听顾欢据应仅经统绍续维线网语读写点数种类称叶阳阴队险难钱键锁错铁银铜铱钓锄镐镇农场岛国战争术师医药库厅万亿岁圣广罗泽玛鲁丽卢乔杰达纳欧莱苏萨宾梦灵矿盐烟鸡鸭猪猫树麦萝蓝绿红黄宝剑极齐际忆坏压飞冻颜额领驱骑馆谈亲爱学觉声显带条办选戏园丰决认兴刚备吗妈爷孙妇婴惊众劳势团围图圆钟饼饮饱饿脏]/u;
for (const [id, value] of actual) {
  const match = value.match(simplifiedOnly);
  if (match) errors.push(`Simplified Chinese character ${JSON.stringify(match[0])}: ${id.replace("\u0000", " :: ")}`);
}

if (translationFiles.length !== 151) errors.push(`patch file count is ${translationFiles.length}, expected 151`);
if (actual.size !== 14720) errors.push(`structure coverage is ${actual.size}, expected 14720`);
if (!allowIncomplete && reviewed.size !== 14720) errors.push(`reviewed coverage is ${reviewed.size}, expected 14720`);
for (const id of reviewed.keys()) if (!actual.has(id)) errors.push(`reviewed record absent from patches: ${id.replace("\u0000", " :: ")}`);

const packageConfig = readJSON(path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"));
if (!packageConfig?.languageCodes?.includes("zh-TW-vnrevival")) {
  errors.push("PackageConfig languageCodes omits zh-TW-vnrevival");
}
if (typeof packageConfig?.nativeLanguageName !== "string" || !packageConfig.nativeLanguageName.includes("繁體中文")) {
  errors.push("PackageConfig nativeLanguageName omits the Traditional Chinese display name");
}

const content = readJSON(path.join(payloadRoot, "content.json"));
if (content?.Format !== "2.9.0" || !Array.isArray(content?.Changes)) {
  errors.push("content.json lacks the root Format or Changes array");
}
const contentChanges = content?.Changes ?? [];
const traditionalChineseLanguage = contentChanges
  .find((change) => change.Action === "EditData" && change.Target === "Data/AdditionalLanguages")
  ?.Entries?.["{{ModId}}_TraditionalChinese"];
if (traditionalChineseLanguage?.LanguageCode !== "zh-TW-vnrevival"
  || traditionalChineseLanguage?.ButtonTexture !== "Mods/{{ModId}}/ButtonTraditionalChinese"
  || traditionalChineseLanguage?.UseLatinFont !== false
  || traditionalChineseLanguage?.FontFile !== "Fonts/ChineseTraditional"
  || traditionalChineseLanguage?.FontPixelZoom !== 3) {
  errors.push("content.json lacks the complete Traditional Chinese AdditionalLanguages entry");
}

function requireSingleLoad(target, fromFile, targetLocale) {
  const matching = contentChanges.filter((change) => change.Action === "Load"
    && change.Target === target && change.FromFile === fromFile
    && (targetLocale === undefined ? change.TargetLocale === undefined : change.TargetLocale === targetLocale));
  if (matching.length !== 1) {
    errors.push(`expected one Traditional Chinese load: ${target} <- ${fromFile}`);
  }
}
requireSingleLoad("Mods/{{ModId}}/ButtonTraditionalChinese", "assets/button-traditional-chinese.png");
requireSingleLoad("Minigames/TitleButtons", "assets/title/TitleButtons-traditional-chinese.png", "zh-TW-vnrevival");
requireSingleLoad("Fonts/SpriteFont1", "assets/fonts/traditional-chinese/SpriteFont1.xnb", "zh-TW-vnrevival");
requireSingleLoad("Fonts/SmallFont", "assets/fonts/traditional-chinese/SmallFont.xnb", "zh-TW-vnrevival");
requireSingleLoad("Fonts/ChineseTraditional", "assets/fonts/traditional-chinese/ChineseTraditional.xnb");
requireSingleLoad("Fonts/ChineseTraditional_0", "assets/fonts/traditional-chinese/ChineseTraditional_0.xnb");

const expectedIncludes = translationFiles.map((relative) => `assets/translations/traditional-chinese/${relative}`);
const allIncludes = contentChanges.filter((change) => change.Action === "Include").map((change) => change.FromFile);
for (const include of expectedIncludes) {
  if (allIncludes.filter((value) => value === include).length !== 1) {
    errors.push(`Traditional Chinese patch must be included exactly once: ${include}`);
  }
}
const traditionalChineseIncludes = allIncludes.filter((value) => value.startsWith("assets/translations/traditional-chinese/"));
if (traditionalChineseIncludes.length !== expectedIncludes.length) {
  errors.push(`Traditional Chinese include count is ${traditionalChineseIncludes.length}, expected ${expectedIncludes.length}`);
}

function verifyPNG(relative, width, height) {
  const file = path.join(payloadRoot, relative);
  if (!fs.existsSync(file)) {
    errors.push(`missing Traditional Chinese PNG: ${relative}`);
    return;
  }
  const buffer = fs.readFileSync(file);
  const signature = buffer.subarray(0, 8).toString("hex");
  const actualWidth = buffer.length >= 24 ? buffer.readUInt32BE(16) : -1;
  const actualHeight = buffer.length >= 24 ? buffer.readUInt32BE(20) : -1;
  if (signature !== "89504e470d0a1a0a" || actualWidth !== width || actualHeight !== height) {
    errors.push(`invalid Traditional Chinese PNG ${relative}: ${actualWidth}x${actualHeight}`);
  }
}
verifyPNG("assets/button-traditional-chinese.png", 174, 78);
verifyPNG("assets/title/TitleButtons-traditional-chinese.png", 400, 655);

for (const relative of [
  "assets/fonts/traditional-chinese/SpriteFont1.xnb",
  "assets/fonts/traditional-chinese/SmallFont.xnb",
  "assets/fonts/traditional-chinese/ChineseTraditional.xnb",
  "assets/fonts/traditional-chinese/ChineseTraditional_0.xnb",
]) {
  const file = path.join(payloadRoot, relative);
  if (!fs.existsSync(file) || fs.readFileSync(file).subarray(0, 3).toString("ascii") !== "XNB") {
    errors.push(`missing or invalid Traditional Chinese XNB: ${relative}`);
  }
}

const report = {
  patchFiles: translationFiles.length,
  records: actual.size,
  reviewedRecords: reviewed.size,
  reviewedPreserves,
  batchFiles: batchFiles.length,
  coveragePercent: Number(((reviewed.size / 14720) * 100).toFixed(3)),
  runtimeIncludes: traditionalChineseIncludes.length,
  warnings: warnings.length,
  errors: errors.length,
};
console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length || warnings.length ? 1 : 0;
