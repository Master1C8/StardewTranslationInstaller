#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/repair-burmese-control-tokens.mjs <unpacked-English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/burmese",
);
const expression = /\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+)|(?<=#)\$\d+\s+[^#]+(?=#)/g;
const itemSourceExpression = /%item\b[\s\S]*?%%/g;
const itemTargetExpression = /%item\b[\s\S]*?(?:%%|(?=\[#\]|$))/g;
const revealTasteExpression = /%revealtaste:[^%#$^|/\n]*/g;
const sourceCache = new Map();

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sourceContent(target) {
  if (!sourceCache.has(target)) {
    sourceCache.set(target, readJSON(path.join(sourceRoot, `${target}.json`)).content);
  }
  return sourceCache.get(target);
}

function directives(value) {
  return [...value.matchAll(expression)].map((match) => ({
    value: match[0],
    index: match.index,
    command: match[0].match(/^\$(?:[A-Za-z]+|\d+)/)?.[0],
  }));
}

function replacePercentControls(original, translated) {
  let result = translated;
  let replacements = 0;

  const sourceItems = [...original.matchAll(itemSourceExpression)];
  const targetItems = [...result.matchAll(itemTargetExpression)];
  if (sourceItems.length !== targetItems.length) {
    throw new Error("Cannot align %item controls");
  }
  for (let index = targetItems.length - 1; index >= 0; index -= 1) {
    if (targetItems[index][0] === sourceItems[index][0]) continue;
    result = result.slice(0, targetItems[index].index)
      + sourceItems[index][0]
      + result.slice(targetItems[index].index + targetItems[index][0].length);
    replacements += 1;
  }

  const sourceTastes = [...original.matchAll(revealTasteExpression)];
  if (sourceTastes.length) {
    const targetTastes = [...result.matchAll(revealTasteExpression)];
    if (sourceTastes.length === targetTastes.length) {
      for (let index = targetTastes.length - 1; index >= 0; index -= 1) {
        if (targetTastes[index][0] === sourceTastes[index][0]) continue;
        result = result.slice(0, targetTastes[index].index)
          + sourceTastes[index][0]
          + result.slice(targetTastes[index].index + targetTastes[index][0].length);
        replacements += 1;
      }
    } else {
      const sourceStart = sourceTastes[0].index;
      const sourceSuffix = original.slice(sourceStart);
      const nonControlSuffix = sourceSuffix.replace(revealTasteExpression, "");
      const targetStart = result.indexOf("%revealtaste:");
      if (nonControlSuffix || targetStart < 0) {
        throw new Error("Cannot align %revealtaste controls");
      }
      if (result.slice(targetStart) !== sourceSuffix) {
        result = result.slice(0, targetStart) + sourceSuffix;
        replacements += sourceTastes.length;
      }
    }
  }

  return { result, replacements };
}

let repairedRecords = 0;
let repairedDirectives = 0;
for (const fileName of fs.readdirSync(translationRoot).filter((file) => file.endsWith(".json"))) {
  const file = path.join(translationRoot, fileName);
  const document = readJSON(file);
  let changed = false;
  for (const change of document.Changes ?? []) {
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries ?? {})) {
      const original = source[key];
      if (typeof original !== "string" || typeof translated !== "string") continue;
      let { result, replacements } = replacePercentControls(original, translated);
      const before = directives(original);
      const after = directives(result);
      if (!before.length && !after.length && !replacements) continue;
      if (
        before.length !== after.length
        || before.some((item, index) => item.command !== after[index]?.command)
      ) {
        throw new Error(`Cannot align dialogue controls: ${change.Target} :: ${key}`);
      }
      for (let index = after.length - 1; index >= 0; index -= 1) {
        if (after[index].value === before[index].value) continue;
        result = result.slice(0, after[index].index)
          + before[index].value
          + result.slice(after[index].index + after[index].value.length);
        replacements += 1;
      }
      if (replacements || result !== translated) {
        change.Entries[key] = result;
        repairedRecords += 1;
        repairedDirectives += replacements;
        changed = true;
      }
    }
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

console.log(JSON.stringify({ repairedRecords, repairedDirectives }, null, 2));
