#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/traditional-chinese",
);
const outputRoot = path.join(projectRoot, "Documentation/traditional-chinese-batches");

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listJSONFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

const records = [];
for (const relative of listJSONFiles(translationRoot).sort()) {
  const document = JSON.parse(fs.readFileSync(path.join(translationRoot, relative), "utf8"));
  for (const change of document.Changes ?? []) {
    for (const [key, source] of Object.entries(change.Entries ?? {})) {
      records.push({ relative, target: change.Target, key, source });
    }
  }
}

const reviewed = new Set();
for (const relative of listJSONFiles(outputRoot).sort()) {
  if (relative.startsWith("technical-")) continue;
  const batch = JSON.parse(fs.readFileSync(path.join(outputRoot, relative), "utf8"));
  for (const record of batch.records ?? []) reviewed.add(`${record.target}\u0000${record.key}`);
}

for (const relative of listJSONFiles(outputRoot)) {
  if (relative.startsWith("technical-")) fs.unlinkSync(path.join(outputRoot, relative));
}

const categories = [
  {
    name: "recipes",
    matches: (record) => record.target === "Data/CookingRecipes" || record.target === "Data/CraftingRecipes",
  },
  {
    name: "schedules",
    matches: (record) => record.target.startsWith("Characters/schedules/"),
  },
  {
    name: "data-reference",
    matches: (record) => record.relative === "data-reference-technical.json",
  },
  {
    name: "misc-safe",
    matches: (record) => {
      if (record.relative === "festivals-reference.json"
        && /^(?:conditions|set-up|set-up_y2|shop_y2|secretSanta|secretSanta_y2)$/.test(record.key)) {
        return true;
      }
      if (record.relative === "secret-notes.json" && /^!image \d+$/.test(record.source)) return true;
      if (record.relative === "npc-gift-tastes.json" && record.key.startsWith("Universal_")) return true;
      if (record.relative === "aquarium-fish.json") return true;
      if (record.relative === "marriage-krobus-dialogue.json" && record.source === "...") return true;
      if ((record.relative === "krobus-dialogue.json" || record.relative === "jas-dialogue.json")
        && record.source === "...") return true;
      if (record.relative === "credits.json") {
        const preservedCreditKeys = new Set([
          "0", "1", "2", "3", "4", "6", "7", "9", "10", "11", "12", "13", "14", "15",
          "17", "18", "19", "21", "22", "24", "25", "26", "28", "29", "48", "50", "51",
          "53", "54", "56", "57", "58", "60", "61", "63", "64", "65", "67", "68", "69",
          "74", "75", "76",
        ]);
        return preservedCreditKeys.has(record.key);
      }
      return false;
    },
  },
];

function partition(items, minimum, maximum) {
  if (!items.length) return [];
  const groupCount = Math.ceil(items.length / maximum);
  if (Math.floor(items.length / groupCount) < minimum) {
    throw new Error(`Cannot partition ${items.length} records into ${minimum}-${maximum}`);
  }
  const base = Math.floor(items.length / groupCount);
  const remainder = items.length % groupCount;
  const groups = [];
  let offset = 0;
  for (let index = 0; index < groupCount; index += 1) {
    const size = base + (index < remainder ? 1 : 0);
    groups.push(items.slice(offset, offset + size));
    offset += size;
  }
  return groups;
}

let fileCount = 0;
let recordCount = 0;
for (const category of categories) {
  const selected = records
    .filter(category.matches)
    .filter((record) => !reviewed.has(`${record.target}\u0000${record.key}`))
    .sort((left, right) => left.target.localeCompare(right.target) || left.key.localeCompare(right.key));
  const kinds = [
    ["short", selected.filter((record) => record.source.length <= 320), 40, 80],
    ["long", selected.filter((record) => record.source.length > 320), 15, 30],
  ];
  for (const [kind, kindRecords, minimum, maximum] of kinds) {
    for (const [index, group] of partition(kindRecords, minimum, maximum).entries()) {
      const sequence = String(index + 1).padStart(2, "0");
      const id = `technical-${category.name}-${kind}-${sequence}`;
      const document = {
        id,
        kind,
        records: group.map(({ target, key, source }) => ({
          target,
          key,
          source,
          reviewedPreserve: true,
        })),
      };
      fs.writeFileSync(
        path.join(outputRoot, `${id}.json`),
        `${JSON.stringify(document, null, 2)}\n`,
      );
      fileCount += 1;
      recordCount += group.length;
    }
  }
}

console.log(JSON.stringify({ files: fileCount, records: recordCount }, null, 2));
