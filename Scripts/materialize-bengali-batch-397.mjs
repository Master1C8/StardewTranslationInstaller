import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "Documentation/tamil-batches/397-library-finale-and-small-runtime.json");
const outputPath = path.join(root, "Documentation/bengali-batches/397-library-finale-and-small-runtime.json");
const batch = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const exact = new Map([
  [0, `প্রযুক্তি প্রতিবেদন!

‘ক্রিস্টালারিয়াম’ নামের এক উন্নত যন্ত্রের নকশা সম্প্রতি প্রকাশিত হয়েছে।
 এই যন্ত্র প্রায় শূন্য থেকে স্ফটিক জন্মাতে পারে, ফলে এর মালিক মূল্যবান রত্নের অফুরন্ত সরবরাহ পান!
কাজের পদ্ধতি এমন: পছন্দের একটি রত্ন ক্রিস্টালারিয়ামের ভেতরে রাখো...
এবার ধৈর্য ধরো, কয়েক দিন পর্যন্ত সময় লাগতে পারে... তবে শেষ পর্যন্ত ক্রিস্টালারিয়াম ভেতরে রাখা রত্নটির একটি অনুলিপি তৈরি করবে!
যন্ত্রটি দুলুনি থামালেই বুঝবে কাজ শেষ। রত্নটি বের করে নিলে ক্রিস্টালারিয়াম আরেকটি অনুলিপি তৈরির কাজ শুরু করবে... উৎপাদিত রত্নের ধরন বদলাতে না চাইলে আর কখনো নতুন করে কিছু ভরতে হবে না!
দুর্ভাগ্যজনকভাবে, ‘প্রিজম্যাটিক খণ্ড’ নামে পরিচিত অতি বিরল রত্নে ক্রিস্টালারিয়াম কাজ করে না... কোনো এক কারণে খণ্ডটির তড়িৎচুম্বকীয় ক্ষেত্র ক্রিস্টালারিয়ামের ওপর বিরূপ প্রভাব ফেলে।`],
  [1, `কিংবদন্তি মাছের রহস্য

জেলেরা পাঁচটি বিরল ও অনন্য মাছের কথা বলে, যেগুলো কেবল দক্ষ মৎস্যশিকারীরাই ধরতে পারে। একবার ধরা হলে সেগুলো আর কখনো দেখা দেবে না।

ক্রিমসনফিশ গ্রীষ্মের উষ্ণ সমুদ্রজলে বাস করে। সৈকতের একেবারে পূর্ব প্রান্তে এটিকে দেখা গেছে।

শুধু শীতে দেখা দেওয়া গ্লেসিয়ারফিশ ধরা যায় সিন্ডারস্যাপ বনের তীরমুখ দ্বীপের দক্ষিণ প্রান্ত থেকে... যেখানে নদী সাগরে মিশেছে তার কাছে।

শরৎকালে শহরের উত্তরে, পাহাড় থেকে নদী যেখানে নেমে এসেছে সেখানে অ্যাংলারফিশ দেখা গেছে।

শোনা যায়, নর্দমায় এক অদ্ভুত, বিকৃত মাছ বাস করে।



শেষ মাছটি এমন এক প্রজাতির, যা আগে কখনো ধরা পড়েনি; একে শুধু ‘লেজেন্ড’ বলা হয়। শোনা যায়, এটি পাহাড়ি হ্রদে ডুবে থাকা এক গুঁড়ির মধ্যে বাস করে এবং বসন্তের বৃষ্টির দিনে ব্যাঙের ডিম খেতে বাইরে আসে। কেবল সবচেয়ে দক্ষ জেলেই একে ধরার আশা করতে পারে।

মাছ ধরার অনুশীলন করো এবং লেগে থাকো; শেষ পর্যন্ত এই অধরা মাছগুলো ধরতে পারবে। জলকে সম্মান করবে এবং বাস্তুতন্ত্র থেকে অতিরিক্ত মাছ সরিয়ে নেবে না।`],
  [2, `...পেলিক্যান টাউন থেকে বেরোনোর সুড়ঙ্গে অদ্ভুত কিছু দেখলাম। অন্ধকারে ছোট্ট একটি দরজা লুকোনো আছে। তবে খুলতে পারিনি।

-গুন্থার`],
  [3, `গুন্থারের নোট: ওয়াও, তোমার সাহায্যে এই গ্রন্থাগার সত্যিই দারুণ হয়ে উঠেছে! অনেক অনেক ধন্যবাদ!`],
  [4, `গবলিন^লেখক এম. জ্যাসপার^^সাধারণভাবে “গবলিন” নামে পরিচিত জাতিটির উৎপত্তি সম্ভবত সুদূর উত্তর-পূর্বের বনাঞ্চলে, ব্লুমায়ার পাহাড়ের ওপারে। সবুজ চামড়া, উজ্জ্বল লাল চোখ আর দুর্গন্ধের কারণে অনভিজ্ঞ পথিকের কাছে গবলিনের সঙ্গে প্রথম সাক্ষাৎ ভীতিকর হতে পারে।^^অস্বস্তিকর চেহারা সত্ত্বেও গবলিনদের বুদ্ধিবৃত্তিক ও আবেগগত ক্ষমতা মানুষের মতোই, আর আমাদের রীতিনীতি ও ভাষা শিখতে তাদের কোনো অসুবিধা হয় না। আমি নিরীহ—এটা বোঝানোর পর আমার দেখা গবলিনরা বেশ বন্ধুবৎসল ও সদালাপীই ছিল। দুর্ভাগ্যজনকভাবে, মানুষের শতাব্দীব্যাপী অবিশ্বাস আর দুর্ব্যবহার বহু গবলিনকে ডাইনি, জাদুকর, নেক্রোম্যান্সার এবং অন্যান্য অসাধু লোকের অধীনে কাজ করতে ঠেলে দিয়েছে।^^গবলিনদের ঐতিহ্যবাহী খাদ্যের বড় অংশই গ্রাবের মাংস, সাধারণত তাদের আদি বনের বড় ও রসালো গ্রাব প্রজাতি থেকে। বিশেষ উপলক্ষে গবলিনরা ‘ভয়েড মেয়োনিজ’ নামে একটি খাবার উপভোগ করে... সম্ভবত সমগ্র গবলিন রন্ধনশৈলীর সেরা উপাদেয় খাবার।`],
  [6, `এখানে একটি বই নেই...`],
  [7, `৮০০g,১৫০০g,১৬০০০g,৮০০০g,১২০০g,১১০০০g,৭৫০০g`],
]);

const quoteMaps = new Map([
  [9, [["Don't touch that!", "ওটা ছুঁয়ো না!"]]],
  [13, [
    ["Wait!", "অপেক্ষা করো!"],
    ["Hello, Leo... My name's Linus.#$b#I've heard all about you, and your parrot family.#$b#It's really something special!$h", "হ্যালো, লিও... আমার নাম লাইনাস।#$b#তোমার আর তোমার টিয়া-পাখির পরিবারের সব কথাই শুনেছি।#$b#সত্যিই অসাধারণ ব্যাপার!$h"],
    ["Aye, lad... Linus lives on the mainland with the rest of us.#$b#After hearing your story... I wanted to help. So, I talked to Linus here and hatched a little plan.$h", "হ্যাঁ, বাছা... লাইনাস আমাদের বাকিদের সঙ্গে মূল ভূখণ্ডে থাকে।#$b#তোমার গল্প শুনে... সাহায্য করতে চেয়েছিলাম। তাই লাইনাসের সঙ্গে কথা বলে ছোট্ট একটা পরিকল্পনা করেছি।$h"],
    ["Go on, Linus... tell him.", "বলো, লাইনাস... ওকে বলো।"],
    ["Leo...#$b#I'd like you to come back with us, to Stardew Valley.#$b#It's a beautiful place... not as warm as here, but still full of life... and I live right in the middle of it!#$b#I know the lay of the land, and many things about the waters, the trees, the animals, and more...#$b#You see... I'm a child of nature, too. You might say we're 'birds of a feather'.$h#$b#But, I'm getting old... And I'd like to teach someone all that I've learned before moving on...$s#$b#Leo... will you come back with us?", "লিও...#$b#আমি চাই তুমি আমাদের সঙ্গে স্টারডিউ ভ্যালিতে ফিরে চলো।#$b#জায়গাটা খুব সুন্দর... এখানকার মতো উষ্ণ নয়, তবে প্রাণে ভরপুর... আর আমি তার ঠিক মাঝখানে থাকি!#$b#সেখানকার পথঘাট, জল, গাছপালা, প্রাণী আর আরও অনেক বিষয়ে আমি জানি...#$b#দেখো... আমিও প্রকৃতির সন্তান। বলতে পারো, আমরা ‘একই ঝাঁকের পাখি’।$h#$b#কিন্তু আমার বয়স হচ্ছে... চলে যাওয়ার আগে যা শিখেছি তা কাউকে শেখাতে চাই...$s#$b#লিও... তুমি কি আমাদের সঙ্গে ফিরবে?"],
    ["L... leave the island?$u", "দ্... দ্বীপ ছেড়ে যাব?$u"],
    ["I can take you back for a visit any time!$h#$b#But, lad.... You can't live here forever...#$b#You know, there are other children back home, too. I'm sure they'd love to meet ya...", "যখন ইচ্ছা তোমাকে বেড়াতে ফিরিয়ে আনতে পারি!$h#$b#কিন্তু বাছা... তুমি তো চিরকাল এখানে থাকতে পারবে না...#$b#জানো, ওখানে আরও বাচ্চা আছে। নিশ্চিত ওরা তোমার সঙ্গে দেখা করতে চাইবে..."],
    ["O... other kids?$u", "আ... আরও বাচ্চা?$u"],
    ["What do you think, @?", "তোমার কী মনে হয়, @?"],
    ["Well, let's not forget... the choice is really up to Leo...", "তবে ভুলে গেলে চলবে না... সিদ্ধান্তটা আসলে লিওরই..."],
    ["I understand. This is Leo's home, after all.$s", "আমি বুঝি। শেষ পর্যন্ত এটাই তো লিওর ঘর।$s"],
    ["...It's hard to make changes. But sometimes it's for the best.#$b#Still... the choice is really up to Leo.", "...পরিবর্তন মেনে নেওয়া কঠিন। তবে কখনো কখনো তাতেই মঙ্গল।#$b#তবু... সিদ্ধান্তটা আসলে লিওরই।"],
    ["I... $u#$b#I'll go...", "আমি... $u#$b#আমি যাব..."],
    ["Great!", "দারুণ!"],
    ["But... my family...$s", "কিন্তু... আমার পরিবার...$s"],
    ["She says...", "ও বলছে..."],
    ["She says the parrots are all happy for me.#$b#...And that they want me to start the next chapter of life, wherever it may lead...", "ও বলছে, সব টিয়া-পাখি আমার জন্য খুশি।#$b#...আর তারা চায় আমি জীবনের পরের অধ্যায় শুরু করি, তা যেখানেই নিয়ে যাক..."],
    ["And no matter what happens... they'll always be my family... forever.", "আর যা-ই ঘটুক... ওরা সবসময় আমার পরিবার থাকবে... চিরকাল।"],
    ["Goodbye!", "বিদায়!"],
    ["I'm ready!$h", "আমি প্রস্তুত!$h"],
    ["A new arrival to the valley...", "ভ্যালিতে নতুন একজন এল..."],
    ["It seems our little town is growing!", "মনে হচ্ছে আমাদের ছোট্ট শহরটা বড় হচ্ছে!"],
  ]],
  [14, [
    [" ...{2}?", " ...{2}?"],
    [" {2}, wake up!", " {2}, জেগে ওঠো!"],
  ]],
]);

const preserveReasons = new Map([
  [5, "এটি বামনীয় ভাষায় লেখা একটি সংকেতলিপি; ইংরেজি অর্থবাহী গদ্য নয়, তাই ধাঁধার কার্যকারিতা রক্ষায় হুবহু রাখা হয়েছে।"],
  [8, "এখানে {0} প্লেসহোল্ডার ও আবেগ-টোকেনের সঙ্গে কেবল বিরামচিহ্ন আছে; অনুবাদযোগ্য শব্দ নেই।"],
  [10, "এটি স্থাননাম নয়; সংখ্যা ও g মুদ্রা-চিহ্নসহ প্রযুক্তিগত বিন্যাস, তাই হুবহু রাখা হয়েছে।"],
  [11, "এটি টুপি-ডেটার প্রযুক্তিগত স্ল্যাশ-বিন্যাস; অনুবাদযোগ্য দৃশ্যমান শব্দ নেই।"],
  [12, "এটি সম্পূর্ণরূপে ইভেন্টের প্রযুক্তিগত কমান্ড-ক্রম; দৃশ্যমান সংলাপ নেই, তাই হুবহু রাখা হয়েছে।"],
]);

function replaceQuoted(source, pairs) {
  let value = source;
  for (const [from, to] of pairs) {
    const needle = `"${from}"`;
    const replacement = `"${to}"`;
    if (!value.includes(needle)) throw new Error(`Missing quoted source: ${from}`);
    value = value.replaceAll(needle, replacement);
  }
  return value;
}

const duplicateIndexes = new Set([7, 8, 10]);
const records = batch.records.flatMap((record, index) => {
  if (duplicateIndexes.has(index)) return [];
  let translation;
  if (exact.has(index)) translation = exact.get(index);
  else if (quoteMaps.has(index)) translation = replaceQuoted(record.source, quoteMaps.get(index));
  else translation = record.source;

  if (index === 13) {
    const replacements = [
      ["#I think it's a great idea.#I think he should stay here.#It's up to Leo...", "#আমার মনে হয় ভাবনাটা দারুণ।#আমার মনে হয় ওর এখানেই থাকা উচিত।#সিদ্ধান্তটা লিওর..."],
    ];
    for (const [from, to] of replacements) {
      if (!translation.includes(from)) throw new Error(`Missing event text: ${from}`);
      translation = translation.replaceAll(from, to);
    }
  }

  const result = { target: record.target, key: record.key, source: record.source, translation };
  if (preserveReasons.has(index)) {
    result.reviewedPreserve = true;
    result.reason = preserveReasons.get(index);
  }
  return [result];
});

fs.writeFileSync(outputPath, `${JSON.stringify({
  id: "397-library-finale-and-small-runtime",
  kind: "long",
  complexityReason: "Twelve unique records remain after removing three records already reviewed in earlier Bengali batches; the section contains long library prose and token-dense event scripts.",
  records,
})}\n`);
