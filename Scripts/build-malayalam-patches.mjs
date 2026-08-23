import fs from "node:fs";
import path from "node:path";
import {
  buildClusterDocument,
  encodeMalayalam,
  mapsFromDocument,
} from "./malayalam-clusters.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const workRoot = projectRoot;
const manifestFile = path.join(workRoot, "ml-scaffold-manifest.json");
const cacheFile = path.join(workRoot, "ml-translation-cache.json");
const polishRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/polish");
const outputRoot = path.join(projectRoot, "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/malayalam");
const clusterMapFile = path.join(projectRoot, "Documentation/malayalam-cluster-map.json");

function allJSON(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? allJSON(file) : [file];
  }).filter((file) => file.endsWith(".json")).sort();
}
function sortedMatches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}
function count(value, character) {
  return [...value].filter((item) => item === character).length;
}
function withoutGenderBranches(value) {
  return value.replace(/\$\{[^{}]*\^[^{}]*\}\$/g, "");
}
function markerSignature(value) {
  return {
    contentPatcher: sortedMatches(value, /\{\{[^}]+\}\}/g),
    substitutions: sortedMatches(value, /\{[A-Za-z0-9_]+(?::[A-Za-z0-9_]+)*\}/g),
    brackets: sortedMatches(value, /\[(?:#|image|textcolor|letterbg|LocalizedText|FarmerStat|HOURS|MINUTES|DAY_OF|\d)[^\]]*\]/g),
    percent: sortedMatches(value, /%[a-z][A-Za-z0-9_]*/g),
    dollar: sortedMatches(value, /\$[A-Za-z0-9]+/g),
    typedItems: sortedMatches(value, /\([A-Z]+\)[A-Za-z0-9_]+/g),
    urls: sortedMatches(value, /https?:\/\/[^\s)]+/g),
    at: count(value, "@"),
    hash: count(value, "#"),
    caret: count(withoutGenderBranches(value), "^"),
    pipe: count(value, "|"),
    underscore: count(value, "_"),
    backslash: count(value, "\\"),
    newline: count(value, "\n"),
  };
}
function cacheEntries() {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  if (manifest.count !== 14720 || manifest.rows.length !== 14720) throw new Error("manifest must contain exactly 14720 rows");
  const entries = {};
  for (const row of manifest.rows) {
    const stable = `${row.target}\u0000${row.key}`;
    if (entries[stable]) throw new Error(`duplicate manifest key: ${stable}`);
    entries[stable] = {
      target: row.target,
      key: row.key,
      scaffoldFile: row.scaffoldFile,
      englishValue: row.englishValue,
      translation: "",
    };
  }
  return entries;
}
function writeCache() {
  const entries = cacheEntries();
  fs.writeFileSync(cacheFile, `${JSON.stringify({ targetLocale: "ml-vnrevival", count: Object.keys(entries).length, entries }, null, 2)}\n`);
  console.log(`wrote ${cacheFile} (${Object.keys(entries).length} entries)`);
}
function properNameOrCode(value) {
  return !/[A-Za-z]/.test(value)
    || /^[A-Z][A-Za-z0-9 .,'’&-]*$/.test(value) && !/[a-z]{3,}/.test(value)
    || /^[A-Z]{2,}(?:[-_][A-Z0-9]+)*$/.test(value)
    || /^\{[^{}]+\}$/.test(value);
}
const exactIdentityAllowlist = new Set([
  "Characters/Dialogue/Abigail\u0000Event_Tragic_2",
  "Characters/Dialogue/Emily\u0000dumped_Girls",
  "Characters/Dialogue/Jas\u0000Wed",
  "Characters/Dialogue/Maru\u0000event_robot4",
  "Characters/Dialogue/Sam\u0000dumped_Guys",
  "Data/Bundles\u0000Vault/23",
  "Data/Bundles\u0000Vault/24",
  "Data/Bundles\u0000Vault/25",
  "Data/Bundles\u0000Vault/26",
  "Data/Events/BathHouse_Pool\u0000pennyHeartbroken",
  "Data/Events/Beach\u00007771191/t 2000 2500/f Krobus 3500/w sunny",
  "Data/Events/BusStop\u0000520702/a 11 23 11 24/t 600 1600/z spring/z fall/z summer",
  "Data/Events/DesertFestival\u0000PlayerKilled",
  "Data/Events/Farm\u00002146991/y 3/H",
  "Data/Events/IslandSouth\u0000IslandDepart",
  "Data/Events/LeahHouse\u0000creepySexualPass",
  "Data/hats\u000092",
  "Strings/1_6_Strings\u0000Gil_Rating_50",
  "Strings/1_6_Strings\u0000Scholar_Question_2_2_Answers",
  "Strings/Locations\u0000MineCart_DestinationWithPrice",
  "Strings/Objects\u0000DeluxeSpeedGro_Name",
  "Strings/Objects\u0000HyperSpeedGro_Name",
  "Strings/Objects\u0000SpeedGro_Name",
  "Strings/StringsFromCSFiles\u0000GameLocation.cs.8214",
  "Strings/StringsFromCSFiles\u0000LoadGameMenu.cs.11020",
  "Strings/UI\u0000Options_Vsync",
  "Data/AquariumFish\u0000397",
  "Data/NPCGiftTastes\u0000Universal_Love",
  "Data/NPCGiftTastes\u0000Universal_Like",
  "Data/NPCGiftTastes\u0000Universal_Neutral",
  "Data/NPCGiftTastes\u0000Universal_Dislike",
  "Data/NPCGiftTastes\u0000Universal_Hate",
  "Strings/BigCraftables\u0000Foroguemon_Name",
  "Strings/BigCraftables\u0000Foroguemon_Description",
  "Strings/BigCraftables\u0000HMTGF_Name",
  "Strings/BigCraftables\u0000HMTGF_Description",
  "Strings/BigCraftables\u0000PinkyLemon_Name",
  "Strings/BigCraftables\u0000PinkyLemon_Description",
  "Strings/Notes\u000020",
  "Data/SecretNotes\u000011",
  "Data/SecretNotes\u000016",
  "Data/SecretNotes\u000017",
  "Data/SecretNotes\u000018",
  "Data/SecretNotes\u000019",
  "Data/SecretNotes\u000020",
  "Data/SecretNotes\u000021",
  "Data/SecretNotes\u00001004",
  "Data/SecretNotes\u00001006",
  "Data/SecretNotes\u00001010",
]);
const festivalTechnicalKeys = new Set([
  "conditions",
  "set-up",
  "set-up_y2",
  "secretSanta",
  "secretSanta_y2",
]);
const exactIdentityTargets = new Set([
  "Data/CookingRecipes",
  "Data/CraftingRecipes",
  "Data/PaintData",
  "Data/ChairTiles",
  "Data/Furniture",
  "Data/AquariumFish",
  "Data/HairData",
  "Data/animationDescriptions",
  "Strings/credits",
]);
function build() {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8")).entries;
  if (manifest.count !== 14720 || manifest.rows.length !== 14720 || Object.keys(cache).length !== 14720) throw new Error("manifest/cache must contain exactly 14720 records");
  const errors = [];
  for (const row of manifest.rows) {
    const stable = `${row.target}\u0000${row.key}`;
    const entry = cache[stable];
    if (!entry || entry.target !== row.target || entry.key !== row.key || entry.scaffoldFile !== row.scaffoldFile || entry.englishValue !== row.englishValue) errors.push(`cache mismatch: ${stable}`);
    if (!entry?.translation && !(entry?.approvedEmpty && entry.englishValue === "")) errors.push(`empty translation: ${stable}`);
    const reviewedFestivalTechnical = row.target.startsWith("Data/Festivals/") && festivalTechnicalKeys.has(row.key);
    if (entry?.translation === entry?.englishValue && !properNameOrCode(entry.englishValue) && !exactIdentityAllowlist.has(stable) && !exactIdentityTargets.has(row.target) && !reviewedFestivalTechnical) errors.push(`English-identical translation: ${stable}`);
    if (JSON.stringify(markerSignature(entry?.englishValue || "")) !== JSON.stringify(row.markerSignature)) errors.push(`source marker mismatch: ${stable}`);
    if (entry?.translation && JSON.stringify(markerSignature(entry.translation)) !== JSON.stringify(row.markerSignature)) errors.push(`translation marker mismatch: ${stable}`);
  }
  const guardReport = path.join(workRoot, "ml-build-guard-errors.txt");
  if (errors.length) {
    fs.writeFileSync(guardReport, `${errors.join("\n")}\n`);
    throw new Error(`refusing production write (${errors.length} guard failures); first: ${errors[0]}`);
  }
  if (fs.existsSync(guardReport)) fs.unlinkSync(guardReport);
  const clusterDocument = buildClusterDocument(
    Object.values(cache).map((entry) => entry.translation),
  );
  const { encode } = mapsFromDocument(clusterDocument);
  const files = allJSON(polishRoot);
  const output = [];
  for (const file of files) {
    const document = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const change of document.Changes || []) {
      change.When = { ...(change.When || {}), Language: "ml-vnrevival" };
      for (const key of Object.keys(change.Entries || {})) {
        const entry = cache[`${change.Target}\u0000${key}`];
        if (!entry) throw new Error(`missing cache key: ${change.Target}\u0000${key}`);
        change.Entries[key] = encodeMalayalam(entry.translation, encode);
      }
    }
    const relative = path.relative(polishRoot, file);
    output.push([path.join(outputRoot, relative), document]);
  }
  fs.mkdirSync(outputRoot, { recursive: true });
  for (const [file, document] of output) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
  fs.writeFileSync(clusterMapFile, `${JSON.stringify(clusterDocument, null, 2)}\n`);
  console.log(`wrote ${output.length} Malayalam patch files with ${clusterDocument.entries.length} shaped clusters`);
}

if (process.argv.includes("--cache")) writeCache();
else if (process.argv.includes("--build")) build();
else console.error("Usage: node Scripts/build-malayalam-patches.mjs --cache|--build");
