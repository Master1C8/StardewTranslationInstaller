import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/indonesian/locations.json');
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
const entries = document.Changes[0].Entries;

const replacements = {
  IslandNorth_Event_SafariManAppear: [
    ['Thank you! I thought I was done for...', 'Terima kasih! Kupikir riwayatku sudah tamat...'],
    ["I've been stuck in this cave for months!", 'Aku terjebak di gua ini selama berbulan-bulan!'],
    ["...One more cave mushroom salad and I would've gone off the deep end...", '...Satu Salad Jamur Gua lagi dan aku pasti sudah kehilangan akal...'],
    ['...so rubbery...', '...begitu kenyal...'],
    ["Anyway... I'm Professor Snail.", 'Pokoknya... Aku Profesor Snail.'],
    ["I've been conducting a survey of this island's flora and fauna for the last year. Truly a remarkable place!", 'Selama setahun terakhir, aku melakukan survei flora dan fauna pulau ini. Tempat yang sungguh luar biasa!'],
    ["Well, I think I'll go back to my tent and freshen up a little. I'm afraid I smell like mushrooms...", 'Kurasa aku akan kembali ke tenda dan membersihkan diri sedikit. Aku khawatir tubuhku berbau Jamur...'],
    ['Hey... you should stop by the tent sometime! An enterprising individual like yourself could be a major asset in my projects... hee hee! Farewell.', 'Hei... mampirlah ke tenda kapan-kapan! Orang penuh inisiatif sepertimu dapat menjadi aset besar bagi proyekku... hihi! Sampai jumpa.'],
  ],
  IslandFieldOffice_Intro_Event: [
    ['Ah... Come in!', 'Ah... Masuklah!'],
    ['Welcome to my field office.', 'Selamat datang di kantor lapanganku.'],
    ["As you can see... it's quite empty.", 'Seperti yang kamu lihat... tempat ini cukup kosong.'],
    ['Getting stuck in that cave was a huge setback to my project.', 'Terjebak di gua itu merupakan kemunduran besar bagi proyekku.'],
    ["But that's where you come in! Hee hee...", 'Namun, di sinilah kamu berperan! Hihi...'],
    ["I'm in the bone business, you see...", 'Aku berkecimpung dalam urusan Tulang...'],
    ['Ancient bones, in particular... And this island is full of them.', 'Terutama Tulang kuno... Dan pulau ini penuh dengan Tulang.'],
    ["So if you ever encounter any bones, fossils, or mummified specimens on this island, bring them to my desk, okay? I'll make it worth your while!", 'Jadi, jika menemukan Tulang, fosil, atau spesimen mumi di pulau ini, bawalah ke mejaku. Aku akan memberimu imbalan yang sepadan!'],
  ],
  IslandHut_Event_ParrotBoyIntro: [
    ['The boy looks at you with curious eyes...', 'Anak itu memandangmu dengan mata penuh rasa ingin tahu...'],
    ['He seems to have a close bond with the parrots.', 'Tampaknya dia memiliki ikatan erat dengan burung-burung beo.'],
    ["But he's too shy to approach you right now.", 'Namun, saat ini dia terlalu malu untuk mendekatimu.'],
    ['Perhaps making friends with the parrots could earn his trust?', 'Mungkin berteman dengan burung-burung beo dapat memperoleh kepercayaannya?'],
  ],
  IslandSecret_Event_BirdieIntro: [
    ['Oh... a visitor?', 'Oh... seorang pengunjung?'], ['Come closer, child.', 'Mendekatlah, Nak.'],
    ["I haven't had a visitor in many moons...", 'Sudah sangat lama aku tidak menerima pengunjung...'],
    ['I almost forgot what other people looked like!', 'Aku hampir lupa seperti apa rupa orang lain!'],
    ['Well, I suppose now that you\'re here, I may as well ask you for a favor.', 'Karena kamu sudah di sini, mungkin aku bisa meminta bantuanmu.'],
    ['Come...', 'Kemarilah...'],
    ['Have you seen that wrecked ship on the south shore?', 'Apa kamu melihat kapal karam di pantai selatan?'],
    [' My husband was the captain. A pirate, he was.', ' Suamiku adalah kaptennya. Dia seorang bajak laut.'],
    ['He set sail one day, never to return. Took me three years sailing the high seas to find his remains.', 'Suatu hari dia berlayar dan tidak pernah kembali. Aku membutuhkan tiga tahun mengarungi laut lepas untuk menemukan jasadnya.'],
    ["I've been here ever since, dear.", 'Sejak itu aku tinggal di sini, Sayang.'],
    ['...Guarding his bones...', '...Menjaga Tulangnya...'],
    ['My child... If I could only find a keepsake of his, it would bring me such peace.', 'Nak... Jika aku dapat menemukan kenang-kenangan miliknya, hatiku akan sangat tenteram.'],
    ['Wait here...', 'Tunggu di sini...'],
    ["Here, take this. It's an old photograph that washed up on shore.", 'Ini, ambillah. Foto tua ini terdampar di pantai.'],
    ["It's all I have to offer... but somehow, I think it will help you find what I seek.", 'Hanya ini yang dapat kuberikan... tetapi entah bagaimana, kurasa ini akan membantumu menemukan apa yang kucari.'],
  ],
  IslandSecret_Event_BirdieFinished: [
    ["It's his...", 'Ini miliknya...'],
    ['Heh... It still has his smell, after all these years...', 'Heh... Setelah sekian lama, benda ini masih menyimpan baunya...'],
    ['...that familiar, putrid funk...', '...bau busuk yang familier itu...'],
    ["You know... It's been a lonely life here, child... but I don't regret it at all.", 'Kehidupan di sini memang sepi, Nak... tetapi aku sama sekali tidak menyesalinya.'],
    ["I'm doin' right by my old man... and we'll be together again some day soon... hehe", 'Aku menjaga kenangan suamiku... dan suatu hari nanti kami akan segera bersama lagi... hehe'],
    ["It's an honorable thing to do.", 'Itu tindakan yang terhormat.'],
    ["He's gone. You should live your life.", 'Dia telah tiada. Kamu harus menjalani hidupmu.'],
    ['You have great wisdom, child.', 'Kamu sangat bijaksana, Nak.'],
    ["And you've brought me great peace... this locket will comfort me for the rest of my days.", 'Dan kamu telah memberiku ketenteraman besar... liontin ini akan menghiburku sepanjang sisa hidupku.'],
    ['An old woman like me? I think it\'s too late, dear...', 'Perempuan tua sepertiku? Kurasa sudah terlambat, Sayang...'],
    ['Besides... I like it here! It\'s relaxing and beautiful. And I have an endless supply of fresh fish, oysters, and monkey meat. Hehehe.', 'Lagi pula... Aku suka di sini! Tempatnya tenang dan indah. Aku juga punya persediaan ikan segar, Tiram, dan daging monyet tanpa batas. Hehehe.'],
    ["...I'm kidding about the monkey meat.", '...Aku bercanda soal daging monyet.'],
    ['Now... how can I repay you for this?', 'Sekarang... bagaimana aku dapat membalas bantuanmu?'],
    ['Oh... How about I teach you a special recipe... Something I discovered in the many years I\'ve spent here.', 'Oh... Bagaimana kalau kuajarkan resep khusus... Sesuatu yang kutemukan selama bertahun-tahun tinggal di sini.'],
    ["Learned to craft 'Fairy Dust'.", "Mempelajari cara membuat 'Debu Peri'."],
    ['You can take these, too...', 'Kamu juga boleh mengambil ini...'],
    ["Though you're a stranger, you went out of your way to help an old lady.", 'Meskipun orang asing, kamu bersusah payah membantu perempuan tua.'],
    ['Bless your heart!', 'Semoga kamu diberkati!'],
  ],
  alreadyGotNuts: [
    ["Though you're a stranger, you went out of your way to help an old lady.", 'Meskipun orang asing, kamu bersusah payah membantu perempuan tua.'],
    ['Bless your heart!', 'Semoga kamu diberkati!'],
  ],
  FieldOfficeFinale: [
    ['Wow...', 'Wah...'], ['Look how far we\'ve come!', 'Lihat sejauh apa pencapaian kita!'],
    ["The collection looks fantastic, and it's all thanks to you, @.", 'Koleksinya tampak luar biasa, dan semuanya berkat dirimu, @.'],
    ["Here, as a way of saying 'thanks', I want to teach you something.", "Sebagai ucapan 'terima kasih', aku ingin mengajarimu sesuatu."],
    ["Learned how to craft 'Ostrich Incubator'", "Mempelajari cara membuat 'Inkubator Burung Unta'"],
    ['This device will allow you to raise ostriches back home. Just place the incubator in a barn, place an ostrich egg inside, and wait...', 'Perangkat ini memungkinkanmu memelihara Burung Unta di rumah. Letakkan Inkubator di Kandang Ternak, masukkan Telur Burung Unta, lalu tunggu...'],
    ["Getting your hands on an ostrich egg is a different story, though... I'll leave that up to you!", 'Namun, mendapatkan Telur Burung Unta adalah urusan lain... Kuserahkan kepadamu!'],
    ['Heh... Well... now the real work begins.', 'Heh... Nah... sekarang pekerjaan sesungguhnya dimulai.'],
    ["I'll be studying these bones for years to come!", 'Aku akan mempelajari Tulang ini selama bertahun-tahun!'],
    ['Farewell, @!', 'Sampai jumpa, @!'],
  ],
};

let changed = 0;
for (const [key, pairs] of Object.entries(replacements)) {
  let value = entries[key];
  if (typeof value !== 'string') throw new Error(`Missing event entry ${key}`);
  for (const [source, target] of pairs) {
    const count = value.split(source).length - 1;
    if (count !== 1) throw new Error(`${key}: expected one occurrence of ${JSON.stringify(source)}, found ${count}`);
    value = value.replace(source, target);
  }
  entries[key] = value;
  changed++;
}

fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Applied dialogue-only translations to ${changed} location events.`);
