#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const batchPath = process.argv[2];
const outputPath = process.argv[3];
const replace = process.argv.includes("--replace");

if (!batchPath || !outputPath) {
  console.error("Usage: node Scripts/build-ml-event-delta.mjs <segments.json> <delta.json>");
  process.exit(2);
}

const cache = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "ml-translation-cache.json"), "utf8"),
).entries;
const batch = JSON.parse(fs.readFileSync(path.resolve(batchPath), "utf8"));

function hasTranslatableText(value) {
  return /[A-Za-z]{2}/.test(value)
    && !/^(?:[A-Fa-f0-9]{6,}|https?:\/\/\S+)$/.test(value.trim());
}

function eventRanges(value) {
  const ranges = [];
  const quotedExpression = /"(?:\\.|[^"\\])*"/g;
  for (const match of value.matchAll(quotedExpression)) {
    const decoded = JSON.parse(match[0]);
    if (hasTranslatableText(decoded)) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        source: decoded,
        quote: true,
      });
    }
  }

  const quickQuestionExpression = /\/quickQuestion\s+(.+?)\(break\)/g;
  for (const command of value.matchAll(quickQuestionExpression)) {
    const choices = command[1];
    const choicesStart = command.index + command[0].indexOf(choices);
    const hash = choices.indexOf("#");
    const prompt = choices.slice(0, hash < 0 ? choices.length : hash);
    if (hasTranslatableText(prompt)) {
      ranges.push({
        start: choicesStart,
        end: choicesStart + prompt.length,
        source: prompt,
        quote: false,
      });
    }
    for (const choice of choices.matchAll(/#([^#]*?)(?=#|$)/g)) {
      const text = choice[1];
      if (!hasTranslatableText(text)) continue;
      const start = choicesStart + choice.index + 1;
      ranges.push({ start, end: start + text.length, source: text, quote: false });
    }
  }

  ranges.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const selected = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    selected.push(range);
    cursor = range.end;
  }
  return selected;
}

const delta = {};
for (const [id, translations] of Object.entries(batch)) {
  const entry = cache[id];
  if (!entry) throw new Error(`Unknown cache entry: ${id}`);
  if (!entry.target.startsWith("Data/Events/")) {
    throw new Error(`Not an event entry: ${id}`);
  }
  if (entry.translation && !replace) throw new Error(`Entry is already translated: ${id}`);
  if (!Array.isArray(translations)) throw new Error(`Expected an array: ${id}`);

  const ranges = eventRanges(entry.englishValue);
  if (ranges.length !== translations.length) {
    throw new Error(
      `Segment count mismatch for ${id}: expected ${ranges.length}, got ${translations.length}`,
    );
  }

  let cursor = 0;
  let result = "";
  for (let index = 0; index < ranges.length; index += 1) {
    const range = ranges[index];
    const translated = translations[index];
    if (typeof translated !== "string" || translated.length === 0) {
      throw new Error(`Invalid translation ${index + 1} for ${id}`);
    }
    result += entry.englishValue.slice(cursor, range.start);
    result += range.quote ? JSON.stringify(translated) : translated;
    cursor = range.end;
  }
  result += entry.englishValue.slice(cursor);
  delta[id] = result;
}

fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(delta, null, 2)}\n`);
console.log(JSON.stringify({ records: Object.keys(delta).length }, null, 2));
