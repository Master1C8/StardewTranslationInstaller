#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeTamil,
  mapsFromDocument,
  readClusterDocument,
} from "./tamil-clusters.mjs";

const positionalArguments = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const sourceRoot = positionalArguments[0];
const canonicalGlossaryFile = positionalArguments[1];
if (!sourceRoot) {
  console.error(
    "Usage: node Scripts/audit-tamil.mjs <unpacked-English-assets-dir> [glossary-translations.json]",
  );
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const payloadRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const translationRoot = path.join(payloadRoot, "assets/translations/tamil");
const clusterMapFile = path.join(projectRoot, "Documentation/tamil-cluster-map.json");
const clusterDocument = readClusterDocument(clusterMapFile);
const { decode: clusterDecode } = mapsFromDocument(clusterDocument);
const TAMIL = /[\u0B80-\u0BFF]/u;
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

const forbiddenTamilVariants = new Map([
  ["பெலிகன்", "பெலிக்கன்"],
  ["ஸ்டார்ட்யூ", "ஸ்டார்டியூ"],
  ["கலிகோ", "காலிகோ"],
  ["ஜுனிமோ", "ஜூனிமோ"],
  ["சூஸூ", "சூசூ"],
  ["ஸூஸூ", "சூசூ"],
  ["க்ரோபஸ", "குரோபஸ"],
  ["லினஸ", "லைனஸ"],
  ["மோரிஸ", "மாரிஸ"],
  ["டிமீட்ரியஸ", "டெமெட்ரியஸ"],
  ["கரோலின", "கரோலைன"],
  ["கேரலைன", "கரோலைன"],
  ["கெண்ட்", "கென்ட்"],
  ["ஈவ்லின", "எவலின"],
  ["ஆவிகள் முன்தின", "ஆவிகளின் இரவு"],
  ["ஆவிகளின் முன்தின", "ஆவிகளின் இரவு"],
  ["முட்டைத் திருவிழா", "முட்டை விழா"],
  ["பனித் திருவிழா", "பனிக்கட்டி விழா"],
  ["நிலவொளி ஜெல்லிகளின் நடனம்", "நிலவொளி ஜெல்லி நடனம்"],
  ["நிலவொளி ஜெல்லி விழா", "நிலவொளி ஜெல்லி நடனம்"],
  ["குளிர்கால நட்சத்திர", "குளிர்கால விண்மீன்"],
  ["ஸ்டார்டியூ பள்ளத்தாக்குச் சந்தை", "ஸ்டார்டியூ பள்ளத்தாக்குக் கண்காட்சி"],
  ["பாலைவனத் திருவிழா", "பாலைவன விழா"],
  ["மீன் தொட்ட", "மீன்தொட்ட"],
  ["மீன் குள", "மீன்குள"],
  ["நீர்ப்பாசனக் குடுவை", "நீர்க்குடுவை"],
  ["திரு. கீ", "திரு கீ"],
  ["விண்மீன் துளிப்பழச் சலூன்", "ஸ்டார்டிராப் மதுக்கூடம்"],
  ["விண்மீன் துளிப்பழ மதுக்கூட", "ஸ்டார்டிராப் மதுக்கூட"],
  ["ரயில் பாத", "தொடர்வண்டிப்பாத"],
  ["தொடர்வண்டிப் பாத", "தொடர்வண்டிப்பாத"],
  ["பியரின் பொதுக் கட", "பியரின் பொதுக்கட"],
  ["சமூகக் கூட", "சமூக மைய"],
  ["சாகசக்காரர் சங்க", "சாகசக் கழக"],
  ["இஞ்சித் தீவ", "இஞ்சி தீவ"],
  ["கடின மர", "கடினமர"],
  ["கேரலின", "கரோலைன"],
  ["அபிகெய்ல", "அபிகெயில"],
  ["எவ்லின", "எவலின"],
  ["ஜிஞ்சர் தீவ", "இஞ்சி தீவ"],
  ["நீர்ப்பாய்ச்சி", "நீர்க்குடுவை"],
  ["தண்ணீர்த் தொட்டி", "நீர்க்குடுவை"],
  ["விண்மீன் துளிப்பழச் சலூன", "ஸ்டார்டிராப் மதுக்கூட"],
  ["பிறந்த நாள்", "பிறந்தநாள்"],
  ["பழ மர", "பழமர"],
  ["அடைகாப்ப", "முட்டைப் பொரிப்ப"],
  ["சரக்குப் பெட்டி இடம்", "பொருட்பட்டி இடம்"],
  ["பொருட்பை நிரம்பியுள்ளது", "பொருட்பட்டி நிரம்பியுள்ளது"],
  ["மரத்துண்டாக்கி", "மரச்சில்லாக்கி"],
  ["பணிமேசை", "வேலைமேசை"],
  ["சிறிய குளிர்சாதனப் பெட்டி", "சிறு குளிர்பெட்டி"],
  ["கோட்டை கிராம", "கேஸில் வில்லேஜ்"],
  ["பதப்படுத்தும் ஜாடி", "பதனக் குடுவை"],
  ["வைப்பிட டைல் காட்டி", "இடமிடல் சதுரக் குறி"],
  ["உருப்பெருக்க அளவு", "பெரிதாக்கல் நிலை"],
  ["நடமாடும் வீ", "சக்கர வீ"],
  ["அரியகாக்கை", "அரிய சோளக்காட்டு பொம்மை"],
  ["சோளக்கொல்லைப் பொம்மை", "சோளக்காட்டு பொம்மை"],
  ["கல்லுடைப்பான்", "பிக்காக்ஸ்"],
  ["குந்தாலி", "பிக்காக்ஸ்"],
  ["சேறு வளர்ப்பக", "ஸ்லைம் கூட"],
  ["பரிசுச் சீட்டு", "பரிசுச்சீட்டு"],
  ["எதிர்ப்பாற்றல் வளையம்", "எதிர்ப்புத்திறன் வளையம்"],
  ["%Abigail", "%அபிகெயில்"],
  ["%Haley", "%ஹேலி"],
  ["ட்வார்ஃப்", "குள்ளர்"],
  ["கெண்டுடன்", "கென்டுடன்"],
  ["வும்பஸ்", "வம்பஸ்"],
  ["வெளவால்", "வவ்வால்"],
  ["அசுரக் கஸ்தூரி", "அரக்கர் கஸ்தூரி"],
  ["எரிமலைக் கண்ணாடிக் குவளை", "அப்சிடியன் பூச்சாடி"],
  ["சோம்பற்கரடி எலும்புக்கூடு", "சோம்பல் விலங்கு எலும்புக்கூடு"],
  ["தங்க விளிம்புள்ள அதிர்ஷ்ட ஊதா கால்சட்டை", "ஓரமிட்ட அதிர்ஷ்ட ஊதாக் குறுங்கால்சட்டை"],
  ["தீவிரத் தாக்குதல் வாய்ப்பு", "முக்கியத் தாக்கு வாய்ப்பு"],
  ["தீவிரத் தாக்குதல் சக்தி", "முக்கியத் தாக்கு வலிமை"],
  ["முக்கியத் தாக்குதல் வாய்ப்பு", "முக்கியத் தாக்கு வாய்ப்பு"],
  ["முக்கியத் தாக்குதல் வலிமை", "முக்கியத் தாக்கு வலிமை"],
  ["அதிமுக்கியத் தாக்குதல் ஆற்றல்", "முக்கியத் தாக்கு வலிமை"],
]);

const contextualTamilVariants = [
  {
    english: /\bPickaxe\b/iu,
    variants: ["கைக்கோடரி"],
    canonical: "பிக்காக்ஸ்",
  },
  {
    english: /\bSecret Woods\b/iu,
    variants: [/(?<!இ)ரகசியக் காட/u],
    canonical: "இரகசியக் காடு",
  },
  {
    english: /\bthe forge\b/iu,
    variants: ["உருக்குப்பட்டறை"],
    canonical: "உலைக்கூடம்",
  },
  {
    english: /\bcoop\b/iu,
    variants: ["கோழிக்கூண்டு", "கூண்டின் கொள்ளளவை", "கூண்டில் இடம்"],
    canonical: "கோழிக்கூடம்",
  },
  {
    english: /\bbarn\b/iu,
    variants: ["கொட்டக"],
    canonical: "தொழுவம்",
  },
  {
    english: /\bsilo\b/iu,
    variants: ["தானியக் கிடங்கு"],
    canonical: "வைக்கோல் களஞ்சியம்",
  },
  {
    english: /\bnew shed\b/iu,
    variants: ["கொட்டக"],
    canonical: "சேமிப்புக்கூடம்",
  },
  {
    english: /\bkeg\b/iu,
    variants: [/(?<!நொதிப்)பீப்பாய்/u],
    canonical: "நொதிப்பீப்பாய்",
  },
  {
    english: /\btapper\b/iu,
    variants: ["வடிகருவி"],
    canonical: "மரச்சாறு வடிப்பான்",
  },
  {
    english: /\bJungle\b(?! Hut)/iu,
    variants: [/(?<!மழைக்)காட்ட/u],
    canonical: "மழைக்காடு",
  },
  {
    english: /\bQuarry\b/iu,
    variants: ["கல் குவாரி"],
    canonical: "கற்குவாரி",
  },
  {
    english: /\bFish Shop\b/iu,
    variants: ["மீன் கடை"],
    canonical: "மீன்கடை",
  },
  {
    english: /\b(?:reached|climb to|reach|made it to) the summit\b/iu,
    variants: ["உச்சி"],
    canonical: "சிகரம்",
  },
  {
    english: /\bdocks\b/iu,
    variants: ["துறைமுகம்"],
    canonical: "படகுத்துறை",
  },
  {
    english: /^Crafting$/iu,
    variants: ["உருவாக்கம்"],
    canonical: "தயாரித்தல்",
  },
  {
    english: /^Host$/iu,
    variants: ["விருந்தோம்பு"],
    canonical: "நடத்து",
  },
  {
    english: /^Footwear$/iu,
    variants: ["காலணி"],
    canonical: "பாதணி",
  },
  {
    english: /^Gathering:/iu,
    variants: ["சேகரித்தல்:"],
    canonical: "சேகரிப்பு:",
  },
  {
    english: /\bReward:/iu,
    variants: ["பரிசு:"],
    canonical: "வெகுமதி:",
  },
  {
    english: /--Forging Table--/iu,
    variants: [
      "--உருக்குதல் அட்டவணை--",
      "மந்திரமேற்றுதல்",
      "உருக்கி மேம்படுத்த",
      "மந்திரமும் ஏற்றலாம்",
      "'இயல்பான மந்திரங்கள்'",
      "கருவிகளுக்கு மந்திரம் மட்டுமே ஏற்றலாம்",
    ],
    canonical: "வடித்தல் / மந்திரமேற்றல்",
  },
  {
    english: /\bArtful:/iu,
    variants: ["கலைநயம்:"],
    canonical: "நுட்பம்:",
  },
  {
    english: /\bCrusader:/iu,
    variants: ["புனித வீரர்:"],
    canonical: "அறப்போராளி:",
  },
  {
    english: /\bHaymaker:/iu,
    variants: ["வைக்கோல் அறுவடையாளர்:"],
    canonical: "புல்வெட்டி:",
  },
  {
    english: /\bPowerful:/iu,
    variants: ["ஆற்றல்மிக்கது:"],
    canonical: "வலிமை:",
  },
  {
    english: /\bReaching:/iu,
    variants: ["எட்டுதல்:"],
    canonical: "தொலைவு:",
  },
  {
    english: /\bShaving:/iu,
    variants: ["சீவுதல்:"],
    canonical: "சீவல்:",
  },
  {
    english: /\bBottomless:/iu,
    variants: ["வற்றாதது:"],
    canonical: "அடியற்ற:",
  },
  {
    english: /\bEfficient:/iu,
    variants: ["திறன்மிக்கது:"],
    canonical: "செயல்திறன்:",
  },
  {
    english: /\bSwift:/iu,
    variants: ["விரைவானது:"],
    canonical: "விரைவு:",
  },
  {
    english: /\bAuto-Hook:/iu,
    variants: ["தானியங்கித் தூண்டில்:"],
    canonical: "தானியங்கிக் கொக்கி:",
  },
  {
    english: /\bPreserving:/iu,
    variants: ["பாதுகாத்தல்:"],
    canonical: "பாதுகாப்பு:",
  },
];

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
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "ta-vnrevival" })) {
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
      if (typeof encoded !== "string") {
        errors.push(`non-string translation: ${change.Target} :: ${key}`);
        continue;
      }
      const translated = decodeTamil(encoded, clusterDecode);
      if (TAMIL.test(encoded)) errors.push(`unencoded Tamil cluster: ${id}`);
      for (const character of encoded) {
        const codepoint = character.codePointAt(0);
        if (codepoint >= 0xE000 && codepoint <= 0xF8FF && !clusterDecode.has(character)) {
          errors.push(`unknown Tamil cluster glyph U+${codepoint.toString(16).toUpperCase()}: ${id}`);
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
      for (const [variant, canonical] of forbiddenTamilVariants) {
        if (translated.includes(variant)) {
          errors.push(`non-canonical Tamil term ${JSON.stringify(variant)}; use ${JSON.stringify(canonical)}: ${id}`);
        }
      }
      for (const { english, variants, canonical } of contextualTamilVariants) {
        if (!english.test(original)) continue;
        for (const variant of variants) {
          const matched = variant instanceof RegExp
            ? variant.test(translated)
            : translated.includes(variant);
          if (matched) {
            const label = variant instanceof RegExp ? `/${variant.source}/` : JSON.stringify(variant);
            errors.push(`non-canonical contextual Tamil term ${label}; use ${JSON.stringify(canonical)}: ${id}`);
          }
        }
      }
      if (/\$\{[^{}]*[A-Za-z]{2,}[^{}]*\}\$/u.test(translated)) {
        errors.push(`untranslated English gender branch: ${id}`);
      }
      for (const match of translated.matchAll(/(?:^|\/)quickQuestion (.*?)(?=\(break\))/g)) {
        if (/[A-Za-z]{2,}/u.test(match[1])) {
          errors.push(`untranslated English quick-question choice: ${id}`);
        }
      }
      const originalMarkers = markerSignature(original);
      const translatedMarkers = markerSignature(translated);
      if (JSON.stringify(originalMarkers) !== JSON.stringify(translatedMarkers)) {
        errors.push(
          `marker mismatch: ${change.Target} :: ${key} (${relative}): English=${JSON.stringify(originalMarkers)} Tamil=${JSON.stringify(translatedMarkers)}`,
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
const tamilGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.ta.json"))?.ta;
if (!Array.isArray(englishGlossary) || englishGlossary.length !== 673) {
  errors.push(`English glossary count is ${englishGlossary?.length ?? "invalid"}, expected 673`);
}
if (!tamilGlossary || Object.keys(tamilGlossary).length !== 673) {
  errors.push(`Tamil glossary count is ${Object.keys(tamilGlossary ?? {}).length}, expected 673`);
}
for (const entry of englishGlossary ?? []) {
  const translated = tamilGlossary?.[entry.id];
  if (!translated?.term?.trim() || !translated?.meaning?.trim()) {
    errors.push(`missing Tamil glossary entry: ${entry.id}`);
  }
}
if (canonicalGlossaryFile) {
  const canonical = readJSON(path.resolve(canonicalGlossaryFile))?.ta;
  if (JSON.stringify(tamilGlossary) !== JSON.stringify(canonical)) {
    errors.push("local Tamil glossary differs from canonical SiteForMods layer");
  }
}

const content = readJSON(path.join(payloadRoot, "content.json"));
const includes = (content?.Changes ?? [])
  .filter((change) => change.Action === "Include")
  .map((change) => change.FromFile);
if (new Set(includes).size !== includes.length) errors.push("duplicate Include entries");
const tamilIncludes = includes.filter((file) => file.startsWith("assets/translations/tamil/"));
const expectedIncludes = files.map((file) => `assets/translations/tamil/${file}`);
if (
  (tamilIncludes.length > 0 || process.argv.includes("--require-includes"))
  && JSON.stringify([...tamilIncludes].sort()) !== JSON.stringify(expectedIncludes)
) {
  errors.push(`Tamil Include set differs: actual=${tamilIncludes.length}, expected=${files.length}`);
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
  const translated = tamilGlossary?.[entry.id]?.term;
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
  path.join(projectRoot, "Documentation/tamil-preserved-values.json"),
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
  ["Strings/UI\0Character_FavoriteThing", 10],
  ["Strings/UI\0Character_Animal", 12],
  ["Strings/UI\0Character_EyeColor", 12],
  ["Strings/UI\0Character_HairColor", 12],
  ["Strings/UI\0Character_PantsColor", 14],
  ["Strings/UI\0Character_ShirtColor", 14],
  ["Strings/UI\0Character_DyeColor", 12],
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
const tamilSegmenter = new Intl.Segmenter("ta", { granularity: "grapheme" });
const graphemeLength = (value) => [...tamilSegmenter.segment(value)].length;
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
  .replace("{1}", "இலையுதிர் காலம்")
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
  shapedClusters: clusterDocument.entries.length,
  tamilIncludes: tamilIncludes.length,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
