# Uzbek translation progress

## Package identity

- SiteForMods locale: `uz`
- Stardew Valley language code: `uz-vnrevival`
- Content Patcher ID: `VNRevival.StardewValleyUzbek`
- Translation directory: `assets/translations/uzbek/`
- Source language: English only

The Russian package is a read-only technical reference for Content Patcher structure, language-button assets, and locale-specific image loading. No Russian resource is copied into or modified by this package.

## Terminology source

The local `Documentation/glossary/glossary.uz.json` snapshot was compared with the canonical SiteForMods glossary on 2026-08-11. Both the English layer and the Uzbek layer matched exactly. The Uzbek layer contains all 673 stable IDs with no empty term or meaning.

Live project glossary: <https://vnrevival.fun/en/games/stardew-valley/projects/uz/>

## Completed batches

### UZ-001 — core interface labels

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui.json`
- Entries: 31
- Scope: money errors, main player-menu tabs, collections categories, journal labels, zoom labels, exit commands, and a small set of unambiguous character/inventory controls
- Placeholders preserved: `{0}` in `QuestButton_Hover`
- Glossary decisions applied: `Topshiriq`, `Jurnal`, `Anjomlar`, `Ko‘nikmalar`, `Ijtimoiy`, `Xarita`, `Yasash`, `To‘plamlar`, `Sozlamalar`, `Jamoat markazi`, and the three explicit exit labels

### UZ-002 — inventory, stats, and short creation labels

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-inventory-stats.json`
- Entries: 57
- Scope: birthday and year labels, short carpenter actions, appearance labels, collection counters, item statistics, skill buffs, player funds, the last shipped item, and bundle names
- Placeholders preserved: `{0}` and `{1}` in all 38 parameterized entries
- Glossary decisions applied: `Tug‘ilgan kun`, `yil`, `Tungi bozor`, `Ko‘rinishni o‘zgartirish`, `Binolarni buzish`, `Binolarni ko‘chirish`, `Qurish`, `Mudofaa`, `Immunitet`, `Kritik ehtimol`, `Kritik kuch`, `Zarar`, `Tezlik`, `Og‘irlik`, `Quvvat`, `Salomatlik`, the five skill names, `Omad`, `Oxirgi jo‘natilgan buyum`, and `to‘plam`

Current translated total: 88 `Strings/UI` entries.

### UZ-003 — animals, character creation, and geode services

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-animals-character.json`
- Entries: 63
- Scope: learned-recipe notices, farmer statistics, animal management, remaining carpenter errors, multiplayer creation settings and help, six farm maps, skill labels, shipped collections, and geode service text
- Glossary decisions applied: `retsept`, `Yashash binosini almashtirish`, `Homiladorlikka ruxsat`, `Mukammal!`, `Pul taqsimoti`, `Foyda ulushi`, `Boshlang‘ich kulbalar`, `Kulba joylashuvi`, all six farm-map names, the four skill names, `Jo‘natilgan buyumlar`, `Anjomlarda joy yo‘q`, and `Geoda`

### UZ-004 — Community Center rewards and level professions

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-level-professions.json`
- Entries: 88
- Scope: Joja development descriptions, Community Center rewards, letter attachments, level-up bonuses, all 30 profession names and descriptions, and profession selection
- Glossary decisions applied: `Kaliko cho‘li`, `Pelikan shaharchasi`, `Vagonchalar ta’mirlandi`, `Ko‘prik ta’miri`, `Issiqxona`, `Avtobus ta’miri`, `Yaltiragan xarsang olib tashlandi`, `Jamoat markazi`, `Tashlandiq JojaMart`, tool names, `Salomatlik`, all 30 canonical profession names, `Qisqichbaqa tuzog‘i`, `yem`, `Qattiq yog‘och`, `ruda / quyma`, `kritik zarba`, and `maxsus harakat / tiklanish vaqti`

Current translated total: 239 `Strings/UI` entries.

### UZ-005 — load, controller, and multiplayer menus

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-multiplayer.json`
- Entries: 51
- Scope: save loading, controller reconnection, item stowing, advanced crafting information, server modes, co-op connection states, invite codes, multiplayer options, cabin demolition, and host wait states
- Glossary decisions applied: `Buyumni olib qo‘yish`, `Kontroller uslubidagi menyulardan foydalanish`, `Server rejimi`, `Oflayn / Onlayn`, `Taklif kodi`, `Yangi fermaga mezbon bo‘lish`, `Kulba`, and `Yordamchi fermer`

### UZ-006 — multiplayer chat notifications

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-chat-notifications.json`
- Entries: 69
- Scope: chat formats and multiplayer announcements for joining, collections, relationships, sleep, earnings, films, achievements, and game pausing
- Glossary decisions applied: `Yordamchi fermer`, `Afsonaviy baliq`, `to‘plam`, `Yulduz tomchisi`, `Dasht qirolining sarguzashti`, `Junimo Kart`, `Yo‘qolgan kitob`, `Galaktika qilichi`, and `Yutuqlar`

Current translated total: 359 `Strings/UI` entries.

### UZ-007 — chat commands and player proposals

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-chat-commands-proposals.json`
- Entries: 100
- Scope: chat command help and errors, ban/unban controls, private replies, Mr. Qi messages, multiplayer relationship status, gifts, dance and marriage proposals, pregnancy and adoption responses, invite-code clipboard actions, lost items, and letters
- Glossary decisions applied: `fermer / yordamchi fermer`, `Janob Qi`, `nikoh / turmush o‘rtoq`, `bo‘ydoq / turmushga chiqmagan qiz`, `homiladorlik / asrab olish`, `raqs jufti`, `Taklif kodi`, `Onlayn aloqa / Mahalliy aloqa`, and `Xatlar`
- Control syntax preserved: all numbered placeholders, the wedding `^` separator, `/help commandName`, and item token `[126]`

Current translated total: 459 `Strings/UI` entries.

### UZ-008 — profiles, tailoring, dyeing, and emotes

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-profile-tailoring-emotes.json`
- Entries: 61
- Scope: fruit-tree and workbench warnings, the gift log and gift categories, Mini-Jukebox restrictions, tailoring and dye-pot instructions, and the complete emote menu
- Glossary decisions applied: `Sovg‘a jurnali`, `Tug‘ilgan kun`, `hayvon mahsuloti`, `hunarmand mahsuloti`, `Baliq`, `Mini-musiqa qutisi`, and existing UI terminology for items and colors

### UZ-009 — wallet milestones and Junimo Kart levels

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-wallet-achievements.json`
- Entries: 38
- Scope: shared/separate wallet announcements, money-gifting and solo-earnings milestones, bundle and monster-eradication notices, Luau soup, Junimo Kart high scores and all displayed level names, and the NPC busy message
- Glossary decisions applied: `Mablag‘larni birlashtirish`, `Pul yuborish`, `to‘plam`, `Mahluqlarni qirish maqsadlari`, `iridiy`, `Luau`, `Junimo Kart`, and `Gavhar dengizi`

Current translated total: 558 `Strings/UI` entries.

### UZ-010 — Fish Pond status and requests

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-fish-pond.json`
- Entries: 57
- Scope: pond naming and population, empty-pond confirmation, healthy status variants, every polite/rude/demanding/formal/carnivorous item request, and every request-completion response
- Glossary decisions applied: `Baliq hovuzi`, `Populyatsiya`, `Ko‘rinishni o‘zgartirish`, and `Baliq hovuzi topshirig‘i / buyum so‘rovi`

### UZ-011 — advanced options and local co-op

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-advanced-options.json`
- Entries: 64
- Scope: Mini-Fridge and kitchen messages, advanced game options, mine and monster settings, randomization, slingshot mode, beds, lobby state, forge status, local co-op, building paint/move permissions, and the Beach Farm description
- Glossary decisions applied: `Mini-sovutgich`, `Mavjud taxlamlarga qo‘shish`, `Geympad rejimi`, `Ilg‘or o‘yin sozlamalari`, `Oddiy / Qayta tuzilgan`, `Kon mukofotlari`, `Fermada mahluqlar paydo bo‘lsin`, `Tasodifiylik kaliti`, `Eski tasodifiylashtirishdan foydalanish`, `Rogatka otish rejimi`, `Toblashni bekor qilish`, `Mahalliy hamkorlik`, `Binolarni bo‘yash`, `Sohil fermasi`, and `Sepkich`

Current translated total: 679 `Strings/UI` entries.

### UZ-012 — Forge, Ginger Island, and Perfection Tracker

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-island-forge-perfection.json`
- Entries: 107
- Scope: Forge instructions and errors, construction and special-order notices, darts, Willy's boat repairs, every Ginger Island parrot upgrade, island travel labels, hard-mode mine notices, name-change responses, the Perfection Tracker, and end-credit group labels
- Glossary decisions applied: `Temirxona`, `toblash / toblash jarayoni`, `Toblashni bekor qilish`, `Cho‘g‘ parchasi`, `Maxsus buyurtma`, `Willy qayig‘i`, `Orol dala idorasi`, `Orol fermasi uyi`, `Oltin yong‘oq`, `To‘tiqush ekspressi`, `Orol dam olish maskani`, `Vulqon`, `Qazish maydoni`, `Changalzor`, `Bandargoh`, `Mukammallik`, `Yulduz tomchisi`, `Soya xalqi`, `Shilimshiqlar`, and `Ko‘rshapalaklar`

### UZ-013 — race chat, mobile controls, and tutorials

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-mobile-tutorials.json`
- Entries: 101
- Scope: Parrot Express confirmation, page navigation, race guesses and results, hard-mode Skull Cavern notices, mobile character labels, display and toolbar settings, all 26 tutorial messages, save recovery, every mobile control scheme, Android storage migration, and cloud-save status
- Glossary decisions applied: `To‘tiqush ekspressi`, `Bosh suyagi g‘ori`, `mahluq`, `Ekran o‘lchamini sozlash`, `Bo‘lingan ekran`, `Tik asboblar paneli`, `Asboblar paneli atrofidagi bo‘shliq`, `Jurnal`, `Pelikan shaharchasi`, `Sug‘orgich`, `Anjomlar`, `To‘plamlar`, `Avtomatik saqlash`, and `Bekor qilish`

Current translated total: 887 `Strings/UI` entries. The English source contains 887 entries, so `Strings/UI` is complete for this source snapshot.

### UZ-014 — NPC display names and titles

- Target: `Strings/NPCNames`
- English source: `unpacked-all/Strings/NPCNames.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/npc-names.json`
- Entries: 49 of 49
- Scope: every NPC display name; personal names remain names, while glossary-backed roles and titles are localized
- Glossary decisions applied: `Ayiq`, `Birdie`, `Qo‘riqchi`, `Mitti`, `Gubernator`, `Bobo`, `Yugurdak`, `Mister Qi`, `Keksa dengizchi`, `Professor Snail`, and `Sehrgar`

### UZ-015 — tools and upgrades

- Target: `Strings/Tools`
- English source: `unpacked-all/Strings/Tools.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/tools.json`
- Entries: 54 of 54
- Scope: names, upgrade tiers, and descriptions for axes, fishing rods, hoes, lantern, Milk Pail, pans, pickaxes, Return Scepter, shears, Trash Can, and Watering Can
- Glossary decisions applied: `Bolta`, `Baliq qarmog‘i`, all five named rod variants, `Ketmon`, `Sut chelagi`, `Mis / Po‘lat / Oltin / Iridiy`, all four `tova` tiers, `Cho‘kich`, `Qaytish hassasi`, `Qaychi`, `Axlat qutisi`, `Sug‘orgich`, `ruda`, and `qalqovich`
- Placeholder preserved: `{0}` in `TrashCan_Description`

### UZ-016 — farm-animal names and moods

- Target: `Strings/FarmAnimals`
- English source: `unpacked-all/Strings/FarmAnimals.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/farm-animals.json`
- Entries: 30 of 30
- Scope: all displayed animal types plus sleep, arrival, hunger, sadness, happiness, overnight, and dog-disturbance mood messages
- Glossary decisions applied: all five chicken types, both cow types, `Dinozavr`, `O‘rdak`, `Echki`, `Tuyaqush`, `Cho‘chqa`, `Quyon`, and `Qo‘y`
- Placeholder preserved: `{0}` in all 16 parameterized mood entries

### UZ-017 — weapons and combat tools

- Target: `Strings/Weapons`
- English source: `unpacked-all/Strings/Weapons.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/weapons.json`
- Entries: 134 of 134
- Scope: all 67 weapon names and their 67 descriptions, including swords, daggers, clubs, slingshots, scythes, villager keepsakes, Galaxy weapons, and Infinity weapons
- Glossary decisions applied: `Qilich / Xanjar / Gurzi`, `Rogatka`, `O‘roq`, `Oltin o‘roq`, `Iridiy o‘roq`, `Galaktika qilichi / Galaktika xanjari / Galaktika bolg‘asi`, and `Abadiyat tig‘i / Abadiyat xanjari / Abadiyat to‘qmog‘i`

### UZ-018 — Ginger Island world-map labels

- Target: `Strings/WorldMap`
- English source: `unpacked-all/Strings/WorldMap.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/world-map.json`
- Entries: 14 of 14
- Glossary decisions applied: `Changalzor kulbasi`, `Qazish maydoni`, `Orol savdogari`, `Vulqon`, `Willy qayig‘i`, `Dam olish maskani`, `Qaroqchilar ko‘rfazi`, `Birdie kulbasi`, `Taomxo‘r qurbaqa`, `Orol fermasi uyi`, `Qi’ning Yong‘oq xonasi`, `Kema qoldig‘i`, and `Yo‘lbars shilimshiqlari daraxtzori`

### UZ-019 — enchantment names

- Target: `Strings/EnchantmentNames`
- English source: `unpacked-all/Strings/EnchantmentNames.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/enchantment-names.json`
- Entries: 18 of 18
- Glossary decisions applied: all six weapon enchantments, all eight tool enchantments, and all four fishing enchantments from the canonical glossary

### UZ-020 — remixed bundle names

- Target: `Strings/BundleNames`
- English source: `unpacked-all/Strings/BundleNames.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/bundle-names.json`
- Entries: 19 of 19
- Scope: every displayed remixed-bundle name, with possessive English labels rendered as Uzbek genitives for composition with the existing `to‘plam` UI term

### UZ-021 — random dialogue lexicon

- Target: `Strings/Lexicon`
- English source: `unpacked-all/Strings/Lexicon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/lexicon.json`
- Entries: 20 of 20
- Scope: randomized positive, negative, and food descriptors plus child terms, pronouns, yes/no answers, and the generic farmer label
- Control syntax preserved: all `#`-separated variant counts match the English source

### UZ-022 — farm buildings and building interactions

- Target: `Strings/Buildings`
- English source: `unpacked-all/Strings/Buildings.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/buildings.json`
- Entries: 69 of 69
- Scope: construction and entry status, silo and mill messages, Fish Pond restrictions, paint regions, all farm-building names, and every building description
- Glossary decisions applied: `Pichan`, `Silos`, `Molxona`, `Katta molxona`, `Hashamatli molxona`, `Parrandaxona`, `Katta parrandaxona`, `Hashamatli parrandaxona`, `Omborxona`, `Kulba`, `Baliq hovuzi`, `Oltin soat`, `Issiqxona`, all four obelisks, `Junimo kulbasi`, `Tegirmon`, `Jo‘natma qutisi`, `Shilimshiqxona`, `Otxona`, `Quduq`, and `Uy hayvoni kosasi`
- Placeholders preserved: `{0}` and `{1}` in all six parameterized entries

### UZ-023 — activity and animation dialogue

- Target: `Strings/animationDescriptions`
- English source: `unpacked-all/Strings/animationDescriptions.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/animation-descriptions.json`
- Entries: 21 of 21
- Scope: every short line shown while villagers play, work, exercise, read, receive an examination, or practice an activity
- Control syntax preserved: `%` action markers, `$` dialogue commands, `#` branches, and `*...*` action text

### UZ-024 — pants, shorts, skirts, and dresses

- Target: `Strings/Pants`
- English source: `unpacked-all/Strings/Pants.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/pants.json`
- Entries: 38 of 38
- Scope: every wearable lower-body item name and description
- Glossary decisions applied: `Shim`, `Shim rangi`, and `Prizmatik`; recurring apparel terms are standardized as `shortik`, `yubka`, and `ko‘ylak`

### UZ-025 — Trout Derby and SquidFest participants

- Target: `Strings/SimpleNonVillagerDialogues`
- English source: `unpacked-all/Strings/SimpleNonVillagerDialogues.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/simple-non-villager-dialogues.json`
- Entries: 22 of 22
- Scope: every ambient participant line for the Trout Derby and SquidFest
- Glossary decisions applied: `Forel musobaqasi`, `Kalmar bayrami`, `Grampleton`, `Qarmoqchi`, `yem`, and `Oltin nishon`; speaker labels are standardized throughout each `||` dialogue sequence
- Control syntax preserved: all `||` dialogue separators

### UZ-026 — shop and house speech bubbles

- Target: `Strings/SpeechBubbles`
- English source: `unpacked-all/Strings/SpeechBubbles.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/speech-bubbles.json`
- Entries: 70 of 70
- Scope: all short greetings and contextual shop/house bubbles for Robin, Marnie, Marlon, Maru, Leah, Elliott, Morris, Sandy, Lewis, Gus, Gunther, and Pierre
- Placeholders and controls preserved: `{0}`, `{1}`, and the spouse-heart `<` marker

### UZ-027 — birth, night events, and book titles

- Target: `Strings/Events`
- English source: `unpacked-all/Strings/Events.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/events.json`
- Entries: 27 of 27
- Scope: childbirth and adoption prompts, animal births, overnight farm-event messages, Night Market opening, Maru's comet lines, and Elliott's three book titles
- Glossary decisions applied: `chaqaloq`, `asrab olish`, and `Tungi bozor`
- Placeholders preserved: `{0}` and `{1}` in all eleven parameterized entries

### UZ-028 — lost-item quest templates

- Target: `Strings/Quests`
- English source: `unpacked-all/Strings/Quests.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/quests.json`
- Entries: 2 of 2
- Scope: the lost-item discovery message and return-to-NPC objective
- Placeholders preserved: `{0}` and `{1}`

### UZ-029 — movie-theater concessions

- Target: `Strings/MovieConcessions`
- English source: `unpacked-all/Strings/MovieConcessions.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/movie-concessions.json`
- Entries: 48 of 48
- Scope: every cinema snack name and description
- Glossary decisions applied: `Joja Cola`, `shilimshiq`, and `Yulduz tomchisi`; branded `JojaCorn` is preserved while ordinary food names are localized

### UZ-030 — movie titles, descriptions, and scenes

- Target: `Strings/Movies`
- English source: `unpacked-all/Strings/Movies.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/movies.json`
- Entries: 87 of 87
- Scope: all titles, descriptions, and displayed scenes for the eight cinema films
- Glossary decisions applied: `Stardew Valley`, `Ferngill Respublikasi`, `Gavhar dengizi`, `Fern orollari`, `Zuzu shahri`, `Dasht qirolining sarguzashti`, `Dasht qiroli`, `Wumbus`, `Yulduz tomchisi`, and `Grampleton`
- Control syntax preserved: paired `*...*` action markers in the horror-film scene

### UZ-031 — end credits

- Target: `Strings/credits`
- English source: `unpacked-all/Strings/credits.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/credits.json`
- Entries: 78 of 78 numeric array indices
- Scope: credit headings, language labels, platform and QA roles, official links, and the closing thank-you line; personal and company names remain unchanged
- Control syntax preserved: all `[image]`, `[3]`, `[link]`, URLs, image coordinates, and the final spouse-heart `<` marker

### UZ-032 — special orders and Qi challenges

- Target: `Strings/SpecialOrderStrings`
- English source: `unpacked-all/Strings/SpecialOrderStrings.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/special-order-strings.json`
- Entries: 146 of 146
- Scope: every town-board special order, randomized crop/fish/monster/resource fragment, all twelve Qi challenges, and the three Desert Festival Marlon quests
- Glossary decisions applied: `Maxsus buyurtma`, `Bochka`, `Qattiq yog‘och`, `Populyatsiya`, `Pelikan shaharchasi`, `Zuzu shahri`, `Souslar malikasi`, `Sehrgar`, all four cave-monster names, `Prizmatik shilimshiq`, `Prizmatik parcha`, `Junimo Kart`, `Bosh suyagi g‘ori`, `mahluq`, `Umumgeoda`, and `Iridiy rudasi`
- Control syntax preserved: all named braces such as `{FishType:Text}` and `{Treasure:LocalizedName}`, plus `$h#$b#` dialogue commands

### UZ-033 — Objects, first A batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-a-01.json`
- Entries: 60 of 1532, source positions 0–59
- Scope: wallet-item messages, catalogue and recipe labels, then object names and descriptions from Acorn through Ancient Fruit
- Glossary decisions applied: `Zanjabil oroli`, `Qora tumor`, `Sehrli siyoh`, `Lupa`, `Ayiq bilimi`, `Ko‘k piyoz mahorati`, `Maxsus tumor`, `Sirli qayd`, `To‘plamlar`, `Yovvoyi urug‘lar`, and `Yetiltirilgan ikra`
- Placeholders preserved: `{0}` in all six parameterized entries

## Next safe batch

Continue the short English data targets with glossary-backed item names, system notes, and the first basic location batch. Keep each target in a separate auditable file and validate every key and token before moving to long-form villager dialogue.
