#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const bundles = JSON.parse(fs.readFileSync(path.join(englishRoot, "Data/Bundles.json"), "utf8")).content;
const locations = JSON.parse(fs.readFileSync(path.join(englishRoot, "Strings/Locations.json"), "utf8")).content;
const bundleNames = new Map(Object.entries({
  "Spring Crops": "春季作物",
  "Summer Crops": "夏季作物",
  "Fall Crops": "秋季作物",
  "Quality Crops": "優質作物",
  Animal: "動物產品",
  Artisan: "工匠產品",
  "Spring Foraging": "春季採集",
  "Summer Foraging": "夏季採集",
  "Fall Foraging": "秋季採集",
  "Winter Foraging": "冬季採集",
  Construction: "建築材料",
  "Exotic Foraging": "異國採集",
  "River Fish": "河魚",
  "Lake Fish": "湖魚",
  "Ocean Fish": "海魚",
  "Night Fishing": "夜間垂釣",
  "Specialty Fish": "特殊魚類",
  "Crab Pot": "蟹籠",
  "Blacksmith's": "鐵匠的",
  "Geologist's": "地質學家的",
  "Adventurer's": "冒險家的",
  "Chef's": "廚師的",
  "Field Research": "田野調查",
  "Enchanter's": "附魔師的",
  Dye: "染料",
  Fodder: "飼料",
  "The Missing": "遺失的",
}));

const records = [];
for (const [key, source] of Object.entries(bundles)) {
  const fields = source.split("/");
  const translation = bundleNames.get(fields[0]);
  if (!translation) {
    if (!/^\d{1,2},\d{3}g$/.test(fields[0])) throw new Error(`Missing bundle name: ${fields[0]}`);
    records.push({ target: "Data/Bundles", key, source, reviewedPreserve: true });
    continue;
  }
  fields[0] = translation;
  fields[fields.length - 1] = translation;
  records.push({ target: "Data/Bundles", key, source, translation: fields.join("/") });
}

const locationTranslations = {
  AdventureGuild_KillList_Slimes: "史萊姆",
  AdventureGuild_KillList_VoidSpirits: "虛空精靈",
  AdventureGuild_KillList_Bats: "蝙蝠",
  AdventureGuild_KillList_Skeletons: "骷髏",
  AdventureGuild_KillList_CaveInsects: "洞穴昆蟲",
  AdventureGuild_KillList_Duggies: "掘地蟲",
};
for (const key of [
  "AdventureGuild_KillList_LineFormat",
  "AdventureGuild_KillList_LineFormat_None",
  "AdventureGuild_KillList_LineFormat_OverTarget",
]) {
  records.push({ target: "Strings/Locations", key, source: locations[key], reviewedPreserve: true });
}
for (const [key, translation] of Object.entries(locationTranslations)) {
  records.push({ target: "Strings/Locations", key, source: locations[key], translation });
}

if (records.length !== 40) throw new Error(`Expected 40 records, got ${records.length}`);
const output = { id: "0018-bundles-and-monster-goals", kind: "short", records };
fs.writeFileSync(
  path.join(projectRoot, "Documentation/traditional-chinese-batches/0018-bundles-and-monster-goals.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify({ records: records.length }, null, 2));
