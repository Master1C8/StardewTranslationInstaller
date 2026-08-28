import { materializeDirectMultiTargetBatch } from "./lib/materialize-bengali-direct-batch.mjs";

const reason = "এটি চরিত্রের নীরব প্রতিক্রিয়ার ভাষা-নিরপেক্ষ এলিপসিস; আবেগ ও নিয়ন্ত্রণ-টোকেন অক্ষুণ্ণ রেখে হুবহু রাখা হয়েছে।";
const entries = [
  ["Characters/Dialogue/Emily", "dumped_Girls", "...$s"],
  ["Characters/Dialogue/Jas", "Wed", "...$u"],
  ["Characters/Dialogue/Krobus", "Fri", "..."],
  ["Characters/Dialogue/Krobus", "divorced", "..."],
  ["Characters/Dialogue/Maru", "event_robot4", "...$8#$b#@...$8"],
  ["Characters/Dialogue/Sam", "dumped_Guys", "...$a"],
  ...["spring", "summer", "fall", "winter"].flatMap((season) => [5, 12, 19, 26].map((day) => ["Characters/Dialogue/MarriageDialogueKrobus", `${season}_${day}`, "..."])),
].map(([target, key, translation]) => ({ target, key, translation, reason }));

materializeDirectMultiTargetBatch({ root: process.cwd(), id: "425-remaining-silent-dialogue", kind: "long", entries });
