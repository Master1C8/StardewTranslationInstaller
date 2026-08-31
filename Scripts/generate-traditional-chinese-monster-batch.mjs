#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const english = JSON.parse(fs.readFileSync(
  "/Users/antonkrutov/Developer/data/stardew-english-unpacked/Data/Monsters.json",
  "utf8",
)).content;
const patch = JSON.parse(fs.readFileSync(path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/traditional-chinese/monsters-01.json",
), "utf8"));
const names = new Map(Object.entries({
  "Green Slime": "綠色史萊姆",
  "Dust Sprite": "灰塵精靈",
  Bat: "蝙蝠",
  "Frost Bat": "冰霜蝙蝠",
  "Lava Bat": "熔岩蝙蝠",
  "Iridium Bat": "銥蝙蝠",
  "Stone Golem": "石魔像",
  "Wilderness Golem": "荒野魔像",
  Grub: "蛆",
  Fly: "蒼蠅",
  "Frost Jelly": "冰霜史萊姆",
  Sludge: "污泥怪",
  "Shadow Guy": "暗影人",
  Ghost: "幽靈",
  "Carbon Ghost": "碳化幽靈",
  Duggy: "掘地蟲",
  "Rock Crab": "岩石蟹",
  "Lava Crab": "熔岩蟹",
  "Iridium Crab": "銥蟹",
  Fireball: "火球",
  "Squid Kid": "烏賊小子",
  "Skeleton Warrior": "骷髏戰士",
  Crow: "烏鴉",
  Frog: "青蛙",
  Cat: "貓",
  "Shadow Brute": "暗影蠻兵",
  "Shadow Shaman": "暗影薩滿",
  Skeleton: "骷髏",
  "Skeleton Mage": "骷髏法師",
  "Metal Head": "金屬頭",
  Spiker: "尖刺怪",
  Bug: "蟲",
  Mummy: "木乃伊",
  "Big Slime": "大史萊姆",
  Serpent: "飛蛇",
  "Pepper Rex": "辣椒霸王龍",
  "Tiger Slime": "虎紋史萊姆",
  "Lava Lurk": "熔岩潛伏者",
  "Hot Head": "熱頭怪",
  "Magma Sprite": "岩漿精靈",
  "Magma Duggy": "岩漿掘地蟲",
  "Magma Sparker": "岩漿火花怪",
  "False Magma Cap": "偽岩漿菇",
  "Dwarvish Sentry": "矮人哨兵",
  "Putrid Ghost": "腐臭幽靈",
  "Shadow Sniper": "暗影狙擊手",
  Spider: "蜘蛛",
  "Royal Serpent": "皇家飛蛇",
  "Blue Squid": "藍色烏賊",
}));

const records = [];
const usedNames = new Set();
for (const change of patch.Changes ?? []) {
  for (const key of Object.keys(change.Entries ?? {})) {
    const source = english[key];
    const fields = source.split("/");
    const englishName = fields.at(-1);
    const translation = names.get(englishName);
    if (!translation) throw new Error(`Missing monster name translation: ${englishName}`);
    usedNames.add(englishName);
    fields[fields.length - 1] = translation;
    records.push({ target: "Data/Monsters", key, source, translation: fields.join("/") });
  }
}
if (records.length !== 51 || usedNames.size !== names.size) {
  throw new Error(`Unexpected monster coverage: ${records.length} records, ${usedNames.size}/${names.size} names`);
}
const output = { id: "0008-monster-data", kind: "short", records };
fs.writeFileSync(
  path.join(projectRoot, "Documentation/traditional-chinese-batches/0008-monster-data.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify({ records: records.length, names: usedNames.size }, null, 2));
