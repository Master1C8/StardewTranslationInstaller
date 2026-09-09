#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const modernRoot = path.resolve(process.argv[2] ?? "/private/tmp/stardew-fil-source-supplement/modern");
const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";
const gameContent = "/Users/antonkrutov/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/Resources/Content";
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/filipino",
);
const inventory = JSON.parse(fs.readFileSync(
  path.join(projectRoot, "Documentation/filipino/source-inventory.json"),
  "utf8",
));
const evidence = JSON.parse(fs.readFileSync(
  path.join(projectRoot, "Documentation/filipino/supplemental-visible-fields.json"),
  "utf8",
));
const errors = [];

function hash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}
function listJSON(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSON(full);
    return entry.isFile() && entry.name.endsWith(".json") ? [full] : [];
  });
}
function leaves(value, trail = []) {
  if (Array.isArray(value)) return value.flatMap((child, index) => leaves(child, [...trail, String(index)]));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, [...trail, key]));
  }
  return typeof value === "string" ? [{ path: trail, value }] : [];
}
function lookup(value, trail) {
  return trail.reduce((current, key) => current?.[key], value);
}
function isReference(value) {
  const trimmed = value.trim();
  return /\[LocalizedText\s+[^\]]+\]/i.test(trimmed)
    || /^\[[A-Za-z0-9_]+\]$/.test(trimmed)
    || /^(?:Strings|Data)[\\/][^:]+:[^\s]+$/.test(trimmed);
}

const translations = new Map();
for (const file of listJSON(translationRoot)) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const change of document.Changes ?? []) {
    for (const [key, value] of Object.entries(change.Entries ?? {})) {
      translations.set(`${change.Target}\u0000${key}`, value);
    }
  }
}

const supplemental = inventory.assets.filter((asset) => asset.kind.startsWith("supplemental structured data"));
if (supplemental.length !== evidence.supplementalAssets) {
  errors.push(`supplemental asset count ${supplemental.length}, expected ${evidence.supplementalAssets}`);
}
const documents = new Map();
for (const asset of supplemental) {
  const jsonFile = path.join(modernRoot, `${asset.target}.json`);
  const xnbFile = path.join(gameContent, `${asset.target}.xnb`);
  if (!fs.existsSync(jsonFile)) {
    errors.push(`missing extraction: ${asset.target}`);
    continue;
  }
  if (!fs.existsSync(xnbFile) || hash(fs.readFileSync(xnbFile)) !== asset.xnbSHA256) {
    errors.push(`installed XNB drift: ${asset.target}`);
  }
  const raw = fs.readFileSync(jsonFile);
  if (hash(raw) !== asset.extractionSHA256) errors.push(`extraction drift: ${asset.target}`);
  documents.set(asset.target, JSON.parse(raw).content);
}
const extractedTargets = listJSON(modernRoot)
  .map((file) => path.relative(modernRoot, file).replace(/\.json$/, ""))
  .sort();
if (JSON.stringify(extractedTargets) !== JSON.stringify(supplemental.map((asset) => asset.target).sort())) {
  errors.push("supplemental extraction target set differs from inventory");
}

const references = [];
for (const [target, content] of documents) {
  for (const leaf of leaves(content)) {
    for (const match of leaf.value.matchAll(/Strings[/\\]+([A-Za-z0-9_]+):([^\s\[\]]+)/g)) {
      references.push({ origin: target, path: leaf.path, target: `Strings/${match[1]}`, key: match[2] });
    }
    if (target === "Data/SpecialOrders") {
      for (const match of leaf.value.matchAll(/\[([A-Za-z0-9_]+)\]/g)) {
        references.push({ origin: target, path: leaf.path, target: "Strings/SpecialOrderStrings", key: match[1] });
      }
    }
  }
}
const uniqueReferences = new Set(references.map((record) => `${record.target}\u0000${record.key}`));
if (references.length !== evidence.explicitReferenceOccurrences) {
  errors.push(`explicit references ${references.length}, expected ${evidence.explicitReferenceOccurrences}`);
}
if (uniqueReferences.size !== evidence.explicitReferenceTargets) {
  errors.push(`unique reference targets ${uniqueReferences.size}, expected ${evidence.explicitReferenceTargets}`);
}
for (const id of uniqueReferences) {
  if (!translations.has(id)) errors.push(`untranslated explicit reference: ${id.replace("\u0000", " :: ")}`);
}

const visibleFields = new Set([
  "BirthText", "ChestFullMessage", "ClosedMessage", "DeniedMessage", "Description",
  "Dialogue", "DisplayName", "FromDisplayName", "InvalidCountMessage", "InvalidItemMessage",
  "Message", "NameForGeneralType", "RewardDialogue", "ScrollText", "ShopDescription",
  "ShopDisplayName", "ShopMissingBuildingDescription", "StartMessage", "Text", "TextStrings",
  "Title", "TooltipStringPath",
]);
const directVisible = [];
for (const [target, content] of documents) {
  for (const leaf of leaves(content)) {
    if (visibleFields.has(leaf.path.at(-1)) && leaf.value.trim() && !isReference(leaf.value)) {
      directVisible.push({ target, path: leaf.path, source: leaf.value });
    }
    if (leaf.path.at(-1) === "Script"
      && /(?:message|spriteText|speak|question|textAboveHead)\b/i.test(leaf.value)
      && !/\[LocalizedText\s+[^\]]+\]/i.test(leaf.value)) {
      errors.push(`direct visible text in script: ${target} :: ${leaf.path.join(".")}`);
    }
    if (leaf.path.includes("RandomDialogue") && !isReference(leaf.value)) {
      errors.push(`direct shop dialogue: ${target} :: ${leaf.path.join(".")}`);
    }
  }
}
const classifiedDirect = [
  ...evidence.directVisibleFields,
  ...evidence.technicalVisibleFieldExceptions,
].map((record) => ({ target: record.target, path: record.path, source: record.source }));
const normalize = (record) => `${record.target}\u0000${record.path.join(".")}\u0000${record.source}`;
if (JSON.stringify(directVisible.map(normalize).sort()) !== JSON.stringify(classifiedDirect.map(normalize).sort())) {
  errors.push(`direct visible field classification drift: ${JSON.stringify(directVisible)}`);
}
for (const record of evidence.directVisibleFields) {
  const content = documents.get(record.target);
  if (lookup(content, record.path) !== record.source) errors.push(`direct source drift: ${record.target} :: ${record.path.join(".")}`);
  const patch = JSON.parse(fs.readFileSync(path.join(translationRoot, record.patch), "utf8"));
  const value = patch.Changes?.find((change) => change.Target === record.target)
    ?.Fields?.[record.path[0]]?.[record.path[1]];
  if (value !== record.translation) errors.push(`direct translation missing: ${record.target} :: ${record.path.join(".")}`);
}

const randomBundles = documents.get("Data/RandomBundles") ?? [];
const englishBundles = JSON.parse(fs.readFileSync(path.join(englishRoot, "Data/Bundles.json"), "utf8")).content;
const baseBundleNames = new Map(
  Object.entries(englishBundles).map(([key, value]) => [value.split("/")[0], key]),
);
let implicitBundleNames = 0;
for (const area of randomBundles) {
  const bundles = [
    ...(area.BundleSets ?? []).flatMap((set) => set.Bundles ?? []),
    ...(area.Bundles ?? []),
  ];
  for (const bundle of bundles) {
    const stringTranslation = translations.get(`Strings/BundleNames\u0000${bundle.Name}`);
    const baseKey = baseBundleNames.get(bundle.Name);
    const baseTranslation = baseKey && translations.get(`Data/Bundles\u0000${baseKey}`);
    const localizedBaseName = baseTranslation?.split("/").at(-1);
    if (!(stringTranslation && stringTranslation !== bundle.Name)
      && !(localizedBaseName && localizedBaseName !== bundle.Name)) {
      errors.push(`untranslated random bundle name: ${bundle.Name}`);
    }
    implicitBundleNames += 1;
  }
}
if (implicitBundleNames !== evidence.implicitLocalization[0].records) {
  errors.push(`implicit bundle names ${implicitBundleNames}, expected ${evidence.implicitLocalization[0].records}`);
}

console.log(JSON.stringify({
  supplementalAssets: documents.size,
  explicitReferenceOccurrences: references.length,
  explicitReferenceTargets: uniqueReferences.size,
  directVisibleFields: evidence.directVisibleFields.length,
  technicalVisibleFieldExceptions: evidence.technicalVisibleFieldExceptions.length,
  implicitBundleNames,
  warnings: 0,
  errors: errors.length,
  details: errors,
}, null, 2));
if (errors.length) process.exitCode = 1;
