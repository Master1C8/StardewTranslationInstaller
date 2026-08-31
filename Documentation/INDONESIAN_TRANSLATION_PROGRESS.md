# Indonesian Translation Progress

## Scope and source contract

- Locale: `id-vnrevival` (`Bahasa Indonesia`)
- Canonical record universe: 14,720 unique `(Target, key)` records across 187 English Stardew Valley 1.6.15 assets
- Source text: English base assets only
- Other language packs: structure and packaging references only
- Canonical glossary: 673 Indonesian terms editorially audited against English; 247 confirmed corrections are recorded in `indonesian-glossary-editorial-overrides.json`
- Progress formula: translated and editorially reviewed records + structurally reviewed non-text records + exact canonical glossary terms + documented preserved values, divided by 14,720

## Current checkpoint

- Source-of-truth workspace: `/Users/antonkrutov/Desktop/StardewTranslationInstaller`
- Glossary endpoint checked: `https://vnrevival.fun/games/stardew-valley/glossary?locale=id&offset=0&limit=1000`
- Glossary entries: 673 / 673
- Glossary editorial gate: two consecutive full all-entry audits completed with 0 warnings and 0 errors
- Glossary rewrite idempotence SHA-256: `a932118ec8e8c18459e21cd72778549d71664745d43d713a6da2e6f5216b5e9c`
- Translation JSON files: 151
- English-source records: 14,720
- Exact glossary replacements applied: 550; exact-term dry run has 0 pending replacements
- Reviewed records: 14,720 / 14,720
- Translation progress: 100.000%
- Current package audit: 0 warnings and 0 errors; all 151 Indonesian translation includes are present exactly once
- Package integration and Indonesian interface artwork: complete
- Consecutive clean full all-entry audits after semantic completion: 2 / 2, with 0 warnings and 0 errors
- Independent editorial rerun on 2026-08-28: objective prose, punctuation, spacing, untranslated-fragment, and contextual glossary issues corrected across all 14,720 records; the post-edit gate completed with 2 / 2 consecutive clean full audits
- Second independent editorial rerun on 2026-08-28: localized all 35 gender-branch tokens, restored one omitted branch marker, corrected the remaining `Pelican Town` fragment, and applied 24 dialogue-fragment corrections across 19 event records; the post-edit gate again completed with 2 / 2 consecutive clean full audits
- Third independent editorial rerun on 2026-08-30: corrected 1,699 context-sensitive capitalization occurrences across 1,238 records in 100 files, preserving sentence starts, headings, quoted item names, proper names, festivals, and technical syntax; the new contextual-case pass is idempotent and the post-edit gate again completed with 2 / 2 consecutive clean full audits
- Gender-branch integrity is now enforced by the main Indonesian audit, including source/translation marker-count parity; no source-identical English branch text remains
- Glossary rewrite idempotence: 0 pending replacements; final full glossary audits: 2 / 2 clean
- Unified-content generation idempotence SHA-256: `546ecf11de4d1bc02cdded9f6c96925f3107d2c8e92a45f219134c7e6e1fb837`
- Indonesian font configuration: verified `UseLatinFont: true` with no custom `FontFile`; Russian, Polish, and Amharic XNB font assets also passed reverse unpack, sorted-character-map, aligned-metadata, Polish glyph-set, and Amharic used-character checks
- Swift test suite: passed 8 / 8 after the completed Tamil and Bengali PUA integrations were regenerated into the shared payload
- Release application build, strict code-signature verification, Info.plist validation, and full embedded `ModPayload` comparison against the source tree: passed
- Final verified copy: `/Users/antonkrutov/Desktop/StardewTranslationInstaller`

## Resume procedure

1. Run `node Scripts/audit-indonesian-glossary.mjs`.
2. Run `node Scripts/apply-indonesian-glossary-exacts.mjs` and require 0 pending replacements.
3. Run `node Scripts/audit-indonesian.mjs /Users/antonkrutov/Developer/data/stardew-english-unpacked --unreviewed-by-target`.
4. Translate the next semantic batch directly from English, then update this checkpoint from the audit report.
5. Count a record only after semantic, Indonesian editorial, glossary, context, and marker review.

## Completed areas

- Indonesian glossary synchronized from the project endpoint, editorially corrected, and locked by two clean all-entry passes
- English-source translation scaffold generated from the canonical 14,720-record structure
- Unambiguous whole-record glossary forms applied and verified idempotent
- Core character-creation, collection, item-stat, profession, and multiplayer UI batches 001–003 editorially reviewed and marker-checked
- Chat, family, gift-profile, tailoring, emote, and multiplayer-funds UI batches 004–005 editorially reviewed and marker-checked
- Fish-pond personalities, chat commands, relationship prompts, and advanced-menu UI batches 006–007 editorially reviewed and marker-checked
- Advanced-game options, forging, Ginger Island upgrades, Kesempurnaan tracker, end-credit labels, and desert-race UI batches 008–009 editorially reviewed and marker-checked
- Mobile tutorial and control UI batch 010 editorially reviewed and marker-checked; `Strings/UI` has no remaining unreviewed records
- Buffs, skill modifiers, generic ingredient groups, debris labels, and generated-dialogue vocabulary batch 011 editorially reviewed and marker-checked
- Generated dialogue verbs, relations, place and color vocabulary plus event-result messages batch 012 editorially reviewed and marker-checked
- Elliott book outcomes, Grandpa evaluations, festival prompts, fair rewards, and fortune-teller dialogue batch 013 editorially reviewed and marker-checked
- Fortune outcomes, farmer-status labels, world-state notices, weekday abbreviations, and Stardrop result fragments batch 014 editorially reviewed and marker-checked
- Consumption and crash prompts, relationship progression, marriage responses, greetings, and gift-preference gossip batch 015 editorially reviewed and marker-checked
- Gift-dislike gossip, birthday reactions, spouse moods, pregnancy and household-help dialogue batch 016 editorially reviewed and marker-checked
- Spouse nicknames, audio/save options, marriage ceremony variants, and jukebox track labels batch 017 editorially reviewed and marker-checked
- Remaining jukebox labels, animal-building prerequisites, seasonal fragments, diary events, fishing results, and load-game prompts batch 018 editorially reviewed and marker-checked
- Map labels and opening hours, keyboard controls, inventory-slot bindings, and animal-purchase guidance batch 019 editorially reviewed and marker-checked
- Animal-product guidance, shopkeeper lines, skill modifiers, social-status labels, strength-game ranks, title tips, tutorials, and arcade results batches 020–021 editorially reviewed and marker-checked
- CalicoJack results, Grandpa's opening story and letter, minigame scoring, furniture placement, object categories, machine requirements, and artifact discovery messages batch 022 editorially reviewed and marker-checked
- Special-item discoveries, TV programs, weather and daily-luck reports, room-decoration labels, fishing quests, and item-delivery fragments batch 023 editorially reviewed and marker-checked
- Item-delivery request templates, culinary uses, medical conditions, placement phrases, and requester notices batch 024 editorially reviewed and marker-checked
- Delivery-request responses, Wizard and bachelor/bachelorette variants, reward summaries, and resource-collection quest fragments batch 025 editorially reviewed and marker-checked
- Resource-quality follow-ups, monster and social quests, planting restrictions, tool-strength notices, fishing status, and weapon statistics batch 026 editorially reviewed and marker-checked
- Tool use, language labels, generated sentence samples, and keyboard-binding names batch 027 editorially reviewed and marker-checked
- Extended keyboard/media names, controller settings, item recovery, Krobus relationship dialogue, Bioskop concessions, and jukebox track labels batch 028 editorially reviewed and marker-checked
- Island trader dialogue, late-game buffs and placement rules, Farm Computer metrics, fishing broadcasts, island music, horse and Kunci Kota status, and bite-sound options batch 029 editorially reviewed and marker-checked
- Final `Strings/StringsFromCSFiles` late-game trade, buff, renovation, quest-day, and combat-result values batch 030 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- Early `Strings/Objects` system descriptions, minerals, seeds, fruit, fish, food, artifacts, fertilizers, monster drops, and book names batches 031–032 editorially reviewed and marker-checked
- Skill books, early crop and food objects, trash, monster materials, rings, Festival Gurun items, and early carrot entries batch 033 editorially reviewed and marker-checked
- Crop, fish, mineral, food, artifact, path, crafting-material, coffee, and copper object entries batch 034 editorially reviewed and marker-checked
- Coral through dried-goods, duck products, Kurcaci artifacts, gems, crop, book, food, bait, late-game material, and fireworks object entries batches 035–036 editorially reviewed and marker-checked
- Fish stew through gold, fossil, geode, garlic, ring, island crop, food, fish, animal-product, artifact, and music-block object entries batches 037–038 editorially reviewed and marker-checked
- Growth aid, Iridium/Besi gear, gems, preserves, juice, crop, legendary fish, late-game materials, food, animal product, and relationship-item entries batches 039–040 editorially reviewed and marker-checked
- Mixed seeds, monster lure, fossils, remedies, shellfish, mystic items, rings, minerals, oils, fruit-tree, jewelry, and Burung Unta object entries batch 041 editorially reviewed and marker-checked
- Egg, shellfish, crop, food, tree-product, quest item, fish, ring, preserve, Festival Gurun, and melon object entries batch 042 editorially reviewed and marker-checked
- Winter melon seed, prehistoric artifact, sprinkler attachment, prismatik material, crop, food, fish, mineral, ring, fertilizer, radioactive material, river jelly, ancient artifact, and related object entries batches 043–044 editorially reviewed and marker-checked
- Ocean forage, seafood, fossils, skill books, Slime items, smoked fish, minerals, rings, seasonal forage and seeds, Stardew Valley gifts, building materials, crops, fish, and food object entries batches 045–046 editorially reviewed and marker-checked
- Sunflower, Talas, tea, tent, Slime Harimau, crop, mineral, Totem Teleportasi, Void material, weeds, grain, forage, beverage, artifact, fish, food, and equipment object entries batches 047–048 editorially reviewed and marker-checked
- Final winter forage, Kayu furniture material, fish, Wol, and Ubi object entries batch 049 editorially reviewed and marker-checked; `Strings/Objects` has no remaining unreviewed records
- Chair, bench, sofa, table, cabinet, shelf, plant, sculpture, lamp, rug, television, painting, window, and decorative furniture entries batches 050–051 editorially reviewed and marker-checked
- Bahari, fireplace, film-poster, bed, aquarium, wall decoration, banner, floor divider, desert, art, and other themed furniture entries batches 052–053 editorially reviewed and marker-checked
- Joja, Penyihir, Eliksir, Rune, crystal-ball, book-stack, Junimo, and portrait furniture entries batches 054–055 editorially reviewed and marker-checked
- Retro, portrait, doorway, pet, household, trash, beach, and remaining furniture entries batches 056–057 editorially reviewed and marker-checked; `Strings/Furniture` has no remaining unreviewed records
- Forest relic, Festival Gurun dialogue, Pria Kaktus, Willy fishing challenge, Cendekiawan quiz, Koki meal generator, and race-announcer `Strings/1_6_Strings` entries batches 058–059 editorially reviewed and marker-checked
- Festival race, suspicious-racer service, Serikat Petualang challenge, Gil rating, makeover, festival shops, Gua Tengkorak instructions, Patung Calico effects, and fishing-festival signage `Strings/1_6_Strings` entries batches 060–061 editorially reviewed and marker-checked
- Fishing-event rewards, Penguasaan, Berkah, Patung Kurcaci, Aksesori, Fizz, books, Rakun family, fish frenzy, spouse, Kakek note, and related `Strings/1_6_Strings` entries batches 062–063 editorially reviewed and marker-checked
- JojaBank, enchantments, deluxe machines, cuisine, Manekin, house renovations, pets, professions, options, and Forest Pylon event `Strings/1_6_Strings` entries batches 064–065 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- Early classic, colored, formal, farming, retro, striped, Tank Top, Ponco, and Bikini `Strings/Shirts` entries batch 066 editorially reviewed and marker-checked
- Wumbus, 80-an, leather, armor, Hoodie, Gi, formal, Bandana, Slime, Koki, Yoba, Kardigan, and other themed `Strings/Shirts` entries batches 067–068 editorially reviewed and marker-checked
- Prismatik, uniform, food, Flanel, pelaut, pengantin, kamuflase, denim, tropis, Misteri, and remaining `Strings/Shirts` entries batches 069–070 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- AnimalShop, ArchaeologyHouse, pemandian, Bengkel Tempa, rumah karakter, FishShop, Hospital, and JojaMart `Strings/StringsFromMaps` entries batches 071–072 editorially reviewed and marker-checked
- Remaining JojaMart products, JoshHouse, LeahHouse, ManorHouse, SamHouse, ScienceHouse, SeedShop, Town festival signage, Trailer, WitchHut, and Bioskop `Strings/StringsFromMaps` entries batches 073–074 editorially reviewed and marker-checked
- Bioskop patrons, Pulau Jahe shrine, pirate cove dialogue, Dart challenge, and remaining `Strings/StringsFromMaps` entries batch 075 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- Serikat Petualang goals, Pasar Malam, Pelaut Tua, Pusat Komunitas, Kuil Kakek, household reactions, Kuil Ilusi, Tuan Qi quest chain, municipal ledgers, club, locked-door, and other `Strings/Locations` entries batches 076–077 editorially reviewed and marker-checked
- CalicoJack rules, Carpenter upgrades, dark shrines, Bioskop notices, island survey, cabin renovations, Gourmand requests, boat repair, Kenari hints, beach resort, and Lost and Found `Strings/Locations` entries batches 078–079 editorially reviewed and marker-checked
- Field Office reward, island shop honor boxes, Kuil Tantangan, Gil telephone reward, late-game `Strings/Locations` entries batch 080, and all seven remaining dialogue-bearing location event scripts editorially reviewed with command streams preserved; the target has no remaining unreviewed records
- Penny, Pam, Krobus, Penyihir, George, Alex, Evelyn, Pierre, Abigail, Caroline, Harvey, Gus, Lewis, Jodi, Sam, Vincent, Kent, Clint, and Emily `Strings/MovieReactions` entries batches 081–082 editorially reviewed and marker-checked
- Remaining Emily, Haley, Maru, Sebastian, Robin, Demetrius, Linus, Kurcaci, Marnie, Shane, Jas, Leah, Sandy, Elliott, Willy, and Leo `Strings/MovieReactions` entries batches 083–084 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- Early furniture, machine, storage, lighting, production, decoration, and farm equipment `Strings/BigCraftables` entries batch 085 editorially reviewed and marker-checked
- Lighting, mystery furniture, production machines, Junimo/Prairie arcade systems, Rarecrow, statues, Slime equipment, stone garden art, signage, and related `Strings/BigCraftables` entries batches 086–087 editorially reviewed and marker-checked
- Obelisk, billboard, island, geode, tropical, teleporter, clock, and remaining `Strings/BigCraftables` entries batch 088 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- Rainy-day, indoor-day/night, outdoor, work-schedule, children, relationship-state, seasonal, spouse-specific, spouse-room, Krobus, and missing-bed `Characters/Dialogue/MarriageDialogue` entries batches 089–091 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- Kinship labels, horse naming, Abigail-in-the-Mines dialogue, Jimat Gelap dialogue, saloon reactions, Bioskop invitations, screenings, concessions, spouse dates, and early Robin telephone messages `Strings/Characters` entries batches 092–093 editorially reviewed and marker-checked
- Remaining Robin, Clint, Gus, Pierre, Marnie, random-caller, Leo-memory, stock-list, and Marlon telephone `Strings/Characters` entries batch 094 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- Named personal, bone, crystal, dark, dragon-tooth, Kurcaci, forest, Galaksi, Tak Terhingga, iridium, lava, pirate, shadow, steel, wooden, and remaining `Strings/Weapons` entries batches 095–096 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- All cowboy, festival, profession, character, magical, mask, helmet, ribbon, turban, pan, and other `Data/hats` records batches 097–098 editorially reviewed with slash-delimited technical metadata preserved; the target has no remaining unreviewed records
- All `Data/Boots` records and all `Strings/BundleNames` labels batches 099–100 editorially reviewed with technical metadata preserved; both targets have no remaining unreviewed records
- All seven Bioskop features and their title cards, synopses, and scene captions in `Strings/Movies` batch 101 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- All Bioskop concession names/descriptions and remaining upgraded-tool names/descriptions in `Strings/MovieConcessions` and `Strings/Tools` batches 102–103 editorially reviewed and marker-checked; both targets have no remaining unreviewed records
- All `Strings/Pants` clothing names/descriptions, all `Strings/Buildings` interaction/building descriptions, and all `Data/Achievements` titles/objectives batches 104–106 editorially reviewed with placeholders and technical metadata preserved; all three targets have no remaining unreviewed records
- All Robin, Marnie, Marlon, Maru, Leah, Elliott, Morris, Sandy, Lewis, Gus, Gunther, and Pierre `Strings/SpeechBubbles` entries batch 107 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- All `Data/Fish` display names synchronized from the already reviewed `Strings/Objects` names with every technical field preserved; the fish-name pass is idempotent and the target has no remaining unreviewed records
- All `Data/Monsters` player-visible names editorially translated through an explicit mapping with every technical field preserved; the monster-name pass is idempotent and the target has no remaining unreviewed records
- All generated-adjective/pronoun `Strings/Lexicon` records and all `Strings/FarmAnimals` mood messages batches 108–109 editorially reviewed with list delimiters and placeholders preserved; both targets have no remaining unreviewed records
- All player-facing `Strings/credits` headings, role labels, language annotations, platform text, links, and closing message batch 110 editorially localized; personal/company names and technical image directives explicitly reviewed and preserved, leaving the target with no remaining unreviewed records
- All `Data/Bundles` player-visible names editorially translated through an explicit mapping with every reward, ingredient, layout, and technical field preserved; the bundle-name pass is idempotent and the target has no remaining unreviewed records
- All `Data/EngagementDialogue`, `Strings/Events`, and remaining `Strings/Quests` messages batches 111–113 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records
- All introductions, gifts, Green Rain, memories, relationships, Resor, weekday, response-choice, event, and seasonal `Characters/Dialogue/Abigail` entries batches 114–115 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- All introductions, gifts, Green Rain, memories, relationships, Resor, weekday, response-choice, event, and seasonal `Characters/Dialogue/Haley` entries batches 116–117 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- All player-visible `Strings/animationDescriptions` interaction lines batch 118 editorially reviewed and marker-checked; the target has no remaining unreviewed records
- All `Characters/Dialogue/MarriageDialogueHaley`, `Characters/Dialogue/MarriageDialogueAlex`, and `Characters/Dialogue/MarriageDialogueHarvey` spouse lines batches 119–121 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records
- The final `Strings/WorldMap`, `Strings/schedules/Pierre`, and `Strings/NPCNames` records batches 122–123 editorially reviewed or explicitly preserved as a proper name; all three targets have no remaining unreviewed records
- All `Characters/Dialogue/MarriageDialogueElliott`, `Characters/Dialogue/MarriageDialogueMaru`, and `Characters/Dialogue/MarriageDialogueEmily` spouse lines batches 124–126 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records
- All `Characters/Dialogue/MarriageDialogueKrobus`, `Characters/Dialogue/MarriageDialogueLeah`, and `Characters/Dialogue/MarriageDialogueAbigail` roommate/spouse lines batches 127–129 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records
- All `Characters/Dialogue/MarriageDialogueSebastian`, `Characters/Dialogue/MarriageDialogueShane`, and `Characters/Dialogue/MarriageDialoguePenny` spouse lines batches 130–132 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records
- All `Characters/Dialogue/MarriageDialogueSam` spouse lines batch 133 and all `Characters/Dialogue/Alex` dialogue batches 134–135 editorially reviewed and marker-checked; both targets have no remaining unreviewed records
- All `Characters/Dialogue/Sebastian` dialogue batches 136–137 and all `Characters/Dialogue/Dwarf` dialogue batch 138 editorially reviewed and marker-checked; both targets have no remaining unreviewed records
- All `Characters/Dialogue/Maru` dialogue batches 139–140 and all player-visible `Data/NPCGiftTastes` reactions batch 141 editorially reviewed with slash-delimited item/category metadata preserved; both targets have no remaining unreviewed records
- All `Characters/Dialogue/Emily` dialogue batches 142–143, `Characters/Dialogue/Wizard` and `Characters/Dialogue/Gil` dialogue batches 144–145, and `Strings/schedules/Emily` batch 146 editorially reviewed and marker-checked; all four targets have no remaining unreviewed records
- All `Characters/Dialogue/Penny`, `Characters/Dialogue/rainy`, and `Characters/Dialogue/Leo` dialogue batches 147–150 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records, and the first `Strings/schedules/Abigail` line batch 151 is reviewed
- All `Characters/Dialogue/Sam` dialogue batches 152–153, remaining `Strings/schedules/Abigail` lines batch 154, and all `Strings/Notes` entries batch 155 editorially reviewed and marker-checked; the fictional Dwarvish note and punctuation-only Sam response are explicitly preserved, leaving all three targets with no remaining unreviewed records
- All `Characters/Dialogue/Elliott` dialogue batches 156–157, `Strings/SimpleNonVillagerDialogues` batch 158, `Characters/Dialogue/Sandy` batch 159, and `Strings/schedules/Caroline` batch 160 editorially reviewed and marker-checked; all four targets have no remaining unreviewed records
- All `Characters/Dialogue/Leah` dialogue batches 161–162 and `Characters/Dialogue/Caroline` dialogue batch 163 editorially reviewed and marker-checked; both targets have no remaining unreviewed records
- All `Characters/Dialogue/Pam` and `Characters/Dialogue/Shane` dialogue batches 164–165 and `Strings/schedules/Alex` batch 166 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records
- All `Strings/schedules/Willy`, `Strings/schedules/Sam`, `Strings/schedules/Sebastian`, and `Strings/schedules/Shane` lines batch 167 editorially reviewed and marker-checked; all four targets have no remaining unreviewed records
- All `Strings/schedules/Jodi`, `Strings/schedules/Lewis`, `Strings/schedules/Maru`, and `Strings/schedules/Penny` lines batch 168 editorially reviewed and marker-checked; all four targets have no remaining unreviewed records
- All remaining character schedule lines batches 169–171 editorially reviewed and marker-checked; every `Strings/schedules/*` target now has no remaining unreviewed records
- All `Characters/Dialogue/Lewis`, `Characters/Dialogue/Harvey`, and `Characters/Dialogue/Demetrius` lines batches 172–174 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records
- All `Characters/Dialogue/Pierre`, `Characters/Dialogue/Robin`, and `Characters/Dialogue/Jodi` lines batches 175–177 editorially reviewed and marker-checked; all three targets have no remaining unreviewed records
- All `Characters/Dialogue/Linus`, `Characters/Dialogue/Evelyn`, and `Characters/Dialogue/Clint` lines batches 178–180 editorially reviewed and marker-checked; punctuation/marker-only residuals in Emily and Maru are explicitly preserved, leaving all five targets with no remaining unreviewed records
- All `Characters/Dialogue/Willy`, `Characters/Dialogue/Jas`, `Characters/Dialogue/Marnie`, and `Characters/Dialogue/Gus` lines batches 181–184 editorially reviewed and marker-checked; Jas's punctuation/marker-only response is explicitly preserved, leaving all four targets with no remaining unreviewed records
- All `Characters/Dialogue/Kent`, `Characters/Dialogue/George`, `Characters/Dialogue/Krobus`, `Characters/Dialogue/Vincent`, `Characters/Dialogue/LeoMainland`, and `Characters/Dialogue/Mister Qi` lines batches 185–189 editorially reviewed and marker-checked; all six targets have no remaining unreviewed records
- All `Data/TV/TipChannel`, `Data/TV/CookingChannel`, and `Data/SecretNotes` records batches 190–192 editorially reviewed and marker-checked; image-only Secret Note directives are explicitly preserved, leaving all three targets with no remaining unreviewed records
- All `Data/Quests` records batches 193–196 editorially reviewed with slash-delimited quest metadata, identifiers, and control fields preserved; the target has no remaining unreviewed records
- All 92 direct NPC dialogue records in `Data/Festivals/summer11` batch 197 editorially reviewed and marker-checked; three player-invisible setup/condition command records explicitly preserved, leaving only the nine dialogue-bearing event command streams in that target
- The remaining nine dialogue-bearing `Data/Festivals/summer11` event command streams editorially translated through an idempotent dialogue-only rewrite; the target has no remaining unreviewed records
- All `Data/Festivals/spring13` dialogue and event command streams batch 198 plus the idempotent event rewrite editorially reviewed; setup/condition command records explicitly preserved, leaving the target with no remaining unreviewed records
- All 80 direct NPC dialogue records in `Data/Festivals/spring24` batch 199 editorially reviewed and marker-checked; three player-invisible setup/condition command records explicitly preserved, leaving only the dialogue-bearing dance event command stream in that target
- The remaining `Data/Festivals/spring24` dance event command stream editorially translated through an idempotent dialogue-only rewrite; the target has no remaining unreviewed records
- All `Strings/SpecialOrderStrings` town, island, Qi, and Marlon order titles, descriptions, objectives, dynamic fragments, and completion messages batches 200–201 editorially reviewed with every placeholder preserved; exact glossary rewriting is again idempotent and the target has no remaining unreviewed records
- All `Data/ExtraDialogue` family, construction, Museum, Joja, purchased-item, island, Birdie, Professor Snail, Summit, and Gua Tengkorak records batches 202–204 plus the idempotent event rewrite editorially reviewed with every placeholder and command stream preserved; the target has no remaining unreviewed records
- All `Data/mail` gift, recipe, family, notice, quest, festival, passed-out recovery, special-order reward, island, adoption, and travel-letter records batches 205–209 editorially reviewed with every item directive, placeholder, conversation topic, and title marker preserved; the target has no remaining unreviewed records
- All `Data/Festivals/winter8` Festival Es year-one and year-two dialogue batches 210a–210c plus seven dialogue-bearing event command streams editorially reviewed through an idempotent rewrite; setup/condition streams explicitly preserved, leaving the target with no remaining unreviewed records
- All `Data/Festivals/fall16` Pekan Raya Stardew Valley year-one and year-two dialogue batches 211a–211b editorially reviewed and marker-checked; Vincent's language-neutral animal vocalization and setup/condition streams explicitly preserved, leaving the target with no remaining unreviewed records
- All `Data/Festivals/fall27` Malam Roh year-one and year-two dialogue batches 212a–212b editorially reviewed with every dialogue marker, gender branch, `%noturn` token, and character-action directive preserved; setup, condition, and year-two shop streams explicitly preserved, leaving the target with no remaining unreviewed records
- All `Data/Festivals/winter25` Perjamuan Bintang Musim Dingin year-one and year-two dialogue batches 213a–213b editorially reviewed with choice trees, `%noturn`, and `=Stardrop` preserved; setup and Secret Santa command streams explicitly reviewed, leaving the target with no remaining unreviewed records
- All `Data/Festivals/summer28` Tarian Ubur-ubur Cahaya Bulan year-one and year-two dialogue batches 214a–214b plus both dialogue-bearing event streams editorially reviewed through an idempotent rewrite; setup/condition streams explicitly preserved, leaving the target with no remaining unreviewed records
- The 30 shortest remaining `Data/Events/*` records batch 215 editorially reviewed: 26 records translated through an idempotent fragment rewrite and four language-neutral animation/transition command streams explicitly preserved
- All remaining `Data/Events/*` records batches 216–235 editorially reviewed directly from English through idempotent dialogue-fragment rewrites; all 308 event records now pass command-stream, marker, placeholder, and semantic-review checks
- Indonesian `id-vnrevival` package integration completed with `Bahasa Indonesia`, Latin-font configuration, a localized language button, localized `TitleButtons`, and all 151 translation includes generated exactly once
- Technical-only recipe, furniture-data, aquarium, chair-tile, hair, paint, and animation-data sections reviewed and explicitly preserved with player-facing localization references verified
- Editorial correction batches 236–237 and the synchronized canonical batches cover the final prose, contextual-terminology, and gender-branch corrections; all 24 revised replacement targets were propagated into the historical batches, and every event-fragment batch from 215 through 237 reapplies with 0 changes

## Guardrails

- Do not publish the glossary without explicit owner authorization.
- Do not launch the installer merely to inspect it; opening the release app starts installation.
- Do not commit or push without explicit user instruction.
