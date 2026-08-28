#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const apply = process.argv.includes("--apply");
const sourceRoot = process.argv.find((arg, index) => index > 1 && !arg.startsWith("--"))
  ?? "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian/monsters-01.json");
const sourceFile = path.join(sourceRoot, "Data/Monsters.json");

const names = new Map(Object.entries({
  "Green Slime": "Slime Hijau",
  "Dust Sprite": "Roh Debu",
  "Bat": "Kelelawar",
  "Frost Bat": "Kelelawar Beku",
  "Lava Bat": "Kelelawar Lava",
  "Iridium Bat": "Kelelawar Iridium",
  "Stone Golem": "Golem Batu",
  "Wilderness Golem": "Golem Belantara",
  "Grub": "Larva",
  "Fly": "Lalat",
  "Frost Jelly": "Jeli Beku",
  "Sludge": "Lumpur",
  "Shadow Guy": "Pria Bayangan",
  "Ghost": "Hantu",
  "Carbon Ghost": "Hantu Karbon",
  "Duggy": "Duggy",
  "Rock Crab": "Kepiting Batu",
  "Lava Crab": "Kepiting Lava",
  "Iridium Crab": "Kepiting Iridium",
  "Fireball": "Bola Api",
  "Squid Kid": "Bocah Cumi",
  "Skeleton Warrior": "Prajurit Kerangka",
  "Crow": "Gagak",
  "Frog": "Katak",
  "Cat": "Kucing",
  "Shadow Brute": "Petarung Bayangan",
  "Shadow Shaman": "Dukun Bayangan",
  "Skeleton": "Kerangka",
  "Skeleton Mage": "Penyihir Kerangka",
  "Metal Head": "Kepala Logam",
  "Spiker": "Penusuk",
  "Bug": "Serangga",
  "Mummy": "Mumi",
  "Big Slime": "Slime Besar",
  "Serpent": "Ular",
  "Pepper Rex": "Pepper Rex",
  "Tiger Slime": "Slime Harimau",
  "Lava Lurk": "Pengintai Lava",
  "Hot Head": "Kepala Panas",
  "Magma Sprite": "Roh Magma",
  "Magma Duggy": "Duggy Magma",
  "Magma Sparker": "Penyulut Magma",
  "False Magma Cap": "Tudung Magma Palsu",
  "Dwarvish Sentry": "Penjaga Kurcaci",
  "Putrid Ghost": "Hantu Busuk",
  "Shadow Sniper": "Penembak Bayangan",
  "Spider": "Laba-Laba",
  "Royal Serpent": "Ular Kerajaan",
  "Blue Squid": "Cumi Biru"
}));

const document = JSON.parse(fs.readFileSync(file, "utf8"));
const source = JSON.parse(fs.readFileSync(sourceFile, "utf8")).content;
const change = document.Changes?.find((item) => item.Target === "Data/Monsters");
if (!change?.Entries) throw new Error(`Missing Data/Monsters entries in ${file}`);

let changed = 0;
const missing = [];
for (const [key, englishRecord] of Object.entries(source)) {
  if (!(key in change.Entries)) continue;
  const slash = englishRecord.lastIndexOf("/");
  if (slash < 0) throw new Error(`Unexpected Data/Monsters record ${key}`);
  const technicalPrefix = englishRecord.slice(0, slash + 1);
  const englishName = englishRecord.slice(slash + 1);
  const localizedName = names.get(englishName);
  if (!localizedName) {
    missing.push(`${key}: ${englishName}`);
    continue;
  }
  const expected = technicalPrefix + localizedName;
  if (change.Entries[key] !== expected) {
    const currentSlash = change.Entries[key]?.lastIndexOf("/");
    if (currentSlash < 0 || change.Entries[key].slice(0, currentSlash + 1) !== technicalPrefix) {
      throw new Error(`Technical Data/Monsters fields diverged for ${key}`);
    }
    change.Entries[key] = expected;
    changed += 1;
  }
}
if (missing.length) throw new Error(`Missing Indonesian monster names:\n${missing.join("\n")}`);
if (apply && changed) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", changed, mapped: Object.keys(change.Entries).length }, null, 2));
