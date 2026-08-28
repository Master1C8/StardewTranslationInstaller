import fs from "node:fs";
import path from "node:path";

const englishRoot = "/Users/antonkrutov/Developer/data/stardew-english-unpacked";

export function materializeReplacementBatch({ root, tamilFile, outputFile, translations, preserveReasons = {} }) {
  const input = JSON.parse(fs.readFileSync(path.join(root, "Documentation/tamil-batches", tamilFile), "utf8"));
  const cache = new Map();
  function englishContent(target) {
    if (!cache.has(target)) {
      cache.set(target, JSON.parse(fs.readFileSync(path.join(englishRoot, `${target}.json`), "utf8")).content);
    }
    return cache.get(target);
  }
  const records = input.records.map((record, index) => {
    const source = englishContent(record.target)?.[record.key];
    if (typeof source !== "string") throw new Error(`Missing English source: ${record.target} :: ${record.key}`);
    const replacements = record.replacements ?? [];
    const localized = translations[index] ?? [];
    if (localized.length !== replacements.length) {
      throw new Error(`Replacement count mismatch in record ${index + 1}: ${localized.length} vs ${replacements.length}`);
    }
    let translation = source;
    replacements.forEach(([from], replacementIndex) => {
      if (!translation.includes(from)) throw new Error(`Missing source fragment in record ${index + 1}: ${from}`);
      translation = translation.replaceAll(from, localized[replacementIndex]);
    });
    const result = { target: record.target, key: record.key, source, translation };
    if (translation === source) {
      const reason = preserveReasons[index];
      if (!reason) throw new Error(`Source-identical record ${index + 1} requires a Bengali preserve reason.`);
      result.reviewedPreserve = true;
      result.reason = reason;
    }
    return result;
  });
  fs.writeFileSync(
    path.join(root, "Documentation/bengali-batches", outputFile),
    `${JSON.stringify({ id: input.id, kind: input.kind, records })}\n`,
  );
}
