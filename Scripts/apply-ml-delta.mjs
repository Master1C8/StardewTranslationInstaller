import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const cachePath = path.join(projectRoot, "ml-translation-cache.json");
const replaceExisting = process.argv.includes("--replace");
const deltaPaths = process.argv.slice(2).filter((value) => value !== "--replace").map((file) => path.resolve(file));
if (!deltaPaths.length) {
  throw new Error("Usage: node Scripts/apply-ml-delta.mjs <delta.json> [...]");
}

function sortedMatches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}
function count(value, character) {
  return [...value].filter((item) => item === character).length;
}
function withoutGenderBranches(value) {
  return value.replace(/\$\{[^{}]*\^[^{}]*\}\$/g, "");
}
function markerSignature(value) {
  return {
    contentPatcher: sortedMatches(value, /\{\{[^}]+\}\}/g),
    substitutions: sortedMatches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: sortedMatches(value, /\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: sortedMatches(value, /%[a-z][A-Za-z0-9_]*/g),
    dollar: sortedMatches(value, /\$[A-Za-z0-9]+/g),
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sortedMatches(value, /https?:\/\/[^\s)]+/g),
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(withoutGenderBranches(value), "^"),
    pipe: count(value, "|"),
    underscore: count(value, "_"),
    backslash: count(value, "\\"),
    newline: count(value, "\n"),
  };
}

const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
let applied = 0;
let replaced = 0;
for (const deltaPath of deltaPaths) {
  const delta = JSON.parse(fs.readFileSync(deltaPath, "utf8"));
  for (const [stable, translation] of Object.entries(delta)) {
    const entry = cache.entries[stable];
    if (!entry) throw new Error(`Unknown stable key in ${deltaPath}: ${stable}`);
    if (typeof translation !== "string") throw new Error(`Non-string translation in ${deltaPath}: ${stable}`);
    if (!translation.trim() && entry.englishValue !== "") {
      throw new Error(`Empty translation in ${deltaPath}: ${stable}`);
    }
    if (translation !== translation.normalize("NFC")) {
      throw new Error(`Non-NFC translation in ${deltaPath}: ${stable}`);
    }
    if (JSON.stringify(markerSignature(translation)) !== JSON.stringify(markerSignature(entry.englishValue))) {
      throw new Error(`Marker mismatch in ${deltaPath}: ${stable}`);
    }
    if (translation === "" && entry.englishValue === "") {
      if (!entry.approvedEmpty) applied += 1;
      entry.approvedEmpty = true;
      continue;
    }
    if (entry.translation && entry.translation !== translation && !replaceExisting) {
      throw new Error(`Conflicting existing translation in ${deltaPath}: ${stable}`);
    }
    if (entry.translation && entry.translation !== translation) {
      entry.translation = translation;
      replaced += 1;
    } else if (!entry.translation) {
      entry.translation = translation;
      applied += 1;
    }
  }
}

fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
const completed = Object.values(cache.entries).filter((entry) => entry.translation || entry.approvedEmpty).length;
console.log(JSON.stringify({ applied, replaced, completed, total: cache.count }, null, 2));
