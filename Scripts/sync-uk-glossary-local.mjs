#!/usr/bin/env node
// Updates only the authorized local Ukrainian glossary layer. No CMS operation.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const file = '/Users/antonkrutov/Desktop/SiteForMods/data/games/stardew-valley/glossary-translations.json';
const baseline = JSON.parse(fs.readFileSync(path.join(root,'Documentation/uk/glossary-endpoint.json')));
const reviewed = JSON.parse(fs.readFileSync(path.join(root,'Documentation/glossary/glossary.uk.json'))).uk;
const before = fs.readFileSync(file,'utf8');
const document = JSON.parse(before);
const expected = Object.fromEntries(baseline.entries.map(e=>[e.id,e.translation]));
if (JSON.stringify(document.uk) === JSON.stringify(reviewed)) {
  console.log('Local canonical uk glossary is current.'); process.exit(0);
}
if (JSON.stringify(document.uk) !== JSON.stringify(expected)) throw Error('Canonical uk changed since download; review concurrent changes first.');
const block = layer => JSON.stringify({uk:layer},null,2).slice(2,-2);
const oldBlock = block(document.uk);
if (before.split(oldBlock).length !== 2) throw Error('Cannot isolate exact uk block without reformatting unrelated locales.');
const after = before.replace(oldBlock,block(reviewed));
const result=JSON.parse(after);
for (const locale of Object.keys(document)) if (locale!=='uk' && JSON.stringify(document[locale])!==JSON.stringify(result[locale])) throw Error(`Unrelated locale changed: ${locale}`);
if (fs.readFileSync(file,'utf8')!==before) throw Error('Concurrent glossary write; retry after reviewing.');
fs.writeFileSync(file,after);
if (JSON.stringify(JSON.parse(fs.readFileSync(file)).uk)!==JSON.stringify(reviewed)) throw Error('Post-write uk mismatch');
console.log(`Updated local canonical uk only: ${Object.keys(reviewed).length} entries.`);
