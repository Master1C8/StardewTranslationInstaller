import { materializeDirectBatch } from "./lib/materialize-bengali-direct-batch.mjs";

const translated = {
  LevelUp_ProfessionName_Excavator: "খননকারী", LevelUp_ProfessionName_Gemologist: "রত্নবিদ", LevelUp_ProfessionName_Fighter: "যোদ্ধা", LevelUp_ProfessionName_Scout: "অনুসন্ধানী", LevelUp_ProfessionName_Brute: "বলপ্রয়োগকারী", LevelUp_ProfessionName_Defender: "রক্ষক", LevelUp_ProfessionName_Acrobat: "কসরতকারী", LevelUp_ProfessionName_Desperado: "দুঃসাহসী",
  Options_StowingMode_GamepadOnly: "শুধু গেমপ্যাড", Options_StowingMode_On: "চালু", Options_ShowAdvancedCraftingInformation: "উন্নত কারুশিল্পের তথ্য দেখাও", Options_GamepadStyleMenus: "কন্ট্রোলার-ধাঁচের মেনু ব্যবহার করো", GameMenu_ServerMode: "সার্ভার মোড", GameMenu_ServerMode_Offline: "অফলাইন", GameMenu_ServerMode_Online: "অনলাইন", GameMenu_ServerMode_FriendsOnly: "শুধু বন্ধু", GameMenu_ServerMode_InviteOnly: "শুধু আমন্ত্রিত", CoopMenu_Join: "যোগ দাও", CoopMenu_Failed: "সংযোগ ব্যর্থ", CoopMenu_Refresh: "হালনাগাদ", OptionsPage_FarmhandCreation: "নতুন চরিত্র তৈরি চালু করো", OptionsPage_ShowReadyStatus: "রাতভর খেলোয়াড়ের অবস্থা তালিকা দেখাও", CoopMenu_InternetCommunication: "অনলাইন যোগাযোগ", CoopMenu_LocalCommunication: "স্থানীয় যোগাযোগ", TrashCanSale: "ফিরিয়ে নাও", Collections_Letters: "চিঠি", Profile_GiftLog: "উপহারের তালিকা", Profile_Status: "অবস্থা", Profile_Birthday: "জন্মদিন", Emote_Yes: "হ্যাঁ", Emote_No: "না", PondQuery_ChangeNetting: "চেহারা বদলাও", ItemGrab_FillStacks: "বিদ্যমান স্তূপে যোগ করো", Options_GamepadMode_ForceOn: "জোর করে চালু", Options_GamepadMode_ForceOff: "জোর করে বন্ধ", AGO_CCB_Remixed: "পুনর্মিশ্রিত", AGO_Year1Completable: "প্রথম বছরেই সম্পূর্ণ করা নিশ্চিত করো", AGO_FarmMonsters: "খামারে দানব জন্মাও", AGO_LegacyRandomization: "পুরোনো দৈববিন্যাস ব্যবহার করো", Options_SlingshotMode: "গুলতি ছোড়ার মোড", Forge_Unforge: "ফোর্জ বাতিল করো", Carpenter_PaintBuildings: "ভবন রং করো", ParrotPlatform_Volcano: "আগ্নেয়গিরি", ParrotPlatform_Archaeology: "খননস্থল", ParrotPlatform_Forest: "জঙ্গল", ParrotPlatform_Docks: "ঘাট", EndCredit_ShadowPeople: "ছায়াজাতি", NextPage: "পরের পৃষ্ঠা", PreviousPage: "আগের পৃষ্ঠা", DisplayAdjustmentButton: "পর্দার আকার ঠিক করো", Split_Screen: "বিভক্ত পর্দা", mobile_options_vertical_toolbar: "উল্লম্ব সরঞ্জামদণ্ড", mobile_options_bigger_numbers: "সংখ্যার জন্য বড় হরফ", mobile_options_auto_save: "স্বয়ংক্রিয় সংরক্ষণ", Cancel: "বাতিল",
};
const entries = Object.entries(translated).map(([key, translation]) => ({ key, translation }));
const preserve = {
  StartupMessage_FirstRun: ["", "এটি ইচ্ছাকৃতভাবে খালি প্রথম-চালু বার্তা; দৃশ্যমান অনুবাদযোগ্য লেখা নেই, তাই খালি রাখা হয়েছে।"],
  Chat_UnknownUserName: ["???", "এটি অজ্ঞাত ব্যবহারকারীর ভাষা-নিরপেক্ষ প্রশ্নচিহ্ন; হুবহু রাখা হয়েছে।"],
  Chat_PlayerName: ["{0} ({1})", "এটি খেলোয়াড়ের নাম ও শনাক্তকারী বসানোর প্রযুক্তিগত প্লেসহোল্ডার-বিন্যাস; হুবহু রাখা হয়েছে।"],
  Chat_ChatMessageFormat: ["{0}: {1}", "এটি প্রেরক ও বার্তা বসানোর প্রযুক্তিগত প্লেসহোল্ডার-বিন্যাস; হুবহু রাখা হয়েছে।"],
  Chat_UserNotificationMessageFormat: ["> {0}", "এটি বিজ্ঞপ্তির প্রযুক্তিগত প্লেসহোল্ডার-বিন্যাস; হুবহু রাখা হয়েছে।"],
  ChatCommands_ListOnlinePlayersEntry: [" - {0}", "এটি অনলাইন খেলোয়াড়ের নাম বসানোর প্রযুক্তিগত তালিকা-বিন্যাস; হুবহু রাখা হয়েছে।"],
  ChatCommands_Help_CommandDescription: [" - {0}", "এটি কমান্ডের বিবরণ বসানোর প্রযুক্তিগত তালিকা-বিন্যাস; হুবহু রাখা হয়েছে।"],
  Tailor_MakeResultUnknown: ["???", "এটি অজানা সেলাই-ফলের ভাষা-নিরপেক্ষ প্রশ্নচিহ্ন; হুবহু রাখা হয়েছে।"],
  Junimo_Kart_Level_8: ["???", "এটি গোপন স্তরের ভাষা-নিরপেক্ষ প্রশ্নচিহ্ন-শিরোনাম; হুবহু রাখা হয়েছে।"],
  Chat_RaceWinners_List: ["{0},", "এটি প্রতিযোগিতার বিজয়ীর নাম বসানোর প্রযুক্তিগত প্লেসহোল্ডার-বিন্যাস; হুবহু রাখা হয়েছে।"],
  BirthdayOrder: ["{1} {0}", "এটি তারিখের অংশ বসানোর প্রযুক্তিগত প্লেসহোল্ডার-বিন্যাস; হুবহু রাখা হয়েছে।"],
  Options_Vsync: ["VSync", "এটি গ্লসারিতে নির্ধারিত ভাষা-নিরপেক্ষ প্রযুক্তিগত নাম; হুবহু রাখা হয়েছে।"],
};
for (const [key, [translation, reason]] of Object.entries(preserve)) entries.push({ key, translation, reason });

materializeDirectBatch({ root: process.cwd(), id: "419-remaining-core-ui-b", kind: "short", target: "Strings/UI", entries });
