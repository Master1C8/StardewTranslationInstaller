#!/usr/bin/env node
// Deterministic packaging of directly authored, reviewed wording. No translation generation.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const state=path.join(root,'Documentation/uk');
const destination=path.join(root,'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/ukrainian');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const glossary=read(path.join(root,'Documentation/glossary/glossary.uk.json')).uk;
const canonical=read('/Users/antonkrutov/Desktop/SiteForMods/data/games/stardew-valley/glossary-translations.json').uk;
if(JSON.stringify(glossary)!==JSON.stringify(canonical)) throw Error('Ukrainian glossary snapshot differs from canonical SiteForMods');
const glossarySHA256=hash(JSON.stringify(glossary));
const inventory=read(path.join(state,'source-inventory.json'));
const source=new Map(inventory.assets.flatMap(a=>a.records.map(r=>[a.target+'\0'+r.key,r.sourceSHA256])));
const staged=new Map();
const seen=new Set();
for(const filename of fs.readdirSync(path.join(state,'batches')).filter(f=>f.endsWith('.json')).sort()) {
  const batch=read(path.join(state,'batches',filename));
  if(batch.audit?.glossarySHA256!==glossarySHA256) throw Error(`Glossary review invalidated: ${filename}`);
  if(batch.audit?.reviewedTextSHA256!==hash(JSON.stringify(batch.records.map(r=>[r.target,r.key,r.translation])))) throw Error(`Review fingerprint mismatch: ${filename}`);
  for(const r of batch.records) {
    if(r.reviewed!==true) continue;
    const id=r.target+'\0'+r.key;
    if(seen.has(id)||source.get(id)!==hash(r.english)) throw Error(`Duplicate/stale source: ${id}`);
    if(typeof r.translation!=='string'||r.translation!==r.translation.normalize('NFC')||(/[\uFFFD\u200B\u202A-\u202E\u2066-\u2069]/u.test(r.translation))) throw Error(`Invalid text: ${id}`);
    if(r.english===r.translation&&!r.preserveReason) throw Error(`Unjustified preservation: ${id}`);
    const placeholders=text=>(text.match(/\{\d+(?:[^{}]*)\}/g)??[]).sort();
    if(JSON.stringify(placeholders(r.english))!==JSON.stringify(placeholders(r.translation))) throw Error(`Format placeholder mismatch: ${id}`);
    // Mood/control markers are one letter or a numeric emote. Keep command
    // names separate so a following structured-response identifier like
    // `$s_Intentions_` isn't mistaken for one long runtime token.
    const markers=text=>(text.match(/\$(?:query|d|c|q|r|p|y|1)(?=\s)|\$[A-Za-z](?=[^A-Za-z0-9]|$)|\$\d+(?=[^A-Za-z0-9]|$)|[@#^|%<>*]/g)??[]).sort();
    if(JSON.stringify(markers(r.english))!==JSON.stringify(markers(r.translation))) throw Error(`Basic control marker mismatch: ${id}`);
    const structuredMarkers=text=>(text.match(/\[[^\]\r\n]+\]|https?:\/\/[^\s]+/g)??[]).sort();
    if(JSON.stringify(structuredMarkers(r.english))!==JSON.stringify(structuredMarkers(r.translation))) throw Error(`Structured control marker mismatch: ${id}`);
    // Gender/variant macros contain translatable player-facing branches. Keep
    // their wrapper and branch separators stable while allowing branch text
    // itself to be localized.
    const variantMacros=text=>(text.match(/\$\{[^}\r\n]+\}\$/g)??[]).map(value=>value.match(/[\^¦]/g)??[]);
    if(JSON.stringify(variantMacros(r.english))!==JSON.stringify(variantMacros(r.translation))) throw Error(`Variant macro mismatch: ${id}`);
    const runtimeTokens=text=>(text.match(/%[a-z][A-Za-z0-9_]*|\$(?:query|d|c|q|r|1) [^#\r\n]*#/g)??[]).sort();
    if(JSON.stringify(runtimeTokens(r.english))!==JSON.stringify(runtimeTokens(r.translation))) throw Error(`Runtime token mismatch: ${id}`);
    const responseIds=text=>(text.match(/_[A-Za-z][A-Za-z0-9]*_/g)??[]).sort();
    if(JSON.stringify(responseIds(r.english))!==JSON.stringify(responseIds(r.translation))) throw Error(`Dialogue response identifier mismatch: ${id}`);
    if(r.target==='Data/Boots') {
      const englishParts=r.english.split('/');
      const translatedParts=r.translation.split('/');
      if(englishParts.length!==7||translatedParts.length!==7||JSON.stringify(englishParts.slice(2,6))!==JSON.stringify(translatedParts.slice(2,6))||translatedParts[0]!==translatedParts[6]) throw Error(`Boot record format mismatch: ${id}`);
    }
    if(r.target==='Data/Achievements') {
      const englishParts=r.english.split('^');
      const translatedParts=r.translation.split('^');
      if(englishParts.length!==5||translatedParts.length!==5||JSON.stringify(englishParts.slice(2))!==JSON.stringify(translatedParts.slice(2))) throw Error(`Achievement record format mismatch: ${id}`);
    }
    if(r.target==='Data/Fish') {
      const englishParts=r.english.split('/');
      const translatedParts=r.translation.split('/');
      if(translatedParts.length!==englishParts.length||JSON.stringify(englishParts.slice(1))!==JSON.stringify(translatedParts.slice(1))) throw Error(`Fish record format mismatch: ${id}`);
    }
    if(r.target==='Data/Monsters') {
      const englishParts=r.english.split('/');
      const translatedParts=r.translation.split('/');
      if(translatedParts.length!==englishParts.length||JSON.stringify(englishParts.slice(0,-1))!==JSON.stringify(translatedParts.slice(0,-1))) throw Error(`Monster record format mismatch: ${id}`);
    }
    if(r.target==='Data/hats') {
      const englishParts=r.english.split('/');
      const translatedParts=r.translation.split('/');
      if(![6,7].includes(englishParts.length)||translatedParts.length!==englishParts.length
        || translatedParts[0]!==translatedParts[5]
        || JSON.stringify(translatedParts.slice(2,5))!==JSON.stringify(englishParts.slice(2,5))
        || (englishParts.length===7&&translatedParts[6]!==englishParts[6])) throw Error(`Hat record format mismatch: ${id}`);
    }
    if(r.target==='Data/TV/CookingChannel') {
      if(r.english.split('/').length!==2||r.translation.split('/').length!==2) throw Error(`Cooking channel record format mismatch: ${id}`);
    }
    if(r.target==='Data/Bundles') {
      const englishParts=r.english.split('/');
      const translatedParts=r.translation.split('/');
      if(englishParts.length!==7||translatedParts.length!==7||JSON.stringify(englishParts.slice(1,-1))!==JSON.stringify(translatedParts.slice(1,-1))||translatedParts[0]!==translatedParts[6]) throw Error(`Bundle record format mismatch: ${id}`);
    }
    if(r.target==='Data/SecretNotes') {
      const revealTokens=text=>(text.match(/%revealtaste:[^%^]+/g)??[]);
      if(JSON.stringify(revealTokens(r.english))!==JSON.stringify(revealTokens(r.translation))) throw Error(`Secret note reveal-token mismatch: ${id}`);
      if(/^!image \d+$/.test(r.english)&&r.translation!==r.english) throw Error(`Secret note image directive mismatch: ${id}`);
    }
    if(r.target==='Data/Quests') {
      const englishParts=r.english.split('/');
      const translatedParts=r.translation.split('/');
      const technicalEnd=englishParts.length===10?9:englishParts.length;
      if(![9,10].includes(englishParts.length)||translatedParts.length!==englishParts.length||translatedParts[0]!==englishParts[0]||JSON.stringify(translatedParts.slice(4,technicalEnd))!==JSON.stringify(englishParts.slice(4,technicalEnd))) throw Error(`Quest record format mismatch: ${id}`);
    }
    if(r.target==='Characters/Dialogue/Gus'&&r.key==='SeedShop_Entry') {
      const englishParts=r.english.split('/');
      const translatedParts=r.translation.split('/');
      if(englishParts.length!==6||translatedParts.length!==englishParts.length||translatedParts.some(part=>part.length===0)) throw Error(`Dialogue alternative format mismatch: ${id}`);
    }
    if(r.target==='Characters/Dialogue/Caroline'&&r.key==='houseUpgrade_1') {
      const englishParts=r.english.split('_');
      const translatedParts=r.translation.split('_');
      if(englishParts.length!==5||translatedParts.length!==englishParts.length||translatedParts.some(part=>part.length===0)||!r.translation.startsWith("$y '")||!r.translation.endsWith("'")) throw Error(`Dialogue choice format mismatch: ${id}`);
    }
    if(r.target.startsWith('Data/Events/')) {
      const quotedStrings=text=>(text.match(/"(?:\\.|[^"\\])*"/g)??[]);
      const maskEventText=text=>text
        .replace(/"(?:\\.|[^"\\])*"/g,'"<TEXT>"')
        .replace(/quickQuestion ([\s\S]*?)(?=\(break\))/g,(_match,payload)=>`quickQuestion <TEXT:${(payload.match(/#/g)??[]).length}>`);
      if(quotedStrings(r.english).length!==quotedStrings(r.translation).length||maskEventText(r.english)!==maskEventText(r.translation)) throw Error(`Event command format mismatch: ${id}`);
    }
    seen.add(id);
    if(!staged.has(r.target)) staged.set(r.target,{});
    const patch=staged.get(r.target);
    if(inventory.assets.find(a=>a.target===r.target)?.kind==='structured') {
      const parts=r.key.split('/').slice(1).map(value=>value.replaceAll('~1','/').replaceAll('~0','~'));
      if(!r.key.startsWith('/')||parts.length!==2) throw Error(`Unsupported field depth: ${id}`);
      patch.Fields??={}; patch.Fields[parts[0]]??={}; patch.Fields[parts[0]][parts[1]]=r.translation;
    } else {
      patch.Entries??={}; patch.Entries[r.key]=r.translation;
    }
  }
}
const files=new Map([...staged].map(([Target,values])=>[Target.replaceAll('/','__')+'.json',JSON.stringify({Changes:[{Action:'EditData',Target,When:{Language:'uk-vnrevival'},...values}]},null,2)+'\n']));
fs.mkdirSync(destination,{recursive:true});
for(const filename of fs.readdirSync(destination)) if(!files.has(filename)) throw Error(`Unmanaged translation file: ${filename}`);
for(const [filename,text] of files) fs.writeFileSync(path.join(destination,filename),text);
console.log(`Packaged ${seen.size} reviewed records in ${files.size} Ukrainian draft includes. Locale registration and release audits remain pending.`);
