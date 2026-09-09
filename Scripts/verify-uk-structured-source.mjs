#!/usr/bin/env node
// Source discovery only; never generates or changes translated wording.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const unpacked = process.argv[2];
if (!unpacked) throw Error('Usage: node Scripts/verify-uk-structured-source.mjs <UkExtract-output-dir>');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const sourceRoot = process.env.STARDEW_UK_ENGLISH_ROOT ?? '/Users/antonkrutov/Developer/data/stardew-english-unpacked';
const manifest = read(path.join(unpacked, 'extraction-manifest.json'));
const rows = read(path.join(unpacked, 'string-inventory.json'));
const targets = read(path.join(root, 'Documentation/uk/source-discovery.json')).unsupportedStructuredAssets;
if (manifest.failures.length || JSON.stringify(manifest.results.map(r => r.target)) !== JSON.stringify(targets))
  throw Error('Incomplete structured extraction');
const expected = new Map();
const escape = key => key.replaceAll('~', '~0').replaceAll('/', '~1');
function flatten(value, target, pointer = '') {
  if (typeof value === 'string') expected.set(target + '\0' + pointer, value);
  else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value))
    flatten(child, target, pointer + '/' + escape(key));
}
for (const asset of manifest.results) {
  if (hash(fs.readFileSync(path.join(manifest.contentRoot, asset.target + '.xnb'))) !== asset.sourceSHA256)
    throw Error(`Stale extraction: ${asset.target}`);
  flatten(read(path.join(unpacked, asset.target + '.json')), asset.target);
}
for (const row of rows) {
  const key = row.target + '\0' + row.pointer;
  if (!expected.has(key) || expected.get(key) !== row.text) throw Error(`Duplicate or incorrect string leaf: ${key}`);
  expected.delete(key);
}
if (expected.size) throw Error(`Uninventoried serialized string leaves: ${expected.size}`);

const source = new Map();
function sourceContent(target) {
  if (!source.has(target)) source.set(target, read(path.join(sourceRoot, target + '.json')).content);
  return source.get(target);
}
const unresolved = [];
let directReferences = 0, specialOrderReferences = 0, bundleReferences = 0;
const visibleFields = new Set(['DisplayName', 'Description', 'Text', 'Dialogue', 'RandomDialogue',
  'ShopDisplayName', 'ShopDescription', 'ShopMissingBuildingDescription', 'BirthText', 'FromDisplayName',
  'InvalidCountMessage', 'InvalidItemMessage', 'ChestFullMessage', 'RewardDialogue', 'Title', 'StartMessage',
  'ScrollText', 'ClosedMessage', 'DeniedMessage', 'FriendsAndFamily', 'NameForGeneralType', 'TextStrings', 'TooltipStringPath']);
const visibleNameClasses = new Set(['Buildings.BuildingData', 'Buildings.BuildingSkin', 'JukeboxTrackData', 'SpecialOrders.SpecialOrderData']);
const candidates = [];
for (const row of rows) {
  for (const match of row.text.matchAll(/(?:Strings|Characters)[\\/][^:\s\]"']+:[^\s\]"']+/g)) {
    const reference = match[0].replaceAll(/\\+/g, '/');
    const colon = reference.indexOf(':');
    const target = reference.slice(0, colon), key = reference.slice(colon + 1);
    directReferences++;
    if (!Object.hasOwn(sourceContent(target), key)) unresolved.push({ ...row, reference });
  }
  if (row.target === 'Data/SpecialOrders') for (const [, key] of row.text.matchAll(/\[([^\[\]]+)\]/g)) {
    specialOrderReferences++;
    if (!Object.hasOwn(sourceContent('Strings/SpecialOrderStrings'), key)) unresolved.push({ ...row, reference: key });
  }
  if (row.member.endsWith('Bundles.BundleData.Name')) {
    bundleReferences++;
    const mapped = Object.hasOwn(sourceContent('Strings/BundleNames'), row.text)
      || Object.values(sourceContent('Data/Bundles')).some(value => value.split('/')[0] === row.text);
    if (!mapped) unresolved.push({ ...row, reference: row.text });
  }
  const member = row.member.replace(/^[FP]:StardewValley.GameData\./, '');
  const dot = member.lastIndexOf('.'), field = member.slice(dot + 1), type = member.slice(0, dot);
  if (!visibleFields.has(field) && !(field === 'Name' && visibleNameClasses.has(type))) continue;
  if (!row.text || /(?:Strings|Characters)[\\/]/.test(row.text)) continue;
  if (row.target === 'Data/SpecialOrders' && /^\[[^\]]+\]$/.test(row.text)) continue;
  candidates.push({ target: row.target, pointer: row.pointer, english: row.text,
    sourceSHA256: hash(row.text), member: row.member, documentation: row.documentation });
}
const report = {
  schemaVersion: 1, gameDataVersion: manifest.gameDataVersion,
  extractor: 'Scripts/uk-extract-structured/UkExtract.csproj',
  extractedAssets: manifest.results.length, stringLeaves: rows.length,
  unrecordedLeaves: expected.size, directReferences, specialOrderReferences, bundleReferences,
  unresolved, candidates,
  scope: 'All serialized string leaves in the 49 structured Data assets are inventoried. Reference counts are occurrences, not additional translation records. Candidate fields require a reviewed translation or an explicit preservation reason. This does not certify coverage outside these assets.',
  assets: manifest.results.map(asset => ({ ...asset,
    extractedJSONSHA256: hash(fs.readFileSync(path.join(unpacked, asset.target + '.json'))) })),
};
fs.writeFileSync(path.join(root, 'Documentation/uk/structured-source-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ assets: report.extractedAssets, leaves: rows.length, directReferences,
  specialOrderReferences, bundleReferences, unresolved: unresolved.length, candidates }, null, 2));
process.exitCode = unresolved.length ? 1 : 0;
