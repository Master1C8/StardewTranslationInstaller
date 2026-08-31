import fs from "node:fs";
import path from "node:path";

const [sourceArgument, target, startArgument, countArgument, id, outputArgument] = process.argv.slice(2);
if (!sourceArgument || !target || !startArgument || !countArgument || !id || !outputArgument) {
  console.error("Usage: node Scripts/create-thai-preserve-batch.mjs <translation.json> <target> <start> <count> <id> <output.json>");
  process.exit(1);
}

const start = Number(startArgument);
const count = Number(countArgument);
if (!Number.isSafeInteger(start) || start < 0 || !Number.isSafeInteger(count) || count < 1) {
  throw new Error("start and count must be positive integer slice coordinates");
}

const sourcePath = path.resolve(sourceArgument);
const outputPath = path.resolve(outputArgument);
const document = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const changes = target === "*"
  ? document.Changes ?? []
  : (document.Changes ?? []).filter((candidate) => candidate.Target === target);
if (!changes.length || changes.some((change) => !change.Entries || typeof change.Entries !== "object" || Array.isArray(change.Entries))) {
  throw new Error(`Cannot find object Entries for target ${target} in ${sourcePath}`);
}

const available = changes.flatMap((change) =>
  Object.entries(change.Entries).map(([key, source]) => ({ target: change.Target, key, source })),
);
const selected = available.slice(start, start + count);
if (selected.length !== count) {
  throw new Error(`Requested ${count} records at ${start}, but only found ${selected.length}`);
}

const records = selected.map((record) => {
  if (typeof record.source !== "string") throw new Error(`Non-string source: ${record.target} :: ${record.key}`);
  return { ...record, translation: record.source, reviewedPreserve: true };
});

const batch = {
  id,
  kind: count >= 40 ? "short" : "long",
  records,
};

fs.writeFileSync(outputPath, `${JSON.stringify(batch, null, 2)}\n`);
console.log(JSON.stringify({ id, target, start, records: records.length, output: outputPath }, null, 2));
