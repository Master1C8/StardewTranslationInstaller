#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const unpacked = process.argv[2];
const mapFile = process.argv[3];
if (!unpacked || !mapFile) {
  console.error("Usage: node Scripts/verify-thai-fonts.mjs <unpacked-font-dir> <thai-cluster-map.json>");
  process.exit(2);
}
const map = JSON.parse(fs.readFileSync(mapFile, "utf8"));
if (map?.format !== 1 || !Array.isArray(map.entries) || map.entries.length === 0) throw new Error("invalid Thai cluster map");
const mappedGlyphs = map.entries.map((entry) => entry.glyph);
if (new Set(mappedGlyphs).size !== mappedGlyphs.length) throw new Error("duplicate Thai cluster glyph");
for (let index = 0; index < mappedGlyphs.length; index += 1) {
  if (mappedGlyphs[index].codePointAt(0) !== 0xE000 + index) throw new Error(`non-contiguous Thai cluster glyph at index ${index}`);
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
  for (const glyph of mappedGlyphs) if (!available.has(glyph)) throw new Error(`${name} lacks Thai cluster glyph U+${glyph.codePointAt(0).toString(16)}`);
  const thaiBounds = characterMap
    .map((glyph, index) => ({ glyph, crop: cropping[index], source: glyphs[index] }))
    .filter(({ glyph }) => mappedGlyphs.includes(glyph))
    .map(({ crop, source }) => ({ top: crop.y, bottom: crop.y + source.height }));
  const top = Math.min(...thaiBounds.map((bounds) => bounds.top));
  const bottom = Math.max(...thaiBounds.map((bounds) => bounds.bottom));
  if (bottom - top > document.content.verticalLineSpacing) {
    throw new Error(`${name} line spacing ${document.content.verticalLineSpacing} is smaller than its ${bottom - top}px Thai glyph extent`);
  }
}
const xml = fs.readFileSync(path.join(unpacked, "Thai.xml"), "utf8");
const ids = new Set([...xml.matchAll(/<char id="(\d+)"/g)].map((match) => Number(match[1])));
for (const glyph of mappedGlyphs) if (!ids.has(glyph.codePointAt(0))) throw new Error(`Thai BMFont lacks cluster glyph U+${glyph.codePointAt(0).toString(16)}`);
const lineHeight = Number(xml.match(/<common lineHeight="(\d+)"/)?.[1]);
const verticalBounds = [...xml.matchAll(/<char id="\d+"[^>]*height="(\d+)"[^>]*yoffset="(-?\d+)"/g)]
  .map((match) => ({ height: Number(match[1]), yOffset: Number(match[2]) }));
if (!Number.isInteger(lineHeight) || verticalBounds.length === 0) throw new Error("Thai BMFont lacks usable vertical metrics");
const top = Math.min(...verticalBounds.map(({ yOffset }) => yOffset));
const bottom = Math.max(...verticalBounds.map(({ height, yOffset }) => yOffset + height));
if (bottom - top > lineHeight) {
  throw new Error(`Thai BMFont line height ${lineHeight} is smaller than its ${bottom - top}px glyph extent`);
}
console.log(`Verified ${mappedGlyphs.length} shaped Thai glyphs in both SpriteFonts and BMFont.`);
