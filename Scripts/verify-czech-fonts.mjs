#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const unpacked = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!unpacked) throw new Error("Usage: verify-czech-fonts.mjs <unpacked-font-dir>");

const translationRoot = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/czech");
const required = new Set();
function collect(value) {
  if (typeof value === "string") {
    for (const character of value.normalize("NFC")) if (!/\s/u.test(character)) required.add(character);
  } else if (Array.isArray(value)) {
    for (const item of value) collect(item);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collect(item);
  }
}
function collectFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(file);
    else if (entry.isFile() && entry.name.endsWith(".json")) collect(JSON.parse(fs.readFileSync(file, "utf8")));
  }
}
collectFiles(translationRoot);
for (const character of "ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž") required.add(character);

for (const name of ["SpriteFont1", "SmallFont"]) {
  const document = JSON.parse(fs.readFileSync(path.join(unpacked, `${name}.json`), "utf8"));
  const { characterMap, glyphs, cropping, kerning } = document.content ?? {};
  if (![characterMap, glyphs, cropping, kerning].every(Array.isArray)) throw new Error(`${name} lacks SpriteFont metadata lists`);
  if (new Set([characterMap.length, glyphs.length, cropping.length, kerning.length]).size !== 1) throw new Error(`${name} metadata lists are not aligned`);
  for (let index = 1; index < characterMap.length; index += 1) {
    if (characterMap[index - 1].codePointAt(0) >= characterMap[index].codePointAt(0)) throw new Error(`${name} characterMap is not strictly sorted`);
  }
  const available = new Set(characterMap);
  const missing = [...required].filter((character) => !available.has(character));
  if (missing.length) throw new Error(`${name} misses ${missing.length} required glyphs: ${missing.slice(0, 20).join("")}`);
  const texturePath = path.join(unpacked, `${name}.png`);
  if (!fs.existsSync(texturePath)) throw new Error(`${name} round-trip texture is missing`);
  const texture = fs.readFileSync(texturePath);
  if (texture.length < 24 || texture.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${name} round-trip texture is not a PNG`);
  }
  const expectedSize = name === "SpriteFont1" ? 1024 : 512;
  const width = texture.readUInt32BE(16);
  const height = texture.readUInt32BE(20);
  if (width !== expectedSize || height !== expectedSize) {
    throw new Error(`${name} texture is ${width}x${height}; expected deterministic ${expectedSize}x${expectedSize}`);
  }
  console.log(`${name}: ${characterMap.length} sorted glyphs; all ${required.size} Czech-package characters present; texture ${width}x${height}`);
}
