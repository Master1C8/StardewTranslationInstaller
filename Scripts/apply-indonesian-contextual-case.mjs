#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const write = process.argv.includes("--write");
const allDetails = process.argv.includes("--all-details");
const root = path.resolve(import.meta.dirname, "..");
const sourceRoot = process.argv.slice(2).find((argument) => !argument.startsWith("--"))
  ?? "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const translationRoot = path.join(
  root,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian",
);

// These canonical terms are labels in isolation but ordinary words when the
// English source uses them in lowercase within prose. Proper names, branded
// terms, named locations, festivals, and item titles are deliberately absent.
const ruleTriples = [
  ["spring", "Musim Semi", "musim semi"],
  ["summer", "Musim Panas", "musim panas"],
  ["fall", "Musim Gugur", "musim gugur"],
  ["winter", "Musim Dingin", "musim dingin"],
  ["seasons?", "Musim", "musim"],
  ["years?", "Tahun", "tahun"],
  ["festivals?", "Festival", "festival"],
  ["farms?", "Ladang", "ladang"],
  ["farmers?", "Petani", "petani"],
  ["crops?", "Tanaman", "tanaman"],
  ["seeds?", "Benih", "benih"],
  ["chickens?", "Ayam", "ayam"],
  ["cows?", "Sapi", "sapi"],
  ["goats?", "Kambing", "kambing"],
  ["ducks?", "Bebek", "bebek"],
  ["sheep", "Domba", "domba"],
  ["rabbits?", "Kelinci", "kelinci"],
  ["pigs?", "Babi", "babi"],
  ["horses?", "Kuda", "kuda"],
  ["cats?", "Kucing", "kucing"],
  ["dinosaurs?", "Dinosaurus", "dinosaurus"],
  ["ostrich(?:es)?", "Burung Unta", "burung unta"],
  ["energy", "Energi", "energi"],
  ["health", "Kesehatan", "kesehatan"],
  ["luck", "Keberuntungan", "keberuntungan"],
  ["skills?", "Keahlian", "keahlian"],
  ["farming", "Bertani", "bertani"],
  ["mining", "Menambang", "menambang"],
  ["foraging", "Meramu", "meramu"],
  ["fishing", "Memancing", "memancing"],
  ["combat", "Bertarung", "bertarung"],
  ["friendship", "Persahabatan", "persahabatan"],
  ["marriage", "Pernikahan", "pernikahan"],
  ["furnaces?", "Tungku", "tungku"],
  ["hardwood", "Kayu Keras", "kayu keras"],
  ["cinnamon", "Kayu Manis", "kayu manis"],
  ["goat milk", "Susu Kambing", "susu kambing"],
  ["cow milk", "Susu Sapi", "susu sapi"],
  ["duck eggs?", "Telur Bebek", "telur bebek"],
  ["blue chickens?", "Ayam Biru", "ayam biru"],
  ["white chickens?", "Ayam Putih", "ayam putih"],
  ["brown chickens?", "Ayam Cokelat", "ayam cokelat"],
  ["void chickens?", "Ayam Void", "ayam void"],
  ["copper bars?", "Batangan Tembaga", "batangan tembaga"],
  ["iron bars?", "Batangan Besi", "batangan besi"],
  ["gold bars?", "Batangan Emas", "batangan emas"],
  ["iridium bars?", "Batangan Iridium", "batangan iridium"],
  ["radioactive bars?", "Batangan Radioaktif", "batangan radioaktif"],
  ["metal bars?", "Batangan Logam", "batangan logam"],
  ["wood(?:en)?", "Kayu", "kayu"],
  ["coal", "Batu Bara", "batu bara"],
  ["stone", "Batu", "batu"],
  ["bars?", "Batangan", "batangan"],
  ["metal", "Logam", "logam"],
  ["iridium", "Iridium", "iridium"],
  ["gold", "Emas", "emas"],
  ["silver", "Perak", "perak"],
  ["copper", "Tembaga", "tembaga"],
  ["steel", "Baja", "baja"],
  ["ores?", "Bijih", "bijih"],
  ["minerals?", "Mineral", "mineral"],
  ["artifacts?", "Artefak", "artefak"],
  ["gems?", "Permata", "permata"],
  ["crystals?", "Kristal", "kristal"],
  ["monsters?", "Monster", "monster"],
  ["magic", "Sihir", "sihir"],
  ["statues?", "Patung", "patung"],
  ["tools?", "Alat", "alat"],
  ["axes?", "Kapak", "kapak"],
  ["pickaxes?", "Beliung", "beliung"],
  ["hoes?", "Cangkul", "cangkul"],
  ["scythes?", "Sabit", "sabit"],
  ["watering cans?", "Penyiram", "penyiram"],
  ["fish", "Ikan", "ikan"],
  ["eggs?", "Telur", "telur"],
  ["cheese", "Keju", "keju"],
  ["wine", "Anggur", "anggur"],
  ["mayonnaise", "Mayones", "mayones"],
  ["cakes?", "Kue", "kue"],
  ["soups?", "Sup", "sup"],
  ["pumpkins?", "Labu", "labu"],
  ["books?", "Buku", "buku"],
  ["water", "Air", "air"],
  ["tea", "Teh", "teh"],
  ["beers?", "Bir", "bir"],
  ["oils?", "Minyak", "minyak"],
  ["sauces?", "Saus", "saus"],
  ["bones?", "Tulang", "tulang"],
  ["obsidian", "Obsidian", "obsidian"],
  ["oaks?", "Ek", "ek"],
  ["wool", "Wol", "wol"],
  ["cloth", "Kain", "kain"],
  ["grass", "Rumput", "rumput"],
  ["hay", "Jerami", "jerami"],
  ["fiber", "Serat", "serat"],
  ["flowers?", "Bunga", "bunga"],
  ["mushrooms?", "Jamur", "jamur"],
  ["vegetables?", "Sayuran", "sayuran"],
  ["fertilizers?", "Pupuk", "pupuk"],
  ["feed", "Pakan", "pakan"],
  ["bait", "Umpan", "umpan"],
  ["bobbers?", "Pelampung", "pelampung"],
  ["rings?", "Cincin", "cincin"],
  ["snow", "Salju", "salju"],
  ["lightning", "Petir", "petir"],
  ["fire", "Api", "api"],
  ["trees?", "Pohon", "pohon"],
  ["bread", "Roti", "roti"],
  ["chocolate", "Cokelat", "cokelat"],
  ["corn", "Jagung", "jagung"],
  ["sugar", "Gula", "gula"],
  ["tomatoes?", "Tomat", "tomat"],
  ["onions?", "Bawang", "bawang"],
  ["honey", "Madu", "madu"],
  ["chests?", "Peti", "peti"],
  ["machines?", "Mesin", "mesin"],
  ["batter(?:y|ies)", "Baterai", "baterai"],
  ["sand", "Pasir", "pasir"],
  ["lights?", "Cahaya", "cahaya"],
  ["rain", "Hujan", "hujan"],
  ["trash", "Sampah", "sampah"],
  ["diamonds?", "Berlian", "berlian"],
  ["bananas?", "Pisang", "pisang"],
  ["melons?", "Melon", "melon"],
  ["carrots?", "Wortel", "wortel"],
  ["cact(?:us|i)", "Kaktus", "kaktus"],
  ["coconuts?", "Kelapa", "kelapa"],
  ["shrimps?", "Udang", "udang"],
  ["lobsters?", "Lobster", "lobster"],
  ["squids?", "Cumi-Cumi", "cumi-cumi"],
  ["jellyfish", "Ubur-ubur", "ubur-ubur"],
  ["salmon", "Salmon", "salmon"],
  ["garlic", "Bawang Putih", "bawang putih"],
  ["nutmeg", "Pala", "pala"],
  ["cloves?", "Cengkih", "cengkih"],
  ["fair(?:y|ies)", "Peri", "peri"],
  ["ghosts?", "Hantu", "hantu"],
  ["goblins?", "Goblin", "goblin"],
  ["skeletons?", "Kerangka", "kerangka"],
  ["golems?", "Golem", "golem"],
  ["swords?", "Pedang", "pedang"],
  ["fishing rods?", "Joran", "joran"],
  ["pans?", "Dulang", "dulang"],
  ["fences?", "Pagar", "pagar"],
  ["weeds?", "Gulma", "gulma"],
  ["soil", "Tanah", "tanah"],
  ["cabins?", "Pondok", "pondok"],
  ["sheds?", "Gudang", "gudang"],
  ["animals?", "Hewan", "hewan"],
  ["frogs?", "Katak", "katak"],
  ["crabs?", "Kepiting", "kepiting"],
  ["insects?|bugs?", "Serangga", "serangga"],
  ["stars?", "Bintang", "bintang"],
  ["leaves?", "Daun", "daun"],
  ["incubators?", "Inkubator", "inkubator"],
  ["geodes?", "Geode", "geode"],
  ["accessor(?:y|ies)|trinkets?", "Aksesori", "aksesori"],
  ["fortune", "Keberuntungan", "keberuntungan"],
  ["blue", "Biru", "biru"],
  ["green", "Hijau", "hijau"],
  ["red", "Merah", "merah"],
  ["white", "Putih", "putih"],
  ["black", "Hitam", "hitam"],
  ["yellow", "Kuning", "kuning"],
  ["purple", "Ungu", "ungu"],
  ["orange", "Oranye", "oranye"],
  ["pink", "Merah Muda", "merah muda"],
  ["brown", "Cokelat", "cokelat"],
  ["(?:big|large)", "Besar", "besar"],
  ["(?:small|little)", "Kecil", "kecil"],
  ["old", "Tua", "tua"],
  ["new", "Baru", "baru"],
  ["wild", "Liar", "liar"],
  ["cold", "Dingin", "dingin"],
  ["hot", "Panas", "panas"],
  ["dark", "Gelap", "gelap"],
  ["magical", "Ajaib", "ajaib"],
  ["suspicious", "Mencurigakan", "mencurigakan"],
  ["tropical", "Tropis", "tropis"],
  ["governor", "Gubernur", "gubernur"],
  ["wizard", "Penyihir", "penyihir"],
  ["dwar(?:f|ves)", "Kurcaci", "kurcaci"],
  ["milk", "Susu", "susu"],
  ["coffee", "Kopi", "kopi"],
  ["fruit", "Buah", "buah"],
  ["nuts?", "Kacang", "kacang"],
  ["food", "Makanan", "makanan"],
  ["salad", "Salad", "salad"],
  ["museum", "Museum", "museum"],
  ["beach", "Pantai", "pantai"],
  ["forest", "Hutan", "hutan"],
  ["mountain", "Gunung", "gunung"],
  ["caves?", "Gua", "gua"],
  ["mines?", "Tambang", "tambang"],
  ["(?:everyone|everybody)", "Semuanya", "semuanya"],
  ["(?:children|kids)", "Anak-Anak", "anak-anak"],
  ["blacksmith", "Besi", "besi"],
  ["field trips?", "Karyawisata", "karyawisata"],
];

const seenRules = new Set();
const protectedPhrases = [
  "Bintang Musim Dingin",
  "Perjamuan Bintang Musim Dingin",
];
const rules = ruleTriples.flatMap(([source, target, replacement]) => {
  const signature = `${source}\u0000${target}\u0000${replacement}`;
  if (seenRules.has(signature)) return [];
  seenRules.add(signature);
  return [{
    source: new RegExp(`(?<![A-Za-z])(?:${source})(?![A-Za-z])`, "gi"),
    target,
    replacement,
  }];
}).sort((left, right) => right.target.length - left.target.length);

function listJsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJsonFiles(full);
    return entry.isFile() && entry.name.endsWith(".json") ? [full] : [];
  });
}

function sourceMatches(source, expression) {
  expression.lastIndex = 0;
  return [...source.matchAll(expression)];
}

function isLowercaseSourceMatch(match) {
  const first = match[0][0];
  return first === first.toLocaleLowerCase("en") && first !== first.toLocaleUpperCase("en");
}

function wholeTermCount(text, target) {
  let count = 0;
  let cursor = 0;
  while (cursor < text.length) {
    const index = text.indexOf(target, cursor);
    if (index < 0) break;
    const previous = text[index - 1] ?? "";
    const next = text[index + target.length] ?? "";
    if (!/\p{L}/u.test(previous) && !/\p{L}/u.test(next)) count += 1;
    cursor = index + target.length;
  }
  return count;
}

function isWithinProtectedPhrase(text, index, target) {
  if (protectedPhrases.some((phrase) => {
    let cursor = 0;
    while (cursor < text.length) {
      const phraseIndex = text.indexOf(phrase, cursor);
      if (phraseIndex < 0) return false;
      const phraseEnd = phraseIndex + phrase.length;
      if (index >= phraseIndex && index + target.length <= phraseEnd) return true;
      cursor = phraseEnd;
    }
    return false;
  })) return true;

  const openingQuote = Math.max(text.lastIndexOf("'", index), text.lastIndexOf("‘", index));
  if (openingQuote < 0) return false;
  const straightClose = text.indexOf("'", openingQuote + 1);
  const curlyClose = text.indexOf("’", openingQuote + 1);
  const closingQuote = [straightClose, curlyClose]
    .filter((quoteIndex) => quoteIndex >= 0)
    .sort((left, right) => left - right)[0];
  if (closingQuote === undefined || index + target.length > closingQuote) return false;
  const quoted = text.slice(openingQuote + 1, closingQuote).trimStart();
  return /^\p{Lu}/u.test(quoted);
}

function isInsideSentence(text, index, target) {
  let cursor = index - 1;
  while (cursor >= 0 && /\s/u.test(text[cursor])) cursor -= 1;
  if (cursor < 0) return false;
  if (
    target === "Petani"
    && /\b(?:Bung|Gadis|Tuan|Nona|Pak|Bu)\s*$/u.test(text.slice(0, index))
  ) return false;
  if (!target.includes(" ")) {
    const prefix = text.slice(0, index);
    const suffix = text.slice(index + target.length);
    const previousCapitalizedWord = prefix.match(/\b\p{Lu}\p{L}*\s+$/u);
    const previousWordIsInternal = previousCapitalizedWord
      && prefix.slice(0, previousCapitalizedWord.index).trimEnd() !== ""
      && !/[.!?^#|_"'([{/:]$/u.test(
        prefix.slice(0, previousCapitalizedWord.index).trimEnd(),
      );
    const previousWordStartsHeading = previousCapitalizedWord
      && !previousWordIsInternal
      && /^\s*[!:]/u.test(suffix);
    if (
      previousWordIsInternal
      || previousWordStartsHeading
      || /^\s+\p{Lu}\p{L}*\b/u.test(suffix)
    ) {
      return false;
    }
  }
  return !/[.!?^#|_*"'([{/:]/u.test(text[cursor]);
}

function contextualLowercase(text, target, replacement, allowedOrdinals) {
  let cursor = 0;
  let result = "";
  let changes = 0;
  let wholeOrdinal = 0;
  while (cursor < text.length) {
    const index = text.indexOf(target, cursor);
    if (index < 0) {
      result += text.slice(cursor);
      break;
    }
    result += text.slice(cursor, index);
    const previous = text[index - 1] ?? "";
    const next = text[index + target.length] ?? "";
    const isWholeTerm = !/\p{L}/u.test(previous) && !/\p{L}/u.test(next);
    const ordinalAllowed = allowedOrdinals === null || allowedOrdinals.has(wholeOrdinal);
    if (
      isWholeTerm
      && ordinalAllowed
      && !isWithinProtectedPhrase(text, index, target)
      && isInsideSentence(text, index, target)
    ) {
      result += replacement;
      changes += 1;
    } else {
      result += target;
    }
    if (isWholeTerm) wholeOrdinal += 1;
    cursor = index + target.length;
  }
  return { text: result, changes };
}

function alignedTextUnits(source, translation) {
  const separator = /(#\$[A-Za-z0-9]+#|\/|\^|\|)/g;
  const sourceParts = source.split(separator);
  const translationParts = translation.split(separator);
  if (
    sourceParts.length !== translationParts.length
    || sourceParts.some((part, index) => index % 2 === 1 && part !== translationParts[index])
  ) return [{ source, translation, index: 0, whole: true }];
  return translationParts
    .map((part, index) => ({ source: sourceParts[index], translation: part, index, whole: false }))
    .filter(({ index }) => index % 2 === 0);
}

const sourceCache = new Map();
const summaries = new Map(rules.map((rule) => [rule.target, 0]));
const details = [];
let changedRecords = 0;
let changedFiles = 0;

for (const file of listJsonFiles(translationRoot).sort()) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  let fileChanged = false;
  for (const change of document.Changes ?? []) {
    if (!sourceCache.has(change.Target)) {
      const sourceFile = path.join(sourceRoot, `${change.Target}.json`);
      sourceCache.set(change.Target, JSON.parse(fs.readFileSync(sourceFile, "utf8")).content);
    }
    const sourceEntries = sourceCache.get(change.Target);
    for (const [key, initialTranslation] of Object.entries(change.Entries ?? {})) {
      const source = sourceEntries?.[key];
      if (typeof source !== "string" || typeof initialTranslation !== "string") continue;
      let translation = initialTranslation;
      let recordChanges = 0;
      const units = alignedTextUnits(source, translation);
      for (const unit of units) {
        let unitTranslation = unit.translation;
        for (const rule of rules) {
          if (!unitTranslation.includes(rule.target)) continue;
          const matches = sourceMatches(unit.source, rule.source);
          const lowercaseOrdinals = new Set(
            matches.flatMap((match, index) => isLowercaseSourceMatch(match) ? [index] : []),
          );
          if (!lowercaseOrdinals.size) continue;
          const targetCount = wholeTermCount(unitTranslation, rule.target);
          const allowedOrdinals = matches.length === targetCount ? lowercaseOrdinals : null;
          const result = contextualLowercase(
            unitTranslation,
            rule.target,
            rule.replacement,
            allowedOrdinals,
          );
          if (!result.changes) continue;
          unitTranslation = result.text;
          recordChanges += result.changes;
          summaries.set(rule.target, summaries.get(rule.target) + result.changes);
        }
        if (unitTranslation === unit.translation) continue;
        if (unit.whole) translation = unitTranslation;
        else {
          const translationParts = translation.split(/(#\$[A-Za-z0-9]+#|\/|\^|\|)/g);
          translationParts[unit.index] = unitTranslation;
          translation = translationParts.join("");
        }
      }
      if (translation === initialTranslation) continue;
      change.Entries[key] = translation;
      changedRecords += 1;
      fileChanged = true;
      if (allDetails || details.length < 40) {
        details.push({
          target: change.Target,
          key,
          changes: recordChanges,
          before: initialTranslation,
          after: translation,
        });
      }
    }
  }
  if (!fileChanged) continue;
  changedFiles += 1;
  if (write) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

const replacements = [...summaries.entries()]
  .filter(([, count]) => count > 0)
  .map(([term, count]) => ({ term, count }));
console.log(JSON.stringify({ mode: write ? "write" : "dry-run", changedFiles, changedRecords, replacements, details }, null, 2));
