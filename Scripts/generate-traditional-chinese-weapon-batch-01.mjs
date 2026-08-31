#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const english = JSON.parse(fs.readFileSync(
  "/Users/antonkrutov/Developer/data/stardew-english-unpacked/Strings/Weapons.json",
  "utf8",
)).content;
const translations = {
  AbbysPlanchette: ["阿比的靈應盤", "以精緻的大理石木製成。"],
  AlexsBat: ["亞歷克斯的球棒", "亞歷克斯那記著名全壘打，在甜蜜點上留下了凹痕。"],
  BoneSword: ["骨劍", "一塊磨利的骨頭，非常輕巧。"],
  BrokenTrident: ["斷裂三叉戟", "來自大海，但依然鋒利。"],
  BurglarsShank: ["強盜短刀", "迅捷無聲者偏愛的武器。"],
  CarvingKnife: ["雕刻刀", "小巧輕盈的刀刃。"],
  Claymore: ["雙手大劍", "真的非常沉重。"],
  CrystalDagger: ["水晶匕首", "刀刃由純化石英製成。"],
  Cutlass: ["彎刀", "工藝精良的刀刃。"],
  DarkSword: ["黑暗劍", "散發著吸血鬼能量的光芒。"],
  DragontoothClub: ["龍牙棍棒", "以一顆魔法牙齒打造的棍棒。"],
  DragontoothCutlass: ["龍牙彎刀", "刀刃由魔法牙齒鍛造而成。"],
  DragontoothShiv: ["龍牙尖刀", "刀刃由魔法牙齒鍛造而成。"],
  DwarfDagger: ["矮人匕首", "雖然古老，刀刃卻永不鈍化。"],
  DwarfHammer: ["矮人錘", "發出極其微弱的嗡鳴聲。"],
  DwarfSword: ["矮人劍", "雖然古老，刀刃卻永不鈍化。"],
  ElfBlade: ["精靈之刃", "只有精靈靈巧的雙手才能打造它。"],
  ElliottsPencil: ["艾略特的鉛筆", "艾略特用它寫完了自己的書。很尖銳！"],
  Femur: ["股骨", "一根古老沉重的骨頭，覆滿數百年的污垢。"],
  ForestSword: ["森林劍", "森林魔法賦予了它強大力量。"],
  GalaxyDagger: ["銀河匕首", "與你見過的任何東西都不同。"],
  GalaxyHammer: ["銀河錘", "由你從未見過的超輕材料製成。"],
  GalaxySlingshot: ["銀河彈弓", "看起來威力十足。"],
  GalaxySword: ["銀河劍", "與你見過的任何東西都不同。"],
  GoldenScythe: ["金色鐮刀", "比普通鐮刀更強大。"],
  HaleysIron: ["海莉的熨斗", "燙得灼人，還帶著海莉頭髮的氣味。"],
  HarveysMallet: ["哈維的木槌", "讓人想起哈維診所的回憶。"],
  HolyBlade: ["聖刃", "握在手中令人充滿希望。"],
  InfinityBlade: ["無限之刃", "銀河劍的真正形態。"],
  InfinityDagger: ["無限匕首", "銀河匕首的真正形態。"],
  InfinityGavel: ["無限槌", "銀河錘的真正形態。"],
  InsectHead: ["昆蟲頭", "拿在手裡的感覺不太舒服。"],
  IridiumNeedle: ["銥針", "尖端鋒利得難以置信，甚至精細到原子層級。"],
  IridiumScythe: ["銥鐮刀", "可用來收割任何作物，收集乾草也格外好用。"],
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
if (records.length !== 68) throw new Error(`Expected 68 weapon records, got ${records.length}`);
const output = { id: "0012-weapons-01", kind: "short", records };
fs.writeFileSync(
  path.join(projectRoot, "Documentation/traditional-chinese-batches/0012-weapons-01.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify({ records: records.length }, null, 2));
