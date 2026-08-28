import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian/festivals-data-08.json');
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
const changes = document.Changes.filter((entry) => entry.Target === 'Data/Festivals/winter8');
if (changes.length === 0) throw new Error('Missing Data/Festivals/winter8');

const replacements = {
  mainEvent: [
    ["Alright, everyone. Let's begin this year's ice fishing competition.", 'Baiklah, semuanya. Mari kita mulai lomba memancing di es tahun ini.'],
    ['Contestants, your goal is to catch as many fish as you possibly can in two minutes using the provided fishing rods.#$b#You must catch your fish here, from these holes in the ice.', 'Para peserta, tujuan kalian adalah menangkap ikan sebanyak mungkin dalam waktu dua menit menggunakan pancing yang telah disediakan.#$b#Kalian harus menangkap ikan di sini, dari lubang-lubang pada permukaan es ini.'],
    ['Well, is everyone ready?', 'Baiklah, apakah semuanya siap?'],
    ['Begin!', 'Mulai!'],
  ],
  afterIceFishing: [
    ["Wow, that's a lot of fish!$h", 'Wah, ikannya banyak sekali!$h'],
    ['*gag*... the smell...$s', '*tersedak*... baunya...$s'],
    ["Now, for the winner of this year's ice fishing competition...", 'Sekarang, pemenang lomba memancing di es tahun ini adalah...'],
    ["Here's your prize! Enjoy.", 'Ini hadiahmu! Selamat menikmati.'],
    ["Well, that's it for this year's Festival of Ice. Thanks for coming, everyone! #$b#Now let's release these poor fish...$s", 'Baiklah, berakhirlah Festival Es tahun ini. Terima kasih sudah datang, semuanya! #$b#Sekarang, mari kita lepaskan ikan-ikan malang ini...$s'],
    ["I can't believe I won! Well, time to head home.", 'Aku tidak percaya aku menang! Baiklah, saatnya pulang.'],
  ],
  OtherPlayerWin: [
    ["I didn't win the competition, but it was still fun! Time to head home.", 'Aku tidak memenangkan lomba, tetapi tadi tetap menyenangkan! Saatnya pulang.'],
  ],
  DickWin: [
    ["Here's your prize, Willy. Enjoy.", 'Ini hadiahmu, Willy. Selamat menikmati.'],
    ["Well, that's it for this year's Festival of Ice. Thanks for coming, everyone!#$b#Now let's release these poor fish...$s", 'Baiklah, berakhirlah Festival Es tahun ini. Terima kasih sudah datang, semuanya!#$b#Sekarang, mari kita lepaskan ikan-ikan malang ini...$s'],
    ["I didn't win the competition, but it was still fun! Time to head home.", 'Aku tidak memenangkan lomba, tetapi tadi tetap menyenangkan! Saatnya pulang.'],
  ],
  mainEvent_y2: [
    ["Alright, everyone. Let's begin this year's ice fishing competition.", 'Baiklah, semuanya. Mari kita mulai lomba memancing di es tahun ini.'],
    ['Contestants, with the provided fishing rods you must catch as many fish as you can from these holes in the ice.', 'Para peserta, dengan pancing yang telah disediakan, kalian harus menangkap ikan sebanyak mungkin dari lubang-lubang pada permukaan es ini.'],
    ['Are you all ready?', 'Apakah kalian semua siap?'],
    ['Begin!', 'Mulai!'],
  ],
  afterIceFishing_y2: [
    ["Impressive, that's a lot of caught fish!$h", 'Mengesankan, ikan yang tertangkap banyak sekali!$h'],
    ['*gag*... I will never get used to that stench...$s', '*tersedak*... Aku tidak akan pernah terbiasa dengan bau busuk itu...$s'],
    ["Now, for the winner of this year's ice fishing competition...", 'Sekarang, pemenang lomba memancing di es tahun ini adalah...'],
    ["Here's your prize! Enjoy.", 'Ini hadiahmu! Selamat menikmati.'],
    ["Well, that's it for this year's Festival of Ice. Thanks for coming, everyone!#$b#Now let's release these poor fish...$s", 'Baiklah, berakhirlah Festival Es tahun ini. Terima kasih sudah datang, semuanya!#$b#Sekarang, mari kita lepaskan ikan-ikan malang ini...$s'],
    ["I can't believe I won! Well, time to head home.", 'Aku tidak percaya aku menang! Baiklah, saatnya pulang.'],
  ],
  DickWin_y2: [
    ["Here's your prize, Willy. Enjoy.", 'Ini hadiahmu, Willy. Selamat menikmati.'],
    ["Well, that's it for this year's Festival of Ice. Thanks for coming, everyone!#$b#Now let's release these poor fish...$s", 'Baiklah, berakhirlah Festival Es tahun ini. Terima kasih sudah datang, semuanya!#$b#Sekarang, mari kita lepaskan ikan-ikan malang ini...$s'],
    ["I didn't win the competition, but it was still fun! Time to head home.", 'Aku tidak memenangkan lomba, tetapi tadi tetap menyenangkan! Saatnya pulang.'],
  ],
};

let changed = 0;
for (const [key, pairs] of Object.entries(replacements)) {
  const change = changes.find((entry) => typeof entry.Entries?.[key] === 'string');
  if (!change) throw new Error(`Missing Data/Festivals/winter8 ${key}`);
  let value = change.Entries?.[key];
  for (const [source, target] of pairs) {
    const sourceCount = value.split(source).length - 1;
    const targetCount = value.split(target).length - 1;
    if (sourceCount === 1 && targetCount === 0) {
      value = value.replace(source, target);
      changed += 1;
    } else if (!(sourceCount === 0 && targetCount === 1)) {
      throw new Error(`${key}: ambiguous replacement (source=${sourceCount}, target=${targetCount}) for ${JSON.stringify(source)}`);
    }
  }
  change.Entries[key] = value;
}

fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied winter8 event translations to ${changed} dialogue fragments.`);
