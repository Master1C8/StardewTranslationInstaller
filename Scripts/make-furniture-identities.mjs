import fs from "node:fs";
const c=JSON.parse(fs.readFileSync("work/StardewTranslationInstaller/ml-translation-cache.json")).entries;
const rows=Object.entries(c).filter(([id])=>id.startsWith("Data/Furniture\0"));
if(rows.length!==645)throw new Error(`expected 645, got ${rows.length}`);
for(const [id,e] of rows){if(!/\[LocalizedText Strings\\Furniture:[^\]]+\]/.test(e.englishValue))throw new Error(`missing LocalizedText: ${id}`);}
const out=Object.fromEntries(rows.map(([id,e])=>[id,e.englishValue]));fs.writeFileSync("work/StardewTranslationInstaller/ml-batches/technical-identities-furniture-001.json",JSON.stringify(out,null,2)+"\n");console.log(Object.keys(out).length);
