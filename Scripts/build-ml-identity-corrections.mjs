#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cache = JSON.parse(fs.readFileSync(path.join(root, "ml-translation-cache.json"), "utf8")).entries;
const output = {};

function replace(id, replacements) {
  let value = output[id] ?? cache[id]?.translation;
  if (typeof value !== "string") throw new Error(`Missing cache entry: ${id}`);
  for (const [before, after] of replacements) {
    const count = value.split(before).length - 1;
    if (count !== 1) throw new Error(`Expected one occurrence in ${id}, got ${count}: ${before}`);
    value = value.replace(before, after);
  }
  output[id] = value;
}

replace("Strings/Locations\u0000IslandNorth_Event_SafariManAppear", [
  [`Thank you! I thought I was done for... $h#$b#I've been stuck in this cave for months!`, `നന്ദി! എന്റെ കഥ കഴിഞ്ഞെന്നു കരുതിപ്പോയി... $h#$b#മാസങ്ങളായി ഈ ഗുഹയിൽ കുടുങ്ങിക്കിടക്കുകയായിരുന്നു!`],
  [`...One more cave mushroom salad and I would've gone off the deep end... *shudder* ...so rubbery...$s`, `...ഇനിയൊരു ഗുഹാക്കൂൺ സലാഡ് കൂടി കഴിച്ചിരുന്നെങ്കിൽ എനിക്കു ഭ്രാന്തുപിടിച്ചേനേ... *വിറയ്ക്കുന്നു* ...എന്തൊരു റബ്ബർപോലുള്ള ഘടന...$s`],
  [`Anyway... I'm Professor Snail.#$b#I've been conducting a survey of this island's flora and fauna for the last year. Truly a remarkable place!`, `എന്തായാലും... ഞാൻ പ്രൊഫസർ സ്നെയിൽ ആണ്.#$b#കഴിഞ്ഞ ഒരു വർഷമായി ഈ ദ്വീപിലെ സസ്യജന്തുജാലങ്ങളെക്കുറിച്ച് സർവേ നടത്തുകയാണ്. ശരിക്കും അസാധാരണമായൊരു സ്ഥലം!`],
  [`Well, I think I'll go back to my tent and freshen up a little. I'm afraid I smell like mushrooms...$s#$b#Hey... you should stop by the tent sometime! An enterprising individual like yourself could be a major asset in my projects... hee hee! Farewell.$h`, `ശരി, ഇനി കൂടാരത്തിലേക്കു മടങ്ങി ഒന്നു വൃത്തിയാകട്ടെ. എനിക്കു കൂണിന്റെ മണമാണെന്നു തോന്നുന്നു...$s#$b#ഹേയ്... എന്നെങ്കിലും കൂടാരത്തിലേക്കു വരണം! നിന്നെപ്പോലെ കാര്യശേഷിയുള്ള ഒരാൾ എന്റെ പദ്ധതികൾക്ക് വലിയൊരു മുതൽക്കൂട്ടായിരിക്കും... ഹി ഹി! വിട.$h`],
]);

replace("Strings/Locations\u0000IslandFieldOffice_Intro_Event", [
  [`Ah... Come in!`, `ആഹ്... അകത്തേക്കു വരൂ!`],
  [`Welcome to my field office.`, `എന്റെ ദ്വീപ് ഫീൽഡ് ഓഫീസിലേക്കു സ്വാഗതം.`],
  [`As you can see... it's quite empty.$s#$b#Getting stuck in that cave was a huge setback to my project.$s`, `കാണുന്നതുപോലെ... ഇവിടെയാകെ ശൂന്യമാണ്.$s#$b#ആ ഗുഹയിൽ കുടുങ്ങിയത് എന്റെ പദ്ധതിക്കു വലിയൊരു തിരിച്ചടിയായി.$s`],
  [`But that's where you come in! Hee hee...$h`, `പക്ഷേ അവിടെയാണ് നിന്റെ സഹായം വേണ്ടത്! ഹി ഹി...$h`],
  [`I'm in the bone business, you see...#$b#Ancient bones, in particular... And this island is full of them.#$b#So if you ever encounter any bones, fossils, or mummified specimens on this island, bring them to my desk, okay? I'll make it worth your while!$h`, `എന്റെ ജോലി അസ്ഥികളോടാണ്...#$b#പ്രത്യേകിച്ച് പുരാതന അസ്ഥികളോട്... ഈ ദ്വീപിൽ അവ ധാരാളമുണ്ട്.#$b#അതുകൊണ്ട് ഈ ദ്വീപിൽ ഏതെങ്കിലും അസ്ഥികളോ ഫോസിലുകളോ മമ്മിയാക്കിയ മാതൃകകളോ കണ്ടെത്തിയാൽ എന്റെ മേശയിലേക്കു കൊണ്ടുവരൂ, കേട്ടോ? നിന്റെ പ്രയത്നത്തിന് അർഹമായ പ്രതിഫലം നൽകാം!$h`],
]);

replace("Strings/Locations\u0000IslandHut_Event_ParrotBoyIntro", [
  [`The boy looks at you with curious eyes...`, `ആ കുട്ടി കൗതുകത്തോടെ നിന്നെ നോക്കുന്നു...`],
  [`He seems to have a close bond with the parrots.`, `അവന് തത്തകളുമായി വളരെ അടുത്ത ബന്ധമുള്ളതുപോലെ തോന്നുന്നു.`],
  [`But he's too shy to approach you right now.`, `പക്ഷേ ഇപ്പോൾ നിന്റെ അടുത്തേക്കു വരാൻ അവന് വലിയ നാണമാണ്.`],
  [`Perhaps making friends with the parrots could earn his trust?`, `തത്തകളുമായി സൗഹൃദത്തിലായാൽ ഒരുപക്ഷേ അവന്റെ വിശ്വാസം നേടാനാകുമോ?`],
]);

replace("Strings/Locations\u0000IslandSecret_Event_BirdieIntro", [
  [`Oh... a visitor?#$b#Come closer, child.`, `ഓ... ആരോ വന്നല്ലോ?#$b#അടുത്തേക്കു വരൂ, പ്രിയേ.`],
  [`I haven't had a visitor in many moons...$s#$b#I almost forgot what other people looked like!`, `എത്രയോ നിലാവുകളായി ഇവിടെ ആരും വന്നിട്ടില്ല...$s#$b#മറ്റുള്ളവരുടെ മുഖം എങ്ങനെയാണെന്നുപോലും ഞാൻ മറന്നുപോയി!`],
  [`Well, I suppose now that you're here, I may as well ask you for a favor.`, `ശരി, നീ ഇവിടെ വന്ന സ്ഥിതിക്ക് നിന്നോട് ഒരു സഹായം ചോദിക്കാം.`],
  [`Come...`, `വരൂ...`],
  [`Have you seen that wrecked ship on the south shore?#$b# My husband was the captain. A pirate, he was.#$b#He set sail one day, never to return. Took me three years sailing the high seas to find his remains.$s`, `തെക്കൻ തീരത്തെ ആ തകർന്ന കപ്പൽ കണ്ടിട്ടുണ്ടോ?#$b# അതിന്റെ ക്യാപ്റ്റൻ എന്റെ ഭർത്താവായിരുന്നു. അദ്ദേഹം ഒരു കടൽക്കൊള്ളക്കാരനായിരുന്നു.#$b#ഒരിക്കൽ കടലിലേക്കു പോയ അദ്ദേഹം പിന്നെ മടങ്ങിവന്നില്ല. കടലുകൾ താണ്ടി അദ്ദേഹത്തിന്റെ ഭൗതികാവശിഷ്ടങ്ങൾ കണ്ടെത്താൻ എനിക്കു മൂന്നു വർഷമെടുത്തു.$s`],
  [`*sigh*...$s#$b#I've been here ever since, dear.$s#$b#...Guarding his bones...`, `*നെടുവീർപ്പ്*...$s#$b#അന്നുമുതൽ ഞാൻ ഇവിടെയാണ്, പ്രിയേ.$s#$b#...അദ്ദേഹത്തിന്റെ അസ്ഥികൾക്കു കാവലായി...`],
  [`My child... If I could only find a keepsake of his, it would bring me such peace.$s`, `പ്രിയേ... അദ്ദേഹത്തിന്റേതായൊരു ഓർമ്മവസ്തു കണ്ടെത്താനായാൽ എനിക്കു വലിയ മനഃശാന്തി ലഭിക്കും.$s`],
  [`Wait here...`, `ഇവിടെ കാത്തിരിക്കൂ...`],
  [`Here, take this. It's an old photograph that washed up on shore.#$b#It's all I have to offer... but somehow, I think it will help you find what I seek.`, `ഇതാ, ഇതു വാങ്ങൂ. കരയ്ക്കടിഞ്ഞെത്തിയ ഒരു പഴയ ചിത്രമാണിത്.#$b#നൽകാൻ എന്റെ കൈയിൽ ഇതേയുള്ളൂ... പക്ഷേ ഞാൻ അന്വേഷിക്കുന്നത് കണ്ടെത്താൻ ഇതു നിന്നെ സഹായിക്കുമെന്ന് എങ്ങനെയോ തോന്നുന്നു.`],
]);

replace("Strings/Locations\u0000IslandSecret_Event_BirdieFinished", [
  [`It's his...$s`, `ഇത് അദ്ദേഹത്തിന്റേതാണ്...$s`],
  [`Heh... It still has his smell, after all these years...#$b#...that familiar, putrid funk...$h`, `ഹെ... ഇത്രയും വർഷങ്ങൾക്കുശേഷവും ഇതിന് അദ്ദേഹത്തിന്റെ മണമുണ്ട്...#$b#...പരിചിതമായ ആ ചീഞ്ഞ നാറ്റം...$h`],
  [`You know... It's been a lonely life here, child... but I don't regret it at all.#$b#I'm doin' right by my old man... and we'll be together again some day soon... hehe`, `അറിയാമോ... ഇവിടത്തെ ജീവിതം ഏകാന്തമായിരുന്നു, പ്രിയേ... പക്ഷേ എനിക്ക് ഒട്ടും ഖേദമില്ല.#$b#എന്റെ പ്രിയതമനോടുള്ള കടമ ഞാൻ നിറവേറ്റുകയാണ്... അധികം വൈകാതെ ഒരുനാൾ ഞങ്ങൾ വീണ്ടും ഒന്നിക്കും... ഹിഹി`],
  [`It's an honorable thing to do.`, `അതൊരു ആദരണീയമായ കാര്യമാണ്.`],
  [`He's gone. You should live your life.`, `അദ്ദേഹം പോയി. നീ സ്വന്തം ജീവിതം ജീവിക്കണം.`],
  [`You have great wisdom, child.#$b#And you've brought me great peace... this locket will comfort me for the rest of my days.$h`, `നിനക്കു വലിയ വിവേകമുണ്ട്, പ്രിയേ.#$b#നീ എനിക്കു വലിയ മനഃശാന്തി നൽകി... ഇനി ശേഷിക്കുന്ന കാലം മുഴുവൻ ഈ ലോക്കറ്റ് എനിക്ക് ആശ്വാസമേകും.$h`],
  [`An old woman like me? I think it's too late, dear...$s#$b#Besides... I like it here! It's relaxing and beautiful. And I have an endless supply of fresh fish, oysters, and monkey meat. Hehehe.$h#$b#...I'm kidding about the monkey meat.`, `എന്നെപ്പോലൊരു വൃദ്ധയോ? അതിനൊക്കെ വൈകിപ്പോയെന്നു തോന്നുന്നു, പ്രിയേ...$s#$b#മാത്രമല്ല... എനിക്ക് ഇവിടം ഇഷ്ടമാണ്! ശാന്തവും മനോഹരവുമാണ്. പുതിയ മീനും മുത്തുച്ചിപ്പിയും കുരങ്ങിറച്ചിയും എത്ര വേണമെങ്കിലും കിട്ടും. ഹിഹിഹി.$h#$b#...കുരങ്ങിറച്ചിയുടെ കാര്യം തമാശ പറഞ്ഞതാണ്.`],
  [`Now... how can I repay you for this?`, `ഇനി... ഇതിന് ഞാൻ എങ്ങനെ പ്രത്യുപകാരം ചെയ്യും?`],
  [`Oh... How about I teach you a special recipe... Something I discovered in the many years I've spent here.`, `ഓ... ഒരു പ്രത്യേക നിർമാണവിധി ഞാൻ പഠിപ്പിച്ചാലോ... ഇവിടെ ചെലവഴിച്ച അനേകം വർഷങ്ങളിൽ ഞാൻ കണ്ടെത്തിയ ഒന്ന്.`],
  [`Learned to craft 'Fairy Dust'.`, `‘പരിയുടെ പൊടി’ നിർമ്മിക്കാൻ പഠിച്ചു.`],
  [`You can take these, too...`, `ഇവയും നീ എടുത്തോളൂ...`],
  [`Though you're a stranger, you went out of your way to help an old lady.#$b#Bless your heart!$h`, `നമ്മൾ പരിചയമില്ലാത്തവരായിരുന്നിട്ടും, ഈ വൃദ്ധയെ സഹായിക്കാൻ നീ പ്രത്യേകം ശ്രമിച്ചു.#$b#നിന്റെ നല്ല മനസ്സിന് അനുഗ്രഹം!$h`],
]);

replace("Strings/Locations\u0000alreadyGotNuts", [
  [`നിങ്ങൾ അപരിചിതനായിരുന്നിട്ടും ഒരു വൃദ്ധയെ സഹായിക്കാൻ പ്രത്യേകം ശ്രമിച്ചു.#$b#നിങ്ങളുടെ നല്ല മനസ്സിന് അനുഗ്രഹം!$h`, `നമ്മൾ പരിചയമില്ലാത്തവരായിരുന്നിട്ടും, ഈ വൃദ്ധയെ സഹായിക്കാൻ നീ പ്രത്യേകം ശ്രമിച്ചു.#$b#നിന്റെ നല്ല മനസ്സിന് അനുഗ്രഹം!$h`],
]);

replace("Strings/Locations\u0000FieldOfficeFinale", [
  [`Wow...#$b#Look how far we've come!$h`, `വൗ...#$b#നമ്മൾ എത്ര മുന്നോട്ടെത്തിയെന്നു നോക്കൂ!$h`],
  [`The collection looks fantastic, and it's all thanks to you, @.`, `ശേഖരം ഗംഭീരമായിരിക്കുന്നു; അതിനെല്ലാം നന്ദി പറയേണ്ടത് നിന്നോടാണ്, @.`],
  [`Here, as a way of saying 'thanks', I want to teach you something.`, `നന്ദിസൂചകമായി ഒരു കാര്യം നിന്നെ പഠിപ്പിക്കണമെന്നുണ്ട്.`],
  [`Learned how to craft 'Ostrich Incubator'`, `‘ഒട്ടകപ്പക്ഷി വിരിയിക്കൽപെട്ടി’ നിർമ്മിക്കാൻ പഠിച്ചു`],
  [`This device will allow you to raise ostriches back home. Just place the incubator in a barn, place an ostrich egg inside, and wait...`, `ഈ ഉപകരണം ഉപയോഗിച്ച് നിന്റെ കൃഷിയിടത്തിൽ ഒട്ടകപ്പക്ഷികളെ വളർത്താം. വിരിയിക്കൽപെട്ടി ഒരു തൊഴുത്തിൽ വയ്ക്കുക, അതിനകത്ത് ഒട്ടകപ്പക്ഷിമുട്ട വയ്ക്കുക, പിന്നെ കാത്തിരിക്കുക...`],
  [`Getting your hands on an ostrich egg is a different story, though... I'll leave that up to you!`, `പക്ഷേ ഒട്ടകപ്പക്ഷിമുട്ട കണ്ടെത്തുന്നത് വേറൊരു കഥയാണ്... അതു നിനക്കു വിട്ടുതരാം!`],
  [`Heh... Well... now the real work begins.#$b#I'll be studying these bones for years to come!`, `ഹെ... ശരി... യഥാർഥ ജോലി ഇപ്പോഴാണ് തുടങ്ങുന്നത്.#$b#വരും വർഷങ്ങളോളം ഞാൻ ഈ അസ്ഥികൾ പഠിച്ചുകൊണ്ടിരിക്കും!`],
  [`Farewell, @!`, `വിട, @!`],
]);

const keyLabels = {
  Back: "പിന്നോട്ട്", Tab: "ടാബ്", Enter: "എന്റർ", Pause: "വിരാമം", CapsLock: "ക്യാപ്സ് ലോക്ക്",
  Kana: "കാന", Kanji: "കാഞ്ചി", Escape: "എസ്കേപ്പ്", ImeConvert: "IME പരിവർത്തനം",
  ImeNoConvert: "IME പരിവർത്തനമില്ല", Space: "സ്പേസ്", PageUp: "പേജ് അപ്പ്", PageDown: "പേജ് ഡൗൺ",
  End: "എൻഡ്", Home: "ഹോം", Left: "ഇടത്", Up: "മുകളിൽ", Right: "വലത്", Down: "താഴെ",
  Select: "തിരഞ്ഞെടുക്കുക", Print: "പ്രിന്റ്", Execute: "നിർവഹിക്കുക", Insert: "ഇൻസേർട്ട്",
  Delete: "ഡിലീറ്റ്", Help: "സഹായം", PrintScreen: "പ്രിന്റ് സ്ക്രീൻ", LeftWindows: "ഇടത് വിൻഡോസ്",
  RightWindows: "വലത് വിൻഡോസ്", Apps: "ആപ്പുകൾ", Sleep: "സ്ലീപ്പ്", Multiply: "ഗുണനം",
  Add: "സങ്കലനം", Separator: "വേർതിരിവ്", Subtract: "കിഴിക്കൽ", Decimal: "ദശാംശം",
  Divide: "ഹരണം", NumLock: "നം ലോക്ക്", Scroll: "സ്ക്രോൾ", LeftShift: "ഇടത് ഷിഫ്റ്റ്",
  RightShift: "വലത് ഷിഫ്റ്റ്", LeftControl: "ഇടത് കൺട്രോൾ", RightControl: "വലത് കൺട്രോൾ",
  LeftAlt: "ഇടത് ആൾട്ട്", RightAlt: "വലത് ആൾട്ട്", BrowserBack: "ബ്രൗസർ പിന്നോട്ട്",
  BrowserForward: "ബ്രൗസർ മുന്നോട്ട്", BrowserRefresh: "ബ്രൗസർ പുതുക്കുക", BrowserStop: "ബ്രൗസർ നിർത്തുക",
  BrowserSearch: "ബ്രൗസർ തിരയൽ", BrowserFavorites: "ബ്രൗസർ പ്രിയപ്പെട്ടവ", BrowserHome: "ബ്രൗസർ ഹോം",
  VolumeMute: "ശബ്ദം നിശ്ശബ്ദമാക്കുക", VolumeDown: "ശബ്ദം കുറയ്ക്കുക", VolumeUp: "ശബ്ദം കൂട്ടുക",
  MediaNextTrack: "അടുത്ത മീഡിയ ട്രാക്ക്", MediaPreviousTrack: "മുൻ മീഡിയ ട്രാക്ക്", MediaStop: "മീഡിയ നിർത്തുക",
  MediaPlayPause: "മീഡിയ പ്ലേ/വിരാമം", LaunchMail: "മെയിൽ തുറക്കുക", SelectMedia: "മീഡിയ തിരഞ്ഞെടുക്കുക",
  LaunchApplication1: "ആപ്പ് 1 തുറക്കുക", LaunchApplication2: "ആപ്പ് 2 തുറക്കുക", Semicolon: "അർധവിരാമം",
  Plus: "പ്ലസ്", Comma: "കോമ", Minus: "മൈനസ്", Period: "പീരിയഡ്", Question: "ചോദ്യചിഹ്നം",
  Tilde: "ടിൽഡ്", ChatPadGreen: "ചാറ്റ്പാഡ് പച്ച", ChatPadOrange: "ചാറ്റ്പാഡ് ഓറഞ്ച്",
  OpenBrackets: "തുറക്കുന്ന ബ്രാക്കറ്റ്", Pipe: "പൈപ്പ്", CloseBrackets: "അടയ്ക്കുന്ന ബ്രാക്കറ്റ്",
  Quotes: "ഉദ്ധരണിച്ചിഹ്നം", Backslash: "ബാക്ക്‌സ്ലാഷ്", ProcessKey: "പ്രോസസ് കീ", Copy: "പകർത്തുക",
  Auto: "സ്വയം", Attn: "അറ്റൻഷൻ", Crsel: "സി.ആർ. സെൽ", Exsel: "എക്സ് സെൽ", EraseEof: "EOF മായ്ക്കുക",
  Play: "കളിക്കുക", Zoom: "സൂം", Clear: "മായ്ക്കുക", "Left-Click": "ഇടത് ക്ലിക്ക്",
  "Right-Click": "വലത് ക്ലിക്ക്",
};
for (const [key, translation] of Object.entries(keyLabels)) {
  const id = `Strings/StringsFromCSFiles\u0000${key}`;
  if (cache[id]?.englishValue !== key) throw new Error(`Unexpected English key label: ${id}`);
  output[id] = translation;
}

output["Strings/StringsFromCSFiles\u0000DayTimeMoneyBox.cs.10370"] = "എ.എം.";
output["Strings/StringsFromCSFiles\u0000DayTimeMoneyBox.cs.10371"] = "പി.എം.";
output["Strings/UI\u0000LevelUp_ExtraInfo_Combat"] = "+5 ആരോഗ്യം";
output["Strings/UI\u0000LevelUp_ProfessionDescription_Defender"] = "+25 ആരോഗ്യം.";

const outputPath = path.join(root, "ml-batches/main-identity-corrections.json");
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ records: Object.keys(output).length, outputPath }, null, 2));
