#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/urdu",
);
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const outputRoot = path.join(projectRoot, "Documentation/urdu-batches");

const repairStardew = process.argv.includes("--repair-stardew");
const repairNames = process.argv.includes("--repair-names");
const repairLocations = process.argv.includes("--repair-locations");
const rules = repairStardew ? [
  [/Stardew Valley/, "ااسٹارڈیو ویلی", "اسٹارڈیو ویلی"],
] : repairNames ? [
  [/Leah/, "لیہ", "لیا"],
  [/Harvey/, "ہاروے", "ہاروی"],
  [/Demetrius/, "ڈیمیٹریس", "ڈیمیٹریئس"],
  [/Mayor Lewis/, "میئر لیوس", "میئر لوئس"],
  [/Welwick/, "ویل وِک", "ویل وک"],
  [/Sebastian/, "سیباسچن", "سباسچین"],
  [/Evelyn/, "ایولین", "ایولن"],
  [/Linus/, "لینس", "لائنس"],
] : repairLocations ? [
  [/Zuzu City/, "زوزو سٹی", "زوزو شہر"],
  [/Pierre.s General Store/, "پیئر کے جنرل اسٹور", "پیئر کی عام دکان"],
  [/Pierre.s General Store/, "پیئر کی جنرل اسٹور", "پیئر کی عام دکان"],
  [/Pierre.s General Store/, "پیئر جنرل اسٹور", "پیئر کی عام دکان"],
  [/Pierre.s General Store/, "پیئر کا جنرل اسٹور", "پیئر کی عام دکان"],
  [/Marnie.s Ranch/, "مارنی مویشی فارم", "مارنی کا مویشی فارم"],
  [/Night Market/, "نائٹ مارکیٹ", "رات کا بازار"],
  [/Night Market/, "شب بازار", "رات کا بازار"],
  [/Night Market/, "رات بازار", "رات کا بازار"],
  [/Desert Festival/, "صحرا میلہ", "صحرا کا تہوار"],
  [/Desert Festival/, "صحرائی تہوار", "صحرا کا تہوار"],
  [/Spirit.s Eve/, "اسپرٹ ایو", "روحوں کی شام"],
  [/Luau/, "لواؤ", "لوآؤ"],
  [/Flower Dance/, "فلاور ڈانس", "پھولوں کا رقص"],
  [/Flower Dance/, "پھول رقص", "پھولوں کا رقص"],
  [/Egg Festival/, "انڈہ میلے", "انڈوں کے تہوار"],
  [/Egg Festival/, "انڈہ میلہ", "انڈوں کا تہوار"],
  [/Festival of Ice/, "برف میلے", "برف کے تہوار"],
  [/Festival of Ice/, "برف میلہ", "برف کا تہوار"],
  [/Feast of the Winter Star/, "سرد ستارہ ضیافت", "سرمائی ستارے کی ضیافت"],
  [/Greenhouse/, "گرین ہاؤس", "شیشہ گھر"],
] : [
  [/Stardew Valley/, "سٹارڈیو ویلی", "اسٹارڈیو ویلی"],
  [/Pelican Town/, "پیلیکن قصب", "پیلیکن ٹاؤن"],
  [/Ginger Island/, "جنجر جزیرے", "جنجر آئی لینڈ"],
  [/Ginger Island/, "جنجر جزیرہ", "جنجر آئی لینڈ"],
  [/Skull Cavern/, "کھوپڑی غار", "اسکل کیورن"],
  [/Stardrop/, "اسٹار ڈراپ", "اسٹارڈراپ"],
  [/Ferngill Republic/, "فرن گل جمہوریہ", "فرنگل جمہوریہ"],
  [/Ferngill Republic/, "جمہوریہ فرنگل", "فرنگل جمہوریہ"],
  [/Gem Sea/, "جیم سی", "جیم سمندر"],
  [/Gem Sea/, "جواہر سمندر", "جیم سمندر"],
  [/Cindersap Forest/, "سنڈر سیپ جنگل", "سنڈرسیپ جنگل"],
  [/Bus Stop/, "بس اڈا", "بس اسٹاپ"],
  [/Railroad/, "ریل راستہ", "ریلوے"],
  [/Quarry/, "پتھر کان", "پتھر کی کان"],
  [/Adventurer.s Guild/, "مہم جو انجمن", "مہم جوؤں کی انجمن"],
];

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  }).sort();
}

const englishCache = new Map();
const records = new Map();
for (const file of listJSONFiles(translationRoot)) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const change of document.Changes ?? []) {
    if (!englishCache.has(change.Target)) {
      const englishPath = path.join(englishRoot, `${change.Target}.json`);
      englishCache.set(change.Target, JSON.parse(fs.readFileSync(englishPath, "utf8")).content);
    }
    for (const [key, translation] of Object.entries(change.Entries ?? {})) {
      const english = englishCache.get(change.Target)[key];
      for (const [sourcePattern, before, after] of rules) {
        if (!sourcePattern.test(english) || !translation.includes(before)) continue;
        const id = `${change.Target}\u0000${key}`;
        const record = records.get(id) ?? {
          target: change.Target,
          key,
          translationReplacements: [],
        };
        record.translationReplacements.push([before, after]);
        records.set(id, record);
      }
    }
  }
}

const ordered = [...records.values()].sort((left, right) => (
  left.target.localeCompare(right.target) || left.key.localeCompare(right.key)
));
const chunks = [];
for (let index = 0; index < ordered.length; index += 100) {
  chunks.push(ordered.slice(index, index + 100));
}
if (repairStardew) {
  if (chunks.length !== 1) {
    throw new Error(`Expected one Stardew repair batch, found ${chunks.length} (${ordered.length} records).`);
  }
  const id = "0462-editorial-stardew-repair";
  const batch = {
    id,
    reviewedAt: "2026-08-27",
    replaceReviewed: true,
    records: chunks[0],
  };
  fs.writeFileSync(path.join(outputRoot, `${id}.json`), `${JSON.stringify(batch, null, 2)}\n`);
  console.log(`${id}: ${chunks[0].length}`);
  process.exit(0);
}
if (repairNames) {
  if (chunks.length !== 2) {
    throw new Error(`Expected two name repair batches, found ${chunks.length} (${ordered.length} records).`);
  }
  for (const [index, recordsChunk] of chunks.entries()) {
    const number = 464 + index;
    const id = `0${number}-editorial-glossary-names-${index === 0 ? "a" : "b"}`;
    const batch = {
      id,
      reviewedAt: "2026-08-27",
      replaceReviewed: true,
      records: recordsChunk,
    };
    fs.writeFileSync(path.join(outputRoot, `${id}.json`), `${JSON.stringify(batch, null, 2)}\n`);
    console.log(`${id}: ${recordsChunk.length}`);
  }
  process.exit(0);
}
if (repairLocations) {
  if (chunks.length !== 1) {
    throw new Error(`Expected one location repair batch, found ${chunks.length} (${ordered.length} records).`);
  }
  const id = "0469-editorial-glossary-locations";
  const batch = {
    id,
    reviewedAt: "2026-08-27",
    replaceReviewed: true,
    records: chunks[0],
  };
  fs.writeFileSync(path.join(outputRoot, `${id}.json`), `${JSON.stringify(batch, null, 2)}\n`);
  console.log(`${id}: ${chunks[0].length}`);
  process.exit(0);
}
if (chunks.length !== 2) {
  throw new Error(`Expected two consistency batches, found ${chunks.length} (${ordered.length} records).`);
}

for (const [index, recordsChunk] of chunks.entries()) {
  const number = 460 + index;
  const id = `0${number}-editorial-proper-nouns-${index === 0 ? "a" : "b"}`;
  const batch = {
    id,
    reviewedAt: "2026-08-27",
    replaceReviewed: true,
    records: recordsChunk,
  };
  fs.writeFileSync(path.join(outputRoot, `${id}.json`), `${JSON.stringify(batch, null, 2)}\n`);
  console.log(`${id}: ${recordsChunk.length}`);
}
