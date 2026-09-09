#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/audit-filipino-editorial.mjs <unpacked-English-assets-dir> [--report=TYPE] [--limit=N]");
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
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/filipino",
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
  if (eventTarget && /^\$y\s+['"]/u.test(value)) return value;
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
    if (!change.Entries) continue;
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries)) {
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
const filipinoGlossary = readJSON(
  path.join(projectRoot, "Documentation/glossary/glossary.fil.json"),
).fil;
const glossaryForms = [];
for (const entry of englishGlossary) {
  const targetTerm = filipinoGlossary[entry.id].term;
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
    .replace(/%farm\s+Farm\b/gi, "x")
    .replace(/\bright-click\b/gi, " ")
    .replace(/\*[^*]+\*/g, " ")
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
  "for", "friend", "from", "give", "going", "good", "have", "help", "here",
  "house", "how", "into", "is", "just", "know", "like", "little", "love", "make",
  "maybe", "more", "morning", "much", "need", "never", "new", "night", "not", "now",
  "only", "people", "really", "right", "see", "something", "sorry", "still", "take",
  "thanks", "that", "the", "their", "there", "they", "thing", "think", "this", "time",
  "today", "tomorrow", "town", "very", "want", "was", "water", "way", "we", "well",
  "what", "when", "where", "which", "will", "with", "work", "would", "year", "you",
  "your",
  "back", "buy", "cancel", "chat", "close", "cute", "exit", "left", "load",
  "music", "next", "no", "off", "on", "options", "previous", "right",
  "sell", "settings", "sound", "start", "volume", "yes", "zoom",
]);
const residualEnglish = [];
const residualEnglishAll = [];
const englishTechnicalAllowlist = new Set([
  "Strings/UI\u0000ChatCommands_Help_Intro",
  "Data/mail\u0000winter_19_2",
  "Data/Quests\u0000125",
  "Data/Events/Temp\u0000poppy",
  "Data/Events/Temp\u0000honkytonk",
]);
if (reportType === "summary" || reportType === "english" || reportType === "gate") {
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
  Object.values(filipinoGlossary)
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
  for (const term of filipinoGlossary[entry.id].term.split(" / ")) {
    if (/^\p{Lu}[\p{L}'’-]+$/u.test(term)) properWords.add(term);
  }
}
for (const word of ["Ginoo", "Ginang", "Gng", "Dr", "Alkalde", "Propesor", "Tita", "Tito", "Lolo", "Lola"]) properWords.add(word);
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
  return `${item.relative}\t${item.target}\t${item.key}\t${detail}${sourcePreview}\tFIL=${JSON.stringify(preview)}`;
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

const duplicateAllowlist = new Set([
  "Characters/Dialogue/Alex\u0000AcceptGift_(O)289",
  "Characters/Dialogue/Elliott\u0000Resort_Bar",
  "Data/Events/Beach\u0000739330/t 600 1710/*n spring_2_1",
  "Data/Events/FishShop\u000016253595/j 29/X",
  "Data/Events/Hospital\u0000571102/f Harvey 2000",
  "Data/Events/SamHouse\u000095/e 93/k 94/t 1800 1950/i 136/y 2",
  "Data/Events/SeedShop\u00003/f Abigail 2000/p Abigail/t 2000 2200/n abbySpiritBoard",
  "Data/ExtraDialogue\u0000Birdie19",
  "Strings/Locations\u0000IslandNorth_Event_SafariManAppear",
  "Strings/Locations\u0000IslandFieldOffice_Intro_Event",
  "Data/mail\u0000hatter",
  "Characters/Dialogue/Marnie\u0000Resort_Shore",
  "Characters/Dialogue/MarriageDialogue\u0000Indoor_Day_Alex",
  "Strings/Notes\u000020",
  "Strings/1_6_Strings\u0000Willy_Challenge_Return_3",
  "Strings/1_6_Strings\u0000QiSummitCheat",
  "Characters/Dialogue/Pam\u0000Saloon_Thu",
  "Characters/Dialogue/Pam\u0000Tue2",
  "Characters/Dialogue/Pam\u0000winter_Thu",
  "Strings/SimpleNonVillagerDialogues\u0000derby_contestent4",
  "Strings/SimpleNonVillagerDialogues\u0000winter_derby_contestent4",
  "Strings/StringsFromCSFiles\u0000ItemDeliveryQuest.cs.13599",
  "Strings/StringsFromMaps\u0000PirateBartender_PirateClothes",
  "Strings/StringsFromMaps\u0000PirateBartender_PirateClothes_NoMore",
]);
const unresolvedDuplicates = duplicateWords.filter((record) =>
  !duplicateAllowlist.has(`${record.target}\u0000${record.key}`)
);
const modifierApostrophes = records.filter((record) => record.translated.includes("\u02bc"));
const inconsistentKaniyang = records.filter((record) =>
  /(?<![\p{L}\p{N}])[Kk]anyang(?![\p{L}\p{N}])/u.test(
    semanticText(record, record.translated),
  )
);
const inconsistentLoanSpelling = records.filter((record) =>
  /(?<![\p{L}\p{N}])(?:napakacute|guinea pig)(?![\p{L}\p{N}])/iu.test(
    semanticText(record, record.translated),
  )
);
const canonicalNameVariantRules = [
  [/\bamatista\b/iu, '"amatista" (use "ametista")'],
  [/\bTipak ng Artiko\b/iu, '"Tipak ng Artiko"'],
  [/\b(?:Agwamarina|akuwamarina)\b/iu, 'Aquamarine spelling variant'],
  [/\bIsdang-(?:Gleysyer|Gleyser|Glacier|Krimson)\b/iu, 'hyphenated or English legendary-fish variant'],
  [/\bBahagharing Trutsa\b/iu, '"Bahagharing Trutsa"'],
  [/\bMaanghang na Berry\b/iu, '"Maanghang na Berry"'],
  [/\bLigaw na Malunggay\b/iu, '"Ligaw na Malunggay"'],
  [/\bIsdang[- ]Lobo\b/iu, 'Pufferfish variant'],
  [/\bMapusyaw na (?:Ale|Serbesa)\b/iu, 'Pale Ale variant'],
  [/\bBaretang (?:Tanso|Bakal|Iridyum)\b/iu, 'metal-bar variant'],
  [/\bMayones ng Kawalan\b/iu, 'Void Mayonnaise spelling variant'],
  [/\bAnak ng Pulang Isda\b/iu, 'Son of Crimsonfish variant'],
  [/\bKarot ng Yungib\b/iu, 'Cave Carrot variant'],
  [/\bBahagharing Kabibe\b/iu, 'Rainbow Shell variant'],
];
const canonicalNameVariants = [];
for (const record of records) {
  const text = semanticText(record, record.translated);
  for (const [expression, label] of canonicalNameVariantRules) {
    expression.lastIndex = 0;
    if (expression.test(text)) canonicalNameVariants.push({ record, label });
  }
}
const semanticConsistencyRules = [
  {
    label: 'untranslated lowercase "adventurer" (use "manlalakbay" outside the proper guild name)',
    test: (record, text) => /(?<![\p{L}\p{N}])adventurer(?:s)?(?![\p{L}\p{N}])/u.test(text),
  },
  {
    label: 'Sandy incorrectly refers to the Valley as her own home',
    test: (record, text) => record.key.startsWith("Sandy")
      && /Narinig kong umuulan sa (?:atin|dati kong tahanan)/u.test(text),
  },
  {
    label: 'literal action cue "gulat na singhap" (use the natural verb "napasinghap")',
    test: (record, text) => record.target.startsWith("Data/Festivals/")
      && record.key.startsWith("Dwarf")
      && text.includes("*gulat na singhap*"),
  },
  {
    label: 'ungrammatical or clumsy jealousy wording',
    test: (record, text) => record.key === "TwoKids_1"
      && /(?:magselosan sila|selosan sa pagitan nila)/u.test(text),
  },
  {
    label: "Pam's non-response lost its negation",
    test: (record, text) => record.target === "Characters/Dialogue/Pam"
      && record.key === "Saloon_Sat"
      && !text.includes("Hindi sumasagot si Pam"),
  },
  {
    label: "NPC.cs.4118 does not convey the original gift anecdote",
    test: (record, text) => record.target === "Strings/StringsFromCSFiles"
      && record.key === "NPC.cs.4118"
      && !text.includes("Ibinigay ko iyon sa kaniya noong isang taon"),
  },
];
const semanticConsistencyFindings = [];
for (const record of records) {
  const text = semanticText(record, record.translated);
  for (const rule of semanticConsistencyRules) {
    if (rule.test(record, text)) semanticConsistencyFindings.push({ record, label: rule.label });
  }
}
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

if (reportType === "gate") {
  const details = [
    ...unresolvedDuplicates.map((record) => `duplicate word: ${record.target} :: ${record.key}`),
    ...spacing.map((record) => `spacing: ${record.target} :: ${record.key}`),
    ...residualEnglish.map((record) => `English residue (${record.match}): ${record.target} :: ${record.key}`),
    ...modifierApostrophes.map((record) => `unsupported modifier apostrophe: ${record.target} :: ${record.key}`),
    ...inconsistentKaniyang.map((record) => `inconsistent project spelling "kanyang": ${record.target} :: ${record.key}`),
    ...inconsistentLoanSpelling.map((record) => `inconsistent project loanword spelling: ${record.target} :: ${record.key}`),
    ...canonicalNameVariants.map(({ record, label }) => `inconsistent canonical name (${label}): ${record.target} :: ${record.key}`),
    ...semanticConsistencyFindings.map(({ record, label }) => `semantic consistency (${label}): ${record.target} :: ${record.key}`),
  ];
  console.log(JSON.stringify({
    records: records.length,
    acceptedIntentionalDuplicates: duplicateWords.length - unresolvedDuplicates.length,
    unresolvedDuplicateWords: unresolvedDuplicates.length,
    spacingErrors: spacing.length,
    residualEnglishErrors: residualEnglish.length,
    modifierApostropheErrors: modifierApostrophes.length,
    projectSpellingErrors: inconsistentKaniyang.length + inconsistentLoanSpelling.length,
    canonicalNameVariantErrors: canonicalNameVariants.length,
    semanticConsistencyErrors: semanticConsistencyFindings.length,
    warnings: 0,
    errors: details.length,
    details,
  }, null, 2));
  if (details.length) process.exitCode = 1;
} else if (reportType === "summary") {
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
