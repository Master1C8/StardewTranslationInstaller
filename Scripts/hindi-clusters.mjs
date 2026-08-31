import fs from "node:fs";

export const PUA_START = 0xE000;
export const PUA_END = 0xF8FF;

const hindiRun = /[\u0900-\u097F\uA8E0-\uA8FF\u200C\u200D]+/gu;
const segmenter = new Intl.Segmenter("hi", { granularity: "grapheme" });

export function clustersIn(value) {
  const result = [];
  for (const run of value.matchAll(hindiRun)) {
    for (const { segment } of segmenter.segment(run[0])) result.push(segment);
  }
  return result;
}

function compareClusters(left, right) {
  const a = [...left].map((character) => character.codePointAt(0));
  const b = [...right].map((character) => character.codePointAt(0));
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return a.length - b.length;
}

export function buildClusterDocument(values) {
  const clusters = new Set();
  for (const value of values) {
    if (typeof value !== "string") continue;
    for (const cluster of clustersIn(value.normalize("NFC"))) clusters.add(cluster);
  }
  const ordered = [...clusters].sort(compareClusters);
  if (PUA_START + ordered.length - 1 > PUA_END) {
    throw new Error(`Hindi cluster map exceeds BMP private-use area: ${ordered.length}`);
  }
  return {
    format: 1,
    description: "Shaped Hindi grapheme clusters used by the Stardew bitmap fonts.",
    entries: ordered.map((cluster, index) => ({
      glyph: String.fromCodePoint(PUA_START + index),
      cluster,
    })),
  };
}

export function mapsFromDocument(document) {
  if (document?.format !== 1 || !Array.isArray(document.entries)) {
    throw new Error("invalid Hindi cluster map");
  }
  const encode = new Map();
  const decode = new Map();
  for (const entry of document.entries) {
    if (typeof entry?.glyph !== "string" || [...entry.glyph].length !== 1
        || typeof entry?.cluster !== "string" || !entry.cluster.length) {
      throw new Error("invalid Hindi cluster-map entry");
    }
    const codepoint = entry.glyph.codePointAt(0);
    if (codepoint < PUA_START || codepoint > PUA_END) {
      throw new Error(`cluster glyph is outside the BMP private-use area: U+${codepoint.toString(16)}`);
    }
    if (encode.has(entry.cluster) || decode.has(entry.glyph)) {
      throw new Error("duplicate Hindi cluster-map entry");
    }
    encode.set(entry.cluster, entry.glyph);
    decode.set(entry.glyph, entry.cluster);
  }
  return { encode, decode };
}

export function encodeHindi(value, encode) {
  return value.replace(hindiRun, (run) => [...segmenter.segment(run)]
    .map(({ segment }) => {
      const glyph = encode.get(segment);
      if (!glyph) throw new Error(`unmapped Hindi cluster: ${JSON.stringify(segment)}`);
      return glyph;
    })
    .join(""));
}

export function decodeHindi(value, decode) {
  return [...value].map((character) => decode.get(character) ?? character).join("");
}

export function readClusterDocument(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
