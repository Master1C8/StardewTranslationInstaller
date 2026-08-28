#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const batchFile = process.argv[2];
if (!batchFile) {
  console.error('Usage: node Scripts/apply-indonesian-event-fragment-batch.mjs <batch.json>');
  process.exit(2);
}

const root = path.resolve(import.meta.dirname, '..');
const translationRoot = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian');
const batch = JSON.parse(fs.readFileSync(path.resolve(batchFile), 'utf8'));

function listJsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJsonFiles(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}

const files = listJsonFiles(translationRoot);
const documents = new Map(files.map((file) => [file, JSON.parse(fs.readFileSync(file, 'utf8'))]));
const touched = new Set();
let changedFragments = 0;

for (const item of batch) {
  if (!item?.target || !item?.key || !Array.isArray(item.replacements) || item.replacements.length === 0) {
    throw new Error(`Invalid batch item: ${JSON.stringify(item)}`);
  }
  const matches = [];
  for (const [file, document] of documents) {
    for (const change of document.Changes ?? []) {
      if (change.Target === item.target && typeof change.Entries?.[item.key] === 'string') {
        matches.push({ file, change });
      }
    }
  }
  if (matches.length !== 1) {
    throw new Error(`${item.target} :: ${item.key}: expected one record, found ${matches.length}`);
  }
  const { file, change } = matches[0];
  let value = change.Entries[item.key];
  for (const pair of item.replacements) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair[0] || !pair[1]) {
      throw new Error(`${item.target} :: ${item.key}: invalid replacement ${JSON.stringify(pair)}`);
    }
    const [source, target] = pair;
    const sourceCount = value.split(source).length - 1;
    const targetCount = value.split(target).length - 1;
    if (sourceCount === 1 && targetCount === 0) {
      value = value.replace(source, target);
      changedFragments += 1;
    } else if (!(sourceCount === 0 && targetCount === 1)) {
      throw new Error(`${item.target} :: ${item.key}: ambiguous replacement (source=${sourceCount}, target=${targetCount}) for ${JSON.stringify(source)}`);
    }
  }
  change.Entries[item.key] = value;
  touched.add(file);
}

for (const file of touched) {
  fs.writeFileSync(file, `${JSON.stringify(documents.get(file), null, 2)}\n`);
}

console.log(`Applied ${changedFragments} event dialogue fragments across ${batch.length} records in ${touched.size} files.`);
