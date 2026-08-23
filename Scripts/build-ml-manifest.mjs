import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const polishRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/polish");
const output = path.join(projectRoot, "ml-scaffold-manifest.json");

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  }).filter((file) => file.endsWith(".json"));
}
function englishEntries(file) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  return document.content && typeof document.content === "object" ? document.content : {};
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
const englishByTarget = new Map();
for (const file of filesUnder(englishRoot)) {
  const relative = path.relative(englishRoot, file).replace(/\\/g, "/").replace(/\.json$/, "");
  const target = relative;
  englishByTarget.set(target.toLowerCase(), { file, values: englishEntries(file) });
}
const rows = [];
const seen = new Set();
for (const file of filesUnder(polishRoot).sort()) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const change of document.Changes || []) {
    if (!change.Entries) continue;
    const target = change.Target;
    const source = englishByTarget.get(target.toLowerCase());
    for (const key of Object.keys(change.Entries)) {
      const id = `${target}\u0000${key}`;
      if (seen.has(id)) throw new Error(`duplicate ${id}`);
      seen.add(id);
      const value = source?.values?.[key];
      rows.push({
        target,
        key,
        scaffoldFile: path.relative(projectRoot, file).replace(/\\/g, "/"),
        englishFile: source ? path.relative(englishRoot, source.file).replace(/\\/g, "/") : null,
        englishValue: typeof value === "string" ? value : null,
        markerSignature: typeof value === "string" ? markerSignature(value) : null,
      });
    }
  }
}
const missing = rows.filter((row) => row.englishValue === null);
if (rows.length !== 14720) throw new Error(`expected 14720 unique pairs, got ${rows.length}`);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify({ generatedFrom: englishRoot, scaffoldLocale: "polish", targetLocale: "ml-vnrevival", count: rows.length, missingEnglishValues: missing.length, rows }, null, 2)}\n`);
console.log(JSON.stringify({ output, count: rows.length, missingEnglishValues: missing.length, targets: new Set(rows.map((row) => row.target)).size }, null, 2));
