#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const positional = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const sourceRoot = path.resolve(
  positional[0] ?? "/Users/antonkrutov/Developer/data/stardew-english-unpacked",
);
const requireIncludes = process.argv.includes("--require-includes");
const release = process.argv.includes("--release");
const projectRoot = path.resolve(import.meta.dirname, "..");
const translationSlug = process.env.VNREVIVAL_TRANSLATION_SLUG ?? "urdu";
const glossaryLocale = process.env.VNREVIVAL_GLOSSARY_LOCALE ?? "ur";
const languageName = process.env.VNREVIVAL_LANGUAGE_NAME ?? "Urdu";
const payloadRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const resourcesRoot = path.dirname(payloadRoot);
const translationRoot = path.join(payloadRoot, `assets/translations/${translationSlug}`);
const editorialFile = path.join(projectRoot, `Documentation/${translationSlug}-editorial-overrides.json`);
const expected = { files: 463, changes: 489, targets: 187, records: 14720, glossary: 673 };
const languageCode = process.env.VNREVIVAL_LANGUAGE_CODE ?? "ur-vnrevival";
const releaseConfigs = {
  urdu: {
    suffix: "Urdu",
    nativeName: "اردو",
    expectedShapingEntries: 282,
  },
  persian: {
    suffix: "Persian",
    nativeName: "فارسی",
    expectedShapingEntries: 381,
  },
  arabic: {
    suffix: "Arabic",
    nativeName: "العربية",
    expectedShapingEntries: 556,
  },
};
const releaseConfig = releaseConfigs[translationSlug] ?? releaseConfigs.urdu;
const errors = [];
const warnings = [];
const sourceCache = new Map();
const records = new Map();
let changeCount = 0;
let eventRecords = 0;

function listJSONFiles(directory, prefix = "") {
  if (!fs.existsSync(directory)) return [];
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
    offset += 1;
    skip();
    if (text[offset] === "}") { offset += 1; return; }
    while (offset < text.length) {
      skip();
      const key = string();
      const nextPath = `${jsonPath}.${key}`;
      if (keys.has(key)) duplicates.push(nextPath);
      keys.add(key);
      skip();
      if (text[offset++] !== ":") throw new Error(`expected colon at ${offset - 1}`);
      value(nextPath);
      skip();
      if (text[offset] === "}") { offset += 1; return; }
      if (text[offset++] !== ",") throw new Error(`expected comma at ${offset - 1}`);
    }
    throw new Error("unterminated object");
  };
  const array = (jsonPath) => {
    offset += 1;
    skip();
    if (text[offset] === "]") { offset += 1; return; }
    let index = 0;
    while (offset < text.length) {
      value(`${jsonPath}[${index++}]`);
      skip();
      if (text[offset] === "]") { offset += 1; return; }
      if (text[offset++] !== ",") throw new Error(`expected comma at ${offset - 1}`);
    }
    throw new Error("unterminated array");
  };
  value("$");
  skip();
  if (offset !== text.length) throw new Error("trailing data");
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

function englishContent(target) {
  if (!sourceCache.has(target)) {
    const content = readJSON(path.join(sourceRoot, `${target}.json`))?.content;
    if (!content || typeof content !== "object") {
      errors.push(`missing English content object: ${target}`);
    }
    sourceCache.set(target, content);
  }
  return sourceCache.get(target);
}

function matches(value, expression) {
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
    contentPatcher: matches(value, /\{\{[^}]+\}\}/g),
    substitutions: matches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: matches(
      value,
      /\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g,
    ),
    percent: matches(value, /%[a-z][A-Za-z0-9_]*/g),
    dollar: matches(value, /\$[A-Za-z0-9]+/g),
    dialogueControl: matches(
      value,
      /%item\b[\s\S]*?%%|%revealtaste:[^%#$^|/\n]*|\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+)|(?<=#)\$\d+\s+[^#]+(?=#)/g,
    ),
    typedItems: matches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: matches(value, /https?:\/\/[^\s)]+/g),
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(withoutGenderBranches(value), "^"),
    pipe: count(value, "|"),
    underscore: count(value, "_"),
    backslash: count(value, "\\"),
    newline: count(value, "\n"),
    plus: count(value, "+"),
    percentCharacter: count(value, "%"),
    dollarCharacter: count(value, "$"),
    lessThan: count(value, "<"),
    greaterThan: count(value, ">"),
    openSquareBracket: count(value, "["),
    closeSquareBracket: count(value, "]"),
    trailingSpace: / $/.test(value),
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

const editorial = readJSON(editorialFile) ?? {};
if (editorial.locale !== languageCode) errors.push(`invalid editorial locale: ${editorial.locale}`);
const translatedEditorial = editorial.records ?? {};
const preservedRecords = new Set(editorial.preservedRecords ?? []);
const preservedReasons = editorial.preservedReasons ?? {};
const preservedTargets = new Set(editorial.preservedTargets ?? []);
const preservedTargetReasons = editorial.preservedTargetReasons ?? {};
const files = listJSONFiles(translationRoot);

for (const relative of files) {
  const document = readJSON(path.join(translationRoot, relative));
  if (!document) continue;
  if (Object.hasOwn(document, "Format")) errors.push(`secondary Format: ${relative}`);
  if (!Array.isArray(document.Changes) || document.Changes.length === 0) {
    errors.push(`missing Changes: ${relative}`);
    continue;
  }
  for (const change of document.Changes) {
    changeCount += 1;
    if (
      change.Action !== "EditData"
      || typeof change.Target !== "string"
      || !change.Entries
      || typeof change.Entries !== "object"
      || Array.isArray(change.Entries)
    ) {
      errors.push(`invalid EditData change: ${relative}`);
      continue;
    }
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: languageCode })) {
      errors.push(`invalid Language condition: ${relative} :: ${change.Target}`);
    }
    const source = englishContent(change.Target);
    if (!source) continue;
    for (const [key, translated] of Object.entries(change.Entries)) {
      const id = `${change.Target}\u0000${key}`;
      if (records.has(id)) errors.push(`duplicate record: ${id}`);
      if (typeof translated !== "string") {
        errors.push(`non-string translation: ${id}`);
        continue;
      }
      const original = source[key];
      if (typeof original !== "string") {
        errors.push(`missing English record: ${id}`);
        continue;
      }
      records.set(id, { target: change.Target, key, original, translated, relative });
      if (!translated.length && original.length) errors.push(`empty translation: ${id}`);
      if (translated.includes("�")) errors.push(`replacement character: ${id}`);
      if (translated !== translated.normalize("NFC")) errors.push(`non-NFC ${languageName}: ${id}`);
      if (JSON.stringify(markerSignature(original)) !== JSON.stringify(markerSignature(translated))) {
        errors.push(`marker mismatch: ${id} (${relative})`);
      }
      if (
        /^Data\/(?:Achievements|AquariumFish|Boots|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|Quests|SecretNotes|animationDescriptions|hats)$/.test(change.Target)
        && count(original, "/") !== count(translated, "/")
      ) errors.push(`structured slash mismatch: ${id} (${relative})`);
      if (isEventScript(change.Target, original)) {
        eventRecords += 1;
        if (eventSkeleton(original) !== eventSkeleton(translated)) {
          errors.push(`event structure mismatch: ${id} (${relative})`);
        }
        const actorPattern = /(?:^|\/)addTemporaryActor\s+"(?:\\.|[^"\\])*"/g;
        if (JSON.stringify(matches(original, actorPattern)) !== JSON.stringify(matches(translated, actorPattern))) {
          errors.push(`event internal actor mismatch: ${id} (${relative})`);
        }
      }
    }
  }
}

for (const [id, record] of records) {
  const reviewed = translatedEditorial[id];
  const targetPreserved = preservedTargets.has(record.target) && !reviewed;
  const preserved = preservedRecords.has(id) || targetPreserved;
  if (reviewed && preservedRecords.has(id)) errors.push(`duplicate editorial state: ${id}`);
  if (preserved) {
    if (record.translated !== record.original) errors.push(`preserved record changed: ${id}`);
    if (preservedRecords.has(id) && !preservedReasons[id]?.trim()) {
      errors.push(`preserved record lacks technical reason: ${id}`);
    }
  } else if (reviewed) {
    if (reviewed.english !== record.original) errors.push(`stale reviewed English source: ${id}`);
    if (reviewed.translation !== record.translated) errors.push(`reviewed patch mismatch: ${id}`);
    if (
      record.translated !== record.original
      && /[A-Za-z]{2}/.test(record.original)
      && !/[\u0600-\u06FF]/u.test(record.translated)
    ) errors.push(`reviewed translation lacks ${languageName} script: ${id}`);
  } else if (record.translated !== record.original) {
    errors.push(`unreviewed ${languageName} mutation: ${id}`);
  }
}

const deprecatedEditorialTerms = translationSlug === "urdu" ? [
  { source: /Community Center/i, urdu: /برادری مرکز/, canonical: "کمیونٹی سینٹر" },
  { source: /Junimo/i, urdu: /جونی مو|جونی‌مو/, canonical: "جونیمو" },
  { source: /Stardew Valley/i, urdu: /(?<!ا)سٹارڈیو ویلی|اا+سٹارڈیو ویلی/u, canonical: "اسٹارڈیو ویلی" },
  { source: /Pelican Town/i, urdu: /پیلیکن قصب/, canonical: "پیلیکن ٹاؤن" },
  { source: /Ginger Island/i, urdu: /جنجر جزیر/, canonical: "جنجر آئی لینڈ" },
  { source: /Skull Cavern/i, urdu: /کھوپڑی غار/, canonical: "اسکل کیورن" },
  { source: /Cindersap Forest/i, urdu: /سنڈر سیپ جنگل/, canonical: "سنڈرسیپ جنگل" },
  { source: /Adventurer.s Guild/i, urdu: /مہم جو انجمن/, canonical: "مہم جوؤں کی انجمن" },
  { source: /Sebastian/, urdu: /سیباسچن/, canonical: "سباسچین" },
  { source: /Demetrius/, urdu: /ڈیمیٹریس/, canonical: "ڈیمیٹریئس" },
  { source: /Harvey/, urdu: /ہاروے/, canonical: "ہاروی" },
  { source: /Leah/, urdu: /لیہ/, canonical: "لیا" },
  { source: /Evelyn/, urdu: /ایولین/, canonical: "ایولن" },
  { source: /Mayor Lewis/, urdu: /میئر لیوس/, canonical: "میئر لوئس" },
  { source: /Amethyst/i, urdu: /ایمیتھسٹ|نیلم/, canonical: "جمشت" },
  { source: /\bJade\b/i, urdu: /یشب/, canonical: "یشم" },
  { source: /Cave Carrot/i, urdu: /کیو کیرٹ|غاری گاجر|غار گاجر/, canonical: "غار کی گاجر" },
  { source: /Super Cucumber/i, urdu: /سپر کیوکمبر|اعلیٰ سمندری کھیرا/, canonical: "سپر سمندری کھیرا" },
  { source: /Crab Cakes?/i, urdu: /کیکڑا کیک/, canonical: "کیکڑے کے کیک" },
  { source: /Frog Egg/i, urdu: /مینڈک انڈہ/, canonical: "مینڈک کا انڈا" },
  { source: /\bResolution\b/, urdu: /قرارداد|ریزولوشن/, canonical: "ریزولیوشن" },
  { source: /\bUnforge\b|\bunforge\b/, urdu: /دوبارہ ڈھل/, canonical: "فورج ہٹائیں" },
  { source: /\bEnchantments?\b|\benchanted\b/, urdu: /افسون|افسوں/, canonical: "سحر" },
] : [];
for (const [id, record] of records) {
  for (const rule of deprecatedEditorialTerms) {
    if (rule.source.test(record.original) && rule.urdu.test(record.translated)) {
      errors.push(`deprecated ${languageName} term, use ${rule.canonical}: ${id}`);
    }
  }
  if (translationSlug === "urdu" && /[!؟]۔(?!۔)/u.test(record.translated)) {
    errors.push(`redundant Urdu sentence stop after terminal punctuation: ${id}`);
  }
}

for (const id of Object.keys(translatedEditorial)) {
  if (!records.has(id)) errors.push(`reviewed record missing from patches: ${id}`);
}
for (const id of preservedRecords) {
  if (!records.has(id)) errors.push(`preserved record missing from patches: ${id}`);
}
for (const id of Object.keys(preservedReasons)) {
  if (!preservedRecords.has(id)) errors.push(`orphan preserved reason: ${id}`);
}
for (const target of preservedTargets) {
  if (![...records.values()].some((record) => record.target === target)) {
    errors.push(`preserved target missing from patches: ${target}`);
  }
  if (!preservedTargetReasons[target]?.trim()) {
    errors.push(`preserved target lacks technical reason: ${target}`);
  }
}
for (const target of Object.keys(preservedTargetReasons)) {
  if (!preservedTargets.has(target)) errors.push(`orphan preserved target reason: ${target}`);
}

if (files.length !== expected.files) errors.push(`file count ${files.length}, expected ${expected.files}`);
if (changeCount !== expected.changes) errors.push(`change count ${changeCount}, expected ${expected.changes}`);
if (sourceCache.size !== expected.targets) errors.push(`target count ${sourceCache.size}, expected ${expected.targets}`);
if (records.size !== expected.records) errors.push(`record count ${records.size}, expected ${expected.records}`);

const englishGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
const urduGlossary = readJSON(path.join(projectRoot, `Documentation/glossary/glossary.${glossaryLocale}.json`))?.[glossaryLocale];
if (!Array.isArray(englishGlossary) || englishGlossary.length !== expected.glossary) {
  errors.push(`English glossary count ${englishGlossary?.length ?? "invalid"}, expected ${expected.glossary}`);
}
if (Object.keys(urduGlossary ?? {}).length !== expected.glossary) {
  errors.push(`${languageName} glossary count ${Object.keys(urduGlossary ?? {}).length}, expected ${expected.glossary}`);
}
if (
  JSON.stringify(Object.keys(urduGlossary ?? {}))
  !== JSON.stringify((englishGlossary ?? []).map((entry) => entry.id))
) errors.push(`${languageName} glossary ID/order mismatch`);
for (const entry of englishGlossary ?? []) {
  const translated = urduGlossary?.[entry.id];
  if (!translated?.term?.trim() || !translated?.meaning?.trim() || !/[\u0600-\u06FF]/u.test(translated.meaning)) {
    errors.push(`invalid ${languageName} glossary entry: ${entry.id}`);
  }
}
const contextualGlossaryExceptions = new Set([
  "Strings/UI\u0000LearnedRecipe_cooking",
]);
const compactGlossaryLabels = new Map(
  glossaryLocale === "fa"
    ? [["Strings/UI\u0000Character_StartingCabins", "کلبه آغازین"]]
    : [],
);
for (const [id, compact] of compactGlossaryLabels) {
  const record = records.get(id);
  if (!record || record.translated !== compact) {
    errors.push(`compact glossary label mismatch (${compact}): ${id}`);
  }
}
for (const entry of englishGlossary ?? []) {
  const canonical = urduGlossary?.[entry.id]?.term;
  if (!canonical || entry.term.includes("/") || canonical.includes("/")) continue;
  const exactEnglishLabels = new Set([
    entry.term,
    `${entry.term}:`,
    `${entry.term}...`,
    `${entry.term}!`,
    `${entry.term}?`,
  ]);
  for (const [id, record] of records) {
    if (record.translated === record.original) continue;
    if (compactGlossaryLabels.has(id)) continue;
    if (
      exactEnglishLabels.has(record.original.trim())
      && !record.translated.includes(canonical)
      && !contextualGlossaryExceptions.has(id)
    ) errors.push(`exact glossary label mismatch (${entry.id} => ${canonical}): ${id}`);
  }
}

const content = readJSON(path.join(payloadRoot, "content.json"));
if (!content?.Format) errors.push("root content.json lacks Format");
const includes = (content?.Changes ?? [])
  .filter((change) => change.Action === "Include")
  .map((change) => change.FromFile);
if (new Set(includes).size !== includes.length) errors.push("duplicate Include entries");
const urduIncludes = includes.filter((file) => file.startsWith(`assets/translations/${translationSlug}/`)).sort();
const expectedIncludes = files.map((file) => `assets/translations/${translationSlug}/${file}`);
if (
  (requireIncludes || urduIncludes.length > 0)
  && JSON.stringify(urduIncludes) !== JSON.stringify(expectedIncludes)
) errors.push(`${languageName} Include set differs: actual=${urduIncludes.length}, expected=${expectedIncludes.length}`);

if (release) {
  if (content?.Format !== "2.9.0") errors.push(`unexpected root Format: ${content?.Format}`);
  const changes = content?.Changes ?? [];
  const additional = changes
    .find((change) => change.Action === "EditData" && change.Target === "Data/AdditionalLanguages")
    ?.Entries?.[`{{ModId}}_${releaseConfig.suffix}`];
  const expectedAdditional = {
    ID: `{{ModId}}_${releaseConfig.suffix}`,
    LanguageCode: languageCode,
    ButtonTexture: `Mods/{{ModId}}/Button${releaseConfig.suffix}`,
    UseLatinFont: false,
    FontFile: `Fonts/${releaseConfig.suffix}`,
    FontPixelZoom: 1,
    TimeFormat: "[HOURS_24_00]:[MINUTES]",
    ClockTimeFormat: "[HOURS_24_00]:[MINUTES]",
    ClockDateFormat: "[DAY_OF_MONTH] [DAY_OF_WEEK]",
    NumberComma: " ",
  };
  if (JSON.stringify(additional) !== JSON.stringify(expectedAdditional)) {
    errors.push(`invalid ${languageName} AdditionalLanguages entry`);
  }
  const expectedLoads = [
    [`Mods/{{ModId}}/Button${releaseConfig.suffix}`, `assets/button-${translationSlug}.png`, undefined],
    ["Minigames/TitleButtons", `assets/title/TitleButtons-${translationSlug}.png`, languageCode],
    ["Fonts/SpriteFont1", `assets/fonts/${translationSlug}/SpriteFont1.xnb`, languageCode],
    ["Fonts/SmallFont", `assets/fonts/${translationSlug}/SmallFont.xnb`, languageCode],
    [`Fonts/${releaseConfig.suffix}`, `assets/fonts/${translationSlug}/${releaseConfig.suffix}.xnb`, undefined],
    [`Fonts/${releaseConfig.suffix}_0`, `assets/fonts/${translationSlug}/${releaseConfig.suffix}_0.xnb`, undefined],
  ];
  for (const [target, fromFile, targetLocale] of expectedLoads) {
    const matching = changes.filter((change) => change.Action === "Load"
      && change.Target === target
      && change.FromFile === fromFile
      && change.TargetLocale === targetLocale);
    if (matching.length !== 1) errors.push(`missing or duplicate ${languageName} load: ${target}`);
  }

  const requiredAssets = expectedLoads.map(([, file]) => file);
  for (const file of requiredAssets) {
    const fullPath = path.join(payloadRoot, file);
    if (!fs.existsSync(fullPath)) errors.push(`missing ${languageName} asset: ${file}`);
    else if (file.endsWith(".xnb") && fs.readFileSync(fullPath).subarray(0, 3).toString() !== "XNB") {
      errors.push(`invalid ${languageName} XNB signature: ${file}`);
    }
  }
  function pngDimensions(file) {
    const data = fs.readFileSync(file);
    if (data.length < 24 || data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return null;
    return [data.readUInt32BE(16), data.readUInt32BE(20)];
  }
  for (const [file, dimensions] of [
    [`assets/button-${translationSlug}.png`, [174, 78]],
    [`assets/title/TitleButtons-${translationSlug}.png`, [400, 655]],
  ]) {
    const actual = fs.existsSync(path.join(payloadRoot, file))
      ? pngDimensions(path.join(payloadRoot, file))
      : null;
    if (JSON.stringify(actual) !== JSON.stringify(dimensions)) {
      errors.push(`invalid ${languageName} PNG dimensions: ${file}`);
    }
  }

  const packageConfig = readJSON(path.join(resourcesRoot, "PackageConfig.json"));
  if ((packageConfig?.languageCodes ?? []).filter((code) => code === languageCode).length !== 1) {
    errors.push(`PackageConfig lacks exactly one ${languageName} locale code`);
  }
  if (!packageConfig?.nativeLanguageName?.includes(releaseConfig.nativeName)) {
    errors.push(`PackageConfig lacks the native ${languageName} language name`);
  }

  const documentedMapPath = path.join(projectRoot, `Documentation/${translationSlug}-cluster-map.json`);
  const runtimeMapPath = path.join(resourcesRoot, `LanguageSwitcherPayload/${translationSlug}-shaping-map.json`);
  const documentedMap = readJSON(documentedMapPath);
  const runtimeMap = readJSON(runtimeMapPath);
  if (JSON.stringify(documentedMap) !== JSON.stringify(runtimeMap)) {
    errors.push(`runtime ${languageName} shaping map differs from its canonical document`);
  }
  if (documentedMap?.format !== 2 || documentedMap?.entries?.length !== releaseConfig.expectedShapingEntries) {
    errors.push(`invalid ${languageName} shaping-map structure/count: ${documentedMap?.entries?.length ?? "invalid"}`);
  }
  const mapGlyphs = documentedMap?.entries?.map((entry) => entry.glyph) ?? [];
  if (new Set(mapGlyphs).size !== mapGlyphs.length) errors.push(`duplicate ${languageName} shaping-map glyph`);
  for (let index = 0; index < mapGlyphs.length; index += 1) {
    if (mapGlyphs[index]?.codePointAt(0) !== 0xE000 + index) {
      errors.push(`non-contiguous ${languageName} shaping-map glyph at index ${index}`);
      break;
    }
  }
  const switcherLibrary = path.join(resourcesRoot, "LanguageSwitcherPayload/VNRevival.LanguageSwitcher.dll");
  if (!fs.existsSync(switcherLibrary) || fs.statSync(switcherLibrary).size <= 4_096) {
    errors.push(`missing or truncated ${languageName}-aware language switcher`);
  }
}

const reviewedIds = new Set([
  ...Object.keys(translatedEditorial),
  ...preservedRecords,
]);
for (const record of records.values()) {
  if (preservedTargets.has(record.target) && !translatedEditorial[`${record.target}\u0000${record.key}`]) {
    reviewedIds.add(`${record.target}\u0000${record.key}`);
  }
}
const reviewed = [...reviewedIds].filter((id) => records.has(id)).length;
const unreviewed = records.size - reviewed;
if (unreviewed > 0) {
  const message = `${unreviewed} ${languageName} records remain unreviewed`;
  if (release) errors.push(message);
  else warnings.push(message);
}

const byTargetRequested = process.argv.includes("--unreviewed-by-target");
if (byTargetRequested) {
  const byTarget = new Map();
  for (const [id, record] of records) {
    if (reviewedIds.has(id)) continue;
    byTarget.set(record.target, (byTarget.get(record.target) ?? 0) + 1);
  }
  console.log([...byTarget]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([target, total]) => `${String(total).padStart(4)} ${target}`)
    .join("\n"));
}
const requestedTarget = process.argv.find((argument) => argument.startsWith("--unreviewed-target="))
  ?.slice("--unreviewed-target=".length);
if (requestedTarget) {
  for (const [id, record] of records) {
    if (record.target === requestedTarget && !reviewedIds.has(id)) {
      console.log(`${record.key}\t${JSON.stringify(record.original)}`);
    }
  }
}

const report = {
  locale: languageCode,
  files: files.length,
  changes: changeCount,
  records: records.size,
  sourceTargets: sourceCache.size,
  eventRecords,
  glossaryRecords: Object.keys(urduGlossary ?? {}).length,
  reviewed,
  unreviewed,
  completionPercent: Number((reviewed / expected.records * 100).toFixed(3)),
  urduIncludes: urduIncludes.length,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
