import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian');
const specs = [
  {
    filename: 'festivals-data-01-fix.json',
    key: 'mainEvent',
    pairs: [
      ["It's time for the highlight of today's festivities... The Annual Spring Egg Hunt!$h", 'Saatnya acara utama perayaan hari ini... Perburuan Telur Musim Semi Tahunan!$h'],
      ["Calm down now, kiddos. You're going to need all your energy if you hope to find the most eggs and take home the exclusive prize.", 'Tenanglah, Anak-Anak. Kalian memerlukan seluruh tenaga untuk menemukan Telur terbanyak dan membawa pulang hadiah eksklusif.'],
      ['Now... Is everyone ready?', 'Sekarang... Apa semuanya siap?'],
      ['Let the egg hunt begin!$h', 'Perburuan Telur dimulai!$h'],
    ],
  },
  {
    filename: 'festivals-data-01.json',
    key: 'afterEggHunt',
    pairs: [
      ["Wow, look at all these eggs!$h#$b#Now if only I could get you kids to pick up litter this efficiently, we'd have the cleanest town this side of the Gem Sea! *chuckle*$h", 'Wah, lihat semua Telur ini!$h#$b#Seandainya kalian bisa memungut sampah seefisien ini, kota kita akan menjadi kota terbersih di sisi Laut Permata! *terkekeh*$h'],
      ["And now, the winner of this year's egg hunt...", 'Dan sekarang, pemenang perburuan Telur tahun ini...'],
      ["Here's your prize! Enjoy.", 'Ini hadiahmu! Nikmatilah.'],
      ["Well, that's it for this year's Egg Festival. Thanks for coming, everyone!", 'Baiklah, Festival Telur tahun ini selesai. Terima kasih sudah datang, semuanya!'],
    ],
  },
  {
    filename: 'festivals-data-01.json',
    key: 'AbbyWin',
    pairs: [
      ["Here's your prize, Abigail. Enjoy!", 'Ini hadiahmu, Abigail. Nikmatilah!'],
      ["Well, that's it for this year's Egg Festival. Thanks for coming, everyone!", 'Baiklah, Festival Telur tahun ini selesai. Terima kasih sudah datang, semuanya!'],
    ],
  },
  {
    filename: 'festivals-data-01.json',
    key: 'afterEggHunt_y2',
    pairs: [
      ["Wow, look at all these eggs!$h#$b#Now if only I could get you kids to pick up litter this efficiently, we'd have the cleanest town this side of the Gem Sea! *chuckle*$h", 'Wah, lihat semua Telur ini!$h#$b#Seandainya kalian bisa memungut sampah seefisien ini, kota kita akan menjadi kota terbersih di sisi Laut Permata! *terkekeh*$h'],
      ["And now, the winner of this year's egg hunt...", 'Dan sekarang, pemenang perburuan Telur tahun ini...'],
      ["Here's your prize! Enjoy.", 'Ini hadiahmu! Nikmatilah.'],
      ["Well, that's it for this year's Egg Festival. Thanks for coming, everyone!", 'Baiklah, Festival Telur tahun ini selesai. Terima kasih sudah datang, semuanya!'],
    ],
  },
  {
    filename: 'festivals-structure-fix.json',
    key: 'mainEvent_y2',
    pairs: [
      ["It's time for the highlight of today's festivities... The Annual Spring Egg Hunt!$h", 'Saatnya acara utama perayaan hari ini... Perburuan Telur Musim Semi Tahunan!$h'],
      ["Calm down now, kiddos. You're going to need all your energy if you hope to find the most eggs and take home the exclusive prize.", 'Tenanglah, Anak-Anak. Kalian memerlukan seluruh tenaga untuk menemukan Telur terbanyak dan membawa pulang hadiah eksklusif.'],
      ['Now... Is everyone ready?', 'Sekarang... Apa semuanya siap?'],
      ['Let the egg hunt begin!$h', 'Perburuan Telur dimulai!$h'],
    ],
  },
];

const docs = new Map();
let changed = 0;
for (const spec of specs) {
  const file = path.join(dir, spec.filename);
  let document = docs.get(file);
  if (!document) {
    document = JSON.parse(fs.readFileSync(file, 'utf8'));
    docs.set(file, document);
  }
  const change = document.Changes.find((entry) => entry.Target === 'Data/Festivals/spring13' && typeof entry.Entries?.[spec.key] === 'string');
  if (!change) throw new Error(`Missing ${spec.key} in ${spec.filename}`);
  let value = change.Entries[spec.key];
  for (const [source, target] of spec.pairs) {
    const sourceCount = value.split(source).length - 1;
    const targetCount = value.split(target).length - 1;
    if (sourceCount === 1 && targetCount === 0) value = value.replace(source, target);
    else if (sourceCount === 0 && targetCount === 1) continue;
    else throw new Error(`${spec.key}: ambiguous replacement ${JSON.stringify(source)} (source=${sourceCount}, target=${targetCount})`);
  }
  if (value !== change.Entries[spec.key]) changed++;
  change.Entries[spec.key] = value;
}

for (const [file, document] of docs) fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied spring13 event translations to ${changed} entries.`);
