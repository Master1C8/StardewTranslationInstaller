import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian/festivals-data-04.json');
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
const changes = document.Changes.filter((entry) => entry.Target === 'Data/Festivals/summer28');
if (changes.length === 0) throw new Error('Missing Data/Festivals/summer28');

const source = 'The glow of summer has faded, now... and the moonlight jellies carry on toward the great unknown.';
const target = 'Cahaya musim panas kini telah memudar... dan Ubur-ubur Cahaya Bulan melanjutkan perjalanan menuju bentangan luas yang tak dikenal.';
let changed = 0;

for (const key of ['mainEvent', 'mainEvent_y2']) {
  const change = changes.find((entry) => typeof entry.Entries?.[key] === 'string');
  if (!change) throw new Error(`Missing Data/Festivals/summer28 ${key}`);
  let value = change.Entries[key];
  const sourceCount = value.split(source).length - 1;
  const targetCount = value.split(target).length - 1;
  if (sourceCount === 1 && targetCount === 0) {
    value = value.replace(source, target);
    changed += 1;
  } else if (!(sourceCount === 0 && targetCount === 1)) {
    throw new Error(`${key}: ambiguous replacement (source=${sourceCount}, target=${targetCount})`);
  }
  change.Entries[key] = value;
}

fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied summer28 event translations to ${changed} dialogue fragments.`);
