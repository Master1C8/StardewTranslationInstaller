#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationsRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations",
);
const fontsRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts",
);

// These limits are expressed in unscaled SpriteFont pixels. They follow the
// fixed columns in the desktop character creator and the narrower mobile
// labels. Keeping the limits here makes later translation changes fail before
// they can overlap an input, arrow, slider, or checkbox in the game.
const widthLimits = {
  Character_Name: 132,
  Character_Farm: 132,
  Character_FavoriteThing: 132,
  Character_Animal: 132,
  Character_FarmNameSuffix: 110,
  Character_Skin: 105,
  Character_Hair: 105,
  Character_Shirt: 105,
  Character_Pants: 105,
  Character_Accessory: 105,
  Character_EyeColor: 150,
  Character_HairColor: 150,
  Character_PantsColor: 150,
  Character_ShirtColor: 150,
  Character_DyeColor: 150,
  Character_SkipIntro: 250,
  Character_Wallets: 160,
  Character_SharedWallet: 125,
  Character_SeparateWallet: 125,
  Character_Difficulty: 175,
  Character_Close: 115,
  Character_Normal: 120,
  Character_Separate: 125,
  Character_none: 120,
  Character_CoopHelp: 120,
  Character_StartingCabins: 195,
  Character_CabinLayout: 175,
  "Character_EyeColor.mobile": 145,
  "Character_HairColor.mobile": 145,
  "Character_PantsColor.mobile": 145,
  "Character_ShirtColor.mobile": 145,
};

const multilineKeys = new Set([
  "Character_Farm",
  "Character_FavoriteThing",
  "Character_Animal",
  "Character_EyeColor.mobile",
  "Character_HairColor.mobile",
  "Character_PantsColor.mobile",
  "Character_ShirtColor.mobile",
]);

const fontByLocale = {
  arabic: "arabic",
  bulgarian: "bulgarian",
  czech: "czech",
  dutch: "dutch",
  filipino: "filipino",
  greek: "greek",
  hebrew: "hebrew",
  hindi: "hindi",
  indonesian: "base",
  persian: "persian",
  polish: "polish",
  romanian: "romanian",
  russian: "russian",
  serbian: "serbian",
  swahili: "base",
  thai: "thai",
  "traditional-chinese": "traditional-chinese",
  ukrainian: "ukrainian",
  vietnamese: "vietnamese",
};

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".json") ? [absolute] : [];
  });
}

function readCharacterEntries(locale) {
  const values = new Map();
  for (const file of listJSONFiles(path.join(translationsRoot, locale))) {
    const document = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const change of document.Changes ?? []) {
      if (change.Target !== "Strings/UI") continue;
      for (const [key, value] of Object.entries(change.Entries ?? {})) {
        if (!(key in widthLimits)) continue;
        if (values.has(key)) {
          throw new Error(`${locale}: duplicate Strings/UI entry ${key}`);
        }
        values.set(key, value);
      }
    }
  }
  return values;
}

function unpackFonts() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "stardew-character-layout-"));
  const packed = path.join(temporaryRoot, "packed");
  const unpacked = path.join(temporaryRoot, "unpacked");
  fs.mkdirSync(packed);
  fs.mkdirSync(unpacked);

  for (const fontName of new Set(Object.values(fontByLocale))) {
    const source = fontName === "base"
      ? process.env.STARDEW_SMALL_FONT ?? path.join(
        os.homedir(),
        "Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/Resources/Content/Fonts/SmallFont.xnb",
      )
      : path.join(fontsRoot, fontName, "SmallFont.xnb");
    if (!fs.existsSync(source)) throw new Error(`missing SmallFont source: ${source}`);
    fs.copyFileSync(source, path.join(packed, `${fontName}.xnb`));
  }

  const xnbcli = process.env.XNBCLI ?? path.join(os.homedir(), "Developer/tools/xnbcli/xnbcli");
  if (!fs.existsSync(xnbcli)) throw new Error(`missing xnbcli: ${xnbcli}`);
  const result = spawnSync(xnbcli, ["unpack", packed, unpacked], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`xnbcli failed:\n${result.stdout}\n${result.stderr}`);
  }
  return { temporaryRoot, unpacked };
}

function makeMeasure(fontFile) {
  const { content } = JSON.parse(fs.readFileSync(fontFile, "utf8"));
  const index = new Map(content.characterMap.map((character, position) => [character, position]));
  const spacing = content.horizontalSpacing ?? 0;
  return (text) => Math.max(...text.split("\n").map((line) => {
    let width = 0;
    for (const [position, character] of [...line].entries()) {
      const glyphIndex = index.get(character);
      if (glyphIndex === undefined) {
        throw new Error(`${path.basename(fontFile)} misses ${JSON.stringify(character)}`);
      }
      const kerning = content.kerning[glyphIndex];
      const leftBearing = position === 0 ? Math.max(kerning.x, 0) : kerning.x;
      width += leftBearing + kerning.y + kerning.z;
      if (position > 0) width += spacing;
    }
    return width;
  }));
}

const locales = fs.readdirSync(translationsRoot)
  .filter((locale) => fs.statSync(path.join(translationsRoot, locale)).isDirectory())
  .sort();
const expectedLocales = Object.keys(fontByLocale).sort();
if (JSON.stringify(locales) !== JSON.stringify(expectedLocales)) {
  throw new Error(`locale/font map mismatch:\ntranslations=${locales}\nfonts=${expectedLocales}`);
}

const { temporaryRoot, unpacked } = unpackFonts();
const errors = [];
let measurements = 0;
try {
  for (const locale of locales) {
    const entries = readCharacterEntries(locale);
    const measure = makeMeasure(path.join(unpacked, `${fontByLocale[locale]}.json`));
    for (const [key, limit] of Object.entries(widthLimits)) {
      const value = entries.get(key);
      if (typeof value !== "string" || value.length === 0) {
        errors.push(`${locale}: missing ${key}`);
        continue;
      }
      const lineCount = value.split("\n").length;
      const maximumLines = multilineKeys.has(key) ? 2 : 1;
      if (lineCount > maximumLines) {
        errors.push(`${locale}: ${key} uses ${lineCount} lines (maximum ${maximumLines})`);
      }
      const width = measure(value);
      measurements += 1;
      if (width > limit) {
        errors.push(`${locale}: ${key} is ${width}px (maximum ${limit}px): ${JSON.stringify(value)}`);
      }
    }
  }
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

if (errors.length > 0) {
  throw new Error(`character-creation layout audit failed:\n${errors.join("\n")}`);
}
console.log(`Character-creation layout audit passed: ${locales.length} locales, ${measurements} labels.`);
