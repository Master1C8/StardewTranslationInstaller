import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const input = JSON.parse(fs.readFileSync(path.join(root, "Documentation/tamil-batches/399-sam-house-and-seed-shop.json"), "utf8"));
const outputPath = path.join(root, "Documentation/bengali-batches/399-sam-house-and-seed-shop.json");

const quoteMaps = new Map([
  [0, [
    ["Hi @. Please, come in.", "হাই, @। ভেতরে এসো।"],
    ["Ah, I'm so glad you came, @! And you brought the fish! Wonderful.", "আহ্, তুমি এসেছ বলে খুব ভালো লাগছে, @! মাছটাও এনেছ! চমৎকার।"],
    ["Sam! Could you come in here and help clean this fish?", "স্যাম! এদিকে এসে মাছটা পরিষ্কার করতে একটু সাহায্য করবে?"],
    ["...Yes, ma'am.$a", "...জি, ম্যাম।$a"],
    ["Wow, it looks wonderful... and it smells so fresh! Thanks so much for doing this, @.#$b#Kent caught a fish, too, but he eats about a whole fish to himself!$u", "ওয়াও, দারুণ দেখাচ্ছে... আর কত টাটকা গন্ধ! এটা করার জন্য অনেক ধন্যবাদ, @।#$b#কেন্টও একটা মাছ ধরেছিল, কিন্তু একাই প্রায় পুরো মাছ খেয়ে ফেলে!$u"],
    ["Heh heh.$h", "হে হে।$h"],
    ["Mmm... that crispy bass was delicious! The breading was to die for...", "ম্‌ম্... ওই মচমচে বাস মাছটা সুস্বাদু ছিল! মসলার আস্তরণটা ছিল অসাধারণ..."],
    ["I almost feel like part of the family, now.", "এখন নিজেকে প্রায় পরিবারের একজন বলেই মনে হচ্ছে।"],
  ]],
  [1, [
    ["Oh hi, @! Come in! Do I smell fresh fish?", "ওহ্ হাই, @! ভেতরে এসো! টাটকা মাছের গন্ধ পাচ্ছি নাকি?"],
    ["Sam! Could you come in here and help with dinner?", "স্যাম! এদিকে এসে রাতের খাবারে একটু সাহায্য করবে?"],
    ["...Yes, ma'am.$a", "...জি, ম্যাম।$a"],
    ["Wow, this looks like quality bass, @. Thanks so much for bringing this.$h", "ওয়াও, বেশ ভালো মানের বাস মাছ দেখাচ্ছে, @। এটা আনার জন্য অনেক ধন্যবাদ।$h"],
    ["Mmm... that crispy bass was delicious! The breading was out of this world...", "ম্‌ম্... ওই মচমচে বাস মাছটা সুস্বাদু ছিল! মসলার আস্তরণটা ছিল অতুলনীয়..."],
    ["I almost feel like part of the family, now.", "এখন নিজেকে প্রায় পরিবারের একজন বলেই মনে হচ্ছে।"],
  ]],
  [2, [
    ["Oh, hi @! Sebastian and I were just having a little 'jam session'.", "ওহ্, হাই @! সেবাস্টিয়ান আর আমি একটু ‘জ্যাম সেশন’ করছিলাম।"],
    ["We're trying to start a band, but we still don't know what kind of music to make. There's too many possibilities.", "আমরা একটা ব্যান্ড শুরু করার চেষ্টা করছি, কিন্তু কী ধরনের গান বানাব তা এখনো জানি না। সম্ভাবনা যে অনেক।"],
    ["#$q 76 null#Say, @... what kind of music do you like?#$r 76 50 Event_band1#Cheerful pop music.#$r 77 50 Event_band2#Experimental noise rock.#$r 78 50 Event_band3#Hi-Energy dance music.#$r 79 50 Event_band4#Honky-tonky country music.", "#$q 76 null#বলো তো, @... তোমার কী ধরনের গান ভালো লাগে?#$r 76 50 Event_band1#প্রাণবন্ত পপ গান।#$r 77 50 Event_band2#পরীক্ষামূলক নয়েজ রক।#$r 78 50 Event_band3#উচ্চ-উদ্দীপনার নাচের গান।#$r 79 50 Event_band4#হনকি-টঙ্কি কান্ট্রি গান।"],
    ["What do you say, Sebastian? Should we do this?", "কী বলো, সেবাস্টিয়ান? এটা করব?"],
    ["...Okay.", "...ঠিক আছে।"],
    ["Thanks for the help, @. With my guitar skills, and Sebastian's wizardry on the synthesizer, we're gonna be a screaming success. I'm convinced of it!$h", "সাহায্যের জন্য ধন্যবাদ, @। আমার গিটার দক্ষতা আর সিন্থেসাইজারে সেবাস্টিয়ানের জাদু দিয়ে আমরা তুমুল সফল হব। আমি নিশ্চিত!$h"],
    ["Now I just need to find someone to play drums...$u", "এখন শুধু ড্রাম বাজানোর জন্য কাউকে খুঁজতে হবে...$u"],
  ]],
  [3, [
    ["Oh, hi @. I was just about to have a snack.", "ওহ্, হাই @। এইমাত্র একটু নাশতা করতে যাচ্ছিলাম।"],
    ["Here, let me get something for you.", "এসো, তোমার জন্যও কিছু আনি।"],
    ["Oh no... What a mess.$s", "ওহ্ না... কী বিশ্রী অবস্থা।$s"],
    ["What was that sound?", "ওটা কীসের শব্দ ছিল?"],
    ["*gasp*$s", "*বিস্ময়ে হাঁপ ছাড়ে*$s"],
    ["This is absolutely terrible! What happened?$u", "এ তো ভয়াবহ অবস্থা! কী হয়েছে?$u"],
    ["$q 80 null#...Tell her, @.$s#$r 80 -10 event_snack1#Sam dropped the snack as he was handing it to me.#$r 80 50 event_snack2#Sam handed me the snack and then I dropped it.#$r 81 -50 event_snack3#Sam dropped it on purpose. He thought it would be funny.", "$q 80 null#...তুমিই ওকে বলো, @।$s#$r 80 -10 event_snack1#আমার হাতে দেওয়ার সময় স্যাম নাশতাটা ফেলে দিয়েছে।#$r 80 50 event_snack2#স্যাম নাশতাটা আমার হাতে দিয়েছিল, তারপর আমি ফেলে দিয়েছি।#$r 81 -50 event_snack3#স্যাম ইচ্ছে করেই ফেলেছে। ও ভেবেছিল মজা হবে।"],
    ["$p 80#Thanks for telling me the truth, @. It's not such a big deal.|You did WHAT, Sam?! What's gotten into you?!$u", "$p 80#সত্যিটা বলার জন্য ধন্যবাদ, @। এমন বড় কোনো ব্যাপার নয়।|তুমি কী করেছ, স্যাম?! তোমার কী হয়েছে?!$u"],
    ["I'm sorry about this, mom. I'll clean it up.$s", "এর জন্য দুঃখিত, মা। আমি পরিষ্কার করে দেব।$s"],
    ["Thanks, honey.$h", "ধন্যবাদ, সোনা।$h"],
    ["$p 81#I'm angry at you. I have no idea why you lied like that.$s|Sorry about what happened earlier.", "$p 81#তোমার ওপর রাগ হয়েছে। তুমি ওভাবে মিথ্যা বললে কেন, বুঝতেই পারছি না।$s|আগের ঘটনার জন্য দুঃখিত।"],
  ]],
  [4, [
    ["Hi, @! I'm just making some popcorn.$h", "হাই, @! একটু পপকর্ন বানাচ্ছি।$h"],
    ["AAAAAHHHHHHH!!!$u", "আআআআআআআআ!!!$u"],
    ["That sound...$s", "ওই শব্দটা...$s"],
    ["You should've known that sound would remind me of the war!$u", "তোমার জানা উচিত ছিল ওই শব্দটা আমাকে যুদ্ধের কথা মনে করিয়ে দেবে!$u"],
    ["...I lost a lot of good friends in those bloody trenches.$s", "...ওই রক্তাক্ত পরিখাগুলোতে অনেক ভালো বন্ধু হারিয়েছি।$s"],
    ["But, dear... popcorn was always your favorite before you left.$s", "কিন্তু, সোনা... চলে যাওয়ার আগে পপকর্ন তো সবসময় তোমার প্রিয় ছিল।$s"],
    ["...Things have changed.", "...অনেক কিছু বদলে গেছে।"],
    ["*whisper* @... can you say something to him?$s", "*ফিসফিস করে* @... তুমি কি ওকে কিছু বলতে পারো?$s"],
    ["$q 215 null#(Say something to Kent)$s#$r 215 -25 event_popcorn1#Jodi's to blame... she should've known better!#$r 215 50 event_popcorn2#I know you're hurting... but don't blame your wife.#$r 215 -50 event_popcorn3#(Lie) Blame me... I asked for popcorn", "$q 215 null#(কেন্টকে কিছু বলো)$s#$r 215 -25 event_popcorn1#দোষটা জোডির... ওর আরও ভালো বোঝা উচিত ছিল!#$r 215 50 event_popcorn2#জানি তুমি কষ্ট পাচ্ছ... কিন্তু স্ত্রীকে দোষ দিয়ো না।#$r 215 -50 event_popcorn3#(মিথ্যা বলো) আমাকে দোষ দাও... আমিই পপকর্ন চেয়েছিলাম"],
    ["...$s#$b#I'm sorry, honey. You couldn't have known the sound of popcorn would make me upset.", "...$s#$b#দুঃখিত, সোনা। পপকর্নের শব্দে আমি বিচলিত হব, তা তোমার জানার কথা নয়।"],
    ["It's okay, dear.$s#$b#The last thing I want to do is make you upset. I'll do my best to keep your spirits up from now on.", "ঠিক আছে, সোনা।$s#$b#তোমাকে কষ্ট দেওয়াই আমার শেষ ইচ্ছা। এখন থেকে তোমার মন ভালো রাখতে যথাসাধ্য চেষ্টা করব।"],
    ["I'm glad you're a friend of the family, @. Sorry about my behavior before.", "তুমি আমাদের পরিবারের বন্ধু বলে ভালো লাগছে, @। আগের আচরণের জন্য দুঃখিত।"],
  ]],
  [5, [
    ["I always knew there was something special between us...$l", "আমি সবসময়ই জানতাম আমাদের মধ্যে বিশেষ কিছু আছে...$l"],
    ["I'm going to be thinking about this night for a long time...$l", "এই রাতের কথা অনেক দিন মনে থাকবে...$l"],
    ["...$l", "...$l"],
  ]],
  [6, [
    ["I see...$s", "বুঝলাম...$s"],
    ["I'm sorry... I had the wrong idea. I'll see you around.$7", "দুঃখিত... আমি ভুল বুঝেছিলাম। পরে দেখা হবে।$7"],
    ["...$s", "...$s"],
  ]],
  [7, [
    ["Hah! Well, look at me! I'm gettin' real sappy in my old age, aren't I?  ...hehehe.$h", "হা! দেখো আমার অবস্থা! বুড়ো বয়সে একেবারে আবেগপ্রবণ হয়ে পড়ছি, তাই না?  ...হেহেহে।$h"],
    ["Thanks for lendin' an ear, kid", "আমার কথা শোনার জন্য ধন্যবাদ, বাছা"],
  ]],
  [8, [
    ["Hey, kid...", "এই, বাছা..."],
    ["You caught me prayin'...", "আমাকে প্রার্থনা করতে দেখে ফেলেছ..."],
    ["This here's my new 'Sign Of The Vessel' statue.#$b#...Ordered it from Joja.com with free 2-day shipping. Don't tell Pierre.", "এটা আমার নতুন ‘সাইন অব দ্য ভেসেল’ মূর্তি।#$b#...Joja.com থেকে বিনা খরচে দুই দিনে সরবরাহসহ অর্ডার করেছি। পিয়েরকে বোলো না।"],
    ["...I've been settling in to the new house. It's really a great place. Feels like home already. I really do appreciate this new comfort.$h", "...নতুন বাড়িতে ধীরে ধীরে গুছিয়ে নিচ্ছি। সত্যিই দারুণ জায়গা। এরই মধ্যে নিজের ঘর মনে হচ্ছে। এই নতুন স্বাচ্ছন্দ্যের জন্য আমি সত্যিই কৃতজ্ঞ।$h"],
    ["Oh, Sorry...", "ওহ্, দুঃখিত..."],
    ["*sniff*... It's just...$s#$b#...I should be so happy...$s", "*নাক টানে*... আসলে...$s#$b#...আমার তো খুব খুশি হওয়ার কথা...$s"],
    ["...But I haven't been able to cut back on the beer... I haven't changed at all...$s", "...কিন্তু বিয়ার খাওয়া কমাতে পারিনি... আমি একটুও বদলাইনি...$s"],
    ["For a long time, now... I've felt like there's something missing from my life, @... $s#$b#I always thought it was about money... Just bein' poor... ya know? So I figured gettin' this house would solve everything. But ...it didn't.$s#$b#So that's... That's why I ordered this statue.", "অনেক দিন ধরে... মনে হচ্ছে আমার জীবনে কিছু একটা নেই, @... $s#$b#সবসময় ভেবেছি সমস্যাটা টাকার... শুধু গরিব হওয়ার... বুঝলে? তাই ভেবেছিলাম এই বাড়িটা পেলেই সব সমস্যার সমাধান হবে। কিন্তু... হয়নি।$s#$b#তাই... তাই এই মূর্তিটা অর্ডার করেছি।"],
    ["Say something to Pam:#I'm glad you're feeling hopeful#Sorry Pam, but Yoba isn't real...", "প্যামকে কিছু বলো:#তোমাকে আশাবাদী দেখে ভালো লাগছে#দুঃখিত প্যাম, কিন্তু ইয়োবার অস্তিত্ব নেই..."],
    ["That ain't funny! ...I pour my heart out to you and that's how you respond? What in the void is wrong with you?$u", "এটা মোটেও মজার নয়! ...তোমার কাছে মনের সব কথা খুলে বললাম, আর তুমি এই জবাব দিলে? তোমার কী এমন ভয়েড-লাগা সমস্যা?$u"],
    ["I don't care what you say... I have faith in Yoba! Plenty of us do! Now get out.$4", "তুমি কী বললে তাতে আমার কিছু যায় আসে না... ইয়োবার ওপর আমার বিশ্বাস আছে! আমাদের অনেকেরই আছে! এবার বেরিয়ে যাও।$4"],
  ]],
  [10, [["Hey, that was fun!$h#$b#Well thanks, @. You seem to really know your way around a joystick, huh? I guess that makes sense. $h^Thanks, @. I didn't think you'd know how to work a joystick so well! But it seems you're experienced.$h", "এই, বেশ মজা হলো!$h#$b#ধন্যবাদ, @। জয়স্টিক বেশ ভালোই চালাতে জানো, তাই না? অবশ্য সেটাই স্বাভাবিক। $h^ধন্যবাদ, @। ভাবিনি জয়স্টিক এত ভালো চালাতে জানবে! কিন্তু দেখছি তুমি অভিজ্ঞ।$h"]]],
  [11, [
    ["Ah, hello there, @.", "আহ্, হ্যালো, @।"],
    ["I was just loading some more prizes into this machine here...", "এই যন্ত্রে আরও কিছু পুরস্কার ভরছিলাম..."],
    ["It's a new program I've come up with, to help promote a spirit of goodwill among the townsfolk... You included!#$b#It's pretty simple... sometimes, when you help out others in town, you'll receive a 'Prize Ticket'. You can turn them in for rewards.#$b#There's some special stuff in there!$h", "শহরবাসীর মধ্যে সদিচ্ছার মনোভাব বাড়াতে নতুন এই কর্মসূচি ভেবেছি... তোমাকেও নিয়ে!#$b#ব্যাপারটা বেশ সহজ... শহরে অন্যদের সাহায্য করলে কখনো কখনো একটি ‘পুরস্কার টিকিট’ পাবে। পুরস্কারের বিনিময়ে এগুলো জমা দিতে পারো।#$b#ওর মধ্যে বিশেষ কিছু জিনিস আছে!$h"],
    ["My only worry is that people will just go after the tickets, rather than cultivating a true compassion for their fellow man...$s", "আমার একমাত্র দুশ্চিন্তা হলো, মানুষ সত্যিকারের সহমর্মিতা গড়ে তোলার বদলে শুধু টিকিটের পেছনেই ছুটবে...$s"],
    ["Is that so? Well, I'm glad to hear that!$h", "তাই নাকি? শুনে ভালো লাগল!$h"],
    ["I see!$u#$b#Well... that's not what I hoped to hear, but I appreciate the honesty.", "বুঝলাম!$u#$b#যাক... এমন উত্তর আশা করিনি, তবে সততার প্রশংসা করি।"],
    ["At any rate... keep checking the 'Help Wanted' board in town. That's a good way to get your hands on more tickets.#$b#Good luck out there.", "যা-ই হোক... শহরের ‘সাহায্য চাই’ বোর্ডটি নিয়মিত দেখো। আরও টিকিট পাওয়ার এটি ভালো উপায়।#$b#শুভকামনা।"],
  ]],
  [12, [
    ["Hmmm... ", "হুম্... "],
    ["...I was just peering down into this old mine shaft.#$b#It's been abandoned for decades.", "...এই পুরোনো খনির খাদটার নিচে তাকাচ্ছিলাম।#$b#কয়েক দশক ধরে পরিত্যক্ত পড়ে আছে।"],
    ["Still, there's probably good ore down there.#$b#But a dark place, undisturbed for so long... I'm afraid ore isn't the only thing you'll find...", "তবু নিচে সম্ভবত ভালো আকরিক আছে।#$b#কিন্তু এত দিন ধরে অক্ষত থাকা অন্ধকার জায়গায়... আশঙ্কা হচ্ছে, শুধু আকরিকই পাবে না..."],
    ["Here, take this. You might need it.", "নাও, এটা রাখো। কাজে লাগতে পারে।"],
    ["Name's Marlon, by the way. I run the adventurer's guild right outside.#$b#I'll keep my eye on you. Prove yourself and I might think about making you a member.", "যাই হোক, আমার নাম মারলন। ঠিক বাইরে অভিযাত্রী সংঘ চালাই।#$b#তোমার ওপর নজর রাখব। নিজেকে প্রমাণ করতে পারলে তোমাকে সদস্য করার কথা ভাবতে পারি।"],
  ]],
  [13, [
    ["There you are... I was worried you didn't get my note.$6", "এই তো তুমি... ভয় হচ্ছিল আমার চিঠিটা পাওনি।$6"],
    ["It looks like we're alone.$8", "মনে হচ্ছে আমরা একা।$8"],
    ["The water feels so good after being out in the cold of night, doesn't it?$6", "রাতের ঠান্ডায় বাইরে থাকার পর জলটা কত আরামদায়ক লাগছে, তাই না?$6"],
    ["$q -1 null#Do you know why I asked you here tonight?$8#$r -1 0 event_pool1#You have something to tell me.#$r -1 0 event_pool2#I'm not exactly sure.#$r -1 0 event_pool3#You wanted to see me in my bathing suit.", "$q -1 null#জানো আজ রাতে তোমাকে এখানে ডেকেছি কেন?$8#$r -1 0 event_pool1#তুমি আমাকে কিছু বলতে চাও।#$r -1 0 event_pool2#ঠিক নিশ্চিত নই।#$r -1 0 event_pool3#তুমি আমাকে সাঁতারের পোশাকে দেখতে চেয়েছিলে।"],
    ["Um, how do I say this...$8", "উম্, কীভাবে বলি...$8"],
    ["I've been meaning to tell you for a while now... about how I feel.$8#$b#I can't stop thinking about you...$8#$b#I've never felt this way about anyone.$8", "কিছুদিন ধরেই তোমাকে বলতে চাইছি... আমার অনুভূতির কথা।$8#$b#তোমার কথা ভাবা থামাতে পারি না...$8#$b#কারও জন্য আগে কখনো এমন অনুভব করিনি।$8"],
    ["$q -1 null#...$8#$r -1 0 event_pool4#I feel the same way about you.#$r -1 -1500 event_pool5#Sorry, but I don't like you in that way...", "$q -1 null#...$8#$r -1 0 event_pool4#তোমার জন্য আমারও একই অনুভূতি।#$r -1 -1500 event_pool5#দুঃখিত, কিন্তু তোমাকে আমি সেভাবে পছন্দ করি না..."],
  ]],
  [14, [
    ["@?", "@?"],
    ["You scared me, sneaking into my room like that!", "এভাবে চুপিসারে আমার ঘরে ঢুকে ভয় পাইয়ে দিয়েছ!"],
    ["*sigh*... so I've been playing 'Journey of the Prairie King' for hours and I can't even beat the first level...$s#$b#This game is ridiculously hard!$a#$b#Well, either that or I'm just terrible at it.$s", "*দীর্ঘশ্বাস*... ঘণ্টার পর ঘণ্টা ‘জার্নি অব দ্য প্রেইরি কিং’ খেলছি, তবু প্রথম স্তরটাও পার হতে পারিনি...$s#$b#গেমটা হাস্যকর রকম কঠিন!$a#$b#অথবা আমিই ভীষণ খারাপ খেলি।$s"],
    ["Hey, do you want to try this level together with me? I think I might do better with your help.", "এই, আমার সঙ্গে মিলে এই স্তরটা চেষ্টা করবে? তোমার সাহায্য পেলে হয়তো ভালো করতে পারব।"],
    ["Ugh, I give up... I'll never get past the first level.$s#$b#Oh well... thanks for trying.", "উফ্, হাল ছেড়ে দিলাম... প্রথম স্তর কখনোই পার হতে পারব না।$s#$b#যাক... চেষ্টা করার জন্য ধন্যবাদ।"],
  ]],
]);

function replaceQuoted(source, pairs) {
  let out = source;
  for (const [from, to] of pairs) {
    const needle = `"${from}"`;
    if (!out.includes(needle)) throw new Error(`Missing quoted source: ${from}`);
    out = out.replaceAll(needle, `"${to}"`);
  }
  return out;
}

const records = input.records.map((record, index) => {
  let translation = quoteMaps.has(index) ? replaceQuoted(record.source, quoteMaps.get(index)) : record.source;
  if (index === 11) {
    const from = "#I just want to help.#Yep, I'm in it for the prizes.";
    const to = "#আমি শুধু সাহায্য করতে চাই।#হ্যাঁ, পুরস্কারের জন্যই করছি।";
    if (!translation.includes(from)) throw new Error(`Missing event text: ${from}`);
    translation = translation.replaceAll(from, to);
  }
  const result = { target: record.target, key: record.key, source: record.source, translation };
  if (index === 9) {
    result.reviewedPreserve = true;
    result.reason = "এটি সম্পূর্ণরূপে মরুভূমি উৎসবের মৃত্যুদৃশ্যের প্রযুক্তিগত কমান্ড-ক্রম; দৃশ্যমান সংলাপ নেই, তাই হুবহু রাখা হয়েছে।";
  }
  return result;
});

fs.writeFileSync(outputPath, `${JSON.stringify({ id: "399-sam-house-and-seed-shop", kind: "long", records })}\n`);
