#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [directory] = process.argv.slice(2);
if (!directory) {
  throw new Error("Usage: adjust-es-419-font-metrics.mjs <generated-font-directory>");
}

function raiseSpriteFont(name, expectedY, adjustedY) {
  const file = path.join(directory, `${name}.json`);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  const index = document.content.characterMap.indexOf("¡");
  if (index < 0) {
    throw new Error(`${name} has no inverted exclamation mark`);
  }
  const cropping = document.content.cropping[index];
  if (cropping.y !== expectedY) {
    throw new Error(`${name} inverted-exclamation y drifted: ${cropping.y}`);
  }
  cropping.y = adjustedY;
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

function raiseBitmapFont(name, expectedY, adjustedY) {
  const file = path.join(directory, `${name}.xml`);
  const source = fs.readFileSync(file, "utf8");
  const pattern = /(<char id="161"[^>]*\byoffset=")(-?\d+)("[^>]*\/>)/;
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`${name} has no inverted exclamation mark`);
  }
  if (Number(match[2]) !== expectedY) {
    throw new Error(`${name} inverted-exclamation yoffset drifted: ${match[2]}`);
  }
  fs.writeFileSync(file, source.replace(pattern, `$1${adjustedY}$3`));
}

raiseSpriteFont("SpriteFont1", 15, 12);
raiseSpriteFont("SmallFont", 10, 8);
raiseBitmapFont("LatinAmericanSpanish", 2, -4);

console.log("Raised the es-419 inverted exclamation mark in all runtime fonts.");
