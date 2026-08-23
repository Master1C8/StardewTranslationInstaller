import fs from "node:fs";
const c=JSON.parse(fs.readFileSync("work/StardewTranslationInstaller/ml-translation-cache.json")).entries;
const rows=Object.entries(c).filter(([id])=>id.startsWith("Data/animationDescriptions\0"));
if(rows.length!==105)throw new Error(`expected 105, got ${rows.length}`);
const technicalWord=/^(silent|laying_down|offset|Strings\\animationDescriptions:[A-Za-z0-9_]+)$/;
for(const [id,e] of rows){for(const token of e.englishValue.split(/[\/\s]+/).filter(Boolean)){if(!/^-?\d+(?:\.\d+)?$/.test(token)&&!technicalWord.test(token))throw new Error(`visible/prose token ${token} in ${id}`);}}
const out=Object.fromEntries(rows.map(([id,e])=>[id,e.englishValue]));fs.writeFileSync("work/StardewTranslationInstaller/ml-batches/technical-identities-animation-001.json",JSON.stringify(out,null,2)+"\n");console.log(Object.keys(out).length);
