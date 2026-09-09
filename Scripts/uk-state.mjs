#!/usr/bin/env node
// Inventory and validation only. All Ukrainian wording is authored by the model.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const state = path.join(root, 'Documentation/uk');
const sourceRoot = process.env.STARDEW_UK_ENGLISH_ROOT
  ?? '/Users/antonkrutov/Developer/data/stardew-english-unpacked';
const structuredRoot = process.env.STARDEW_UK_STRUCTURED_ROOT ?? '/private/tmp/stardew-uk-structured-unpacked';
const translationRoot = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/ukrainian');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(item => {
    const file = path.join(dir, item.name);
    return item.isDirectory() ? files(file) : file.endsWith('.json') ? [file] : [];
  }).sort();
}
const command = process.argv[2] ?? 'status';
if (command === 'inventory') {
  const assets = files(sourceRoot).map(file => {
    const content = read(file).content;
    const records = Object.entries(content).map(([key, value]) => {
      if (typeof value !== 'string') throw Error(`Unclassified source: ${file}:${key}`);
      return {key, sourceSHA256:hash(value)};
    });
    return {target:path.relative(sourceRoot,file).replace(/\.json$/, ''), kind:'dictionary',
      contentSHA256:hash(JSON.stringify(content)), records};
  });
  const structured = read(path.join(state, 'structured-source-audit.json'));
  for (const candidate of structured.candidates) {
    let asset = assets.find(a => a.target === candidate.target);
    if (!asset) {
      asset = {target:candidate.target,kind:'structured',contentSHA256:hash(JSON.stringify(read(path.join(structuredRoot,candidate.target+'.json')))),records:[]};
      assets.push(asset);
    }
    if (asset.kind !== 'structured') throw Error(`Overlapping source targets: ${candidate.target}`);
    asset.records.push({key:candidate.pointer,sourceSHA256:candidate.sourceSHA256});
  }
  const inventory = {schemaVersion:2, locale:'uk', sourceRoot, structuredRoot,
    scope:'All entries in the verified English extraction; no entry excluded by appearance or script.',
    assets, totalRecords:assets.reduce((n,a) => n+a.records.length,0)};
  inventory.fingerprint = hash(JSON.stringify(assets));
  save(path.join(state,'source-inventory.json'),inventory);
  console.log(JSON.stringify({assets:assets.length,records:inventory.totalRecords,fingerprint:inventory.fingerprint}));
} else if (command === 'glossary') {
  const en = read(path.join(root,'Documentation/glossary/glossary.en.json'));
  const doc = read(path.join(root,'Documentation/glossary/glossary.uk.json'));
  const errors = [];
  if (JSON.stringify(Object.keys(doc)) !== '["uk"]') errors.push('Unexpected locale layer');
  const uk = doc.uk ?? {};
  if (JSON.stringify(Object.keys(uk)) !== JSON.stringify(en.map(e=>e.id))) errors.push('ID set/order mismatch');
  for (const e of en) {
    const item = uk[e.id];
    if (!item || JSON.stringify(Object.keys(item).sort()) !== '["meaning","term"]') {
      errors.push(`Fields: ${e.id}`); continue;
    }
    for (const [field,value] of Object.entries(item)) {
      if (typeof value !== 'string' || !value.trim() || value !== value.normalize('NFC')
        || /[\uFFFD\u200B\u202A-\u202E\u2066-\u2069]/u.test(value)) errors.push(`Invalid text: ${e.id}.${field}`);
      if (/[ыэъёЫЭЪЁ]/u.test(value)) errors.push(`Non-Ukrainian letter: ${e.id}.${field}`);
    }
  }
  const report = {locale:'uk',entries:Object.keys(uk).length,errors,
    fingerprint:hash(JSON.stringify(uk)),editorialQuality:'Requires recorded full human/model reading; this check does not establish quality.'};
  save(path.join(state,'glossary-structural-audit.json'),report);
  console.log(JSON.stringify(report,null,2));
  process.exitCode = errors.length ? 1 : 0;
} else if (command === 'status') {
  const inventory = read(path.join(state,'source-inventory.json'));
  const batches = files(path.join(state,'batches')).map(read);
  const source = new Map(inventory.assets.flatMap(a=>a.records.map(r=>[a.target+'\0'+r.key,r.sourceSHA256])));
  const reviewed = new Map();
  const errors = [];
  for (const asset of inventory.assets) {
    const content = asset.kind === 'structured' ? read(path.join(structuredRoot,asset.target+'.json')) : read(path.join(sourceRoot,asset.target+'.json')).content;
    if (hash(JSON.stringify(content)) !== asset.contentSHA256) errors.push(`Changed source asset: ${asset.target}`);
  }
  for (const batch of batches) for (const r of batch.records ?? []) {
    const id=r.target+'\0'+r.key;
    if (source.get(id)!==hash(r.english)) {errors.push(`Stale or unknown source: ${id}`);continue;}
    if (r.reviewed!==true || typeof r.translation!=='string') continue;
    if (batch.audit?.reviewedTextSHA256 !== hash(JSON.stringify(batch.records.map(x=>[x.target,x.key,x.translation])))) {
      errors.push(`Review invalidated by changed wording: ${batch.id}`); continue;
    }
    if (r.translation===r.english && !r.preserveReason) {errors.push(`Unjustified preservation: ${id}`);continue;}
    if (reviewed.has(id)) errors.push(`Duplicate reviewed record: ${id}`);
    reviewed.set(id,r);
  }
  const installedText = new Map();
  for (const file of files(translationRoot)) {
    const document=read(file);
    if (document.Format || !Array.isArray(document.Changes) || !document.Changes.length) {errors.push(`Invalid include: ${file}`);continue;}
    for (const patch of document.Changes) {
      if (patch.Action!=='EditData' || patch.When?.Language!=='uk-vnrevival') {errors.push(`Invalid locale gate/action: ${file}`);continue;}
      for (const [key,value] of Object.entries(patch.Entries ?? {})) {
        const id=patch.Target+'\0'+key;
        if (installedText.has(id)) errors.push(`Duplicate patch key: ${id}`);
        installedText.set(id,value);
      }
      const escape=value=>value.replaceAll('~','~0').replaceAll('/','~1');
      for (const [entry,fields] of Object.entries(patch.Fields ?? {})) for (const [field,value] of Object.entries(fields)) {
        const id=patch.Target+'\0/'+escape(entry)+'/'+escape(field);
        if (installedText.has(id)) errors.push(`Duplicate patch field: ${id}`);
        installedText.set(id,value);
      }
    }
  }
  for (const [id,r] of reviewed) if (installedText.get(id)!==r.translation) errors.push(`Reviewed text missing/different in patch: ${id}`);
  for (const [id,value] of installedText) if (reviewed.get(id)?.translation!==value) errors.push(`Unreviewed or changed patch: ${id}`);
  const fraction=reviewed.size/inventory.totalRecords*100;
  const releaseAuditFile=path.join(state,'release-audit.json');
  const releaseAudit=fs.existsSync(releaseAuditFile)?read(releaseAuditFile):null;
  const releaseReady=fraction===100&&errors.length===0&&releaseAudit?.errors?.length===0
    &&releaseAudit?.records===inventory.totalRecords&&releaseAudit?.runtimeIncludes===191;
  const report={locale:'uk',total:inventory.totalRecords,reviewed:reviewed.size,
    unreviewed:inventory.totalRecords-reviewed.size,coveragePercent:Number(fraction.toFixed(3)),
    releaseReady,errors};
  save(path.join(state,'coverage.json'),report);
  console.log(JSON.stringify(report,null,2));
  process.exitCode=errors.length?1:0;
} else throw Error('Usage: node Scripts/uk-state.mjs inventory|glossary|status');
