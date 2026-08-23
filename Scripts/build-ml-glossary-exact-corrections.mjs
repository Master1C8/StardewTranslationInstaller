#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cache = JSON.parse(fs.readFileSync(path.join(root, "ml-translation-cache.json"), "utf8")).entries;
const corrections = {
  "Strings/Locations\u0000Mines_GoUp": "ഒരു നില മുകളിലേക്ക്",
  "Strings/Locations\u0000ArchaeologyHouse_Gunther_Leave": "വിടുക",
  "Strings/Locations\u0000ScienceHouse_CarpenterMenu_UpgradeCabin": "കുടിൽ മെച്ചപ്പെടുത്തുക",
  "Strings/Objects\u0000Angler_Name": "ചൂണ്ടക്കാരൻ",
  "Strings/Objects\u0000BlueGrassStarter_Name": "നീലപ്പുല്ല് നടീൽവസ്തു",
  "Strings/1_6_Strings\u0000Leave": "വിടുക",
  "Strings/1_6_Strings\u0000Bookseller": "പുസ്തകവ്യാപാരി",
  "Strings/1_6_Strings\u0000Trinket": "ചെറുപകരണം",
  "Strings/Shirts\u0000Shirt_Name": "കുപ്പായം",
  "Strings/StringsFromCSFiles\u0000Event.cs.1656": "വിടുക",
  "Strings/StringsFromCSFiles\u0000Event.cs.1663": "വിടുക",
  "Strings/StringsFromCSFiles\u0000Farmer.cs.2020": "മൃഗപാലകൻ",
  "Strings/StringsFromCSFiles\u0000Farmer.cs.2027": "കൃഷിക്കാരൻ",
  "Strings/StringsFromCSFiles\u0000DayTimeMoneyBox.cs.10378": "നിർത്തി",
  "Strings/StringsFromCSFiles\u0000TitleMenu.cs.11739": "പിന്നോട്ട്",
  "Strings/StringsFromCSFiles\u0000Object.cs.12873": "പുരോഗതി നില",
  "Strings/StringsFromCSFiles\u0000Object.cs.12875": "അറ്റമില്ലാത്ത നില",
  "Strings/StringsFromCSFiles\u0000Tool.cs.14304": "കഠാര",
  "Strings/UI\u0000LearnedRecipe_cooking": "പാചകം",
  "Strings/UI\u0000LearnedRecipe_crafting": "നിർമാണം",
  "Strings/UI\u0000ExitToTitle": "ശീർഷകത്തിലേക്ക്",
  "Strings/UI\u0000ExitToDesktop": "ഡെസ്ക്ടോപ്പിലേക്ക്",
  "Strings/UI\u0000DisplayAdjustmentButton": "സ്ക്രീൻ വലിപ്പം ക്രമീകരിക്കുക",
  "Strings/UI\u0000mobile_options_vertical_toolbar": "ലംബ ഉപകരണപ്പട്ടി",
  "Strings/UI\u0000mobile_options_bigger_numbers": "അക്കങ്ങൾ വലുതാക്കുക",
  "Strings/UI\u0000mobile_options_auto_save": "സ്വയം സേവ്",
  "Strings/Weapons\u0000InfinityBlade_Name": "ഇൻഫിനിറ്റി ബ്ലേഡ്",
  "Strings/Weapons\u0000InfinityGavel_Name": "ഇൻഫിനിറ്റി ഗദ",
};

for (const id of Object.keys(corrections)) {
  if (!cache[id]) throw new Error(`Missing cache entry: ${id}`);
}

const outputPath = path.join(root, "ml-batches/main-glossary-exact-corrections.json");
fs.writeFileSync(outputPath, `${JSON.stringify(corrections, null, 2)}\n`);
console.log(JSON.stringify({ records: Object.keys(corrections).length, outputPath }, null, 2));
