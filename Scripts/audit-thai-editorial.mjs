#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const batchRoot = path.join(projectRoot, "Documentation/thai-batches");
const glossaryEnglishPath = path.join(projectRoot, "Documentation/glossary/glossary.en.json");
const glossaryThaiPath = path.join(projectRoot, "Documentation/glossary/glossary.th.json");
const details = [];

function listJSONFiles(directory) {
  return fs.readdirSync(directory).filter((name) => name.endsWith(".json")).sort();
}

function visibleText(value) {
  const quoted = [...value.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((match) => match[1]);
  const candidate = quoted.length ? quoted.join(" ") : value;
  return candidate
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\$[A-Za-z0-9]+|%[a-z][A-Za-z0-9_]*/g, " ")
    .replace(/\b(?:Data|Strings|Characters|Maps|Mods|Fonts|Minigames)\/[A-Za-z0-9_./-]+\b/g, " ");
}

const allowedEnglish = new Set([
  "am", "pm", "ip", "lan", "vn", "ui", "hp", "xp", "fps", "vsync", "smapi", "joja", "jojamart",
  "stardew", "marilda", "mr", "ms", "tv", "ok", "qi", "kel", "ai", "url", "id", "g",
]);

const requiredTerms = [
  ["Stardew Valley", "หุบเขาสตาร์ดิว"],
  ["Pelican Town", "เมืองเพลิแกน"],
  ["Ginger Island", "เกาะขิง"],
  ["Calico Desert", "ทะเลทรายคาลิโก"],
  ["Community Center", "ศูนย์ชุมชน"],
  ["Adventurer's Guild", "สมาคมนักผจญภัย"],
  ["Skull Cavern", "ถ้ำกะโหลก"],
  ["Prismatic Shard", "เศษปริซึม"],
  ["Junimo", "จูนิโม"],
  ["Yoba", "โยบา"],
  ["Stardrop", "สตาร์ดรอป"],
];

function glossaryAlternatives(value) {
  return value.split(/\s+\/\s+/u).map((part) => part.trim()).filter(Boolean);
}

function hasEnglishTerm(value, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const left = /^[A-Za-z0-9]/.test(term) ? "(?<![A-Za-z0-9])" : "";
  const right = /[A-Za-z0-9]$/.test(term) ? "(?![A-Za-z0-9])" : "";
  return new RegExp(`${left}${escaped}${right}`, "iu").test(value);
}

const glossaryEnglish = JSON.parse(fs.readFileSync(glossaryEnglishPath, "utf8"));
const glossaryThai = JSON.parse(fs.readFileSync(glossaryThaiPath, "utf8")).th;
const p0Glossary = glossaryEnglish
  .filter((entry) => entry.priority === "P0" && glossaryThai[entry.id]?.term)
  .map((entry) => ({
    id: entry.id,
    english: glossaryAlternatives(entry.term),
    thai: glossaryAlternatives(glossaryThai[entry.id].term),
  }));

let records = 0;
for (const relative of listJSONFiles(batchRoot)) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchRoot, relative), "utf8"));
  for (const record of batch.records ?? []) {
    records += 1;
    if (record.reviewedPreserve) continue;
    const source = record.source ?? "";
    const translation = record.translation ?? "";
    const visible = visibleText(translation);
    for (const match of visible.matchAll(/\b[A-Za-z][A-Za-z'-]{2,}\b/g)) {
      const token = match[0].toLowerCase();
      if (!allowedEnglish.has(token) && !/^event_|^mail_|^cc_|^item_|^npc_/i.test(token)) {
        details.push(`English residue candidate: ${record.target} :: ${record.key}: ${match[0]}`);
        break;
      }
    }
    for (const [english, thai] of requiredTerms) {
      if (source.toLowerCase().includes(english.toLowerCase()) && !translation.includes(thai)) {
        details.push(`glossary candidate ${JSON.stringify(english)}: ${record.target} :: ${record.key}`);
      }
    }
    const visibleSource = visibleText(source);
    for (const entry of p0Glossary) {
      if (entry.english.some((term) => hasEnglishTerm(visibleSource, term)) && !entry.thai.some((term) => translation.includes(term))) {
        details.push(`P0 glossary candidate ${JSON.stringify(entry.id)}: ${record.target} :: ${record.key}`);
      }
    }
    const sourceNumbers = [...source.matchAll(/(?<![A-Za-z])\d+(?:[.,]\d+)?/g)].map((match) => match[0]).sort();
    const translationNumbers = [...translation.matchAll(/(?<![A-Za-z])\d+(?:[.,]\d+)?/g)].map((match) => match[0]).sort();
    if (JSON.stringify(sourceNumbers) !== JSON.stringify(translationNumbers)) {
      details.push(`number candidate: ${record.target} :: ${record.key}: source=${JSON.stringify(sourceNumbers)} translation=${JSON.stringify(translationNumbers)}`);
    }
    if (/\s+[,.!?;:](?:\s|$)/u.test(translation)) {
      details.push(`space-before-punctuation candidate: ${record.target} :: ${record.key}`);
    }
    if (/โทเทม/u.test(translation)) details.push(`totem spelling candidate: ${record.target} :: ${record.key}`);
    if (/จริงๆ|ต่างๆ|เล็กๆ|มากๆ|ดีๆ|เร็วๆ|ง่ายๆ|ใหม่ๆ|น้อยๆ|ใกล้ๆ|ช้าๆ|บ่อยๆ|สั้นๆ|ยาวๆ|ใหญ่ๆ/u.test(translation)) {
      details.push(`Thai repetition spacing candidate: ${record.target} :: ${record.key}`);
    }
  }
}

console.log(JSON.stringify({ records, candidates: details.length, details }, null, 2));
if (records !== 14720) process.exit(1);
