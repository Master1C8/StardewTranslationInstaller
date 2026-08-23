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
    directory: "polish",
    suffix: "Polish",
    code: "pl-vnrevival",
    buttonTarget: "ButtonPolish",
    button: "assets/button.png",
    title: "assets/title/TitleButtons.png",
    fonts: "assets/fonts/polish",
  },
  {
    directory: "uzbek",
    suffix: "Uzbek",
    code: "uz-vnrevival",
    buttonTarget: "ButtonUzbek",
    button: "assets/button-uzbek.png",
    title: "assets/title/TitleButtons-uzbek.png",
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
    directory: "amharic",
    suffix: "Amharic",
    code: "am-vnrevival",
    buttonTarget: "ButtonAmharic",
    button: "assets/button-amharic.png",
    title: "assets/title/TitleButtons-amharic.png",
    fonts: "assets/fonts/amharic",
    useLatinFont: false,
    fontFile: "Fonts/Amharic",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Amharic", file: "assets/fonts/amharic/Amharic.xnb" },
      { target: "Fonts/Amharic_0", file: "assets/fonts/amharic/Amharic_0.xnb" },
    ],
  },
  {
    directory: "kannada",
    suffix: "Kannada",
    code: "kn-vnrevival",
    buttonTarget: "ButtonKannada",
    button: "assets/button-kannada.png",
    title: "assets/title/TitleButtons-kannada.png",
    fonts: "assets/fonts/kannada",
    useLatinFont: false,
    fontFile: "Fonts/Kannada",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Kannada", file: "assets/fonts/kannada/Kannada.xnb" },
      { target: "Fonts/Kannada_0", file: "assets/fonts/kannada/Kannada_0.xnb" },
    ],
  },
  {
    directory: "malayalam",
    suffix: "Malayalam",
    code: "ml-vnrevival",
    buttonTarget: "ButtonMalayalam",
    button: "assets/button-malayalam.png",
    title: "assets/title/TitleButtons-malayalam.png",
    fonts: "assets/fonts/malayalam",
    useLatinFont: false,
    fontFile: "Fonts/Malayalam",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Malayalam", file: "assets/fonts/malayalam/Malayalam.xnb" },
      { target: "Fonts/Malayalam_0", file: "assets/fonts/malayalam/Malayalam_0.xnb" },
    ],
  },
  {
    directory: "marathi",
    suffix: "Marathi",
    code: "mr-vnrevival",
    buttonTarget: "ButtonMarathi",
    button: "assets/button-marathi.png",
    title: "assets/title/TitleButtons-marathi.png",
    fonts: "assets/fonts/marathi",
    useLatinFont: false,
    fontFile: "Fonts/Marathi",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Marathi", file: "assets/fonts/marathi/Marathi.xnb" },
      { target: "Fonts/Marathi_0", file: "assets/fonts/marathi/Marathi_0.xnb" },
    ],
  },
  {
    directory: "burmese",
    suffix: "Burmese",
    code: "my-vnrevival",
    buttonTarget: "ButtonBurmese",
    button: "assets/button-burmese.png",
    title: "assets/title/TitleButtons-burmese.png",
    fonts: "assets/fonts/burmese",
    useLatinFont: false,
    fontFile: "Fonts/Burmese",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Burmese", file: "assets/fonts/burmese/Burmese.xnb" },
      { target: "Fonts/Burmese_0", file: "assets/fonts/burmese/Burmese_0.xnb" },
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
    changes.push({ Action: "Include", FromFile: `assets/translations/${language.directory}/${file}` });
  }
}

fs.writeFileSync(
  path.join(payload, "content.json"),
  `${JSON.stringify({ Format: "2.9.0", Changes: changes }, null, 2)}\n`,
);
console.log(`Generated ${changes.length} changes for ${languages.length} languages.`);
