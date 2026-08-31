#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const translationRoot = path.join(
  projectRoot,
  "Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/hindi",
);
const batchRoot = path.join(projectRoot, "Documentation/hindi-batches");

function listJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJSONFiles(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  });
}

const runtimeDocuments = new Map();
const runtimeIndex = new Map();
for (const file of listJSONFiles(translationRoot).sort()) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  runtimeDocuments.set(file, document);
  for (const change of document.Changes ?? []) {
    for (const key of Object.keys(change.Entries ?? {})) {
      const id = `${change.Target}\u0000${key}`;
      if (runtimeIndex.has(id)) throw new Error(`duplicate Hindi runtime record: ${id}`);
      runtimeIndex.set(id, { file, change, key });
    }
  }
}

const batchDocuments = new Map();
const batchIndex = new Map();
for (const file of listJSONFiles(batchRoot).sort()) {
  const document = JSON.parse(fs.readFileSync(file, "utf8"));
  batchDocuments.set(file, document);
  for (const record of document.records ?? []) {
    const id = `${record.target}\u0000${record.key}`;
    if (batchIndex.has(id)) throw new Error(`duplicate Hindi batch record: ${id}`);
    batchIndex.set(id, { file, record });
  }
}

if (runtimeIndex.size !== 14720 || batchIndex.size !== 14720) {
  throw new Error(`unexpected Hindi coverage: runtime=${runtimeIndex.size}, batches=${batchIndex.size}`);
}

const touchedRuntime = new Set();
const touchedBatches = new Set();
let replacements = 0;

function replaceText(value, from, to) {
  if (typeof value !== "string" || !value.includes(from)) return value;
  replacements += value.split(from).length - 1;
  return value.split(from).join(to);
}

function replaceEverywhere(from, to) {
  for (const { file, change, key } of runtimeIndex.values()) {
    const next = replaceText(change.Entries[key], from, to);
    if (next !== change.Entries[key]) {
      change.Entries[key] = next;
      touchedRuntime.add(file);
    }
  }
  for (const { file, record } of batchIndex.values()) {
    let changed = false;
    if (typeof record.translation === "string") {
      const next = replaceText(record.translation, from, to);
      changed = next !== record.translation;
      record.translation = next;
    }
    for (const replacement of record.replacements ?? []) {
      const next = replaceText(replacement[1], from, to);
      if (next !== replacement[1]) changed = true;
      replacement[1] = next;
    }
    if (changed) touchedBatches.add(file);
  }
}

function replaceRecord(target, key, from, to) {
  const id = `${target}\u0000${key}`;
  const runtime = runtimeIndex.get(id);
  const batch = batchIndex.get(id);
  if (!runtime || !batch) throw new Error(`missing Hindi record: ${target} :: ${key}`);

  const runtimeNext = replaceText(runtime.change.Entries[key], from, to);
  if (runtimeNext !== runtime.change.Entries[key]) {
    runtime.change.Entries[key] = runtimeNext;
    touchedRuntime.add(runtime.file);
  }

  let changed = false;
  if (typeof batch.record.translation === "string") {
    const next = replaceText(batch.record.translation, from, to);
    changed = next !== batch.record.translation;
    batch.record.translation = next;
  }
  for (const replacement of batch.record.replacements ?? []) {
    const next = replaceText(replacement[1], from, to);
    if (next !== replacement[1]) changed = true;
    replacement[1] = next;
  }
  if (changed) touchedBatches.add(batch.file);
}

// Canonical glossary spellings for characters, organizations, and places.
for (const [from, to] of [
  ["कैरोलिन", "कैरोलाइन"],
  ["एलियट", "इलियट"],
  ["हार्वे", "हार्वी"],
  ["लिआ", "लिया"],
  ["लिनस", "लायनस"],
  ["लाइनस", "लायनस"],
  ["विंसेंट", "विन्सेंट"],
  ["रैसमोडियस", "रास्मोडियस"],
  ["गन्थर", "गुंथर"],
  ["जोजा मार्ट", "जोजामार्ट"],
  ["ज़ूज़ू शहर", "ज़ूज़ू नगर"],
  ["रिसॉर्ट", "रिज़ॉर्ट"],
  ["फर्न द्वीपसमूह", "फ़र्न द्वीपसमूह"],
  ["फर्नगिल", "फ़र्नगिल"],
  ["गोटोरो", "गोतोरो"],
  ["गवर्नर", "राज्यपाल"],
  ["मेयर लुईस", "महापौर लुईस"],
  ["दादा जी", "दादाजी"],
  ["डायरी का फटा पन्ना", "दैनिकी का पन्ना"],
  ["स्लाइम अंडा-सेचक", "स्लाइम अंडा सेने की मशीन"],
  ["कैलिको मूर्ति", "कैलिको प्रतिमा"],
  ["गाने वाला पत्थर", "गाता पत्थर"],
  ["अबीगैल", "एबिगेल"],
  ["कैरोलीन", "कैरोलाइन"],
  ["आत्माओं की पूर्वसंध्या", "आत्माओं की संध्या"],
  ["साहसिक संघ", "साहसी संघ"],
  ["सुनहरे अखरोट", "स्वर्ण अखरोट"],
  ["ग्रैम्पलटन", "ग्राम्पलटन"],
  ["बस स्टॉप", "बस अड्डा"],
  ["स्नानागार", "स्नानगृह"],
  ["नख़लिस्तान", "मरूद्यान"],
  ["नखलिस्तान", "मरूद्यान"],
  ["मरुद्यान", "मरूद्यान"],
  ["हार्वी के क्लिनिक", "हार्वी के चिकित्सालय"],
  ["हार्वी का क्लिनिक", "हार्वी का चिकित्सालय"],
  ["जादूगर की मीनार", "जादूगर मीनार"],
  ["स्लाइम बाड़ा", "स्लाइम गृह"],
  ["मौसम की ख़बर", "मौसम का हाल"],
  ["मौसम का पूर्वानुमान", "मौसम का हाल"],
  ["चुड़ैल की झोंपड़ी", "चुड़ैल की कुटिया"],
  ["सामुदायिक उन्नयन", "समुदाय उन्नयन"],
  ["मछली पकड़ने की जानकारी", "मछली जानकारी"],
  ["भेजी गई वस्तुएँ", "भेजी वस्तुएँ"],
  ["ट्राउट डर्बी", "ट्राउट स्पर्धा"],
  ["मछली दुकान", "मछली की दुकान"],
  ["चटनी की रानी", "सॉस की रानी"],
  ["कारीगर वस्तुएँ", "कारीगरी उत्पाद"],
  ["वीरान जोजामार्ट", "परित्यक्त जोजामार्ट"],
  ["धरती के सहारे", "ज़मीन के सहारे"],
  ["ज़ंग लगी चाबी", "जंग लगी चाबी"],
  ["डीलक्स चीज़ प्रेस", "डीलक्स पनीर प्रेस"],
  ["तत्व युद्ध", "तत्त्व युद्ध"],
  ["स्थानीय सहकारी खेल", "स्थानीय सहयोगी खेल"],
  ["सीवर पाइप", "नाली पाइप"],
  ["ज्वार के तालाबों", "ज्वारीय कुंडों"],
  ["साइलो", "चारा-भंडार"],
  ["हरी बारिश", "हरी वर्षा"],
  ["ख़ास ऑर्डर", "विशेष आदेश"],
  ["पियरे की जनरल स्टोर", "पियरे की किराना दुकान"],
  ["खोई किताब", "खोई पुस्तक"],
  ["औज़ार सुधारने की लागत", "औज़ार उन्नयन की लागत"],
  ["सूचना-पट्ट", "सूचना पट्ट"],
]) replaceEverywhere(from, to);

function replacePatternEverywhere(expression, to) {
  for (const { file, change, key } of runtimeIndex.values()) {
    const old = change.Entries[key];
    const next = old.replace(expression, to);
    if (next !== old) {
      replacements += 1;
      change.Entries[key] = next;
      touchedRuntime.add(file);
    }
  }
  for (const { file, record } of batchIndex.values()) {
    let changed = false;
    if (typeof record.translation === "string") {
      const next = record.translation.replace(expression, to);
      changed = next !== record.translation;
      record.translation = next;
    }
    for (const replacement of record.replacements ?? []) {
      const next = replacement[1].replace(expression, to);
      if (next !== replacement[1]) changed = true;
      replacement[1] = next;
    }
    if (changed) {
      replacements += 1;
      touchedBatches.add(file);
    }
  }
}

// Canonical short names without touching longer words such as नेपाम, राजसी, or मरुस्थल.
replacePatternEverywhere(/(?<![\p{L}\p{M}])पाम(?![\p{L}\p{M}])/gu, "पैम");
replacePatternEverywhere(/(?<![\p{L}\p{M}])जस(?![\p{L}\p{M}])/gu, "जैस");
replacePatternEverywhere(/(?<![\p{L}\p{M}])मरु(?![\p{L}\p{M}])/gu, "मारू");

// Context-specific accuracy, naturalness, and repeated-item consistency.
for (const correction of [
  ["Strings/Objects", "BlueSlimeEgg_Description", "स्लाइम ऊष्मायित्र में सेया जा सकता है।", "इसे स्लाइम अंडा सेने की मशीन में सेया जा सकता है।"],
  ["Strings/StringsFromCSFiles", "Object.cs.12853", "पकवान", "खाना पकाना"],
  ["Strings/StringsFromCSFiles", "TitleMenu.cs.11740", "परिचय", "जानकारी"],
  ["Data/Events/Saloon", "3917590/n saloonSportsRoom/O Alex", "बड़ा दाँव!", "शानदार खेल!"],
  ["Strings/StringsFromCSFiles", "Dialogue.cs.709", "चीज़", "पनीर"],
  ["Strings/StringsFromCSFiles", "FarmComputer_PiecesHay", "सूखा चारा: {0}/{1}", "सूखी घास के टुकड़े: {0}/{1}"],
  ["Strings/Furniture", "SlothSkeletonL", "स्लॉथ कंकाल L", "स्लॉथ कंकाल—बायाँ हिस्सा"],
  ["Strings/Furniture", "SlothSkeletonM", "स्लॉथ कंकाल M", "स्लॉथ कंकाल—बीच का हिस्सा"],
  ["Strings/Furniture", "SlothSkeletonR", "स्लॉथ कंकाल R", "स्लॉथ कंकाल—दायाँ हिस्सा"],
  ["Strings/Objects", "TrimmedLuckyPurpleShorts_Name", "सुनहरी किनारी वाला भाग्यशाली बैंगनी निकर", "सुनहरी किनारी वाले भाग्यशाली बैंगनी शॉर्ट्स"],
  ["Strings/Objects", "TrimmedLuckyPurpleShorts_Description", "शानदार सुनहरी किनारी वाला बैंगनी रेशमी निकर...", "बैंगनी रेशमी शॉर्ट्स, जिन पर शानदार सुनहरी किनारी लगी है..."],
  ["Strings/Weapons", "PennysFryer_Name", "पैनी का तवा", "पेनी का तवा"],
  ["Strings/Weapons", "PennysFryer_Description", "पैनी का पसंदीदा तवा", "पेनी का पसंदीदा तवा"],
  ["Data/mail", "WillyTropicalFish", "यह ख़ास मछलीघर रखो", "यह ख़ास मछली टंकी रखो"],
  ["Data/SecretNotes", "1011", "दोनों अँगूठियाँ उतारकर भट्ठी में फेंक दीं", "दोनों अँगूठियाँ उतारकर जादुई भट्ठी में फेंक दीं"],
  ["Strings/UI", "ShippingBin_LastItem", "अंतिम भेजी गई वस्तु", "अंतिम भेजी वस्तु"],
  ["Strings/UI", "Carpenter_Demolish", "भवन गिराएँ", "इमारतें गिराएँ"],
  ["Strings/UI", "Carpenter_MoveBuildings", "भवन स्थानांतरित करें", "इमारतों का स्थान बदलें"],
  ["Strings/UI", "Carpenter_PaintBuildings", "भवन रंगें", "इमारतें रंगें"],
  ["Strings/Locations", "ScienceHouse_CarpenterMenu_Construct", "फ़ार्म की इमारतें बनवाएँ", "खेत इमारतें बनाएँ"],
  ["Strings/Locations", "ScienceHouse_CarpenterMenu_RenovateHouse", "घर में बदलाव करवाएँ", "घर सुधारें"],
  ["Strings/Locations", "Blacksmith_Clint_Geodes", "जियोड खुलवाएँ", "जियोड खोलें"],
  ["Strings/Locations", "AnimalShop_Marnie_Supplies", "सामान की दुकान", "सामग्री दुकान"],
  ["Strings/StringsFromCSFiles", "OptionsPage.cs.11236", "व्यापारी पात्र-चित्र दिखाएँ", "व्यापारियों के पात्र-चित्र दिखाएँ"],
  ["Strings/UI", "Options_ShowAdvancedCraftingInformation", "उन्नत वस्तु-निर्माण जानकारी दिखाएँ", "वस्तु-निर्माण की उन्नत जानकारी दिखाएँ"],
  ["Strings/UI", "Options_GamepadStyleMenus", "नियंत्रक शैली के पटल इस्तेमाल करें", "कंट्रोलर शैली मेनू इस्तेमाल करें"],
  ["Strings/StringsFromCSFiles", "Options_ToggleAnimalSounds", "पशुओं की आवाज़ें बंद करें", "पशु ध्वनि बंद करें"],
  ["Strings/StringsFromCSFiles", "OptionsPage.cs.11243", "ध्वनि की आवाज़", "ध्वनि प्रभावों की आवाज़"],
  ["Strings/UI", "mobile_options_toolbar_padding", "औज़ार-पट्टी का अंतर", "औज़ार-पट्टी अंतर"],
  ["Strings/UI", "mobile_options_menu_side_margin", "पटल का किनारी अंतर", "मेनू अंतर"],
  ["Strings/UI", "mobile_options_bigger_numbers", "संख्याओं के लिए बड़ा अक्षर आकार", "अंकों के लिए बड़ा फ़ॉन्ट"],
  ["Strings/UI", "mobile_options_auto_save", "स्वतः सहेजना", "स्वचालित सहेजना"],
  ["Strings/UI", "tutorialWant", "मार्गदर्शन संकेत चालू करें?", "प्रशिक्षण संकेत चालू करें?"],
  ["Strings/UI", "DisplayAdjustmentButton", "स्क्रीन का आकार बदलें", "स्क्रीन आकार समायोजित करें"],
  ["Strings/UI", "Character_SkipIntro", "भूमिका छोड़ें", "परिचय छोड़ें"],
  ["Strings/UI", "CoopMenu_JoinLANGame", "LAN खेल से जुड़ें...", "LAN खेल में जुड़ें..."],
  ["Strings/UI", "GameMenu_ServerInvite", "मित्र को बुलाएँ...", "मित्र बुलाएँ..."],
  ["Strings/UI", "GameMenu_ServerMode", "सर्वर अवस्था", "सर्वर मोड"],
  ["Strings/UI", "OptionsPage_FarmhandCreation", "नए पात्र बनाने की अनुमति दें", "नया पात्र निर्माण चालू करें"],
  ["Strings/UI", "OptionsPage_ShowReadyStatus", "रात्रि खिलाड़ी स्थिति सूची दिखाएँ", "रात्रि खिलाड़ी स्थिति दिखाएँ"],
  ["Characters/Dialogue/Lewis", "Tue2", "पिछली ऋतु की सूखी फ़सलें", "पिछली ऋतु की मरी फ़सलें"],
  ["Strings/UI", "AnimalQuery_Move", "निवास भवन बदलें", "रहने की इमारत बदलें"],
  ["Strings/BigCraftables", "SolarPanel_Name", "सौर पैनल", "सौर पटल"],
  ["Strings/BigCraftables", "BoneMill_Name", "हड्डी चक्की", "अस्थि चक्की"],
  ["Strings/BigCraftables", "GeodeCrusher_Name", "जियोड तोड़क", "जियोड क्रशर"],
  ["Data/TV/TipChannel", "221", "चैनल पुराने एपिसोड फिर दिखाना शुरू करेगा", "चैनल पुनर्प्रसारण शुरू करेगा"],

  // Preserve distinctions between neighboring item and reaction strings.
  ["Strings/Furniture", "SnowyRug", "बर्फ़ीला गलीचा", "बर्फ़ से ढका गलीचा"],
  ["Strings/StringsFromCSFiles", "Dialogue.cs.680", "चिपचिपा", "लिसलिसा"],
  ["Strings/Characters", "Saloon_goodEvent_0", "गोल!!", "स्कोर!!"],
  ["Data/Events/AnimalShop", "3910674/f Shane 1000", "ओह...", "अरे... यह क्या..."],
  ["Data/Events/FarmHouse", "3917626/f Harvey 3500/O Harvey/t 2000 2400/p Harvey/L", "लीजिए!", "लो, हो गया!"],

  // Keep player-directed dialogue natural for players of every gender.
  ["Characters/Dialogue/LeoMainland", "Mon", "जब तुम पहली बार आए थे तो मैं डर गया था", "तुम्हारे पहली बार आने पर मैं डर गया था"],
  ["Data/EngagementDialogue", "Penny1", "तुम भी मेरे लिए ऐसा ही महसूस करते हो", "तुम्हारे मन में भी मेरे लिए यही भावनाएँ हैं"],
  ["Data/EngagementDialogue", "Sebastian1", "जब तुम नगर आए थे", "जब नगर में तुम्हारा आगमन हुआ"],
  ["Data/EngagementDialogue", "Shane0", "तुम सच में मेरे जैसे इंसान से शादी करना चाहते हो", "तुम्हारा सच में मेरे जैसे इंसान से शादी करने का मन है"],
  ["Characters/Dialogue/Sandy", "AcceptGift_(O)StardropTea", "यक़ीन नहीं होता तुम इसे मुझे दे रहे हो!", "यक़ीन नहीं होता... यह मेरे लिए है!"],
  ["Characters/Dialogue/rainy", "Marnie", "तुम भीगे हुए लग रहे हो... बेचारे!", "तुम तो पानी-पानी हो... अरे, बुरा हाल है!"],
  ["Characters/Dialogue/Wizard", "Sat", "तुम एक शक्तिशाली जादुई क्षेत्र के ऊपर खड़े हो।", "तुम्हारे ठीक नीचे एक शक्तिशाली जादुई क्षेत्र है।"],
  ["Characters/Dialogue/Vincent", "Introduction", "मगर तुम ठीक लगते हो।", "मगर तुमसे कोई ख़तरा नहीं लगता।"],
  ["Characters/Dialogue/George", "MovieInvitation", "तुम मेरे जैसे बूढ़े खूसट के साथ फ़िल्म देखना चाहते हो?", "मेरे जैसे बूढ़े खूसट के साथ फ़िल्म देखने का मन है?"],
  ["Characters/Dialogue/George", "Mon6", "तुम मेरे जैसे बूढ़े से दोस्ती करना चाहते हो।", "तुम्हारा मेरे जैसे बूढ़े से दोस्ती करने का मन है।"],
  ["Characters/Dialogue/Gus", "Resort_Entering", "अच्छा हुआ तुम आ गए।", "तुम्हारा यहाँ आना अच्छा हुआ।"],
  ["Characters/Dialogue/Kent", "event_popcorn2", "तुम बिलकुल सही कह रहे हो", "तुम्हारी बात बिलकुल सही है"],
  ["Characters/Dialogue/Jodi", "AcceptGift_(O)StardropTea", "क्या तुम सच में इतनी क़ीमती चीज़ दे देना चाहते हो?", "क्या सच में इतनी क़ीमती चीज़ दे देने का मन है?"],
  ["Characters/Dialogue/Jodi", "Sat4", "तुम उस पुराने फ़ार्म को सुधारने की कोशिश कर रहे हो।", "तुमने उस पुराने फ़ार्म को सुधारने का बीड़ा उठाया है।"],
  ["Characters/Dialogue/Jas", "Mon", "क्या तुम मार्नी मौसी को ढूँढ़ रहे हो?", "क्या मार्नी मौसी की तलाश है?"],
  ["Characters/Dialogue/Marnie", "gotPet_memory_oneyear", "अब तक तुम दोनों बहुत क़रीब आ गए होगे!", "अब तक तुम दोनों में गहरा लगाव हो गया होगा!"],
  ["Characters/Dialogue/Marnie", "Saloon_Wed", "अच्छा हुआ तुम आ गए!", "तुम्हारा आना अच्छा हुआ!"],
  ["Characters/Dialogue/Clint", "AcceptGift_(O)StardropTea", "यह तुम... मुझे दे रहे हो?", "यह... मेरे लिए है?"],
  ["Characters/Dialogue/Clint", "mineArea_121", "तुम मरुस्थल की गुफ़ाओं में जा रहे हो, है न?", "मरुस्थल की गुफ़ाओं तक जाना हुआ है, है न?"],
  ["Characters/Dialogue/Caroline", "cropMatured_815", "मैंने देखा तुम अपने फ़ार्म पर चाय उगा रहे हो।", "मैंने देखा कि तुम्हारे फ़ार्म पर चाय उग रही है।"],
  ["Characters/Dialogue/Caroline", "dating_Abigail_memory_oneday", "तुम दोनों एक-दूसरे से मिल रहे हो।", "तुम दोनों के बीच प्रेम है।"],
  ["Characters/Dialogue/MarriageDialogueHaley", "Rainy_Day_4", "क्या तुम इस मौसम में बाहर जा रहे हो?", "क्या इस मौसम में बाहर जाने का इरादा है?"],
  ["Characters/Dialogue/MarriageDialogueHaley", "Rainy_Night_Haley", "बहुत ख़ुशी है तुम घर आ गए।", "तुम्हारे घर लौटने से बहुत ख़ुशी हुई।"],
  ["Characters/Dialogue/MarriageDialogueHaley", "Outdoor_Haley", "है न, प्यारे?", "है न, जान?"],
  ["Characters/Dialogue/MarriageDialogueHarvey", "Indoor_Night_0", "तुम बहुत थके हुए लग रहे हो, प्रिय।", "तुम्हारे चेहरे पर बहुत थकान दिख रही है, प्रिय।"],
  ["Characters/Dialogue/MarriageDialogueSam", "Indoor_Night_0", "तुम थके हुए लग रहे हो।", "लगता है आज बहुत थकान है।"],
  ["Characters/Dialogue/MarriageDialogueSam", "Indoor_Night_2", "इसीलिए तो तुम मुझे पसंद करते हो, है न?", "इसीलिए तो तुम्हें मैं पसंद हूँ, है न?"],
  ["Characters/Dialogue/MarriageDialogueSam", "Outdoor_4", "आज तुम बहुत अच्छे लग रहे हो", "आज तुम्हारा रूप कमाल है"],
  ["Characters/Dialogue/MarriageDialogueEmily", "Rainy_Day_4", "जब तुम पहली बार यहाँ आए थे, मैंने तुम्हारे बारे में सपना देखा था।", "जब यहाँ तुम्हारा नया जीवन शुरू हुआ, मैंने तुम्हारे बारे में सपना देखा था।"],
  ["Characters/Dialogue/MarriageDialogueEmily", "Rainy_Night_2", "तुम थोड़े भीगे हुए लग रहे हो।", "लगता है बारिश ने तुम्हें थोड़ा भिगो दिया है।"],
  ["Characters/Dialogue/MarriageDialogueShane", "Indoor_Night_3", "तुम मुझे मेरे असली रूप के लिए पसंद करते हो?", "तुम्हें मेरा असली रूप पसंद है?"],
  ["Characters/Dialogue/MarriageDialogueShane", "Neutral_4", "तुम चाहते हो मैं बर्तन साफ़ करूँ?", "तुम्हारा मतलब है कि मैं बर्तन साफ़ करूँ?"],
  ["Characters/Dialogue/MarriageDialogueShane", "Bad_6", "तुम मार्नी के बुरे दिनों जैसी लग रही हो।", "तुम्हारी बातें मार्नी के बुरे दिनों जैसी हैं।"],
  ["Characters/Dialogue/MarriageDialogueSebastian", "Good_1", "आज तुम बहुत अच्छे लग रहे हो।", "आज तुम पर नज़र ही नहीं ठहरती।"],
  ["Characters/Dialogue/MarriageDialogueSebastian", "Good_2", "पूरे दिन आँगन के कीचड़ में घूमने के बाद भी तुम हमेशा अच्छे लगते हो।", "आँगन के कीचड़ में पूरा दिन बिताने के बाद भी तुम्हारी चमक बनी रहती है।"],
  ["Characters/Dialogue/MarriageDialogueSebastian", "Bad_6", "तुम मेरे सौतेले पिता जैसी बातें कर रहे हो।", "तुम्हारी बातें मेरे सौतेले पिता जैसी हैं।"],
  ["Characters/Dialogue/MarriageDialogueAbigail", "Good_7", "तुम हमारे लिए जितनी मेहनत करते हो, मैं उसकी क़द्र करती हूँ।", "हमारे लिए तुम्हारी सारी मेहनत की मैं क़द्र करती हूँ।"],
  ["Characters/Dialogue/MarriageDialogueAbigail", "Bad_8", "इन दिनों तुम मेरे साथ बहुत ठंडे रहे हो", "इन दिनों तुम्हारे व्यवहार में मेरे लिए बड़ी बेरुख़ी रही है"],
  ["Characters/Dialogue/MarriageDialogueAbigail", "Bad_8", "दलदल की आत्मा जैसा व्यवहार कर रहे हो", "तुम्हारा व्यवहार दलदल की आत्मा जैसा है"],
  ["Characters/Dialogue/Pierre", "AcceptGift_(O)StardropTea", "यक़ीन नहीं होता तुम यह मुझे दे रहे हो।", "यक़ीन नहीं होता... यह मेरे लिए है।"],
  ["Characters/Dialogue/Demetrius", "firstVisit_Desert", "हाल ही में तुम कैलिको मरुस्थल गए थे।", "हाल ही में तुम्हारी यात्रा कैलिको मरुस्थल तक हुई।"],
  ["Characters/Dialogue/Demetrius", "winter_Fri4", "तो इन दिनों तुम क्या कर रहे हो?", "तो इन दिनों क्या चल रहा है?"],
  ["Data/NPCGiftTastes", "Caroline", "तुम मुझे बिगाड़ रहे हो!", "इतना लाड़-प्यार!"],
  ["Strings/Events", "HavePlayerBabyQuestion", "क्या तुम {0} के साथ बच्चा चाहते हो?", "क्या {0} के साथ बच्चा पैदा करने का मन है?"],
  ["Strings/Events", "HavePlayerBabyQuestion_Adoption", "क्या तुम {0} के साथ बच्चा गोद लेना चाहते हो?", "क्या {0} के साथ बच्चा गोद लेने का मन है?"],
  ["Strings/StringsFromCSFiles", "Event.cs.1306", "अगर तुम अपने नए जीवन का आनंद ले रहे हो तो", "अगर तुम्हें अपना नया जीवन अच्छा लग रहा है तो"],
  ["Strings/StringsFromCSFiles", "Event.cs.1306", "जब तैयार हो, मुझे फिर बुला सकते हो।", "जब मन तैयार हो, मुझे फिर बुला सकते हो।"],
  ["Strings/StringsFromCSFiles", "Event.cs.1315", "अगर तुम अपने नए जीवन का आनंद ले रहे हो तो", "अगर तुम्हें अपना नया जीवन अच्छा लग रहा है तो"],
  ["Strings/StringsFromCSFiles", "Event.cs.1823", "तुम दोनों गहरे मित्र लगते हो।", "तुम दोनों की मित्रता गहरी लगती है।"],
  ["Strings/StringsFromCSFiles", "Event.cs.1826", "लगता है तुम कई दिल तोड़कर जाओगे... जो तुम पर भरोसा करते हैं, क्या उनके साथ खेल रहे हो?", "लगता है कई दिल टूटने वाले हैं... तुम पर भरोसा रखने वालों के साथ यह खेल क्यों?"],
  ["Strings/StringsFromCSFiles", "Event.cs.1827", "तुम प्रसन्न लगते हो।", "तुम दोनों के चेहरों पर ख़ुशी है।"],
  ["Strings/StringsFromCSFiles", "Event.cs.1829", "तुम गंभीर लगते हो... मगर दुखी नहीं।", "माहौल गंभीर है... मगर उदासी नहीं।"],
  ["Strings/StringsFromCSFiles", "Event.cs.1843", "तुम किसी बात से बहुत प्रसन्न लगते हो।", "किसी बात से तुम्हें बहुत प्रसन्नता हो रही है।"],
  ["Strings/StringsFromCSFiles", "Event.cs.1847", "वहाँ तुम एक अद्भुत रत्न परख रहे हो!", "वहाँ तुम्हारे हाथ में एक अद्भुत रत्न है!"],
  ["Strings/StringsFromCSFiles", "Event.cs.1848", "तुम युद्ध कर रहे हो!", "तुम युद्ध के बीच हो!"],
  ["Strings/StringsFromCSFiles", "Event.cs.1848", "तुम उसका सामना करने को पूरी तरह तैयार लगते हो।", "मगर उसका सामना करने की पूरी तैयारी है।"],
  ["Data/ExtraDialogue", "SkullCavern_100_event_honorable", "इससे साबित होता है कि तुम सच्चे हो", "इससे तुम्हारी असली काबिलियत साबित होती है"],
  ["Data/ExtraDialogue", "SkullCavern_100_event_honorable", "तुम ख़ुद को चुनौती देने और सर्वोच्च मानक पर टिके रहने का महत्व समझते हो", "तुम्हें ख़ुद को चुनौती देने और सर्वोच्च मानक पर टिके रहने का महत्व मालूम है"],
  ["Data/ExtraDialogue", "SkullCavern_100_event_honorable", "तुम उदाहरण बनकर नेतृत्व करते हो।", "तुम्हारा उदाहरण दूसरों को राह दिखाता है।"],
  ["Characters/Dialogue/Abigail", "divorced", "तुम यहाँ क्या कर रहे हो?", "यहाँ क्या काम है?"],
  ["Characters/Dialogue/Abigail", "Mon8", "जब तुम पहली बार नगर आए थे", "नगर में तुम्हारे आगमन पर"],
  ["Characters/Dialogue/Abigail", "Mon8", "मुझे बहुत ख़ुशी है कि तुम यहाँ आए!", "मुझे तुम्हारे यहाँ आने की बहुत ख़ुशी है!"],
  ["Characters/Dialogue/Abigail", "Mon8", "कुछ देर साथ समय बिताना चाहोगे?", "कुछ देर साथ समय बिताने का मन है?"],
  ["Characters/Dialogue/Haley", "divorced_Emily", "कि तुम दोनों अब भी इसी छोटे-से नगर में रह रहे हो।", "तुम दोनों का अब भी इसी छोटे-से नगर में रहना थोड़ा अटपटा *ज़रूर* है।"],
  ["Characters/Dialogue/Haley", "divorced_Emily", "मगर यह थोड़ा अटपटा *ज़रूर* है तुम दोनों का", "मगर"],
  ["Characters/Dialogue/Sebastian", "Fri2", "तो काम न करते समय तुम क्या करते हो?", "तो काम से फ़ुर्सत मिले तो क्या करते हो?"],
  ["Characters/Dialogue/Sebastian", "summer_Thu", "अगर तुम यही पूछने वाले हो, तो मैं तैरने बिल्कुल नहीं जाना चाहता।", "अगर सवाल तैरने चलने का है, तो मैं बिल्कुल नहीं जाना चाहता।"],
  ["Characters/Dialogue/Sebastian", "summer_Thu", "तुम बस नमस्ते कहने रुके थे?", "बस नमस्ते कहने के लिए रुकना हुआ?"],
  ["Characters/Dialogue/Sebastian", "fall_Mon4", "शायद फ़ार्म पर तुम बहुत पैसा कमा रहे हो", "शायद फ़ार्म से तुम्हारी अच्छी कमाई हो रही है"],
  ["Characters/Dialogue/Emily", "Wed6", "हर दिन तुम अपनी नियति के मार्ग पर एक क़दम और आगे बढ़ रहे हो।", "हर दिन नियति के मार्ग पर तुम्हारा एक क़दम और बढ़ता है।"],
  ["Characters/Dialogue/Penny", "event_speaker_kids2", "मुझे ख़ुशी है कि तुम भी ऐसा ही महसूस करते हो।", "मुझे ख़ुशी है कि तुम्हारी भावना भी यही है।"],
  ["Data/Festivals/spring13", "Abigail_y2", "तुम मेरी माँ जैसे बोल रहे हो!", "तुम्हारी बात बिलकुल मेरी माँ जैसी है!"],
  ["Data/Events/Town", "choseToBeKnown_pennySpouse", "तुम यहाँ क्या कर रहे हो?", "यहाँ कैसे?"],
  ["Data/Events/Town", "3917586/e 3917585/O Shane/A shaneSaloon2", "तुम बस मेरा ख़याल रख रहे हो।", "तुम्हें बस मेरी चिंता है।"],
  ["Data/Events/IslandNorth", "6497421/e 6497423/f Leo 1000/w sunny/t 600 1800/Hl leoMoved", "तुम इसमें काफ़ी अच्छे हो रहे हो!", "इसमें तुम्हारी काबिलियत काफ़ी बढ़ गई है!"],
  ["Data/Events/Forest", "54/f Leah 2500/t 1100 1600/z winter/w sunny", "तुम यहाँ क्या कर रहे हो?", "यहाँ कैसे?"],
  ["Strings/Characters", "Henchman1", "तुम आगे जाना चाहते हो?", "आगे जाना है?"],
  ["Strings/Characters", "KrobusDarkTalisman", "तुम काफ़ी मज़बूत लगते हो", "तुममें काफ़ी दम लगता है"],
  ["Strings/Characters", "KrobusDarkTalisman_elsewhere", "तुम काफ़ी मज़बूत लगते हो", "तुममें काफ़ी दम लगता है"],
  ["Strings/Characters", "Divorced_bouquet", "क्या तुम मुझे और भी दुख पहुँचाना चाहते हो?", "क्या मुझे और भी दुख पहुँचाने का इरादा है?"],
  ["Strings/Characters", "MovieTheater_LeavePrompt", "क्या तुम सच में फ़िल्म देखे बिना सिनेमा से जाना चाहते हो?", "क्या सच में फ़िल्म देखे बिना सिनेमा से जाना पक्का है?"],
  ["Strings/Characters", "MovieInvite_Spouse_Sebastian", "तुम फ़िल्म देखने जाना चाहते हो?", "फ़िल्म देखने का मन है?"],
  ["Strings/Characters", "MovieInvite_Spouse_Shane", "तुम कोई शो देखना चाहते हो", "कोई शो देखने का मन है"],
  ["Strings/Objects", "TopazRing_Description", "इसे पहनकर तुम थोड़ा ज़्यादा सुरक्षित महसूस करते हो।", "इसे पहनने पर थोड़ा ज़्यादा सुरक्षित महसूस होता है।"],
  ["Strings/Objects", "TrapBobber_Description", "जब तुम मछली को भीतर नहीं खींच रहे होते", "जब मछली को भीतर खींचना बंद हो"],
  ["Strings/Objects", "WiltedBouquet_Description", "जो बताता है कि तुम किसी के साथ प्रेम संबंध ख़त्म करना चाहते हो।", "जो किसी के साथ प्रेम संबंध ख़त्म करने की इच्छा दिखाता है।"],
  ["Strings/UI", "NameChange_EasterEgg2", "मुझे लगा था तुम यह खेल ईमानदारी से जीतना चाहते हो?", "मुझे लगा था इस खेल को ईमानदारी से जीतने का इरादा था?"],
  ["Strings/1_6_Strings", "DesertFestival_Alex_marriage", "मरुस्थल की धूप में तुम बहुत प्यारे लग रहे हो", "मरुस्थल की धूप में तुम्हारी प्यारी-सी सूरत"],
  ["Strings/1_6_Strings", "CactusMan_Intro_1", "तुम ऐसे लगते हो जो मेरी पेशकश की क़द्र करेगा।", "लगता है मेरी पेशकश तुम्हें पसंद आएगी।"],
  ["Strings/1_6_Strings", "MakeOver_Emily_AlreadyStyled", "तुम शानदार दिख रहे हो!", "तुम पर यह रूप बहुत जँच रहा है!"],
  ["Strings/1_6_Strings", "MakeOver_Sandy_Done", "तुम दमक रहे हो!", "तुम्हारे चेहरे पर कितनी चमक है!"],
  ["Strings/1_6_Strings", "Fizz_Intro_1", "समझ रहे हो?", "मेरी बात समझ में आई?"],
  ["Strings/1_6_Strings", "Fizz_Intro_1", "सुना है तुम 'पूर्णता' पाना चाहते हो।", "सुना है तुम्हारा लक्ष्य 'पूर्णता' पाना है।"],
  ["Strings/1_6_Strings", "Fizz_Intro_1", "दिख रहा है तुम कितने तनाव में हो।", "तुम्हारा तनाव साफ़ दिख रहा है।"],
  ["Strings/1_6_Strings", "Fizz_Intro_1", "ये काग़ज़ देख रहे हो?", "ये काग़ज़ दिख रहे हैं?"],
  ["Strings/1_6_Strings", "Fizz_Intro_1", "क्या मैं ऐसा लगता हूँ जो तुमसे झूठ बोलेगा??", "क्या तुम्हें लगता है कि मैं तुमसे झूठ बोलूँगा??"],
  ["Strings/StringsFromMaps", "AnimalShop.20", "तुम मेरे कचरे के डिब्बे में क्यों देख रहे हो?", "मेरे कचरे के डिब्बे में यह ताक-झाँक क्यों?"],
  ["Strings/Locations", "Gourmand_InProgress", "देख रहा हूँ कि तुम मेरी चाही चीज़ उगा रहे हो।", "देख रहा हूँ कि तुम्हारे यहाँ मेरी चाही चीज़ उग रही है।"],
  ["Strings/StringsFromCSFiles", "Event.cs.1633", "तुम पुष्प नृत्य में मुझे अपना साथी बनाना चाहते हो?", "पुष्प नृत्य में मेरा साथ देने का मन है?"],
  ["Strings/StringsFromCSFiles", "Event.cs.1634", "तुम पुष्प नृत्य में मुझे अपना साथी बनाना चाहते हो?", "पुष्प नृत्य में मेरा साथ देने का मन है?"],
  ["Strings/StringsFromCSFiles", "Event.cs.1851", "किसी बात पर मुस्कुरा रहे हो।", "तुम्हारे चेहरे पर किसी बात की मुस्कान है।"],
  ["Strings/StringsFromCSFiles", "NPC.cs.4278", "मेरा जन्मदिन है और तुम मुझे यह दे रहे हो?", "मेरा जन्मदिन है और यह मेरे लिए?"],
  ["Strings/StringsFromCSFiles", "Event.cs.1851", "तुम कोई खेल खेल रहे हो और हार ही नहीं सकते!", "यह कोई ऐसा खेल है जिसमें तुम्हारी हार हो ही नहीं सकती!"],

  // Additional player-gender neutralization across direct NPC dialogue.
  ["Characters/Dialogue/Mister Qi", "Sun", "मेहनत करते रहो और शायद किसी दिन तुम भी मेरे जैसे बन जाओगे।", "मेहनत जारी रखो; शायद किसी दिन तुम्हारी जगह भी मेरी जैसी हो जाए।"],
  ["Characters/Dialogue/Dwarf", "Introduction", "एक इंसान के हिसाब से तुम खनन में काफ़ी अच्छे हो।", "एक इंसान के हिसाब से खनन में तुम्हारी काबिलियत काफ़ी अच्छी है।"],
  ["Characters/Dialogue/Dwarf", "mineArea_121", "एक इंसान के हिसाब से तुम खनन में काफ़ी अच्छे हो।", "एक इंसान के हिसाब से खनन में तुम्हारी काबिलियत काफ़ी अच्छी है।"],
  ["Characters/Dialogue/Sandy", "Mon", "अब तुम ढेर सारे बीज खरीदने आए हो", "अब ढेर सारे बीज खरीदने के लिए तुम यहाँ हो"],
  ["Characters/Dialogue/Sandy", "Thu4", "तुम राज़ रख सकते हो, है न?", "यह राज़ अपने तक रखना, ठीक है?"],
  ["Characters/Dialogue/rainy", "Sandy", "क्या इसीलिए तुम यहाँ आए हो?", "क्या इसी वजह से यहाँ आना हुआ?"],
  ["Characters/Dialogue/Wizard", "Tue8", "आशा है तुम अँधेरी कलाओं से खिलवाड़ नहीं कर रहे?", "आशा है अँधेरी कलाओं से कोई खिलवाड़ नहीं चल रहा?"],
  ["Characters/Dialogue/Gus", "Sat", "क्या तुम अच्छे रसोइए हो, @?", "क्या खाना पकाने में माहिर हो, @?"],
  ["Characters/Dialogue/Gus", "Sat", "तो तुम कई काम के पकवान बना सकते हो।", "तो कई काम के पकवान बनाए जा सकते हैं।"],
  ["Characters/Dialogue/Kent", "Thu", "क्या तुम मेरे बेटे के दोस्त हो?", "क्या मेरे बेटे से दोस्ती है?"],
  ["Characters/Dialogue/Kent", "Thu", "शायद तुम उसे मुझसे बेहतर जानते हो", "शायद उसके बारे में तुम्हें मुझसे ज़्यादा मालूम है"],
  ["Characters/Dialogue/Kent", "Sat", "अब तुम सच में इस समुदाय का हिस्सा बन गए हो।", "अब तुम सच में इस समुदाय का अभिन्न हिस्सा हो।"],
  ["Characters/Dialogue/Kent", "Sat8", "मुझे यक़ीन है तुम समझ सकते हो।", "मुझे यक़ीन है यह बात समझ में आती होगी।"],
  ["Characters/Dialogue/Marnie", "Introduction", "लुईस ने बताया कि तुम अभी-अभी आए हो।", "लुईस ने तुम्हारे अभी-अभी आने की बात बताई।"],
  ["Characters/Dialogue/Marnie", "dating_Shane_memory_oneweek", "मैं बहुत ख़ुश हूँ कि तुम यहाँ आए और तुम दोनों की इतनी अच्छी बनती है!", "तुम्हारे यहाँ आने और तुम दोनों की इतनी अच्छी बनने से मैं बहुत ख़ुश हूँ!"],
  ["Characters/Dialogue/Marnie", "Wed", "घास से चारा काटने के लिए तुम हँसिया इस्तेमाल कर सकते हो।", "हँसिए से घास काटकर चारा पाया जा सकता है।"],
  ["Characters/Dialogue/Marnie", "Wed", "या फिर मुझसे ख़रीद सकते हो", "या फिर मुझसे ख़रीद लो"],
  ["Characters/Dialogue/Marnie", "Sat", "क्या तुम मेरे घर के पश्चिम में उस अजीब मीनार में गए हो?", "क्या मेरे घर के पश्चिम में उस अजीब मीनार तक जाना हुआ है?"],
  ["Characters/Dialogue/Marnie", "Sun8", "मुझे भरोसा है कि तुम मेरे प्यारे पशुओं की अच्छी देखभाल करोगे।", "मेरे प्यारे पशुओं की अच्छी देखभाल के लिए तुम पर भरोसा है।"],
  ["Characters/Dialogue/Willy", "Mon4", "अगर मन लगा लो तो तुम एक दमदार मछुआरे बन सकते हो।", "मन लगाने पर मछली पकड़ने में बहुत आगे जाया जा सकता है।"],
  ["Characters/Dialogue/Clint", "mineArea_40", "तुम खदानों की गहरी तह तक पहुँच गए हो।", "खदानों की गहरी तह तक तुम्हारी पहुँच हो चुकी है।"],
  ["Characters/Dialogue/Clint", "Mon", "शर्त है तुम अंदाज़ा नहीं लगा सकते कि मेरे परदादा क्या थे", "शर्त है मेरे परदादा का पेशा क्या था, इसका अंदाज़ा लगाना मुश्किल होगा"],
  ["Characters/Dialogue/Clint", "Mon_rude", "तुम उसे बिलकुल दूसरे स्तर पर ले गए।", "तुम्हारी बात ने उसे बिलकुल दूसरे स्तर पर पहुँचा दिया।"],
  ["Characters/Dialogue/Clint", "Thu8", "क्या तुम उसके बारे में कुछ जानते हो?", "क्या उसके बारे में कुछ मालूम है?"],
  ["Characters/Dialogue/Evelyn", "Tue", "किसी दिन तुम दोनों अच्छे दोस्त बन सकते हो!", "किसी दिन तुम दोनों में गहरी दोस्ती हो सकती है!"],
  ["Characters/Dialogue/Evelyn", "winter_Sat8", "उम्मीद है तुम भी यहाँ कुछ समय रहोगे।", "उम्मीद है यहाँ कुछ समय और रहने का मन है।"],
  ["Characters/Dialogue/Caroline", "Introduction", "तुम नए किसान @ होगे।", "तो तुम ही नए किसान @ हो।"],
  ["Characters/Dialogue/Caroline", "AcceptGift_(O)16", "ओह, तुम जंगल से चीज़ें बटोर रहे थे!", "ओह, जंगल से बटोरी चीज़ें!"],
  ["Characters/Dialogue/Caroline", "GreenRain", "तुम यहाँ तक पहुँच गए हो तो यह बहुत ख़तरनाक नहीं होगी!", "तुम्हारा यहाँ तक सुरक्षित पहुँचना बताता है कि यह बहुत ख़तरनाक नहीं होगी!"],
  ["Characters/Dialogue/Caroline", "winter_Wed6", "मेरा अनुमान है कि तुम अपने फ़ार्म पर बेहद सफल रहोगे।", "मेरा अनुमान है कि फ़ार्म पर तुम्हें बेहद सफलता मिलेगी।"],
  ["Characters/Dialogue/MarriageDialogueAlex", "winter_7", "क्या तुम कल मछली पकड़ने की प्रतियोगिता में हिस्सा लोगे? मुझे लगता है तुम जीत सकते हो!", "क्या कल मछली पकड़ने की प्रतियोगिता में हिस्सा लेने का इरादा है? मुझे लगता है जीत तुम्हारी होगी!"],
  ["Characters/Dialogue/MarriageDialogueHaley", "Rainy_Night_0", "अच्छा हुआ तुम लौट आए।", "तुम्हारी वापसी से अच्छा लगा।"],
  ["Characters/Dialogue/MarriageDialogueHaley", "Rainy_Night_0", "क्या अब बत्तियाँ बुझाने वाले हो?", "क्या अब बत्तियाँ बुझाने का मन है?"],
  ["Characters/Dialogue/MarriageDialogueHaley", "Indoor_Day_2", "तुम थोड़ा खर्राटे ले रहे थे।", "रात को थोड़े खर्राटे सुनाई दे रहे थे।"],
  ["Characters/Dialogue/MarriageDialogueHarvey", "Rainy_Day_2", "तुम बहुत शांति से सो रहे थे।", "तुम्हारे चेहरे पर बड़ी शांति थी।"],
  ["Characters/Dialogue/MarriageDialogueHarvey", "Good_2", "जिस पल तुम यहाँ आए, मैं जान गया था", "यहाँ तुम्हारे आने के पल से ही मैं जान गया था"],
  ["Characters/Dialogue/MarriageDialoguePenny", "Good_2", "जिस पल तुम यहाँ आए, मैं जान गई थी", "यहाँ तुम्हारे आने के पल से ही मैं जान गई थी"],
  ["Characters/Dialogue/MarriageDialogueSam", "Rainy_Day_0", "चाहो तो तुम भी आराम कर सकते हो।", "चाहो तो तुम्हारे लिए भी आराम का समय है।"],
  ["Characters/Dialogue/MarriageDialogueElliott", "Indoor_Day_4", "तुम मेरे साथ ऐसा कभी नहीं करोगे, है न?", "मेरे साथ ऐसा कभी नहीं होगा, है न?"],
  ["Characters/Dialogue/MarriageDialogueElliott", "fall_26", "तो भी क्या तुम मुझसे प्यार करोगे?", "तो भी क्या तुम्हारा प्यार बना रहेगा?"],
  ["Characters/Dialogue/MarriageDialogueMaru", "Rainy_Night_0", "तुम नहीं चाहोगे कि उन पर पूरा ज़ंग लग जाए।", "उन पर पूरा जंग लगना तो अच्छा नहीं लगेगा।"],
  ["Characters/Dialogue/MarriageDialogueMaru", "Indoor_Day_2", "आख़िर तुम उठ गए!", "आख़िर नींद खुल गई!"],
  ["Characters/Dialogue/MarriageDialogueMaru", "Indoor_Day_4", "तुम अपने हाथ इतने मुलायम कैसे रखते हो?", "तुम्हारे हाथ इतने मुलायम कैसे रहते हैं?"],
  ["Characters/Dialogue/MarriageDialogueMaru", "Neutral_0", "वज़न बढ़ने पर भी तुम मुझे पसंद करोगे।", "वज़न बढ़ने पर भी तुम्हारा प्यार बना रहेगा।"],
  ["Characters/Dialogue/MarriageDialogueMaru", "winter_2", "तुम थोड़ी मछली पकड़ सकते हो या जंगल से चीज़ें बटोर सकते हो", "चाहो तो थोड़ी मछली पकड़ना या जंगल से चीज़ें बटोरना ठीक रहेगा"],
  ["Characters/Dialogue/MarriageDialogueMaru", "winter_2", "सावधान रहोगे।", "पूरी सावधानी रखोगे।"],
  ["Characters/Dialogue/MarriageDialogueMaru", "winter_2", "पूरी सावधानी रखोगे।", "पूरी सावधानी रखना।"],
  ["Characters/Dialogue/MarriageDialogueEmily", "Outdoor_4", "तुम आख़िर बिस्तर से कब लुढ़ककर बाहर आओगे!", "आख़िर बिस्तर से कब लुढ़ककर बाहर निकलने का मन होगा!"],
  ["Characters/Dialogue/MarriageDialogueEmily", "Outdoor_4", "तुम अच्छी नींद के हक़दार हो।", "अच्छी नींद पर तुम्हारा पूरा हक़ है।"],
  ["Characters/Dialogue/MarriageDialogueEmily", "Good_4", "क्या तुम महसूस नहीं कर सकते?", "क्या इसका एहसास नहीं हो रहा?"],
  ["Characters/Dialogue/MarriageDialogueEmily", "Neutral_0", "बूढ़ी होने और बाल फीके इस्पाती रंग के हो जाने पर भी तुम मुझे पसंद करोगे।", "मेरे बूढ़े होने और बाल फीके इस्पाती रंग के हो जाने पर भी तुम्हारा प्यार बना रहेगा।"],
  ["Characters/Dialogue/MarriageDialogueEmily", "fall_1", "क्या तुम यक़ीन कर सकते हो?", "क्या यक़ीन होता है?"],
  ["Characters/Dialogue/MarriageDialogueShane", "Outdoor_4", "तुम बच्चे की तरह सो रहे थे", "तुम्हारी नींद बच्चे जैसी गहरी थी"],
  ["Characters/Dialogue/MarriageDialogueShane", "Good_1", "तुम मुझसे कहीं ज़्यादा अच्छे दिखते हो", "तुम्हारा रूप मुझसे कहीं बेहतर है"],
  ["Characters/Dialogue/MarriageDialogueSebastian", "Indoor_Day_3", "तुम डरे हुए लग रहे थे, मगर मानना पड़ेगा... थोड़े प्यारे भी लग रहे थे।", "तुम्हारे चेहरे पर डर था, मगर मानना पड़ेगा... वह थोड़ा प्यारा भी लगा।"],
  ["Characters/Dialogue/MarriageDialogueAbigail", "Rainy_Night_2", "क्या तुम महसूस कर सकते हो?", "क्या इसका एहसास हो रहा है?"],
  ["Characters/Dialogue/MarriageDialogueAbigail", "Neutral_0", "बूढ़ी और झुर्रीदार होने पर भी तुम मुझे पसंद करोगे।", "मेरे बूढ़ी और झुर्रीदार होने पर भी तुम्हारा प्यार बना रहेगा।"],
  ["Characters/Dialogue/MarriageDialogueAbigail", "Neutral_7", "अगर तुम आत्माओं की दुनिया में चले गए", "अगर तुम्हारा सफ़र आत्माओं की दुनिया तक पहुँच जाए"],
  ["Characters/Dialogue/Linus", "AcceptGift_(O)774", "तुम अच्छे विद्यार्थी हो, @।", "तुम्हारी सीख कमाल की है, @।"],
  ["Characters/Dialogue/Linus", "Tue", "क्या तुम मेरा मज़ाक उड़ाने आए हो?", "क्या मेरा मज़ाक उड़ाने के लिए यहाँ आना हुआ है?"],
  ["Characters/Dialogue/Linus", "Tue4", "तुम जंगल में जीवित रहना सीख सकते हो।", "जंगल में जीवित रहना सीखा जा सकता है।"],
  ["Characters/Dialogue/Linus", "Fri4", "तुम पेड़ों से बहुत कुछ सीख सकते हो।", "पेड़ों से बहुत कुछ सीखने को मिलता है।"],
  ["Characters/Dialogue/Pierre", "cc_Complete", "तुम कल्पना भी नहीं कर सकते", "कल्पना भी नहीं की जा सकती"],
  ["Characters/Dialogue/Pierre", "Thu4", "तुम मेरे सबसे अच्छे ग्राहक हो!", "मेरे ग्राहकों में तुम्हारा पहला स्थान है!"],
  ["Characters/Dialogue/Pierre", "Event_naga1", "तुम मेरे शयनकक्ष में ताक-झाँक कर रहे थे!", "मेरे शयनकक्ष में तुम्हारी ताक-झाँक भी भूल जाऊँगा!"],
  ["Characters/Dialogue/Pierre", "Event_naga1", "...और मैं भूल जाऊँगा कि मेरे शयनकक्ष में तुम्हारी ताक-झाँक भी भूल जाऊँगा!", "...और मैं मेरे शयनकक्ष में तुम्हारी ताक-झाँक भी भूल जाऊँगा!"],
  ["Characters/Dialogue/Pierre", "Event_naga1", "...और मैं मेरे शयनकक्ष में", "...और अपने शयनकक्ष में"],
  ["Characters/Dialogue/Pierre", "Event_naga2", "तुम सच में मेरे साथ ऐसा करोगे? तुम बहुत बुरे हो।", "क्या सच में मेरे साथ ऐसा करने का इरादा है? यह बहुत बुरा है।"],
  ["Characters/Dialogue/Robin", "cc_Complete", "जिस पल तुम बस से उतरे थे, तभी जान गई थी", "बस से तुम्हारे उतरते ही जान गई थी"],
  ["Characters/Dialogue/Robin", "cc_Complete", "तुम्हारी नियति कस्बे का नायक बनना है!", "तुम्हारी नियति कस्बे का उद्धार करना है!"],
  ["Characters/Dialogue/Robin", "fall_Fri", "क्या तुम हमारे घर के पीछे रहने वाले जंगली आदमी से मिले हो?", "क्या हमारे घर के पीछे रहने वाले जंगली आदमी से मुलाक़ात हुई है?"],
  ["Characters/Dialogue/Demetrius", "dating_Maru", "मगर शायद तुम मुझे ग़लत साबित करोगे।", "मगर शायद मेरा अंदाज़ा ग़लत साबित हो।"],
  ["Characters/Dialogue/Demetrius", "reject_869", "तुम रख सकते हो।", "इसे रख लो।"],
  ["Characters/Dialogue/Demetrius", "summer_Fri", "अगर तुम और मारू दोस्त बन गए", "अगर मारू से दोस्ती हो जाए"],
  ["Characters/Dialogue/Abigail", "dating_Abigail_memory_oneday", "...तुम बड़े प्यारे हो।", "...तुम्हारी अदा प्यारी है।"],
  ["Characters/Dialogue/Abigail", "Event_Rain_2", "शायद तुम ही इस उदास वातावरण की क़द्र कर सकते हो।", "शायद इस उदास वातावरण की असली क़द्र तुम्हें ही है।"],
  ["Characters/Dialogue/Abigail", "Sun_30", "लगता है तुम और मैं एक ही बात सोच रहे हैं।", "लगता है हमारे विचार मिलते हैं।"],
  ["Characters/Dialogue/Haley", "summer_Sat", "तुम आख़िर सारा दिन करते क्या हो?", "आख़िर सारा दिन क्या काम रहता है?"],
  ["Characters/Dialogue/Sebastian", "Introduction", "तुम अभी यहाँ रहने आए हो, है न?", "तो यहाँ तुम्हारा नया ठिकाना है, है न?"],
  ["Characters/Dialogue/Sebastian", "summer_Fri6", "अच्छा हुआ तुम मिलने आए।", "तुम्हारा आना अच्छा लगा।"],
  ["Characters/Dialogue/Sebastian", "summer_Fri6", "इस गर्मी का सामना कैसे कर रहे हो?", "इस गर्मी में क्या हाल है?"],
  ["Characters/Dialogue/Maru", "Introduction", "क्या तुम वही नहीं जो अभी यहाँ रहने आए हो?", "क्या तुम्हारा ही अभी यहाँ आना हुआ है?"],
  ["Characters/Dialogue/Emily", "fall_Sun10", "तुम बहुत अच्छे इंसान हो, @!", "तुम बहुत नेकदिल हो, @!"],
  ["Characters/Dialogue/Penny", "event_speaker_kids4", "मुझे लगता है तुम अच्छे अभिभावक बनोगे।", "मुझे लगता है तुममें आदर्श अभिभावक बनने के सभी गुण हैं।"],
  ["Characters/Dialogue/Penny", "event_old1", "शायद तुम ठीक कहते हो", "शायद तुम्हारी बात सही है"],
  ["Characters/Dialogue/Penny", "event_old1", "जिसे बदल नहीं सकते", "जिसे बदलना संभव नहीं"],
  ["Characters/Dialogue/Harvey", "Sun6", "और तुम उसे ज़िंदा न रख पाओ", "और उसे ज़िंदा न रख पाना पड़े"],
  ["Characters/Dialogue/Marnie", "dating_Shane_memory_oneweek", "तुम्हारे यहाँ आने और तुम दोनों की इतनी अच्छी बनने से", "तुम्हारे यहाँ आने से और यह देखकर कि शेन के साथ तुम्हारी इतनी अच्छी बनती है,"],
  ["Characters/Dialogue/MarriageDialogueMaru", "winter_2", "खदान में जाओ तो मुझसे वादा करो कि पूरी सावधानी रखना।", "खदान में जाओ तो पूरी सावधानी का वादा करो।"],
  ["Characters/Dialogue/LeoMainland", "Thu", "ध्यान से सुनोगे, तो शायद वे तुम्हें कुछ बताएँ।", "ध्यान से सुनने पर शायद वे तुम्हें कुछ बताएँ।"],
  ["Characters/Dialogue/Mister Qi", "Mon", "मुझे लगता है कि तुम एक दिन सितारा बनोगे।", "मुझे लगता है कि एक दिन तुम्हारा सितारा चमकेगा।"],
  ["Characters/Dialogue/Mister Qi", "Tue", "मुझे पता था कि किसी दिन तुम यहाँ पहुँचोगे।", "मुझे पता था कि किसी दिन यहाँ तक पहुँचना होगा।"],
  ["Characters/Dialogue/Mister Qi", "Thu", "तुम अपने दोस्त श्री ची का राज़ रखोगे, है न?", "अपने दोस्त श्री ची की ख़ातिर यह राज़ अपने तक रखना, ठीक है?"],
  ["Characters/Dialogue/Sandy", "Wed", "तो क्या उसे बता दोगे कि मैंने 'नमस्ते' कहा है?", "तो क्या उसे मेरा 'नमस्ते' कह देना?"],
  ["Characters/Dialogue/Krobus", "Mon", "मेरा सामान देखना चाहोगे?", "मेरा सामान देखना है?"],
  ["Characters/Dialogue/Krobus", "Wed", "कुछ खरीदना चाहोगे?", "कुछ खरीदना है?"],
  ["Characters/Dialogue/Krobus", "Tue", "कुछ खरीदना चाहोगे?", "कुछ खरीदना है?"],
  ["Characters/Dialogue/rainy", "Demetrius", "गर्म रहना चाहते हो तो", "गर्म रहना हो तो"],
  ["Characters/Dialogue/rainy", "Wizard", "मुझे उम्मीद नहीं कि तुम समझोगे।", "मुझे उम्मीद नहीं कि मेरी बात समझ में आएगी।"],
  ["Characters/Dialogue/Wizard", "Thu", "उन्हें खोजना चाहते हो, तो", "उन्हें खोजना हो, तो"],
  ["Characters/Dialogue/George", "Thu10", "किसी दिन तुम मेरी बात समझोगे।", "किसी दिन मेरी बात समझ में आएगी।"],
  ["Characters/Dialogue/Gus", "divorced_twice", "लगता है अब तुम सैलून में ज़्यादा दिखोगे", "लगता है अब सैलून में तुम्हारी शक्ल ज़्यादा दिखेगी"],
  ["Characters/Dialogue/Willy", "Sun", "अच्छी गुणवत्ता की मछली पकड़ने की छड़ ख़रीदोगे तो डोरी पर चारा और टैकल लगा सकोगे।", "अच्छी गुणवत्ता की मछली पकड़ने की छड़ पर डोरी में चारा और टैकल लगाए जा सकेंगे।"],
  ["Characters/Dialogue/Evelyn", "Tue", "उन्हें अच्छे से जान लोगे तो", "उन्हें अच्छे से जानने पर"],
  ["Characters/Dialogue/Caroline", "winter_Tue", "क़िस्मत अच्छी हो तो कुछ जड़ें खोद सकते हो।", "क़िस्मत साथ दे तो कुछ जड़ें खोदी जा सकती हैं।"],
  ["Characters/Dialogue/Caroline", "winter_Tue", "मिली चीज़ें उपहार अथवा भोजन के रूप में इस्तेमाल कर सकते हो।", "मिली चीज़ों का उपहार अथवा भोजन के रूप में इस्तेमाल भी किया जा सकता है।"],
  ["Characters/Dialogue/Caroline", "Tue", "मिली चीज़ें उपहार अथवा भोजन के रूप में इस्तेमाल कर सकते हो।", "मिली चीज़ों का उपहार अथवा भोजन के रूप में इस्तेमाल भी किया जा सकता है।"],
  ["Characters/Dialogue/Caroline", "summer_Tue", "मिली चीज़ें उपहार अथवा भोजन के रूप में इस्तेमाल कर सकते हो।", "मिली चीज़ों का उपहार अथवा भोजन के रूप में इस्तेमाल भी किया जा सकता है।"],
  ["Data/TV/TipChannel", "71", "इन्हें हर जगह उगने वाले जंगली वृक्षों पर लगा सकते हो।", "इन्हें हर जगह उगने वाले जंगली वृक्षों पर लगाया जा सकता है।"],
  ["Data/TV/TipChannel", "155", "उसे कहीं भी छोड़ सकते हो और वह अपने आप घर वापस आ जाएगा।", "उसे कहीं भी छोड़ा जा सकता है और वह अपने आप घर वापस आ जाएगा।"],
  ["Characters/Dialogue/Robin", "structureBuilt_Stable_memory_oneweek", "तो क्या नए घोड़े पर कस्बे में घूमे हो?", "तो, नए घोड़े पर कस्बे की सवारी कैसी चल रही है?"],
  ["Strings/1_6_Strings", "DesertFestival_Maru_marriage", "मुझे पता है तुम बहुत अच्छा करोगे।", "मुझे पता है तुम्हारा प्रदर्शन शानदार रहेगा।"],
  ["Data/Festivals/winter25", "Sandy", "सुना है वहाँ घर पर बारिश हो रही है। क्या इसीलिए यहाँ आए हो?", "सुना है घर पर बारिश हो रही है। क्या यहाँ आने की वजह यही है?"],
  ["Characters/Dialogue/MarriageDialogueAlex", "summer_10", "क्या सोचा है लुआउ के सूप में क्या डालोगे?", "क्या सोचा है, लुआउ के सूप में क्या डालने का मन है?"],
  ["Characters/Dialogue/MarriageDialogueAlex", "summer_10", "रसोइए तो तुम हो!", "रसोई की बागडोर तुम्हारे हाथ में है!"],
  ["Characters/Dialogue/MarriageDialogueHaley", "Rainy_Day_1", "क्या तुम कभी भविष्य के बारे में सोचते हो, @?", "क्या कभी भविष्य का ख़याल आता है, @?"],
  ["Characters/Dialogue/MarriageDialogueHaley", "Indoor_Day_1", "मुझे पता है तुम अपने काम में व्यस्त रहते हो।", "मुझे पता है काम में बहुत व्यस्तता रहती है।"],
  ["Characters/Dialogue/MarriageDialogueHarvey", "spring_23", "क्या तुम कल त्योहार में मेरे साथ नाचोगे?", "क्या कल त्योहार में मेरे साथ नृत्य का मन है?"],
  ["Characters/Dialogue/MarriageDialogueHarvey", "summer_10", "क्या सोचा है लुआउ के सूप में क्या डालोगे?", "क्या सोचा है, लुआउ के सूप में क्या डालने का मन है?"],
  ["Characters/Dialogue/MarriageDialoguePenny", "winter_3", "मुझे भरोसा है तुम सही फ़ैसले लोगे।", "मुझे भरोसा है तुम्हारा फ़ैसला सही होगा।"],
  ["Characters/Dialogue/MarriageDialogueSam", "Good_1", "क्या तुम कभी उस रात के बारे में सोचते हो", "क्या कभी उस रात की याद आती है"],
  ["Characters/Dialogue/MarriageDialogueSam", "summer_10", "क्या सोचा है लुआउ के सूप में क्या डालोगे?", "क्या सोचा है, लुआउ के सूप में क्या डालने का मन है?"],
  ["Characters/Dialogue/MarriageDialogueMaru", "Rainy_Day_2", "उम्मीद है इसे किसी काम में ला सकोगे।", "उम्मीद है यह तुम्हारे काम आएगा।"],
  ["Characters/Dialogue/MarriageDialogueMaru", "Indoor_Day_1", "लगता है इसे किसी काम में ला सकोगे?", "लगता है यह तुम्हारे काम आएगा?"],
  ["Characters/Dialogue/MarriageDialogueSebastian", "summer_10", "क्या सोचा है लुआउ के सूप में क्या डालोगे?", "क्या सोचा है, लुआउ के सूप में क्या डालने का मन है?"],
  ["Characters/Dialogue/MarriageDialogueSebastian", "summer_10", "रसोइए तो तुम हो!", "रसोई की बागडोर तुम्हारे हाथ में है!"],
  ["Characters/Dialogue/MarriageDialogueSebastian", "winter_7", "क्या तुम कल मछली पकड़ने की प्रतियोगिता में हिस्सा लोगे?", "क्या कल मछली पकड़ने की प्रतियोगिता में हिस्सा लेने का इरादा है?"],
  ["Characters/Dialogue/MarriageDialogueAbigail", "Good_6", "बस वादा करो कि सावधान रहोगे।", "बस पूरी सावधानी का वादा करो।"],
  ["Characters/Dialogue/Linus", "winter_Mon4", "तुम साधारण चीज़ों का आनंद लेने लगोगे", "साधारण चीज़ों का असली आनंद मिलने लगेगा"],
  ["Characters/Dialogue/Linus", "winter_Wed4", "मुझे यक़ीन है तुम समझते हो", "मुझे यक़ीन है तुम्हें समझ आता है"],
  ["Characters/Dialogue/Pierre", "married", "उम्मीद है दोगुने बीज ख़रीदोगे", "उम्मीद है दोगुने बीजों की ख़रीद होगी"],
  ["Characters/Dialogue/Robin", "houseUpgrade_2", "अपने घर की सारी नई जगह का क्या करोगे?", "घर की सारी नई जगह के लिए क्या योजना है?"],
  ["Characters/Dialogue/Robin", "structureBuilt_Barn_memory_oneweek", "मुझे यक़ीन है उसमें बहुत ख़ुश पशु पालोगे!", "मुझे यक़ीन है उसमें बहुत ख़ुश पशुओं का पालन होगा!"],
  ["Characters/Dialogue/Robin", "Fri", "तुम मेरे बेटे सेबेस्टियन से मिले हो न?", "मेरे बेटे सेबेस्टियन से मुलाक़ात हुई है न?"],
  ["Characters/Dialogue/Robin", "Fri", "उसके साथ अच्छे रहोगे तो", "उसके साथ अच्छा व्यवहार हो तो"],
  ["Characters/Dialogue/Robin", "summer_Tue", "मुझे यक़ीन है नतीजे से ख़ुश होगे!", "मुझे यक़ीन है नतीजा पसंद आएगा!"],
  ["Characters/Dialogue/MarriageDialogue", "Bad_4", "क्या कभी सोचते हो कि", "क्या कभी ख़याल आता है कि"],
  ["Characters/Dialogue/Abigail", "Tue", "क्या चाहते हो?", "क्या चाहिए?"],
  ["Characters/Dialogue/Abigail", "Event_VideoGame_Yes", "मुझे यक़ीन है तुम यह स्तर आसानी से पार कर लोगे।", "मुझे यक़ीन है यह स्तर आसानी से पार हो जाएगा।"],
  ["Characters/Dialogue/Abigail", "Event_Grave1", "तो तुम समझते हो कि मैं यहाँ क्यों हूँ।", "तो मेरी बात समझ में आती है कि मैं यहाँ क्यों हूँ।"],
  ["Characters/Dialogue/Abigail", "spring_12", "तुम भी लोगे?", "क्या तुम्हारा भी इरादा है?"],
  ["Characters/Dialogue/Sebastian", "AcceptGift_(O)Book_Defense", "क्या कहना चाहते हो", "क्या कहना है"],
  ["Characters/Dialogue/Sebastian", "Fri2", "तो काम से फ़ुर्सत मिले तो क्या करते हो?", "तो काम से फ़ुर्सत में क्या करना पसंद है?"],
  ["Characters/Dialogue/Alex", "breakUp", "मुझे गिड़गिड़ाते हुए नहीं देखोगे।", "मुझसे गिड़गिड़ाने की उम्मीद मत रखना।"],
  ["Characters/Dialogue/Alex", "summer_Wed_01_old", "तो तुम कह सकोगे कि तुम मेरे पहले \"प्रशंसक\" थे।", "तो मेरे पहले \"प्रशंसक\" का दर्जा तुम्हें मिलेगा।"],
  ["Characters/Dialogue/Penny", "FlowerDance_Accept", "मगर आगे तुम चलोगे?", "मगर नेतृत्व तुम्हारा होगा?"],
  ["Characters/Dialogue/Penny", "Resort_Towel_2_Married", "ज़रा थोड़ा बाईं ओर खड़े हो जाओगे?", "ज़रा थोड़ा बाईं ओर होना?"],
  ["Characters/Dialogue/Penny", "winter_Thu", "बात करना चाहते हो?", "बात करनी है?"],

  // Final naturalness pass over earlier neutralizations.
  ["Characters/Dialogue/Abigail", "Event_Grave1", "देखा? तो मेरी बात समझ में आती है कि मैं यहाँ क्यों हूँ।", "देखा? अब समझ में आया कि मैं यहाँ क्यों हूँ।"],
  ["Characters/Dialogue/Penny", "Resort_Towel_2_Married", "सुनो, ज़रा थोड़ा बाईं ओर होना?", "सुनो जान, ज़रा बाईं ओर हो जाना?"],
  ["Characters/Dialogue/Sandy", "Wed", "तो क्या उसे मेरा 'नमस्ते' कह देना?", "तो उसे मेरा 'नमस्ते' कह देना, ठीक है?"],
  ["Characters/Dialogue/Willy", "Mon4", "मन लगाने पर मछली पकड़ने में बहुत आगे जाया जा सकता है।", "मन लगाने पर मछली पकड़ने में बड़ी महारत हासिल हो सकती है।"],
  ["Characters/Dialogue/Mister Qi", "Tue", "मुझे पता था कि किसी दिन यहाँ तक पहुँचना होगा।", "मुझे पता था कि किसी दिन तुम्हारी मंज़िल यही होगी।"],
  ["Characters/Dialogue/Mister Qi", "Sun", "शायद किसी दिन तुम्हारी जगह भी मेरी जैसी हो जाए।", "शायद किसी दिन तुम्हारा मुकाम भी मेरे जैसा हो।"],
  ["Characters/Dialogue/Abigail", "Event_Rain_2", "शायद इस उदास वातावरण की असली क़द्र तुम्हें ही है।", "शायद इस उदास वातावरण की असली क़द्र सिर्फ़ तुम्हें है।"],
  ["Characters/Dialogue/Harvey", "Sun6", "और उसे ज़िंदा न रख पाना पड़े", "और फिर उसकी जान न बचा पाओ"],
  ["Characters/Dialogue/MarriageDialogueMaru", "winter_2", "खदान में जाओ तो पूरी सावधानी का वादा करो।", "खदान में जाने पर पूरी सावधानी बरतने का वादा करो।"],
  ["Characters/Dialogue/MarriageDialogueEmily", "Outdoor_4", "मैं सोच रही थी आख़िर बिस्तर से कब लुढ़ककर बाहर निकलने का मन होगा!", "मैं सोच रही थी, आख़िर बिस्तर से बाहर निकलने का मन कब होगा!"],
  ["Characters/Dialogue/MarriageDialogueHarvey", "Good_2", "यहाँ तुम्हारे आने के पल से ही मैं जान गया था कि मेरे साथी तुम ही हो...", "यहाँ तुम्हारे आने के पल से ही मुझे लगा था कि हमारा साथ तय है..."],
  ["Characters/Dialogue/MarriageDialoguePenny", "Good_2", "यहाँ तुम्हारे आने के पल से ही मैं जान गई थी कि मेरे साथी तुम ही हो...", "यहाँ तुम्हारे आने के पल से ही मुझे लगा था कि हमारा साथ तय है..."],
  ["Characters/Dialogue/Marnie", "dating_Shane_memory_oneweek", "तुम्हारे यहाँ आने से और यह देखकर कि शेन के साथ तुम्हारी इतनी अच्छी बनती है, मैं बहुत ख़ुश हूँ!", "तुम्हारे यहाँ आने और शेन के साथ तुम्हारी इतनी अच्छी पटने से मैं बहुत ख़ुश हूँ!"],
  ["Characters/Dialogue/Marnie", "dating_Shane_memory_oneweek", "तुम्हारे यहाँ आने और शेन के साथ तुम्हारी इतनी अच्छी पटने से मैं बहुत ख़ुश हूँ!", "तुम्हारे यहाँ आने और शेन के साथ तुम्हारी इतनी अच्छी पटती देखकर मैं बहुत ख़ुश हूँ!"],
  ["Characters/Dialogue/Caroline", "dating_Abigail_memory_oneday", "एबी ने बताया कि तुम दोनों के बीच प्रेम है।", "एबी ने बताया कि तुम दोनों साथ हो।"],

  // Remove remaining masculine assumptions in player-facing prose.
  ["Data/NPCGiftTastes", "Caroline", "ओह, कितने प्यारे हो। धन्यवाद।", "ओह, कितनी प्यारी बात है। धन्यवाद।"],
  ["Data/NPCGiftTastes", "Abigail", "तुम सबसे अच्छे हो, @!", "तुम्हारा जवाब नहीं, @!"],
  ["Data/NPCGiftTastes", "Jodi", "ओह, तुम कितने प्यारे हो!", "ओह, कितनी प्यारी बात है!"],
  ["Data/NPCGiftTastes", "Gus", "ओह, कितने प्यारे हो। धन्यवाद।", "ओह, कितनी प्यारी बात है। धन्यवाद।"],
  ["Data/NPCGiftTastes", "Leo", "यह मुझे क्यों दे रहे हो? क्या चाहते हो मैं इसे तुम्हारे लिए गाड़ दूँ?", "यह मुझे क्यों दिया? क्या इसे तुम्हारे लिए गाड़ दूँ?"],
  ["Data/Quests", "12", "अब भट्ठी बन गई है, इसलिए कुछ धातु गला सकते हो।", "अब भट्ठी बन गई है, इसलिए कुछ धातु गलाना संभव है।"],
  ["Data/Quests", "15", "10 स्लाइम मार सके, तो साहसी संघ में अपनी जगह पाने के योग्य हो जाओगे।", "10 स्लाइम मारने पर साहसी संघ में तुम्हारी जगह पक्की हो जाएगी।"],
  ["Data/Quests", "16", "अब साहसी संघ में प्रवेश कर सकते हो।", "अब साहसी संघ के द्वार तुम्हारे लिए खुले हैं।"],
  ["Data/Quests", "17", "इसकी मदद से खोजे गए किसी भी लिफ़्ट-दरवाज़े पर तेज़ी से लौट सकते हो।", "इसकी मदद से खोजे गए किसी भी लिफ़्ट-दरवाज़े पर तेज़ी से लौटा जा सकता है।"],
  ["Data/Quests", "24", "गुंथर ने पूछा कि क्या तुम मिलने वाली नई कलाकृतियाँ या खनिज संग्रहालय को दान करोगे।", "गुंथर ने पूछा कि मिलने वाली नई कलाकृतियाँ या खनिज संग्रहालय को दान करने पर क्या विचार है।"],
  ["Data/Quests", "25", "हर व्यक्ति की अपनी पसंद जानो और जल्द ही लोकप्रिय हो जाओगे।", "हर व्यक्ति की अपनी पसंद जानो और जल्द ही लोकप्रियता मिल जाएगी।"],
  ["Data/Quests", "103", "हॉप्स और पीपा हो तो इसे ख़ुद बना सकते हो।", "हॉप्स और पीपा हो तो इसे ख़ुद भी बनाया जा सकता है।"],
  ["Data/Quests", "110", "ओह, मेरा पसंदीदा पत्थर! तुम कितने प्यारे हो!", "ओह, मेरा पसंदीदा पत्थर! कितनी प्यारी बात है!"],
  ["Data/Quests", "110", "ओह, यह क्लिंट की दुकान से लाए हो? ख़ैर, मुझे परवाह नहीं इसे कहाँ से लाए,", "ओह, यह क्लिंट की दुकान से मिला? ख़ैर, यह कहाँ से आया, इससे मुझे कोई फ़र्क़ नहीं,"],
  ["Data/Quests", "133", "हँसिए से अपनी घास काटकर जमा कर सकते हो", "हँसिए से अपनी घास काटकर जमा की जा सकती है"],
  ["Strings/Locations", "IslandFieldOffice_Intro_Event", "जैसा तुम देख सकते हो...", "जैसा कि साफ़ दिख रहा है..."],
  ["Strings/Locations", "IslandSecret_Event_BirdieIntro", "अच्छा, अब जब तुम आ ही गए हो तो", "अच्छा, अब तुम यहाँ हो, तो"],
  ["Strings/Locations", "IslandSecret_Event_BirdieFinished", "जानते हो... यहाँ जीवन", "पता है... यहाँ जीवन"],
  ["Strings/Locations", "IslandSecret_Event_BirdieFinished", "ये भी ले सकते हो...", "ये भी ले लो..."],
  ["Strings/Locations", "FieldOfficeFinale", "इस उपकरण से तुम घर पर शुतुरमुर्ग पाल सकोगे।", "इस उपकरण से घर पर शुतुरमुर्ग पाले जा सकते हैं।"],
  ["Data/Events/Saloon", "crying", "इस बार हमारी सहानुभूति का फ़ायदा नहीं उठा पाओगे!", "इस बार हमारी सहानुभूति का फ़ायदा उठाने की कोशिश नहीं चलेगी!"],
  ["Data/Events/Farm", "690006/n slimeHutchBuilt/H", "इसे स्लाइम अंडा सेने की मशीन में रखकर से सकते हो।", "इसे स्लाइम अंडा सेने की मशीन में रखकर सेया जा सकता है।"],
  ["Data/Events/FarmHouse", "3918603/e 3918602/O Sam/t 610 1700/A samJob3/p Sam/L", "जब चाहो सुन सकते हो।", "जब मन हो, इसे सुन लेना।"],
  ["Data/Events/Town", "2481135/f Alex 1000/t 900 1600", "शायद यहाँ केवल तुम ही मुझे समझते हो।", "शायद यहाँ केवल तुम्हें ही मेरी बात समझ आती है।"],
  ["Data/Events/Forest", "choseInternet", "अब कुछ सफलता मिली है तो मुझे वापस चाहते हो?", "अब कुछ सफलता मिली है तो मुझे वापस पाने की चाह है?"],
  ["Data/Events/Forest", "54/f Leah 2500/t 1100 1600/z winter/w sunny", "अब सफलता मिली तो मुझे वापस चाहते हो?", "अब सफलता मिली तो मुझे वापस पाने की चाह है?"],
  ["Data/Events/Town", "choseToBeKnown_pennySpouse", "जैसा कहोगे वैसा करूँगी...", "जैसा कहो, वैसा करूँगी..."],
  ["Data/Events/Forest", "181928/f Penny 2000/t 900 1600/w sunny/G !IS_PASSIVE_FESTIVAL_TODAY TroutDerby, !SEASON_DAY summer 17 summer 18 summer 19", "तुम ग्रामीण जीवन के बारे में सब जानते हो, है न?", "तुम्हें ग्रामीण जीवन के बारे में सब पता है, है न?"],
  ["Data/Events/WizardHouse", "112/n seenJunimoNote", "यदि तुम वन के साथ एक हो तो इस चर्मपत्र का सच्चा स्वरूप देखोगे।", "वन से एकात्म होने पर इस चर्मपत्र का सच्चा स्वरूप दिखाई देगा।"],
  ["Strings/schedules/Alex", "Sun.000_married", "चाहो तो हमारे साथ खेल देख सकते हो", "चाहो तो हमारे साथ खेल देख लेना"],
  ["Strings/schedules/Caroline", "fall_25.001", "तुम भी डॉक्टर से मिलने आए हो?", "तुम्हारी भी डॉक्टर से मुलाक़ात है?"],
  ["Strings/schedules/Harvey", "marriageJob.000", "चिकित्सालय में क्या कर रहे हो?", "चिकित्सालय कैसे आना हुआ?"],
  ["Strings/schedules/Harvey", "marriageJob.000", "अच्छा, बस मुझसे मिलने आए हो।", "अच्छा, बस मुझसे मिलने का मन था।"],
  ["Strings/schedules/Lewis", "winter_16.000", "जानते हो, मैंने इस बाज़ार से", "पता है, मैंने इस बाज़ार से"],
  ["Strings/schedules/Willy", "winter_16.000", "क्या तुम गहरे समुद्र वाली पनडुब्बी में गए हो?", "क्या गहरे समुद्र वाली पनडुब्बी की सवारी हुई?"],
  ["Strings/schedules/Evelyn", "2.001", "तुम यहाँ क्यों आए हो?", "यहाँ कैसे आना हुआ?"],
  ["Characters/Dialogue/Abigail", "Sat6", "इतनी दूर मुझसे मिलने आए हो?", "इतनी दूर मुझसे मिलने?"],
  ["Strings/schedules/Leah", "spring_16.000", "डॉक्टर से मिलने आए हो?", "डॉक्टर से मुलाक़ात है?"],

  // Player-neutral phrasing in tutorials, shops, item text, and daily dialogue.
  ["Strings/SimpleNonVillagerDialogues", "derby_contestent7", "भीड़ से दूर जाना चाहते हो?", "भीड़ से दूर कोई जगह चाहिए?"],
  ["Strings/SimpleNonVillagerDialogues", "winter_derby_contestent6", "इनाम पाने का मौक़ा चाहते हो, तो", "इनाम पर नज़र है, तो"],
  ["Strings/SimpleNonVillagerDialogues", "winter_derby_contestent8", "वैसे चाहो तो तुम यहाँ मछली पकड़ सकते हो।", "वैसे चाहो तो यहाँ मछली पकड़ लेना।"],
  ["Strings/Characters", "Phone_Ring_Pierre", "कैसे हो? अच्छे हो? यह अच्छी बात है।", "क्या हाल है? सब अच्छा? यह अच्छी बात है।"],
  ["Strings/Characters", "Phone_Ring_Pierre", "उम्मीद है तुम बहुत जल्द दुकान पर आओगे।", "उम्मीद है दुकान पर जल्द मुलाक़ात होगी।"],
  ["Characters/Dialogue/Dwarf", "firstVisit_IslandNorth", "जिंजर द्वीप के ज्वालामुखी में जाओगे, तो", "जिंजर द्वीप के ज्वालामुखी में जाने पर"],
  ["Data/TV/CookingChannel", "14", "मेरी मदद से तुम अपनी आँखों से देखे सबसे शानदार केक को बनाने की राह पर चल पड़ोगे।", "मेरी मदद से अपनी आँखों से देखे सबसे शानदार केक को बनाने की राह खुल जाएगी।"],
  ["Data/TV/CookingChannel", "21", "समझ न आया हो कि उनका क्या करोगे?", "समझ न आया हो कि उनका क्या किया जाए?"],
  ["Data/TV/CookingChannel", "23", "तुम इसकी गुप्त सामग्री का अनुमान कभी नहीं लगा पाओगे", "इसकी गुप्त सामग्री का अनुमान लगाना नामुमकिन है"],
  ["Data/TV/CookingChannel", "30", "मुझे यक़ीन है तुम कर लोगे। और अगर हुनर दिखाने का मन हो, तो केकड़ा जाल से ख़ुद भी एक पकड़ सकते हो!", "मुझे यक़ीन है लॉब्स्टर मिल जाएगा। और अगर हुनर दिखाने का मन हो, तो केकड़ा जाल से ख़ुद भी एक पकड़ लेना!"],
  ["Data/TV/CookingChannel", "30", "इसे तो ख़ुद राज्यपाल को भी परोस सकते हो।", "इसे तो ख़ुद राज्यपाल को भी परोसा जा सकता है।"],
  ["Data/TV/TipChannel", "36", "इसे ग्रीष्म और पतझड़ दोनों में उगा सकते हो।", "इसे ग्रीष्म और पतझड़ दोनों में उगाया जा सकता है।"],
  ["Data/TV/TipChannel", "39", "अपने स्थानीय समुद्र तट को छानकर अच्छी कमाई कर सकते हो।", "अपने स्थानीय समुद्र तट को छानने पर अच्छी कमाई हो सकती है।"],
  ["Data/TV/TipChannel", "46", "अगर बिजली की छड़ बनाना जानते हो, तो बिजली इकट्ठा करके बैटरी पैक बना सकते हो।", "अगर बिजली की छड़ बनानी आती हो, तो बिजली इकट्ठा करके बैटरी पैक बनाए जा सकते हैं।"],
  ["Data/TV/TipChannel", "57", "उन बीजों को दोबारा लगा सकते हो या बेच सकते हो।", "उन बीजों को दोबारा लगाया या बेचा जा सकता है।"],
  ["Data/TV/TipChannel", "92", "उसे ज़मीन में लगा सकते हो और नया वृक्ष उगेगा।", "उसे ज़मीन में लगाने पर नया वृक्ष उगेगा।"],
  ["Data/TV/TipChannel", "102", "अगर सच में किसी को ख़ुश करना चाहते हो, तो", "अगर सच में किसी को ख़ुश करना हो, तो"],
  ["Data/TV/TipChannel", "106", "मगर उस जगह खोदोगे तो हमेशा कुछ न कुछ मिलेगा।", "मगर उस जगह खोदने पर हमेशा कुछ न कुछ मिलेगा।"],
  ["Data/TV/TipChannel", "134", "कटार से बेहद तेज़ तीन-वार वाला हमला कर सकते हो!", "कटार से बेहद तेज़ तीन-वार वाला हमला किया जा सकता है!"],
  ["Data/TV/TipChannel", "193", "एक परंपरा जिसके बारे में शायद तुम न जानते हो", "एक परंपरा जिसकी शायद जानकारी न हो"],
  ["Characters/Dialogue/Sandy", "Wed10", "मुझे लगने लगा था कि तुम कभी वापस नहीं आओगे!", "मुझे लगने लगा था कि अब वापसी नहीं होगी!"],
  ["Characters/Dialogue/Krobus", "Wed6", "तो यहाँ नीचे से किसी भी घर की आवाज़ सुन सकते हो।", "तो यहाँ नीचे से किसी भी घर की आवाज़ सुनाई देती है।"],
  ["Characters/Dialogue/Jas", "Tue6", "चाहो तो मेरी गुड़ियों से खेल सकते हो।", "चाहो तो मेरी गुड़ियों से खेल लेना।"],
  ["Characters/Dialogue/Clint", "Wed6", "या बस मिलने आए हो?", "या बस मिलने का मन था?"],
  ["Characters/Dialogue/Evelyn", "Introduction", "चाहो तो मुझे 'दादी' बुला सकते हो।", "चाहो तो मुझे 'दादी' बुला लेना।"],
  ["Characters/Dialogue/Evelyn", "summer_Sat", "धूप में जल सकते हो!", "धूप से त्वचा जल सकती है!"],
  ["Characters/Dialogue/Caroline", "Resort", "यहाँ आराम करने आए हो या काम करने?", "यहाँ आराम का इरादा है या काम का?"],
  ["Characters/Dialogue/Caroline", "fall_Tue", "मिली चीज़ें उपहार अथवा भोजन के रूप में इस्तेमाल कर सकते हो।", "मिली चीज़ों का उपहार अथवा भोजन के रूप में इस्तेमाल भी किया जा सकता है।"],
  ["Characters/Dialogue/MarriageDialogueSebastian", "Indoor_Night_3", "ध्यान लगाए रखो तो अक्सर उन्हें फड़फड़ाते हुए पकड़ सकते हो।", "ध्यान लगाए रखो तो अक्सर वे फड़फड़ाते हुए दिख जाते हैं।"],
  ["Characters/Dialogue/MarriageDialogueAbigail", "Rainy_Day_2", "लगता है इससे बेहतर कुछ ढूँढ़ सकते हो?", "क्या लगता है, इससे बेहतर कुछ मिल सकता है?"],
  ["Characters/Dialogue/Linus", "Wed6", "तो अस्तित्व के नए स्तर पर पहुँच जाओगे।", "तो अस्तित्व का नया स्तर खुल सकता है।"],
  ["Characters/Dialogue/Pierre", "Mon", "बीज चाहिए तो सही जगह आए हो!", "बीज चाहिए तो यही सही जगह है!"],
  ["Characters/Dialogue/Pierre", "Wed", "कोई जंगली उपज मिले तो उचित क़ीमत पर मुझसे बेच सकते हो।", "कोई जंगली उपज मिले तो मैं उचित क़ीमत दूँगा।"],
  ["Characters/Dialogue/Pierre", "Sat", "कोई जंगली उपज मिले तो उचित क़ीमत पर मुझसे बेच सकते हो।", "कोई जंगली उपज मिले तो मैं उचित क़ीमत दूँगा।"],
  ["Characters/Dialogue/Demetrius", "GreenRain", "तो क्या उसे बता सकते हो कि मैं ठीक हूँ?", "तो उसे बता देना कि मैं ठीक हूँ।"],
  ["Characters/Dialogue/Demetrius", "Resort", "क्या इस जगह पर यक़ीन कर सकते हो?", "क्या इस जगह पर यक़ीन होता है?"],
  ["Data/Quests", "133", "और उससे पशुओं को खिला सकते हो।", "और उससे पशुओं को खिलाया जा सकता है।"],
  ["Characters/Dialogue/Abigail", "summer_Sun", "कहाँ जाओगे?", "कहाँ जाना है?"],
  ["Characters/Dialogue/Abigail", "Sun_25", "मुझे लगता है इससे जल्दी ऊब जाओगे।", "मुझे लगता है यह जल्दी उबाऊ लगने लगेगा।"],
  ["Characters/Dialogue/Sebastian", "Thu6", "क्या मेरे जैसे इंसान को फ़ार्म पर रहते हुए सोच सकते हो?", "फ़ार्म पर मेरे जैसे इंसान का रहना सोचकर कैसा लगता है?"],
  ["Characters/Dialogue/Sebastian", "Thu8", "क्या मुझे फ़ार्म पर रहते हुए सोच सकते हो?", "फ़ार्म पर मेरा रहना सोचकर कैसा लगता है?"],
  ["Characters/Dialogue/Pam", "structureBuilt_Fish Pond", "उसमें लगभग कुछ भी पाल सकते हो", "उसमें लगभग कुछ भी पाला जा सकता है"],
  ["Strings/Characters", "MovieInvite_InvitedBySomeoneElse", "शायद तुम भी वहाँ हमारे साथ आ सकते हो?", "शायद तुम भी वहाँ हमारे साथ आना चाहो?"],
  ["Strings/Characters", "MovieTheater_WatchAlonePrompt", "क्या तुम अकेले फ़िल्म देखने के लिए अपना फ़िल्म टिकट इस्तेमाल करना चाहते हो?", "क्या अकेले फ़िल्म देखने के लिए अपना फ़िल्म टिकट इस्तेमाल करना है?"],
  ["Strings/Characters", "MovieTheater_WatchWithFriendPrompt", "क्या तुम {0} के साथ फ़िल्म देखने के लिए अपना फ़िल्म टिकट इस्तेमाल करना चाहते हो?", "क्या {0} के साथ फ़िल्म देखने के लिए अपना फ़िल्म टिकट इस्तेमाल करना है?"],
  ["Strings/Characters", "MovieTheater_Concession", "क्या तुम अपने मेहमान के लिए कुछ खाने को मँगाना चाहोगे?", "क्या अपने मेहमान के लिए कुछ खाने को मँगाना है?"],
  ["Strings/Characters", "MovieTheater_ConcessionAlone", "ओह, लगता है तुम यहाँ अकेले आए हो। अगर किसी मेहमान के साथ आओगे, तो उनके लिए कुछ खाने को मँगा सकते हो।", "ओह, लगता है अभी यहाँ अकेले हो। किसी मेहमान के साथ आने पर उनके लिए कुछ खाने को मँगाया जा सकता है।"],
  ["Strings/Characters", "MovieInvite_Spouse_Sam", "तुम सबसे अच्छे हो!", "तुम्हारा जवाब नहीं!"],
  ["Strings/Objects", "MagnifyingGlassDescription", "अब तुम 'गुप्त नोट' खोज सकते हो।", "अब 'गुप्त नोट' खोजे जा सकते हैं।"],
  ["Strings/Objects", "CompleteBreakfast_Description", "तुम दुनिया का सामना करने के लिए तैयार महसूस करोगे!", "इसे खाकर दुनिया का सामना करने की पूरी तैयारी महसूस होगी!"],
  ["Strings/Objects", "GrassBook_Description", "अब तुम घास और फ़सलों के बीच से बहुत तेज़ दौड़ सकोगे।", "अब घास और फ़सलों के बीच से बहुत तेज़ दौड़ा जा सकेगा।"],
  ["Strings/Objects", "MagicBait_Description", "जिस भी तरह के पानी में इसे डालोगे, वहाँ किसी भी ऋतु, समय या मौसम की मछली पकड़ सकोगे।", "जिस भी तरह के पानी में इसे डाला जाए, वहाँ किसी भी ऋतु, समय या मौसम की मछली पकड़ी जा सकती है।"],
  ["Strings/Objects", "MermaidsPendant_Description", "जिस व्यक्ति से शादी करना चाहते हो, उसे यह दें।", "जिस व्यक्ति से शादी करनी हो, उसे यह दें।"],
  ["Strings/BigCraftables", "MiniForge_Description", "अब तुम अपने घर की सुविधा से बौनों की जादुई भट्ठी इस्तेमाल कर सकते हो।", "अब घर बैठे बौनों की जादुई भट्ठी इस्तेमाल की जा सकती है।"],
  ["Strings/BigCraftables", "SlimeIncubator_Description", "इससे तुम बाहर स्लाइम पाल सकते हो।", "इससे बाहर स्लाइम पाले जा सकते हैं।"],
  ["Strings/BigCraftables", "TextSign_Description", "इस संकेत-पट्ट पर अपना संदेश लिख सकते हो।", "इस संकेत-पट्ट पर अपना संदेश लिखा जा सकता है।"],
  ["Strings/BigCraftables", "Workbench_Description", "यहाँ वस्तु बनाते समय पास के सभी संदूकों की सामग्री इस्तेमाल कर सकोगे।", "यहाँ वस्तु बनाते समय पास के सभी संदूकों की सामग्री इस्तेमाल की जा सकेगी।"],
  ["Strings/UI", "PondQuery_StatusRequestPending0", "जानते हो,", "पता है,"],
  ["Strings/UI", "PondQuery_StatusRequestPending1", "क्या हमारे लिए {1} {0} ला सकते हो?", "क्या हमारे लिए {1} {0} लाना संभव है?"],
  ["Strings/UI", "PondQuery_StatusRequestPending3", "क्या हमारे लिए {1} {0} ला सकते हो?", "क्या हमारे लिए {1} {0} लाना संभव है?"],
  ["Strings/UI", "PondQuery_StatusRequestPending_Carnivore0", "क्या हमारे लिए {1} {0} ला सकते हो?", "क्या हमारे लिए {1} {0} लाना संभव है?"],
  ["Strings/UI", "PondQuery_StatusRequestPending_Carnivore1", "क्या रात के खाने के लिए हमारे पास {1} {0} ला सकते हो?", "क्या रात के खाने के लिए हमारे पास {1} {0} लाना संभव है?"],
  ["Strings/1_6_Strings", "DesertFestival_Harvey_marriage", "वादा करो कि खोपड़ी गुफ़ाओं में सावधान रहोगे।", "खोपड़ी गुफ़ाओं में सावधानी बरतने का वादा करो।"],
  ["Strings/1_6_Strings", "DesertFestival_Emily_marriage", "तुम जैसे हो मुझे वैसे ही प्यारे हो... मगर चाहो तो तुम भी पेटी के भीतर जा सकते हो!", "तुम्हारा असली रूप ही मुझे प्यारा है... मगर चाहो तो पेटी के भीतर जाना भी ठीक है!"],
  ["Strings/1_6_Strings", "Scholar_Intro", "ज्ञान की परीक्षा दोगे?", "ज्ञान की परीक्षा का मन है?"],
  ["Strings/1_6_Strings", "Cook_Intro_Yes3", "अब... क्या लोगे?", "अब... क्या चाहिए?"],
  ["Strings/1_6_Strings", "Cook_ChoseIngredient", "अब... कैसी चटनी लोगे?", "अब... कैसी चटनी चाहिए?"],
  ["Strings/1_6_Strings", "Marlon_Intro", "चुनौती चुनने के बाद निर्णय नहीं बदल सकोगे", "चुनौती चुनने के बाद निर्णय बदलना संभव नहीं होगा"],
  ["Strings/1_6_Strings", "Marlon_1", "अपना दम परखना चाहते हो, हाँ?", "अपना दम परखना है, हाँ?"],
  ["Strings/1_6_Strings", "Shop_Sam", "शायद सजावट या किसी और काम में इस्तेमाल कर सकते हो।", "शायद सजावट या किसी और काम में इस्तेमाल किया जा सकता है।"],
  ["Strings/1_6_Strings", "Shop_Elliott", "विनिमय करना चाहोगे?", "विनिमय का मन है?"],
  ["Strings/1_6_Strings", "Jas_IceCream", "तुम बहुत अच्छे हो!", "तुम्हारा जवाब नहीं!"],
  ["Strings/1_6_Strings", "GiantQiFruitMessage", "तुम्हें लगा मेरा अनमोल फल जब चाहो पा सकते हो?", "तुम्हें लगा मेरा अनमोल फल जब चाहो मिल जाएगा?"],
  ["Strings/Locations", "BeachNightMarket_GiftGiverQuestion", "एक कप कॉफ़ी लोगे?", "एक कप कॉफ़ी चाहिए?"],
  ["Data/Events/SebastianRoom", "Necromancer", "तुम मेरी कंकाल सेना में अच्छी बढ़ोतरी करोगे!", "मेरी कंकाल सेना को तुम्हारे जैसे योद्धाओं की ही ज़रूरत थी!"],
  ["Data/Events/Town", "3917586/e 3917585/O Shane/A shaneSaloon2", "कह सकते हो मैं सर्वश्रेष्ठ खिलाड़ियों में हूँ।", "कहा जा सकता है कि मैं सर्वश्रेष्ठ खिलाड़ियों में हूँ।"],
  ["Data/Events/Town", "3917586/e 3917585/O Shane/A shaneSaloon2", "तुम लोग बहुत उलझ गए होगे!", "तुम लोगों को बड़ी उलझन हुई होगी!"],
  ["Data/Events/IslandWest", "6497423/e 1039573/f Leo 500/w sunny/t 600 1800/Hl leoMoved", "उस जगह के बारे में जहाँ तुम रहते हो।", "उस जगह के बारे में जहाँ तुम्हारा घर है।"],

  // Objective agreement errors found by the speaker-gender audit.
  ["Characters/Dialogue/Gus", "GreenRain", "मौसम का हाल देखी थी", "मौसम का हाल देखा था"],
  ["Characters/Dialogue/Jodi", "eventSeen_94", "वह सबसे बढ़िया था", "वह सबसे बढ़िया थी"],
]) replaceRecord(...correction);

for (const file of touchedRuntime) {
  fs.writeFileSync(file, `${JSON.stringify(runtimeDocuments.get(file), null, 2)}\n`);
}
for (const file of touchedBatches) {
  fs.writeFileSync(file, `${JSON.stringify(batchDocuments.get(file), null, 2)}\n`);
}

console.log(JSON.stringify({
  replacements,
  runtimeFiles: touchedRuntime.size,
  batchFiles: touchedBatches.size,
}, null, 2));
