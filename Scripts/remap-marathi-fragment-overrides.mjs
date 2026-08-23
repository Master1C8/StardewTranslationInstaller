#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [oldInputFile, newInputFile, overridesFile] = process.argv
  .slice(2)
  .map((value) => path.resolve(value));
if (!oldInputFile || !newInputFile || !overridesFile) {
  throw new Error("Usage: remap-marathi-fragment-overrides <old-input> <new-input> <overrides.json>");
}

const oldJob = JSON.parse(fs.readFileSync(oldInputFile, "utf8"));
const newJob = JSON.parse(fs.readFileSync(newInputFile, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesFile, "utf8"));
const newBySource = new Map(newJob.items.map((item) => [item.source, item]));

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function itemCaptures(item) {
  const textParts = [];
  let expression = "^";
  for (const part of item.parts) {
    if (part.literal !== undefined) {
      expression += escapeRegExp(part.literal);
      continue;
    }
    textParts.push(part);
    expression += `(${escapeRegExp(part.text).replace(/<ID\d+>/g, "[\\s\\S]+?")})`;
  }
  expression += "$";
  const match = item.source.match(new RegExp(expression, "u"));
  if (!match) throw new Error(`Could not recover local fragments for ${JSON.stringify(item.source)}`);
  return textParts.map((part, index) => ({ part, source: match[index + 1] }));
}

const remapped = {};
const found = new Set();
for (const oldItem of oldJob.items) {
  const matchingKeys = oldItem.parts
    .filter((part) => part.text && Object.hasOwn(overrides, part.text))
    .map((part) => part.text);
  if (!matchingKeys.length) continue;
  const newItem = newBySource.get(oldItem.source);
  if (!newItem) throw new Error(`New local input lost ${JSON.stringify(oldItem.source)}`);
  const oldCaptures = itemCaptures(oldItem);
  const newCaptures = itemCaptures(newItem);
  for (const oldKey of matchingKeys) {
    const originals = oldCaptures
      .filter(({ part }) => part.text === oldKey)
      .map(({ source }) => source);
    const candidateKeys = [...new Set(
      newCaptures
        .filter(({ source }) => originals.includes(source))
        .map(({ part }) => part.text),
    )];
    if (candidateKeys.length !== 1) {
      throw new Error(
        `Override ${JSON.stringify(oldKey)} mapped to ${candidateKeys.length} new fragments in ${JSON.stringify(oldItem.source)}`,
      );
    }
    const newKey = candidateKeys[0];
    if (Object.hasOwn(remapped, newKey) && remapped[newKey] !== overrides[oldKey]) {
      throw new Error(`Conflicting remapped fragment override: ${JSON.stringify(newKey)}`);
    }
    remapped[newKey] = overrides[oldKey];
    found.add(oldKey);
  }
}

const missing = Object.keys(overrides).filter((key) => !found.has(key));
if (missing.length) throw new Error(`Unmapped fragment overrides: ${JSON.stringify(missing)}`);
fs.writeFileSync(overridesFile, `${JSON.stringify(remapped, null, 2)}\n`);
console.log(`Remapped ${Object.keys(overrides).length} Marathi fragment overrides.`);
