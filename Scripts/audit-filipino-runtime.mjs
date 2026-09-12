#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const resources = path.join(root, "Sources/StardewTranslationInstaller/Resources");
const payload = path.join(resources, "ModPayload");
const translationRoot = path.join(payload, "assets/translations/filipino");
const errors = [];

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    return null;
  }
}

function requireSingle(changes, predicate, label) {
  const matches = changes.filter(predicate);
  if (matches.length !== 1) errors.push(`${label}: expected one change, found ${matches.length}`);
  return matches[0];
}

function pngDimensions(file) {
  const data = fs.readFileSync(file);
  if (!data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    errors.push(`${file}: invalid PNG signature`);
    return null;
  }
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

const packageConfig = readJSON(path.join(resources, "PackageConfig.json"));
if ((packageConfig?.languageCodes ?? []).filter((code) => code === "fil-vnrevival").length !== 1) {
  errors.push("PackageConfig must contain fil-vnrevival exactly once");
}
if (!packageConfig?.nativeLanguageName?.split(" · ").includes("Filipino")) {
  errors.push("PackageConfig native language list omits Filipino");
}
if (!packageConfig?.copy?.installingTranslationMessage?.includes("филиппинского")) {
  errors.push("PackageConfig installing copy omits Filipino");
}

const content = readJSON(path.join(payload, "content.json"));
if (content?.Format !== "2.9.0") errors.push("root content.json must use Format 2.9.0");
const changes = content?.Changes ?? [];
const languagePatch = requireSingle(
  changes,
  (change) => change.Action === "EditData" && change.Target === "Data/AdditionalLanguages",
  "AdditionalLanguages patch",
);
const language = languagePatch?.Entries?.["{{ModId}}_Filipino"];
const expectedLanguage = {
  ID: "{{ModId}}_Filipino",
  LanguageCode: "fil-vnrevival",
  ButtonTexture: "Mods/{{ModId}}/ButtonFilipino",
  UseLatinFont: false,
  FontFile: "Fonts/Filipino",
  FontPixelZoom: 1,
  TimeFormat: "[HOURS_24_00]:[MINUTES]",
  ClockTimeFormat: "[HOURS_24_00]:[MINUTES]",
  ClockDateFormat: "[DAY_OF_MONTH] [DAY_OF_WEEK]",
  NumberComma: " ",
};
if (JSON.stringify(language) !== JSON.stringify(expectedLanguage)) {
  errors.push("Filipino AdditionalLanguages entry differs from the runtime contract");
}

const expectedLoads = [
  ["Mods/{{ModId}}/ButtonFilipino", null, "assets/button-filipino.png"],
  ["Minigames/TitleButtons", "fil-vnrevival", "assets/title/TitleButtons-filipino.png"],
  ["Fonts/SpriteFont1", "fil-vnrevival", "assets/fonts/filipino/SpriteFont1.xnb"],
  ["Fonts/SmallFont", "fil-vnrevival", "assets/fonts/filipino/SmallFont.xnb"],
  ["Fonts/Filipino", null, "assets/fonts/filipino/Filipino.xnb"],
  ["Fonts/Filipino_0", null, "assets/fonts/filipino/Filipino_0.xnb"],
];
for (const [target, locale, fromFile] of expectedLoads) {
  const load = requireSingle(
    changes,
    (change) => change.Action === "Load"
      && change.Target === target
      && (change.TargetLocale ?? null) === locale,
    `${target}.${locale ?? "global"}`,
  );
  if (load?.FromFile !== fromFile) errors.push(`${target}: expected ${fromFile}`);
}

const translationFiles = fs.readdirSync(translationRoot)
  .filter((name) => name.endsWith(".json"))
  .sort();
const expectedIncludes = new Set(
  translationFiles.map((name) => `assets/translations/filipino/${name}`),
);
const allIncludes = changes
  .filter((change) => change.Action === "Include")
  .map((change) => change.FromFile);
if (new Set(allIncludes).size !== allIncludes.length) errors.push("root content.json has duplicate Includes");
const actualIncludes = allIncludes.filter((file) => file?.startsWith("assets/translations/filipino/"));
if (actualIncludes.length !== expectedIncludes.size || new Set(actualIncludes).size !== expectedIncludes.size) {
  errors.push(`Filipino Includes differ: actual=${actualIncludes.length}, expected=${expectedIncludes.size}`);
}
for (const included of actualIncludes) {
  if (!expectedIncludes.has(included)) errors.push(`unexpected Filipino Include: ${included}`);
}
for (const expected of expectedIncludes) {
  if (!actualIncludes.includes(expected)) errors.push(`missing Filipino Include: ${expected}`);
}

for (const name of translationFiles) {
  const document = readJSON(path.join(translationRoot, name));
  if (Object.hasOwn(document ?? {}, "Format")) errors.push(`${name}: secondary file contains Format`);
  if (!Array.isArray(document?.Changes) || document.Changes.length === 0) {
    errors.push(`${name}: secondary file has no Changes`);
    continue;
  }
  for (const change of document.Changes) {
    if (JSON.stringify(change.When) !== JSON.stringify({ Language: "fil-vnrevival" })) {
      errors.push(`${name}: ${change.Target ?? "unknown"} has an invalid language gate`);
    }
    const edit = change.Entries ?? change.Fields;
    if (!edit || Object.keys(edit).length === 0) {
      errors.push(`${name}: ${change.Target ?? "unknown"} has no Entries or Fields`);
    }
  }
}

for (const [relative, expected] of [
  ["assets/button-filipino.png", [174, 78]],
  ["assets/title/TitleButtons-filipino.png", [400, 655]],
]) {
  const file = path.join(payload, relative);
  if (!fs.existsSync(file)) errors.push(`${relative}: missing`);
  else if (JSON.stringify(pngDimensions(file)) !== JSON.stringify(expected)) {
    errors.push(`${relative}: wrong dimensions`);
  }
}
for (const relative of [
  "assets/fonts/filipino/SpriteFont1.xnb",
  "assets/fonts/filipino/SmallFont.xnb",
]) {
  const file = path.join(payload, relative);
  if (!fs.existsSync(file) || fs.readFileSync(file).subarray(0, 3).toString() !== "XNB") {
    errors.push(`${relative}: missing or invalid XNB`);
  }
}

const manifest = readJSON(path.join(payload, "manifest.json"));
if (!manifest?.Description?.includes("Filipino")) errors.push("manifest description omits Filipino");

console.log(JSON.stringify({
  translationFiles: translationFiles.length,
  includes: actualIncludes.length,
  requiredLoads: expectedLoads.length,
  warnings: 0,
  errors: errors.length,
}, null, 2));
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
