import { materializeDirectMultiTargetBatch } from "./lib/materialize-bengali-direct-batch.mjs";

const groups = {
  "Strings/1_6_Strings": {
    Accept: "গ্রহণ করুন", Decline: "প্রত্যাখ্যান করুন", Leave: "চলে যান", TroutDerby: "ট্রাউট ডার্বি", SquidFest: "স্কুইডফেস্ট", DesertFestival: "মরুভূমি উৎসব", DwarfStatue_source: "বামন রাজার মূর্তি", Bookseller: "বইবিক্রেতা", SkillName_0: "কৃষিকাজ", SkillName_1: "মাছ ধরা", SkillName_2: "বনজ সংগ্রহ", SkillName_3: "খনন", SkillName_4: "যুদ্ধ", Trinket: "ট্রিঙ্কেট",
  },
  "Strings/FarmAnimals": {
    DisplayType_Chicken_Blue: "নীল মুরগি", DisplayType_Chicken_Brown: "বাদামি মুরগি", DisplayType_Chicken_Golden: "সোনালি মুরগি", DisplayType_Chicken_White: "সাদা মুরগি", DisplayType_Chicken_Void: "ভয়েড মুরগি", DisplayType_Cow_Brown: "বাদামি গরু", DisplayType_Cow_White: "সাদা গরু", DisplayType_Dinosaur: "ডাইনোসর", DisplayType_Duck: "হাঁস", DisplayType_Goat: "ছাগল", DisplayType_Ostrich: "উটপাখি", DisplayType_Pig: "শূকর", DisplayType_Rabbit: "খরগোশ", DisplayType_Sheep: "ভেড়া",
  },
  "Strings/WorldMap": {
    GingerIsland_East_JungleHut: "জঙ্গলের কুঁড়েঘর", GingerIsland_North_DigSite: "খননস্থান", GingerIsland_North_Trader: "দ্বীপের ব্যবসায়ী", GingerIsland_North_Volcano: "আগ্নেয়গিরি", GingerIsland_South_Dock: "উইলির নৌকা", GingerIsland_South_Resort: "রিসোর্ট", GingerIsland_SouthEast_PirateCove: "জলদস্যু উপসাগর", GingerIsland_West_BirdieShack: "বার্ডির কুঁড়েঘর", GingerIsland_West_GourmandCave: "ভোজনরসিক ব্যাঙ", GingerIsland_West_House: "দ্বীপের খামারবাড়ি", GingerIsland_West_QiWalnutRoom: "কিউ-এর ওয়ালনাট রুম", GingerIsland_West_Shipwreck: "জাহাজের ধ্বংসাবশেষ", GingerIsland_West_TigerSlimeGrove: "টাইগার স্লাইম উপবন",
  },
  "Data/Festivals/FestivalDates": {
    spring13: "ডিম উৎসব", spring24: "ফুলের নাচ", summer11: "লুয়াউ", summer28: "জ্যোৎস্না জেলিদের নাচ", fall16: "স্টারডিউ ভ্যালি মেলা", fall27: "আত্মাদের সন্ধ্যা", winter8: "বরফ উৎসব", winter25: "শীতের তারার ভোজ",
  },
  "Data/Festivals/fall16": { name: "স্টারডিউ ভ্যালি মেলা" },
  "Data/Festivals/fall27": { name: "আত্মাদের সন্ধ্যা" },
  "Data/Festivals/spring13": { name: "ডিম উৎসব" },
  "Data/Festivals/spring24": { name: "ফুলের নাচ" },
  "Data/Festivals/summer11": { name: "লুয়াউ" },
  "Data/Festivals/winter8": { name: "বরফ উৎসব" },
  "Data/Festivals/winter25": { name: "শীতের তারার ভোজ" },
};

const entries = Object.entries(groups).flatMap(([target, values]) => Object.entries(values).map(([key, translation]) => ({ target, key, translation })));
entries.push({
  target: "Strings/1_6_Strings", key: "MakeOver_Sandy_1", translation: "...",
  reason: "এটি স্যান্ডির নীরব প্রতিক্রিয়ার ভাষা-নিরপেক্ষ এলিপসিস; কোনো অনুবাদযোগ্য শব্দ নেই, তাই হুবহু রাখা হয়েছে।",
});

materializeDirectMultiTargetBatch({ root: process.cwd(), id: "423-remaining-gameplay-names-and-festivals", kind: "short", entries });
