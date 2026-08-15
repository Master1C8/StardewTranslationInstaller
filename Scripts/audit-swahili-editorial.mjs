#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/audit-swahili-editorial.mjs <unpacked-English-assets-dir> [--report=TYPE] [--limit=N]");
  process.exit(2);
}

const reportArgument = process.argv.find((argument) => argument.startsWith("--report="));
const reportType = reportArgument?.slice("--report=".length) ?? "summary";
const limitArgument = process.argv.find((argument) => argument.startsWith("--limit="));
const limit = Number(limitArgument?.slice("--limit=".length) ?? 100);
const termArgument = process.argv.find((argument) => argument.startsWith("--term="));
const requestedTerms = new Set(termArgument?.slice("--term=".length).split(",").filter(Boolean) ?? []);
const wordArgument = process.argv.find((argument) => argument.startsWith("--word="));
const requestedWords = new Set(wordArgument?.slice("--word=".length).split(",").filter(Boolean) ?? []);
const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listJSONFiles(directory) {
  return fs.readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function boundaryExpression(value, flags = "giu") {
  const left = /^[\p{L}\p{N}]/u.test(value) ? "(?<![\\p{L}\\p{N}])" : "";
  const right = /[\p{L}\p{N}]$/u.test(value) ? "(?![\\p{L}\\p{N}])" : "";
  return new RegExp(`${left}${escapeRegExp(value)}${right}`, flags);
}

function eventVisibleText(record, value) {
  const dialogueArguments = [...value.matchAll(
    /(?:^|[\\/])(?:speak\s+\S+|message|textAboveHead\s+\S+)\s+("(?:\\.|[^"\\])*")/g,
  )].map((match) => match[1]);
  const quoted = dialogueArguments.map((argument) => {
    try {
      return JSON.parse(argument);
    } catch {
      return argument.slice(1, -1);
    }
  });
  const choices = [...value.matchAll(/[\\/](?:quickQuestion|question)\s+([^/\\]*?)(?=\(break\)|[\\/]|$)/g)]
    .map((match) => match[1].replaceAll("#", ". "));
  const rawPrefix = value.split(/[\\/]/, 1)[0].replace(/"$/, "");
  const prefix = record.target === "Data/ExtraDialogue"
      && /[\s.!?,@]/u.test(rawPrefix)
    ? rawPrefix
    : "";
  return [prefix, ...quoted, ...choices].filter(Boolean).join(". ");
}

function semanticText(record, value) {
  const dialogueCommand = /[\\/](?:speak|message|question|quickQuestion|textAboveHead)\b/;
  if (dialogueCommand.test(value)) return eventVisibleText(record, value);

  const eventTarget = record.target.startsWith("Data/Events/")
    || record.target.startsWith("Data/Festivals/");
  if (eventTarget) return "";
  return value;
}

const sourceCache = new Map();
function sourceContent(target) {
  if (!sourceCache.has(target)) {
    const file = path.join(sourceRoot, `${target}.json`);
    sourceCache.set(target, readJSON(file).content);
  }
  return sourceCache.get(target);
}

const records = [];
for (const relative of listJSONFiles(translationRoot)) {
  const document = readJSON(path.join(translationRoot, relative));
  for (const change of document.Changes ?? []) {
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries ?? {})) {
      records.push({
        target: change.Target,
        key,
        original: source[key],
        translated,
        relative,
      });
    }
  }
}

const englishGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
const swahiliGlossary = readJSON(
  path.join(projectRoot, "Documentation/glossary/glossary.sw.json"),
).sw;
const glossaryForms = [];
for (const entry of englishGlossary) {
  const targetTerm = swahiliGlossary[entry.id].term;
  const sourceParts = entry.term.split(" / ");
  const targetParts = targetTerm.split(" / ");
  const forms = sourceParts.length === targetParts.length
    ? sourceParts.map((sourceTerm, index) => ({ sourceTerm, targetTerm: targetParts[index] }))
    : [{ sourceTerm: entry.term, targetTerm }];
  for (const form of forms) {
    if ([...form.sourceTerm].length < 3) continue;
    glossaryForms.push({
      ...form,
      id: entry.id,
      priority: entry.priority,
      sourceExpression: boundaryExpression(form.sourceTerm),
      translatedExpressions: form.targetTerm
        .split(" / ")
        .filter(Boolean)
        .map((target) => boundaryExpression(target)),
    });
  }
}
glossaryForms.sort((left, right) => right.sourceTerm.length - left.sourceTerm.length);

const glossaryContext = [];
const needsGlossaryContext = reportType === "summary" || reportType.startsWith("glossary");
if (needsGlossaryContext) {
  for (const record of records) {
    const originalSemantic = semanticText(record, record.original);
    const translatedSemantic = semanticText(record, record.translated);
    const consumedRanges = [];
    for (const form of glossaryForms) {
      form.sourceExpression.lastIndex = 0;
      const matches = [...originalSemantic.matchAll(form.sourceExpression)];
      if (!matches.length) continue;
      const uncovered = matches.some((match) => {
        const start = match.index;
        const end = start + match[0].length;
        return !consumedRanges.some(([rangeStart, rangeEnd]) => start >= rangeStart && end <= rangeEnd);
      });
      if (!uncovered) continue;
      for (const match of matches) consumedRanges.push([match.index, match.index + match[0].length]);
      if (form.translatedExpressions.some((expression) => {
        expression.lastIndex = 0;
        return expression.test(translatedSemantic);
      })) continue;
      glossaryContext.push({ ...record, ...form });
    }
  }
}

function proseRecord(record) {
  const explicit = record.target.startsWith("Characters/Dialogue/")
    || record.target.startsWith("Strings/schedules/")
    || record.target === "Data/EngagementDialogue"
    || record.target === "Data/ExtraDialogue"
    || record.target === "Data/NPCGiftTastes"
    || record.target === "Data/SecretNotes"
    || record.target === "Data/mail"
    || record.target.startsWith("Data/Events/")
    || record.target.startsWith("Data/Festivals/")
    || record.target === "Strings/Movies"
    || record.target === "Strings/MovieReactions"
    || record.target === "Strings/MovieConcessions"
    || record.target === "Strings/Locations"
    || record.target === "Strings/Quests"
    || record.target === "Strings/SimpleNonVillagerDialogues"
    || record.target === "Strings/StringsFromMaps";
  if (explicit || record.target === "Data/TV/TipChannel") return true;
  return record.target.startsWith("Strings/")
    && record.translated.length >= 40
    && /[.!?…#$^\n]/u.test(record.translated);
}

function visibleText(value) {
  return value
    .replace(/%item\b.*?%%/gs, " ")
    .replace(/%revealtaste:[^#$^|/\n]*/g, " ")
    .replace(/\$[qr]\s+[^#]*/g, " ")
    .replace(/\$c\s+[.\d]+/g, " ")
    .replace(/\$\{[^}]*\}/g, "x")
    .replace(/\$[A-Za-z0-9]+/g, " ")
    .replace(/%[A-Za-z0-9_]+/g, "x")
    .replace(/\{\{[^}]+\}\}/g, " ")
    .replace(/\{[^}]+\}/g, "x")
    .replace(/\s*\[#\]/g, ". ")
    .replace(/\[[^\]]+\]/g, "x")
    .replace(/\([A-Z]+\)[A-Za-z0-9_]+/g, " ")
    .replace(/#[^#]*#/g, " ");
}

const duplicateWords = [];
const spacing = [];
for (const record of records.filter(proseRecord)) {
  const visible = visibleText(semanticText(record, record.translated));
  const sourceVisible = visibleText(semanticText(record, record.original));
  const duplicate = visible.match(/(?<![\p{L}\p{N}])(\p{L}{2,})[ \t]+\1(?![\p{L}\p{N}])/iu);
  if (duplicate) duplicateWords.push({ ...record, match: duplicate[0] });
  const badSpacing = visible.match(/\s+[,.!?;:](?![.)])/u);
  const sourceBadSpacing = sourceVisible.match(/\s+[,.!?;:](?![.)])/u);
  if (badSpacing && !sourceBadSpacing) spacing.push({ ...record, match: badSpacing[0] });
}

const likelyEnglish = new Set([
  "about", "after", "again", "always", "and", "animal", "are", "before", "better",
  "but", "can", "come", "day", "did", "does", "don't", "farm", "farmer", "festival",
  "for", "friend", "from", "give", "going", "good", "have", "hello", "help", "here",
  "house", "how", "into", "is", "just", "know", "like", "little", "love", "make",
  "maybe", "more", "morning", "much", "need", "never", "new", "night", "not", "now",
  "only", "people", "really", "right", "see", "something", "sorry", "still", "take",
  "thanks", "that", "the", "their", "there", "they", "thing", "think", "this", "time",
  "today", "tomorrow", "town", "very", "want", "was", "water", "way", "we", "well",
  "what", "when", "where", "which", "will", "with", "work", "would", "year", "you",
  "your",
  "back", "buy", "cancel", "chat", "click", "close", "exit", "left", "load",
  "menu", "music", "next", "no", "off", "on", "options", "previous", "right",
  "save", "sell", "settings", "sound", "start", "volume", "yes", "zoom",
]);
const residualEnglish = [];
const residualEnglishAll = [];
const englishTechnicalAllowlist = new Set([
  "Strings/UI\u0000ChatCommands_Help_Intro",
  "Data/mail\u0000winter_19_2",
  "Data/Quests\u0000125",
]);
if (reportType === "summary" || reportType === "english") {
  for (const record of records.filter(proseRecord)) {
    if (englishTechnicalAllowlist.has(`${record.target}\0${record.key}`)) continue;
    const visible = visibleText(semanticText(record, record.translated));
    const hits = [...visible.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)]
      .map((match) => match[0])
      .filter((word) => likelyEnglish.has(word.toLowerCase()));
    if (hits.length) residualEnglish.push({ ...record, match: [...new Set(hits)].join(", ") });
  }
}
if (reportType === "english-all") {
  for (const record of records) {
    if (englishTechnicalAllowlist.has(`${record.target}\0${record.key}`)) continue;
    const visible = visibleText(semanticText(record, record.translated));
    const sourceWords = new Set(
      [...visibleText(semanticText(record, record.original)).matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)]
        .map((match) => match[0].toLowerCase()),
    );
    const hits = [...visible.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)]
      .map((match) => match[0])
      .filter((word) =>
        likelyEnglish.has(word.toLowerCase()) && sourceWords.has(word.toLowerCase())
      );
    if (hits.length) residualEnglishAll.push({
      ...record,
      match: [...new Set(hits)].join(", "),
    });
  }
}

const glossaryTargetPhrases = [...new Set(
  Object.values(swahiliGlossary)
    .flatMap((entry) => entry.term.split(" / "))
    .filter((term) => /^\p{Lu}/u.test(term) && [...term].length > 1),
)].sort((left, right) => right.length - left.length);
const displayNames = new Set();
for (const record of records) {
  if (
    record.target === "Strings/NPCNames"
    || /(?:_Name(?:_\d+)?|_Title|_LocalizedName)$/.test(record.key)
  ) {
    if (
      typeof record.translated === "string"
      && record.translated.length <= 120
      && !/[#$^|/\n]/u.test(record.translated)
    ) displayNames.add(record.translated);
  }
}
const protectedCapitalizationPhrases = [...new Set([
  ...glossaryTargetPhrases,
  ...[...displayNames].filter((name) => /\s/u.test(name)),
])].sort((left, right) => right.length - left.length);
const properWords = new Set();
for (const entry of englishGlossary) {
  if (
    entry.category !== "Characters & named creatures"
    && entry.category !== "World, peoples & organizations"
  ) continue;
  for (const term of swahiliGlossary[entry.id].term.split(" / ")) {
    if (/^\p{Lu}[\p{L}'’-]+$/u.test(term)) properWords.add(term);
  }
}
for (const word of ["Bwana", "Bi", "Dkt", "Meya", "Profesa"]) properWords.add(word);
for (const name of displayNames) {
  if (/^\p{Lu}[\p{L}'’-]+$/u.test(name)) properWords.add(name);
}

function capitalizationText(value) {
  return visibleText(value)
    .replace(/[#$^|]+/g, ". ")
    .replace(/_/g, ". ")
    .replace(/(?<!:)\/(?!\/)/g, ". ")
    .replace(/\\n/g, ". ");
}

const capitalization = [];
if (reportType === "summary" || reportType.startsWith("capitalization")) {
  for (const record of records.filter(proseRecord)) {
    let text = capitalizationText(semanticText(record, record.translated));
    for (const phrase of protectedCapitalizationPhrases) {
      text = text.replace(boundaryExpression(phrase), (match) => " ".repeat(match.length));
    }
    const hits = [];
    for (const match of text.matchAll(/(?<!\p{L})\p{Lu}[\p{L}'’-]*/gu)) {
      const word = match[0];
      if (properWords.has(word) || (word.length > 1 && word === word.toUpperCase())) continue;
      let offset = match.index - 1;
      while (offset >= 0 && /\s/u.test(text[offset])) offset -= 1;
      if (offset < 0 || /[.!?…:;"'‘’“”()[\]{}\-–—]/u.test(text[offset])) continue;
      hits.push(word);
    }
    if (hits.length) capitalization.push({ ...record, match: [...new Set(hits)].join(", ") });
  }
}

const unchangedShort = reportType === "unchanged-short"
  ? records.filter((record) =>
    record.target.startsWith("Strings/")
      && record.original === record.translated
      && record.translated.length <= 50
      && /[A-Za-z]{2}/.test(record.translated)
      && !/[\\/\[\]{}]/.test(record.translated)
  ).map((record) => ({ ...record, match: record.translated }))
  : [];

function compact(value, maximum = 420) {
  const singleLine = value.replaceAll("\n", "\\n");
  return singleLine.length <= maximum ? singleLine : `${singleLine.slice(0, maximum)}…`;
}

function line(item) {
  const preview = compact(item.translated);
  const detail = item.id
    ? `${item.priority} ${item.id}: ${JSON.stringify(item.sourceTerm)} -> ${JSON.stringify(item.targetTerm)}`
    : JSON.stringify(item.match);
  const sourcePreview = item.id ? `\tEN=${JSON.stringify(compact(item.original, 240))}` : "";
  return `${item.relative}\t${item.target}\t${item.key}\t${detail}${sourcePreview}\tSW=${JSON.stringify(preview)}`;
}

const reports = {
  glossary: glossaryContext,
  "glossary-p0": glossaryContext.filter((item) => item.priority === "P0"),
  "glossary-names": glossaryContext.filter((item) =>
    /^\p{Lu}/u.test(item.sourceTerm) && /^\p{Lu}/u.test(item.targetTerm)
  ),
  duplicates: duplicateWords,
  spacing,
  english: residualEnglish,
  "english-all": residualEnglishAll,
  capitalization,
  "unchanged-short": unchangedShort,
};
if (requestedTerms.size) {
  for (const [name, items] of Object.entries(reports)) {
    reports[name] = items.filter((item) =>
      requestedTerms.has(item.id) || requestedTerms.has(item.sourceTerm)
    );
  }
}
if (requestedWords.size) {
  reports.capitalization = reports.capitalization.filter((item) =>
    item.match.split(", ").some((word) => requestedWords.has(word))
  );
}

if (reportType === "summary") {
  const byPriority = Object.fromEntries(
    ["P0", "P1", "P2"].map((priority) => [
      priority,
      glossaryContext.filter((item) => item.priority === priority).length,
    ]),
  );
  console.log(JSON.stringify({
    records: records.length,
    glossaryContextCandidates: glossaryContext.length,
    glossaryContextByPriority: byPriority,
    duplicateWordCandidates: duplicateWords.length,
    spacingCandidates: spacing.length,
    residualEnglishCandidates: residualEnglish.length,
    capitalizationCandidates: capitalization.length,
  }, null, 2));
} else if (reportType === "capitalization-terms") {
  const counts = new Map();
  for (const item of capitalization) {
    for (const word of item.match.split(", ")) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  for (const [word, count] of [...counts].sort((left, right) => right[1] - left[1]).slice(0, limit)) {
    console.log(`${String(count).padStart(5)}\t${word}`);
  }
} else if (
  reportType === "glossary-terms"
  || reportType === "glossary-p0-terms"
  || reportType === "glossary-name-terms"
) {
  const counts = new Map();
  const terms = reportType === "glossary-p0-terms"
    ? glossaryContext.filter((item) => item.priority === "P0")
    : reportType === "glossary-name-terms"
      ? glossaryContext.filter((item) =>
      /^\p{Lu}/u.test(item.sourceTerm) && /^\p{Lu}/u.test(item.targetTerm)
      )
      : glossaryContext;
  for (const item of terms) {
    const id = `${item.priority}\t${item.id}\t${item.sourceTerm}\t${item.targetTerm}`;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const [id, count] of [...counts].sort((left, right) => right[1] - left[1]).slice(0, limit)) {
    console.log(`${String(count).padStart(5)}\t${id}`);
  }
} else if (reportType === "glossary-p0-samples") {
  const groups = new Map();
  for (const item of glossaryContext.filter((candidate) => candidate.priority === "P0")) {
    const id = `${item.id}\0${item.sourceTerm}\0${item.targetTerm}`;
    if (!groups.has(id)) groups.set(id, []);
    if (groups.get(id).length < 2) groups.get(id).push(item);
  }
  for (const [id, items] of [...groups].slice(0, limit)) {
    const [glossaryID, sourceTerm, targetTerm] = id.split("\0");
    console.log(`\n[P0 ${glossaryID}] ${JSON.stringify(sourceTerm)} -> ${JSON.stringify(targetTerm)}`);
    for (const item of items) console.log(line(item));
  }
} else if (reports[reportType]) {
  for (const item of reports[reportType].slice(0, limit)) console.log(line(item));
} else {
  console.error(`Unknown report type: ${reportType}`);
  process.exitCode = 2;
}
