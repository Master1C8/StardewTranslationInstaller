import fs from "node:fs";

const cacheFile = "work/StardewTranslationInstaller/ml-translation-cache.json";
const workFile = "work/StardewTranslationInstaller/ml-npc-gift-tastes-work.json";
const cache = JSON.parse(fs.readFileSync(cacheFile)).entries;
const npc = Object.fromEntries(Object.entries(cache).filter(([id]) => id.startsWith("Data/NPCGiftTastes\0") && !id.includes("Universal_")));

function extract() {
  const records = {};
  for (const [stableId, entry] of Object.entries(npc)) {
    const fields = entry.englishValue.split("/");
    if (fields.length !== 11 || fields[10] !== "") throw new Error(`unexpected schema for ${stableId}: ${fields.length} slash fields`);
    const text = [fields[0], fields[2], fields[4], fields[6], fields[8]];
    const codes = [fields[1], fields[3], fields[5], fields[7], fields[9]];
    records[stableId] = { target: entry.target, key: entry.key, scaffoldFile: entry.scaffoldFile, englishReplies: text, immutableCodeFields: codes, trailingEmptyField: true };
  }
  fs.writeFileSync(workFile, `${JSON.stringify({ schema: "Data/NPCGiftTastes: text/code alternating fields", count: Object.keys(records).length, records }, null, 2)}\n`);
  console.log(`extracted ${Object.keys(records).length} records to ${workFile}`);
}
function assemble() {
  const work = JSON.parse(fs.readFileSync(workFile));
  const translations = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
  const out = {};
  for (const [stableId, row] of Object.entries(work.records)) {
    const translated = translations[stableId];
    if (!Array.isArray(translated) || translated.length !== 5) throw new Error(`missing five translated replies: ${stableId}`);
    const fields = [];
    for (let i = 0; i < 5; i++) fields.push(translated[i], row.immutableCodeFields[i]);
    fields.push("");
    const value = fields.join("/");
    if (value.split("/").length !== 11 || fields.filter((_, i) => i % 2 === 1).some((v, i) => v !== row.immutableCodeFields[i])) throw new Error(`separator/code validation failed: ${stableId}`);
    out[stableId] = value;
  }
  fs.writeFileSync("work/StardewTranslationInstaller/ml-npc-gift-tastes-assembled.json", `${JSON.stringify(out, null, 2)}\n`);
}
if (process.argv.includes("--extract")) extract();
else if (process.argv[2] === "--assemble" && process.argv[3]) assemble();
else console.error("Usage: node Scripts/extract-npc-gift-taste-text.mjs --extract | --assemble <translations.json>");
