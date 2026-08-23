#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const inputFile = path.resolve(process.argv[2] ?? path.join(projectRoot, "../kannada-translation-cache.json"));
const outputFile = path.resolve(process.argv[3] ?? path.join(projectRoot, "../kannada-editorial-cache.json"));
const english = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.en.json"), "utf8"),
);
const kannada = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.kn.json"), "utf8"),
).kn;
const ambiguous = new Set([
  "bar", "basic", "cast", "club", "fall", "floor", "harvest", "host",
  "level", "load", "mine", "name", "pet", "quality", "save", "spring",
  "water", "well",
]);

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const candidates = [];
const foldedTargets = new Map();
const foldedConflicts = new Set();
for (const entry of english) {
  const sources = entry.term.split("/").map((value) => value.trim());
  const targets = kannada[entry.id]?.term.split("/").map((value) => value.trim()) ?? [];
  if (sources.length !== targets.length) continue;
  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    const target = targets[index];
    if (source.length < 3 || !/[A-Za-z]/.test(source) || !target || target.includes("/")) continue;
    const folded = source.toLocaleLowerCase("en");
    if (foldedTargets.has(folded) && foldedTargets.get(folded) !== target) {
      foldedConflicts.add(folded);
    } else {
      foldedTargets.set(folded, target);
    }
    candidates.push({ source, folded });
  }
}
const expressions = candidates
  .filter(({ folded }) => !foldedConflicts.has(folded) && !ambiguous.has(folded))
  .map(({ source }) => new RegExp(`(?<![A-Za-z])${escape(source)}(?![A-Za-z])`));
const controlExpression = /\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+)/;
const cache = JSON.parse(fs.readFileSync(inputFile, "utf8"));
const editorial = {};
let invalidatedGlossary = 0;
let invalidatedControl = 0;
for (const [source, translated] of Object.entries(cache)) {
  const glossary = expressions.some((expression) => expression.test(source));
  const control = controlExpression.test(source);
  if (glossary || control) {
    if (glossary) invalidatedGlossary += 1;
    if (control) invalidatedControl += 1;
  } else {
    editorial[source] = translated;
  }
}
fs.writeFileSync(outputFile, `${JSON.stringify(editorial, null, 2)}\n`);
console.log(JSON.stringify({
  sourceEntries: Object.keys(cache).length,
  retainedEntries: Object.keys(editorial).length,
  invalidatedGlossary,
  invalidatedControl,
  outputFile,
}, null, 2));
