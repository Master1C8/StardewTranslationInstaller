import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const cache = JSON.parse(fs.readFileSync(path.join(projectRoot, "ml-translation-cache.json"), "utf8"));
const outputPath = path.join(projectRoot, "ml-batches/technical-identities-001.json");
const targets = new Set(["Data/PaintData", "Data/ChairTiles"]);
const delta = {};

for (const [stable, entry] of Object.entries(cache.entries)) {
  if (!targets.has(entry.target)) continue;
  if (entry.target === "Data/PaintData" && !/^(?:Building|Roof|Trim)\//.test(entry.englishValue)) {
    throw new Error(`unexpected PaintData code: ${stable}`);
  }
  if (entry.target === "Data/ChairTiles" && !/^\d+\/\d+\/[a-z]+\/[a-z_ ]+\/-?\d+\/-?\d+\/(?:true|false)$/.test(entry.englishValue)) {
    throw new Error(`unexpected ChairTiles code: ${stable}`);
  }
  delta[stable] = entry.englishValue;
}

if (Object.keys(delta).length !== 72) throw new Error(`expected 72 technical identities, got ${Object.keys(delta).length}`);
fs.writeFileSync(outputPath, `${JSON.stringify(delta, null, 2)}\n`);
console.log(`wrote ${outputPath} (${Object.keys(delta).length} entries)`);
