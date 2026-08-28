import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian/extra-dialogue.json');
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
const change = document.Changes.find((entry) => entry.Target === 'Data/ExtraDialogue');
if (!change) throw new Error('Missing Data/ExtraDialogue change');

const common = [
  ['Well, well, well... you made it.', 'Wah, wah, wah... kamu berhasil.'],
  ["Come closer, now... don't be shy.", 'Mendekatlah... jangan malu.'],
  ['I heard you were attempting a deep dive into these caverns today...#$b#I had to see for myself!', 'Kudengar hari ini kamu mencoba menjelajah jauh ke dalam gua-gua ini...#$b#Aku harus melihatnya sendiri!'],
  ["Now... go over to the table and drink this special milk I've prepared for you.", 'Sekarang... pergilah ke meja dan minum Susu istimewa yang kusiapkan untukmu.'],
  ["It's called 'Iridium Snake Milk'... one healthy swig of that and you'll become even more powerful.", "Namanya 'Susu Ular Iridium'... satu tegukan besar akan membuatmu menjadi lebih kuat."],
  ['The taste is awful, and the texture is even worse.', 'Rasanya mengerikan, dan teksturnya bahkan lebih buruk.'],
  ['... But your health is permanently increased by 25!', '... Namun, Kesehatanmu meningkat 25 secara permanen!'],
  ['Good luck out there, kid.', 'Semoga beruntung di luar sana, Nak.'],
];

const replacements = {
  SkullCavern_100_event: [
    ...common,
    ["Impressive... very impressive. Making it all the way down here is quite a feat!#$b#...although you did skip a bunch of levels by crafting staircases. Clever, sure... but not very honorable.$1#$b#Even so, it must have been a lot of work to mine all that stone. And that sort of dedication is praiseworthy. You're a rare one, kid.", 'Mengesankan... sangat mengesankan. Mencapai tempat sedalam ini adalah pencapaian besar!#$b#...meskipun kamu melewati banyak lantai dengan membuat Tangga. Cerdik, tentu saja... tetapi kurang terhormat.$1#$b#Meski begitu, menambang semua Batu itu pasti membutuhkan banyak pekerjaan. Dedikasi semacam itu patut dipuji. Kamu orang langka, Nak.'],
  ],
  SkullCavern_100_event_honorable: [
    ...common,
    ["Impressive... very impressive. You passed my test with flying colors, kid.#$b#I'm very pleased that you challenged yourself and came down the honorable way, instead of skipping all the levels by crafting staircases.#$b#That shows you're the real deal, kid. You've got principles.#$b#You understand the importance of challenging yourself, and holding yourself to the highest standard, even if no one is watching.#$b#That's why you're special, kid... see? You lead by example. I like that.", 'Mengesankan... sangat mengesankan. Kamu lulus ujianku dengan hasil luar biasa, Nak.#$b#Aku sangat senang kamu menantang diri sendiri dan turun dengan cara terhormat, bukan melewati semua lantai dengan membuat Tangga.#$b#Itu menunjukkan bahwa kamu benar-benar hebat, Nak. Kamu memiliki prinsip.#$b#Kamu memahami pentingnya menantang diri sendiri dan mempertahankan standar tertinggi, bahkan saat tidak ada yang melihat.#$b#Itulah sebabnya kamu istimewa, Nak... mengerti? Kamu memimpin dengan memberi teladan. Aku menyukainya.'],
  ],
};

let changed = 0;
for (const [key, pairs] of Object.entries(replacements)) {
  let value = change.Entries[key];
  if (typeof value !== 'string') throw new Error(`Missing ${key}`);
  for (const [source, target] of pairs) {
    const sourceCount = value.split(source).length - 1;
    const targetCount = value.split(target).length - 1;
    if (sourceCount === 1 && targetCount === 0) value = value.replace(source, target);
    else if (sourceCount === 0 && targetCount === 1) continue;
    else throw new Error(`${key}: ambiguous replacement ${JSON.stringify(source)} (source=${sourceCount}, target=${targetCount})`);
  }
  if (value !== change.Entries[key]) changed++;
  change.Entries[key] = value;
}

fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied ExtraDialogue event translations to ${changed} entries.`);
