#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { decodeHindi, mapsFromDocument, readClusterDocument } from "./hindi-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const payloadRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const translationRoot = path.join(payloadRoot, "assets/translations/hindi");
const batchRoot = path.join(projectRoot, "Documentation/hindi-batches");
const clusterMapFile = path.join(projectRoot, "Documentation/hindi-cluster-map.json");
const requireEncoded = process.argv.includes("--encoded");
const errors = [];
const warnings = [];

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
      errors.push(`duplicate JSON key: ${path.relative(projectRoot, file)}: ${duplicate}`);
    }
    return JSON.parse(text);
  } catch (error) {
    errors.push(`invalid JSON: ${path.relative(projectRoot, file)}: ${error.message}`);
    return null;
  }
}

function sortedMatches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}

function count(value, character) {
  return [...value].filter((item) => item === character).length;
}

function markerSignature(value) {
  return {
    contentPatcher: sortedMatches(value, /\{\{[^}]+\}\}/g),
    substitutions: sortedMatches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: sortedMatches(
      value,
      /\[(?:#|image|link|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g,
    ),
    percent: sortedMatches(value, /%[a-z][A-Za-z0-9_]*/g),
    percentSign: count(value, "%"),
    dollar: sortedMatches(value, /\$[A-Za-z0-9]+/g),
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sortedMatches(value, /https?:\/\/[^\s)]+/g),
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(value, "^"),
    pipe: count(value, "|"),
    slash: count(value, "/"),
    backslash: count(value, "\\"),
    angleHeart: count(value, "<"),
    newline: count(value, "\n"),
  };
}

let clusterDecode = new Map();
let clusterEntries = 0;
if (fs.existsSync(clusterMapFile)) {
  try {
    const document = readClusterDocument(clusterMapFile);
    clusterEntries = document.entries?.length ?? 0;
    clusterDecode = mapsFromDocument(document).decode;
  } catch (error) {
    errors.push(`invalid Hindi cluster map: ${error.message}`);
  }
} else if (requireEncoded) {
  errors.push("missing Documentation/hindi-cluster-map.json");
}

const translationFiles = listJSONFiles(translationRoot).sort();
const actual = new Map();
let encodedScalars = 0;
let rawHindiScalars = 0;
for (const relative of translationFiles) {
  const document = readJSON(path.join(translationRoot, relative));
  if (!document) continue;
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${relative}`);
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) {
    errors.push(`missing Changes: ${relative}`);
    continue;
  }
  for (const change of document.Changes) {
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "hi-vnrevival" })) {
      errors.push(`invalid language gate: ${relative}: ${change.Target}`);
    }
    if (!change.Entries || typeof change.Entries !== "object" || Array.isArray(change.Entries)) {
      errors.push(`missing Entries: ${relative}: ${change.Target}`);
      continue;
    }
    for (const [key, encodedValue] of Object.entries(change.Entries)) {
      if (typeof encodedValue !== "string") {
        errors.push(`non-string translation: ${change.Target} :: ${key}`);
        continue;
      }
      for (const scalar of encodedValue) {
        const codepoint = scalar.codePointAt(0);
        if (codepoint >= 0xE000 && codepoint <= 0xF8FF) encodedScalars += 1;
        if ((codepoint >= 0x0900 && codepoint <= 0x097F)
          || (codepoint >= 0xA8E0 && codepoint <= 0xA8FF)) rawHindiScalars += 1;
      }
      const value = clusterDecode.size ? decodeHindi(encodedValue, clusterDecode) : encodedValue;
      if (/[\uE000-\uF8FF]/u.test(value)) {
        errors.push(`unmapped private-use glyph: ${change.Target} :: ${key}`);
      }
      const id = `${change.Target}\u0000${key}`;
      if (actual.has(id)) errors.push(`duplicate translation record: ${change.Target} :: ${key}`);
      actual.set(id, value);
    }
  }
}

const englishCache = new Map();
function englishContent(target) {
  if (!englishCache.has(target)) {
    const document = readJSON(path.join(englishRoot, `${target}.json`));
    englishCache.set(target, document?.content);
  }
  return englishCache.get(target);
}

function expectedTranslation(record, source) {
  if (record.reviewedPreserve && record.translation === undefined && !record.replacements) return source;
  if (!Array.isArray(record.replacements)) return record.translation;
  let result = source;
  for (const replacement of record.replacements) {
    if (!Array.isArray(replacement) || replacement.length !== 2) {
      errors.push(`invalid replacement pair: ${record.target} :: ${record.key}`);
      return "";
    }
    const [from, to] = replacement;
    const first = result.indexOf(from);
    if (first < 0 || result.indexOf(from, first + from.length) >= 0) {
      errors.push(`non-unique replacement: ${record.target} :: ${record.key} :: ${JSON.stringify(from)}`);
      return "";
    }
    result = `${result.slice(0, first)}${to}${result.slice(first + from.length)}`;
  }
  return result;
}

const batchFiles = fs.readdirSync(batchRoot).filter((name) => name.endsWith(".json")).sort();
const reviewed = new Map();
let reviewedPreserves = 0;
for (const filename of batchFiles) {
  const batch = readJSON(path.join(batchRoot, filename));
  if (!batch) continue;
  if (!batch.id || !["short", "long"].includes(batch.kind) || !Array.isArray(batch.records)) {
    errors.push(`invalid batch header: ${filename}`);
    continue;
  }
  const [minimum, maximum] = batch.kind === "short" ? [40, 80] : [15, 30];
  if (batch.records.length < minimum || batch.records.length > maximum) {
    errors.push(`invalid batch size: ${filename}: ${batch.records.length}`);
  }
  for (const record of batch.records) {
    const id = `${record.target}\u0000${record.key}`;
    if (reviewed.has(id)) errors.push(`duplicate reviewed record: ${record.target} :: ${record.key}`);
    reviewed.set(id, filename);
    const source = englishContent(record.target)?.[record.key];
    if (typeof source !== "string") {
      errors.push(`missing English source: ${record.target} :: ${record.key}`);
      continue;
    }
    if (record.source !== undefined && record.source !== source) {
      errors.push(`English source drift: ${record.target} :: ${record.key}`);
    }
    const expected = expectedTranslation(record, source);
    const current = actual.get(id);
    if (current !== expected) errors.push(`reviewed value mismatch: ${record.target} :: ${record.key}`);
    if (JSON.stringify(markerSignature(source)) !== JSON.stringify(markerSignature(current ?? ""))) {
      errors.push(`marker mismatch: ${record.target} :: ${record.key}`);
    }
    if (record.reviewedPreserve) {
      reviewedPreserves += 1;
      if (expected !== source) errors.push(`invalid reviewed preserve: ${record.target} :: ${record.key}`);
      continue;
    }
    if (!/\p{Script=Devanagari}/u.test(current ?? "")) {
      errors.push(`no Hindi script: ${record.target} :: ${record.key}`);
    }
    const proseOnly = (current ?? "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\bchangeLocation Farm\b/g, "")
      .replace(/\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\$[A-Za-z0-9]+|%farm Farm|%[a-z][A-Za-z0-9_]*/g, "");
    if (/\b(?:the|and|with|from|for|your|you|this|that|fish|farm|festival|bundle)\b/i.test(proseOnly)) {
      errors.push(`English prose residue: ${record.target} :: ${record.key}`);
    }
    if (/\$\{[^}]*[A-Za-z][^}]*\}\$/u.test(current ?? "")) {
      errors.push(`untranslated gender branch: ${record.target} :: ${record.key}`);
    }
    if (record.target.startsWith("Data/Events/")) {
      for (const match of (current ?? "").matchAll(/quickQuestion ([^/]+?)(?=\(break\)|\/)/g)) {
        if (/[A-Za-z]{2}/.test(match[1])) {
          errors.push(`English quick-question choice: ${record.target} :: ${record.key}`);
        }
      }
    }
  }
}

if (translationFiles.length !== 151) errors.push(`Hindi patch file count is ${translationFiles.length}, expected 151`);
if (actual.size !== 14720) errors.push(`Hindi structure coverage is ${actual.size}, expected 14720`);
if (reviewed.size !== 14720) errors.push(`Hindi reviewed coverage is ${reviewed.size}, expected 14720`);
for (const id of actual.keys()) if (!reviewed.has(id)) errors.push(`unreviewed translation record: ${id.replace("\u0000", " :: ")}`);

for (const [variant, canonical] of [
  ["जोजा कॉर्पोरेशन", "जोजा निगम"],
  ["कम्युनिटी सेंटर", "सामुदायिक केंद्र"],
  ["स्टारड्यू घाटी", "स्टारड्यू वैली"],
  ["पेलिकन नगर", "पेलिकन टाउन"],
  ["जिंजर आइलैंड", "जिंजर द्वीप"],
  ["कैलिको रेगिस्तान", "कैलिको मरुस्थल"],
  ["स्कल कैवर्न", "खोपड़ी गुफ़ा"],
  ["कैरोलिन", "कैरोलाइन"],
  ["एलियट", "इलियट"],
  ["हार्वे", "हार्वी"],
  ["लिआ", "लिया"],
  ["लिनस", "लायनस"],
  ["लाइनस", "लायनस"],
  ["विंसेंट", "विन्सेंट"],
  ["रैसमोडियस", "रास्मोडियस"],
  ["गन्थर", "गुंथर"],
  ["जोजा मार्ट", "जोजामार्ट"],
  ["ज़ूज़ू शहर", "ज़ूज़ू नगर"],
  ["रिसॉर्ट", "रिज़ॉर्ट"],
  ["फर्न द्वीपसमूह", "फ़र्न द्वीपसमूह"],
  ["फर्नगिल", "फ़र्नगिल"],
  ["गोटोरो", "गोतोरो"],
  ["गवर्नर", "राज्यपाल"],
  ["मेयर लुईस", "महापौर लुईस"],
  ["दादा जी", "दादाजी"],
  ["डायरी का फटा पन्ना", "दैनिकी का पन्ना"],
  ["स्लाइम ऊष्मायित्र", "स्लाइम अंडा सेने की मशीन"],
  ["स्लाइम अंडा-सेचक", "स्लाइम अंडा सेने की मशीन"],
  ["कैलिको मूर्ति", "कैलिको प्रतिमा"],
  ["गाने वाला पत्थर", "गाता पत्थर"],
  ["अबीगैल", "एबिगेल"],
  ["कैरोलीन", "कैरोलाइन"],
  ["आत्माओं की पूर्वसंध्या", "आत्माओं की संध्या"],
  ["साहसिक संघ", "साहसी संघ"],
  ["सुनहरे अखरोट", "स्वर्ण अखरोट"],
  ["ग्रैम्पलटन", "ग्राम्पलटन"],
  ["बस स्टॉप", "बस अड्डा"],
  ["स्नानागार", "स्नानगृह"],
  ["नख़लिस्तान", "मरूद्यान"],
  ["नखलिस्तान", "मरूद्यान"],
  ["मरुद्यान", "मरूद्यान"],
  ["हार्वी के क्लिनिक", "हार्वी के चिकित्सालय"],
  ["हार्वी का क्लिनिक", "हार्वी का चिकित्सालय"],
  ["जादूगर की मीनार", "जादूगर मीनार"],
  ["स्लाइम बाड़ा", "स्लाइम गृह"],
  ["चुड़ैल की झोंपड़ी", "चुड़ैल की कुटिया"],
  ["सामुदायिक उन्नयन", "समुदाय उन्नयन"],
  ["ट्राउट डर्बी", "ट्राउट स्पर्धा"],
  ["चटनी की रानी", "सॉस की रानी"],
  ["कारीगर वस्तुएँ", "कारीगरी उत्पाद"],
  ["वीरान जोजामार्ट", "परित्यक्त जोजामार्ट"],
  ["डीलक्स चीज़ प्रेस", "डीलक्स पनीर प्रेस"],
  ["तत्व युद्ध", "तत्त्व युद्ध"],
  ["सीवर पाइप", "नाली पाइप"],
  ["साइलो", "चारा-भंडार"],
  ["हरी बारिश", "हरी वर्षा"],
  ["ख़ास ऑर्डर", "विशेष आदेश"],
  ["पियरे की जनरल स्टोर", "पियरे की किराना दुकान"],
  ["खोई किताब", "खोई पुस्तक"],
  ["सूचना-पट्ट", "सूचना पट्ट"],
]) {
  for (const [id, value] of actual) {
    if (value.includes(variant)) errors.push(`forbidden terminology variant ${variant} -> ${canonical}: ${id.replace("\u0000", " :: ")}`);
  }
}

for (const [id, value] of actual) {
  for (const [variant, canonical] of [
    ["पाम", "पैम"],
    ["जस", "जैस"],
    ["मरु", "मारू"],
  ]) {
    const expression = new RegExp(`(?<![\\p{L}\\p{M}])${variant}(?![\\p{L}\\p{M}])`, "u");
    if (expression.test(value)) {
      errors.push(`forbidden character spelling ${variant} -> ${canonical}: ${id.replace("\u0000", " :: ")}`);
    }
  }
}

// Player-facing Hindi must not silently assume a masculine or feminine farmer.
// The allowlists contain dialogue between named NPCs (or agreement with a noun
// other than the farmer), not player-directed gender agreement.
const directPlayerGender = /(?:तुम|आप)\s+[^।!?#$\n]{0,45}(?:गए|गई|आए|आई|करते|करती|रहे|रही|चाहते|चाहती|लगते|लगती|थके|थकी|अच्छे|अच्छी|प्यारे|प्यारी|बुरे|बुरी|खड़े|खड़ी|बैठे|बैठी|वाले|वाली|होगे|होगी|चाहोगे|चाहोगी|जाओगे|जाओगी|करोगे|करोगी|सकते|सकती|देखते|देखती|जानते|जानती|रखते|रखती|बन गए|बन गई|हो चुके|हो चुकी|सच्चे|सच्ची|समझदार)/u;
const directPlayerGenderAllowlist = new Set([
  "Characters/Dialogue/Sandy\u0000Thu4", // कर सकती हूँ: Sandy is the subject.
  "Characters/Dialogue/Evelyn\u0000Tue", // अच्छी दोस्ती: adjective agrees with friendship.
]);
const secondPersonGenderEnding = /(?:[\p{L}\p{M}]+ोगे|(?:कर|रह|चाह|लग|जान|समझ|देख|सुन|रख|बन|मिल|चल|बोल|सोच|खेल|खा|पी|सो|जी|हार|जीत|बैठ|खड़)[\p{L}\p{M}]*ते हो|(?:कर|रह|चाह|लग|जान|समझ|देख|सुन|रख|बन|मिल|चल|बोल|सोच|खेल|खा|पी|सो|जी|हार|जीत|बैठ|खड़)[\p{L}\p{M}]*ती हो|(?:आ|जा|पहुँच|लौट|बन|हो|उठ|चल)[\p{L}\p{M}]* गए हो|(?:आ|जा|पहुँच|लौट|बन|हो|उठ|चल)[\p{L}\p{M}]* गई हो|(?:अच्छे|अच्छी|प्यारे|प्यारी|थके|थकी|डरे|डरी|भीगे|भीगी|खड़े|खड़ी) हो)/u;
const secondPersonGenderEndingAllowlist = new Set([
  "Characters/Dialogue/rainy\u0000Sebastian", // अच्छी agrees with luck.
  "Characters/Dialogue/MarriageDialogueAlex\u0000Outdoor_0", // Alex is standing.
  "Characters/Dialogue/MarriageDialoguePenny\u0000Indoor_Day_3", // रहते agrees with ancient farmers.
  "Characters/Dialogue/Haley\u0000summer_10", // प्यारे agrees with rabbits.
  "Characters/Dialogue/Emily\u0000winter_Tue", // आ गई agrees with skill.
  "Characters/Dialogue/Emily\u0000winter_Tue2", // हो गई agrees with mastery.
  "Characters/Dialogue/Penny\u0000winter_Fri2", // अच्छे agrees with Linus.
  "Characters/Dialogue/Emily\u0000AcceptGift_(O)64", // अच्छे agrees with rubies.
  "Characters/Dialogue/Emily\u0000fall_15", // सहेलियाँ/गई agree with named women and bus.
  "Characters/Dialogue/Emily\u0000winter_Thu", // जाती agrees with fish.
  "Characters/Dialogue/Evelyn\u0000Fri", // अच्छी agrees with fresh air.
  "Characters/Dialogue/Kent\u0000Resort_Shore", // Kent is standing.
  "Characters/Dialogue/Leah\u0000summer_Tue4", // अच्छी agrees with things.
  "Characters/Dialogue/Leo\u0000Fri", // रहते agrees with bird families.
  "Characters/Dialogue/Marnie\u0000Mon4", // होते agrees with animals.
  "Characters/Dialogue/Sandy\u0000AcceptGift_(O)402", // प्यारी agrees with fragrance.
  "Characters/Dialogue/Sebastian\u0000Resort_Towel", // अच्छी agrees with the world.
]);
const contextualPlayerGender = /(?:तुम|आप)[^।!?#$\n]{0,55}(?:आ गए|आ गई|आए थे|आई थीं|गए थे|गई थीं|रहे हो|रही हो|करते हो|करती हो|चाहते हो|चाहती हो|लगते हो|लगती हो|खड़े हो|खड़ी हो|बैठे हो|बैठी हो|वाले हो|वाली हो|तैयार हो गए|तैयार हो गई)/u;
const contextualPlayerGenderAllowlist = new Set([
  "Characters/Dialogue/Caroline\u0000fall_Mon_inlaw_Abigail",
  "Strings/Notes\u00003",
  "Data/ExtraDialogue\u0000SummitEvent_Dialogue3_Emily",
  "Data/Events/Forest\u0000choseMinerals",
  "Data/Events/SeedShop\u000017/f Caroline 1500/p Caroline/p Abigail",
  "Data/Events/JoshHouse\u000021/f Alex 1250/p Alex",
  "Data/Events/HaleyHouse\u000011/f Haley 500/p Haley/p Emily",
  "Data/Events/Town\u000045/f Sam 1500/t 1200 1600/w sunny",
  "Data/Events/AnimalShop\u00003910974/f Shane 1700/e 3910975/p Shane",
  "Data/Events/Trailer\u000035/f Penny 1000/p Penny",
  "Data/Events/Forest\u00003910979/f Vincent 2000/f Jas 2000/t 600 1700/z summer/z fall/z winter/w sunny",
  "Data/Events/ManorHouse\u00002123243/e 2111194",
  "Strings/schedules/Caroline\u0000Tue.001",
  "Strings/schedules/Sebastian\u0000summer_4.001",
]);
for (const [id, value] of actual) {
  if (id.startsWith("Characters/Dialogue/")
    && !value.includes("^")
    && !value.includes("${")
    && directPlayerGender.test(value)
    && !directPlayerGenderAllowlist.has(id)) {
    errors.push(`player-directed gender agreement: ${id.replace("\u0000", " :: ")}`);
  }
  if (id.startsWith("Characters/Dialogue/")
    && !value.includes("^")
    && !value.includes("${")
    && secondPersonGenderEnding.test(value)
    && !secondPersonGenderEndingAllowlist.has(id)) {
    errors.push(`player-directed gender ending: ${id.replace("\u0000", " :: ")}`);
  }
}

const packageConfig = readJSON(path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/PackageConfig.json",
));
if (!packageConfig?.languageCodes?.includes("hi-vnrevival")) {
  errors.push("PackageConfig languageCodes omits hi-vnrevival");
}
const content = readJSON(path.join(payloadRoot, "content.json"));
const changes = content?.Changes ?? [];
const hindiLanguage = changes
  .find((change) => change.Action === "EditData" && change.Target === "Data/AdditionalLanguages")
  ?.Entries?.["{{ModId}}_Hindi"];
if (hindiLanguage?.LanguageCode !== "hi-vnrevival"
  || hindiLanguage?.UseLatinFont !== false
  || hindiLanguage?.FontFile !== "Fonts/Hindi") {
  errors.push("content.json lacks the complete Hindi AdditionalLanguages entry");
}
const expectedIncludes = translationFiles.map((relative) => `assets/translations/hindi/${relative}`);
const includes = changes.filter((change) => change.Action === "Include").map((change) => change.FromFile);
for (const include of expectedIncludes) {
  if (includes.filter((value) => value === include).length !== 1) {
    errors.push(`Hindi patch must be included exactly once: ${include}`);
  }
}

if (requireEncoded) {
  if (clusterEntries === 0) errors.push("Hindi cluster map is empty");
  if (encodedScalars <= 100000) errors.push(`only ${encodedScalars} Hindi private-use glyphs, expected over 100000`);
  if (rawHindiScalars !== 0) errors.push(`${rawHindiScalars} raw Hindi scalars remain in runtime patches`);
}

const report = {
  patchFiles: translationFiles.length,
  records: actual.size,
  reviewedRecords: reviewed.size,
  reviewedPreserves,
  batchFiles: batchFiles.length,
  clusterEntries,
  encodedScalars,
  rawHindiScalars,
  warnings: warnings.length,
  errors: errors.length,
};
console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length || warnings.length ? 1 : 0;
