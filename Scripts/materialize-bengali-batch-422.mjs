import { materializeDirectMultiTargetBatch } from "./lib/materialize-bengali-direct-batch.mjs";

const groups = {
  "Strings/EnchantmentNames": {
    Starburst: "তারাবিস্ফোরণ", Artful: "শিল্পীসুলভ", Haymaker: "খড়-সংগ্রাহক", "Bug Killer": "পোকা-ঘাতক", Vampiric: "রক্তচোষা", Crusader: "ধর্মযোদ্ধা", Powerful: "শক্তিশালী", Efficient: "সাশ্রয়ী", Swift: "দ্রুত", Expansive: "প্রসারী", Bottomless: "অতল", Shaving: "ছাঁটাই", Archaeologist: "প্রত্নতত্ত্ববিদ", Generous: "উদার", Master: "মাস্টার", "Auto-Hook": "স্বয়ংক্রিয় হুক", Preserving: "সংরক্ষণকারী", Fisher: "মৎস্যজীবী",
  },
  "Strings/Tools": {
    Axe_Name: "কুড়াল", FishingRod_Training_Name: "প্রশিক্ষণ ছিপ", FishingRod_Bamboo_Name: "বাঁশের ছিপ", FishingRod_Fiberglass_Name: "ফাইবারগ্লাস ছিপ", FishingRod_Iridium_Name: "ইরিডিয়াম ছিপ", FishingRod_AdvancedIridium_Name: "উন্নত ইরিডিয়াম ছিপ", Hoe_Name: "কোদাল", MilkPail_Name: "দুধের বালতি", Pan_Copper_Name: "তামার প্যান", Pan_Steel_Name: "ইস্পাতের প্যান", Pan_Gold_Name: "সোনার প্যান", Pan_Iridium_Name: "ইরিডিয়াম প্যান", Pickaxe_Name: "পিক্যাক্স", ReturnScepter_Name: "প্রত্যাবর্তন রাজদণ্ড", Shears_Name: "কাঁচি", TrashCan_Name: "আবর্জনার পাত্র", WateringCan_Name: "জলদানী",
  },
  "Strings/Weapons": {
    GalaxyDagger_Name: "গ্যালাক্সি ছোরা", GalaxyHammer_Name: "গ্যালাক্সি হাতুড়ি", GalaxySword_Name: "গ্যালাক্সি তলোয়ার", GoldenScythe_Name: "সোনালি কাস্তে", InfinityBlade_Name: "ইনফিনিটি তলোয়ার", InfinityDagger_Name: "ইনফিনিটি ছোরা", InfinityGavel_Name: "ইনফিনিটি হাতুড়ি", IridiumScythe_Name: "ইরিডিয়াম কাস্তে", Scythe_Name: "কাস্তে", Slingshot_Name: "গুলতি",
  },
  "Strings/Furniture": { Skeleton: "কঙ্কাল", JunimoHut: "জুনিমো কুঁড়েঘর", BulletinBoard: "বিজ্ঞপ্তি বোর্ড" },
  "Strings/Characters": { Relative_Husband: "স্বামী", Relative_Wife: "স্ত্রী" },
  "Strings/BundleNames": { "Spirit's Eve": "আত্মাদের সন্ধ্যা" },
  "Strings/Events": { HaveBabyAnswer_Yes: "হ্যাঁ" },
  "Strings/Movies": { Wumbus_Title: "ওয়াম্বাস" },
  "Strings/Pants": { Pants_Name: "প্যান্ট" },
  "Strings/Shirts": { Shirt_Name: "শার্ট" },
  "Strings/Lexicon": { QuestionDialogue_Yes: "হ্যাঁ", QuestionDialogue_No: "না", GenericPlayerTerm: "কৃষক" },
};

const entries = Object.entries(groups).flatMap(([target, values]) => Object.entries(values).map(([key, translation]) => ({ target, key, translation })));
entries.push({
  target: "Strings/Characters", key: "FallbackDialogueForError", translation: "...",
  reason: "এটি ত্রুটি-ফলব্যাকের ভাষা-নিরপেক্ষ নীরবতার এলিপসিস; কোনো অনুবাদযোগ্য শব্দ নেই, তাই হুবহু রাখা হয়েছে।",
});

materializeDirectMultiTargetBatch({ root: process.cwd(), id: "422-remaining-names-and-basic-labels", kind: "short", entries });
