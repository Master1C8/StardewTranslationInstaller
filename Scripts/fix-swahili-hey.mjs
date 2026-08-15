#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
const write = process.argv.includes("--write");
const repairSegments = true;
if (!sourceRoot) {
  console.error("Usage: node Scripts/fix-swahili-hey.mjs <unpacked-English-assets-dir> [--write]");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
);
const sourceCache = new Map();
let changedFiles = 0;
let changedEntries = 0;
let replacements = 0;
const details = [];

function sourceContent(target) {
  if (!sourceCache.has(target)) {
    sourceCache.set(
      target,
      JSON.parse(fs.readFileSync(path.join(sourceRoot, `${target}.json`), "utf8")).content,
    );
  }
  return sourceCache.get(target);
}

function replaceFirstMatches(value, expression, count, replacement) {
  let remaining = count;
  return value.replace(expression, (match) => {
    if (remaining <= 0) return match;
    remaining -= 1;
    return replacement;
  });
}

// Keep dialogue branches and response lines aligned. A raw entry-wide replacement
// can move a greeting into the wrong gender/choice branch when both branches use
// the pronoun "wewe".
const dialogueBoundary = /(\^|\||\/|\(break\)|\\(?=(?:speak|pause|emote|faceDirection)\b)|#\$(?:e|b)#|#\$q[^#]*#|#\$r[^#]*#)/g;
function splitDialogue(value) {
  return value.split(dialogueBoundary);
}

function repairGreetingSegments(original, translated) {
  const sourceParts = splitDialogue(original);
  const targetParts = splitDialogue(translated);
  if (sourceParts.length !== targetParts.length) return translated;

  for (let index = 0; index < sourceParts.length; index += 2) {
    const sourcePart = sourceParts[index];
    let targetPart = targetParts[index];
    const sourceGreetings = sourcePart.match(/\b(?:Hey|Hi|Hello|Howdy|Hiya|Yo)\b/gi)?.length ?? 0;
    const targetGreetings = targetPart.match(/\b(?:Hei|Halo|Hujambo|Hamjambo|Habari)\b/gi)?.length ?? 0;

    if (targetGreetings < sourceGreetings) {
      const missing = Math.min(
        sourceGreetings - targetGreetings,
        targetPart.match(/\bwewe\b/gi)?.length ?? 0,
      );
      if (missing) targetPart = replaceFirstMatches(targetPart, /\bwewe\b/gi, missing, "Hei");
    }
    targetParts[index] = targetPart;
  }
  return targetParts.join("");
}

for (const file of fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort()) {
  const filePath = path.join(translationRoot, file);
  const document = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let fileChanged = false;

  for (const change of document.Changes ?? []) {
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries ?? {})) {
      const original = source[key];
      if (typeof original !== "string" || typeof translated !== "string") continue;

      if (/\bHey\b/i.test(original)) {
        const repaired = repairGreetingSegments(original, translated);
        if (repaired !== translated) {
          change.Entries[key] = repaired;
          replacements += 1;
          changedEntries += 1;
          fileChanged = true;
          details.push({ target: change.Target, key, before: translated, after: repaired });
        }
        continue;
      }

    }
  }

  if (fileChanged) {
    changedFiles += 1;
    if (write) fs.writeFileSync(filePath, `${JSON.stringify(document, null, 2)}\n`);
  }
}

console.log(JSON.stringify({
  mode: write ? "write" : "dry-run",
  repairSegments,
  replacements,
  changedEntries,
  changedFiles,
  details,
}, null, 2));
