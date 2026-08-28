#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const unpacked = process.argv[2];
const mapFile = process.argv[3];
if (!unpacked || !mapFile) {
  console.error("Usage: node Scripts/verify-bengali-fonts.mjs <unpacked-font-dir> <bengali-cluster-map.json>");
  process.exit(2);
}
const map = JSON.parse(fs.readFileSync(mapFile, "utf8"));
if (map?.format !== 1 || !Array.isArray(map.entries) || map.entries.length === 0) throw new Error("invalid Bengali cluster map");
const mappedGlyphs = map.entries.map((entry) => entry.glyph);
if (new Set(mappedGlyphs).size !== mappedGlyphs.length) throw new Error("duplicate Bengali cluster glyph");
for (let index = 0; index < mappedGlyphs.length; index += 1) {
  if (mappedGlyphs[index].codePointAt(0) !== 0xE000 + index) throw new Error(`non-contiguous Bengali cluster glyph at index ${index}`);
}
for (const name of ["SpriteFont1", "SmallFont"]) {
  const document = JSON.parse(fs.readFileSync(path.join(unpacked, `${name}.json`), "utf8"));
  const { characterMap, glyphs, cropping, kerning } = document.content ?? {};
  if (![characterMap, glyphs, cropping, kerning].every(Array.isArray)) throw new Error(`${name} lacks parallel SpriteFont metadata lists`);
  if (new Set([characterMap.length, glyphs.length, cropping.length, kerning.length]).size !== 1) throw new Error(`${name} SpriteFont metadata lists are not aligned`);
  for (let index = 1; index < characterMap.length; index += 1) {
    if (characterMap[index - 1].codePointAt(0) >= characterMap[index].codePointAt(0)) throw new Error(`${name} characterMap is not strictly sorted at index ${index}`);
  }
  const available = new Set(characterMap);
  for (const glyph of mappedGlyphs) if (!available.has(glyph)) throw new Error(`${name} lacks Bengali cluster glyph U+${glyph.codePointAt(0).toString(16)}`);
}
const xml = fs.readFileSync(path.join(unpacked, "Bengali.xml"), "utf8");
const ids = new Set([...xml.matchAll(/<char id="(\d+)"/g)].map((match) => Number(match[1])));
for (const glyph of mappedGlyphs) if (!ids.has(glyph.codePointAt(0))) throw new Error(`Bengali BMFont lacks cluster glyph U+${glyph.codePointAt(0).toString(16)}`);
console.log(`Verified ${mappedGlyphs.length} shaped Bengali glyphs in both SpriteFonts and BMFont.`);
