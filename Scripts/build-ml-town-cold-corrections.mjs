#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cache = JSON.parse(fs.readFileSync(path.join(root, "ml-translation-cache.json"), "utf8")).entries;
const edits = [
  ["2481135/f Alex", [
    ["അത് നല്ല കുട്ടിയാണ്, ഡസ്റ്റി.", "മിടുക്കൻ, ഡസ്റ്റി."],
    ["എനിക്കും അമ്മയ്ക്കും വേണ്ടി എല്ലാം നശിപ്പിച്ചു", "എന്റെയും അമ്മയുടെയും ജീവിതം തകർത്തു"],
  ]],
  ["didntHear", [
    ["എനിക്കും അമ്മയ്ക്കും വേണ്ടി എല്ലാം നശിപ്പിച്ചു", "എന്റെയും അമ്മയുടെയും ജീവിതം തകർത്തു"],
  ]],
  ["639373/f Lewis", [
    ["മാർനി... നമുക്ക് പാടില്ല.", "മാർണി... നമുക്ക് പാടില്ല."],
  ]],
  ["53/e 55", [
    ["ഒരു ഭൗതിക വസ്തുവിന് വ്യക്തിത്വം ശരിയായി നൽകാനുള്ള കാഴ്ചക്കാരന്റെ കഴിവുമായി കളിക്കാനായി", "ഒരു ഭൗതിക സത്തയ്ക്ക് വ്യക്തിയെന്ന നില ശരിയായി കൽപ്പിക്കാനുള്ള കാഴ്ചക്കാരന്റെ കഴിവിനെ പരീക്ഷിക്കാനായി"],
  ]],
  ["101/f Clint", [
    ["നീയൊരു വില്ലനാണ്, @.", "ഇതു വല്ലാത്ത വില്ലത്തരമാണ്, @."],
    ["ഗ്രാംപിൽട്ടൺ കാർണിവലിനായി", "ഗ്രാമ്പിൾട്ടൺ കാർണിവലിനായി"],
    ["ഓ മനുഷ്യാ... എനിക്ക് വല്ലാതെ പരിഭ്രമമുണ്ട്.", "അയ്യോ... എനിക്ക് വല്ലാതെ പരിഭ്രമമുണ്ട്."],
  ]],
  ["233104/f Sam", [
    ["നമ്മൾ ഇത്ര അടുത്ത സുഹൃത്തുക്കളായതിൽ എനിക്ക് ശരിക്കും സന്തോഷമുണ്ട്", "നമ്മൾ തമ്മിൽ ഇത്ര അടുത്തതിൽ എനിക്ക് ശരിക്കും സന്തോഷമുണ്ട്"],
  ]],
  ["191393/Hn", [
    ["ഈ പട്ടണം നശിക്കുന്നത് കാണാൻ ഞാൻ ഇവിടെ വളരെക്കാലമായി ജീവിച്ചു.", "ഇത്രയും കാലം ഇവിടെ ജീവിച്ചിട്ട് ഈ പട്ടണം നശിക്കുന്നത് നോക്കിനിൽക്കാനാവില്ല."],
  ]],
  ["502261/J", [
    ["ജോജ ആസ്ഥാനത്തെ മഹത്തായ നവോത്ഥാനികൾ ജോജ കമ്മ്യൂണിറ്റി ഡെവലപ്‌മെന്റ് പ്രോജക്റ്റ്", "ജോജ ആസ്ഥാനത്തെ പ്രഗത്ഭരായ നൂതനാശയക്കാർ ജോജ സമൂഹവികസന പദ്ധതി"],
    ["ഞങ്ങളുടെ കമ്മ്യൂണിറ്റി ഡെവലപ്‌മെന്റ് പൈലറ്റ് പ്രോഗ്രാം", "ഞങ്ങളുടെ സമൂഹവികസന പരീക്ഷണപരിപാടി"],
  ]],
  ["502969/w sunny", [
    ["വൃത്തികെട്ട കീടങ്ങൾ", "വൃത്തികെട്ട ശല്യജീവികൾ"],
  ]],
  ["611173/Hn pamHouseUpgrade", [
    ["പെന്നി, നിനക്ക് ദാരിദ്ര്യത്തിൽ വളരേണ്ടിവന്നതിൽ എനിക്ക് വിഷമമുണ്ട്", "പെന്നി, അഴുക്കും ദുരിതവും നിറഞ്ഞ സാഹചര്യത്തിൽ നിനക്ക് വളരേണ്ടിവന്നതിൽ എനിക്ക് വിഷമമുണ്ട്"],
  ]],
  ["3917586/e", [
    ["എനിക്ക് 'ആ ആഗ്രഹം' ഉണ്ടാകുമ്പോൾ", "കുടിക്കാനുള്ള 'ആ ത്വര' തോന്നുമ്പോൾ"],
  ]],
];

function resolveId(needle) {
  const prefix = "Data/Events/Town\u0000";
  const exact = `${prefix}${needle}`;
  if (Object.hasOwn(cache, exact)) return exact;
  const matches = Object.keys(cache).filter((id) => id.startsWith(prefix) && id.includes(needle));
  if (matches.length !== 1) throw new Error(`Expected one Town ID for ${needle}, got ${matches.length}`);
  return matches[0];
}

const output = {};
for (const [needle, replacements] of edits) {
  const id = resolveId(needle);
  let value = output[id] ?? cache[id].translation;
  for (const [before, after] of replacements) {
    const count = value.split(before).length - 1;
    if (count !== 1) throw new Error(`Expected one occurrence in ${id}, got ${count}: ${before}`);
    value = value.replace(before, after);
  }
  output[id] = value;
}

const outputPath = path.join(root, "ml-batches/main-events-town-cold-corrections.json");
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ records: Object.keys(output).length, outputPath }, null, 2));
