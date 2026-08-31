#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [unpacked, translations] = process.argv.slice(2);
if (!unpacked || !translations) {
  console.error("Usage: node Scripts/verify-traditional-chinese-fonts.mjs <unpacked-font-dir> <translations-dir>");
  process.exit(2);
}

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? listJSONFiles(file) : entry.name.endsWith(".json") ? [file] : [];
  });
}

const required = new Set();
function collect(value) {
  if (typeof value === "string") {
    for (const character of value.normalize("NFC")) {
      if (!/\s/u.test(character)) required.add(character);
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collect(item);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collect(item);
  }
}
for (const file of listJSONFiles(translations)) collect(JSON.parse(fs.readFileSync(file, "utf8")));
for (let value = 0x0410; value <= 0x044f; value += 1) required.add(String.fromCodePoint(value));
required.add("Ё");
required.add("ё");

for (const name of ["SpriteFont1", "SmallFont"]) {
  const document = JSON.parse(fs.readFileSync(path.join(unpacked, `${name}.json`), "utf8"));
  const { characterMap, glyphs, cropping, kerning } = document.content ?? {};
  if (![characterMap, glyphs, cropping, kerning].every(Array.isArray)) {
    throw new Error(`${name} lacks parallel SpriteFont metadata lists`);
  }
  if (new Set([characterMap.length, glyphs.length, cropping.length, kerning.length]).size !== 1) {
    throw new Error(`${name} SpriteFont metadata lists are not aligned`);
  }
  for (let index = 1; index < characterMap.length; index += 1) {
    if (characterMap[index - 1].codePointAt(0) >= characterMap[index].codePointAt(0)) {
      throw new Error(`${name} characterMap is not strictly sorted at index ${index}`);
    }
  }
  const available = new Set(characterMap);
  for (const character of required) {
    if (!available.has(character)) throw new Error(`${name} lacks ${character} U+${character.codePointAt(0).toString(16)}`);
  }
}

const xml = fs.readFileSync(path.join(unpacked, "ChineseTraditional.xml"), "utf8");
const ids = new Set([...xml.matchAll(/<char id="(\d+)"/g)].map((match) => Number(match[1])));
for (const character of required) {
  if (!ids.has(character.codePointAt(0))) {
    throw new Error(`ChineseTraditional BMFont lacks ${character} U+${character.codePointAt(0).toString(16)}`);
  }
}

console.log(`Verified ${required.size} required glyphs in both Traditional Chinese SpriteFonts and BMFont.`);
