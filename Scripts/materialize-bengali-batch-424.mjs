import fs from "node:fs";
import path from "node:path";
import { materializeDirectMultiTargetBatch } from "./lib/materialize-bengali-direct-batch.mjs";

const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const cache = new Map();
function source(target, key) {
  if (!cache.has(target)) cache.set(target, JSON.parse(fs.readFileSync(path.join(englishRoot, `${target}.json`), "utf8")).content);
  return cache.get(target)[key];
}
const entries = [];
function preserve(target, keys, reason) {
  for (const key of keys) entries.push({ target, key, translation: source(target, key), reason });
}

preserve("Strings/credits", ["4", "7", "15", "19", "22", "26", "48", "51", "54", "58", "61", "65", "68", "74", "76"], "এটি ক্রেডিট দৃশ্যের ইচ্ছাকৃত খালি ব্যবধান; দৃশ্যমান অনুবাদযোগ্য লেখা নেই, তাই খালি রাখা হয়েছে।");
preserve("Data/NPCGiftTastes", ["Universal_Love", "Universal_Like", "Universal_Hate"], "এটি সর্বজনীন উপহার-পছন্দ নির্ধারণের অভ্যন্তরীণ সংখ্যাসূচক আইডি-তালিকা; খেলোয়াড়ের জন্য দৃশ্যমান লেখা নয়, তাই হুবহু রাখা হয়েছে।");

const festivalSetupReason = "এটি উৎসবের মানচিত্র, অভিনেতা, চলন, অ্যানিমেশন ও কাটসিন নিয়ন্ত্রণের অভ্যন্তরীণ কমান্ড-ধারা; অনুবাদ করলে রানটাইম ভেঙে যাবে, তাই হুবহু রাখা হয়েছে।";
preserve("Data/Festivals/fall16", ["conditions", "set-up", "set-up_y2"], festivalSetupReason);
preserve("Data/Festivals/fall27", ["conditions", "set-up", "shop_y2", "set-up_y2"], festivalSetupReason);
preserve("Data/Festivals/fall27", ["Pierre"], "এটি পিয়েরের অজানা প্রতিক্রিয়ার ভাষা-নিরপেক্ষ প্রশ্নচিহ্ন; কোনো অনুবাদযোগ্য শব্দ নেই, তাই হুবহু রাখা হয়েছে।");
preserve("Data/Festivals/spring13", ["conditions", "set-up", "set-up_y2"], festivalSetupReason);
preserve("Data/Festivals/spring24", ["conditions", "set-up", "set-up_y2"], festivalSetupReason);
preserve("Data/Festivals/summer11", ["conditions", "set-up", "set-up_y2"], festivalSetupReason);
preserve("Data/Festivals/summer28", ["conditions", "set-up", "set-up_y2"], festivalSetupReason);
preserve("Data/Festivals/winter25", ["conditions", "set-up", "secretSanta", "set-up_y2", "secretSanta_y2"], festivalSetupReason);
preserve("Data/Festivals/winter8", ["conditions", "set-up", "set-up_y2"], festivalSetupReason);

materializeDirectMultiTargetBatch({ root: process.cwd(), id: "424-remaining-technical-data-preserves", kind: "short", entries });
