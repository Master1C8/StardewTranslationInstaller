#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const english = JSON.parse(fs.readFileSync(
  "/Users/antonkrutov/Developer/data/stardew-english-unpacked/Strings/Weapons.json",
  "utf8",
)).content;
const translations = {
  IronDirk: ["鐵短劍", "一把普通的匕首。"],
  IronEdge: ["鐵刃", "沉重的闊劍。"],
  Kudgel: ["重棍", "蠻力之徒的好夥伴。"],
  LavaKatana: ["熔岩武士刀", "在翻騰熔岩中鍛造的強大刀刃。"],
  LeadRod: ["鉛棒", "重得難以置信。"],
  LeahsWhittler: ["莉亞的雕刀", "莉亞塑造漂流木時最愛用的工具。"],
  MarusWrench: ["瑪魯的扳手", "一把大型金屬扳手，帶著瑪魯的氣味。"],
  MasterSlingshot: ["大師彈弓", "需要石頭作為彈藥。"],
  Meowmere: ["喵之刃", "來自遙遠國度的奇特武器……"],
  NeptunesGlaive: ["海王星長刀", "來自寶石海彼岸的傳家寶。"],
  ObsidianEdge: ["黑曜石之刃", "鋒利得難以置信。"],
  OssifiedBlade: ["骨化之刃", "由骨頭形成的大型銳利刀刃。"],
  PennysFryer: ["潘妮的平底鍋", "潘妮最愛的平底鍋，內側黏著一些橡膠般的污垢。"],
  PiratesSword: ["海盜劍", "看起來以前曾屬於某個海盜。"],
  Rapier: ["細劍", "優雅的劍刃。"],
  RustySword: ["生鏽的劍", "生鏽又鈍化的老劍。"],
  SamsOldGuitar: ["山姆的舊吉他", "它也曾有過風光的日子。"],
  Scythe: ["鐮刀", "若已建造筒倉，就能將青草割成乾草。"],
  SebsLostMace: ["賽巴斯汀遺失的釘頭錘", "賽巴斯汀收藏的中世紀複製品之一。"],
  ShadowDagger: ["暗影匕首", "把刀刃靠近耳邊，就能聽見一千個靈魂尖叫。"],
  SilverSaber: ["銀軍刀", "表面鍍銀以防生鏽。"],
  Slingshot: ["彈弓", "需要石頭作為彈藥。"],
  SteelFalchion: ["鋼製彎刃劍", "輕巧而強大。"],
  SteelSmallsword: ["鋼製小劍", "標準的金屬刀刃。"],
  TemperedBroadsword: ["淬火闊劍", "看起來足以承受任何衝擊。"],
  TemplarsBlade: ["聖殿騎士之刃", "曾屬於一位高尚的騎士。"],
  TheSlammer: ["重擊槌", "重得驚人的大槌，能把敵人轟飛。"],
  WickedKris: ["邪惡波形劍", "刀刃由銥合金製成。"],
  WindSpire: ["風之尖塔", "迅捷的小型刀刃。"],
  WoodClub: ["木棍棒", "一塊實心木頭，粗略鑿成棍棒形狀。"],
  WoodenBlade: ["木刃", "以雕刻木頭來說，還算不錯。"],
  WoodMallet: ["木槌", "實心槌頭威力十足，作為棍棒算是相對輕巧。"],
  YetiTooth: ["雪人之牙", "摸起來冰冷刺骨。"],
};

const records = [];
for (const [base, [name, description]] of Object.entries(translations)) {
  for (const [suffix, translation] of [["Name", name], ["Description", description]]) {
    const key = `${base}_${suffix}`;
    const source = english[key];
    if (typeof source !== "string") throw new Error(`Missing English weapon string: ${key}`);
    records.push({ target: "Strings/Weapons", key, source, translation });
  }
}
if (records.length !== 66) throw new Error(`Expected 66 weapon records, got ${records.length}`);
const output = { id: "0013-weapons-02", kind: "short", records };
fs.writeFileSync(
  path.join(projectRoot, "Documentation/traditional-chinese-batches/0013-weapons-02.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify({ records: records.length }, null, 2));
