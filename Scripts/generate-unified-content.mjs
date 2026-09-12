#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const payload = path.resolve(import.meta.dirname, "../Sources/StardewTranslationInstaller/Resources/ModPayload");

const languages = [
  {
    directory: "russian",
    suffix: "Russian",
    code: "ru-vnrevival",
    buttonTarget: "ButtonRussian",
    button: "assets/button-russian.png",
    title: "assets/title/TitleButtons-russian.png",
    fonts: "assets/fonts/russian",
    useLatinFont: false,
    fontFile: "Fonts/Russian",
    fontPixelZoom: 3,
    clockDateFormat: "[DAY_OF_WEEK] [DAY_OF_MONTH]",
  },
  {
    directory: "serbian",
    suffix: "Serbian",
    code: "sr-vnrevival",
    buttonTarget: "ButtonSerbian",
    button: "assets/button-serbian.png",
    title: "assets/title/TitleButtons-serbian.png",
    fonts: "assets/fonts/serbian",
    useLatinFont: false,
    fontFile: "Fonts/Serbian",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Serbian", file: "assets/fonts/serbian/Serbian.xnb" },
      { target: "Fonts/Serbian_0", file: "assets/fonts/serbian/Serbian_0.xnb" },
    ],
    clockDateFormat: "[DAY_OF_WEEK] [DAY_OF_MONTH]",
  },
  {
    directory: "polish",
    suffix: "Polish",
    code: "pl-vnrevival",
    buttonTarget: "ButtonPolish",
    button: "assets/button.png",
    title: "assets/title/TitleButtons.png",
    fonts: "assets/fonts/polish",
    useLatinFont: false,
    fontFile: "Fonts/Polish",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Polish", file: "assets/fonts/polish/Polish.xnb" },
      { target: "Fonts/Polish_0", file: "assets/fonts/polish/Polish_0.xnb" },
    ],
  },
  {
    directory: "ukrainian",
    suffix: "Ukrainian",
    code: "uk-vnrevival",
    buttonTarget: "ButtonUkrainian",
    button: "assets/button-ukrainian.png",
    title: "assets/title/TitleButtons-ukrainian.png",
    fonts: "assets/fonts/ukrainian",
    useLatinFont: false,
    fontFile: "Fonts/Ukrainian",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Ukrainian", file: "assets/fonts/ukrainian/Ukrainian.xnb" },
      { target: "Fonts/Ukrainian_0", file: "assets/fonts/ukrainian/Ukrainian_0.xnb" },
    ],
  },
  {
    directory: "vietnamese",
    suffix: "Vietnamese",
    code: "vi-vnrevival",
    buttonTarget: "ButtonVietnamese",
    button: "assets/button-vietnamese.png",
    title: "assets/title/TitleButtons-vietnamese.png",
    fonts: "assets/fonts/vietnamese",
    useLatinFont: false,
    fontFile: "Fonts/Vietnamese",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Vietnamese", file: "assets/fonts/vietnamese/Vietnamese.xnb" },
      { target: "Fonts/Vietnamese_0", file: "assets/fonts/vietnamese/Vietnamese_0.xnb" },
    ],
  },
  {
    directory: "swahili",
    suffix: "Swahili",
    code: "sw-vnrevival",
    buttonTarget: "ButtonSwahili",
    button: "assets/button-swahili.png",
    title: "assets/title/TitleButtons-swahili.png",
    fonts: "assets/fonts/swahili",
    useLatinFont: false,
    fontFile: "Fonts/Swahili",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Swahili", file: "assets/fonts/swahili/Swahili.xnb" },
      { target: "Fonts/Swahili_0", file: "assets/fonts/swahili/Swahili_0.xnb" },
    ],
  },
  {
    directory: "persian",
    suffix: "Persian",
    code: "fa-vnrevival",
    buttonTarget: "ButtonPersian",
    button: "assets/button-persian.png",
    title: "assets/title/TitleButtons-persian.png",
    fonts: "assets/fonts/persian",
    useLatinFont: false,
    fontFile: "Fonts/Persian",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Persian", file: "assets/fonts/persian/Persian.xnb" },
      { target: "Fonts/Persian_0", file: "assets/fonts/persian/Persian_0.xnb" },
    ],
  },
  {
    directory: "arabic",
    suffix: "Arabic",
    code: "ar-vnrevival",
    buttonTarget: "ButtonArabic",
    button: "assets/button-arabic.png",
    title: "assets/title/TitleButtons-arabic.png",
    fonts: "assets/fonts/arabic",
    useLatinFont: false,
    fontFile: "Fonts/Arabic",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Arabic", file: "assets/fonts/arabic/Arabic.xnb" },
      { target: "Fonts/Arabic_0", file: "assets/fonts/arabic/Arabic_0.xnb" },
    ],
  },
  {
    directory: "indonesian",
    suffix: "Indonesian",
    code: "id-vnrevival",
    buttonTarget: "ButtonIndonesian",
    button: "assets/button-indonesian.png",
    title: "assets/title/TitleButtons-indonesian.png",
    fonts: "assets/fonts/indonesian",
    useLatinFont: false,
    fontFile: "Fonts/Indonesian",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Indonesian", file: "assets/fonts/indonesian/Indonesian.xnb" },
      { target: "Fonts/Indonesian_0", file: "assets/fonts/indonesian/Indonesian_0.xnb" },
    ],
  },
  {
    directory: "filipino",
    suffix: "Filipino",
    code: "fil-vnrevival",
    buttonTarget: "ButtonFilipino",
    button: "assets/button-filipino.png",
    title: "assets/title/TitleButtons-filipino.png",
    fonts: "assets/fonts/filipino",
    useLatinFont: false,
    fontFile: "Fonts/Filipino",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Filipino", file: "assets/fonts/filipino/Filipino.xnb" },
      { target: "Fonts/Filipino_0", file: "assets/fonts/filipino/Filipino_0.xnb" },
    ],
  },
  {
    directory: "dutch",
    suffix: "Dutch",
    code: "nl-vnrevival",
    buttonTarget: "ButtonDutch",
    button: "assets/button-dutch.png",
    title: "assets/title/TitleButtons-dutch.png",
    fonts: "assets/fonts/dutch",
    useLatinFont: false,
    fontFile: "Fonts/Dutch",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Dutch", file: "assets/fonts/dutch/Dutch.xnb" },
      { target: "Fonts/Dutch_0", file: "assets/fonts/dutch/Dutch_0.xnb" },
    ],
  },
  {
    directory: "hindi",
    suffix: "Hindi",
    code: "hi-vnrevival",
    buttonTarget: "ButtonHindi",
    button: "assets/button-hindi.png",
    title: "assets/title/TitleButtons-hindi.png",
    fonts: "assets/fonts/hindi",
    useLatinFont: false,
    fontFile: "Fonts/Hindi",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Hindi", file: "assets/fonts/hindi/Hindi.xnb" },
      { target: "Fonts/Hindi_0", file: "assets/fonts/hindi/Hindi_0.xnb" },
    ],
  },
  {
    directory: "traditional-chinese",
    suffix: "TraditionalChinese",
    code: "zh-TW-vnrevival",
    buttonTarget: "ButtonTraditionalChinese",
    button: "assets/button-traditional-chinese.png",
    title: "assets/title/TitleButtons-traditional-chinese.png",
    fonts: "assets/fonts/traditional-chinese",
    useLatinFont: false,
    fontFile: "Fonts/ChineseTraditional",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/ChineseTraditional", file: "assets/fonts/traditional-chinese/ChineseTraditional.xnb" },
      { target: "Fonts/ChineseTraditional_0", file: "assets/fonts/traditional-chinese/ChineseTraditional_0.xnb" },
    ],
  },
  {
    directory: "romanian",
    suffix: "Romanian",
    code: "ro-vnrevival",
    buttonTarget: "ButtonRomanian",
    button: "assets/button-romanian.png",
    title: "assets/title/TitleButtons-romanian.png",
    fonts: "assets/fonts/romanian",
    useLatinFont: false,
    fontFile: "Fonts/Romanian",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Romanian", file: "assets/fonts/romanian/Romanian.xnb" },
      { target: "Fonts/Romanian_0", file: "assets/fonts/romanian/Romanian_0.xnb" },
    ],
  },
  {
    directory: "hebrew",
    suffix: "Hebrew",
    code: "he-vnrevival",
    buttonTarget: "ButtonHebrew",
    button: "assets/button-hebrew.png",
    title: "assets/title/TitleButtons-hebrew.png",
    fonts: "assets/fonts/hebrew",
    useLatinFont: false,
    fontFile: "Fonts/Hebrew",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Hebrew", file: "assets/fonts/hebrew/Hebrew.xnb" },
      { target: "Fonts/Hebrew_0", file: "assets/fonts/hebrew/Hebrew_0.xnb" },
    ],
  },
  {
    directory: "bulgarian",
    suffix: "Bulgarian",
    code: "bg-vnrevival",
    buttonTarget: "ButtonBulgarian",
    button: "assets/button-bulgarian.png",
    title: "assets/title/TitleButtons-bulgarian.png",
    fonts: "assets/fonts/bulgarian",
    useLatinFont: false,
    fontFile: "Fonts/Bulgarian",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Bulgarian", file: "assets/fonts/bulgarian/Bulgarian.xnb" },
      { target: "Fonts/Bulgarian_0", file: "assets/fonts/bulgarian/Bulgarian_0.xnb" },
    ],
  },
  {
    directory: "thai",
    suffix: "Thai",
    code: "th-vnrevival",
    buttonTarget: "ButtonThai",
    button: "assets/button-thai.png",
    title: "assets/title/TitleButtons-thai.png",
    fonts: "assets/fonts/thai",
    useLatinFont: false,
    fontFile: "Fonts/Thai",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Thai", file: "assets/fonts/thai/Thai.xnb" },
      { target: "Fonts/Thai_0", file: "assets/fonts/thai/Thai_0.xnb" },
    ],
  },
  {
    directory: "greek",
    suffix: "Greek",
    code: "el-vnrevival",
    buttonTarget: "ButtonGreek",
    button: "assets/button-greek.png",
    title: "assets/title/TitleButtons-greek.png",
    fonts: "assets/fonts/greek",
    useLatinFont: false,
    fontFile: "Fonts/Greek",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Greek", file: "assets/fonts/greek/Greek.xnb" },
      { target: "Fonts/Greek_0", file: "assets/fonts/greek/Greek_0.xnb" },
    ],
  },
  {
    directory: "czech",
    suffix: "Czech",
    code: "cs-vnrevival",
    buttonTarget: "ButtonCzech",
    button: "assets/button-czech.png",
    title: "assets/title/TitleButtons-czech.png",
    fonts: "assets/fonts/czech",
    useLatinFont: false,
    fontFile: "Fonts/Czech",
    fontPixelZoom: 1,
    bitmapFonts: [
      { target: "Fonts/Czech", file: "assets/fonts/czech/Czech.xnb" },
      { target: "Fonts/Czech_0", file: "assets/fonts/czech/Czech_0.xnb" },
    ],
  },
];

const entries = {};
const changes = [];

function listJSONFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      return listJSONFiles(path.join(directory, entry.name), relative);
    }
    return entry.isFile() && entry.name.endsWith(".json") ? [relative] : [];
  });
}

for (const language of languages) {
  entries[`{{ModId}}_${language.suffix}`] = {
    ID: `{{ModId}}_${language.suffix}`,
    LanguageCode: language.code,
    ButtonTexture: `Mods/{{ModId}}/${language.buttonTarget}`,
    UseLatinFont: language.useLatinFont ?? true,
    ...(language.fontFile ? { FontFile: language.fontFile } : {}),
    FontPixelZoom: language.fontPixelZoom ?? 1,
    TimeFormat: "[HOURS_24_00]:[MINUTES]",
    ClockTimeFormat: "[HOURS_24_00]:[MINUTES]",
    ClockDateFormat: language.clockDateFormat ?? "[DAY_OF_MONTH] [DAY_OF_WEEK]",
    NumberComma: " ",
  };
}
changes.push({ Action: "EditData", Target: "Data/AdditionalLanguages", Entries: entries });

for (const language of languages) {
  changes.push({
    Action: "Load",
    Target: `Mods/{{ModId}}/${language.buttonTarget}`,
    FromFile: language.button,
  });
  changes.push({
    Action: "Load",
    Target: "Minigames/TitleButtons",
    TargetLocale: language.code,
    FromFile: language.title,
  });
  if (language.fonts) {
    for (const font of ["SpriteFont1", "SmallFont"]) {
      changes.push({
        Action: "Load",
        Target: `Fonts/${font}`,
        TargetLocale: language.code,
        FromFile: `${language.fonts}/${font}.xnb`,
      });
    }
  }
  if (language.bitmapFonts) {
    for (const font of language.bitmapFonts) {
      changes.push({
        Action: "Load",
        Target: font.target,
        FromFile: font.file,
      });
    }
  }
}

for (const language of languages) {
  const directory = path.join(payload, "assets/translations", language.directory);
  for (const file of listJSONFiles(directory).sort()) {
    if (language.directory === "greek" && file === "grammar-data.json") continue;
    changes.push({ Action: "Include", FromFile: `assets/translations/${language.directory}/${file}` });
  }
}

fs.writeFileSync(
  path.join(payload, "content.json"),
  `${JSON.stringify({ Format: "2.9.0", Changes: changes }, null, 2)}\n`,
);
console.log(`Generated ${changes.length} changes for ${languages.length} languages.`);
