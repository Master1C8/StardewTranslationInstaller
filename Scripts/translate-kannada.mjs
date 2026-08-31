#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const payloadRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const translationRoot = path.join(payloadRoot, "assets/translations");
const kannadaRoot = path.join(translationRoot, "kannada");
const cacheFile = path.resolve(
  process.env.KANNADA_CACHE_FILE
    || path.join(projectRoot, "../kannada-translation-cache.json"),
);
const dryRun = process.argv.includes("--dry-run");
const manualOverrides = readJSON(
  path.join(projectRoot, "Documentation/kannada-overrides.json"),
);
const prepareLocal = process.argv.includes("--prepare-local");
const localInputFile = path.resolve(
  process.env.KANNADA_LOCAL_INPUT_FILE
    || path.join(projectRoot, "../kannada-local-input.json"),
);
const separator = "<<<VNRSEP>>>";
const structuredTargets = /^Data\/(?:Achievements|AquariumFish|Boots|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|Quests|SecretNotes|animationDescriptions|hats)$/;
const contextAmbiguousTerms = new Set([
  "bar", "basic", "cast", "club", "fall", "floor", "harvest", "host",
  "level", "load", "mine", "name", "pet", "quality", "save", "spring",
  "water", "well",
]);

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function collectRecords(language) {
  const result = new Map();
  const directory = path.join(translationRoot, language);
  for (const relative of listJSONFiles(directory)) {
    const document = readJSON(path.join(directory, relative));
    for (const change of document.Changes ?? []) {
      for (const [key, value] of Object.entries(change.Entries ?? {})) {
        result.set(`${change.Target}\u0000${key}`, value);
      }
    }
  }
  return result;
}

function isEventScript(target, value) {
  if (target.startsWith("Data/Events/")) return true;
  if (
    !target.startsWith("Data/Festivals/")
    && target !== "Strings/1_6_Strings"
    && target !== "Strings/Locations"
  ) return false;
  return /(?:^|\/)(?:speak|message|question|quickQuestion|textAboveHead|spriteText|end dialogue)(?: |\/|$)/.test(value);
}

function hasTranslatableText(value) {
  return /[A-Za-z]{2}/.test(value)
    && !/^(?:[A-Fa-f0-9]{6,}|https?:\/\/\S+)$/.test(value.trim());
}

function quotedPlan(value) {
  const parts = [];
  let cursor = 0;
  const expression = /"(?:\\.|[^"\\])*"/g;
  for (const match of value.matchAll(expression)) {
    parts.push({ literal: value.slice(cursor, match.index) });
    const decoded = JSON.parse(match[0]);
    parts.push(hasTranslatableText(decoded) ? { segment: decoded, quote: true } : { literal: match[0] });
    cursor = match.index + match[0].length;
  }
  parts.push({ literal: value.slice(cursor) });
  return parts;
}

function eventPlan(value) {
  const ranges = [];
  const quotedExpression = /"(?:\\.|[^"\\])*"/g;
  for (const match of value.matchAll(quotedExpression)) {
    const decoded = JSON.parse(match[0]);
    if (hasTranslatableText(decoded)) {
      ranges.push({ start: match.index, end: match.index + match[0].length, segment: decoded, quote: true });
    }
  }
  const quickQuestionExpression = /\/quickQuestion\s+(.+?)\(break\)/g;
  for (const command of value.matchAll(quickQuestionExpression)) {
    const choices = command[1];
    const choicesStart = command.index + command[0].indexOf(choices);
    const prompt = choices.slice(0, choices.indexOf("#") < 0 ? choices.length : choices.indexOf("#"));
    if (hasTranslatableText(prompt)) {
      ranges.push({
        start: choicesStart,
        end: choicesStart + prompt.length,
        segment: prompt,
        quote: false,
        choice: true,
      });
    }
    for (const choice of choices.matchAll(/#([^#]*?)(?=#|$)/g)) {
      const text = choice[1];
      if (!hasTranslatableText(text)) continue;
      const start = choicesStart + choice.index + 1;
      ranges.push({ start, end: start + text.length, segment: text, quote: false, choice: true });
    }
  }
  ranges.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const selected = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    selected.push(range);
    cursor = range.end;
  }
  const parts = [];
  cursor = 0;
  for (const range of selected) {
    parts.push({ literal: value.slice(cursor, range.start) });
    parts.push({ segment: range.segment, quote: range.quote, choice: range.choice });
    cursor = range.end;
  }
  parts.push({ literal: value.slice(cursor) });
  return parts;
}

function buildPlan(target, value, polish, russian) {
  if (!hasTranslatableText(value)) return [{ literal: value }];
  if (value === polish && value === russian) return [{ literal: value }];

  if (isEventScript(target, value)) {
    const parts = eventPlan(value);
    if (parts.some((part) => part.segment)) return parts;
    return [{ literal: value }];
  }

  if (structuredTargets.test(target)) {
    const sourceFields = value.split("/");
    const polishFields = typeof polish === "string" ? polish.split("/") : [];
    const russianFields = typeof russian === "string" ? russian.split("/") : [];
    if (sourceFields.length === polishFields.length && sourceFields.length === russianFields.length) {
      return sourceFields.flatMap((field, index) => {
        const translatable = hasTranslatableText(field)
          && (field !== polishFields[index] || field !== russianFields[index]);
        const part = translatable ? { segment: field } : { literal: field };
        return index === sourceFields.length - 1 ? [part] : [part, { literal: "/" }];
      });
    }
  }

  return [{ segment: value }];
}

function glossaryReplacements() {
  const english = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
  const kannada = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.kn.json")).kn;
  const candidates = [];
  for (const entry of english) {
    const translated = kannada[entry.id]?.term;
    if (!translated) continue;
    const sourceTerms = entry.term.split("/").map((value) => value.trim());
    const targetTerms = translated.split("/").map((value) => value.trim());
    if (sourceTerms.length !== targetTerms.length) continue;
    for (let index = 0; index < sourceTerms.length; index += 1) {
      const source = sourceTerms[index];
      const target = targetTerms[index];
      if (source.length < 3 || !/[A-Za-z]/.test(source) || !target || target.includes("/")) continue;
      candidates.push({
        source,
        target,
        id: entry.id,
        wholeOnly: entry.id === "well"
          || (sourceTerms.length > 1
            && ["Interface & controls", "Character creation & multiplayer"].includes(entry.category)),
      });
    }
  }
  const foldedTargets = new Map();
  const foldedConflicts = new Set();
  for (const item of candidates) {
    const folded = item.source.toLocaleLowerCase("en");
    if (foldedTargets.has(folded) && foldedTargets.get(folded) !== item.target) {
      foldedConflicts.add(folded);
    } else {
      foldedTargets.set(folded, item.target);
    }
  }
  const unique = new Map();
  for (const item of candidates.sort((a, b) => b.source.length - a.source.length)) {
    const folded = item.source.toLocaleLowerCase("en");
    if (foldedConflicts.has(folded)) continue;
    if (!unique.has(item.source)) {
      unique.set(item.source, {
        ...item,
        wholeOnly: item.wholeOnly || contextAmbiguousTerms.has(folded),
      });
    }
  }
  return [...unique].map(([source, item]) => ({ source, ...item }));
}

const canonicalTerms = glossaryReplacements();

function glossaryExactReplacements() {
  const english = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
  const kannada = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.kn.json")).kn;
  const candidates = new Map();
  const conflicts = new Set();
  const add = (source, target) => {
    if (!source || !target) return;
    if (candidates.has(source) && candidates.get(source) !== target) conflicts.add(source);
    else candidates.set(source, target);
  };
  for (const entry of english) {
    const target = kannada[entry.id]?.term;
    add(entry.term, target);
    const sourceParts = entry.term.split(" / ");
    const targetParts = target?.split(" / ") ?? [];
    if (sourceParts.length === targetParts.length) {
      sourceParts.forEach((source, index) => add(source, targetParts[index]));
    }
  }
  for (const conflict of conflicts) candidates.delete(conflict);
  return candidates;
}

const canonicalExactTerms = glossaryExactReplacements();

function escapedExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addLocalTermPlaceholders(value) {
  const matches = [];
  for (const { source, target, wholeOnly } of canonicalTerms) {
    if (wholeOnly && value.trim() !== source) continue;
    const expression = new RegExp(`(?<![A-Za-z])${escapedExpression(source)}(?![A-Za-z])`, "g");
    for (const match of value.matchAll(expression)) {
      matches.push({ start: match.index, end: match.index + match[0].length, target });
    }
  }
  matches.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const selected = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue;
    selected.push(match);
    cursor = match.end;
  }
  if (!selected.length) return { text: value, terms: [] };

  const terms = [];
  const pieces = [];
  cursor = 0;
  for (const match of selected) {
    // IndicTrans2 is trained to preserve <IDn> spans reliably. The earlier
    // @VNRTERM form could collapse @VNRTERM1 into @VNRTERM11 in dense text.
    const placeholder = `<ID${terms.length + 1}>`;
    pieces.push(value.slice(cursor, match.start), placeholder);
    terms.push({ placeholder, replacement: match.target });
    cursor = match.end;
  }
  pieces.push(value.slice(cursor));
  return { text: pieces.join(""), terms };
}

function splitLocalText(value, maximumCharacters = 480) {
  const result = [];
  let remaining = value;
  while (remaining.length > maximumCharacters) {
    const window = remaining.slice(0, maximumCharacters + 1);
    const boundaries = [". ", "! ", "? ", "; ", ", ", " "];
    let splitAt = -1;
    for (const boundary of boundaries) {
      const candidate = window.lastIndexOf(boundary);
      if (candidate >= Math.floor(maximumCharacters * 0.55)) {
        splitAt = candidate + boundary.length;
        break;
      }
    }
    if (splitAt < 0) splitAt = maximumCharacters;
    result.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  if (remaining) result.push(remaining);
  return result.map((text) => addLocalTermPlaceholders(text));
}

function buildLocalParts(source) {
  const expressions = [
    /https?:\/\/[^\s)]+/g,
    /\{\{[^}]+\}\}/g,
    /\$\{[^{}]*\}\$/g,
    /\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+)/g,
    /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g,
    /\[[^\]]+\]/g,
    /%[a-z][A-Za-z0-9_]*/g,
    /\$[A-Za-z0-9]+/g,
    /\([A-Z]+\)[A-Za-z0-9_]+/g,
    /\\[nrt]/g,
    /[@#^|_\\\n]/g,
  ];
  const matches = [];
  for (const expression of expressions) {
    for (const match of source.matchAll(expression)) {
      matches.push({ start: match.index, end: match.index + match[0].length, value: match[0] });
    }
  }
  matches.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const selected = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue;
    selected.push(match);
    cursor = match.end;
  }

  const parts = [];
  const appendText = (value) => {
    if (!value) return;
    if (hasTranslatableText(value)) parts.push(...splitLocalText(value));
    else parts.push({ literal: value });
  };
  cursor = 0;
  for (const match of selected) {
    appendText(source.slice(cursor, match.start));
    parts.push({ literal: match.value });
    cursor = match.end;
  }
  appendText(source.slice(cursor));
  return parts;
}

function protectText(source, mode = "google") {
  let text = source;
  const replacements = [];
  const protect = (value, replacement, options = {}) => {
    const plainToken = `VNRX${String(replacements.length).padStart(4, "0")}`;
    const token = mode === "local" ? `@${plainToken}` : plainToken;
    replacements.push({ token, replacement, ...options });
    return mode === "local" ? token : `<span translate="no">${token}</span>`;
  };
  const replaceProtected = (expression, replacementFor, tight = true) => {
    text = text.replace(expression, (match, ...args) => {
      const offset = args.at(-2);
      const whole = args.at(-1);
      const leftWhitespace = tight ? (whole.slice(0, offset).match(/\s*$/)?.[0] ?? "") : "";
      const rightWhitespace = tight
        ? (whole.slice(offset + match.length).match(/^\s*/)?.[0] ?? "")
        : "";
      return protect(match, replacementFor(match), { tight, leftWhitespace, rightWhitespace });
    });
  };

  const markerExpressions = [
    /https?:\/\/[^\s)]+/g,
    /\{\{[^}]+\}\}/g,
    /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g,
    /\[[^\]]+\]/g,
    /%[a-z][A-Za-z0-9_]*/g,
    /\$\{[^{}]*\}\$/g,
    /\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+)/g,
    /\$[A-Za-z0-9]+/g,
    /\([A-Z]+\)[A-Za-z0-9_]+/g,
    /\\[nrt]/g,
  ];
  if (mode === "local") replaceProtected(/[@#^|_]/g, (match) => match);
  for (const expression of markerExpressions) {
    replaceProtected(expression, (match) => match);
  }
  if (mode !== "local") replaceProtected(/[@#^|_]/g, (match) => match);

  if (mode !== "local") {
    for (const { source: term, target } of canonicalTerms) {
      const expression = new RegExp(`(?<![A-Za-z])${escapedExpression(term)}(?![A-Za-z])`, "g");
      replaceProtected(expression, () => target, false);
    }
  }
  return { text, replacements };
}

function restoreText(translated, replacements) {
  let result = translated;
  for (const { token, replacement, tight, leftWhitespace, rightWhitespace } of replacements) {
    if (tight) {
      result = result.replace(
        new RegExp(`\\s*${token}\\s*`, "g"),
        () => `${leftWhitespace}${replacement}${rightWhitespace}`,
      );
    } else {
      result = result.replaceAll(token, replacement);
    }
  }
  if (/VNRX\d{4}/.test(result)) {
    const leftovers = result.match(/VNRX\d{4}/g) ?? [];
    throw new Error(
      `Unrestored placeholder in translation: ${result}; leftovers=${JSON.stringify(leftovers)} expected=${JSON.stringify(replacements.map((item) => item.token))}`,
    );
  }
  return result;
}

async function requestTranslation(masked, attempt = 0) {
  const body = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: "kn",
    dt: "t",
    format: "html",
    q: masked,
  });
  const response = await fetch("https://translate.googleapis.com/translate_a/single", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
  });
  if (!response.ok) {
    if (attempt < 9 && [429, 500, 502, 503, 504].includes(response.status)) {
      const retryAfter = Number.parseInt(response.headers.get("retry-after") ?? "", 10);
      const delay = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : response.status === 429
          ? Math.min(60000, 10000 * (attempt + 1))
          : Math.min(30000, 1000 * (2 ** attempt));
      await new Promise((resolve) => setTimeout(resolve, delay));
      return requestTranslation(masked, attempt + 1);
    }
    throw new Error(`Translation request failed with HTTP ${response.status}`);
  }
  const data = await response.json();
  return (data[0] ?? []).map((part) => part[0] ?? "").join("");
}

async function translateBatch(sources) {
  const protectedItems = sources.map(protectText);
  const masked = protectedItems.map((item) => item.text).join(`\n${separator}\n`);
  const combined = await requestTranslation(masked);
  const translatedItems = combined.split(separator).map((value) => value.replace(/^\s+|\s+$/g, ""));
  if (translatedItems.length !== sources.length) {
    if (sources.length === 1) throw new Error("Translation separator mismatch for a single item");
    const middle = Math.ceil(sources.length / 2);
    const first = await translateBatch(sources.slice(0, middle));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const second = await translateBatch(sources.slice(middle));
    return [...first, ...second];
  }
  return translatedItems.map((value, index) => restoreText(value, protectedItems[index].replacements));
}

function batches(values, maximumCharacters = 3200) {
  const result = [];
  let current = [];
  let length = 0;
  for (const value of values) {
    const nextLength = length + value.length + separator.length + 2;
    if (current.length && nextLength > maximumCharacters) {
      result.push(current);
      current = [];
      length = 0;
    }
    current.push(value);
    length += value.length + separator.length + 2;
  }
  if (current.length) result.push(current);
  return result;
}

const polishRecords = collectRecords("polish");
const russianRecords = collectRecords("russian");
const documents = [];
const segments = new Set();
let records = 0;
let literalRecords = 0;
let eventRecords = 0;
let structuredRecords = 0;

for (const relative of listJSONFiles(kannadaRoot).sort()) {
  const file = path.join(kannadaRoot, relative);
  const document = readJSON(file);
  const plans = new Map();
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      const plan = buildPlan(
        change.Target,
        value,
        polishRecords.get(id),
        russianRecords.get(id),
      );
      plans.set(id, plan);
      records += 1;
      if (!plan.some((part) => part.segment)) literalRecords += 1;
      if (isEventScript(change.Target, value)) eventRecords += 1;
      if (structuredTargets.test(change.Target) && value.includes("/")) structuredRecords += 1;
      for (const part of plan) if (part.segment) segments.add(part.segment);
    }
  }
  documents.push({ file, document, plans });
}

let cache = {};
if (fs.existsSync(cacheFile)) cache = readJSON(cacheFile);
const pending = [...segments].filter((segment) => !Object.hasOwn(cache, segment));
const workBatches = batches(pending);
console.log(JSON.stringify({
  records,
  literalRecords,
  eventRecords,
  structuredRecords,
  uniqueSegments: segments.size,
  cachedSegments: segments.size - pending.length,
  pendingSegments: pending.length,
  batches: workBatches.length,
  cacheFile,
}, null, 2));

if (dryRun) process.exit(0);

if (prepareLocal) {
  const items = pending.map((source) => {
    return {
      source,
      parts: buildLocalParts(source),
    };
  });
  fs.writeFileSync(localInputFile, `${JSON.stringify({ items }, null, 2)}\n`);
  console.log(`Prepared ${items.length} segments for local translation at ${localInputFile}.`);
  process.exit(0);
}

for (let index = 0; index < workBatches.length; index += 1) {
  const batch = workBatches[index];
  const translated = await translateBatch(batch);
  for (let item = 0; item < batch.length; item += 1) cache[batch[item]] = translated[item];
  fs.writeFileSync(cacheFile, `${JSON.stringify(cache, null, 2)}\n`);
  if ((index + 1) % 25 === 0 || index + 1 === workBatches.length) {
    console.log(`Translated ${index + 1}/${workBatches.length} batches (${Object.keys(cache).length} cached segments).`);
  }
  await new Promise((resolve) => setTimeout(resolve, 600));
}

for (const { file, document, plans } of documents) {
  for (const change of document.Changes ?? []) {
    for (const [key, original] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      const plan = plans.get(id);
      if (Object.hasOwn(manualOverrides, id)) {
        change.Entries[key] = manualOverrides[id];
        continue;
      }
      if (canonicalExactTerms.has(original)) {
        change.Entries[key] = canonicalExactTerms.get(original);
        continue;
      }
      change.Entries[key] = plan.map((part) => {
        if (part.literal !== undefined) return part.literal;
        const translated = cache[part.segment];
        if (translated === undefined) throw new Error(`Missing cached translation for ${id}`);
        if (part.quote && !part.segment.includes('"')) {
          return JSON.stringify(translated.replaceAll('"', ""));
        }
        if (part.choice) return translated.replaceAll('"', "");
        return part.quote ? JSON.stringify(translated) : translated;
      }).join("");
      if (typeof change.Entries[key] !== "string") change.Entries[key] = original;
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

console.log(`Applied Kannada draft to ${documents.length} files and ${records} records.`);
