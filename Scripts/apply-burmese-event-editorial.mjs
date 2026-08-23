#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "ml-scaffold-manifest.json");
const replacementsPath = path.join(root, "Documentation", "burmese-event-editorial-replacements.json");
const overridesPath = path.join(root, "Documentation", "burmese-editorial-overrides.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const replacementSets = JSON.parse(fs.readFileSync(replacementsPath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
const sourceById = new Map(manifest.rows.map((row) => [`${row.target}\u0000${row.key}`, row.englishValue]));

let applied = 0;
for (const [id, replacementSpec] of Object.entries(replacementSets)) {
  const replacements = Array.isArray(replacementSpec)
    ? replacementSpec
    : replacementSets[replacementSpec.copyFrom];
  if (!Array.isArray(replacements)) {
    throw new Error(`Invalid replacement alias in ${JSON.stringify(id)}`);
  }
  const source = sourceById.get(id);
  if (source === undefined) {
    throw new Error(`Missing English source for ${JSON.stringify(id)}`);
  }

  let translated = source;
  for (const [english, burmese, mode] of replacements) {
    const raw = mode === "raw";
    const replaceAll = mode === "all";
    const needle = raw ? english : `"${english}"`;
    const replacement = raw ? burmese : `"${burmese}"`;
    const first = translated.indexOf(needle);
    const last = translated.lastIndexOf(needle);
    if (first < 0) {
      throw new Error(`Missing replacement source in ${JSON.stringify(id)}: ${JSON.stringify(english)}`);
    }
    if (first !== last && !replaceAll) {
      throw new Error(`Ambiguous replacement source in ${JSON.stringify(id)}: ${JSON.stringify(english)}`);
    }
    translated = replaceAll
      ? translated.split(needle).join(replacement)
      : `${translated.slice(0, first)}${replacement}${translated.slice(first + needle.length)}`;
  }

  overrides[id] = translated;
  applied += 1;
}

fs.writeFileSync(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`);
console.log(JSON.stringify({ applied, totalOverrides: Object.keys(overrides).length }, null, 2));
