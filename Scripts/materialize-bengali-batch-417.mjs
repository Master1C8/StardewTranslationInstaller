import { materializeDirectBatch } from "./lib/materialize-bengali-direct-batch.mjs";

const values = {
  Abigail: "অ্যাবিগেইল", Alex: "অ্যালেক্স", Bear: "ভালুক", Birdie: "বার্ডি", Bouncer: "প্রহরী", Caroline: "ক্যারোলিন", Clint: "ক্লিন্ট", Demetrius: "ডিমিট্রিয়াস", Dwarf: "বামন", Elliott: "এলিয়ট", Emily: "এমিলি", Evelyn: "এভলিন", George: "জর্জ", Gil: "গিল", Governor: "গভর্নর", Grandpa: "দাদু", Gunther: "গুন্থার", Gus: "গাস", Haley: "হেইলি", Harvey: "হার্ভি", Henchman: "অনুচর", Jas: "জ্যাস", Jodi: "জোডি", Kent: "কেন্ট", Krobus: "ক্রোবাস", Leah: "লিয়া", Leo: "লিও", Linus: "লিনাস", Marlon: "মারলন", Marnie: "মার্নি", Maru: "মারু", Morris: "মরিস", OldMariner: "বৃদ্ধ নাবিক", Pam: "প্যাম", Penny: "পেনি", Pierre: "পিয়ের", ProfessorSnail: "অধ্যাপক স্নেইল", Robin: "রবিন", Sam: "স্যাম", Sandy: "স্যান্ডি", Sebastian: "সেবাস্টিয়ান", Shane: "শেন", Vincent: "ভিনসেন্ট", Welwick: "ওয়েলউইক", Willy: "উইলি", Wizard: "জাদুকর", Fizz: "ফিজ",
};

materializeDirectBatch({ root: process.cwd(), id: "417-remaining-npc-names", kind: "short", target: "Strings/NPCNames", entries: Object.entries(values).map(([key, translation]) => ({ key, translation })) });
