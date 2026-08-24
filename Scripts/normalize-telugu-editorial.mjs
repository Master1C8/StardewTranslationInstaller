#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const editorialFile = path.join(projectRoot, "Documentation/telugu-editorial-overrides.json");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/telugu",
);

const literalRules = [
  ["అబిగెయిల్", "అబిగేల్"],
  ["%Abigail", "%అబిగేల్"],
  ["%Maru", "%మారు"],
  ["డెమీట్రియస్", "డెమెట్రియస్"],
  ["మోరిస్", "మారిస్"],
  ["మారూ", "మారు"],
  ["శీతకాల", "శీతాకాల"],
  ["చలికాల", "శీతాకాల"],
  ["పరిపూర్ణత", "సంపూర్ణత"],
  ["మూలతత్త్వ యుద్ధాలు", "మూలకాల యుద్ధాలు"],
  ["ప్రెయిరీ రాజు", "మైదాన రాజు"],
  ["బహుమతి ప్రవేశపత్రం", "బహుమతి చీటి"],
  ["చిన్న జూక్‌బాక్స్", "చిన్న సంగీత పెట్టె"],
  ["బహుమతికు", "బహుమతికి"],
  ["బహుమతిల", "బహుమతుల"],
  ["కత్తిాన్ని", "కత్తిని"],
  ["కత్తింతో", "కత్తితో"],
  ["వివాహంని", "వివాహాన్ని"],
];

const contextualRules = [
  {
    source: /\byear(?:s)?\b/iu,
    canonicalStem: "సంవత్సర",
    replacements: [
      ["ఏడాదిన్నర", "సంవత్సరన్నర"],
      ["ఏడాదంతా", "సంవత్సరమంతా"],
      ["ఏడాదికి", "సంవత్సరానికి"],
      ["ఏడాదిలో", "సంవత్సరంలో"],
      ["ఏళ్లుగా", "సంవత్సరాలుగా"],
      ["ఏళ్లకు", "సంవత్సరాలకు"],
      ["ఏళ్లలో", "సంవత్సరాల్లో"],
      ["ఏళ్ల", "సంవత్సరాల"],
      ["ఏళ్లు", "సంవత్సరాలు"],
      ["ఏళ్ళ", "సంవత్సరాల"],
      ["ఏడాది", "సంవత్సరం"],
    ],
  },
  {
    source: /\bseason(?:s|'s)?\b/iu,
    canonicalStem: "ఋతు",
    replacements: [
      ["కాలంలో", "ఋతువులో"],
      ["కాలానికి", "ఋతువుకు"],
      ["కాలపు", "ఋతువు"],
      ["కాలమంతా", "ఋతువంతా"],
      ["కాలం", "ఋతువు"],
    ],
    once: true,
  },
  {
    source: /\bore\b/iu,
    canonicalStem: "ఖనిజ ముడి",
    replacements: [
      ["ఖనిజ ముక్కలు", "ఖనిజ ముడి ముక్కలు"],
      ["ఖనిజాన్ని", "ఖనిజ ముడిని"],
      ["ఖనిజం", "ఖనిజ ముడి"],
    ],
  },
  {
    source: /\bgift(?:s)?\b/iu,
    canonicalStem: "బహుమత",
    replacements: [["కానుక", "బహుమతి"]],
  },
  {
    source: /\brecipe(?:s)?\b/iu,
    canonicalStem: "వంట విధాన",
    replacements: [
      ["వంటకాన్నీ", "వంట విధానాన్నీ"],
      ["వంటకాన్ని", "వంట విధానాన్ని"],
      ["వంటకాల", "వంట విధానాల"],
      ["వంటకాలు", "వంట విధానాలు"],
      ["వంటకం", "వంట విధానం"],
    ],
  },
  {
    source: /\bsapling(?:s)?\b/iu,
    canonicalStem: "నారు",
    replacements: [["చిన్న చెట్టు", "నారు"], ["చెట్టు మొక్క", "నారు"], ["మొక్క", "నారు"]],
    once: true,
  },
  {
    source: /\bSword\b/u,
    canonicalStem: "కత్తి",
    replacements: [["ఖడ్గం", "కత్తి"], ["ఖడ్గ", "కత్తి"]],
  },
  {
    source: /\bmarriage\b/iu,
    canonicalStem: "వివాహ",
    replacements: [["పెళ్లికి", "వివాహానికి"], ["పెళ్లి", "వివాహం"]],
  },
  {
    source: /\bFishing\b/u,
    canonicalStem: "చేపలు పట్ట",
    replacements: [["చేపల వేట", "చేపలు పట్టడం"], ["మత్స్యవేట", "చేపలు పట్టడం"]],
  },
  {
    source: /\bMining\b/u,
    canonicalStem: "గనిపని",
    replacements: [["గనుల పని", "గనిపని"], ["గని పని", "గనిపని"], ["గని తవ్వకం", "గనిపని"]],
  },
  {
    source: /\bJournal\b/u,
    canonicalStem: "పనుల నమోద",
    replacements: [["జర్నల్", "పనుల నమోదు"], ["దినచర్య పుస్తకం", "పనుల నమోదు"]],
  },
  {
    source: /\bJodi\b/u,
    canonicalStem: "జోడీ",
    replacements: [["జోడికి", "జోడీకి"], ["జోడి", "జోడీ"]],
  },
  {
    source: /\bPierre\b/u,
    canonicalStem: "పియెర్",
    replacements: [["పియర్", "పియెర్"]],
  },
  {
    source: /\bPrize Tickets?\b/u,
    canonicalStem: "బహుమతి చీటి",
    replacements: [
      ["బహుమతి ప్రవేశపత్రాలు", "బహుమతి చీటీలు"],
      ["బహుమతి ప్రవేశపత్రాల", "బహుమతి చీటీల"],
      ["ప్రవేశపత్రాలు", "చీటీలు"],
      ["ప్రవేశపత్రాల", "చీటీల"],
    ],
  },
];

function normalize(value, english = "") {
  let result = value;
  for (const [source, target] of literalRules) result = result.replaceAll(source, target);
  for (const rule of contextualRules) {
    rule.source.lastIndex = 0;
    if (!rule.source.test(english) || result.includes(rule.canonicalStem)) continue;
    for (const [source, target] of rule.replacements) {
      if (!result.includes(source)) continue;
      result = rule.once ? result.replace(source, target) : result.replaceAll(source, target);
      if (rule.once) break;
    }
  }
  return result;
}

const editorial = JSON.parse(fs.readFileSync(editorialFile, "utf8"));
let editorialChanges = 0;
for (const record of Object.values(editorial.records)) {
  const normalized = normalize(record.translation, record.english);
  if (normalized === record.translation) continue;
  record.translation = normalized;
  editorialChanges += 1;
}
fs.writeFileSync(editorialFile, `${JSON.stringify(editorial, null, 2)}\n`);

let patchChanges = 0;
for (const name of fs.readdirSync(translationRoot).filter((item) => item.endsWith(".json"))) {
  const file = path.join(translationRoot, name);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      const normalized = normalize(value);
      if (normalized === value) continue;
      change.Entries[key] = normalized;
      patchChanges += 1;
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

console.log(JSON.stringify({ editorialChanges, patchChanges }, null, 2));
