import fs from "node:fs";
import path from "node:path";

const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";

export function materializeDirectBatch({ root, id, kind, target, entries, complexityReason }) {
  const english = JSON.parse(fs.readFileSync(path.join(englishRoot, `${target}.json`), "utf8")).content;
  const records = entries.map(({ key, translation, reason }) => {
    const source = english[key];
    if (typeof source !== "string") throw new Error(`Missing English source: ${target} :: ${key}`);
    const result = { target, key, source, translation };
    if (translation === source) {
      if (!reason) throw new Error(`Source-identical record requires a Bengali reason: ${target} :: ${key}`);
      result.reviewedPreserve = true;
      result.reason = reason;
    }
    return result;
  });
  const batch = { id, kind, records };
  if (complexityReason) batch.complexityReason = complexityReason;
  fs.writeFileSync(path.join(root, "Documentation/bengali-batches", `${id}.json`), `${JSON.stringify(batch)}\n`);
}

export function materializeDirectMultiTargetBatch({ root, id, kind, entries, complexityReason }) {
  const cache = new Map();
  const records = entries.map(({ target, key, translation, reason }) => {
    if (!cache.has(target)) {
      cache.set(target, JSON.parse(fs.readFileSync(path.join(englishRoot, `${target}.json`), "utf8")).content);
    }
    const source = cache.get(target)[key];
    if (typeof source !== "string") throw new Error(`Missing English source: ${target} :: ${key}`);
    const result = { target, key, source, translation };
    if (translation === source) {
      if (!reason) throw new Error(`Source-identical record requires a Bengali reason: ${target} :: ${key}`);
      result.reviewedPreserve = true;
      result.reason = reason;
    }
    return result;
  });
  const batch = { id, kind, records };
  if (complexityReason) batch.complexityReason = complexityReason;
  fs.writeFileSync(path.join(root, "Documentation/bengali-batches", `${id}.json`), `${JSON.stringify(batch)}\n`);
}
