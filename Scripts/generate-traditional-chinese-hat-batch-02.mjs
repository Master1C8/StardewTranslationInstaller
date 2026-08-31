#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const english = JSON.parse(fs.readFileSync(
  "/Users/antonkrutov/Developer/data/stardew-english-unpacked/Data/hats.json",
  "utf8",
)).content;
const translations = {
  "60": ["秘法帽", "法師所戴的那種牛仔帽。"],
  "61": ["主廚帽", "主廚所戴的傳統帽子。"],
  "62": ["海盜帽", "正面有一顆駭人骷髏的船長帽。"],
  "63": ["平頂帽", "曾被視為非常時髦的老式帽子。"],
  "64": ["優雅頭巾", "以精緻黑絲綢製成，飾有金邊的頭巾。"],
  "65": ["白色頭巾", "以精緻白絲綢製成，飾有藍邊的頭巾。"],
  "66": ["垃圾帽", "由垃圾桶蓋「升級再造」成的帽子……"],
  "67": ["黃金面具", "忠實重現卡利科沙漠的古代遺物！"],
  "68": ["螺旋槳帽", "頂端裝著螺旋槳的傻氣帽子。"],
  "69": ["新娘頭紗", "新娘的傳統頭飾。"],
  "70": ["女巫帽", "深受女巫喜愛的尖帽子。"],
  "71": ["銅淘盤", "你把銅淘盤戴在頭上……"],
  "72": ["綠色頭巾", "綠色絲綢頭巾，正面飾有黃金裝飾。"],
  "73": ["魔法牛仔帽", "閃耀著五彩能量"],
  "74": ["魔法頭巾", "閃耀著五彩能量"],
  "75": ["黃金頭盔", "它是半顆金色椰子。"],
  "76": ["豪華海盜帽", "只有最惡名昭彰的海盜才能駕馭這副造型。"],
  "77": ["粉紅蝴蝶結", "這個巨大的蝴蝶結格外引人注目！"],
  "78": ["青蛙帽", "住在你腦袋上的黏滑朋友。"],
  "79": ["小帽", "空氣動力學更佳的帽款。"],
  "80": ["藍鳥面具", "戴上它，就能像你最喜愛的島嶼商人一樣。"],
  "81": ["豪華牛仔帽", "造型更為誇張的牛仔帽。"],
  "82": ["齊先生的帽子", "齊先生招牌帽子的複製品。"],
  "83": ["黑色牛仔帽", "時髦黑色的牛仔帽。"],
  "84": ["放射性護目鏡", "實際上完全無法防護輻射。"],
  "85": ["劍客帽", "經典的俠客造型。"],
  "86": ["齊面具", "???"],
  "87": ["星星頭盔", "帶有星星圖案的紅帽子。"],
  "88": ["太陽眼鏡", "讓你看起來輕鬆自在。"],
  "89": ["護目鏡", "讓你看起來安全感十足。"],
  "90": ["採集者帽", "採集者的最愛。"],
  "91": ["老虎帽", "讓你看起來像一隻美麗的老虎。"],
  "93": ["戰士頭盔", "將鴕鳥蛋殼改造成的頭盔。"],
  AbigailsBow: ["阿比蓋爾的蝴蝶結", "跟小阿比的那個一模一樣。"],
  TricornHat: ["三角帽", "海軍軍官的傳統帽子。"],
  JojaCap: ["Joja 帽", "Joja 官方帽款，以100%聚酯纖維製成。"],
  LaurelWreathCrown: ["月桂冠", "由樹葉花環塑成的美麗冠冕。"],
  GilsHat: ["吉爾的帽子", "跟吉爾戴的帽子一模一樣。"],
  BlueBow: ["藍色蝴蝶結", "這個巨大的蝴蝶結格外引人注目！"],
  DarkVelvetBow: ["深色天鵝絨蝴蝶結", "以深色天鵝絨製成，寬大而柔垂的蝴蝶結。"],
  MummyMask: ["木乃伊面具", "巨大的木乃伊面具……嚇死人了！"],
  BucketHat: ["漁夫帽", "帽簷短小的簡約帽子。"],
  SquidHat: ["烏賊帽", "把烏賊戴在頭上的機會來了。"],
  SportsCap: ["運動帽", "帽子上有復古球隊標誌。"],
  RedFez: ["紅色土耳其氈帽", "由著名商人豬帶起風潮的獨特帽子。"],
  RaccoonHat: ["浣熊帽", "昔日邊疆時代的經典帽款。"],
  SteelPanHat: ["鋼淘盤", "你把鋼淘盤戴在頭上……"],
  GoldPanHat: ["金淘盤", "你把金淘盤戴在頭上……"],
  IridiumPanHat: ["銥淘盤", "你把銥淘盤戴在頭上……"],
  MysteryHat: ["神祕帽", "以神祕箱的剩餘材料製成。"],
  DarkBallcap: ["深色棒球帽", "完美貼合你的頭型。"],
  LeprechuanHat: ["矮妖帽", "前任主人以矮妖來說，頭一定很大。"],
  JunimoHat: ["祝尼魔帽", "向我們的小夥伴致敬……"],
  PaperHat: ["紙帽", "以特殊紙張製成，遇雨也不會分解。"],
  PageboyCap: ["報童帽", "不知為何，它讓你想去賣報紙。"],
  JesterHat: ["弄臣帽", "把你內心的小丑展現出來。"],
  BlueRibbon: ["藍絲帶", "繫在腦後的可愛絲帶。"],
  GovernorsHat: ["州長的帽子", "州長招牌帽子的複製品。"],
  WhiteBow: ["白色蝴蝶結", "如白雪般潔白的蝴蝶結。"],
  SpaceHelmet: ["太空頭盔", "警告：這頂頭盔其實從未在外太空測試過。"],
  InfinityCrown: ["無限王冠", "以你從未見過的異國金屬製成。"],
};

const records = [];
for (const [key, [name, description]] of Object.entries(translations)) {
  const source = english[key];
  const fields = source.split("/");
  fields[0] = name;
  fields[1] = description;
  fields[5] = name;
  records.push({ target: "Data/hats", key, source, translation: fields.join("/") });
}
records.push({ target: "Data/hats", key: "92", source: english["92"], reviewedPreserve: true });
if (records.length !== 62) throw new Error(`Expected 62 hat records, got ${records.length}`);
const output = { id: "0011-hats-02", kind: "short", records };
fs.writeFileSync(
  path.join(projectRoot, "Documentation/traditional-chinese-batches/0011-hats-02.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify({ records: records.length }, null, 2));
