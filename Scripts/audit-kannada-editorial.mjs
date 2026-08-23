#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  decodeMalayalam,
  mapsFromDocument,
  readClusterDocument,
} from "./malayalam-clusters.mjs";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/audit-kannada-editorial.mjs <unpacked-English-assets-dir> [--locale=kn] [--folder=kannada] [--report=TYPE] [--limit=N]");
  process.exit(2);
}

const localeArgument = process.argv.find((argument) => argument.startsWith("--locale="));
const targetLocale = localeArgument?.slice("--locale=".length) ?? "kn";
const folderArgument = process.argv.find((argument) => argument.startsWith("--folder="));
const targetFolder = folderArgument?.slice("--folder=".length) ?? "kannada";

const reportArgument = process.argv.find((argument) => argument.startsWith("--report="));
const reportType = reportArgument?.slice("--report=".length) ?? "summary";
const limitArgument = process.argv.find((argument) => argument.startsWith("--limit="));
const limit = Number(limitArgument?.slice("--limit=".length) ?? 100);
const termArgument = process.argv.find((argument) => argument.startsWith("--term="));
const requestedTerms = new Set(termArgument?.slice("--term=".length).split(",").filter(Boolean) ?? []);
const wordArgument = process.argv.find((argument) => argument.startsWith("--word="));
const requestedWords = new Set(wordArgument?.slice("--word=".length).split(",").filter(Boolean) ?? []);
const projectRoot = path.resolve(import.meta.dirname, "..");
const contextAmbiguousTerms = new Set([
  "bar", "basic", "cast", "club", "fall", "floor", "harvest", "host",
  "level", "load", "mine", "name", "pet", "quality", "save", "spring",
  "water", "well", "day", "back", "next", "close", "play", "rules", "leave",
]);
const translationRoot = path.join(
  projectRoot,
  `Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/${targetFolder}`,
);
const clusterDecode = targetFolder === "malayalam"
  ? mapsFromDocument(readClusterDocument(
    path.join(projectRoot, "Documentation/malayalam-cluster-map.json"),
  )).decode
  : null;

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listJSONFiles(directory) {
  return fs.readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function boundaryExpression(value, flags = "giu") {
  const left = /^[\p{L}\p{N}]/u.test(value) ? "(?<![\\p{L}\\p{N}])" : "";
  const right = /[\p{L}\p{N}]$/u.test(value) ? "(?![\\p{L}\\p{N}])" : "";
  return new RegExp(`${left}${escapeRegExp(value)}${right}`, flags);
}

function eventVisibleText(record, value) {
  const dialogueArguments = [...value.matchAll(
    /(?:^|[\\/])(?:speak\s+\S+|message|textAboveHead\s+\S+)\s+("(?:\\.|[^"\\])*")/g,
  )].map((match) => match[1]);
  const quoted = dialogueArguments.map((argument) => {
    try {
      return JSON.parse(argument);
    } catch {
      return argument.slice(1, -1);
    }
  });
  const choices = [...value.matchAll(/[\\/](?:quickQuestion|question)\s+([^/\\]*?)(?=\(break\)|[\\/]|$)/g)]
    .map((match) => match[1].replaceAll("#", ". "));
  const rawPrefix = value.split(/[\\/]/, 1)[0].replace(/"$/, "");
  const prefix = record.target === "Data/ExtraDialogue"
      && /[\s.!?,@]/u.test(rawPrefix)
    ? rawPrefix
    : "";
  return [prefix, ...quoted, ...choices].filter(Boolean).join(". ");
}

function semanticText(record, value) {
  const dialogueCommand = /[\\/](?:speak|message|question|quickQuestion|textAboveHead)\b/;
  if (dialogueCommand.test(value)) return eventVisibleText(record, value);

  const eventTarget = record.target.startsWith("Data/Events/")
    || record.target.startsWith("Data/Festivals/");
  if (eventTarget) return "";

  // These legacy data assets mix player-facing text with slash-delimited
  // technical fields. Only the leading fields are localizable; matching the
  // rest produces false glossary hits from IDs like junimo_furniture.
  if (record.target === "Data/Furniture") return value.split("/")[0] ?? "";
  if (record.target === "Data/animationDescriptions") return "";
  if (record.target === "Strings/credits") return "";
  if (record.target === "Data/hats") return value.split("/").slice(0, 2).join(". ");
  if (record.target === "Data/Fish") return value.split("/")[0] ?? "";
  if (record.target === "Data/Quests") {
    const fields = value.split("/");
    return [...fields.slice(1, 4), fields.at(-1) ?? ""].join(". ");
  }
  if (record.target === "Data/CookingRecipes"
      || record.target === "Data/CraftingRecipes"
      || record.target === "Data/ChairTiles"
      || record.target === "Data/PaintData"
      || record.target === "Data/HairData") return "";
  return value;
}

const sourceCache = new Map();
function sourceContent(target) {
  if (!sourceCache.has(target)) {
    const file = path.join(sourceRoot, `${target}.json`);
    sourceCache.set(target, readJSON(file).content);
  }
  return sourceCache.get(target);
}

const records = [];
for (const relative of listJSONFiles(translationRoot)) {
  const document = readJSON(path.join(translationRoot, relative));
  for (const change of document.Changes ?? []) {
    const source = sourceContent(change.Target);
    for (const [key, encoded] of Object.entries(change.Entries ?? {})) {
      const translated = clusterDecode ? decodeMalayalam(encoded, clusterDecode) : encoded;
      records.push({
        target: change.Target,
        key,
        original: source[key],
        translated,
        relative,
      });
    }
  }
}

const englishGlossary = readJSON(path.join(projectRoot, "Documentation/glossary/glossary.en.json"));
const kannadaGlossary = readJSON(
  path.join(projectRoot, `Documentation/glossary/glossary.${targetLocale}.json`),
)[targetLocale];
const glossaryForms = [];
for (const entry of englishGlossary) {
  const targetTerm = kannadaGlossary[entry.id].term;
  const sourceParts = entry.term.split(" / ");
  const targetParts = targetTerm.split(" / ");
  const forms = sourceParts.length === targetParts.length
    ? sourceParts.map((sourceTerm, index) => ({ sourceTerm, targetTerm: targetParts[index] }))
    : [{ sourceTerm: entry.term, targetTerm }];
  for (const form of forms) {
    if ([...form.sourceTerm].length < 3) continue;
    glossaryForms.push({
      ...form,
      id: entry.id,
      priority: entry.priority,
      category: entry.category,
      // The glossary deliberately distinguishes generic "farm" from the
      // proper location name "the Farm". Preserve that capitalization-only
      // distinction while keeping normal glossary matching case-insensitive.
      sourceExpression: boundaryExpression(
        form.sourceTerm,
        (entry.id === "farm" && form.sourceTerm === "the Farm")
          || (entry.id === "loved-liked-neutral-disliked-hated" && form.sourceTerm === "Loved")
          || (entry.id === "fishing-skill" && form.sourceTerm === "Fishing")
          || (entry.id === "luck" && form.sourceTerm === "Luck")
          || (entry.id === "combat-skill" && form.sourceTerm === "Combat")
          || (entry.id === "perfection" && form.sourceTerm === "Perfection")
          || (entry.id === "join-host" && (form.sourceTerm === "Join" || form.sourceTerm === "Host"))
          || (entry.id === "skills-menu" && form.sourceTerm === "Skills")
          || (entry.id === "mastery" && form.sourceTerm === "Mastery")
          || (entry.id === "sandy" && form.sourceTerm === "Sandy")
          || (entry.id === "penny" && form.sourceTerm === "Penny")
          || (entry.id === "farming-skill" && form.sourceTerm === "Farming")
          || (entry.id === "social-menu" && form.sourceTerm === "Social")
          || (entry.id === "ring" && form.sourceTerm === "Ring")
          ? "gu"
          : "giu",
      ),
      translatedTerms: form.targetTerm
        .split(" / ")
        .filter(Boolean),
      wholeOnly: contextAmbiguousTerms.has(form.sourceTerm.toLocaleLowerCase("en")),
    });
  }
}
glossaryForms.sort((left, right) => right.sourceTerm.length - left.sourceTerm.length);

const glossaryContext = [];
const needsGlossaryContext = reportType === "summary" || reportType.startsWith("glossary");
if (needsGlossaryContext) {
  for (const record of records) {
    const stripControls = (value) => value
      .replace(/\{[^}]+\}/g, " ")
      .replace(/%item\b.*?%%/gs, " ")
      .replace(/%revealtaste:[^#$^|/\n]*/g, " ")
      .replace(/%[a-z][A-Za-z0-9_]*/g, " ")
      .replace(/\$(?:query\s+[^#$^|]+|[qrdcp]\s+[^#$^|]+)|(?<=#)\$\d+\s+[^#]+(?=#)/g, " ");
    const originalSemantic = stripControls(semanticText(record, record.original));
    const translatedSemantic = stripControls(semanticText(record, record.translated));
    const consumedRanges = [];
    for (const form of glossaryForms) {
      if (form.id === "inventory" && /store (?:hours and )?inventory/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "journal" && /journal of\b/iu.test(originalSemantic)) continue;
      if (form.id === "crop" && /Crop (?:Tank|Top)\b/u.test(originalSemantic)) continue;
      if (form.id === "tackle-bobber" && form.sourceTerm === "tackle" && /tackle next\b/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "farm" && /farm (?:girl|guy)\b/iu.test(originalSemantic)) continue;
      if (form.id === "farm" && /chicken farm\b/iu.test(originalSemantic)) continue;
      if (form.id === "bundle" && /bundle up\b/iu.test(originalSemantic)) continue;
      if (form.id === "bundle" && /bundle of\b/iu.test(originalSemantic)) continue;
      if (form.id === "seed-starter-sapling" && form.sourceTerm === "starter" && /starter pack\b/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "crafting" && /crafting staircases?\b/iu.test(originalSemantic)) continue;
      if (form.id === "profession" && record.target.startsWith("Characters/Dialogue/")) continue;
      if (form.id === "gold-currency" && form.sourceTerm === "gold"
          && /(?:Gold (?:Brazier|Pickaxe)|Solid Gold|Fool's Gold|gold-star)\b/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "pig" && /Guinea Pig\b/iu.test(originalSemantic)) continue;
      if (form.id === "foraging-skill" && /luck foraging today\b/iu.test(originalSemantic)) continue;
      if (form.id === "appearance" && record.target !== "Strings/UI") continue;
      if (form.id === "collect-deliver-place" && form.sourceTerm === "place"
          && !/(?:Quest|SpecialOrder)/u.test(record.target)) continue;
      if (form.id === "crop-order-terms" && form.sourceTerm === "plant"
          && !/\bplant\s+(?:a |an |the |some |these |those |your |seeds?|crops?|it|them)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "crop-order-terms" && form.sourceTerm === "grow"
          && !/\b(?:crop|seed|plant|vegetable|fruit|flower|tree|farm|soil|greenhouse|garden)s?\b/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "cabin"
          && record.target !== "Strings/Buildings"
          && record.target !== "Strings/UI"
          && !/Cabin/u.test(record.key)) continue;
      if (form.id === "forge-action"
          && !/(?:Anvil|Forge_|DiamondForge|GalaxySoul_Description|Data\/SecretNotes)/u.test(
            `${record.target} ${record.key}`,
          )) continue;
      if (form.id === "tool-upgrade-tiers"
          && record.target !== "Strings/Tools"
          && !/(?:Tool|Upgrade).*(?:Copper|Steel|Gold|Iridium)|(?:Copper|Steel|Gold|Iridium).*(?:Tool|Upgrade)/u.test(
            `${record.target} ${record.key}`,
          )) continue;
      if (form.id === "quality-tiers"
          && !/(?:quality|star)/iu.test(originalSemantic)
          && !/(?:Quality|ItemQuality)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "shaft"
          && !(record.target === "Strings/Locations" && /Shaft/u.test(record.key))) continue;
      if (form.id === "reclaim"
          && !/(?:TrashCan|Trash Can|trash(?:ing)? an item)/iu.test(
            `${originalSemantic} ${record.target} ${record.key}`,
          )) continue;
      if (form.id === "build"
          && !(record.target === "Strings/UI" && originalSemantic.trim() === form.sourceTerm)) continue;
      if ((form.id === "tool-enchantments" || form.id === "fishing-enchantments")
          && record.target !== "Data/SecretNotes"
          && record.target !== "Strings/UI") continue;
      if ((form.id === "tool-enchantments" || form.id === "fishing-enchantments")
          && record.target === "Strings/UI"
          && !/(?:Enchant|Forge)/u.test(record.key)) continue;
      if (form.id === "sunny" && /sunny-side up/iu.test(originalSemantic)) continue;
      if (form.id === "sunny" && form.sourceTerm === "clear"
          && !/(?:weather|forecast|clear (?:day|skies)|day (?:is|will be) clear|sunny and clear)/iu.test(originalSemantic)
          && !/(?:Weather|Forecast)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "angler-pirate"
          && !/(?:UI|StringsFromCSFiles|LevelUp|Profession)/iu.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "loot-drop" && form.sourceTerm === "drop"
          && !/\b(?:monster|enemy|loot|slay|defeat|container|crate|barrel)s?\b/iu.test(originalSemantic)) continue;
      if (form.id === "wind" && form.sourceTerm === "wind"
          && !/(?:weather|forecast|windy|gust|breeze|storm)/iu.test(originalSemantic)
          && !/(?:Weather|Forecast)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "resolution"
          && !/(?:Options|Display|Graphics|Resolution)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "quest-log"
          && (!/(?:Quest|Journal|QuestLog)/u.test(`${record.target} ${record.key}`)
            || /journal of\b/iu.test(originalSemantic))) continue;
      if (form.id === "buff-debuff" && /(?:movie|film) buff/iu.test(originalSemantic)) continue;
      if (form.id === "speed-stat" && /Racer_/u.test(record.key)) continue;
      if (form.id === "perfect-catch"
          && !/(?:Fishing|Bobber|Catch)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "stable"
          && !/(?:Buildings|Carpenter|AnimalHouse|Stable)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "miner-geologist"
          && !/(?:LevelUp|Profession|SkillsPage)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "brute-defender"
          && !/(?:LevelUp|Profession|SkillsPage)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "incubator" && form.sourceTerm === "Incubator"
          && /(?:Ostrich|Slime) Incubator/iu.test(originalSemantic)) continue;
      if (form.id === "shed" && /(?:rabbits?|animals?)\b.*\bshed|shed\b.*\bwool/iu.test(originalSemantic)) continue;
      if (form.id === "botanist-tracker" && /PT_Title/u.test(record.key)) continue;
      if (form.id === "buy-sell"
          && !/(?:Shop|Shipping|Buy|Sell|Purchase)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "children" && form.sourceTerm === "baby"
          && /(?:baby (?:chickens?|chicks?|cows?|calves?|ducks?|goats?|kids?|ostrich(?:es)?|pigs?|piglets?|rabbits?|bunnies|slimes?|lizards?|dinosaurs?|parrots?)|baby[- ]mint|poor baby|like a (?:little )?baby|being a baby|baby girl\. Be nice|^Baby,|\b(?:robot|Junimo|bat|egg|incubator|animal)\b)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "children" && form.sourceTerm === "baby"
          && /(?:AnimalBirth|AnimalNaming|AnimalQuery_AgeBaby|AnimalHouse|Incubator|Hatch)/u.test(`${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "children" && form.sourceTerm === "child"
          && /(?:as|when (?:I|you|he|she) was) a child/iu.test(originalSemantic)) continue;
      if (form.id === "children" && form.sourceTerm === "child"
          && !/(?:your|our|their|a|the) child\b|child(?:ren)?\b.*(?:nursery|crib|family|adopt|birth)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "complete-completed"
          && /(?:Complete Breakfast|complete (?:access|confidence|freedom|waste|(?:\w+\s+){0,3}collection)|(?:isn't|wouldn't be) complete|complete disintegration)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "locked" && /locked (?:yourself|himself|herself|themselves) in/iu.test(originalSemantic)) continue;
      if (form.id === "single-status"
          && !/(?:\b(?:am|are|be|he's|is|she's|was|were) (?:not )?single\b|relationship.*single|single.*(?:relationship|whole life))/iu.test(originalSemantic)
          && !/SocialPage_Relationship_Single/u.test(record.key)) {
        continue;
      }
      if (form.id === "gathering-quest"
          && record.target !== "Data/Quests"
          && !/(?:Quest|SpecialOrder)/u.test(`${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "cave-insect") {
        const monsterContext = record.target === "Data/Monsters"
          || /(?:Bug Meat|bug meat|bug guts|bug slime|Bug Killer|Mutant Bug|monster eradication)/u.test(originalSemantic)
          || /(?:Monster|SlayMonster|WillyBugWad)/u.test(`${record.target} ${record.key}`);
        if (!monsterContext) continue;
      }
      if (form.id === "offline-online"
          && !/(?:online (?:services?|players?)|farmhand is online|server.*online|online.*server)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "connection-status" && record.target !== "Strings/UI") continue;
      if (form.id === "machine-input-output"
          && (!/(?:Machine|Output|Input|ReadyFor|Processing|Status)/u.test(`${record.target} ${record.key}`)
            || /Morris_StillProcessingOrder/u.test(record.key))) continue;
      if (form.id === "shop-action"
          && !(record.target === "Strings/UI" && originalSemantic.trim() === form.sourceTerm)) continue;
      if (form.id === "talking"
          && !/(?:Friendship|Social|TalkTo|DailyTalk)/u.test(`${record.target} ${record.key}`)) continue;
      if ((form.id === "mariner-luremaster" || form.id === "fisher-trapper")
          && !/(?:LevelUp|Profession|SkillsPage)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "fighter-scout"
          && !/(?:LevelUp|Profession|SkillsPage)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "cat-dog-turtle-preference"
          && !/(?:Character|PetPreference|FavoritePet)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "pet"
          && !/(?:Character|PetPreference|FavoritePet|AdoptPet|PetMenu)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "normal-remixed"
          && !/(?:Bundle|MineRewards|CommunityCenter|Remix)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "vault"
          && !/(?:Bundles|CommunityCenter|ccVault)/u.test(`${record.target} ${record.key}`)) continue;
      if (form.id === "snow" && /StarterChicken_Names/u.test(record.key)) continue;
      if (form.id === "furnace"
          && /(?:turn on the furnace|furnace to keep|home furnace|heating furnace)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "hay"
          && /(?:hit the hay|name means ['\u2018\u2019]field of hay)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "island-east" && form.sourceTerm === "Jungle"
          && !/(?:Island|Resort|Birdie|Leo)/u.test(`${record.target} ${record.key}`)
          && !/(?:shrine|altar) in the jungle/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "fiber"
          && !/(?:pieces? of fiber|\bfiber seeds?\b|\bgrow (?:your own )?fiber\b|\b(?:collect|bring|harvest|cutting weeds).*\bfiber\b)/iu.test(originalSemantic)
          && !/(?:FiberSeeds|emilyFiber)/u.test(`${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "fish-tank"
          && /(?:Furniture|WillyTropicalFish)/u.test(`${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "island-resort" && /\b(?:last resort|resort to)\b/iu.test(originalSemantic)) continue;
      if (form.id === "wizard-rasmodius"
          && /(?:Dark Wizard|wizard (?:class|character|king)|Xarth)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "bite"
          && !/(?:fish|fishing|bobber|bait|tackle|rod|pole|BiteChime|Auto-Hook)/iu.test(`${originalSemantic} ${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "bite" && form.sourceTerm === "bite"
          && /(?:have a bite|for a bite|take (?:another |a )?bite|could take a bite)/iu.test(originalSemantic)) continue;
      if (form.id === "bite" && form.sourceTerm === "hook"
          && /(?:fish hook stuck|bait on your hook)/iu.test(originalSemantic)) continue;
      if (form.id === "bite" && record.target === "Strings/EnchantmentNames"
          && record.key === "Auto-Hook") continue;
      if (form.id === "chest"
          && /(?:Pierre's|your|his|her) chest\b/iu.test(originalSemantic)) continue;
      if (form.id === "animal-age"
          && !/(?:AnimalQuery|PurchaseAnimals|animal.*age|age.*animal)/iu.test(`${originalSemantic} ${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "defense"
          && record.target !== "Strings/UI"
          && !/(?:Buff|MeleeWeapon|Forging Table|DefenseBonus)/u.test(`${originalSemantic} ${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "ghost-monster"
          && record.target !== "Data/Monsters"
          && !/(?:monster|slay|eradication|Carbon Ghost|Putrid Ghost)/iu.test(`${originalSemantic} ${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "animal-feed"
          && !/(?:animals?|cows?|chickens?|coop|barn|hay|silo|trough|fodder)/iu.test(originalSemantic)) {
        continue;
      }
      if (form.id === "bear" && !/\bBear\b/u.test(originalSemantic)) continue;
      if (form.id === "serpent-monster"
          && record.target !== "Data/Monsters"
          && !/(?:serpent-infested|Serpent Invasion|monster|Skull Cavern)/iu.test(`${originalSemantic} ${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "bat-monster"
          && record.target !== "Data/Monsters"
          && !/(?:monster|cave|mine|slay|eradication)/iu.test(`${originalSemantic} ${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "exhaustion"
          && !/(?:Farmer\.cs\.1987|passedOut3_)/u.test(`${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "junk"
          && !/(?:fishing|Crab pots?|Trash_Description|Recycling Machine)/iu.test(`${originalSemantic} ${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "accept-decline"
          && record.target !== "Strings/UI"
          && originalSemantic.trim().toLocaleLowerCase("en") !== form.sourceTerm.toLocaleLowerCase("en")) {
        continue;
      }
      if (form.id === "grandpa" && /great-grandpa/iu.test(originalSemantic)) continue;
      if (form.id === "collect-deliver-place" && form.sourceTerm === "place"
          && /(?:earn(?:ed)? your place|know your place|a place (?:to|for)|place in (?:the|a))/iu.test(originalSemantic)) continue;
      if (form.id === "trinket"
          && !/(?:Anvil|TrinketMenu|TrinketSlot|CombatMastery|Strings\/Objects)/u.test(`${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "roe"
          && !/(?:Strings\/Objects|FishPond|Fish Pond|roe item)/iu.test(`${originalSemantic} ${record.target} ${record.key}`)) {
        continue;
      }
      if (form.id === "energy" && /Blue Alien ENERGY\b/u.test(originalSemantic)) continue;
      if (form.wholeOnly && originalSemantic.trim() !== form.sourceTerm) continue;
      form.sourceExpression.lastIndex = 0;
      const matches = [...originalSemantic.matchAll(form.sourceExpression)];
      if (!matches.length) continue;
      const uncovered = matches.some((match) => {
        const start = match.index;
        const end = start + match[0].length;
        return !consumedRanges.some(([rangeStart, rangeEnd]) => start >= rangeStart && end <= rangeEnd);
      });
      if (!uncovered) continue;
      for (const match of matches) consumedRanges.push([match.index, match.index + match[0].length]);
      // Kannada case/number suffixes attach directly to the glossary stem.
      // A literal substring therefore validates both the base form and normal
      // inflections such as ಪಿಯರ್‌ನ or ಜುನಿಮೊಗಳು without accepting a synonym.
      const hasCanonicalTerm = form.translatedTerms.some((target) => {
        if (form.id === "crop-order-terms" && form.sourceTerm === "grow"
            && translatedSemantic.includes("ಬೆಳೆ")) return true;
        // Kannada places the ordinal between the possessed noun and the head:
        // "mine level 50" is naturally "ಗಣಿಯ 50ನೇ ಮಹಡಿ".
        if (form.id === "the-mines" && form.sourceTerm === "mine level"
            && translatedSemantic.includes("ಗಣಿಯ") && translatedSemantic.includes("ಮಹಡಿ")) return true;
        if (form.id === "growth-stage" && form.sourceTerm === "days to mature"
            && translatedSemantic.includes("ಮಾಗಲು") && translatedSemantic.includes("ದಿನ")) return true;
        if (form.id === "married" && form.sourceTerm === "married"
            && translatedSemantic.includes("ಮದುವೆ")) return true;
        if (form.id === "animal-feed"
            && ["ಆಹಾರ", "ಒಣಹುಲ್ಲು", "ಹುಲ್ಲು"].some((term) => translatedSemantic.includes(term))) return true;
        if (form.id === "complete-completed" && translatedSemantic.includes("ಮುಗಿ")) return true;
        if (form.id === "pass-out" && translatedSemantic.includes("ಪ್ರಜ್ಞೆ ತಪ್ಪ")) return true;
        if (form.id === "deadline" && /ಸಮಯ(?:ದ)?\s+ಮಿತಿ/u.test(translatedSemantic)) return true;
        if (form.id === "saving-progress"
            && translatedSemantic.includes("ಪ್ರಗತಿ") && translatedSemantic.includes("ಉಳಿಸಲ")) return true;
        if (form.id === "reclaim" && translatedSemantic.includes("ಮರಳಿ ಪಡೆಯ")) return true;
        if (form.id === "engaged" && translatedSemantic.includes("ನಿಶ್ಚಿತಾರ್ಥ")) return true;
        if (form.id === "perfect-catch" && translatedSemantic.includes("ಪರಿಪೂರ್ಣ")) return true;
        if (form.id === "forge-action" && translatedSemantic.includes("ಲೋಹಕರ್ಮ")) return true;
        if (form.id === "fiber" && translatedSemantic.includes("ನಾರ")) return true;
        if (form.id === "bite" && translatedSemantic.includes("ಕಚ್ಚ")) return true;
        if (form.id === "bachelor-bachelorette" && translatedSemantic.includes("ಅವಿವಾಹಿತ")) return true;
        if (form.id === "crop-order-terms" && form.sourceTerm === "plant"
            && /ನೆಡ|ನೆಟ್ಟ/u.test(translatedSemantic)) return true;
        if (form.id === "defeat" && form.sourceTerm === "defeat"
            && translatedSemantic.includes("ಸೋಲ")) return true;
        if (form.id === "paused-resumed"
            && /ವಿರಾಮಗೊಳ|ಮುಂದುವರಿಸ/u.test(translatedSemantic)) return true;
        if (form.id === "send-money" && /ಹಣ.*ಕಳುಹಿ/u.test(translatedSemantic)) return true;
        if (form.id === "loot-drop" && form.sourceTerm === "drop"
            && translatedSemantic.includes("ಬೀಳ")) return true;
        if (translatedSemantic.includes(target)) return true;
        const letters = [...target];
        // Kannada plural nouns drop their final ಉ before many case suffixes:
        // ಗಣಿಗಳು -> ಗಣಿಗಳಲ್ಲಿ / ಗಣಿಗಳನ್ನು. Accept that grammatical form.
        if (letters.length >= 5 && letters.at(-1) === "ು") {
          return translatedSemantic.includes(letters.slice(0, -1).join(""));
        }
        // Infinitive and finite forms of Kannada verbs commonly replace the
        // glossary citation-form ending ಇ: ಸೇರಿ -> ಸೇರಲು / ಸೇರಬಹುದು.
        if (letters.length >= 4 && letters.at(-1) === "ಿ") {
          return translatedSemantic.includes(letters.slice(0, -1).join(""));
        }
        // Predicate glossary forms such as ನೀರಿಟ್ಟಿದೆ inflect around the
        // stable ನೀರಿಟ್ಟ- stem in normal sentences.
        if (target.endsWith("ಿದೆ") && target.length > 3) {
          return translatedSemantic.includes(target.slice(0, -3));
        }
        if (letters.length >= 4 && letters.at(-1) === "ಾ") {
          return translatedSemantic.includes(letters.slice(0, -1).join(""));
        }
        return false;
      });
      if (hasCanonicalTerm) continue;
      glossaryContext.push({ ...record, ...form });
    }
  }
}

function proseRecord(record) {
  const explicit = record.target.startsWith("Characters/Dialogue/")
    || record.target.startsWith("Strings/schedules/")
    || record.target === "Data/EngagementDialogue"
    || record.target === "Data/ExtraDialogue"
    || record.target === "Data/NPCGiftTastes"
    || record.target === "Data/SecretNotes"
    || record.target === "Data/mail"
    || record.target.startsWith("Data/Events/")
    || record.target.startsWith("Data/Festivals/")
    || record.target === "Strings/Movies"
    || record.target === "Strings/MovieReactions"
    || record.target === "Strings/MovieConcessions"
    || record.target === "Strings/Locations"
    || record.target === "Strings/Quests"
    || record.target === "Strings/SimpleNonVillagerDialogues"
    || record.target === "Strings/StringsFromMaps";
  if (explicit || record.target === "Data/TV/TipChannel") return true;
  return record.target.startsWith("Strings/")
    && record.translated.length >= 40
    && /[.!?…#$^\n]/u.test(record.translated);
}

function visibleText(value) {
  return value
    .replace(/%item\b.*?%%/gs, " ")
    .replace(/%revealtaste:[^#$^|/\n]*/g, " ")
    .replace(/\$[qr]\s+[^#]*/g, " ")
    .replace(/\$c\s+[.\d]+/g, " ")
    .replace(/\$\{[^}]*\}/g, "x")
    .replace(/\$[A-Za-z0-9]+/g, " ")
    .replace(/%[A-Za-z0-9_]+/g, "x")
    .replace(/\{\{[^}]+\}\}/g, " ")
    .replace(/\{[^}]+\}/g, "x")
    .replace(/\s*\[#\]/g, ". ")
    .replace(/\[[^\]]+\]/g, "x")
    .replace(/\([A-Z]+\)[A-Za-z0-9_]+/g, " ")
    .replace(/#[^#]*#/g, " ");
}

const duplicateWords = [];
const spacing = [];
const duplicateWordAllowlist = new Set([
  "Characters/Dialogue/Demetrius\u0000AcceptGift_(O)StardropTea",
  "Data/Events/Saloon\u000096/f Gus 1000/f Pam 500/p Gus",
]);
for (const record of records.filter(proseRecord)) {
  const visible = visibleText(semanticText(record, record.translated));
  const sourceVisible = visibleText(semanticText(record, record.original));
  const duplicate = visible.match(/(?<![\p{L}\p{N}])(\p{L}{2,})[ \t]+\1(?![\p{L}\p{N}])/iu);
  if (duplicate && !duplicateWordAllowlist.has(`${record.target}\0${record.key}`)) {
    duplicateWords.push({ ...record, match: duplicate[0] });
  }
  const badSpacing = visible.match(/\s+[,.!?;:](?![.)])/u);
  const sourceBadSpacing = sourceVisible.match(/\s+[,.!?;:](?![.)])/u);
  if (badSpacing && !sourceBadSpacing) spacing.push({ ...record, match: badSpacing[0] });
}

const likelyEnglish = new Set([
  "about", "after", "again", "always", "and", "animal", "are", "before", "better",
  "but", "can", "come", "day", "did", "does", "don't", "farm", "farmer", "festival",
  "for", "friend", "from", "give", "going", "good", "have", "hello", "help", "here",
  "house", "how", "into", "is", "just", "know", "like", "little", "love", "make",
  "maybe", "more", "morning", "much", "need", "never", "new", "night", "not", "now",
  "only", "people", "really", "right", "see", "something", "sorry", "still", "take",
  "thanks", "that", "the", "their", "there", "they", "thing", "think", "this", "time",
  "today", "tomorrow", "town", "very", "want", "was", "water", "way", "we", "well",
  "what", "when", "where", "which", "will", "with", "work", "would", "year", "you",
  "your",
  "back", "buy", "cancel", "chat", "click", "close", "exit", "left", "load",
  "menu", "music", "next", "no", "off", "on", "options", "previous", "right",
  "save", "sell", "settings", "sound", "start", "volume", "yes", "zoom",
]);
const residualEnglish = [];
const residualEnglishAll = [];
const englishTechnicalAllowlist = new Set([
  "Strings/UI\u0000ChatCommands_Help_Intro",
  "Data/mail\u0000winter_19_2",
  "Data/Quests\u0000125",
]);
if (reportType === "summary" || reportType === "english") {
  for (const record of records.filter(proseRecord)) {
    if (englishTechnicalAllowlist.has(`${record.target}\0${record.key}`)) continue;
    const visible = visibleText(semanticText(record, record.translated));
    const hits = [...visible.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)]
      .map((match) => match[0])
      .filter((word) => likelyEnglish.has(word.toLowerCase()));
    if (hits.length) residualEnglish.push({ ...record, match: [...new Set(hits)].join(", ") });
  }
}
if (reportType === "english-all") {
  for (const record of records) {
    if (englishTechnicalAllowlist.has(`${record.target}\0${record.key}`)) continue;
    const visible = visibleText(semanticText(record, record.translated));
    const sourceWords = new Set(
      [...visibleText(semanticText(record, record.original)).matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)]
        .map((match) => match[0].toLowerCase()),
    );
    const hits = [...visible.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)]
      .map((match) => match[0])
      .filter((word) =>
        likelyEnglish.has(word.toLowerCase()) && sourceWords.has(word.toLowerCase())
      );
    if (hits.length) residualEnglishAll.push({
      ...record,
      match: [...new Set(hits)].join(", "),
    });
  }
}

const glossaryTargetPhrases = [...new Set(
  Object.values(kannadaGlossary)
    .flatMap((entry) => entry.term.split(" / "))
    .filter((term) => /^\p{Lu}/u.test(term) && [...term].length > 1),
)].sort((left, right) => right.length - left.length);
const displayNames = new Set();
for (const record of records) {
  if (
    record.target === "Strings/NPCNames"
    || /(?:_Name(?:_\d+)?|_Title|_LocalizedName)$/.test(record.key)
  ) {
    if (
      typeof record.translated === "string"
      && record.translated.length <= 120
      && !/[#$^|/\n]/u.test(record.translated)
    ) displayNames.add(record.translated);
  }
}
const protectedCapitalizationPhrases = [...new Set([
  ...glossaryTargetPhrases,
  ...[...displayNames].filter((name) => /\s/u.test(name)),
])].sort((left, right) => right.length - left.length);
const properWords = new Set();
for (const entry of englishGlossary) {
  if (
    entry.category !== "Characters & named creatures"
    && entry.category !== "World, peoples & organizations"
  ) continue;
  for (const term of kannadaGlossary[entry.id].term.split(" / ")) {
    if (/^\p{Lu}[\p{L}'’-]+$/u.test(term)) properWords.add(term);
  }
}
for (const word of ["Bwana", "Bi", "Dkt", "Meya", "Profesa"]) properWords.add(word);
for (const name of displayNames) {
  if (/^\p{Lu}[\p{L}'’-]+$/u.test(name)) properWords.add(name);
}

function capitalizationText(value) {
  return visibleText(value)
    .replace(/[#$^|]+/g, ". ")
    .replace(/_/g, ". ")
    .replace(/(?<!:)\/(?!\/)/g, ". ")
    .replace(/\\n/g, ". ");
}

// Kannada has no upper/lower-case distinction. The capitalization heuristic
// inherited from the Swahili audit only sees protected Latin identifiers and
// proper names, so it cannot identify a Kannada editorial defect.
const capitalization = [];

const unchangedShort = reportType === "unchanged-short"
  ? records.filter((record) =>
    record.target.startsWith("Strings/")
      && record.original === record.translated
      && record.translated.length <= 50
      && /[A-Za-z]{2}/.test(record.translated)
      && !/[\\/\[\]{}]/.test(record.translated)
  ).map((record) => ({ ...record, match: record.translated }))
  : [];

function compact(value, maximum = 420) {
  const singleLine = value.replaceAll("\n", "\\n");
  return singleLine.length <= maximum ? singleLine : `${singleLine.slice(0, maximum)}…`;
}

function line(item) {
  const preview = compact(item.translated);
  const detail = item.id
    ? `${item.priority} ${item.id}: ${JSON.stringify(item.sourceTerm)} -> ${JSON.stringify(item.targetTerm)}`
    : JSON.stringify(item.match);
  const sourcePreview = item.id ? `\tEN=${JSON.stringify(compact(item.original, 240))}` : "";
  return `${item.relative}\t${item.target}\t${item.key}\t${detail}${sourcePreview}\t${targetLocale.toUpperCase()}=${JSON.stringify(preview)}`;
}

const reports = {
  glossary: glossaryContext,
  "glossary-p0": glossaryContext.filter((item) => item.priority === "P0"),
  "glossary-names": glossaryContext.filter((item) =>
    item.category === "Characters & named creatures"
      || item.category === "World, peoples & organizations"
      || item.category === "Locations & businesses"
  ),
  duplicates: duplicateWords,
  spacing,
  english: residualEnglish,
  "english-all": residualEnglishAll,
  capitalization,
  "unchanged-short": unchangedShort,
};
if (requestedTerms.size) {
  for (const [name, items] of Object.entries(reports)) {
    reports[name] = items.filter((item) =>
      requestedTerms.has(item.id) || requestedTerms.has(item.sourceTerm)
    );
  }
}
if (requestedWords.size) {
  reports.capitalization = reports.capitalization.filter((item) =>
    item.match.split(", ").some((word) => requestedWords.has(word))
  );
}

if (reportType === "summary") {
  const byPriority = Object.fromEntries(
    ["P0", "P1", "P2"].map((priority) => [
      priority,
      glossaryContext.filter((item) => item.priority === priority).length,
    ]),
  );
  console.log(JSON.stringify({
    records: records.length,
    glossaryContextCandidates: glossaryContext.length,
    glossaryContextByPriority: byPriority,
    duplicateWordCandidates: duplicateWords.length,
    spacingCandidates: spacing.length,
    residualEnglishCandidates: residualEnglish.length,
    capitalizationCandidates: capitalization.length,
  }, null, 2));
} else if (reportType === "capitalization-terms") {
  const counts = new Map();
  for (const item of capitalization) {
    for (const word of item.match.split(", ")) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  for (const [word, count] of [...counts].sort((left, right) => right[1] - left[1]).slice(0, limit)) {
    console.log(`${String(count).padStart(5)}\t${word}`);
  }
} else if (
  reportType === "glossary-terms"
  || reportType === "glossary-p0-terms"
  || reportType === "glossary-name-terms"
) {
  const counts = new Map();
  const terms = reportType === "glossary-p0-terms"
    ? glossaryContext.filter((item) => item.priority === "P0")
    : reportType === "glossary-name-terms"
      ? glossaryContext.filter((item) =>
        item.category === "Characters & named creatures"
          || item.category === "World, peoples & organizations"
          || item.category === "Locations & businesses"
      )
      : glossaryContext;
  for (const item of terms) {
    const id = `${item.priority}\t${item.id}\t${item.sourceTerm}\t${item.targetTerm}`;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const [id, count] of [...counts].sort((left, right) => right[1] - left[1]).slice(0, limit)) {
    console.log(`${String(count).padStart(5)}\t${id}`);
  }
} else if (reportType === "glossary-p0-samples") {
  const groups = new Map();
  for (const item of glossaryContext.filter((candidate) => candidate.priority === "P0")) {
    const id = `${item.id}\0${item.sourceTerm}\0${item.targetTerm}`;
    if (!groups.has(id)) groups.set(id, []);
    if (groups.get(id).length < 2) groups.get(id).push(item);
  }
  for (const [id, items] of [...groups].slice(0, limit)) {
    const [glossaryID, sourceTerm, targetTerm] = id.split("\0");
    console.log(`\n[P0 ${glossaryID}] ${JSON.stringify(sourceTerm)} -> ${JSON.stringify(targetTerm)}`);
    for (const item of items) console.log(line(item));
  }
} else if (reports[reportType]) {
  for (const item of reports[reportType].slice(0, limit)) console.log(line(item));
} else {
  console.error(`Unknown report type: ${reportType}`);
  process.exitCode = 2;
}
