#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeBurmese,
  encodeBurmese,
  mapsFromDocument,
  readClusterDocument,
} from "./burmese-clusters.mjs";

const sourceRoot = path.resolve(
  process.argv[2] || "/Users/antonkrutov/Developer/data/stardew-english-unpacked",
);
const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/burmese",
);
const { encode, decode } = mapsFromDocument(
  readClusterDocument(path.join(projectRoot, "Documentation/burmese-cluster-map.json")),
);

const documents = fs.readdirSync(translationRoot)
  .filter((name) => name.endsWith(".json"))
  .map((name) => ({
    name,
    fullPath: path.join(translationRoot, name),
    document: JSON.parse(fs.readFileSync(path.join(translationRoot, name), "utf8")),
  }));
const sourceCache = new Map();
function sourceContent(target) {
  if (!sourceCache.has(target)) {
    sourceCache.set(
      target,
      JSON.parse(fs.readFileSync(path.join(sourceRoot, `${target}.json`), "utf8")).content,
    );
  }
  return sourceCache.get(target);
}

const replacements = new Map([
  ["black market", "မှောင်ခိုဈေး"],
  ["Secret Notes", "လျှို့ဝှက်မှတ်စုများ"],
  ["Secret Note", "လျှို့ဝှက်မှတ်စု"],
  ["Journey Of The Prairie King", "ပရေရီဘုရင်၏ခရီးစဉ်"],
  ["Journey of the Prairie King", "ပရေရီဘုရင်၏ခရီးစဉ်"],
  ["The Pelicans", "ပယ်လီကန်များ"],
  ["Shadow People", "အရိပ်လူမျိုး"],
  ["Shadow Person", "အရိပ်လူမျိုးဝင်"],
  ["Joja Mart", "ဂျိုဂျာမတ်"],
  ["JojaMart", "ဂျိုဂျာမတ်"],
  ["Rock Crabs", "ကျောက်ကဏန်းများ"],
  ["Rock Crab", "ကျောက်ကဏန်း"],
  ["Cellar", "မြေအောက်ခန်း"],
  ["Max Health", "အများဆုံးကျန်းမာရေး"],
  ["Max Energy", "အများဆုံးအားအင်"],
  ["Transmute", "သတ္တုပြောင်းလဲခြင်း"],
  ["Warp", "နေရာကူးခြင်း"],
  ["warp", "နေရာကူး"],
  ["display", "ပြသ"],
  ["item", "ပစ္စည်း"],
  ["tab", "တက်ဘ်"],
]);

const englishGlossary = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.en.json"), "utf8"),
);
const burmeseGlossary = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.my.json"), "utf8"),
).my;
for (const entry of englishGlossary) {
  const sourceParts = entry.term.split(" / ");
  const targetParts = burmeseGlossary[entry.id]?.term?.split(" / ") ?? [];
  if (sourceParts.length !== targetParts.length) continue;
  sourceParts.forEach((source, index) => {
    const target = targetParts[index];
    if (source.length >= 4 && /[A-Za-z]/.test(source) && /[\u1000-\u109F]/u.test(target)) {
      if (!replacements.has(source)) replacements.set(source, target);
    }
  });
}

const nameTargets = /^Strings\/(?:Objects|Furniture|BigCraftables|Weapons|Boots|Hats|Shirts|Pants|Tools)$/;
const furnitureNames = new Map();
for (const { document } of documents) {
  for (const change of document.Changes ?? []) {
    if (!nameTargets.test(change.Target)) continue;
    const source = sourceContent(change.Target);
    for (const [key, encoded] of Object.entries(change.Entries ?? {})) {
      const original = source[key];
      const translated = decodeBurmese(encoded, decode);
      const isName = change.Target === "Strings/Furniture" || /_Name$/.test(key);
      if (change.Target === "Strings/Furniture" && /[\u1000-\u109F]/u.test(translated)) {
        furnitureNames.set(key, translated);
      }
      if (isName && typeof original === "string" && /^[A-Za-z][A-Za-z0-9 '&().-]{2,60}$/.test(original)
          && /[\u1000-\u109F]/u.test(translated) && !translated.includes(original)) {
        replacements.set(original, translated);
      }
    }
  }
}

const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ordered = [...replacements]
  .filter(([source, target]) => source !== target)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([source, target]) => ({
    source,
    target,
    expression: new RegExp(`(?<![A-Za-z0-9_])${escaped(source)}(?![A-Za-z0-9_])`, "g"),
  }));

const protectedExpression = /https?:\/\/[^\s)]+|\{\{[^}]+\}\}|\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}|\[[^\]]+\]|\$\{[^{}]+\}\$|\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+|[A-Za-z0-9]+)|%item\b[\s\S]*?%%|%[A-Za-z][A-Za-z0-9_:]*/g;
let applied = 0;
const replacementCounts = new Map();
function replaceVisible(value) {
  const protectedValues = [];
  let result = value.replace(protectedExpression, (match) => {
    const token = `\u0001${protectedValues.length}\u0002`;
    protectedValues.push(match);
    return token;
  });
  for (const item of ordered) {
    result = result.replace(item.expression, () => {
      applied += 1;
      replacementCounts.set(item.source, (replacementCounts.get(item.source) ?? 0) + 1);
      return item.target;
    });
  }
  return result.replace(/\u0001(\d+)\u0002/g, (_, index) => protectedValues[Number(index)]);
}

function isEventScript(target, value) {
  if (target.startsWith("Data/Events/")) return true;
  if (!target.startsWith("Data/Festivals/") && target !== "Strings/1_6_Strings"
      && target !== "Strings/Locations") return false;
  return /(?:^|\/)(?:speak|message|question|quickQuestion|textAboveHead|spriteText|end dialogue)(?: |\/|$)/.test(value);
}

function replaceQuoted(value) {
  return value.replace(/"(?:\\.|[^"\\])*"/g, (quoted) => {
    const decoded = JSON.parse(quoted);
    return JSON.stringify(replaceVisible(decoded));
  });
}

const structuredTargets = /^Data\/(?:Achievements|AquariumFish|Boots|Bundles|ChairTiles|CookingRecipes|CraftingRecipes|Fish|Furniture|HairData|Monsters|NPCGiftTastes|PaintData|Quests|SecretNotes|TV\/CookingChannel|TV\/TipChannel|animationDescriptions|hats)$/;
for (const { fullPath, document } of documents) {
  for (const change of document.Changes ?? []) {
    for (const [key, encoded] of Object.entries(change.Entries ?? {})) {
      let value = decodeBurmese(encoded, decode);
      if (value === sourceContent(change.Target)[key]) continue;
      if (isEventScript(change.Target, value)) {
        continue;
      } else if (structuredTargets.test(change.Target)) {
        const sourceValue = sourceContent(change.Target)[key];
        const furnitureKey = change.Target === "Data/Furniture"
          ? sourceValue.match(/\[LocalizedText Strings\\Furniture:([^\]]+)\]/)?.[1]
          : null;
        value = value.split("/").map((field, index) => {
          if (index === 0 && furnitureKey && furnitureNames.has(furnitureKey)) {
            return furnitureNames.get(furnitureKey);
          }
          if (/[\u1000-\u109F]/u.test(field)) return replaceVisible(field);
          const exact = change.Target.startsWith("Data/TV/") ? replacements.get(field) : null;
          return exact ?? field;
        }).join("/");
      } else {
        value = replaceVisible(value);
      }
      change.Entries[key] = encodeBurmese(value, encode);
    }
  }
  fs.writeFileSync(fullPath, `${JSON.stringify(document, null, 2)}\n`);
}

console.log(JSON.stringify({
  replacementTerms: ordered.length,
  applied,
  topReplacements: [...replacementCounts].sort((a, b) => b[1] - a[1]).slice(0, 50),
}, null, 2));
