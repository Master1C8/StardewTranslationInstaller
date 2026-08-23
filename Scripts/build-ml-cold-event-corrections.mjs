#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cache = JSON.parse(
  fs.readFileSync(path.join(root, "ml-translation-cache.json"), "utf8"),
).entries;

const edits = [
  ["Data/Events/FarmHouse", "3918600/f Sam", [
    ["ഓ, ഏ... തീർച്ചയായും നീ കഴിഞ്ഞിട്ട്!", "ഓ, ഏ... തീർച്ചയായും നിന്നെ ഒഴിച്ചാൽ!"],
  ]],
  ["Data/Events/FarmHouse", "3917626", [
    ["പൂപ്പലിന്റെ രുചി", "ഫംഗസിന്റെ രുചി"],
    ["'ഗോതമ്പ് മുഴുവനായുള്ള' പാസ്ത", "'മുഴുഗോതമ്പ്' പാസ്ത"],
    ["രുചികരവും ഭക്ഷ്യയോഗ്യവുമായ പൂപ്പൽ എന്നാണ് ഉദ്ദേശിച്ചത്", "നീ ഉദ്ദേശിച്ചത് രുചികരവും ഭക്ഷ്യയോഗ്യവുമായ ഫംഗസാണല്ലോ"],
  ]],
  ["Data/Events/FarmHouse", "4325434/f Penny", [
    ["ഓ! ശരി... എന്നാൽ അതിനെക്കുറിച്ച് വിഷമിക്കേണ്ട.$s", "ഓ! ശരി... എന്നാൽ ഞാൻ അതിനെക്കുറിച്ച് വിഷമിക്കില്ല.$s"],
  ]],
  ["Data/Events/FarmHouse", "9333220/e", [
    ["...ഒരുപാടു വഴുവഴുപ്പുള്ളതുമായി!", "...വഴുവഴുപ്പും ഒരുപാടു കൂടി!"],
  ]],
  ["Data/Events/Forest", "fieldTripEnd", [
    ["നിനക്ക് എപ്പോഴെങ്കിലും ഒരു മാതാപിതാവാകാൻ ആഗ്രഹമുണ്ടോ", "നിനക്ക് എപ്പോഴെങ്കിലും ഒരു രക്ഷിതാവാകാൻ ആഗ്രഹമുണ്ടോ"],
    ["ഇല്ല, അതിൽ ഞാൻ നല്ലവനായിരിക്കുമെന്ന് തോന്നുന്നില്ല.", "ഇല്ല, ഞാൻ നല്ലൊരു രക്ഷിതാവാകുമെന്ന് തോന്നുന്നില്ല."],
  ]],
  ["Data/Events/Forest", "52/f Leah", [
    ["നീ കാണുന്നതിലും ശക്തനാണല്ലോ!", "നിനക്ക് കാണുന്നതിലും കൂടുതൽ കരുത്തുണ്ടല്ലോ!"],
  ]],
  ["Data/Events/Forest", "54/f Leah", [
    ["നീ ഇവിടെ എന്ത് കോപ്പാണ് ചെയ്യുന്നത്?", "നീ ഇവിടെ എന്താണീ ചെയ്യുന്നത്?"],
    ["KEL: കലാപ്രദർശനത്തിൽ", "കെൽ: കലാപ്രദർശനത്തിൽ"],
    ["സൂസു സിറ്റിയിൽനിന്ന്", "സൂസൂ നഗരത്തിൽനിന്ന്"],
    ["KEL: നിന്നെ എന്നോടൊപ്പം", "കെൽ: നിന്നെ എന്നോടൊപ്പം"],
    ["KEL: കാര്യങ്ങൾ പഴയതുപോലെ", "കെൽ: കാര്യങ്ങൾ പഴയതുപോലെ"],
    ["നിന്നെ എനിക്ക് മിസ് ചെയ്യുന്നു", "നിന്നെ വല്ലാതെ ഓർക്കുന്നു"],
    ["നിന്നെക്കുറിച്ച് എനിക്ക് വെറുപ്പാണ്", "നിന്നെ കാണുമ്പോൾ എനിക്ക് അറപ്പു തോന്നുന്നു"],
    ["KEL: ഹേയ്!", "കെൽ: ഹേയ്!"],
    ["#കെന്നിന്റെ മുഖത്ത് ഇടിക്കൂ.#കെന്നുമായി സംസാരിച്ച് മനസ്സിലാക്കാൻ ശ്രമിക്കൂ.", "#കെലിന്റെ മുഖത്ത് ഇടിക്കുക.#കെലിനെ പറഞ്ഞു മനസ്സിലാക്കാൻ ശ്രമിക്കുക."],
  ]],
  ["Data/Events/Forest", "choseInternet", [
    ["ശരി, ഞാൻ ആഗ്രഹിച്ചതുപോലെയല്ല ഈ വനഭോജനം നടന്നത്.$h", "ശരി, പിക്‌നിക് ഞാൻ ആഗ്രഹിച്ചതുപോലെ നടന്നില്ല.$h"],
  ]],
  ["Data/Events/Forest", "noPunch", [
    ["ബുദ്ധിയില്ലാത്ത ഈ നാട്ടുമ്പുറത്തുകാരനോടൊപ്പം", "ബുദ്ധിയില്ലാത്ത ഈ നാട്ടിൻപുറ വിഡ്ഢിയോടൊപ്പം"],
    ["ശരി, ഞാൻ ആഗ്രഹിച്ചതുപോലെയല്ല ഈ വനഭോജനം നടന്നത്.$h", "ശരി, പിക്‌നിക് ഞാൻ ആഗ്രഹിച്ചതുപോലെ നടന്നില്ല.$h"],
  ]],
  ["Data/Events/Forest", "611944", [
    ["ഇതാ, തണുത്തൊരു പാനീയം കഴിക്കൂ.", "ഇതാ, തണുത്തൊരു ബിയർ കുടിക്കൂ."],
  ]],
  ["Data/Events/Forest", "3910979", [
    ["വ...വസന്ത ഉള്ളി", "ഉ...ഉള്ളിത്തണ്ട്"],
    ["വസന്ത ഉള്ളി വൃത്തിയാക്കാൻ", "ഉള്ളിത്തണ്ട് വൃത്തിയാക്കാൻ"],
    ["വസന്ത ഉള്ളിക്ക് ഇനി", "ഉള്ളിത്തണ്ടിന് ഇനി"],
  ]],
  ["Data/Events/Farm", "66/e 295672", [
    ["'തുരുമ്പിച്ച താക്കോൽ'", "'തുരുമ്പുപിടിച്ച താക്കോൽ'"],
  ]],
  ["Data/Events/Farm", "690006", [
    ["സ്ലൈം വളർത്തുശാല", "സ്ലൈംശാല"],
    ["സ്ലൈം വിരിയിക്കുന്ന യന്ത്രത്തിനുള്ളിൽ", "സ്ലൈം വിരിയിക്കൽപെട്ടിക്കുള്ളിൽ"],
  ]],
  ["Data/Events/Farm", "91/f Marnie", [
    ["ഗുഹാ കാരറ്റ്", "ഗുഹാക്കാരറ്റ്", "all"],
  ]],
  ["Data/Events/Farm", "2118991", [
    ["ഹാർവി അയാളുടെ ഒരു സഹപ്രവർത്തകനെ ബന്ധപ്പെടാൻ സഹായിച്ചു", "ഹാർവി അയാളുടെ സഹപ്രവർത്തകരിലൊരാളുമായി ബന്ധപ്പെടാൻ സഹായിച്ചു"],
  ]],
  ["Data/Events/Farm", "980558", [
    ["മിനി-ജൂക്ക്ബോക്സ്", "ചെറു സംഗീതപ്പെട്ടി", "all"],
  ]],
  ["Data/Events/Town", "6184644", [
    ["ഗുഹാ കാരറ്റ് ലോഫ്", "ഗുഹാക്കാരറ്റ് ലോഫ്"],
  ]],
];

function resolveId(target, needle) {
  const prefix = `${target}\u0000`;
  const matches = Object.keys(cache).filter((id) => id.startsWith(prefix) && id.includes(needle));
  if (matches.length !== 1) {
    throw new Error(`Expected one ID for ${target} / ${needle}, got ${matches.length}`);
  }
  return matches[0];
}

const output = {};
for (const [target, needle, replacements] of edits) {
  const id = resolveId(target, needle);
  let value = output[id] ?? cache[id].translation;
  if (!value) throw new Error(`Missing translated value: ${id}`);
  for (const [before, after, mode] of replacements) {
    const occurrences = value.split(before).length - 1;
    if (occurrences === 0) throw new Error(`Text not found in ${id}: ${before}`);
    if (mode !== "all" && occurrences !== 1) {
      throw new Error(`Expected one occurrence in ${id}, got ${occurrences}: ${before}`);
    }
    value = mode === "all" ? value.split(before).join(after) : value.replace(before, after);
  }
  output[id] = value;
}

const outputPath = path.join(root, "ml-batches/main-final-cold-event-corrections.json");
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ records: Object.keys(output).length, outputPath }, null, 2));
