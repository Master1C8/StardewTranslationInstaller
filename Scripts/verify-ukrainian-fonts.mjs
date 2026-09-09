#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const align = args[0] === '--align-punctuation';
if (align) args.shift();
if (args.length !== 2) throw new Error('Usage: verify-ukrainian-fonts.mjs [--align-punctuation] <unpacked-dir> <base-unpacked-dir>');
const [unpacked, base] = args.map(value => path.resolve(value));
const required = new Set('АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгґдеєжзиіїйклмнопрстуфхцчшщьюя’ʼ«»–—…');

function collect(value) {
  if (typeof value === 'string') {
    for (const char of value.normalize('NFC')) if (!/\s/u.test(char)) required.add(char);
  } else if (value && typeof value === 'object') {
    for (const child of Object.values(value)) collect(child);
  }
}
function collectDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) collectDirectory(filename);
    else if (entry.name.endsWith('.json')) collect(JSON.parse(fs.readFileSync(filename, 'utf8')));
  }
}
collect(JSON.parse(fs.readFileSync(path.join(root, 'Documentation/glossary/glossary.uk.json'), 'utf8')));
collectDirectory(path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/ukrainian'));

for (const name of ['SpriteFont1', 'SmallFont']) {
  const filename = path.join(unpacked, `${name}.json`);
  const document = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const original = JSON.parse(fs.readFileSync(path.join(base, `${name}.json`), 'utf8')).content;
  const c = document.content;
  const lists = ['characterMap', 'glyphs', 'cropping', 'kerning'];
  if (!c || !lists.every(key => Array.isArray(c[key])) || c.characterMap.length === 0
    || !lists.every(key => c[key].length === c.characterMap.length)) {
    throw new Error(`${name}: missing or unaligned SpriteFont metadata`);
  }
  const available = new Set(c.characterMap);
  const missing = [...new Set([...required, ...original.characterMap])].filter(char => !available.has(char));
  if (missing.length) throw new Error(`${name}: missing ${JSON.stringify(missing)}`);
  for (let i = 0; i < c.characterMap.length; i++) {
    const char = c.characterMap[i];
    if ([...char].length !== 1 || char.codePointAt(0) > 0xffff
      || (i && c.characterMap[i - 1].codePointAt(0) >= char.codePointAt(0))) {
      throw new Error(`${name}: invalid or unsorted character at ${i}`);
    }
  }

  // The shared generator centers new glyphs vertically. Apostrophes belong
  // at the top of the letter, while ellipsis belongs on the period baseline.
  for (const [char, reference] of [['’', "'"], ['ʼ', "'"], ['…', '.']]) {
    if (original.characterMap.includes(char)) continue;
    const index = c.characterMap.indexOf(char);
    const ref = original.characterMap.indexOf(reference);
    if (index < 0 || ref < 0) throw new Error(`${name}: missing punctuation reference`);
    const expectedY = reference === '.'
      ? original.cropping[ref].y + original.glyphs[ref].height - c.glyphs[index].height
      : original.cropping[ref].y;
    if (align) c.cropping[index].y = expectedY;
    if (c.cropping[index].y !== expectedY || expectedY < 0) throw new Error(`${name}: misplaced ${char}`);
  }
  const png = fs.readFileSync(path.join(unpacked, `${name}.png`));
  if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${name}: invalid texture`);
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  for (const [i, glyph] of c.glyphs.entries()) {
    if (!['x', 'y', 'width', 'height'].every(k => Number.isInteger(glyph[k]))
      || glyph.x < 0 || glyph.y < 0 || glyph.width <= 0 || glyph.height <= 0
      || glyph.x + glyph.width > width || glyph.y + glyph.height > height) {
      throw new Error(`${name}: glyph ${i} is outside its texture`);
    }
  }
  // Sorting may change indices, but each retained letter must keep its own
  // dimensions, placement on the line, and advance metrics.
  const equal = (a, b) => Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(key => a[key] === b[key]);
  for (const [i, char] of original.characterMap.entries()) {
    const j = c.characterMap.indexOf(char);
    if (!equal(original.cropping[i], c.cropping[j]) || !equal(original.kerning[i], c.kerning[j])
      || original.glyphs[i].width !== c.glyphs[j].width || original.glyphs[i].height !== c.glyphs[j].height) {
      throw new Error(`${name}: altered original metrics for ${JSON.stringify(char)}`);
    }
  }
  if (c.verticalLineSpacing !== original.verticalLineSpacing || c.horizontalSpacing !== original.horizontalSpacing
    || c.defaultCharacter !== original.defaultCharacter) throw new Error(`${name}: altered base spacing/default character`);
  // Keep the original property order: the pinned XNB writer depends on it.
  if (align) fs.writeFileSync(filename, JSON.stringify(document, null, 2) + '\n');
  console.log(`${name}: ${c.characterMap.length} sorted glyphs, ${required.size} required characters present, original metrics preserved`);
}
