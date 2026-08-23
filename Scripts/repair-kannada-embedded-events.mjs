#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error("Usage: node Scripts/repair-kannada-embedded-events.mjs <English-assets-dir>");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/kannada",
);
const embeddedEvent = /(?:^|\/)\s*(?:speak|pause|message|faceDirection|emote|jump|move|animate|playSound|viewport|end)\b/;

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const sourceCache = new Map();
function sourceContent(target) {
  if (!sourceCache.has(target)) {
    sourceCache.set(target, readJSON(path.join(sourceRoot, `${target}.json`)).content);
  }
  return sourceCache.get(target);
}

function mergeEventSkeleton(original, translated) {
  const sourceParts = original.split('"');
  const targetParts = translated.split('"');
  if (sourceParts.length !== targetParts.length) return undefined;
  return sourceParts.map((sourcePart, index) => {
    // Slash-bearing pieces are the event program around quoted dialogue. The
    // quote-delimited and summit-prefix pieces are player-facing translations.
    return sourcePart.includes("/") ? sourcePart : targetParts[index];
  }).join('"');
}

function replaceQuotedDialogue(original, translations) {
  let index = 0;
  const result = original.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, () => {
    const translated = translations[index];
    if (translated === undefined) throw new Error("Not enough translated dialogue segments");
    index += 1;
    return `"${translated.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  });
  if (index !== translations.length) {
    throw new Error(`Unused translated dialogue segments: ${translations.length - index}`);
  }
  return result;
}

const exactOverrides = new Map([
  [
    "Data/ExtraDialogue\0SummitEvent_Dialogue3_Alex",
    "ನಾನು ಕೊನೆಗೂ ಯಾರಾಗಬೇಕೆಂದು ಕಂಡುಕೊಂಡಿದ್ದೇನೆ... ಭವಿಷ್ಯದ ಬಗ್ಗೆ ನನಗೆ ಈಗ ದೃಢ ವಿಶ್ವಾಸವಿದೆ.\"/pause 500/speak Alex \"ನೀನು ಇರದಿದ್ದರೆ ನಾನು ಇಲ್ಲಿಯವರೆಗೆ ಬರಲು ಸಾಧ್ಯವಾಗುತ್ತಿರಲಿಲ್ಲ, @.\"",
  ],
  [
    "Data/ExtraDialogue\0SummitEvent_Dialogue3_Sebastian",
    "ನಿನ್ನನ್ನು ಭೇಟಿಯಾಗುವ ಮೊದಲು, ನಾನು ವಾಸ್ತವದಿಂದ ದೂರವಾಗಿ ಹೆಚ್ಚು ಸಮಯ ಕಳೆಯುತ್ತಿದ್ದೆ... ಏಕೆಂದರೆ ನನಗೆ ಸಂತೋಷ ಸಿಗುವುದೇ ಇಲ್ಲವೆಂದುಕೊಂಡಿದ್ದೆ.#$b#...ಆದರೆ ಜಗತ್ತು ಅಷ್ಟೊಂದು ಕತ್ತಲೆಯ ಸ್ಥಳವಲ್ಲ ಎಂದು ನೀನು ತೋರಿಸಿದ್ದೀಯ.$h\"/faceDirection Sebastian 3/pause 500/speak Sebastian \"...ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುವ ಕಾರಣಗಳಲ್ಲಿ ಇದೂ ಒಂದು...\"",
  ],
  [
    "Data/ExtraDialogue\0SummitEvent_Dialogue3_Emily",
    "ಇದು ವಿಶೇಷ ಕ್ಷಣ...#$b#ಒಂದು ದಿನ ನಿನ್ನೊಂದಿಗೆ ಇಲ್ಲಿ ನಿಂತಿರುತ್ತೇನೆ ಎಂದು ನನಗೆ ಸದಾ ತಿಳಿದಿತ್ತು. ಅದನ್ನು ಹೃದಯದಲ್ಲಿ ಅನುಭವಿಸುತ್ತಲೇ ಇದ್ದೆ.#$b#ಈಗ ಅದೆಲ್ಲ ನಿಜವಾಗಿದೆ.\"/pause 500/speak Emily \"ಈ ಜಗತ್ತು ನಿಗೂಢವೂ ವಿಶೇಷವೂ ಆದ ಸ್ಥಳ...$l\"",
  ],
]);

const visibleTechnicalTextReplacements = new Map([
  [
    "Strings/Locations\0IslandSecret_Event_BirdieFinished",
    [[
      "#It's an honorable thing to do.#He's gone. You should live your life.",
      "#ಇದು ಗೌರವಯುತವಾದ ಕೆಲಸ.#ಅವರು ಹೋಗಿದ್ದಾರೆ. ನೀವು ನಿಮ್ಮ ಜೀವನವನ್ನು ಬದುಕಬೇಕು.",
    ]],
  ],
]);

const quotedOverrides = new Map([
  [
    "Data/ExtraDialogue\0SkullCavern_100_event",
    [
      "ಓಹೋ... ಕೊನೆಗೂ ಇಲ್ಲಿಗೆ ತಲುಪಿದ್ದೀಯ.",
      "ಹತ್ತಿರ ಬಾ... ಸಂಕೋಚಪಡಬೇಡ.",
      "ಇಂದು ನೀನು ಈ ಗುಹೆಗಳ ಆಳಕ್ಕೆ ಇಳಿಯಲು ಪ್ರಯತ್ನಿಸುತ್ತಿದ್ದೀಯೆಂದು ಕೇಳಿದೆ...#$b#ನಾನೇ ಬಂದು ನೋಡಬೇಕಾಯಿತು!",
      "ಅದ್ಭುತ... ನಿಜಕ್ಕೂ ಅದ್ಭುತ. ಇಲ್ಲಿಯವರೆಗೆ ಇಳಿಯುವುದು ದೊಡ್ಡ ಸಾಧನೆ!#$b#...ಆದರೆ ಮೆಟ್ಟಿಲುಗಳನ್ನು ತಯಾರಿಸಿ ಹಲವು ಮಹಡಿಗಳನ್ನು ಬಿಟ್ಟುಬಂದಿದ್ದೀಯ. ಜಾಣತನವೇ ಸರಿ... ಆದರೆ ಅಷ್ಟೇನೂ ಗೌರವಯುತವಲ್ಲ.$1#$b#ಆದರೂ, ಅಷ್ಟು ಕಲ್ಲು ಗಣಿಗಾರಿಕೆ ಮಾಡಲು ಬಹಳ ಶ್ರಮ ಬೇಕಾಗಿರಬೇಕು. ಆ ಬದ್ಧತೆ ಮೆಚ್ಚುವಂಥದು. ನೀನು ಅಪರೂಪದವನು, ಮಗು.",
      "ಈಗ... ಆ ಮೇಜಿನ ಬಳಿಗೆ ಹೋಗಿ, ನಾನು ನಿನಗಾಗಿ ಸಿದ್ಧಪಡಿಸಿದ ವಿಶೇಷ ಹಾಲನ್ನು ಕುಡಿ.",
      "ಇದರ ಹೆಸರು 'ಇರಿಡಿಯಂ ಸರ್ಪದ ಹಾಲು'... ಇದನ್ನು ಒಂದು ದೊಡ್ಡ ಗುಟುಕು ಕುಡಿದರೆ ಇನ್ನಷ್ಟು ಶಕ್ತಿಶಾಲಿಯಾಗುವೆ.",
      "ರುಚಿ ಭಯಾನಕವಾಗಿದೆ, ಅದರ ಗಟ್ಟಿತನವಂತೂ ಇನ್ನೂ ಕೆಟ್ಟದು.",
      "...ಆದರೆ ನಿನ್ನ ಆರೋಗ್ಯ ಶಾಶ್ವತವಾಗಿ 25ರಷ್ಟು ಹೆಚ್ಚಾಗಿದೆ!",
      "ಹೊರಗೆ ಶುಭವಾಗಲಿ, ಮಗು.",
    ],
  ],
  [
    "Data/ExtraDialogue\0SkullCavern_100_event_honorable",
    [
      "ಓಹೋ... ಕೊನೆಗೂ ಇಲ್ಲಿಗೆ ತಲುಪಿದ್ದೀಯ.",
      "ಹತ್ತಿರ ಬಾ... ಸಂಕೋಚಪಡಬೇಡ.",
      "ಇಂದು ನೀನು ಈ ಗುಹೆಗಳ ಆಳಕ್ಕೆ ಇಳಿಯಲು ಪ್ರಯತ್ನಿಸುತ್ತಿದ್ದೀಯೆಂದು ಕೇಳಿದೆ...#$b#ನಾನೇ ಬಂದು ನೋಡಬೇಕಾಯಿತು!",
      "ಅದ್ಭುತ... ನಿಜಕ್ಕೂ ಅದ್ಭುತ. ನನ್ನ ಪರೀಕ್ಷೆಯನ್ನು ಅತ್ಯುತ್ತಮವಾಗಿ ಪೂರೈಸಿದ್ದೀಯ, ಮಗು.#$b#ಮೆಟ್ಟಿಲುಗಳಿಂದ ಮಹಡಿಗಳನ್ನು ಬಿಟ್ಟುಬಿಡದೆ, ನಿನ್ನನ್ನೇ ಸವಾಲಿಗೆ ಒಳಪಡಿಸಿ ಗೌರವಯುತವಾಗಿ ಕೆಳಗಿಳಿದದ್ದು ನನಗೆ ಬಹಳ ಸಂತೋಷ ತಂದಿದೆ.#$b#ನೀನು ನಿಜವಾದ ಸಾಧಕನೆಂಬುದು ಇದರಿಂದ ಗೊತ್ತಾಗುತ್ತದೆ. ನಿನಗೆ ತತ್ವಗಳಿವೆ.#$b#ಯಾರೂ ನೋಡದಿದ್ದರೂ ನಿನ್ನನ್ನೇ ಸವಾಲಿಗೆ ಒಳಪಡಿಸಿ ಅತ್ಯುನ್ನತ ಮಾನದಂಡ ಪಾಲಿಸುವ ಮಹತ್ವ ನಿನಗೆ ತಿಳಿದಿದೆ.#$b#ಅದಕ್ಕೇ ನೀನು ವಿಶೇಷ, ಮಗು... ಗೊತ್ತಾಯಿತೇ? ನೀನು ಮಾದರಿಯಾಗಿ ಮುನ್ನಡೆಯುತ್ತೀಯ. ಅದು ನನಗೆ ಇಷ್ಟ.",
      "ಈಗ... ಆ ಮೇಜಿನ ಬಳಿಗೆ ಹೋಗಿ, ನಾನು ನಿನಗಾಗಿ ಸಿದ್ಧಪಡಿಸಿದ ವಿಶೇಷ ಹಾಲನ್ನು ಕುಡಿ.",
      "ಇದರ ಹೆಸರು 'ಇರಿಡಿಯಂ ಸರ್ಪದ ಹಾಲು'... ಇದನ್ನು ಒಂದು ದೊಡ್ಡ ಗುಟುಕು ಕುಡಿದರೆ ಇನ್ನಷ್ಟು ಶಕ್ತಿಶಾಲಿಯಾಗುವೆ.",
      "ರುಚಿ ಭಯಾನಕವಾಗಿದೆ, ಅದರ ಗಟ್ಟಿತನವಂತೂ ಇನ್ನೂ ಕೆಟ್ಟದು.",
      "...ಆದರೆ ನಿನ್ನ ಆರೋಗ್ಯ ಶಾಶ್ವತವಾಗಿ 25ರಷ್ಟು ಹೆಚ್ಚಾಗಿದೆ!",
      "ಹೊರಗೆ ಶುಭವಾಗಲಿ, ಮಗು.",
    ],
  ],
]);

let repaired = 0;
for (const fileName of fs.readdirSync(translationRoot).filter((file) => file.endsWith(".json"))) {
  const file = path.join(translationRoot, fileName);
  const document = readJSON(file);
  let changed = false;
  for (const change of document.Changes ?? []) {
    if (change.Target.startsWith("Data/Events/") || change.Target.startsWith("Data/Festivals/")) continue;
    const source = sourceContent(change.Target);
    for (const [key, translated] of Object.entries(change.Entries ?? {})) {
      const original = source[key];
      if (typeof original !== "string" || !embeddedEvent.test(original)) continue;
      const identity = `${change.Target}\0${key}`;
      let result = exactOverrides.get(identity);
      const quoted = quotedOverrides.get(identity);
      if (quoted) result = replaceQuotedDialogue(original, quoted);
      if (result === undefined) result = mergeEventSkeleton(original, translated);
      if (result === undefined) {
        throw new Error(`Cannot align embedded event quotes: ${change.Target} :: ${key}`);
      }
      for (const [sourceText, targetText] of visibleTechnicalTextReplacements.get(identity) ?? []) {
        result = result.replace(sourceText, targetText);
      }
      if (result !== translated) {
        change.Entries[key] = result;
        repaired += 1;
        changed = true;
      }
    }
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
}

console.log(JSON.stringify({ repaired }, null, 2));
