#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  root,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/vietnamese",
);
const englishRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : "/Users/antonkrutov/Developer/data/stardew-english-unpacked";

const errors = [];
const warnings = [];
const candidates = [];
const glossaryCandidates = [];
const sourceCache = new Map();

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    return null;
  }
}

function sourceContent(target) {
  if (!sourceCache.has(target)) {
    sourceCache.set(target, readJSON(path.join(englishRoot, `${target}.json`))?.content ?? null);
  }
  return sourceCache.get(target);
}

function quoted(value) {
  return [...value.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((match) => match[1]);
}

function containsTerm(value, term, ignoreCase = false) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?<![\\p{L}\\p{M}])${escaped}(?![\\p{L}\\p{M}])`,
    ignoreCase ? "iu" : "u",
  ).test(value);
}

function isEvent(target, value) {
  return target.startsWith("Data/Events/")
    || /(?:^|\/)(?:speak|message|question|quickQuestion|textAboveHead)(?: |\/|$)/.test(value);
}

const englishFunctionWords = /(?<![\p{L}\p{M}])(?:and|are|because|but|could|did|does|for|from|have|here|how|into|just|now|of|our|should|that|their|them|there|these|they|this|those|through|was|were|what|when|where|which|while|who|why|will|with|would|you|your)(?![\p{L}\p{M}])/iu;
const staleTerms = [
  ["Bùa Hắc ám", "Bùa Tối"],
  ["Bùa Hắc Ám", "Bùa Tối"],
  ["Dâu đen", "Mâm xôi Đen"],
  ["Gỗ Cứng", "Gỗ cứng"],
  ["Mặt dây chuyền Nàng tiên cá", "Mặt dây Nàng tiên cá"],
  ["thiết bị chứa người ngủ", "a natural Vietnamese description"],
  ["đường đường đường", "remove the accidental repeated word"],
  ["dễ sợ", "dễ hoảng sợ"],
  ["Sữa Rắn Iridium", "Sữa Rắn Iridi"],
  ["=Stardrop", "=Quả Sao Rơi"],
  ["Máy Nhân Pha lê", "Máy nhân tinh thể"],
  ["Vòi phun Iridi", "Vòi phun nước Iridi"],
  ["Vòi phun Chất lượng", "Vòi phun nước Chất lượng"],
  ["Quán Stardrop", "quán rượu or Quán rượu Stardrop, according to the English source"],
  ["Tỉ lệ", "Tỷ lệ"],
  ["tỉ lệ", "tỷ lệ"],
];
const englishGlossary = readJSON(path.join(root, "Documentation/glossary/glossary.en.json"));
const vietnameseGlossary = readJSON(path.join(root, "Documentation/glossary/glossary.vi.json"))?.vi;
const glossaryPairs = [];
const singleWordGlossaryIds = new Set([
  "stardrop",
  "iridium",
  "festival",
  "fertilizer",
  "sprinkler",
  "hardwood",
  "dehydrator",
  "workbench",
  "crystalarium",
  "slingshot",
  "inventory",
  "journal",
  "collections",
  "profession",
  "mastery",
  "perfection",
  "pickaxe",
  "greenhouse",
  "furnace",
  "options",
  "organize",
  "reclaim",
  "fullscreen",
  "resolution",
  "refresh",
  "farmhand",
  "dinosaur",
  "ostrich",
  "trinket",
  "unforge",
  "bookseller",
  "shipwreck",
  "villager",
  "farming-skill",
  "foraging-skill",
  "fishing-skill",
  "crafting",
  "cooking",
  "harvest",
  "quality",
  "grandpa",
  "railroad",
  "backwoods",
  "trailer",
  "volcano-map-label",
  "achievements-menu",
  "letters-menu",
  "birthday",
  "defense",
  "immunity",
  "knockback",
  "objective",
  "gathering-quest",
]);
for (const entry of englishGlossary ?? []) {
  const translated = vietnameseGlossary?.[entry.id]?.term;
  if (!translated) continue;
  const sources = entry.term.split(" / ");
  const targets = translated.split(" / ");
  if (sources.length !== targets.length) continue;
  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    const target = targets[index];
    if (
      source === target
      || source.length < 8
      || (!source.includes(" ") && !singleWordGlossaryIds.has(entry.id))
    ) continue;
    glossaryPairs.push({ id: entry.id, source, target });
  }
}

// These records were manually reviewed after the full glossary candidate scan.
// They use technical actor tokens, a more specific furniture label, or a natural
// Vietnamese grammatical adaptation of the glossary concept.
const glossaryContextExceptions = new Set([
  "Data/Events/AnimalShop\u00003900074/f Shane 2000/e 2118991/p Shane\u0000chicken",
  "Strings/Furniture\u0000FoodPetBowl\u0000pet-bowl",
  "Strings/Furniture\u0000WaterPetBowl\u0000pet-bowl",
  "Data/mail\u0000winter_26_1\u0000in-season-out-of-season",
  "Characters/Dialogue/MarriageDialogueLeah\u0000winter_1\u0000in-season-out-of-season",
  "Strings/Notes\u00009\u0000the-mines",
  "Strings/Objects\u0000ArtichokeSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000BeanStarter_Description\u0000growth-stage",
  "Strings/Objects\u0000BeetSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000BlueberrySeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000BokChoySeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000BroccoliSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000CactusSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000CornSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000CranberrySeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000EggplantSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000GarlicSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000KaleSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000MelonSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000ParsnipSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000PepperSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000PineappleSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000PotatoSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000PumpkinSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000QiBean_Description\u0000growth-stage",
  "Strings/Objects\u0000RadishSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000RedCabbageSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000RhubarbSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000RiceShoot_Description\u0000growth-stage",
  "Strings/Objects\u0000StarfruitSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000StrawberrySeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000TaroTuber_Description\u0000growth-stage",
  "Strings/Objects\u0000TeaSapling_Description\u0000growth-stage",
  "Strings/Objects\u0000TomatoSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000WheatSeeds_Description\u0000growth-stage",
  "Strings/Objects\u0000YamSeeds_Description\u0000growth-stage",
  "Characters/Dialogue/Pierre\u0000Mon4\u0000fruit-tree-sapling",
  "Strings/SpecialOrderStrings\u0000QiChallenge2_Text\u0000deadline",
  "Characters/Dialogue/Clint\u0000Mon8\u0000profession",
  "Characters/Dialogue/Elliott\u0000event_idea3\u0000profession",
  "Characters/Dialogue/George\u0000Fri4\u0000profession",
  "Characters/Dialogue/Leah\u0000Tue4\u0000profession",
  "Strings/StringsFromCSFiles\u0000FishingGame.cs.12011\u0000perfection",
  "Strings/StringsFromCSFiles\u0000FishingGame.cs.12012\u0000perfection",
  "Data/Quests\u0000107\u0000backwoods",
]);

let records = 0;
let eventRecords = 0;
for (const fileName of fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort()) {
  const document = readJSON(path.join(translationRoot, fileName));
  for (const change of document?.Changes ?? []) {
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries ?? {})) {
      records += 1;
      const original = source?.[key];
      if (typeof original !== "string" || typeof translated !== "string") continue;
      const id = `${change.Target} :: ${key}`;

      for (const [stale, expected] of staleTerms) {
        if (translated.includes(stale)) warnings.push(`${id}: stale term ${JSON.stringify(stale)}; use ${expected}`);
      }
      if (/\b\d{1,3},\d{3}g\b/.test(translated)) {
        warnings.push(`${id}: English thousands separator remains in visible currency`);
      }
      if (change.Target === "Data/NPCGiftTastes" && /\s+\//.test(translated)) {
        warnings.push(`${id}: whitespace before structured gift-taste delimiter`);
      }

      if (translated === original) continue;
      const originalSegments = isEvent(change.Target, original) ? quoted(original) : [original];
      const translatedSegments = isEvent(change.Target, original) ? quoted(translated) : [translated];
      if (isEvent(change.Target, original)) eventRecords += 1;
      if (originalSegments.length !== translatedSegments.length) {
        errors.push(`${id}: visible-segment count differs`);
        continue;
      }
      for (let index = 0; index < translatedSegments.length; index += 1) {
        const segment = translatedSegments[index];
        if (englishFunctionWords.test(segment)) {
          candidates.push(`${id} [segment ${index + 1}]: ${JSON.stringify(segment)}`);
        }
        if (originalSegments[index].includes("?") && !segment.includes("?")) {
          candidates.push(`${id} [segment ${index + 1}]: question punctuation is missing`);
        }
        for (const match of segment.matchAll(
          /(?<![\p{L}\p{M}])([\p{L}\p{M}]{2,})\s+\1\s+\1(?![\p{L}\p{M}])/giu,
        )) {
          if (!["ha", "hê", "hì", "không", "tôi", "cũ", "ya", "na", "cha", "true", "false"].includes(match[1].toLocaleLowerCase("vi"))) {
            warnings.push(`${id} [segment ${index + 1}]: repeated word ${JSON.stringify(match[0])}`);
          }
        }
      }
      const originalVisible = originalSegments.join("\n");
      const translatedVisible = translatedSegments.join("\n");
      for (const pair of glossaryPairs) {
        if (glossaryContextExceptions.has(`${change.Target}\u0000${key}\u0000${pair.id}`)) continue;
        if (
          pair.id === "stardrop"
          && containsTerm(originalVisible, "Stardrop Saloon", true)
          && containsTerm(translatedVisible, "Quán rượu Stardrop", true)
        ) continue;
        if (
          containsTerm(originalVisible, pair.source)
          && !containsTerm(translatedVisible, pair.target, true)
        ) {
          glossaryCandidates.push(
            `${id}: ${pair.id} ${JSON.stringify(pair.source)} -> ${JSON.stringify(pair.target)}; current ${JSON.stringify(translatedVisible)}`,
          );
        }
      }
    }
  }
}

console.log(JSON.stringify({
  files: fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).length,
  records,
  eventRecords,
  candidates: candidates.length,
  glossaryCandidates: glossaryCandidates.length,
  warnings: warnings.length,
  errors: errors.length,
}, null, 2));
for (const item of candidates) console.log(`CANDIDATE ${item}`);
for (const item of glossaryCandidates) console.log(`GLOSSARY ${item}`);
for (const item of warnings) console.error(`WARN ${item}`);
for (const item of errors) console.error(`ERROR ${item}`);
if (errors.length) process.exitCode = 1;
