#!/usr/bin/env node

import crypto from "node:crypto";
import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const payload = path.join(root, "Sources/StardewTranslationInstaller/Resources/ModPayload");
const translationRoot = path.join(payload, "assets/translations/ukrainian");
const batchRoot = path.join(root, "Documentation/uk/batches");
const errors = [];
const hash = value => crypto.createHash("sha256").update(value).digest("hex");

function files(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  }).sort();
}

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON: ${path.relative(root, file)}: ${error.message}`);
    return null;
  }
}

for (const file of files(root).filter(file => file.endsWith(".json"))) readJSON(file);

const glossary = readJSON(path.join(root, "Documentation/glossary/glossary.uk.json"))?.uk ?? {};
const glossaryAudit = readJSON(path.join(root, "Documentation/uk/glossary-audit-history.json"));
const editorialAudit = readJSON(path.join(root, "Documentation/uk/editorial-audit-history.json"));
const runtimeQA = readJSON(path.join(root, "Documentation/uk/runtime-qa.json"));
const verification = readJSON(path.join(root, "Documentation/uk/verification.json"));
const glossaryFingerprint = hash(JSON.stringify(glossary));
if (Object.keys(glossary).length !== 673) errors.push("Ukrainian glossary does not contain 673 entries");
if (glossaryFingerprint !== "05cd920a97c24667c7c55f6c1cb2e60544dae3bdadd2fe726544c925e71602b3") {
  errors.push("Ukrainian glossary fingerprint changed after its editorial lock");
}
if ((glossaryAudit?.passes ?? []).slice(-2).some(pass => pass.clean !== true || pass.findings !== 0)
  || (glossaryAudit?.passes ?? []).length < 2) {
  errors.push("Ukrainian glossary lacks two consecutive clean editorial audits");
}

const batches = files(batchRoot).filter(file => file.endsWith(".json")).map(readJSON).filter(Boolean);
const records = [];
const ids = new Set();
for (const batch of batches) {
  if (batch.locale !== "uk" || !Array.isArray(batch.records) || !batch.records.length) {
    errors.push(`Invalid Ukrainian batch: ${batch.id ?? "unknown"}`);
    continue;
  }
  const fingerprint = hash(JSON.stringify(batch.records.map(record => [record.target, record.key, record.translation])));
  if (batch.audit?.reviewedTextSHA256 !== fingerprint) errors.push(`Invalid review fingerprint: ${batch.id}`);
  if (batch.audit?.glossarySHA256 !== glossaryFingerprint) errors.push(`Stale glossary review: ${batch.id}`);
  for (const record of batch.records) {
    const id = `${record.target}\0${record.key}`;
    if (ids.has(id)) errors.push(`Duplicate reviewed record: ${id}`);
    ids.add(id);
    if (record.reviewed !== true || typeof record.english !== "string" || typeof record.translation !== "string") {
      errors.push(`Incomplete reviewed record: ${id}`);
      continue;
    }
    if (record.translation !== record.translation.normalize("NFC")
      || /[\uFFFD\u200B\u202A-\u202E\u2066-\u2069]/u.test(record.translation)) {
      errors.push(`Invalid Unicode: ${id}`);
    }
    if (/[ыэъёЫЭЪЁ]/u.test(record.translation)) errors.push(`Russian-only letter: ${id}`);
    if (record.translation === record.english && !record.preserveReason?.trim()) {
      errors.push(`Unjustified source preservation: ${id}`);
    }
    if (record.english.includes("${")) {
      const macros = text => [...text.matchAll(/\$\{([^}\r\n]+)\}\$/g)].map(match => match[1]);
      const sourceMacros = macros(record.english);
      const targetMacros = macros(record.translation);
      if (sourceMacros.length !== targetMacros.length) errors.push(`Variant macro count mismatch: ${id}`);
      sourceMacros.forEach((source, index) => {
        const target = targetMacros[index] ?? "";
        if (/[A-Za-z]/.test(source) && source === target) errors.push(`Untranslated variant macro: ${id}`);
        if (JSON.stringify(source.match(/[\^¦]/g) ?? []) !== JSON.stringify(target.match(/[\^¦]/g) ?? [])) {
          errors.push(`Variant separator mismatch: ${id}`);
        }
      });
    }
    records.push(record);
  }
}
if (batches.length !== 361) errors.push(`Batch count is ${batches.length}, expected 361`);
if (records.length !== 14725) errors.push(`Reviewed record count is ${records.length}, expected 14725`);

const translationFiles = files(translationRoot).filter(file => file.endsWith(".json"));
const patched = new Set();
for (const file of translationFiles) {
  const document = readJSON(file);
  if (!document) continue;
  if (Object.hasOwn(document, "Format") || !Array.isArray(document.Changes) || !document.Changes.length) {
    errors.push(`Invalid secondary include: ${path.relative(root, file)}`);
    continue;
  }
  for (const change of document.Changes) {
    if (change.Action !== "EditData" || change.When?.Language !== "uk-vnrevival") {
      errors.push(`Invalid Ukrainian locale gate: ${path.relative(root, file)}`);
    }
    for (const key of Object.keys(change.Entries ?? {})) patched.add(`${change.Target}\0${key}`);
    for (const [entry, fields] of Object.entries(change.Fields ?? {})) {
      const escape = value => value.replaceAll("~", "~0").replaceAll("/", "~1");
      for (const field of Object.keys(fields)) patched.add(`${change.Target}\0/${escape(entry)}/${escape(field)}`);
    }
  }
}
if (translationFiles.length !== 191) errors.push(`Ukrainian include count is ${translationFiles.length}, expected 191`);
if (patched.size !== 14725) errors.push(`Ukrainian patched record count is ${patched.size}, expected 14725`);
for (const id of ids) if (!patched.has(id)) errors.push(`Reviewed record absent from includes: ${id}`);
for (const id of patched) if (!ids.has(id)) errors.push(`Unreviewed record present in includes: ${id}`);

const config = readJSON(path.join(root, "Sources/StardewTranslationInstaller/Resources/PackageConfig.json"));
if (config?.languageCodes?.filter(code => code === "uk-vnrevival").length !== 1) {
  errors.push("PackageConfig must contain uk-vnrevival exactly once");
}
if (!config?.nativeLanguageName?.includes("Українська")) errors.push("PackageConfig omits Українська");

const manifest = readJSON(path.join(payload, "manifest.json"));
const manifestVersion = String(manifest?.Version ?? "").split(".").map(Number);
if (manifestVersion.length !== 3 || manifestVersion.some(Number.isNaN)
  || manifestVersion[0] !== 1 || manifestVersion[1] < 9
  || !manifest?.Description?.includes("Ukrainian")) {
  errors.push("Unified content-pack manifest does not identify the Ukrainian release");
}

const content = readJSON(path.join(payload, "content.json"));
if (content?.Format !== "2.9.0" || !Array.isArray(content?.Changes)) errors.push("Invalid root content.json");
const changes = content?.Changes ?? [];
const entry = changes.find(change => change.Action === "EditData" && change.Target === "Data/AdditionalLanguages")
  ?.Entries?.["{{ModId}}_Ukrainian"];
if (entry?.LanguageCode !== "uk-vnrevival" || entry?.ButtonTexture !== "Mods/{{ModId}}/ButtonUkrainian"
  || entry?.UseLatinFont !== false || entry?.FontFile !== "Fonts/Ukrainian"
  || entry?.FontPixelZoom !== 1) {
  errors.push("Invalid Ukrainian AdditionalLanguages entry");
}
function requireLoad(target, fromFile, locale) {
  const matches = changes.filter(change => change.Action === "Load" && change.Target === target
    && change.FromFile === fromFile && change.TargetLocale === locale);
  if (matches.length !== 1) errors.push(`Expected one load: ${target} <- ${fromFile}`);
}
requireLoad("Mods/{{ModId}}/ButtonUkrainian", "assets/button-ukrainian.png", undefined);
requireLoad("Minigames/TitleButtons", "assets/title/TitleButtons-ukrainian.png", "uk-vnrevival");
requireLoad("Fonts/SpriteFont1", "assets/fonts/ukrainian/SpriteFont1.xnb", "uk-vnrevival");
requireLoad("Fonts/SmallFont", "assets/fonts/ukrainian/SmallFont.xnb", "uk-vnrevival");
requireLoad("Fonts/Ukrainian", "assets/fonts/ukrainian/Ukrainian.xnb", undefined);
requireLoad("Fonts/Ukrainian_0", "assets/fonts/ukrainian/Ukrainian_0.xnb", undefined);
const includes = changes.filter(change => change.Action === "Include").map(change => change.FromFile);
for (const file of translationFiles) {
  const include = `assets/translations/ukrainian/${path.relative(translationRoot, file)}`;
  if (includes.filter(value => value === include).length !== 1) errors.push(`Include must appear exactly once: ${include}`);
}
if (includes.filter(value => value.startsWith("assets/translations/ukrainian/")).length !== 191) {
  errors.push("Root content.json must include exactly 191 Ukrainian files");
}

function requirePNG(relative, width, height) {
  const buffer = fs.readFileSync(path.join(payload, relative));
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a"
    || buffer.readUInt32BE(16) !== width || buffer.readUInt32BE(20) !== height) {
    errors.push(`Invalid PNG: ${relative}`);
  }
}
requirePNG("assets/button-ukrainian.png", 174, 78);
requirePNG("assets/title/TitleButtons-ukrainian.png", 400, 655);
for (const relative of [
  "assets/fonts/ukrainian/SpriteFont1.xnb",
  "assets/fonts/ukrainian/SmallFont.xnb",
  "assets/fonts/ukrainian/Ukrainian.xnb",
  "assets/fonts/ukrainian/Ukrainian_0.xnb",
]) {
  const file = path.join(payload, relative);
  if (!fs.existsSync(file) || fs.readFileSync(file).subarray(0, 3).toString("ascii") !== "XNB") {
    errors.push(`Missing or invalid XNB: ${relative}`);
  }
}

const expectedRuntimeAssets = [
  "Fonts/SpriteFont1.uk-vnrevival",
  "Fonts/SmallFont.uk-vnrevival",
  "Minigames/TitleButtons.uk-vnrevival",
];
if (runtimeQA?.freshLaunch !== true || runtimeQA?.locale !== "uk-vnrevival"
  || runtimeQA?.contentPatcherErrors !== 0 || runtimeQA?.visualQAPassed !== true
  || JSON.stringify(runtimeQA?.loadedAssets) !== JSON.stringify(expectedRuntimeAssets)) {
  errors.push("Fresh Ukrainian runtime and visual QA is incomplete");
}
const runtimeLog = fs.readFileSync(path.join(root, runtimeQA?.log ?? "missing"), "utf8");
for (const asset of expectedRuntimeAssets) if (!runtimeLog.includes(`loaded asset '${asset}'`)) {
  errors.push(`SMAPI runtime log omits ${asset}`);
}
if (!runtimeLog.includes("Context: locale set to mod (uk-vnrevival).")) errors.push("SMAPI did not activate uk-vnrevival");
if (/Error loading patch|Can't apply patch|incorrectly set asset to a null value|Invalid SpriteFont|root-only field/i.test(runtimeLog)) {
  errors.push("SMAPI runtime log contains a Content Patcher failure");
}
if (verification?.translationBuild?.repeatBuildIdentical !== true
  || verification?.fonts?.roundTripPassed !== true
  || verification?.fonts?.repeatBuildIdentical !== true
  || verification?.swiftTests?.failed !== 0 || verification?.swiftTests?.passed < 10
  || verification?.releaseBuild?.succeeded !== true
  || verification?.releaseBuild?.codesignDeepStrictPassed !== true) {
  errors.push("Recorded build, test, font, or signing verification is incomplete");
}
for (const [relative, expected] of [
  ["assets/fonts/ukrainian/SpriteFont1.xnb", verification?.fonts?.SpriteFont1SHA256],
  ["assets/fonts/ukrainian/SmallFont.xnb", verification?.fonts?.SmallFontSHA256],
  ["assets/button-ukrainian.png", verification?.staticAssets?.buttonSHA256],
  ["assets/title/TitleButtons-ukrainian.png", verification?.staticAssets?.titleButtonsSHA256],
]) if (hash(fs.readFileSync(path.join(payload, relative))) !== expected) errors.push(`Verified artifact changed: ${relative}`);
const app = path.join(root, "dist/Stardew Translation Installer.app");
try {
  childProcess.execFileSync("codesign", ["--verify", "--deep", "--strict", app], { stdio: "pipe" });
} catch {
  errors.push("Release app fails deep strict code-signature verification");
}

const wordingFingerprint = hash(JSON.stringify(records.map(record => [record.target, record.key, record.translation])));
if (editorialAudit?.wordingFingerprint !== wordingFingerprint
  || editorialAudit?.consecutiveCleanFullPasses !== 2
  || (editorialAudit?.passes ?? []).slice(-2).some(pass => pass.clean !== true || pass.findings !== 0)) {
  errors.push("Ukrainian wording lacks two consecutive clean full editorial audits");
}
const report = {
  locale: "uk",
  batches: batches.length,
  records: records.length,
  translated: records.filter(record => record.translation !== record.english).length,
  justifiedPreserves: records.filter(record => record.translation === record.english).length,
  includeFiles: translationFiles.length,
  runtimeIncludes: includes.filter(value => value.startsWith("assets/translations/ukrainian/")).length,
  glossaryEntries: Object.keys(glossary).length,
  glossaryFingerprint,
  wordingFingerprint,
  warnings: 0,
  errors,
};
if (process.argv.includes("--write-report")) {
  fs.writeFileSync(path.join(root, "Documentation/uk/release-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify({ ...report, errors: errors.length }, null, 2));
for (const error of errors) console.error(`ERROR ${error}`);
process.exitCode = errors.length ? 1 : 0;
