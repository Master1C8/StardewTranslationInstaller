#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/urdu",
);
const documentationOutput = path.join(projectRoot, "Documentation/urdu-cluster-map.json");
const runtimeOutput = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/LanguageSwitcherPayload/urdu-shaping-map.json",
);
const segmenter = new Intl.Segmenter("ur", { granularity: "grapheme" });
const PUA_START = 0xE000;
const PUA_END = 0xF8FF;

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  }).sort();
}

function collectStrings(value, output) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, output);
  else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, output);
  }
}

// Unicode Arabic Presentation Forms are ordered isolated, final, initial,
// medial for dual-joining letters and isolated, final for right-joining ones.
// Deriving the table through NFKC keeps the generator tied to Unicode data
// instead of a hand-maintained list of Urdu letters.
const formsByBase = new Map();
for (const [start, end] of [[0xFB50, 0xFDFF], [0xFE70, 0xFEFF]]) {
  for (let codepoint = start; codepoint <= end; codepoint += 1) {
    const presentation = String.fromCodePoint(codepoint);
    const base = presentation.normalize("NFKC");
    if ([...base].length !== 1 || !/\p{Script=Arabic}/u.test(base)) continue;
    const forms = formsByBase.get(base) ?? [];
    if (!forms.includes(presentation)) forms.push(presentation);
    formsByBase.set(base, forms);
  }
}

// U+0649 has two historical isolated/final pairs. Prefer the extended pair;
// Urdu normally uses U+06CC, but this makes fallback data deterministic.
if ((formsByBase.get("ى") ?? []).length > 2) {
  formsByBase.set("ى", formsByBase.get("ى").slice(0, 2));
}

const values = [];
for (const file of listJSONFiles(translationRoot)) {
  collectStrings(JSON.parse(fs.readFileSync(file, "utf8")), values);
}

const logicalClusters = new Set();
for (const value of values) {
  for (const { segment } of segmenter.segment(value.normalize("NFC"))) {
    const base = [...segment].find((character) => formsByBase.has(character));
    if (base) logicalClusters.add(segment);
  }
}

const formNames = ["isolated", "final", "initial", "medial"];
const pending = [];
for (const logical of [...logicalClusters].sort((left, right) => left.localeCompare(right, "ur"))) {
  const characters = [...logical];
  const baseIndex = characters.findIndex((character) => formsByBase.has(character));
  const base = characters[baseIndex];
  const forms = formsByBase.get(base);
  const suffix = characters.filter((_, index) => index !== baseIndex).join("");
  for (let index = 0; index < forms.length; index += 1) {
    pending.push({
      logical,
      form: formNames[index],
      cluster: `${forms[index]}${suffix}`,
      joining: forms.length >= 4 ? "dual" : forms.length >= 2 ? "right" : "none",
    });
  }
}

if (PUA_START + pending.length - 1 > PUA_END) {
  throw new Error(`Urdu shaping map exceeds the BMP private-use area: ${pending.length}`);
}
const entries = pending.map((entry, index) => ({
  glyph: String.fromCodePoint(PUA_START + index),
  ...entry,
}));
const document = {
  format: 2,
  description: "Contextually shaped Urdu grapheme glyphs used by the Stardew bitmap fonts and runtime bidi adapter.",
  entries,
};
const serialized = `${JSON.stringify(document, null, 2)}\n`;
fs.writeFileSync(documentationOutput, serialized);
fs.writeFileSync(runtimeOutput, serialized);
console.log(`Generated ${entries.length} contextual Urdu glyph mappings for ${logicalClusters.size} grapheme clusters.`);
