#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const unpacked = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!unpacked) throw new Error("Usage: verify-bulgarian-fonts.mjs <unpacked-font-dir>");

const translations = path.join(root,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/bulgarian");
const required = new Set("АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯабвгдежзийклмнопрстуфхцчшщъьюяЍѝ");

function collect(value) {
  if (typeof value === "string") {
    for (const character of value.normalize("NFC")) if (!/\s/u.test(character)) required.add(character);
  } else if (Array.isArray(value)) {
    for (const item of value) collect(item);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collect(item);
  }
}

for (const name of fs.readdirSync(translations).filter(name => name.endsWith(".json"))) {
  const document = JSON.parse(fs.readFileSync(path.join(translations, name), "utf8"));
  for (const change of document.Changes ?? []) {
    collect(change.Entries ?? {});
    collect(change.Fields ?? {});
  }
}

for (const name of ["SpriteFont1", "SmallFont"]) {
  const document = JSON.parse(fs.readFileSync(path.join(unpacked, `${name}.json`), "utf8"));
  const { characterMap, glyphs, cropping, kerning } = document.content ?? {};
  if (![characterMap, glyphs, cropping, kerning].every(Array.isArray))
    throw new Error(`${name} lacks parallel SpriteFont metadata lists`);
  if (new Set([characterMap.length, glyphs.length, cropping.length, kerning.length]).size !== 1)
    throw new Error(`${name} SpriteFont metadata lists are not aligned`);
  for (let index = 1; index < characterMap.length; index += 1) {
    if (characterMap[index - 1].codePointAt(0) >= characterMap[index].codePointAt(0))
      throw new Error(`${name} characterMap is not strictly sorted at index ${index}`);
  }
  const available = new Set(characterMap);
  const missing = [...required].filter(character => !available.has(character));
  if (missing.length) throw new Error(`${name} misses required glyphs: ${missing.join("")}`);
  if (!fs.existsSync(path.join(unpacked, `${name}.png`)))
    throw new Error(`${name} round-trip texture is missing`);
  console.log(`${name}: ${characterMap.length} sorted glyphs; all ${required.size} translation characters present`);
}
