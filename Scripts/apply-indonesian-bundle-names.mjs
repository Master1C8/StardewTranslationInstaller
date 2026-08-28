#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const apply = process.argv.includes("--apply");
const sourceRoot = process.argv.find((arg, index) => index > 1 && !arg.startsWith("--"))
  ?? "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian/bundles.json");
const sourceFile = path.join(sourceRoot, "Data/Bundles.json");
const names = new Map(Object.entries({
  "Spring Crops": "Tanaman Musim Semi",
  "Summer Crops": "Tanaman Musim Panas",
  "Fall Crops": "Tanaman Musim Gugur",
  "Quality Crops": "Tanaman Berkualitas",
  "Animal": "Hewan",
  "Artisan": "Perajin",
  "Spring Foraging": "Ramuan Musim Semi",
  "Summer Foraging": "Ramuan Musim Panas",
  "Fall Foraging": "Ramuan Musim Gugur",
  "Winter Foraging": "Ramuan Musim Dingin",
  "Construction": "Konstruksi",
  "Exotic Foraging": "Ramuan Eksotis",
  "River Fish": "Ikan Sungai",
  "Lake Fish": "Ikan Danau",
  "Ocean Fish": "Ikan Laut",
  "Night Fishing": "Memancing Malam",
  "Specialty Fish": "Ikan Khusus",
  "Crab Pot": "Perangkap Kepiting",
  "Blacksmith's": "Pandai Besi",
  "Geologist's": "Ahli Geologi",
  "Adventurer's": "Petualang",
  "2,500g": "2,500g",
  "5,000g": "5,000g",
  "10,000g": "10,000g",
  "25,000g": "25,000g",
  "Chef's": "Koki",
  "Field Research": "Penelitian Lapangan",
  "Enchanter's": "Pemberi Pesona",
  "Dye": "Pewarna",
  "Fodder": "Pakan",
  "The Missing": "Yang Hilang"
}));

const document = JSON.parse(fs.readFileSync(file, "utf8"));
const source = JSON.parse(fs.readFileSync(sourceFile, "utf8")).content;
const change = document.Changes?.find((item) => item.Target === "Data/Bundles");
if (!change?.Entries) throw new Error(`Missing Data/Bundles entries in ${file}`);

let changed = 0;
const missing = [];
for (const [key, englishRecord] of Object.entries(source)) {
  if (!(key in change.Entries)) continue;
  const first = englishRecord.indexOf("/");
  const last = englishRecord.lastIndexOf("/");
  if (first < 1 || last <= first) throw new Error(`Unexpected Data/Bundles record ${key}`);
  const englishFirst = englishRecord.slice(0, first);
  const englishLast = englishRecord.slice(last + 1);
  if (englishFirst !== englishLast) throw new Error(`Bundle display names differ for ${key}`);
  const localized = names.get(englishFirst);
  if (!localized) {
    missing.push(`${key}: ${englishFirst}`);
    continue;
  }
  const technicalMiddle = englishRecord.slice(first, last + 1);
  const expected = localized + technicalMiddle + localized;
  if (change.Entries[key] !== expected) {
    const currentFirst = change.Entries[key]?.indexOf("/");
    const currentLast = change.Entries[key]?.lastIndexOf("/");
    if (currentFirst < 1 || currentLast <= currentFirst || change.Entries[key].slice(currentFirst, currentLast + 1) !== technicalMiddle) {
      throw new Error(`Technical Data/Bundles fields diverged for ${key}`);
    }
    change.Entries[key] = expected;
    changed += 1;
  }
}
if (missing.length) throw new Error(`Missing Indonesian bundle names:\n${missing.join("\n")}`);
if (apply && changed) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", changed, mapped: Object.keys(change.Entries).length }, null, 2));
