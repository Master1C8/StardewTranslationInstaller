#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(scriptDirectory);
const payload = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload",
);
const contentPath = path.join(payload, "content.json");
const xnbcli = process.env.XNBCLI ?? "/Users/antonkrutov/Developer/tools/xnbcli/xnbcli";
const languageDirectories = new Map([
  ["ru-vnrevival", "russian"],
  ["sr-vnrevival", "serbian"],
  ["pl-vnrevival", "polish"],
  ["uk-vnrevival", "ukrainian"],
  ["vi-vnrevival", "vietnamese"],
  ["sw-vnrevival", "swahili"],
  ["fa-vnrevival", "persian"],
  ["ar-vnrevival", "arabic"],
  ["id-vnrevival", "indonesian"],
  ["fil-vnrevival", "filipino"],
  ["nl-vnrevival", "dutch"],
  ["hi-vnrevival", "hindi"],
  ["zh-TW-vnrevival", "traditional-chinese"],
  ["ro-vnrevival", "romanian"],
  ["he-vnrevival", "hebrew"],
  ["bg-vnrevival", "bulgarian"],
  ["th-vnrevival", "thai"],
  ["el-vnrevival", "greek"],
  ["cs-vnrevival", "czech"],
]);

function walkJSON(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkJSON(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(fullPath);
  }
  return files;
}

function collectStringScalars(value, output) {
  if (typeof value === "string") {
    for (const character of value.normalize("NFC")) {
      if (!/^\s$/u.test(character)) output.add(character.codePointAt(0));
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectStringScalars(item, output);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStringScalars(item, output);
  }
}

function hex(value) {
  return `U+${value.toString(16).toUpperCase().padStart(4, "0")}`;
}

const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const changes = content.Changes;
const languageEdit = changes.find(
  (change) => change.Action === "EditData" && change.Target === "Data/AdditionalLanguages",
);
if (!languageEdit?.Entries) throw new Error("Data/AdditionalLanguages registration is missing");

const languages = Object.values(languageEdit.Entries);
if (languages.length !== languageDirectories.size) {
  throw new Error(`expected ${languageDirectories.size} languages, found ${languages.length}`);
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "stardew-bitmap-audit."));
let auditedFonts = 0;
let auditedGlyphs = 0;

try {
  for (const language of languages) {
    const { LanguageCode: code, FontFile: fontTarget } = language;
    const directory = languageDirectories.get(code);
    if (!directory) throw new Error(`unexpected language code ${code}`);
    if (language.UseLatinFont !== false) throw new Error(`${code} still enables the incomplete Latin bitmap font`);
    const expectedZoom = code === "ru-vnrevival" ? 3 : 1;
    if (language.FontPixelZoom !== expectedZoom) {
      throw new Error(`${code} has unexpected FontPixelZoom ${language.FontPixelZoom}; expected ${expectedZoom}`);
    }
    if (!fontTarget) throw new Error(`${code} has no FontFile`);

    // Russian is a complete font shipped by Stardew Valley itself. Every other
    // locale must provide and load its own source-controlled BMFont pair.
    if (fontTarget === "Fonts/Russian") {
      if (code !== "ru-vnrevival") throw new Error(`${code} unexpectedly reuses Fonts/Russian`);
      continue;
    }

    const fontName = fontTarget.split("/").at(-1);
    const loads = [fontTarget, `${fontTarget}_0`].map((target) =>
      changes.filter((change) => change.Action === "Load" && change.Target === target),
    );
    if (loads.some((matches) => matches.length !== 1)) {
      throw new Error(`${code} must load ${fontTarget} and ${fontTarget}_0 exactly once`);
    }

    const [fontLoad, textureLoad] = loads.map(([load]) => load);
    const fontPath = path.join(payload, fontLoad.FromFile);
    const texturePath = path.join(payload, textureLoad.FromFile);
    for (const assetPath of [fontPath, texturePath]) {
      if (!fs.existsSync(assetPath)) throw new Error(`${code} is missing ${path.relative(projectRoot, assetPath)}`);
      const header = fs.readFileSync(assetPath).subarray(0, 3).toString("ascii");
      if (header !== "XNB") throw new Error(`${code} has an invalid XNB asset: ${assetPath}`);
    }

    const unpacked = path.join(temporaryRoot, directory);
    fs.mkdirSync(unpacked, { recursive: true });
    execFileSync(xnbcli, ["unpack", fontPath, unpacked], { stdio: "ignore" });
    const xmlPath = path.join(unpacked, `${fontName}.xml`);
    const xml = fs.readFileSync(xmlPath, "utf8");
    const info = xml.match(/<info face="([^"]+)" size="(\d+)"[^>]*smooth="(\d+)"/);
    if (!info) throw new Error(`${code} bitmap font has no readable info metadata`);
    const [, face, size, smooth] = info;
    if (Number(size) < 28 || smooth !== "1") {
      throw new Error(`${code} bitmap font must be native-resolution and antialiased; found ${size}px smooth=${smooth}`);
    }
    if (/bold|полужир/i.test(face)) {
      throw new Error(`${code} bitmap font unexpectedly uses a bold face: ${face}`);
    }
    const latinCapitalA = xml.match(/<char id="65"[^>]* yoffset="(-?\d+)"/);
    if (!latinCapitalA || Number(latinCapitalA[1]) >= 0) {
      throw new Error(
        `${code} bitmap font is not raised above the default baseline: ASCII A yoffset=${latinCapitalA?.[1] ?? "missing"}`,
      );
    }
    const available = new Set(
      [...xml.matchAll(/<char id="(\d+)"/g)].map((match) => Number(match[1])),
    );
    if (available.size === 0) throw new Error(`${code} bitmap font has no glyphs`);

    const required = new Set();
    const translations = path.join(payload, "assets/translations", directory);
    for (const jsonPath of walkJSON(translations)) {
      collectStringScalars(JSON.parse(fs.readFileSync(jsonPath, "utf8")), required);
    }
    const missing = [...required].filter((scalar) => !available.has(scalar));
    if (missing.length > 0) {
      const preview = missing.slice(0, 16).map(hex).join(", ");
      throw new Error(`${code} bitmap font is missing ${missing.length} translation glyphs: ${preview}`);
    }

    auditedFonts += 1;
    auditedGlyphs += required.size;
  }
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log(
  `Bitmap-font audit passed: ${languages.length} locale registrations, ${auditedFonts} custom fonts, ${auditedGlyphs} required glyph checks, plus Stardew's built-in Russian font.`,
);
