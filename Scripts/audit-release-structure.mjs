#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const resources = path.join(root, "Sources/StardewTranslationInstaller/Resources");
const payload = path.join(resources, "ModPayload");
const translations = path.join(payload, "assets/translations");

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && [".build", ".git", ".venv", "dist"].includes(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? files(absolute) : [absolute];
  });
}

for (const file of files(root).filter(file => file.endsWith(".json"))) {
  JSON.parse(fs.readFileSync(file, "utf8"));
}

const config = JSON.parse(fs.readFileSync(path.join(resources, "PackageConfig.json"), "utf8"));
const content = JSON.parse(fs.readFileSync(path.join(payload, "content.json"), "utf8"));
const payloadManifest = JSON.parse(fs.readFileSync(path.join(payload, "manifest.json"), "utf8"));
const infoPlist = fs.readFileSync(path.join(root, "App/Info.plist"), "utf8");
const appIcon = fs.readFileSync(path.join(root, "App/App.icns"));
const appVersion = infoPlist.match(/<key>CFBundleShortVersionString<\/key><string>([^<]+)<\/string>/)?.[1];
const appBuild = infoPlist.match(/<key>CFBundleVersion<\/key><string>([^<]+)<\/string>/)?.[1];
const appIconFile = infoPlist.match(/<key>CFBundleIconFile<\/key><string>([^<]+)<\/string>/)?.[1];
if (appIconFile !== "App.icns" || appIcon.subarray(0, 4).toString("ascii") !== "icns") {
  throw new Error("The installer must bundle App/App.icns and reference it through CFBundleIconFile.");
}
if (!appVersion || payloadManifest.Version !== appVersion) {
  throw new Error(`App and ModPayload versions differ: ${String(appVersion)} / ${String(payloadManifest.Version)}`);
}
if (appBuild !== appVersion.replaceAll(".", "")) {
  throw new Error(`App build ${String(appBuild)} does not match version ${appVersion}.`);
}
if (content.Format !== "2.9.0" || !Array.isArray(content.Changes)) {
  throw new Error("The root content.json must contain Format 2.9.0 and a Changes array.");
}

const includes = content.Changes.filter(change => change.Action === "Include").map(change => change.FromFile);
if (new Set(includes).size !== includes.length) throw new Error("A translation include is loaded more than once.");

const secondary = files(translations).filter(file => file.endsWith(".json"));
const indirectGreek = new Set([
  path.join(translations, "greek/grammar-data.json"),
]);
for (const file of secondary) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  if (indirectGreek.has(file)) continue;
  if (Object.hasOwn(document, "Format") || !Array.isArray(document.Changes) || document.Changes.length === 0) {
    throw new Error(`Invalid secondary translation file: ${path.relative(root, file)}`);
  }
  for (const change of document.Changes) {
    const code = change.When?.Language;
    if (!config.languageCodes.includes(code)) {
      throw new Error(`Invalid locale gate ${String(code)} in ${path.relative(root, file)}`);
    }
  }
  const relative = path.relative(payload, file).split(path.sep).join("/");
  if (includes.filter(value => value === relative).length !== 1) {
    throw new Error(`Expected exactly one root include for ${relative}`);
  }
}

console.log(`Release structure audit passed: ${secondary.length} translation JSON files, ${includes.length} includes, ${config.languageCodes.length} locales.`);
