#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const file = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/burmese/monsters-01.json",
);
const document = JSON.parse(fs.readFileSync(file, "utf8"));
const names = new Map([
  ["Squid Kid", "စကွစ်ကလေး"],
  ["Spiker", "ဆူးထောင်ကောင်"],
  ["Lava Lurk", "ချော်ရည်ပုန်းကောင်"],
  ["Blue Squid", "အပြာရောင်စကွစ်"],
]);
let updated = 0;

for (const change of document.Changes ?? []) {
  if (change.Target !== "Data/Monsters") continue;
  for (const [key, value] of Object.entries(change.Entries ?? {})) {
    const fields = value.split("/");
    const translated = names.get(fields.at(-1));
    if (!translated) continue;
    fields[fields.length - 1] = translated;
    change.Entries[key] = fields.join("/");
    updated += 1;
  }
}

fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(JSON.stringify({ updated }));
