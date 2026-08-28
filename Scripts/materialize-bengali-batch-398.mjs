import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const input = JSON.parse(fs.readFileSync(path.join(root, "Documentation/tamil-batches/398-temp-events-and-seed-shop.json"), "utf8"));
const outputPath = path.join(root, "Documentation/bengali-batches/398-temp-events-and-seed-shop.json");

const commonBand = [
  ["$p 20#This song's about Farming, mining, and chopping wood.|$p 8820#This song's about a city in the sea.|$p 8821#This song's about trains.|Here we go...$8", "$p 20#এই গানটা চাষাবাদ, খনন আর কাঠ কাটার গল্প নিয়ে।|$p 8820#এই গানটা সমুদ্রের এক শহরের গল্প নিয়ে।|$p 8821#এই গানটা ট্রেন নিয়ে।|শুরু করা যাক...$8"],
  ["$p 78#Wow! Those electronic sounds were far out!$h|Woooh! That was great!$h", "$p 78#ওয়াও! ওই ইলেকট্রনিক সুরগুলো দুর্দান্ত ছিল!$h|উহু! দারুণ ছিল!$h"],
  ["$p 79#That was great! It's a new honky-tonk classic!|Nice work, guys!$h", "$p 79#দারুণ ছিল! নতুন এক হনকি-টঙ্ক ধ্রুপদি গান!|দারুণ বাজিয়েছ, সবাই!$h"],
  ["$p 79#Good job! It's a new honky-tonk classic!|Nice work, guys!$h", "$p 79#দারুণ বাজিয়েছ! নতুন এক হনকি-টঙ্ক ধ্রুপদি গান!|দারুণ বাজিয়েছ, সবাই!$h"],
  ["$p 77#I really loved that heavy breakdown at the end.|I really enjoyed that bass part.", "$p 77#শেষের ওই ভারী ব্রেকডাউনটা ভীষণ ভালো লেগেছে।|ওই বেসের অংশটা সত্যিই উপভোগ করেছি।"],
  ["Thanks, everyone!$h#$b#But you should really be clapping for @! Without ${his^her}$ help we'd never have decided what kind of music to make in the first place!", "সবাইকে ধন্যবাদ!$h#$b#তবে হাততালিটা আসলে @-এর প্রাপ্য! ${his^her}$ সাহায্য ছাড়া আমরা শুরুতেই ঠিক করতে পারতাম না কী ধরনের গান বানাব!"],
  ["So you're like an honorary member of the band, then?$h", "তা হলে তুমি যেন ব্যান্ডের সম্মানসূচক সদস্য?$h"],
  ["Oh! And don't forget to pick up one of our demo cassettes on the way out... Only 10g!", "ওহ্! আর বেরোনোর পথে আমাদের একটা ডেমো ক্যাসেট নিতে ভুলো না... মাত্র 10g!"],
  ["That went well! Thanks again for coming with us.$h", "বেশ ভালোই হলো! আমাদের সঙ্গে আসার জন্য আবারও ধন্যবাদ।$h"],
  ["Hey. The show was a great success! Thanks again, @.", "এই। অনুষ্ঠানটা দারুণ সফল হয়েছে! আবারও ধন্যবাদ, @।"],
];

const quoteMaps = new Map([
  [0, [
    ["Decorate?$s#$b#Um, okay.$u", "সাজাবে?$s#$b#উম্, ঠিক আছে।$u"],
    ["So that's the best thing you can think of doing right now? Here... in this small, dark room with me?$u#$b#Interesting.$u", "এই মুহূর্তে এটাই তোমার মাথায় আসা সেরা কাজ? এখানে... আমার সঙ্গে এই ছোট, অন্ধকার ঘরে?$u#$b#মজার ব্যাপার।$u"],
    ["Well, the dark room looks great now... Thanks, @.$u", "যাক, অন্ধকার ঘরটা এখন দারুণ দেখাচ্ছে... ধন্যবাদ, @।$u"],
  ]],
  [1, [
    ["Oh, you have to leave already?$s#$b#Well... alright. Bye.$s", "ওহ্, এখনই চলে যেতে হবে?$s#$b#যাক... ঠিক আছে। বিদায়।$s"],
    ["Wow... I didn't think ${he^she}$ was that dense.$s", "ওয়াও... ভাবিনি ${he^she}$ এতটা নির্বোধ।$s"],
    ["I thought you had something important to do...$u", "ভেবেছিলাম তোমার জরুরি কোনো কাজ আছে...$u"],
  ]],
  [2, [["I'm so embarrassed...$8", "লজ্জায় মরে যাচ্ছি...$8"]]],
  [3, [["Hi, everyone. We're from Pelican Town... Er... and we're called 'The Pelicans'$8", "সবাইকে নমস্কার। আমরা পেলিক্যান টাউন থেকে এসেছি... উম্... আমাদের নাম ‘দ্য পেলিক্যানস’।$8"], ...commonBand]],
  [4, [["Hi, everyone. We're from Pelican Town... Er... and we're called 'Goblin Destroyer'$8", "সবাইকে নমস্কার। আমরা পেলিক্যান টাউন থেকে এসেছি... উম্... আমাদের নাম ‘গবলিন ডেস্ট্রয়ার’।$8"], ...commonBand]],
  [5, [["Hi, everyone. We're from Pelican Town... Er... and we're called 'Xenon Chip 3.0'.$8", "সবাইকে নমস্কার। আমরা পেলিক্যান টাউন থেকে এসেছি... উম্... আমাদের নাম ‘জেনন চিপ ৩.০’।$8"], ...commonBand]],
  [6, [["Hi, everyone. We're from Pelican Town... Er... and we're called 'The Alfalfas'$8", "সবাইকে নমস্কার। আমরা পেলিক্যান টাউন থেকে এসেছি... উম্... আমাদের নাম ‘দ্য আলফালফাস’।$8"], ...commonBand]],
  [7, [
    ["Sorry I'm all disheveled... I didn't know you were coming over.$h", "এভাবে এলোমেলো হয়ে আছি বলে দুঃখিত... জানতাম না তুমি আসছ।$h"],
    ["Hey, I think I hear a plane overhead...", "এই, মনে হচ্ছে মাথার ওপর দিয়ে একটা বিমান যাচ্ছে..."],
    ["@, get over here!", "@, এদিকে এসো!"],
    ["Look!", "দেখো!"],
    ["As a kid, my dream was always to be a pilot.", "ছোটবেলায় আমার সবসময়ই পাইলট হওয়ার স্বপ্ন ছিল।"],
    ["...But with my bad eyesight and a crippling fear of heights, that dream started to fade away.$s", "...কিন্তু দুর্বল দৃষ্টিশক্তি আর উচ্চতার অসহ্য ভয়ে সেই স্বপ্নটা ধীরে ধীরে মিলিয়ে গেল।$s"],
    ["It's okay... don't be sad.#$b#I've grown to accept my station in life. Not everyone can achieve their dreams... that's just the way the world is.", "ঠিক আছে... মন খারাপ কোরো না।#$b#জীবনে আমার যে জায়গা, তা মেনে নিতে শিখেছি। সবাই নিজের স্বপ্ন পূরণ করতে পারে না... পৃথিবীটা এমনই।"],
    ["Hey, let me show you my model airplanes. I just finished the new TR-Starbird deluxe set.$h", "এই, তোমাকে আমার মডেল বিমানগুলো দেখাই। নতুন টিআর-স্টারবার্ড ডিলাক্স সেটটা এইমাত্র শেষ করেছি।$h"],
  ]],
  [8, [
    ["All the others made it back, except me... ", "আমি ছাড়া বাকি সবাই ফিরে গেছে... "],
    ["Now I can go home, too. Thank you! Thank you! ", "এখন আমিও বাড়ি যেতে পারব। ধন্যবাদ! ধন্যবাদ! "],
    ["Something good will happen soon... ", "শিগগিরই ভালো কিছু ঘটবে... "],
  ]],
  [9, [
    [" ...{2}?", " ...{2}?"],
    [" {2}, wake up!", " {2}, জেগে ওঠো!"],
  ]],
  [11, [
    ["Aye... a sad sight, isn't she?", "হ্যাঁ... ওকে দেখে মন খারাপ হয়, তাই না?"],
    ["She was me father's boat... Served him well for over 50 years.#$b#But now she can barely stay afloat.$s", "এটা আমার বাবার নৌকা ছিল... ৫০ বছরেরও বেশি সময় বিশ্বস্তভাবে তার সেবা করেছে।#$b#কিন্তু এখন কোনো রকমে ভেসে থাকে।$s"],
    ["I'd repair her myself, but I don't have the right materials, ${lad^miss}$.", "নিজেই মেরামত করতাম, কিন্তু উপযুক্ত উপকরণ নেই, ${lad^miss}$।"],
    ["Aye... 200 pieces of hardwood to patch the hull would be a good start.#$b#But we'll also need to get the ticket machine back up, and the iridium anchor repaired.", "হ্যাঁ... খোলটা সারাতে ২০০ টুকরো শক্তকাঠ দিয়ে শুরু করা যায়।#$b#তবে টিকিটের যন্ত্রটাও চালু করতে হবে, আর ইরিডিয়ামের নোঙরটি সারাতে হবে।"],
    ["If I could get me hands on the right materials, and repair the ol' girl... well, then I could take you to the Fern Islands.", "ঠিক উপকরণ পেয়ে এই বুড়িকে সারাতে পারলে... তা হলে তোমাকে ফার্ন দ্বীপপুঞ্জে নিয়ে যেতে পারতাম।"],
    ["Volcanic islands full of strange parrots, they say...", "শোনা যায়, আগ্নেয় সেই দ্বীপগুলো অদ্ভুত সব টিয়া-পাখিতে ভরা..."],
    ["Aye... I thought you would, ${lad^miss}$.$h", "হ্যাঁ... জানতাম তুমি রাজি হবে, ${lad^miss}$।$h"],
    ["I'll leave this door unlocked for ya... you can come drop off the materials whenever you like.", "দরজাটা তোমার জন্য খোলা রাখব... যখন ইচ্ছা এসে উপকরণগুলো রেখে যেতে পারো।"],
    ["Alright, suit yourself...$s#$b#If you have a change of heart, you can always come back and help out. I'll leave this door unlocked, anyhow.", "ঠিক আছে, তোমার ইচ্ছা...$s#$b#মত বদলালে যেকোনো সময় ফিরে এসে সাহায্য করতে পারো। যা-ই হোক, দরজাটা খোলাই রাখব।"],
  ]],
  [12, [
    ["A... customer?", "এ... একজন ক্রেতা?"],
    ["Hi! Welcome to 'Sandy's Oasis'!#$b#Hey, you look just like the new farmer that Emily wrote to me about!#$b#Then... the bus line to Stardew Valley is back in service!$h#$b#Oh, I'm so happy!$h", "হাই! ‘স্যান্ডির মরূদ্যান’-এ স্বাগত!#$b#এই, এমিলি যে নতুন কৃষকের কথা লিখেছিল, তোমাকে ঠিক তার মতো দেখাচ্ছে!#$b#তার মানে... স্টারডিউ ভ্যালির বাস চলাচল আবার শুরু হয়েছে!$h#$b#ওহ্, আমি যে কী খুশি!$h"],
    ["Please visit again soon, I get so bored out here.", "দয়া করে শিগগিরই আবার এসো, এখানে ভীষণ একঘেয়ে লাগে।"],
  ]],
  [13, [
    ["Well, well, well... Look who's made it to my secret walnut room.", "বাহ্, বাহ্, বাহ্... দেখো তো আমার গোপন আখরোট কক্ষে কে এসে পৌঁছেছে।"],
    ["I'm truly impressed.#$b#Even though you only needed a fraction of the walnuts to gain full access to the island, you decided to push yourself further.#$b#Your desire to enter this secret door was so strong, that you went above and beyond to get inside.#$b#That drive is what sets you apart, kid. You've got a very special energy.", "আমি সত্যিই মুগ্ধ।#$b#পুরো দ্বীপে প্রবেশাধিকার পেতে আখরোটের সামান্য অংশই যথেষ্ট ছিল, তবু তুমি নিজেকে আরও এগিয়ে নেওয়ার সিদ্ধান্ত নিয়েছ।#$b#এই গোপন দরজায় ঢোকার ইচ্ছা এতটাই প্রবল ছিল যে ভেতরে আসতে তুমি প্রত্যাশার চেয়েও অনেক বেশি করেছ।#$b#এই তাগিদই তোমাকে আলাদা করে, বাছা। তোমার ভেতর খুব বিশেষ এক শক্তি আছে।"],
    ["That being said...#$b#You weren't under the impression that the challenge ended here, were you?#$b#No... Hah. Hah. Hah... In fact, the challenge has just begun.", "তা বলার পরও...#$b#তুমি নিশ্চয়ই ভাবোনি যে চ্যালেঞ্জ এখানেই শেষ, তাই তো?#$b#না... হা। হা। হা... আসলে চ্যালেঞ্জ তো সবে শুরু।"],
    ["On your left, you'll find a board with some very interesting opportunities.#$b#These challenges, which I've designed just for you, will push you to your very limit.", "তোমার বাঁ দিকে বেশ আকর্ষণীয় কিছু সুযোগের একটি বোর্ড পাবে।#$b#শুধু তোমার জন্য তৈরি এই চ্যালেঞ্জগুলো তোমাকে সামর্থ্যের একেবারে শেষ সীমায় ঠেলে দেবে।"],
    ["However, if you can successfully conquer my challenges, you'll earn an exclusive currency... I call them 'Qi Gems'", "তবে আমার চ্যালেঞ্জগুলো সফলভাবে জয় করতে পারলে বিশেষ এক মুদ্রা পাবে... আমি এগুলোর নাম দিয়েছি ‘কিউ রত্ন’।"],
    ["Just don't put 'em in your mouth, kid... They're highly radioactive. Heh. heh. heh...", "শুধু মুখে পুরো না, বাছা... এগুলো অত্যন্ত তেজস্ক্রিয়। হে। হে। হে..."],
    ["You can use the machine on your right to trade these Qi Gems for rare and powerful rewards.", "ডান দিকের যন্ত্রটি ব্যবহার করে এই কিউ রত্নের বিনিময়ে বিরল ও শক্তিশালী পুরস্কার নিতে পারো।"],
    ["Sounds interesting, doesn't it?#$b#Yes... I have a feeling someone like you will enjoy this, very much...", "আকর্ষণীয় শোনাচ্ছে, তাই না?#$b#হ্যাঁ... আমার ধারণা, তোমার মতো কেউ এটি খুবই উপভোগ করবে..."],
    ["Now, if you'll excuse me... I have important business to attend to.", "এবার যদি অনুমতি দাও... আমার জরুরি কাজ আছে।"],
  ]],
  [14, [
    ["Oh, hi! Good morning, @. I'm glad you came in...#$b#I've been meaning to show you this... it's my private sunroom.", "ওহ্, হাই! সুপ্রভাত, @। তুমি এসেছ দেখে ভালো লাগছে...#$b#তোমাকে এটা দেখাতে চাইছিলাম... এটা আমার ব্যক্তিগত সূর্যালোক-কক্ষ।"],
    ["So, what do you think?", "তা, তোমার কী মনে হয়?"],
    ["Thank you! I've worked very hard to make it this way...$h", "ধন্যবাদ! এমন করে তুলতে আমি অনেক পরিশ্রম করেছি...$h"],
    ["Yes... when I step in here, I feel calm and relaxed right away. It's really therapeutic!", "হ্যাঁ... এখানে পা রাখলেই মন শান্ত আর আরাম বোধ করি। সত্যিই মন ভালো করে দেয়!"],
    ["Oh? I find the warmth soothing, myself.$s#$b#It feels better if you keep still.", "তাই? আমার কাছে উষ্ণতাটা বেশ প্রশান্তিদায়ক।$s#$b#স্থির থাকলে আরও ভালো লাগবে।"],
    ["Oh, but you're a professional... For me, it's just a hobby.", "ওহ্, কিন্তু তুমি তো পেশাদার... আমার কাছে এটা শুধু শখ।"],
    ["You see, this is my sanctuary... a place where I can always find peace...", "বুঝতেই পারছ, এটা আমার আশ্রয়স্থল... এখানে আমি সবসময় শান্তি খুঁজে পাই..."],
    ["And it's a perfect place to drink my home-grown tea! Here, let's have a cup...", "আর নিজের চাষ করা চা পান করার জন্য এটাই আদর্শ জায়গা! এসো, এক কাপ চা খাই..."],
    ["Sure, no problem...", "অবশ্যই, কোনো সমস্যা নেই..."],
    ["Delicious", "সুস্বাদু"],
    ["I love to come in here for a fresh cup of tea every day.#$b#It's my little ritual... #$b#Uh... let me try to explain...$h", "প্রতিদিন এক কাপ টাটকা চা খেতে এখানে আসতে আমার খুব ভালো লাগে।#$b#এটা আমার ছোট্ট এক আচার... #$b#উম্... বোঝানোর চেষ্টা করি...$h"],
    ["I hope that makes sense... #$b#Life can be pretty hectic, so having a hobby like this is nice.", "আশা করি বুঝতে পারছ... #$b#জীবন কখনো খুব ব্যস্ত হয়ে ওঠে, তাই এমন একটা শখ থাকা ভালো।"],
    ["Feel free to come here and relax any time you want, okay?", "যখন ইচ্ছা এখানে এসে আরাম করতে পারো, ঠিক আছে?"],
  ]],
]);

const preserveReasons = new Map([
  [10, "এটি সম্পূর্ণরূপে কাটসিনের প্রযুক্তিগত চলাচল ও সমাপ্তি-কমান্ড; দৃশ্যমান সংলাপ নেই, তাই হুবহু রাখা হয়েছে।"],
]);

function replaceQuoted(source, pairs) {
  let out = source;
  for (const [from, to] of pairs) {
    const needle = `"${from}"`;
    if (!out.includes(needle)) continue;
    out = out.replaceAll(needle, `"${to}"`);
  }
  return out;
}

const records = input.records.map((record, index) => {
  let translation = quoteMaps.has(index) ? replaceQuoted(record.source, quoteMaps.get(index)) : record.source;
  const plain = new Map([
    [11, [["#I'd like to help#Nah, I'll pass...", "#আমি সাহায্য করতে চাই#না, বাদ দাও..."]]],
    [14, [
      ["#It's beautiful!#It's very relaxing.#It's too hot in here...#Not as good as my farm!", "#খুব সুন্দর!#খুব আরামদায়ক।#এখানে খুব গরম...#আমার খামারের মতো ভালো নয়!"],
      ["Have a cup?#Yes#No", "এক কাপ খাবে?#হ্যাঁ#না"],
    ]],
  ]);
  for (const [from, to] of plain.get(index) ?? []) {
    if (!translation.includes(from)) throw new Error(`Missing event text: ${from}`);
    translation = translation.replaceAll(from, to);
  }
  const result = { target: record.target, key: record.key, source: record.source, translation };
  if (preserveReasons.has(index)) {
    result.reviewedPreserve = true;
    result.reason = preserveReasons.get(index);
  }
  return result;
});

fs.writeFileSync(outputPath, `${JSON.stringify({ id: "398-temp-events-and-seed-shop", kind: "long", records })}\n`);
