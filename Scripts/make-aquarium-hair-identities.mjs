import fs from "node:fs";
const c=JSON.parse(fs.readFileSync("work/StardewTranslationInstaller/ml-translation-cache.json")).entries;
const rows=Object.entries(c).filter(([id])=>id.startsWith("Data/AquariumFish\0")||id.startsWith("Data/HairData\0"));
const visible=/[A-Za-z]{3,}\s+[A-Za-z]/;
const excluded=rows.filter(([,e])=>visible.test(e.englishValue));
if(excluded.length)throw new Error(`visible strings: ${excluded.map(([id])=>id).join(", ")}`);
const out=Object.fromEntries(rows.map(([id,e])=>[id,e.englishValue]));
if(Object.keys(out).length!==95)throw new Error(`expected 95 (72 AquariumFish + 23 HairData), got ${Object.keys(out).length}`);
fs.writeFileSync("work/StardewTranslationInstaller/ml-batches/technical-identities-aquarium-hair-001.json",JSON.stringify(out,null,2)+"\n");console.log(Object.keys(out).length);
