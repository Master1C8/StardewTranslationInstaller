#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations",
);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listJSONFiles(directory) {
  return fs.readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
}

function records(language) {
  const result = new Map();
  const directory = path.join(translationRoot, language);
  for (const file of listJSONFiles(directory)) {
    const document = readJSON(path.join(directory, file));
    for (const change of document.Changes ?? []) {
      for (const [key, value] of Object.entries(change.Entries ?? {})) {
        result.set(`${change.Target}\u0000${key}`, value);
      }
    }
  }
  return result;
}

const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const sourceCache = new Map();
function english(target, key) {
  if (!sourceCache.has(target)) {
    sourceCache.set(target, readJSON(path.join(englishRoot, `${target}.json`)).content);
  }
  return sourceCache.get(target)[key];
}

const kannada = records("kannada");
const burmese = records("burmese");
const specs = readJSON(path.join(projectRoot, "Documentation/kannada-preserved-values.json"));
const allowed = new Map();

for (const spec of specs) {
  const candidates = [...kannada.keys()].filter((id) => id.startsWith(`${spec.target}\u0000`));
  const ids = spec.key === "*"
    ? candidates
    : spec.key === "*exact"
      ? candidates.filter((id) => {
          const [target, key] = id.split("\u0000");
          return kannada.get(id) === english(target, key);
        })
      : [`${spec.target}\u0000${spec.key}`];
  for (const id of ids) allowed.set(id, spec.reason);
}

for (const key of [
  "PageUp", "PageDown", "PrintScreen", "RightControl", "LeftAlt", "RightAlt",
  "VolumeMute", "VolumeDown", "VolumeUp", "MediaStop", "Tilde", "ChatPadOrange",
  "ProcessKey", "Attn", "Exsel",
]) {
  allowed.set(
    `Strings/StringsFromCSFiles\u0000${key}`,
    "The physical keyboard or controller key label is preserved so it matches the user's hardware.",
  );
}

const grouped = new Map();
for (const [id, reason] of allowed) {
  const [target, key] = id.split("\u0000");
  if (burmese.get(id) !== english(target, key)) continue;
  const values = grouped.get(target) ?? [];
  values.push({ key, reason });
  grouped.set(target, values);
}

const output = [];
for (const [target, values] of [...grouped].sort(([left], [right]) => left.localeCompare(right))) {
  const burmeseExact = [...burmese.keys()].filter((id) => {
    if (!id.startsWith(`${target}\u0000`)) return false;
    const [, key] = id.split("\u0000");
    return burmese.get(id) === english(target, key);
  });
  const allowedKeys = new Set(values.map(({ key }) => key));
  if (burmeseExact.length === values.length && burmeseExact.every((id) => allowedKeys.has(id.split("\u0000")[1]))) {
    output.push({
      target,
      key: "*exact",
      expected: values.length,
      reason: values[0].reason,
    });
  } else {
    for (const value of values.sort((left, right) => left.key.localeCompare(right.key))) {
      output.push({ target, key: value.key, reason: value.reason });
    }
  }
}

const destination = path.join(projectRoot, "Documentation/burmese-preserved-values.json");
fs.writeFileSync(destination, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ entries: output.length, preservedIds: [...allowed].filter(([id]) => {
  const [target, key] = id.split("\u0000");
  return burmese.get(id) === english(target, key);
}).length }));
