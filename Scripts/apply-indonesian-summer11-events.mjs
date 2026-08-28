import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian/festivals-data-03.json');
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
const change = document.Changes.find((entry) => entry.Target === 'Data/Festivals/summer11');
if (!change) throw new Error('Missing Data/Festivals/summer11 change');

const replacements = {
  mainEvent: [
    ["Well folks, it's time once again for the potluck ceremony.#$b#I trust that you all put high-quality ingredients in the pot this year. We don't want the governor to regret his visit to the valley!", "Baiklah, Kawan-Kawan, upacara jamuan bersama kembali dimulai.#$b#Aku percaya kalian semua memasukkan bahan berkualitas tinggi ke dalam kuali tahun ini. Jangan sampai Gubernur menyesali kunjungannya ke Lembah!"],
    ['Well... Governor? Would you do us the honor of tasting the soup?', 'Baiklah... Gubernur? Maukah Anda memberi kami kehormatan dengan mencicipi Sup ini?'],
    ["Of course! I've been looking forward to this all year.", 'Tentu saja! Aku sudah menantikannya sepanjang tahun.'],
  ],
  governorReaction6: [
    ["Hmm... It's a bit tangy... but actually, the flavor is quite good!", 'Hmm... Rasanya sedikit tajam... tetapi sebenarnya cukup lezat!'],
    ["Just one minute... there's something in my bowl... what's this?$2", 'Tunggu sebentar... ada sesuatu di mangkukku... apa ini?$2'],
    ['Whaaaat?!', 'Apaaaa?!'], ['*gasp*', '*terkejut*'],
    ['This... This is outrageous!$1#$b#I\'ve never been so insulted in all my life!$1', 'Ini... Ini keterlaluan!$1#$b#Seumur hidup, aku belum pernah merasa sehina ini!$1'],
    ["Blech... my tongue is swelling up... I think I'm going to be sick.$u", 'Blech... lidahku membengkak... Kurasa aku akan muntah.$u'],
    ['Whoever took part in this appalling act is truly reprehensible. Using my very private item for this sick purpose!$4#$b#And to ruin a perfectly good soup... unforgivable! I\'ve never been more ashamed of this community... Truly disgusting.$4', 'Siapa pun yang terlibat dalam perbuatan mengerikan ini benar-benar tercela. Menggunakan barang pribadiku untuk tujuan menjijikkan ini!$4#$b#Dan merusak Sup yang seharusnya lezat... tidak termaafkan! Aku belum pernah semalu ini terhadap komunitas kita... Sungguh menjijikkan.$4'],
    ['Go home, the festival is over.$s', 'Pulanglah, Festival sudah berakhir.$s'],
    ["I guess the 'little prank' didn't go over too well...", "Kurasa 'lelucon kecil' itu tidak diterima dengan baik..."],
    ['Time to head home.', 'Saatnya pulang.'],
  ],
  governorReaction5: [
    ["Hmmm... Well it's not bad, but it's missing something...$s#$b#Did everyone in town contribute an ingredient to the soup? I feel like it's missing someone's unique voice.", 'Hmmm... Yah, rasanya tidak buruk, tetapi ada sesuatu yang kurang...$s#$b#Apa semua warga kota menyumbangkan bahan untuk Sup? Rasanya ada ciri khas seseorang yang hilang.'],
    ["You're right... It's a little bland.$s", 'Anda benar... Rasanya sedikit hambar.$s'],
    ["Well, thanks for joining us this year, Governor. Sorry the soup wasn't anything special.", 'Terima kasih sudah bergabung dengan kami tahun ini, Gubernur. Maaf Supnya tidak istimewa.'],
    ['Now... who else wants some soup?', 'Sekarang... siapa lagi yang menginginkan Sup?'],
    ['The soup was bland, but the luau was still fun!', 'Supnya hambar, tetapi Luau tetap menyenangkan!'],
    ['Time to head home.', 'Saatnya pulang.'],
  ],
  governorReaction4: [
    ["Oh my... that's the best soup I've ever tasted!$h", 'Astaga... ini Sup terlezat yang pernah kucicipi!$h'],
    ["You're right... It's delicious!$h", 'Anda benar... Rasanya lezat!$h'],
    ['Wonderful job, everyone! Now... who else wants a taste?$h', 'Kerja yang luar biasa, semuanya! Sekarang... siapa lagi yang ingin mencicipinya?$h'],
    ["The Governor wasn't kidding... the soup was out of this world!", 'Gubernur tidak bercanda... Supnya luar biasa lezat!'],
    ['Time to head home.', 'Saatnya pulang.'],
  ],
  governorReaction3: [
    ["Ah... that's a very pleasant soup. The produce from this valley never disappoints!", 'Ah... Sup yang sangat lezat. Hasil bumi dari Lembah ini tidak pernah mengecewakan!'],
    ['Mmm... tasty. You all did very well today.', 'Mmm... lezat. Hari ini kalian semua bekerja dengan sangat baik.'],
    ['Now... who else wants some soup?', 'Sekarang... siapa lagi yang menginginkan Sup?'],
    ['The Luau was a success! Good thing I brought something tasty for the soup.', 'Luau ini sukses! Untung aku membawa sesuatu yang lezat untuk Sup.'],
    ['Time to head home.', 'Saatnya pulang.'],
  ],
  governorReaction2: [
    ["Hmm... I don't have much to say about this. It's an average soup.", 'Hmm... Tidak banyak yang bisa kukatakan. Ini Sup biasa.'],
    ["He's right... It's nothing special. Not bad, though.", 'Dia benar... Tidak ada yang istimewa. Namun, rasanya tidak buruk.'],
    ['Well... who else wants some soup?', 'Baiklah... siapa lagi yang menginginkan Sup?'],
    ['The soup was just average, but otherwise the Luau was a success!', 'Supnya biasa saja, tetapi selebihnya Luau ini sukses!'],
    ['Time to head home.', 'Saatnya pulang.'],
  ],
  governorReaction1: [
    ["Um... It's actually kind of disgusting. I think I'll pass on the soup this year.$s", 'Um... Sebenarnya rasanya agak menjijikkan. Kurasa tahun ini aku tidak akan menyantap Sup.$s'],
    ['Yuck. Someone must have ruined it with a poor-quality ingredient.$s', 'Ih. Seseorang pasti merusaknya dengan bahan berkualitas buruk.$s'],
    ['Well... does anyone want any?', 'Baiklah... apa ada yang menginginkannya?'],
    ["The soup wasn't very good, but otherwise the Luau was a success!", 'Supnya tidak terlalu lezat, tetapi selebihnya Luau ini sukses!'],
    ['Time to head home.', 'Saatnya pulang.'],
  ],
  governorReaction0: [
    ["Blech! This is vile! I think I'm going to be sick... $u", 'Blech! Ini menjijikkan! Kurasa aku akan muntah... $u'],
    ['I need to lie down...$u', 'Aku perlu berbaring...$u'],
    ['Good going, people... Whoever put that foul ingredient in the soup made the Governor pass out! I\'m ashamed.$4', 'Bagus sekali... Siapa pun yang memasukkan bahan busuk itu ke dalam Sup membuat Gubernur pingsan! Aku malu.$4'],
    ['Go home, the festival is over.$s', 'Pulanglah, Festival sudah berakhir.$s'],
    ['What a disaster...', 'Bencana sekali...'],
    ['Time to head home.', 'Saatnya pulang.'],
  ],
  mainEvent_y2: [
    ["Hello and welcome, everyone! I'm pleased to announce that the potluck ceremony has begun.#$b#I have high hopes that you all contributed high-quality ingredients! We want to leave the governor with a good impression, now.", 'Halo dan selamat datang, semuanya! Dengan senang hati kuumumkan bahwa upacara jamuan bersama telah dimulai.#$b#Aku sangat berharap kalian semua menyumbangkan bahan berkualitas tinggi! Kita ingin memberikan kesan yang baik kepada Gubernur.'],
    ['Well... Governor? Would you indulge us with an honorary first tasting?', 'Baiklah... Gubernur? Maukah Anda memberi kami kehormatan dengan menjadi orang pertama yang mencicipinya?'],
    ["I would be delighted! I've been eyeing the soup all afternoon.", 'Dengan senang hati! Sepanjang sore aku terus memperhatikan Sup itu.'],
  ],
};

let changed = 0;
for (const [key, pairs] of Object.entries(replacements)) {
  let value = change.Entries[key];
  if (typeof value !== 'string') throw new Error(`Missing summer11 entry ${key}`);
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
console.log(`Applied summer11 event translations to ${changed} entries.`);
