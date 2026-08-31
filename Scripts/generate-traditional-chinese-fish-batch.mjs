#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const english = JSON.parse(fs.readFileSync(
  "/Users/antonkrutov/Developer/data/stardew-english-unpacked/Data/Fish.json",
  "utf8",
)).content;
const patchFile = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/traditional-chinese/fish.json",
);
const patch = JSON.parse(fs.readFileSync(patchFile, "utf8"));
const names = new Map(Object.entries({
  Pufferfish: "河豚",
  Anchovy: "鯷魚",
  Tuna: "鮪魚",
  Sardine: "沙丁魚",
  Bream: "鯿魚",
  "Largemouth Bass": "大口黑鱸",
  "Smallmouth Bass": "小口黑鱸",
  "Rainbow Trout": "虹鱒",
  Salmon: "鮭魚",
  Walleye: "大眼魚",
  Perch: "河鱸",
  Carp: "鯉魚",
  Catfish: "鯰魚",
  Pike: "狗魚",
  Sunfish: "太陽魚",
  "Red Mullet": "紅鯔魚",
  Herring: "鯡魚",
  Eel: "鰻魚",
  Octopus: "章魚",
  "Red Snapper": "紅鯛",
  Squid: "烏賊",
  Seaweed: "海藻",
  "Green Algae": "綠藻",
  "Sea Cucumber": "海參",
  "Super Cucumber": "超級海參",
  Ghostfish: "幽靈魚",
  "White Algae": "白藻",
  Stonefish: "石魚",
  Crimsonfish: "緋紅魚",
  Angler: "鮟鱇魚",
  "Ice Pip": "冰刺魚",
  "Lava Eel": "岩漿鰻魚",
  Legend: "傳說之魚",
  Sandfish: "沙魚",
  "Scorpion Carp": "蠍鯉",
  Flounder: "比目魚",
  "Midnight Carp": "午夜鯉魚",
  Clam: "蛤蜊",
  "Mutant Carp": "變種鯉魚",
  Sturgeon: "鱘魚",
  "Tiger Trout": "虎紋鱒魚",
  Bullhead: "大頭魚",
  Tilapia: "吳郭魚",
  Chub: "鰷魚",
  Dorado: "黃金鯛",
  Albacore: "長鰭鮪魚",
  Shad: "西鯡",
  Lingcod: "蛇鱈",
  Halibut: "大比目魚",
  Lobster: "龍蝦",
  Crayfish: "淡水螯蝦",
  Crab: "螃蟹",
  Cockle: "鳥蛤",
  Mussel: "淡菜",
  Shrimp: "蝦",
  Snail: "蝸牛",
  Periwinkle: "濱螺",
  Oyster: "牡蠣",
  Woodskip: "木躍魚",
  Glacierfish: "冰川魚",
  "Void Salmon": "虛空鮭魚",
  Slimejack: "史萊姆魚",
  "Midnight Squid": "午夜烏賊",
  "Spook Fish": "幽魂魚",
  Blobfish: "水滴魚",
  Stingray: "魟魚",
  Lionfish: "獅子魚",
  "Blue Discus": "藍七彩神仙魚",
  "Son of Crimsonfish": "緋紅魚之子",
  "Ms. Angler": "鮟鱇女士",
  "Legend II": "傳說之魚二代",
  "Radioactive Carp": "放射性鯉魚",
  "Glacierfish Jr.": "小冰川魚",
  Goby: "蝦虎魚",
}));

const records = [];
for (const change of patch.Changes ?? []) {
  for (const key of Object.keys(change.Entries ?? {})) {
    const source = english[key];
    const fields = source.split("/");
    const translation = names.get(fields[0]);
    if (!translation) throw new Error(`Missing fish name translation: ${fields[0]}`);
    fields[0] = translation;
    records.push({ target: "Data/Fish", key, source, translation: fields.join("/") });
  }
}
if (records.length !== 74 || names.size !== 74) {
  throw new Error(`Expected 74 fish records and names, got ${records.length} and ${names.size}`);
}
const output = { id: "0007-fish-data", kind: "short", records };
fs.writeFileSync(
  path.join(projectRoot, "Documentation/traditional-chinese-batches/0007-fish-data.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify({ records: records.length }, null, 2));
