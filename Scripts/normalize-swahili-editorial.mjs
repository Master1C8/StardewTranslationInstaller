#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/swahili",
);

const files = fs.readdirSync(translationRoot).filter((file) => file.endsWith(".json")).sort();
let changedFiles = 0;
let changedEntries = 0;
let replacements = 0;

const glossary = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "Documentation/glossary/glossary.sw.json"), "utf8"),
).sw;
const protectedPhrases = new Set(
  Object.values(glossary).flatMap((entry) => entry.term.split(" / ")),
);
// This is a UI preference label in the glossary, not a proper name. In prose
// it must follow ordinary sentence casing (for example, "Sam anapenda sana").
protectedPhrases.delete("Anapenda Sana");
protectedPhrases.delete("Yenye Nguvu");
const observedLowercaseWords = new Set();
const neverLowerWords = new Set([
  "Bibi", "Babu", "Shangazi", "Mjomba",
  "Bwana", "Bi", "Dkt", "Meya", "Profesa",
  "Paa",
  "Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi", "Jumapili",
]);
for (const phrase of [
  "Nyota ya Majira ya Baridi",
  "Viwavi wa Baharini wa Mwangaza wa Mwezi",
  "Mama Coldstar",
  "Baba Coldstar",
  "Baba Shane",
  "Mtu wa Kaktasi",
  "Shamba la Maporomoko ya Maji",
]) protectedPhrases.add(phrase);

// Preserve multi-word display names when the same name appears in prose. Common
// nouns outside these exact names should follow ordinary Swahili sentence case.
for (const file of files) {
  const document = JSON.parse(fs.readFileSync(path.join(translationRoot, file), "utf8"));
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      if (typeof value === "string") {
        for (const match of value.matchAll(/(?<!\p{L})\p{Ll}[\p{L}'’-]*/gu)) {
          observedLowercaseWords.add(match[0]);
        }
      }
      if (change.Target === "Strings/NPCNames" && typeof value === "string") {
        protectedPhrases.add(value);
        if (!/\s/u.test(value)) neverLowerWords.add(value);
      }
      if (
        typeof value === "string"
        && /(?:_Name(?:_\d+)?|_Title|_LocalizedName)$/.test(key)
        && /\s/u.test(value)
        && value.length <= 80
        && !/[#$^|/\n]/u.test(value)
      ) protectedPhrases.add(value);
    }
  }
}
const sortedProtectedPhrases = [...protectedPhrases]
  .filter((phrase) => /^\p{Lu}/u.test(phrase) && phrase.length > 1)
  .sort((left, right) => right.length - left.length);
const canonicalMultiwordPatterns = sortedProtectedPhrases
  .filter((phrase) => /\s/u.test(phrase))
  .map((phrase) => ({
    phrase,
    pattern: new RegExp(
      `(?<!\\p{L})${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?!\\p{L})`,
      "giu",
    ),
  }));

const commonCapitalizedWords = new Set(`
Zawadi Nyumba Ujumbe Mapishi Ufukweni Mazao Maonyesho Baharini Mvua Mwangaza
Samaki Keki Sanaa Mbao Chumba Rangi Familia Madhabahu Shambani Sanamu Jozi Maua
Sukari Kazi Nguo Pesa Shukrani Taarifa Kahawa Bia Majitu Jioni Fimbo Ombi Asubuhi
Filamu Viungo Maji Wanyama Mboga Beri Tiketi Kitabu Vitu Ute Mradi Mchezo Poda
Ndege Yai Karoti Bonde Matunda Chakula Onyesho Uyoga Chokoleti Kompyuta Biashara
Hofu Wateja Mji Jeli Viwavi Chai Sarafu Giza Kisiwa Mume Boga Saa Bibi Mahindi
Kitambaa Mayai Kichawi Magharibi Redio Bahari Mashine Mafuta Pilipili Mifupa Ladha
Michoro Meno Malkia Kulala Picha Wangu Akiolojia Mikono Mchuzi Vito Mkoba Ufito
Chura Ufunguo Kaa Ingoti Saladi Jibini Vifaa Kitanda Mlango Talaka Kadi Mtoto
Sadaka Zambarau Harufu Wetu Kabati Alasiri Wimbo Daktari Kaskazini Waridi Riwaya
Usomaji Michezo Ujenzi Mpenzi Trufeli Mandhari Tunda Mvinyo Sampuli Chumbani Ubao
Bei Kinywa Friji Maziwa Betri Safari Protini Meza Mkusanyiko Alama Sehemu Kusini
Asili Mwaliko Majarida Chupa Umeme Moto Korongo Barafu Ametisti Jiwe Kubwa Kivuli
Salmoni Kwanza Mnara Kale Vitabu Utupu Utengenezaji Zana Msimu Pango Makumbusho
Dukani Kushonea Mavazi Shirika Utangazaji Udongo Maharamia Mchanganyiko Majani
Mungu Maisha Mchoro Mashada Ubora Ngoma Kitafunio Bisi Sauti Krimu Gamba Kiumbe
Mfano Roho Shule Mazoezi Siagi Dirisha Cola Nambari Horseradishi Porini Stroberi
Sharubati Biti Mwaka Sherehe Siri Tokeni Hadithi Kipande Trouti Upinde Ndoa
Ulimwengu Taka Tundu Hesabu Klabu Anga Kanda Utafiti Huduma Mpya Mgeni Pakiti
Mfupa Seti Mfuko Mdogo Kuasili Mshangao Kikumbusho Droo Aproni Upanga Karatasi
Chungu Uso Haradali Nafaka Supu Ukumbi Uwekezaji Vitafunwa Mitende Darti
Magauni Viunga Suruali Kengele Mkusanyaji Dhahabu Pipa Maboksi Wajenga
Barua Tanuru Chuma Viputo Ramani Masizi Bonsai Chambo Dubu Shajara Mkuto
Pindo Nenosiri Tajriba Uzoefu Afya Bili Pamba Mirija Masikioni Kuvimba Nywele
Washiriki Leseni Mamlaka Sindano Kamera Tufe Dunia Mikrowevu Quinoa Manowari
Maboksi Mkusanyaji Vinahitajika Upasuaji Goti Chombo Ugonjwa
Mpole Pretzel Barbekyu Mesquite Mshiko Hidrojeni Rai Gamu Kukoroga Hiper Koni
Kanola Ng'ombe Mzeituni Uzito Pauni Sanduku Kuki Kumbukumbu Mchimbaji Mawe
Tafiti Kutawala Mapitio Migahawa Vichukua Faili Tenge Ifanikiwe Zaidi Neva
Stereo Shoka Ndogo Ujana Konsoni Izuiwe Mleta Meneja Wasifu Jamii Anapenda
Sana Bakteria Kizibo Mchawi Vipande Tufaha Mshirika Jitihada Haramia Ghuba
Jinamizi Urushaji
Kome Mapangoni Intaneti Sintesaiza Kipengele Swichi Maabarani Mtumishi Galaksi
Mhuishaji Viunzi Kielekezi Kibandiko Madaraja Mabasi Rakun Misumari
Kianthropolojia
Kasha Mwenza Mtoaji Mbeba Salio Ngozi Chaguo Manunuzi Pambo Sebule Duka Jina
Mlingano Awamu Ufadhili Ujuzi Mwanga Jua
`.trim().split(/\s+/u));
// A word used as an NPC label can still be an ordinary noun in running prose
// (for example, “Dubu” = Bear or “Mlango” inside “Mlinzi wa Mlango”).
for (const word of commonCapitalizedWords) neverLowerWords.delete(word);

function isProseTarget(target) {
  return target.startsWith("Characters/Dialogue/")
    || target.startsWith("Strings/schedules/")
    || target === "Data/EngagementDialogue"
    || target === "Data/ExtraDialogue"
    || target === "Data/NPCGiftTastes"
    || target === "Data/SecretNotes"
    || target === "Data/mail"
    || target.startsWith("Data/Events/")
    || target.startsWith("Data/Festivals/")
    || target === "Strings/Movies"
    || target === "Strings/MovieReactions"
    || target === "Strings/MovieConcessions"
    || target === "Strings/Locations"
    || target === "Strings/Quests"
    || target === "Strings/SimpleNonVillagerDialogues"
    || target === "Strings/StringsFromMaps";
}

const capitalizationSkipKeys = new Set([
  JSON.stringify(["Strings/Notes", "20"]),
  JSON.stringify(["Strings/1_6_Strings", "StarterChicken_Names"]),
  JSON.stringify(["Data/SecretNotes", "2"]),
  JSON.stringify(["Data/SecretNotes", "4"]),
  JSON.stringify(["Data/SecretNotes", "5"]),
]);

function shouldNormalizeCapitalization(value, target, key) {
  if (capitalizationSkipKeys.has(JSON.stringify([target, key]))) return false;
  if (isProseTarget(target) || target === "Data/TV/TipChannel") return true;
  return target.startsWith("Strings/")
    && value.length >= 40
    && /[.!?…#$^\n]/u.test(value);
}

function normalizePlainCapitalization(value) {
  const protectedRanges = [];
  for (const phrase of sortedProtectedPhrases) {
    let offset = value.indexOf(phrase);
    while (offset >= 0) {
      protectedRanges.push([offset, offset + phrase.length]);
      offset = value.indexOf(phrase, offset + phrase.length);
    }
  }
  let count = 0;
  const normalized = value.replace(/(?<!\p{L})\p{Lu}[\p{L}'’-]*/gu, (word, offset) => {
    // Do not turn initials such as “P.W.” into “p.W.”.
    if (word.length === 1 && value[offset + 1] === ".") return word;
    // Underscore-delimited words are game identifiers, not visible prose.
    if (value[offset - 1] === "_" || value[offset + word.length] === "_") return word;
    const lowercase = `${word[0].toLocaleLowerCase("sw")}${word.slice(1)}`;
    if (neverLowerWords.has(word)) return word;
    if (!commonCapitalizedWords.has(word) && !observedLowercaseWords.has(lowercase)) return word;
    const matchingProtectedRanges = protectedRanges.filter(
      ([start, end]) => offset >= start && offset + word.length <= end,
    );
    const protectedByPhrase = matchingProtectedRanges.some(
      ([start, end]) => end - start > word.length,
    );
    if (protectedByPhrase || (matchingProtectedRanges.length > 0 && !commonCapitalizedWords.has(word))) {
      return word;
    }
    let previous = offset - 1;
    while (previous >= 0 && /\s/u.test(value[previous])) previous -= 1;
    if (previous < 0 || /[.!?…:%#$^|/"'‘’“”()[\]{}_*\n-]/u.test(value[previous])) return word;
    count += 1;
    return lowercase;
  });
  return { value: normalized, count };
}

function isEventScript(value, target) {
  return /\/(?:speak|message|question|quickQuestion|textAboveHead)\b/.test(value)
    || target.startsWith("Data/Events/")
    || (target.startsWith("Data/Festivals/") && value.includes("/"))
    || (target === "Strings/Locations" && value.includes("/"));
}

function normalizeCapitalization(value, target, key) {
  if (!shouldNormalizeCapitalization(value, target, key)) return { value, count: 0 };
  const eventScript = isEventScript(value, target);
  if (!eventScript) return normalizePlainCapitalization(value);

  let count = 0;
  let normalized = value.replace(/"(?:\\.|[^"\\])*"/g, (quoted) => {
    const result = normalizePlainCapitalization(quoted.slice(1, -1));
    count += result.count;
    return `"${result.value}"`;
  });
  normalized = normalized.replace(
    /(^|\/)(quickQuestion\s+)([^/]*?)(?=\(break\)|\/|$)/g,
    (matched, boundary, command, choices) => {
      const result = normalizePlainCapitalization(choices);
      count += result.count;
      return `${boundary}${command}${result.value}`;
    },
  );
  return { value: normalized, count };
}

function canonicalizeProtectedCapitalization(value) {
  let count = 0;
  let normalized = value;
  for (const { phrase, pattern } of canonicalMultiwordPatterns) {
    normalized = normalized.replace(pattern, (matched) => {
      if (matched === phrase) return matched;
      count += 1;
      return phrase;
    });
  }
  return { value: normalized, count };
}

function canonicalizeCapitalization(value, target, key) {
  if (!shouldNormalizeCapitalization(value, target, key)) return { value, count: 0 };
  if (!isEventScript(value, target)) return canonicalizeProtectedCapitalization(value);

  let count = 0;
  let normalized = value.replace(/"(?:\\.|[^"\\])*"/g, (quoted) => {
    const result = canonicalizeProtectedCapitalization(quoted.slice(1, -1));
    count += result.count;
    return `"${result.value}"`;
  });
  normalized = normalized.replace(
    /(^|\/)(quickQuestion\s+)([^/]*?)(?=\(break\)|\/|$)/g,
    (matched, boundary, command, choices) => {
      const result = canonicalizeProtectedCapitalization(choices);
      count += result.count;
      return `${boundary}${command}${result.value}`;
    },
  );
  return { value: normalized, count };
}

const phraseReplacements = [
  ["book_PriceCatalogue", "Book_PriceCatalogue"],
  ["book_Woodcutting", "Book_Woodcutting"],
  ["book_Void", "Book_Void"],
  ["book_Trash", "Book_Trash"],
  ["book_Defense", "Book_Defense"],
  ["book_Bombs", "Book_Bombs"],
  ["book_Mystery", "Book_Mystery"],
  ["book_Crabbing", "Book_Crabbing"],
  ["book_Roe", "Book_Roe"],
  ["kompyuta Mpakatoni", "kompyuta mpakato"],
  ["Au labda Kanivali ya siri?", "Au labda kanivali ya siri?"],
  ["Basi Mwenye Mdomo Mkubwa", "Besi Mwenye Mdomo Mkubwa"],
  ["Basi Mwenye Mdomo Mdogo", "Besi Mwenye Mdomo Mdogo"],
  ["p.W. Kranzhauer", "P.W. Kranzhauer"],
  ["...We...Wewe...?", "...W... Wewe...?"],
  ["Tajriba nzuri sana", "uzoefu mzuri sana"],
  ["Kikusanya Utomvu", "Mkusanya Utomvu"],
  ["umekuwa Ukikusanya", "umekuwa ukikusanya"],
  ["Kaboni-13", "kaboni-13"],
  ["Furushi la eliksiri", "Kifurushi cha eliksiri"],
  ["Furushi la Junimo", "Kifurushi cha Junimo"],
  ["Mafurushi mengi", "Vifurushi vingi"],
  ["Furushi la mwisho", "Kifurushi cha mwisho"],
  ["Kikikikifurushi", "Kifurushi"],
  ["kikikikifurushi", "kifurushi"],
  ["Vikikikifurushi", "Vifurushi"],
  ["vikikikifurushi", "vifurushi"],
  ["Kifurushi la eliksiri", "Kifurushi cha eliksiri"],
  ["Kifurushi la Junimo", "Kifurushi cha Junimo"],
  ["Vifurushi mengi", "Vifurushi vingi"],
  ["Kifurushi la mwisho", "Kifurushi cha mwisho"],
  ["Kinyunyizio", "Kinyunyiziaji"],
  ["kinyunyizio", "kinyunyiziaji"],
  ["Vielea", "Maboya"],
  ["vielea", "maboya"],
  ["Kielea changu", "Boya langu"],
  ["Kielea cha", "Boya la"],
  ["Kielea", "Boya"],
  ["Sululu", "Sururu"],
  ["yai la Dinosau lisiloharibika", "yai la Dinosauri lisiloharibika"],
  ["yai la Dinosau?", "yai la Dinosauri?"],
  ["dubwana wa baharini", "jitu la baharini"],
  ["Kimejaa dubwana", "Kimejaa majitu"],
  ["dubwana wowote kati ya hawa", "jitu lolote kati ya haya"],
  ["dubwana wengi zaidi", "majitu mengi zaidi"],
  ["dubwana litatokea", "jitu litatokea"],
  ["dubwana lolote ovu", "jitu lolote ovu"],
  ["Hugeuza madini na", "Hugeuza madini ghafi na"],
  ["vipande 25 vya madini na", "vipande 25 vya madini ghafi na"],
  ["kuchimba madini yako mwenyewe", "kuchimba madini ghafi yako mwenyewe"],
  ["kuna madini mazuri humo", "kuna madini ghafi mazuri humo"],
  ["Mavuno ya madini kutoka", "Mavuno ya madini ghafi kutoka"],
  ["+Madini 1 kutoka Vifundo vya Madini.", "+Madini Ghafi 1 kutoka Vifundo vya Madini Ghafi."],
  ["Angalau nina kazi.", "Angalau nina taaluma."],
  ["Ni kazi yenye heshima.", "Ni taaluma yenye heshima."],
  ["ustadi mpya", "ujuzi mpya"],
  ["Ustadi wangu wa maneno", "Ujuzi wangu wa maneno"],
  ["kwa kisu unaweza kufanya shambulio", "kwa jambia unaweza kufanya shambulio"],
  ["Pango^             la fuvu", "Pango^             la Fuvu"],
  ["la fuvu...", "la Fuvu..."],
  ["Ufanisi wa Birika la Kumwagilia", "Ufanisi wa Kopo la Kumwagilia"],
  ["birika lako la kumwagilia", "kopo lako la kumwagilia"],
  ["nguvu safi ikiingia", "nishati safi ikiingia"],
  ["nguvu hasi zikitoka", "nishati hasi ikitoka"],
  ["mishale ya nguvu tupu ya giza", "mishale ya nishati tupu ya giza"],
  ["nguvu zenu zote ikiwa", "nishati yenu yote ikiwa"],
  ["Muziki wa dansi wenye nguvu nyingi", "Muziki wa dansi wenye nishati nyingi"],
  ["nguvu za kutosha kufanya kazi kwa bidii", "nishati ya kutosha kufanya kazi kwa bidii"],
  ["nimefurika kwa nguvu", "nimefurika kwa nishati"],
  ["nina nguvu nyingi zaidi wakati wa Majira ya Joto", "nina nishati nyingi zaidi wakati wa Majira ya Joto"],
  ["umejaa nguvu leo", "umejaa nishati leo"],
  ["unaonekana umejaa nguvu", "unaonekana umejaa nishati"],
  ["nguvu ya giza ya filamu", "nishati ya giza ya filamu"],
  ["Kiwango changu cha nguvu ni", "Kiwango changu cha nishati ni"],
  ["nguvu ya filamu", "nishati ya filamu"],
  ["kudumisha nguvu zako", "kudumisha nishati yako"],
  ["Baraka ya Nguvu", "Baraka ya Nishati"],
  ["Una Nguvu isiyoisha", "Una Nishati isiyoisha"],
  ["nguvu ya Junimo", "nishati ya Junimo"],
  ["nguvu zako za iridiamu", "nishati yako ya iridiamu"],
  ["nguvu ya roho zilizosahaulika", "nishati ya roho zilizosahaulika"],
  ["Nguvu ya Shujaa", "Nishati ya Shujaa"],
  [" Nguvu ya Juu", " Nishati ya Juu"],
  ["juu cha nguvu kimeongezeka", "juu cha nishati kimeongezeka"],
  ["+{0} Nguvu", "+{0} Nishati"],
  ["Sina Nguvu yoyote leo", "Sina nishati yoyote leo"],
  ["NGUVU ya kiumbe buluu", "NISHATI ya kiumbe buluu"],
  ["kurejesha nguvu zako", "kurejesha nishati yako"],
  ["picha nzuri ya Mama yake", "picha nzuri ya mama yake"],
  ["katika Majira yote ya Joto", "wakati wote wa Majira ya Joto"],
  ["Majira haya ya Kuchipua", "Majira ya Kuchipua mwaka huu"],
  ["Majira haya ya Joto", "Majira ya Joto mwaka huu"],
  ["Majira haya ya Kupukutika", "Majira ya Majani Kupukutika mwaka huu"],
  ["Majira haya ya Baridi", "Majira ya Baridi mwaka huu"],
  ["Majira mengine ya Joto", "Majira ya Joto mengine"],
  ["Majira fulani ya Joto", "Majira ya Joto fulani"],
  ["Majira yale marefu na baridi ya Baridi", "Majira ya Baridi yale marefu na yenye baridi"],
  ["Majira ya Joto au Kupukutika", "Majira ya Joto au Majira ya Majani Kupukutika"],
  ["Majira ya Kupukutika", "Majira ya Majani Kupukutika"],
  ["majira ya kupukutika", "Majira ya Majani Kupukutika"],
  ["Kituo kile kibaya cha zamani cha Jamii", "kile Kituo cha Jamii kibaya na cha zamani"],
  ["Kituo kile cha zamani cha Jamii", "kile Kituo cha Jamii cha zamani"],
  ["Kituo kile cha Jamii", "kile Kituo cha Jamii"],
  ["Jumba jipya la Sinema", "Jumba la Sinema jipya"],
  ["Ukumbi wa sinema", "Jumba la Sinema"],
  ["ukumbi wa sinema", "Jumba la Sinema"],
  ["pango lile la shambani", "Pango la Shamba"],
  ["Hirizi ya Giza", "Hirizi Nyeusi"],
  ["alichukua Wino wangu wa Uchawi", "alichukua Wino wa Uchawi niliokuwa nao"],
  ["Nahitaji Wino huo wa Uchawi urudi", "Nahitaji Wino wa Uchawi huo urudi"],
  ["kurudisha Wino wangu wa Uchawi", "kunirudishia Wino wa Uchawi"],
  ["Umepata Wino wangu wa Uchawi!", "Umeupata Wino wa Uchawi!"],
  ["Chama cha Wasafiri", "Chama cha Wajasiri"],
  ["Wasafiri waliothibitishwa", "Wajasiri waliothibitishwa"],
  ["Himaya ya Gotoro", "Milki ya Gotoro"],
  ["Sherehe ya Usiku wa Roho", "Sherehe ya Mkesha wa Roho"],
  ["Ghala Kubwa la Wanyama", "Zizi Kubwa"],
  ["fimbo ya radi", "Kinga ya Radi"],
  ["Kikaragosi Mpweke", "Sanamu ya Kuwingia Ndege ya Upweke"],
  ["Kikaragosi Bora", "Sanamu ya Kuwingia Ndege ya Hali ya Juu"],
  ["Kikaragosi", "Sanamu ya Kuwingia Ndege"],
  ["za Kuwingia ndege", "za kuwingia ndege"],
  ["sanamu ya kufukuza kunguru", "Sanamu ya Kuwingia Ndege"],
  ["Sanduku Dogo la Usafirishaji", "Sanduku Dogo la Mauzo"],
  ["Sanduku hili la Usafirishaji", "Sanduku la Mauzo"],
  ["Samaki Aliyevutwa Moshi", "Samaki wa Moshi"],
  ["vidimbwi vya ufukweni", "Madimbwi ya Mawimbi"],
  ["Karamu njema ya Nyota ya Majira ya Baridi", "Heri ya Karamu ya Nyota ya Majira ya Baridi"],
  ["Jamhuri nzima ya Ferngill", "Jamhuri ya Ferngill nzima"],
  ["agizo langu maalumu", "Agizo Maalumu nililokupa"],
  ["Tangi maalumu la Samaki", "Tangi la Samaki maalumu"],
  ["Niliona utabiri wa hali ya hewa", "Niliona Taarifa ya Hali ya Hewa"],
  ["watu wengine wa kivuli", "Watu wa Kivuli wengine"],
  ["watu wenzangu wote wa kivuli", "Watu wa Kivuli wenzangu wote"],
  ["watu wote wa kivuli", "Watu wa Kivuli wote"],
  ["Bahari kubwa ya Vito", "eneo kubwa la Bahari ya Vito"],
  ["Mashindano ya Kila Mwaka ya Trouti", "Mashindano ya Trouti ya kila mwaka"],
  ["Hati Halisi ya Kuondolea Masharti ya Ukamilifu", "Hati ya Msamaha wa Ukamilifu"],
  ["Hati ya Kuondolea Masharti ya Ukamilifu", "Hati ya Msamaha wa Ukamilifu"],
  ["Shamba la Malishoni", "Shamba la Malisho"],
  ["Nyasi za Buluu", "Nyasi za Bluu"],
  ["Soko hilo la Usiku", "Soko la Usiku hilo"],
  ["Eneo la Uchimbaji", "Mahali pa Kuchimba"],
  ["Utoe Kipande kimoja cha Upinde wa Mvua kama Sadaka?", "Utoe kama sadaka Kipande cha Upinde wa Mvua kimoja?"],
  ["Tunda hili la Nyota", "Tunda la Nyota hili"],
  ["Chama changu cha Wajasiri", "Chama cha Wajasiri ninachosimamia"],
  ["Chama maarufu cha Wajasiri", "Chama cha Wajasiri maarufu"],
  ["Hei. Hei. Hei...", "Heh. Heh. Heh..."],
  ["Hei Hei...", "Hehe..."],
  ["Hei Hei.$h", "Hehe.$h"],
  ["Hei... kuna baridi huku nje", "Heh... kuna baridi huku nje"],
  ["Hei... Si kila siku", "Heh... Si kila siku"],
  ["Kwa-Hei-ri!", "Kwa-he-ri!"],
  ["Hei... ni kweli. Kwa kweli ni Bei nafuu", "Heh... ni kweli. Kwa kweli ni bei nafuu"],
  [
    "Lo, Hei. Basi Hei ndiye jamaa mpya, huh? Sawa.^Wewe, wewe ndiye msichana mpya, huh?",
    "Lo, Hei. Basi wewe ndiye jamaa mpya, huh? Sawa.^Hei, wewe ndiye msichana mpya, huh?",
  ],
  [
    "nilikuwa na wivu kidogo Hei na Haley mlipooana. Lakini, wewe...",
    "nilikuwa na wivu kidogo wewe na Haley mlipooana. Lakini, Hei...",
  ],
  ["Lo, habari. Hei pia unajaribu kuukimbia kelele?", "Lo, habari. Wewe pia unajaribu kuukimbia kelele?"],
  ["Hei, hujambo!", "Hei!"],
  ["katika %farm Shamba", "katika Shamba la %farm"],
  ["daima huenda kutembea", "daima hutembea kidogo"],
  ["Lazima kuwa mkulima ni rahisi sana", "Lazima kazi ya mkulima iwe rahisi sana"],
  ["Sebastian karibu hazungumzi nami kamwe", "Sebastian karibu kamwe hazungumzi nami"],
  ["kama hata ananipenda hata kidogo", "kama ananipenda hata kidogo"],
  ["sasa niko huru... Hii hii hii!", "sasa niko huru... Hehe hehe hehe!"],
  ["Rahisi! Rahisi!", "Bei nafuu! Bei nafuu!"],
  ["Bonde la Stardew", "Stardew Valley"],
  ["ina matumizi mengi, ni rahisi, imara", "ina matumizi mengi, ina bei nafuu, ni imara"],
  ["kikombe cha chai mbichi", "kikombe kipya cha chai"],
  ["ana harufu mbichi sana", "ananukia kuwa safi sana"],
  ["Ninasikia harufu ya Samaki mbichi?", "Ninasikia harufu ya samaki safi?"],
  ["Tumia katika Pishi", "Tumia katika pishi"],
  ["kuongeza Pishi katika", "kuongeza pishi katika"],
  ["mojawapo ya Vielelezo", "mojawapo ya vielelezo"],
  ["au Vielelezo", "au vielelezo"],
  ["pipa la Kuchachusha", "pipa la kuchachusha"],
  ["mapipa ya Kuchachusha", "mapipa ya kuchachusha"],
  ["kuliko Kifaranga", "kuliko kifaranga"],
  ["sharubati ya Kakutasi", "sharubati ya Kaktasi"],
  ["huyo anaonekana kuwa mbichi", "huyo anaonekana kuwa safi"],
  ["samaki ni mbichi", "samaki ni safi"],
  [
    "chakula kingi cha moto na kibichi katika Mapipa haya",
    "chakula kingi cha moto na bado kizuri katika mapipa haya",
  ],
  ["vinavyoonekana vibichi", "vinavyoonekana bado vizuri"],
  ["Yeye ni kijana mwanamume mwema...^Yeye ni kijana mwanamke mwema...", "Yeye ni mwanamume kijana mwema...^Yeye ni mwanamke kijana mwema..."],
  ["${mwanamume mwema^kijana mwanamke mwema}", "${mwanamume mwema^mwanamke kijana mwema}"],
  ["Habari habari, mpenzi!", "Habari, habari, mpenzi!"],
  ["Lo, hapana hapana hapana...", "Lo, hapana, hapana, hapana..."],
  ["Basi basi, tuna nini hapa?", "Basi, basi, tuna nini hapa?"],
  ["Hmmph. Well...", "Hmmph. Basi..."],
  ["moja kwa moja Takatakani", "moja kwa moja takatakani"],
  ["kila Kasha la Junimo", "kila kasha la Junimo"],
  ["katika Makasha yoyote", "katika makasha yoyote"],
  ["chumba cha Kubadilishia nguo", "chumba cha kubadilishia nguo"],
  ["rudi Dereva wa basi", "rudi dereva wa basi"],
  ["ya Mgawaji", "ya mgawaji"],
  ["Gari la zamani", "gari la zamani"],
  ["Huondoa Ukuta", "Huondoa ukuta"],
  ["Hujenga Ukuta", "Hujenga ukuta"],
  ["Hurejesha Ukuta", "Hurejesha ukuta"],
  ["chumba cha Kuingilia", "chumba cha kuingilia"],
  ["eneo la Marekebisho", "eneo la marekebisho"],
  ["Huondoa Upanuzi", "Huondoa upanuzi"],
  ["Lenzi yangu", "lenzi yangu"],
  ["Wasaidizi wa Shamba", "Wafanyakazi wa Shamba"],
  ["hawako Mtandaoni", "hawako mtandaoni"],
  ["katika Bwawa la {0}", "katika bwawa la {0}"],
  ["jeshi langu la Viunzi vya Mifupa", "jeshi langu la viunzi vya mifupa"],
  ["Mimi ni Morris, Mwakilishi", "Mimi ni Morris, mwakilishi"],
  ["na Wenza wako wa zamani", "na wenza wako wa zamani"],
  ["Nambari hiyo hailingani kabisa na Makadirio yangu", "Nambari hiyo hailingani kabisa na makadirio yangu"],
  ["tulipokutana Bafuni", "tulipokutana bafuni"],
  ["siku moja Bafuni", "siku moja bafuni"],
  ["ulimwengu wetu Uliojaa Uhai", "ulimwengu wetu uliojaa uhai"],
  ["kutengeneza Moto wa Kambi wa kupikia", "kutengeneza moto wa kambi wa kupikia"],
  ["kuwavuta Majitu Zaidi", "kuwavuta majitu zaidi"],
  ["kuwaondoa Majitu Zaidi", "kuwaondoa majitu zaidi"],
  ["zaidi ya Mtego wa kawaida wa kaa", "zaidi ya mtego wa kawaida wa kaa"],
  ["Weka tu Mtego wako wa kaa", "Weka tu mtego wako wa kaa"],
  ["{0} Zawadi yake ya Siri", "{0} zawadi yake ya siri"],
  ["{0} Zawadi", "{0} zawadi"],
  ["ni Utani?", "ni utani?"],
  ["{0} Utani wa kikatili", "{0} utani wa kikatili"],
  ["%spouse katika Kifungo cha ndoa", "%spouse katika kifungo cha ndoa"],
  ["katika Kitengo cha televisheni", "katika kitengo cha televisheni"],
  ["Kujenga Banda lile la ute", "Kujenga banda lile la ute"],
  ["keki Bora ya chokoleti", "keki bora ya chokoleti"],
  ["Hati za Kuondolea Masharti ya Ukamilifu", "Hati za Msamaha wa Ukamilifu"],
  ["-Madhabahu ya giza ya Ubinafsi-", "-Madhabahu ya giza ya ubinafsi-"],
  ["-Madhabahu ya giza ya Kumbukumbu-", "-Madhabahu ya giza ya kumbukumbu-"],
  ["-Madhabahu ya giza ya vitisho vya Usiku-", "-Madhabahu ya giza ya vitisho vya usiku-"],
  ["--Madhabahu ya Changamoto--", "--Madhabahu ya changamoto--"],
  ["watageuka kuwa Hua", "watageuka kuwa hua"],
  ["kwenye Shamba lako usiku", "kwenye shamba lako usiku"],
  ["mchezo wa video Uliovuma sana", "mchezo wa video uliovuma sana"],
  ["-~-Mwongozo wa Bingwa wa kutengeneza Pombe-~-", "-~-Mwongozo wa bingwa wa kutengeneza pombe-~-"],
  ["na Wapishi wake", "na wapishi wake"],
  ["udanganyifu na Njama", "udanganyifu na njama"],
  ["kupata Msukumo fulani", "kupata msukumo fulani"],
  ["binti wa Mkusanya tiketi", "binti wa mkusanya tiketi"],
  ["riwaya ya Sayansi-Buni", "riwaya ya sayansi-buni"],
  ["mpenzi wa Sayansi-Buni", "mpenzi wa sayansi-buni"],
  ["kuunda Ushirikiano wa kutegemeana", "kuunda ushirikiano wa kutegemeana"],
  ["Kinamhusu Mpima ardhi wa Serikali", "Kinamhusu mpima ardhi wa serikali"],
  ["huna Vipendwa", "huna vipendwa"],
  ["Inaonekana ni Hospitali", "Inaonekana ni hospitali"],
  ["umezungukwa na Anasa", "umezungukwa na anasa"],
  ["Uko Mapiganoni!", "Uko mapiganoni!"],
  ["mbegu 15 za Parsnip!", "mbegu 15 za Parsnipi!"],
  ["ripoti ya Hitilafu", "ripoti ya hitilafu"],
  ["Stardew Valley imepata Hitilafu", "Stardew Valley imepata hitilafu"],
  ["Nina Mimba", "Nina mimba"],
  ["nina Mimba", "nina mimba"],
  ["Una Mimba", "Una mimba"],
  ["mojawapo ya Vituo ninavyopenda", "mojawapo ya vituo ninavyopenda"],
  ["Mwanasesere wa Sandukuni", "Mwanasesere wa sandukuni"],
  ["Historia ya Kijiolojia ya Stardew Valley", "Historia ya kijiolojia ya Stardew Valley"],
  ["Mitindo Iliyopatikana: Picha kutoka Mitaa", "Mitindo iliyopatikana: Picha kutoka mitaa"],
  ["kama Shampuu", "kama shampuu"],
  ["kutengeneza Kipako kitamu", "kutengeneza kipako kitamu"],
  ["--Kadi ya Ripoti--", "--Kadi ya ripoti--"],
  ["Zawadi Zilizotolewa:", "Zawadi zilizotolewa:"],
  ["Takataka Zilizorejelewa:", "Takataka zilizorejelewa:"],
  ["Majitu Yaliyouawa:", "Majitu yaliyouawa:"],
  ["Samaki Walionaswa:", "Samaki walionaswa:"],
  ["Ndoano Zilizorushwa:", "Ndoano zilizorushwa:"],
  ["Mbegu Zilizopandwa:", "Mbegu zilizopandwa:"],
  ["Kitunguu Saumu,Kabichi Nyekundu,Artichoke", "Kitunguu Saumu,Kabichi Nyekundu,Artichoki"],
  ["una Njaa?", "una njaa?"],
  ["Umepiga Hatua ngapi?", "Umepiga hatua ngapi?"],
];

// These quoted values are engine identifiers, not dialogue. Keep their source
// casing even though the event format also uses quotes for visible speech.
const postNormalizationTechnicalReplacements = [
  ["\"White chicken\"", "\"White Chicken\""],
  ["\"Brown chicken\"", "\"Brown Chicken\""],
  ["BO 113 5000 1 o 746 750 5 BL 746 2000 1 BO 47 350 -1 f 2870 4000 -1", "BO 113 5000 1 O 746 750 5 BL 746 2000 1 BO 47 350 -1 F 2870 4000 -1"],
  [" 0 wizard -1000", " 0 Wizard -1000"],
  ["/warp wizard ", "/warp Wizard "],
  ["/faceDirection wizard ", "/faceDirection Wizard "],
  ["/emote wizard ", "/emote Wizard "],
  ["/speak wizard ", "/speak Wizard "],
  // These are ordinary nouns in the listed prose contexts. Glossary-derived
  // display-name protection runs first, so restore sentence case afterwards.
  ["kila Kasha la Junimo huunganishwa", "kila kasha la Junimo huunganishwa"],
  ["katika Bwawa la {0}", "katika bwawa la {0}"],
  ["jeshi langu la Viunzi vya Mifupa", "jeshi langu la viunzi vya mifupa"],
  ["ulimwengu wetu Uliojaa Uhai", "ulimwengu wetu uliojaa uhai"],
  ["kutengeneza Moto wa Kambi wa kupikia", "kutengeneza moto wa kambi wa kupikia"],
  ["kuwavuta Majitu Zaidi kutoka mafichoni", "kuwavuta majitu zaidi kutoka mafichoni"],
  ["kuwaondoa Majitu Zaidi", "kuwaondoa majitu zaidi"],
  ["moja kwa moja kwenye Shamba lako", "moja kwa moja kwenye shamba lako"],
  ["kuwasha Moto Mkubwa sana", "kuwasha moto mkubwa sana"],
  ["Piza Ndogo ya kutosha", "Piza ndogo ya kutosha"],
];

// These labels are drawn in fixed-width game UI slots. Keep them concise even
// when a longer translation would be preferable in prose or a tooltip.
const keyedReplacements = new Map([
  ["Strings/StringsFromMaps\0ArchaeologyHouse.7", "Kimechakaa lakini bado kinapendeza."],
  ["Strings/StringsFromMaps\0Blacksmith.7", "Fuawe bora ya Clint. Imetengenezwa kwa aloi ya Iridiamu."],
  ["Strings/StringsFromMaps\0Blacksmith.8", "Fuawe bora ya Clint. Imetengenezwa kwa aloi ya Iridiamu."],
  ["Strings/StringsFromMaps\0FishShop.3", "Mfano mdogo wa frigeti."],
  ["Strings/StringsFromMaps\0HaleyHouse.7", "Ni roli ya kitambaa cha buluu. Kuna vipande vilivyokatwa na michoro midogo iliyodariziwa kando ya pindo."],
  ["Strings/StringsFromMaps\0HaleyHouse.10", "Ni meza ya kujipambia ya kifahari. Kuna kila aina ya krimu, rangi na poda kwenye uso wake."],
  ["Strings/StringsFromMaps\0HaleyHouse.16", "Keki ndogo, maziwa, chupa iliyofungwa vizuri ya matango madogo ya kachumbari na saladi ya quinoa."],
  ["Strings/StringsFromMaps\0HarveyRoom.9", "'Askari mpweke wa shinikizo la damu la mapafu'"],
  ["Strings/StringsFromMaps\0JojaMart.13", "Supu ya kopo"],
  ["Strings/StringsFromMaps\0JojaMart.36", "Kamba wa kopo."],
  ["Strings/StringsFromMaps\0JojaMart.75", "Mayai yaliyokorogwa ya kopo"],
  ["Strings/StringsFromMaps\0JojaMart.84", "Mayai yaliyokorogwa ya kopo"],
  ["Strings/StringsFromMaps\0JojaMart.86", "Samaki wa kopo... sasa wenye mchuzi wa kufanya meno meupe."],
  ["Strings/StringsFromMaps\0JojaMart.96", "Samaki wa kopo... sasa wenye mchuzi wa kufanya meno meupe."],
  ["Strings/StringsFromMaps\0JojaMart.99", "Milo ya kopo"],
  ["Strings/StringsFromMaps\0JojaMart.107", "Pasta ya kopo."],
  ["Strings/StringsFromMaps\0JojaMart.109", "Milo ya kopo"],
  ["Strings/StringsFromMaps\0JoshHouse.5", "Jarida la 'Misuli mikubwa'"],
  ["Strings/StringsFromMaps\0JoshHouse.6", "Ni uzani wa pauni thelathini."],
  ["Strings/StringsFromMaps\0JoshHouse.13", "'Maisha ya buluu iliyokolea: Kumbukumbu za mchimba makaa ya mawe'"],
  ["Strings/StringsFromMaps\0LeahHouse.4", "'Jinsi ya kukabiliana na watu wanaodhibiti wengine'"],
  ["Strings/StringsFromMaps\0ManorHouse.3", "Hutakuja kesho usiku?^Ukiingia kupitia dirisha la nyuma hakuna mtu atakayekuona.^Ningependa kukuona mara nyingi zaidi.^Ninajua una shughuli nyingi, lakini huwezi kutenga muda kwa ajili yangu?^Ninatumaini kukuona kesho.^-M"],
  ["Strings/StringsFromMaps\0Saloon.2", "Kituo cha upishi. Vidokezo vya upishi saa zote, vipindi vya mashindano na tathmini za migahawa."],
  ["Strings/StringsFromMaps\0SamHouse.5", "Plektramu za gitaa na magurudumu ya ubao wa kuteleza."],
  ["Strings/StringsFromMaps\0ScienceHouse.2", "Kwa mbunifu wa vifaa, kompyuta ya Maru ni ya zamani sana. Bado anahifadhi nakala za faili zake kwenye diski laini."],
  ["Strings/StringsFromMaps\0ScienceHouse.3", "'Jinsi ya kuiboresha ndoa yako ya pili' na 'Vidokezo vya vitendo kwa baba wa kambo wa mara ya kwanza'"],
  ["Strings/StringsFromMaps\0ScienceHouse.5", "'Mitandao ya neva ya hali ya juu'"],
  ["Strings/StringsFromMaps\0SeedShop.7", "'Safari ya Mfalme wa Nyanda: Toleo la konsoli'"],
  ["Strings/StringsFromMaps\0SeedShop.9", "Kwa Bwana Pierre:^Inaniuma kuwa mleta habari mbaya, lakini ninahisi nina wajibu wa kukujulisha kuhusu mabadiliko ya hivi karibuni yanayotishia sana riziki yako.^Joja Co. imeamua kupanuka hadi Mji wa Pelican.^Umechelewa sana kupinga. Wajenzi wa Joja tayari wameanza ujenzi wa JojaMart mpya.^^Lazima hii ni habari ya kusikitisha sana kwako. Miaka mingi sana katika biashara... duka la kutegemewa katika eneo hili... na sasa limefunikwa na kivuli cha shirika lenye nguvu, ufanisi na uwezo wa kiuchumi. Ni aibu iliyoje!^^Kama meneja wa JojaMart mpya, kwa kiasi fulani ninajiona kuwa na wajibu binafsi kwa hali yako. Kwa hiyo, ningependa kukupa nafasi ya msaidizi wa muuzaji wa vyakula. Mshahara huanzia 5g kwa saa. Ninatazamia kuona wasifu wako!^^-Bwana Morris, Meneja^JojaMart ya Mji wa Pelican"],
  ["Strings/StringsFromMaps\0Town-Fair.1", "Mtalii: Jamani... Siwezi kula hata tonge jingine la sandwichi hii ya barbekyu... nimeshiba sana."],
  ["Strings/StringsFromMaps\0Town-Fair.6", "Mtalii: Mna mji mzuri hapa. Ni wa kupendeza na wenye starehe, na kuna moyo halisi wa kijamii."],
  ["Strings/StringsFromMaps\0WitchHut.1", "Yeyote anayeishi hapa lazima aipende sana sakafu safi!"],
  ["Strings/StringsFromMaps\0WitchHut.3", "Huenda mfupa umefunikwa na bakteria. Unaamua kutougusa."],
  ["Strings/StringsFromMaps\0WitchHut.4", "Unafungua kizibo cha chupa na kuelekeza harufu kwenye pua yako. Harufu ni nzuri kwa kushangaza, ikiwa na dalili za aprikoti na Beri ya Viungo."],
  ["Strings/StringsFromMaps\0WitchHut.5", "Laani mashambani!... Kitabu cha uchawi kwa mchawi wa kijijini"],
  ["Strings/StringsFromMaps\0MovieTheater_CraneMan", "Mchezaji wa kreni: Siwezi kuzungumza... nimezingatia sana."],
  ["Strings/StringsFromMaps\0MovieTheater_CraneOccupied", "Mtu mwingine anatumia mchezo wa kreni."],
  ["Strings/StringsFromMaps\0MovieTheater_CraneMan2", "Mchezaji wa kreni: Karibu... nimekipata..."],
  ["Strings/StringsFromMaps\0MovieTheater_Lupini", "Lupini: Amatueri! Muundo wa mandhari ulikuwa wa kawaida kabisa!"],
  ["Strings/StringsFromMaps\0MovieTheater_Lupini2", "Lupini: Amatueri! Hata video ya nyumbani ya sherehe ya pili ya kuzaliwa ya mpwa wangu ilikuwa na upigaji picha bora zaidi!"],
  ["Strings/StringsFromMaps\0MovieTheater_ConcessionMan2", "Mtazamaji wa filamu: Ah, tazama bisi hizo zikitengenezwa! Lo, sauti... na harufu!"],
  ["Strings/StringsFromMaps\0MovieTheater_Morris2", "Ah, huyu ni mshirika wetu muhimu sana wa uwekezaji! Furahia onyesho, na usisahau kununua mfuko wa JojaCorn unapoingia!$h"],
  ["Strings/StringsFromMaps\0MovieTheater_CranePlay", "Ucheze mchezo wa kreni? (Hugharimu {0}g)"],
  ["Strings/StringsFromMaps\0IslandShrine_Shrine", "Mawingu meusi yanapolia, anza jitihada yako^Kutafuta ndege wanne wa vito wa hadithi^Kila siku, mmoja kaskazini, kusini, mashariki au magharibi^Panga zawadi zao mbele ya mlango wangu"],
  ["Strings/StringsFromMaps\0Pirates3", "HARAMIA ALIYEVALIA VIZURI: *kohoa*... Yar.#...#...Sijakushawishi, sivyo?#*ugua*...#Kwa kweli, sitaki kabisa kuwa haramia. Ningependelea kukuza mitende.#Kwa bahati mbaya, hakuna pesa katika biashara ya mitende..."],
  ["Strings/StringsFromMaps\0Pirates4", "BLACKGULL: Yar, mwenzangu. Lazima una jicho kali kuweza kuona ghuba yetu ya siri. Yo ho!"],
  ["Strings/StringsFromMaps\0Pirates5", "HARAMIA WA KUTISHA: Kutoka bahari za mbali, hadithi ya kutisha, jinamizi litakalokunyima usingizi...#Ilikuwa usiku wa manane nilipopoteza mikono yangu... kwa jitu katili la kilindini...#Yar, ni kweli...#...#...#..............#..............................................#Sawa, ninatania tu. Kwa kweli niliipoteza mikono hiyo nilipojaribu kuvua ganda la yai kutoka katika mashine ya kuchanganya.#Ole... siku zangu maarufu za mchanganyiko wa keki zimekwisha..."],
  ["Strings/StringsFromMaps\0Pirates8", "MHUDUMU WA BAA: Oi bwana!... Grog na vitafunwa ni kwa maharamia pekee."],
  ["Strings/StringsFromMaps\0Pirates7_2", "MTU WA DARTI: Ah, nimefurahi kukuona tena, mwenzangu! Tuone kama unaweza kupata alama 301 kwa... darti 10!"],
  ["Strings/StringsFromMaps\0Pirates7_Win", "MTU WA DARTI: Yar, nizame! Huo ni urushaji mzuri!"],
  ["Strings/StringsFromMaps\0Pirates7_Lose", "MTU WA DARTI: Yar... Kila la heri wakati ujao..."],
  ["Strings/StringsFromMaps\0PirateBartender_PirateClothes", "MHUDUMU WA BAA: Oi! Sijawahi kuona mtu kama wewe. Lakini ikiwa una mwonekano wa haramia, basi kunywa kimoja kwa gharama yangu! Har Har!"],
  ["Characters/Dialogue/Evelyn\0Tue", "Usimjali mume wangu, George. Si rafiki sana kwa wageni.#$e#Ukimjua vizuri zaidi atakuzoea.#$e#Nina hakika nyinyi wawili mnaweza kuwa marafiki wazuri siku moja!$h#$e#Kwa kuwa unavutiwa sana na mume wangu, nitakuambia siri kidogo: Anapenda sana liki! Unaweza kuzipata milimani wakati huu wa mwaka."],
  ["Characters/Dialogue/Sebastian\0Tue6", "Sam anapenda sana kuwa na watu, kwa hiyo tunapokuwa pamoja yeye ndiye anayezungumza zaidi.#$b#Sina tatizo na hilo!||Hebu fikiria kama Sam angekuwa mnyamavu kama mimi... tungekuwa pamoja bila kusema hata neno moja.$h||Watu wengine ni wazungumzaji, wengine ni wasikilizaji. Mimi ni msikilizaji zaidi."],
  ["Data/mail\0spring_15_2", "Mpendwa @,^Ningependa kumshangaza mume wangu kwa zawadi. Anapenda sana liki. Unaweza kuniletea moja?^   -Bibi Evelyn%item quest 116 %%[#]Mshangao wa Evelyn"],
  ["Strings/StringsFromCSFiles\0crane_game", "Mchezo wa Kreni"],
  ["Strings/StringsFromCSFiles\0crane_game_fast", "Mchezo wa Kreni (Nimekipata!)"],
  ["Strings/BigCraftables\0FeedHopper_Description", "Hutoa ufikiaji wa moja kwa moja wa chakula cha mifugo kutoka Ghala la Nyasi."],
  ["Data/hats\u00006", "Boneti ya Bluu/Hukumbusha nyakati tulivu zaidi ukiwa na boneti hii ya mbugani./false/true//Boneti ya Bluu"],
  ["Data/hats\0BucketHat", "Kofia ya Ndoo/Kofia ya kawaida yenye ukingo mfupi./false/true//Kofia ya Ndoo/102"],
  ["Strings/Objects\0StoneBase_Description", "Bamba la kawaida la jiwe."],
  ["Strings/Pants\0SimpleDress_Name", "Gauni la Kawaida"],
  ["Strings/Shirts\0PlainShirt_Name_Female", "Shati la Kawaida (K)"],
  ["Strings/Shirts\0PlainShirt_Name_Male", "Shati la Kawaida (M)"],
  ["Strings/Shirts\0PlainShirt_Description", "Shati la kawaida."],
  ["Strings/Shirts\0RetroRainbowShirt_Description", "Shati la kawaida lenye muundo wa upinde wa mvua uliofifia."],
  ["Strings/Shirts\0ButtonDownShirt_Description", "Shati la kawaida lililo safi."],
  ["Strings/Shirts\0ShirtAndBelt_Description", "Shati la kawaida lenye mkanda wa kahawia."],
  ["Strings/Shirts\0PlainOveralls_Name", "Ovaroli za Kawaida"],
  ["Strings/Shirts\0JewelryShirt_Description", "Shati lenye mnyororo wa kawaida wa dhahabu."],
  ["Strings/UI\0Character_FarmStandard", "Shamba la Kawaida_Kipande cha kawaida cha ardhi chenye nafasi kubwa wazi ya kubuni shamba lako."],
  ["Data/TV/TipChannel\u0000120", "Una jiko? Kupika ni njia nzuri ya kuimarisha uwezo wako. Milo haitoi tu chanzo kinachopatikana kwa urahisi cha nishati, bali mingi huongeza kwa muda ujuzi wako, kasi na mengine mengi! Inanukia vizuri, sivyo?"],
  ["Characters/Dialogue/Willy\0Fri4", "Mimi ni mtu wa kawaida... bomba langu likijaa, nina furaha. Bomba langu likiwa tupu... sawa, nalijaza tena.$u"],
  ["Strings/StringsFromCSFiles\0Utility.cs.5678", "{0} {1}, {2}"],
  ["Strings/StringsFromCSFiles\0Left", "Kushoto"],
  ["Strings/StringsFromCSFiles\0Right", "Kulia"],
  ["Strings/StringsFromCSFiles\0Left-Click", "Bofya Kushoto"],
  ["Strings/StringsFromCSFiles\0Right-Click", "Bofya Kulia"],
  ["Strings/StringsFromCSFiles\0Zoom", "Ukuzaji"],
  ["Strings/StringsFromCSFiles\0Escape", "Esc"],
  ["Strings/StringsFromCSFiles\0Space", "Nafasi"],
  ["Strings/StringsFromCSFiles\0PageUp", "Ukurasa Juu"],
  ["Strings/StringsFromCSFiles\0PageDown", "Ukurasa Chini"],
  ["Strings/StringsFromCSFiles\0End", "Mwisho"],
  ["Strings/StringsFromCSFiles\0Home", "Mwanzo"],
  ["Strings/StringsFromCSFiles\0Up", "Juu"],
  ["Strings/StringsFromCSFiles\0Down", "Chini"],
  ["Strings/StringsFromCSFiles\0Select", "Chagua"],
  ["Strings/StringsFromCSFiles\0Print", "Chapisha"],
  ["Strings/StringsFromCSFiles\0Execute", "Tekeleza"],
  ["Strings/StringsFromCSFiles\0Insert", "Ingiza"],
  ["Strings/StringsFromCSFiles\0Delete", "Futa"],
  ["Strings/StringsFromCSFiles\0PrintScreen", "Chapisha Skrini"],
  ["Strings/StringsFromCSFiles\0LeftWindows", "Windows ya Kushoto"],
  ["Strings/StringsFromCSFiles\0RightWindows", "Windows ya Kulia"],
  ["Strings/StringsFromCSFiles\0Apps", "Menyu"],
  ["Strings/StringsFromCSFiles\0Multiply", "Zidisha"],
  ["Strings/StringsFromCSFiles\0Add", "Jumlisha"],
  ["Strings/StringsFromCSFiles\0Separator", "Kitenganishi"],
  ["Strings/StringsFromCSFiles\0Subtract", "Toa"],
  ["Strings/StringsFromCSFiles\0Decimal", "Desimali"],
  ["Strings/StringsFromCSFiles\0Divide", "Gawanya"],
  ["Strings/StringsFromCSFiles\0Scroll", "Scroll Lock"],
  ["Strings/StringsFromCSFiles\0LeftShift", "Shift ya Kushoto"],
  ["Strings/StringsFromCSFiles\0RightShift", "Shift ya Kulia"],
  ["Strings/StringsFromCSFiles\0LeftControl", "Control ya Kushoto"],
  ["Strings/StringsFromCSFiles\0RightControl", "Control ya Kulia"],
  ["Strings/StringsFromCSFiles\0LeftAlt", "Alt ya Kushoto"],
  ["Strings/StringsFromCSFiles\0RightAlt", "Alt ya Kulia"],
  ["Strings/StringsFromCSFiles\0BrowserBack", "Kivinjari: Nyuma"],
  ["Strings/StringsFromCSFiles\0BrowserForward", "Kivinjari: Mbele"],
  ["Strings/StringsFromCSFiles\0BrowserRefresh", "Kivinjari: Onyesha Upya"],
  ["Strings/StringsFromCSFiles\0BrowserStop", "Kivinjari: Simamisha"],
  ["Strings/StringsFromCSFiles\0BrowserSearch", "Kivinjari: Tafuta"],
  ["Strings/StringsFromCSFiles\0BrowserFavorites", "Kivinjari: Vipendwa"],
  ["Strings/StringsFromCSFiles\0BrowserHome", "Mwanzo wa Kivinjari"],
  ["Strings/StringsFromCSFiles\0VolumeMute", "Nyamazisha Sauti"],
  ["Strings/StringsFromCSFiles\0VolumeDown", "Punguza Sauti"],
  ["Strings/StringsFromCSFiles\0VolumeUp", "Ongeza Sauti"],
  ["Strings/StringsFromCSFiles\0MediaNextTrack", "Wimbo Unaofuata"],
  ["Strings/StringsFromCSFiles\0MediaPreviousTrack", "Wimbo Uliopita"],
  ["Strings/StringsFromCSFiles\0MediaStop", "Simamisha Midia"],
  ["Strings/StringsFromCSFiles\0MediaPlayPause", "Cheza/Sitisha"],
  ["Strings/StringsFromCSFiles\0LaunchMail", "Fungua Barua"],
  ["Strings/StringsFromCSFiles\0SelectMedia", "Chagua Midia"],
  ["Strings/StringsFromCSFiles\0LaunchApplication1", "Fungua Programu 1"],
  ["Strings/StringsFromCSFiles\0LaunchApplication2", "Fungua Programu 2"],
  ["Strings/StringsFromCSFiles\0Semicolon", "Nuktamkato"],
  ["Strings/StringsFromCSFiles\0Plus", "Jumlisha"],
  ["Strings/StringsFromCSFiles\0Comma", "Koma"],
  ["Strings/StringsFromCSFiles\0Minus", "Toa"],
  ["Strings/StringsFromCSFiles\0Period", "Nukta"],
  ["Strings/StringsFromCSFiles\0Question", "Alama ya Swali"],
  ["Strings/StringsFromCSFiles\0ChatPadGreen", "ChatPad ya Kijani"],
  ["Strings/StringsFromCSFiles\0ChatPadOrange", "ChatPad ya Machungwa"],
  ["Strings/StringsFromCSFiles\0OpenBrackets", "Mabano ya Kufungua"],
  ["Strings/StringsFromCSFiles\0Pipe", "Mstari Wima"],
  ["Strings/StringsFromCSFiles\0CloseBrackets", "Mabano ya Kufunga"],
  ["Strings/StringsFromCSFiles\0Quotes", "Alama za Kunukuu"],
  ["Strings/StringsFromCSFiles\0Backslash", "Mkwaju wa Nyuma"],
  ["Strings/StringsFromCSFiles\0ProcessKey", "Kitufe cha Mchakato"],
  ["Strings/StringsFromCSFiles\0Copy", "Nakili"],
  ["Strings/StringsFromCSFiles\0Auto", "Otomatiki"],
  ["Strings/StringsFromCSFiles\0Clear", "Futa"],
  ["Strings/UI\0Character_FavoriteThing", "Kitu\nPendwa"],
  ["Strings/UI\0Character_Animal", "Mnyama\nPendwa"],
  ["Strings/UI\0Character_EyeColor", "Macho:"],
  ["Strings/UI\0Character_HairColor", "Rangi:"],
  ["Strings/UI\0Character_PantsColor", "Rangi:"],
  ["Strings/UI\0Character_ShirtColor", "Rangi:"],
  ["Strings/UI\0Character_DyeColor", "Rangi:"],
  ["Strings/UI\0Character_Accessory", "Kifaa"],
  ["Strings/UI\0Tailor_Feed", "Ingizo"],
  ["Strings/UI\0Clothes_Dyeable", "Inapakwa rangi."],
  ["Strings/UI\0AGO_CCB_Remixed", "Mchanganyiko"],
  ["Strings/UI\0PondQuery_EmptyPond", "Safisha Bwawa"],
  ["Strings/UI\0CoopMenu_HostNewFarm", "Fungua Shamba Jipya..."],
  ["Strings/UI\0mobile_options_date_time_size", "Ukubwa wa tarehe"],
  ["Strings/UI\0ParrotPlatform_Archaeology", "Mahali pa Kuchimba"],
  ["Strings/UI\0ShippingBin_LastItem", "Kitu cha Mwisho"],
  ["Strings/UI\0ExitToTitle", "Rudi Mwanzo"],
  ["Strings/UI\0CoopMenu_Host", "Kuwa Mwenyeji"],
  ["Strings/UI\0mobile_options_auto_save", "Hifadhi Otomatiki"],
  ["Strings/UI\0save_backup", "Nakala ya Hifadhi"],
  ["Strings/UI\0mobile_options_toolbar_slot_size", "Ukubwa wa zana"],
  ["Data/SecretNotes\u00002", "Ni orodha ya Sam ya ununuzi wa sikukuu^^Vipendwa vya kila mtu^^Sebastian: Chozi Lililoganda, Sashimi^Penny: Zumaridi, Popi^Vincent: Zabibu, Pipi ya Kranberi^Mama: Besi Mkukutu, Pankeki^Baba: Risoto ya Feri Iliyokunjamana, Jozi za Hazeli Zilizooka^Mimi: Tunda la Kaktasi, Donati ya Maple, Piza%revealtaste:Sebastian:84%revealtaste:Sebastian:227%revealtaste:Penny:60%revealtaste:Penny:376%revealtaste:Vincent:398%revealtaste:Vincent:612%revealtaste:Jodi:214%revealtaste:Jodi:211%revealtaste:Kent:649%revealtaste:Kent:607%revealtaste:Sam:90%revealtaste:Sam:731%revealtaste:Sam:206"],
  ["Data/SecretNotes\u00004", "Ni ujumbe wa Maru^^Vipuri vinavyohitajika bado kwa uvumbuzi wangu mkuu zaidi!^^*Ingoti ya Dhahabu^*Ingoti ya Iridiamu^*Pakiti ya Betri^*Almasi^*Stroberi%revealtaste:Maru:336%revealtaste:Maru:337%revealtaste:Maru:787%revealtaste:Maru:72%revealtaste:Maru:400"],
  ["Data/SecretNotes\u00005", "Ni mwandiko wa Penny:^^Nataka kumpatia kila mtu kitu anachokipenda!^^Mama: Parsnipi, Viazi Vikuu vya Sukari, BILA BIA!^Jas: Waridi la Peri, Pudingi ya Plamu^Vincent: Keki ya Waridi, Zabibu^Bw. Mullner: Liki, Uyoga Uliokaangwa^Bibi Mullner: Biti, Tulipu%revealtaste:Pam:24%revealtaste:Pam:208%revealtaste:Pam:346%revealtaste:Jas:595%revealtaste:Jas:604%revealtaste:Vincent:398%revealtaste:Vincent:221%revealtaste:George:20%revealtaste:George:205%revealtaste:Evelyn:284%revealtaste:Evelyn:591"],
  ["Strings/Notes\u000020", "Solok Ulan Paa Eno Ra Coto Ulan Coto Ulan Mabo Bel Eno Ra Teba Omi Walo Nemo^^Dop Ulan Coto Kui Mabo Awa Yoba Omi Solok Awa Lon Omi Omi Nemo^^Solok Teba Ra Awa Nemo Gawa Eno Bel Ulan Nemo Teba Omi Yoba Bel Omi Xi"],
  ["Strings/1_6_Strings\0StarterChicken_Names", "Portobello,Porcini | Chicky,Grushenka | Lucky,Clover | Salt,Pepper | Pecky,Clucky | Brunhilde,Gretchen | Billie,Bertha | Pickle,Zucchini | Peachie,Papaya | Potpourri,Ann | Buster,Scrappy | Petal,Twig | Cheeper,Squeaks | Skwash,Pumpkin | Goldie,Cocoa | Toast,Beans | Chip,Dip | Hazel,Peanut | Winky,Nod | Huffy,Puffy | Eggy,Ollie | Polka,Dot | Tiny,Shrimp | Fishy,Roe | Princess,Lady | Misty,Beluga | Snowy,Gingersnap | Honey,Biscuit | Piccolo,Viola | Potatoes,Gravy"],
  ["Data/Quests\u000013", "Basic/Kwenda Ufukweni/Mtu anayeitwa Willy amekualika utembelee ufukwe kusini mwa mji. Anasema ana kitu cha kukupa./Tembelea ufukwe kusini mwa mji kabla ya saa 11:00 jioni./-1/-1/0/-1/true"],
  ["Data/Quests\u000022", "Basic/Kasaroli ya Samaki/Jodi alipita shambani kukualika kwenye chakula cha jioni saa 1:00 usiku. Ombi lake pekee lilikuwa ulete Besi Mwenye Mdomo Mkubwa kwa ajili ya kasaroli yake ya samaki./Ingia nyumbani kwa Jodi ukiwa na Besi Mwenye Mdomo Mkubwa saa 1:00 usiku./-1/-1/0/-1/true"],
  ["Data/Quests\u0000117", "ItemDelivery/Tangazo la Pierre/Pierre atamlipa ‘pesa nyingi’ yeyote atakayemletea sahani ya Sashimi. Inaonekana anatamani sana chakula hicho./Mpelekee Pierre Sashimi./Pierre (O)227/-1/1000/-1/true/Hatimaye! Nilikuwa nimeanza kutetemeka, nilikuwa nikitamani sana samaki huyu. *tafuna*... Mmm, sasa hii ni tamu.#$b#Asante, @.$h"],
  ["Data/Quests\u0000123", "ItemDelivery/Fimbo ya Nguvu/Mchawi anatengeneza fimbo yenye nguvu za ajabu. Nani ajuaye itatumika kwa nini. Anahitaji Ingoti ya Iridiamu kuikamilisha./Mpelekee Mchawi Ingoti ya Iridiamu./Wizard (O)337/-1/5000/-1/true/Aah, iridiamu yenye thamani. Umefanya vizuri, @. Una shukrani yangu. Sasa, ondoka."],
  ["Data/Quests\u0000127", "Basic/Matembezi ya Keki ya Haley/Mke wako anaandaa matembezi ya keki ya hisani katika uwanja wa mji. Amekuomba ulete Keki ya Chokoleti./Ingia mjini asubuhi yenye jua ukiwa na Keki ya Chokoleti./-1/-1/0/-1/true"],
  ["Characters/Dialogue/Alex\0fall_Thu", "Kuna nini?#$e#Jina lako ni %firstnameletter%name au kitu kama hicho, sivyo?#$e#Lo. Ni @? Sawa. Samahani."],
].map(([compoundKey, value]) => {
  const separator = compoundKey.indexOf("\0");
  return [
    JSON.stringify([compoundKey.slice(0, separator), compoundKey.slice(separator + 1)]),
    value,
  ];
}));

for (const file of files) {
  const filePath = path.join(translationRoot, file);
  const document = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let fileChanged = false;

  for (const change of document.Changes ?? []) {
    for (const [key, original] of Object.entries(change.Entries ?? {})) {
      if (typeof original !== "string") continue;
      const keyedReplacement = keyedReplacements.get(JSON.stringify([change.Target, key]));
      const keyedCount = keyedReplacement !== undefined && keyedReplacement !== original ? 1 : 0;
      const duplicatedSafi = original.match(/\bsafii\b/gi)?.length ?? 0;
      const saloonLocative = original.match(/\bsalunini\b/gi)?.length ?? 0;
      const saloon = original.match(/\bsaluni\b/gi)?.length ?? 0;
      const joystick = original.match(/Fimbo ya Kudhibiti/g)?.length ?? 0;
      const phraseCount = phraseReplacements.reduce(
        (count, [from]) => count + original.split(from).length - 1,
        0,
      );
      let normalized = (keyedReplacement ?? original)
        .replace(/\bsafii\b/gi, (value) => value[0] === "S" ? "Safi" : "safi")
        .replace(/\bsalunini\b/gi, (value) =>
          value[0] === "S" ? "Kwenye Baa ya Tunda la Nyota" : "kwenye Baa ya Tunda la Nyota"
        )
        .replace(/\bsaluni\b/gi, "Baa ya Tunda la Nyota")
        .replace(/Fimbo ya Kudhibiti/g, "Kijiti cha Kudhibiti");
      for (const [from, to] of phraseReplacements) normalized = normalized.replaceAll(from, to);
      const capitalization = normalizeCapitalization(normalized, change.Target, key);
      normalized = capitalization.value;
      const canonicalCapitalization = canonicalizeCapitalization(normalized, change.Target, key);
      normalized = canonicalCapitalization.value;
      let technicalRestorations = 0;
      for (const [from, to] of postNormalizationTechnicalReplacements) {
        const occurrences = normalized.split(from).length - 1;
        if (occurrences > 0) {
          normalized = normalized.replaceAll(from, to);
          technicalRestorations += occurrences;
        }
      }
      const totalReplacements = keyedCount
        + duplicatedSafi
        + saloonLocative
        + saloon
        + joystick
        + phraseCount
        + capitalization.count
        + canonicalCapitalization.count
        + technicalRestorations;
      if (!totalReplacements || normalized === original) continue;
      change.Entries[key] = normalized;
      replacements += totalReplacements;
      changedEntries += 1;
      fileChanged = true;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, `${JSON.stringify(document, null, 2)}\n`);
    changedFiles += 1;
  }
}

console.log(
  `Normalized ${replacements} editorial tokens in ${changedEntries} entries across ${changedFiles} files.`,
);
