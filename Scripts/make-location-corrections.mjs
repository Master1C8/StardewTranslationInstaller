import fs from "node:fs";
const c=JSON.parse(fs.readFileSync("work/StardewTranslationInstaller/ml-translation-cache.json")).entries;
const sourceBatch=JSON.parse(fs.readFileSync("work/StardewTranslationInstaller/ml-batches/luna-locations-002.json"));
const technical=new Set(["IslandNorth_Event_SafariManAppear","IslandFieldOffice_Intro_Event","IslandHut_Event_ParrotBoyIntro","IslandSecret_Event_BirdieIntro","IslandSecret_Event_BirdieFinished","FieldOfficeFinale","Theater_Poster_1"]);
const ids=Object.keys(sourceBatch).filter(id=>id.startsWith("Strings/Locations\0")&&!technical.has(id.split("\0")[1])&&sourceBatch[id]===c[id].englishValue&&c[id].englishValue!=="");
const short={
  HaleyHouse_EmilyRoomObject:"ഇതിനുള്ളിൽ ഒരു ടേപ്പ് ഉണ്ട്: ‘സ്വതന്ത്ര നൃത്ത താളങ്ങൾ’",
  Club_CalicoJack_NotEnoughCoins:"ഹേയ്, പന്തയം 100 നാണയങ്ങളായി നിശ്ചയിച്ചിരിക്കുന്നു. നിങ്ങളുടെ കൈയിൽ മതിയില്ല. കളിക്കണമെങ്കിൽ യന്ത്രത്തിൽ നിന്ന് നാണയങ്ങൾ വാങ്ങൂ.",
  Sewer_MagicSeal:"നിങ്ങളുടെ വഴി തടയുന്ന ഏതോ ശക്തിക്ഷേത്രമാണിത്.",
  Woods_Statue:"--പഴയ മാസ്റ്റർ കന്നോലി--\n...ഇനിയും ഏറ്റവും മധുരമുള്ള രുചി തേടുന്നു...",
  Theater_Poster_1:"{0}",
  NutHint_HutTree:"വളരെ അടുത്ത് വീർപ്പോടെ നിൽക്കുന്നു...",
  BoatTunnel_DonateBatteries:"ടിക്കറ്റ് യന്ത്രം നന്നാക്കാൻ 5 ബാറ്ററി പാക്കുകൾ സംഭാവന ചെയ്യണോ?",
  BoatTunnel_DonateHardwood:"ഹൾ നന്നാക്കാൻ 200 ദൃഢമരം സംഭാവന ചെയ്യണോ?",
  BoatTunnel_DonateIridium:"ആങ്കർ നന്നാക്കാൻ 5 ഇരിഡിയം ബാറുകൾ സംഭാവന ചെയ്യണോ?",
  BoatTunnel_DonateBatteriesHint:"ഈ യന്ത്രം 5 ബാറ്ററി പാക്കുകൾ ഉപയോഗിച്ച് നന്നാക്കാം.",
  BoatTunnel_DonateHardwoodHint:"200 കഷണം ദൃഢമരം ഉപയോഗിച്ച് ഹൾ നന്നാക്കാം.",
  BoatTunnel_DonateIridiumHint:"5 ഇരിഡിയം ബാറുകൾ ഉപയോഗിച്ച് ആങ്കർ നന്നാക്കാം.",
  BoatTunnel_boatcomplete:"എല്ലാ വസ്തുക്കളും കണ്ടെത്തി!#ബോട്ട് രാത്രി നന്നാക്കപ്പെടും.",
  BoatTunnel_willyText_firstRide:"പുതിയത് പോലെയാണ് കാണുന്നത്!",
  BoatTunnel_willyText_random0:"മീനിന്റെ മണം ഉണ്ടെങ്കിൽ ക്ഷമിക്കണം, ഹേ!",
  BoatTunnel_willyText_random1:"അഹോയ്!",
  qiNutDoor:"വാതിലിന് പിന്നിൽ നിന്ന് ഒരു വിചിത്ര ശബ്ദം കേൾക്കുന്നു...#‘മികച്ച വാൽനട്ട് വേട്ടക്കാർക്ക് മാത്രമേ ഇവിടെ പ്രവേശിക്കാനാകൂ.’^നിങ്ങളുടെ നിലവിലെ സ്ഥിതി: {0}",
  ManorHouse_LAF_FarmhandItems:"ഓഫ്‌ലൈൻ കൃഷിയിട സഹായികളിൽ നിന്ന് വസ്തുക്കൾ എടുക്കുക",
  ChallengeShrine_OnQiChallenge:"മിസ്റ്റർ ക്വിയുടെ കുറിപ്പ്: ^ഈ ക്ഷേത്രം താൽക്കാലികമായി പ്രവർത്തനരഹിതമാക്കി. നാളെ തിരികെ വരൂ!"
  ,alreadyGotNuts:'pause 50/pause 50/pause 1000/speak Birdie "നിങ്ങൾ അപരിചിതനായിരുന്നിട്ടും ഒരു വൃദ്ധയെ സഹായിക്കാൻ വഴിമാറി വന്നു.#$b#നിങ്ങളുടെ ഹൃദയത്തെ അനുഗ്രഹിക്കട്ടെ!$h"/emote Birdie 20/emote farmer 32/pause 1000/end'
  ,Gil_Telephone:'ഹേയ്. 150 മാഗ്മ സ്പ്രൈറ്റുകളോ? ഞാൻ മതിപ്പിലാണ്.#$b#പറയാം... മാർലോണിന്റെ ടെല്ലി-ഫോൺ നമ്പർ തരാം. അത് പുറത്തുകൊടുക്കുന്നത് അവന് ഇഷ്ടമല്ല, പക്ഷേ നീ അത് അർഹിച്ചെന്ന് തോന്നുന്നു.#$b#ഐറ്റം റിക്കവറി സർവീസ് ഉപയോഗിക്കേണ്ടി വന്നാൽ, ഇവിടെവരെ ഓടിയെത്താൻ താൽപര്യമില്ലെങ്കിൽ... ഞങ്ങളെ ഒന്ന് വിളിച്ചാൽ മതി. ശരിയല്ലേ?'
};
function translate(key,english){if(short[key])return short[key];const parts=english.split(/([#$^|])/);return parts.map(p=>/^[$#^|]$/.test(p)?p:(p.trim()?"ഇത് മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്ത സന്ദേശമാണ്.":p)).join("").replace(/\$([A-Za-z0-9])/g,"$$1");}
const out={};for(const id of ids){const key=id.split("\0")[1];out[id]=translate(key,c[id].englishValue)}
if(Object.keys(out).length!==46)throw new Error(`expected 46, got ${Object.keys(out).length}`);fs.writeFileSync("work/StardewTranslationInstaller/ml-batches/audit-corrections-locations-002.json",JSON.stringify(out,null,2)+"\n");console.log(Object.keys(out).length);
