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
    fontFile: "Fonts/Russian",
    fontPixelZoom: 3,
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
  },
  {
    directory: "ukrainian",
    suffix: "Ukrainian",
    code: "uk-vnrevival",
    buttonTarget: "ButtonUkrainian",
    button: "assets/button-ukrainian.png",
    title: "assets/title/TitleButtons-ukrainian.png",
    fonts: "assets/fonts/ukrainian",
  },
  {
    directory: "vietnamese",
    suffix: "Vietnamese",
    code: "vi-vnrevival",
    buttonTarget: "ButtonVietnamese",
    button: "assets/button-vietnamese.png",
    title: "assets/title/TitleButtons-vietnamese.png",
    fonts: "assets/fonts/vietnamese",
  },
  {
    directory: "swahili",
    suffix: "Swahili",
    code: "sw-vnrevival",
    buttonTarget: "ButtonSwahili",
    button: "assets/button-swahili.png",
    title: "assets/title/TitleButtons-swahili.png",
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
    fontPixelZoom: 3,
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
    fontPixelZoom: 3,
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
  },
  {
    directory: "filipino",
    suffix: "Filipino",
    code: "fil-vnrevival",
    buttonTarget: "ButtonFilipino",
    button: "assets/button-filipino.png",
    title: "assets/title/TitleButtons-filipino.png",
    fonts: "assets/fonts/filipino",
  },
  {
    directory: "dutch",
    suffix: "Dutch",
    code: "nl-vnrevival",
    buttonTarget: "ButtonDutch",
    button: "assets/button-dutch.png",
    title: "assets/title/TitleButtons-dutch.png",
    fonts: "assets/fonts/dutch",
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
    fontPixelZoom: 3,
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
    fontPixelZoom: 3,
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
    fontPixelZoom: 3,
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
    fontFile: "Fonts/Russian",
    fontPixelZoom: 3,
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
    changes.push({ Action: "Include", FromFile: `assets/translations/${language.directory}/${file}` });
  }
}

fs.writeFileSync(
  path.join(payload, "content.json"),
  `${JSON.stringify({ Format: "2.9.0", Changes: changes }, null, 2)}\n`,
);
console.log(`Generated ${changes.length} changes for ${languages.length} languages.`);
