#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { decodeBengali, mapsFromDocument } from "./bengali-clusters.mjs";

const root = path.resolve(import.meta.dirname, "..");
const batchRoot = path.join(root, "Documentation/bengali-batches");
const translationRoot = path.join(
  root,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/bengali",
);
const clusterMapFile = path.join(root, "Documentation/bengali-cluster-map.json");
const clusterDecode = mapsFromDocument(JSON.parse(fs.readFileSync(clusterMapFile, "utf8"))).decode;

const replacements = [
  ["সেবাস্তিয়ান", "সেবাস্টিয়ান"],
  ["ক্যারোলাইন", "ক্যারোলিন"],
  ["লাইন্যাস", "লিনাস"],
  ["ডিমেট্রিয়াস", "ডিমিট্রিয়াস"],
  ["ডেমেট্রিয়াস", "ডিমিট্রিয়াস"],
  ["হ্যালি", "হেইলি"],
  ["হেলি", "হেইলি"],
  ["ইভলিন", "এভলিন"],
  ["অ্যাবিগেল", "অ্যাবিগেইল"],
  ["হার্ভে", "হার্ভি"],
  ["রাজ্যপাল", "গভর্নর"],
  ["চাষাবাদ", "কৃষিকাজ"],
  ["পিকঅ্যাক্স", "পিক্যাক্স"],
  ["মরসুম", "ঋতু"],
  ["%Elliott", "%এলিয়ট"],
  ["%Pam", "%প্যাম"],
  ["%Shane", "%শেন"],
  ["%Demetrius", "%ডিমিট্রিয়াস"],
  ["%Caroline", "%ক্যারোলিন"],
  ["%Clint", "%ক্লিন্ট"],
  ["%Marnie", "%মার্নি"],
  ["%Vincent", "%ভিনসেন্ট"],
  ["%Abigail", "%অ্যাবিগেইল"],
  ["%Emily", "%এমিলি"],
  ["%Harvey", "%হার্ভি"],
];

const exactSourceTranslations = new Map([
  ["A decorative piece for your farm.", "আপনার খামার সাজানোর একটি বস্তু।"],
  ["I heard it's raining back home. Is that why you came here?$h#$e#I kind of miss the rain, actually...$s", "শুনলাম, বাড়ির দিকে বৃষ্টি হচ্ছে। তাই বুঝি এখানে চলে এসেছ?$h#$e#সত্যি বলতে, বৃষ্টির কথা একটু মনে পড়ে...$s"],
  ["You say it's raining up above? *gasp*#$e#Rain... It's almost mythical to us. Some of us live our entire lives without ever experiencing it.", "বলছ, ওপরে বৃষ্টি হচ্ছে? *হঠাৎ শ্বাস টানে*#$e#বৃষ্টি... আমাদের কাছে তা প্রায় রূপকথার মতো। আমাদের কেউ কেউ সারা জীবন কাটিয়ে দেয় একবারও বৃষ্টি অনুভব না করে।"],
  ["It's locked.", "তালা দেওয়া।"],
  ["You don't have enough money.", "আপনার কাছে যথেষ্ট টাকা নেই।"],
  ["Crafting", "তৈরি"],
  ["+{0} Crit. Chance", "+{0} ক্রিট. সম্ভাবনা"],
  ["+{0} Crit. Power", "+{0} ক্রিট. শক্তি"],
  ["Exit", "বেরিয়ে যান"],
  ["Use an item on this to change what's displayed. The item won't be consumed.", "এতে কী দেখানো হবে তা বদলাতে এর ওপর একটি আইটেম ব্যবহার করুন। আইটেমটি খরচ হবে না।"],
  ["Hi, honey! If I knew more about farm work I'd help you out more. Sorry!#$e#I'll be thinking of you.$h", "হাই, সোনা! খামারের কাজ সম্পর্কে আরও জানলে তোমাকে বেশি সাহায্য করতে পারতাম। দুঃখিত!#$e#তোমার কথা ভাবব।$h"],
  ["Don't overwork yourself, dear.#$e#Make sure and take a break every now and then, or get something to eat.$h", "অতিরিক্ত পরিশ্রম কোরো না, প্রিয়।#$e#মাঝেমধ্যে বিরতি নিয়ো বা কিছু খেয়ে নিয়ো।$h"],
  ["We have to make sure and give %kid1 a lot of attention now that we have %kid2. We don't want any jealousy between them.", "%kid2 আসার পর এখন %kid1-কে অনেক মনোযোগ দিতে হবে। ওদের মধ্যে ঈর্ষা হোক, তা চাই না।"],
  ["I'm feeling excited for a new year of farming, @!$h", "খামারকাজের নতুন বছর নিয়ে রোমাঞ্চিত লাগছে, @!$h"],
  ["That Building Is Full", "ওই ভবনে আর জায়গা নেই"],
  ["{0}s Can't Live There.", "সেখানে {0} রাখা যাবে না।"],
  ["Boulder", "প্রকাণ্ড পাথর"],
  ["A hidden mechanism causes it to retract into the ground.", "গোপন এক ব্যবস্থা এটিকে মাটির নিচে গুটিয়ে নেয়।"],
  ["Obsidian Vase", "অবসিডিয়ানের ফুলদানি"],
  ["Singing Stone", "গান-গাওয়া পাথর"],
  ["Sloth Skeleton L", "স্লথের কঙ্কাল—বাঁ দিক"],
  ["Sloth Skeleton M", "স্লথের কঙ্কাল—মাঝের অংশ"],
  ["Sloth Skeleton R", "স্লথের কঙ্কাল—ডান দিক"],
  ["Standing Geode", "খাড়া জিওড"],
  ["Trimmed Lucky Purple Shorts", "সোনালি পাড়ের ভাগ্যবান বেগুনি শর্টস"],
  ["Purple silk shorts trimmed in luxurious gold...", "বিলাসবহুল সোনালি পাড় দেওয়া বেগুনি রেশমি শর্টস..."],
  ["Skeletons", "কঙ্কাল"],
  ["Dust Sprites", "ধুলোর আত্মা"],
  ["Mummies", "মমি"],
  ["Serpents", "সর্প"],
  ["Squid Ink Ravioli", "স্কুইডের কালির রাভিওলি"],
  ["Twig", "ভাঙা ডাল"],
  ["%Shane's hard at work. He doesn't seem interested in talking.", "%শেন মন দিয়ে কাজ করছে। কথা বলতে তার আগ্রহ আছে বলে মনে হচ্ছে না।"],
  ["Blue Tower", "নীল মিনার"],
  ["The countryside looks more interesting on a day like this, don't you think?", "এমন দিনে গ্রামাঞ্চল আরও আকর্ষণীয় দেখায়, তাই না?"],
  ["How was your day today, dear? Muddy?", "আজ দিনটা কেমন গেল, প্রিয়? কাদায় মাখামাখি?"],
  ["Hi, honey. I'm so glad you're home. I was starting to get kind of lonely.$l", "হাই, সোনা। তুমি বাড়ি ফিরেছ দেখে ভীষণ ভালো লাগছে। একটু একা লাগতে শুরু করেছিল।$l"],
  ["There's always something new happening on our farm... I love it.", "আমাদের খামারে সবসময় নতুন কিছু না কিছু ঘটছে... আমার ভীষণ ভালো লাগে।"],
  ["Are you ready for bed soon? I turned on the electric blanket for us...$l", "শিগগিরই ঘুমাতে যাবে? আমাদের জন্য বৈদ্যুতিক কম্বলটা চালু করেছি...$l"],
  ["You look like you've been working hard, dear. Let me help you de-stress.$l", "দেখে মনে হচ্ছে খুব পরিশ্রম করেছ, প্রিয়। তোমার চাপ কমিয়ে দিই।$l"],
  ["I'm just going to do some dusting over here. That should help you out, right?#$e#*phew*... it's hot out here.", "এখানে একটু ধুলো ঝাড়ব। তাতে তোমার সাহায্য হবে, তাই না?#$e#*উফ্*... বাইরে খুব গরম।"],
  ["I'm just going to hang out here, okay?#$e#There's a lot of interesting bugs and things out here. *chuckle*$h", "আমি এখানেই একটু সময় কাটাব, ঠিক আছে?#$e#এখানে অনেক মজার পোকা আর নানা জিনিস আছে। *মৃদু হাসি*$h"],
  ["Be careful out there! Sometimes I worry about you falling into a mine shaft.", "বাইরে সাবধানে থেকো! কখনো কখনো চিন্তা হয়, তুমি খনির খাদে পড়ে যাবে।"],
  ["@? I just want to say that I appreciate all the hard work you do for our household.$h", "@? শুধু বলতে চাই, আমাদের সংসারের জন্য তুমি যে এত পরিশ্রম করো, তার মূল্য আমি বুঝি।$h"],
  ["Don't worry about me... I know you've got a lot of responsibilities outside of the house. I'm fine in here by myself!$l", "আমাকে নিয়ে চিন্তা কোরো না... জানি, বাড়ির বাইরে তোমার অনেক দায়িত্ব আছে। এখানে একা আমি বেশ ভালোই আছি!$l"],
  ["Oh, I'm not bored... I'm just enjoying what we have here.#$e#It's a simple life, but I like it.$h", "ওহ্, আমি বিরক্ত নই... এখানে আমাদের যা আছে, শুধু সেটাই উপভোগ করছি।#$e#জীবনটা সাদাসিধে, তবে আমার ভালো লাগে।$h"],
  ["If you go into town, make sure and say hi to everyone for me.", "শহরে গেলে আমার হয়ে সবাইকে শুভেচ্ছা জানিয়ো।"],
  ["I'll do the laundry tomorrow morning before you get up... that way you won't have any down-time.", "কাল সকালে তুমি ওঠার আগেই কাপড় ধুয়ে দেব... তাহলে তোমার কোনো কাজ থামিয়ে রাখতে হবে না।"],
  ["I wonder what everyone in town is doing today?", "শহরের সবাই আজ কী করছে কে জানে?"],
  ["No matter how much I clean, the house keeps getting dirty again.#$e#I guess farms can be kind of dirty.", "যতই পরিষ্কার করি, বাড়িটা আবার নোংরা হয়ে যায়।#$e#খামার বোধ হয় একটু নোংরা হয়ই।"],
  ["I wonder if we'll live here our entire lives?", "আমরা কি সারাজীবন এখানেই থাকব?"],
  ["...Do you still love me?$s", "...তুমি কি এখনো আমাকে ভালোবাসো?$s"],
  ["*sigh*... Maybe we got married too young.$s", "*দীর্ঘশ্বাস*... হয়তো আমরা খুব অল্প বয়সে বিয়ে করেছি।$s"],
  ["Are you still happy with me?$s", "আমার সঙ্গে তুমি কি এখনো সুখী?$s"],
  ["Did I do something wrong? You've been acting different lately.$s", "আমি কি কোনো ভুল করেছি? ইদানীং তুমি অন্য রকম আচরণ করছ।$s"],
  ["Do you ever wonder what else is out there?$s", "কখনো কি ভাবো, বাইরের পৃথিবীতে আর কী আছে?$s"],
  ["You used to be romantic... what happened?$s#$e#I know I'm not as young as I used to be... is that what you married me for?$a", "আগে তুমি কত রোমান্টিক ছিলে... কী হলো?$s#$e#জানি, আগের মতো আর কমবয়সী নই... শুধু ওই জন্যই কি আমাকে বিয়ে করেছিলে?$a"],
  ["We only have one short life to live... is this the best way to do it?$s", "আমাদের এই একটাই ছোট জীবন... এভাবেই কি সেটা সবচেয়ে ভালোভাবে কাটানো যায়?$s"],
  ["I used to be your sweetie... now you only seem to put up with me when I make a hot dinner.$s", "একসময় আমি ছিলাম তোমার আদরের মানুষ... এখন শুধু গরম রাতের খাবার বানালেই আমাকে সহ্য করো বলে মনে হয়।$s"],
  ["You've been so cold to me lately...$s", "ইদানীং তুমি আমার সঙ্গে ভীষণ শীতল আচরণ করছ...$s"],
  ["I wonder if I could've done better.$s", "ভাবছি, আমি কি আরও ভালো কাউকে পেতে পারতাম।$s"],
  ["It's summer... that means the house is full of flies.#$e#Don't worry, I'll take care of them.", "গ্রীষ্ম এসেছে... তার মানে বাড়ি মাছিতে ভরে গেছে।#$e#চিন্তা কোরো না, ওদের ব্যবস্থা আমি করব।"],
  ["Are you going to enter the fishing contest tomorrow?", "কাল মাছ ধরার প্রতিযোগিতায় অংশ নেবে?"],
  ["I may like the colder seasons, but by the end I'm always glad to see spring arrive.", "ঠান্ডা মৌসুমগুলো আমার পছন্দ হলেও শেষে বসন্তের আগমন দেখে সবসময়ই ভালো লাগে।"],
  ["Aren't you glad winter's over, honey? Things seem more hopeful now.", "শীত শেষ হয়েছে বলে খুশি নও, সোনা? এখন সবকিছু আরও আশাব্যঞ্জক মনে হচ্ছে।"],
  ["Oh man... I could go for some chocolate cake.", "ওহ্... এক টুকরো চকোলেট কেক হলে মন্দ হতো না।"],
  ["Phew! It's hot but it feels great, doesn't it?#$e#Maybe we'll see some wild parrots today.", "উফ্! গরম, তবে দারুণ লাগছে, তাই না?#$e#হয়তো আজ কয়েকটা বুনো টিয়াপাখি দেখব।"],
  ["I drank a super-food smoothie this morning and I feel aaah-mazing!$h", "আজ সকালে সুপার-ফুড স্মুদি খেয়েছি, আর দা-রু-ণ লাগছে!$h"],
  ["Whoops, my hair is frozen solid again.$s", "ওহো, আমার চুল আবার বরফ হয়ে শক্ত হয়ে গেছে।$s"],
  ["#$c .5#I got up a little before you and fed David Jr. He's very active this morning.#$e#I hope you don't mind the guinea pig smell.", "#$c .5#তোমার একটু আগে উঠে ডেভিড জুনিয়রকে খাইয়েছি। আজ সকালে ও খুব চঞ্চল।#$e#আশা করি গিনিপিগের গন্ধে তোমার আপত্তি নেই।"],
  ["I'm going to spend some time with the parrot today. It breaks my heart that he'll never fly again.$u", "আজ টিয়াপাখিটার সঙ্গে কিছুটা সময় কাটাব। ও আর কখনো উড়তে পারবে না, ভাবলেই মনটা ভেঙে যায়।$u"],
  ["Ah, it's more humid today with the rain... I feel a lot more comfortable.", "আহ্, বৃষ্টির জন্য আজ আর্দ্রতা বেশি... অনেক আরাম লাগছে।"],
  ["The sound of the rain reminds me of the sewers... it's comforting.#$e#The sewers were my refuge... I felt safe there. But don't worry... I feel the same way about my new home, too.", "বৃষ্টির শব্দে নর্দমার কথা মনে পড়ে... এতে শান্তি পাই।#$e#নর্দমাই ছিল আমার আশ্রয়... সেখানে নিরাপদ বোধ করতাম। তবে চিন্তা কোরো না... নতুন বাড়িতেও একই রকম নিরাপদ বোধ করি।"],
  ["I wish I could help you on the farm, but I can't go out in the sun...", "ইশ্, খামারে তোমাকে সাহায্য করতে পারলে ভালো হতো, কিন্তু আমি রোদে বেরোতে পারি না..."],
  ["Hi, @. Welcome home. You look like you've been working hard out there!$h", "হাই, @। বাড়িতে স্বাগতম। দেখে মনে হচ্ছে বাইরে খুব পরিশ্রম করেছ!$h"],
  ["It's salmonberry season! All across the countryside, bushes are teeming with juicy little berries, and they're free for the taking! Harvesting them is a great way to earn some extra cash.", "স্যালমনবেরির মৌসুম! গোটা গ্রামাঞ্চলের ঝোপে রসালো ছোট বেরি ভরে আছে, বিনামূল্যে তুলতে পারো! সংগ্রহ করে বাড়তি টাকা আয়ের দারুণ উপায়।"],
]);

const specificTranslations = new Map([
  ["Strings/StringsFromCSFiles\u0000Farmer.cs.2011", "দিনলিপিতে নতুন নথি"],
  ["Strings/StringsFromCSFiles\u0000OptionsPage.cs.11281", "দিনলিপি খুলুন"],
  ["Strings/StringsFromCSFiles\u0000SkillsPage.cs.11600", "+{0} পিক্যাক্সের দক্ষতা"],
  ["Strings/1_6_Strings\u00003_Mastery", "খননে মাস্টারি"],
  ["Strings/StringsFromCSFiles\u0000BiteChime", "মাছ কামড়ানোর শব্দ"],
  ["Data/Quests\u00008", "Crafting/অগ্রগতি/অভিজ্ঞতা বাড়লে লাভ বাড়ানো আর জীবন সহজ করার নতুন তৈরির রেসিপি আবিষ্কার করবে। যেমন, কাকতাড়ুয়া কাককে তোমার মূল্যবান ফসল খেতে দেবে না।/কৃষিকাজের ১ম স্তরে পৌঁছে একটি কাকতাড়ুয়া তৈরি করো।/(BC)8/-1/100/-1/true"],
  ["Data/TV/TipChannel\u000046", "গ্রীষ্ম বজ্রঝড়ের জন্য পরিচিত। বজ্রদণ্ড বানাতে জানলে বিদ্যুৎ সংগ্রহ করে ব্যাটারি প্যাক বানাতে পারো। এগুলো বিক্রি করা বা কিছু তৈরিতে ব্যবহার করা যায়!"],
  ["Characters/Dialogue/Leah\u0000Thu6", "বনজ সংগ্রহ আমার বিশেষ দক্ষতা। কোনো দিন তোমার জন্য টাটকা সালাদ বানাব।$h"],
  ["Characters/Dialogue/Caroline\u0000Tue", "বনে বুনো হর্সর‍্যাডিশ দেখেছি।#$e#বনজ সংগ্রহ কিছু টাকা আয়ের মজার উপায় হতে পারে। অথবা পাওয়া জিনিস উপহার বা খাবার হিসেবে ব্যবহার করতে পারো।"],
  ["Characters/Dialogue/Caroline\u0000summer_Tue", "ইদানীং বনে বুনো ফল দেখছি।#$e#বনজ সংগ্রহ কিছু টাকা আয়ের মজার উপায় হতে পারে। অথবা পাওয়া জিনিস উপহার বা খাবার হিসেবে ব্যবহার করতে পারো।"],
  ["Characters/Dialogue/Caroline\u0000fall_Tue", "বনে খাওয়ার উপযোগী মাশরুম দেখেছি।#$e#বনজ সংগ্রহ কিছু টাকা আয়ের মজার উপায় হতে পারে। অথবা পাওয়া জিনিস উপহার বা খাবার হিসেবে ব্যবহার করতে পারো।"],
  ["Characters/Dialogue/Caroline\u0000winter_Tue", "শীত কঠিন, তবে ভাগ্য ভালো হলে কিছু শিকড় খুঁড়ে পেতে পারো।#$e#বনজ সংগ্রহ কিছু টাকা আয়ের মজার উপায় হতে পারে। অথবা পাওয়া জিনিস উপহার বা খাবার হিসেবে ব্যবহার করতে পারো।"],
  ["Data/SecretNotes\u000026", "প্রাচীন কৃষিকাজের রহস্য, পঙ্‌ক্তি ৩৭:^^কিশমিশ খাওয়া জুনিমোর চেয়ে ভালো সহায়ক নেই...^^"],
  ["Strings/Notes\u00000", "কৃষিকাজের পরামর্শ--\n*গুণমান বাড়াতে, শ্রম কমাতে বা ফসলের বৃদ্ধি ত্বরান্বিত করতে সার ব্যবহার করো।\n*ফলের গাছ বড় হতে পুরো এক ঋতু লাগে, তবে যত্ন খুব কমই দরকার। নতুন চারার চারপাশের জায়গা ফাঁকা রাখো, নইলে সেটি ঠিকমতো নাও বাড়তে পারে।\n*ঋতু শেষ হলেই ফসল মরে যাবে, যদি না তা একাধিক ঋতুতে জন্মায় (যেমন ভুট্টা)।\n*কেল ও গমের মতো কিছু ফসল কাস্তে দিয়ে কাটতে হয়।"],
  ["Strings/StringsFromMaps\u0000AnimalShop.10", "এটি একটি মেগা স্টেশন। ভেতরে একটি খেলা আছে, তবে সেটি কোড সুলতান এক্সএল-এর মধ্য দিয়ে চালানো হয়েছে। মনে হচ্ছে, কেউ চিটিং করেছে।"],
  ["Strings/StringsFromCSFiles\u0000ShopMenu.cs.11489", "ঋতু প্রায় শেষ। আগামীকাল পণ্যের মজুত বদলাব।"],
  ["Strings/StringsFromCSFiles\u0000HoeDirt.cs.13924", "এই ঋতুর নয়।"],
  ["Strings/StringsFromCSFiles\u0000Fishing_Channel_Intro", "F.I.B.S., অর্থাৎ মাছ ধরার তথ্য সম্প্রচার পরিষেবায় যোগ দেওয়ার জন্য ধন্যবাদ। আমাদের দুর্ভাগ্যজনক নামটি দেখে ভুল বুঝবেন না; নিশ্চিন্ত থাকুন, এই ঋতুতে মাছ ধরার সুযোগ সম্পর্কে আমরা শুধু সবচেয়ে নির্ভরযোগ্য তথ্যই দিই।"],
  ["Strings/StringsFromCSFiles\u0000IslandTraderSecret", "শোনো! ঋতুর শেষ দিনে শুধু তোমার জন্য বিশেষ বিনিময়! উজ্জ্বল সবুজ বার নিয়ে এসো।"],
  ["Strings/1_6_Strings\u0000Scholar_Question_0_1", "প্রশ্ন ১: ঋতু শেষ হয় কত তারিখে?"],
  ["Strings/1_6_Strings\u0000Scholar_Question_1_0", "প্রশ্ন ২: {0} কোন ঋতুতে জন্মায়?"],
  ["Strings/1_6_Strings\u0000Scholar_Question_2_0", "প্রশ্ন ৩: {0} কোন ঋতুতে ধরা যায়?"],
  ["Strings/1_6_Strings\u0000Joja_Debt_Notice", "বিজ্ঞপ্তি:^^ঋতুর শেষে আপনার হিসাব থেকে {0}g কেটে নেওয়া হবে।^^পরিশোধে ব্যর্থ হলে হিসাবের স্থিতি ঋণাত্মক হবে।^^আমাদের সেবা গ্রহণের জন্য ধন্যবাদ।^-জোজাব্যাংক"],
  ["Strings/StringsFromMaps\u0000ScienceHouse.8", "প্রতি ঋতুর নক্ষত্র মানচিত্র।"],
  ["Characters/Dialogue/MarriageDialogue\u0000spring_Sebastian", "বাহ্, আমার ত্বক ফ্যাকাশে... মনে হয়, এই ঋতুতে খামারের কাজে তোমাকে একটু সাহায্য করাই ভালো।"],
  ["Characters/Dialogue/MarriageDialogue\u0000summer_Haley", "এত দিনে নিশ্চয়ই জেনে গেছ, গ্রীষ্ম আমার প্রিয় ঋতু।$h"],
  ["Strings/schedules/Lewis\u00001.000", "বেশ, এ ঋতুতে মাছের গন্ধ নিশ্চয়ই টাটকা।"],
  ["Data/Festivals/spring13\u0000Emily", "ভোর থেকে উঠে ডিমে রং করছি... এই ঋতুর এটাই সবসময় আমার প্রিয় অংশ।$h"],
  ["Characters/Dialogue/MarriageDialogueLeah\u0000spring_2", "তাহলে, এই ঋতুতে আমরা কী লাগাচ্ছি?"],
  ["Characters/Dialogue/MarriageDialogueAbigail\u0000fall_2", "এই ঋতুতে আমরা কি বিশাল কুমড়ো ফলাতে পারি? প্লিজ, সোনা?$h"],
  ["Characters/Dialogue/MarriageDialogueShane\u0000TwoKids_3", "*দীর্ঘশ্বাস*... যদি বাচ্চাদের একটা ঋতুর জন্য জোজার শ্রমশিবিরে পাঠানো যেত...#$e#মজা করছি।$h"],
  ["Characters/Dialogue/MarriageDialogueShane\u0000fall_1", "হুম... ঋতুটা উদ্‌যাপন করতে হয়তো কয়েক বাক্স কুমড়োর এল কিনতে হবে...$6"],
  ["Characters/Dialogue/MarriageDialogueHarvey\u0000summer_27", "গ্রীষ্ম শেষ হয়ে ঠান্ডা ঋতু শুরু হলে আমার কাজের চাপ বাড়ে। একটু খিটখিটে হলে আগেই দুঃখিত..."],
  ["Characters/Dialogue/MarriageDialogueHaley\u0000spring_2", "তাহলে, এই ঋতুতে আমরা কী লাগাচ্ছি?"],
  ["Strings/schedules/Demetrius\u0000summer_25.000", "ঠান্ডা ঋতু আসছে, তাই ফ্লুর টিকা নিতে এসেছি।"],
]);

const specificLiteralReplacements = new Map([
  ["Data/Events/IslandHut\u00001039573/N 10/Hl addedParrotBoy", [["*Awk*", "*আক্*"]]],
]);

function correctedTranslation(record) {
  if (record.reviewedPreserve) return record.translation;
  let value = record.translation;
  for (const [from, to] of replacements) value = value.replaceAll(from, to);
  value = exactSourceTranslations.get(record.source) ?? value;
  value = specificTranslations.get(`${record.target}\u0000${record.key}`) ?? value;
  for (const [from, to] of specificLiteralReplacements.get(`${record.target}\u0000${record.key}`) ?? []) {
    value = value.replaceAll(from, to);
  }
  return value;
}

const translationFiles = fs.readdirSync(translationRoot).filter((name) => name.endsWith(".json")).sort();
const translationDocuments = new Map();
const translationIndex = new Map();
for (const relative of translationFiles) {
  const file = path.join(translationRoot, relative);
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  translationDocuments.set(file, document);
  for (const change of document.Changes ?? []) {
    for (const [key, encoded] of Object.entries(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (translationIndex.has(id)) throw new Error(`duplicate patch record: ${change.Target} :: ${key}`);
      translationIndex.set(id, { file, change, decoded: decodeBengali(encoded, clusterDecode) });
    }
  }
}

let changedRecords = 0;
const changedBatchFiles = new Set();
const changedTranslationFiles = new Set();

function replaceBatchValue(text, record, oldValue, newValue) {
  const separator = text.includes('"target": ') ? ": " : ":";
  const targetNeedle = `"target"${separator}${JSON.stringify(record.target)}`;
  const keyNeedle = `"key"${separator}${JSON.stringify(record.key)}`;
  const valueNeedle = `"translation"${separator}${JSON.stringify(oldValue)}`;
  const candidates = [];
  let cursor = 0;
  while (true) {
    const targetIndex = text.indexOf(targetNeedle, cursor);
    if (targetIndex < 0) break;
    const nextTargetIndex = text.indexOf(`"target"${separator}`, targetIndex + targetNeedle.length);
    const recordEnd = nextTargetIndex < 0 ? text.length : nextTargetIndex;
    const keyIndex = text.indexOf(keyNeedle, targetIndex + targetNeedle.length);
    if (keyIndex >= 0 && keyIndex < recordEnd) candidates.push({ targetIndex, keyIndex, recordEnd });
    cursor = targetIndex + targetNeedle.length;
  }
  if (candidates.length !== 1) throw new Error(`cannot locate batch record: ${record.target} :: ${record.key}`);
  const valueIndex = text.indexOf(valueNeedle, candidates[0].keyIndex + keyNeedle.length);
  if (valueIndex < 0 || valueIndex >= candidates[0].recordEnd) {
    throw new Error(`cannot locate batch translation: ${record.target} :: ${record.key}`);
  }
  return `${text.slice(0, valueIndex)}"translation"${separator}${JSON.stringify(newValue)}${text.slice(valueIndex + valueNeedle.length)}`;
}

for (const relative of fs.readdirSync(batchRoot).filter((name) => name.endsWith(".json")).sort()) {
  const file = path.join(batchRoot, relative);
  const text = fs.readFileSync(file, "utf8");
  const batch = JSON.parse(text);
  const changes = [];
  for (const record of batch.records ?? []) {
    const next = correctedTranslation(record);
    const id = `${record.target}\u0000${record.key}`;
    const location = translationIndex.get(id);
    if (!location) throw new Error(`missing patch record: ${record.target} :: ${record.key}`);
    if (
      location.decoded !== next
      && location.decoded !== record.translation
      && correctedTranslation({ ...record, translation: location.decoded }) !== next
    ) {
      throw new Error(`batch/patch drift before edit: ${record.target} :: ${record.key}`);
    }
    if (location.decoded !== next) {
      location.change.Entries[record.key] = next;
      changedTranslationFiles.add(location.file);
    }
    if (next !== record.translation) changes.push({ record, old: record.translation, next });
  }
  if (!changes.length) continue;
  let nextText = text;
  for (const { record, old, next } of changes) {
    nextText = replaceBatchValue(nextText, record, old, next);
  }
  fs.writeFileSync(file, nextText);
  changedBatchFiles.add(file);
  changedRecords += changes.length;
}

for (const file of changedTranslationFiles) {
  fs.writeFileSync(file, `${JSON.stringify(translationDocuments.get(file), null, 2)}\n`);
}

console.log(JSON.stringify({
  changedRecords,
  changedBatchFiles: changedBatchFiles.size,
  changedTranslationFiles: changedTranslationFiles.size,
}, null, 2));
