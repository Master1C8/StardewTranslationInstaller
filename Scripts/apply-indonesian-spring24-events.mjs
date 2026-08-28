import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian/festivals-structure-fix.json');
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
const change = document.Changes.find((entry) => entry.Target === 'Data/Festivals/spring24' && typeof entry.Entries?.mainEvent === 'string');
if (!change) throw new Error('Missing Data/Festivals/spring24 mainEvent');

const source = 'That was fun! Time to go home...';
const target = 'Tadi menyenangkan! Saatnya pulang...';
let value = change.Entries.mainEvent;
const sourceCount = value.split(source).length - 1;
const targetCount = value.split(target).length - 1;
let changed = 0;
if (sourceCount === 1 && targetCount === 0) {
  value = value.replace(source, target);
  changed = 1;
} else if (!(sourceCount === 0 && targetCount === 1)) {
  throw new Error(`Ambiguous replacement (source=${sourceCount}, target=${targetCount})`);
}
change.Entries.mainEvent = value;
fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied spring24 event translations to ${changed} entries.`);
