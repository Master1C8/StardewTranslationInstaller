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
  {
    directory: "telugu",
    suffix: "Telugu",
    code: "te-vnrevival",
    buttonTarget: "ButtonTelugu",
    button: "assets/button-telugu.png",
    title: "assets/title/TitleButtons-telugu.png",
    fonts: "assets/fonts/telugu",
    useLatinFont: false,
    fontFile: "Fonts/Telugu",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Telugu", file: "assets/fonts/telugu/Telugu.xnb" },
      { target: "Fonts/Telugu_0", file: "assets/fonts/telugu/Telugu_0.xnb" },
    ],
  },
  {
    directory: "urdu",
    suffix: "Urdu",
    code: "ur-vnrevival",
    buttonTarget: "ButtonUrdu",
    button: "assets/button-urdu.png",
    title: "assets/title/TitleButtons-urdu.png",
    fonts: "assets/fonts/urdu",
    useLatinFont: false,
    fontFile: "Fonts/Urdu",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Urdu", file: "assets/fonts/urdu/Urdu.xnb" },
      { target: "Fonts/Urdu_0", file: "assets/fonts/urdu/Urdu_0.xnb" },
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
    directory: "tamil",
    suffix: "Tamil",
    code: "ta-vnrevival",
    buttonTarget: "ButtonTamil",
    button: "assets/button-tamil.png",
    title: "assets/title/TitleButtons-tamil.png",
    fonts: "assets/fonts/tamil",
    useLatinFont: false,
    fontFile: "Fonts/Tamil",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Tamil", file: "assets/fonts/tamil/Tamil.xnb" },
      { target: "Fonts/Tamil_0", file: "assets/fonts/tamil/Tamil_0.xnb" },
    ],
  },
  {
    directory: "bengali",
    suffix: "Bengali",
    code: "bn-vnrevival",
    buttonTarget: "ButtonBengali",
    button: "assets/button-bengali.png",
    title: "assets/title/TitleButtons-bengali.png",
    fonts: "assets/fonts/bengali",
    useLatinFont: false,
    fontFile: "Fonts/Bengali",
    fontPixelZoom: 3,
    bitmapFonts: [
      { target: "Fonts/Bengali", file: "assets/fonts/bengali/Bengali.xnb" },
      { target: "Fonts/Bengali_0", file: "assets/fonts/bengali/Bengali_0.xnb" },
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
