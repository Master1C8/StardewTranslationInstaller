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

## Overall textual coverage

- Stable denominator: 14,720 unique English `(Target, key)` text/data records enumerated by the complete technical reference manifest
- Current coverage after UZ-069: 3,871 / 14,720 records (26.30%)
- The Russian reference is used only to enumerate the technical target/key universe; every translated value still comes exclusively from the English base
- This percentage measures text/data records. Locale-specific image work is tracked separately and is not mixed into the textual denominator

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

### UZ-034 — Objects, second A/B batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-a-02.json`
- Entries: 60 of 1532, source positions 60–119
- Scope: object names and descriptions from Ancient Seed through Battery Pack
- Glossary decisions applied: `urug‘ / nihol`, `Qarmoqchi`, `kritik zarba`, `Yem`, `baliq paneli`, `Tikanli ilgak`, `Zanjabil oroli`, and `Oddiy nam saqlovchi tuproq`

### UZ-035 — Objects, first B/book batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-b-01.json`
- Entries: 60 of 1532, source positions 120–179
- Scope: object names and descriptions from Bat Wing through Friendship 101
- Glossary decisions applied: `Ko‘rshapalak`, `panjarali ekin`, `Ko‘k o‘t ekish to‘plami`, `Shilimshiq inkubatori`, `Qisqichbaqa tuzog‘i`, `Mudofaa`, and `do‘stlik`
- Numeric values preserved exactly across all three object batches, including growth days, percentages, `+1`, and `Friendship 101`

### UZ-036 — Objects, second B/C batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-b-02.json`
- Entries: 60 of 1532, source positions 180–239
- Scope: remaining permanent-power books, then object names and descriptions from Bouquet through Calcite
- Glossary decisions applied: `Sirli quti`, `Souslar malikasi`, `Ot`, `Ikra`, `Aralash urug‘lar`, `Guldasta`, `Hasharot go‘shti`, `mahluq`, and `chiqindi`
- Numeric values preserved exactly, including `50%`, book parts `1/2`, `5%`, `8`, `2.0`, `12`, and `3`

### UZ-037 — Objects, first C batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-c-01.json`
- Entries: 60 of 1532, source positions 240–299
- Scope: object names and descriptions from Calico Egg through Clam
- Glossary decisions applied: `Kaliko tuxumi`, `Cho‘l bayrami`, `Sinov yemi`, `mukammal tutish`, `baliq paneli`, `Qora ikra`, `Cho‘g‘ parchasi`, and `urug‘ / nihol`
- Numeric values preserved exactly, including growth values `3`, `12`, `28`, and `8`

### UZ-038 — Objects, second C batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-c-02.json`
- Entries: 60 of 1532, source positions 300–359
- Scope: object names and descriptions from Clay through Cranberry Sauce
- Glossary decisions applied: `Bochka`, `Birlashgan uzuk`, `Mis rudasi / quyma`, `Po‘kak qalqovich`, `baliq paneli`, `Yem`, and `Qisqichbaqa tuzog‘i`
- Technical unknowns preserved: both ConcernedApe Mask strings remain exactly `???`
- Numeric values preserved exactly, including crop growth value `14`

### UZ-039 — Objects, third C/D batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-c-03.json`
- Entries: 60 of 1532, source positions 360–419
- Scope: object names and descriptions from Cranberry Seeds through Dried Starfish
- Glossary decisions applied: `Qiziquvchanlik xo‘ragi`, `Hashamatli yem`, `baliq paneli`, `Hashamatli o‘g‘it`, `Hashamatli nam saqlovchi tuproq`, `Deluxe Speed-Gro`, `Bezatilgan aylangich`, `iridiy`, and `Ilon`
- Placeholders preserved: `{0}` in both dynamic dried-fruit strings
- Numeric values preserved exactly, including `7`, `100%`, and `25%`

### UZ-040 — Objects, first D–F batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-d-01.json`
- Entries: 60 of 1532, source positions 420–479
- Scope: Dried Starfish description, then object names and descriptions from Driftwood through Fairy Seeds
- Glossary decisions applied: `Mitti / mittilar tili`, `Mittilar tilini tarjima qilish qo‘llanmasi`, `Sehrgar`, `Sepkich`, `Rogatka`, `Bochka`, and `Pech`
- Numeric values preserved exactly: crop growth `5` and weapon speed `10%`; Dwarf Scroll Roman numerals `I–IV` are unchanged

### UZ-041 — Objects, second F batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-f-01.json`
- Entries: 60 of 1532, source positions 480–539
- Scope: Fairy Seeds description, then object names and descriptions from Fairy Stone through Frozen Geode
- Glossary decisions applied: canonical `Tola` for `Fiber` and `fermer`; other item names in this range were translated directly from English because the canonical glossary has no exact entries for them
- Numeric values preserved exactly: crop growth periods `12` and `7`

### UZ-042 — Objects, first F–G batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-g-01.json`
- Entries: 60 of 1532, source positions 540–599
- Scope: Frozen Geode description, then object names and descriptions through Golden Egg name
- Glossary decisions applied: canonical `Temirchi`, `Geoda`, `Galaktika ruhi`, `toblash`, `Echki`, and `fermer`
- Numeric values preserved exactly: forge count `3`, garlic growth period `4`, and coin count `1`

### UZ-043 — Objects, second G–H batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-g-02.json`
- Entries: 60 of 1532, source positions 600–659
- Scope: Golden Egg description, then object names and descriptions through Herring
- Glossary decisions applied: canonical `Oltin sirli quti`, `Oltin yong‘oq`, `Zanjabil oroli`, `O‘t ekish to‘plami`, `Yashil yomg‘ir`, `Tola`, `Aralash urug‘lar`, `Qattiq yog‘och`, and `Pichan`
- Numeric value preserved exactly: grape growth period `10`

### UZ-044 — Objects, H–J batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-h-01.json`
- Entries: 60 of 1532, source positions 660–719
- Scope: object names and descriptions from Holly through Jasper
- Glossary decisions applied: canonical `Ot`, `mahluq`, `Hyper Speed-Gro`, `iridiy`, `Sepkich`, and `kritik zarba / Kritik kuch`
- Placeholder preserved exactly: `{0}` in the flavored Honey name
- Numeric values preserved exactly: crop growth `11`, fertilizer bonus `33%`, ring bonuses `10%`, and sprinkler coverage `24`

### UZ-045 — Objects, J–L batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-j-01.json`
- Entries: 60 of 1532, source positions 720–779
- Scope: object names and descriptions from Jazz Seeds through Lost Book
- Glossary decisions applied: canonical `Joja korporatsiyasi`, `Jurnal parchasi`, `O‘roq`, `baliq paneli`, `Qo‘rg‘oshin qalqovich`, `afsonaviy baliq`, `Echki`, `Willy`, `Robin`, and `Yo‘qolgan kitob`
- Placeholders preserved exactly: `{0}` in flavored Jelly and Juice names
- Numeric values preserved exactly: crop growth periods `7` and `6`, plus the Roman numeral `II`
- Terminology corrections applied to prior batches: `Golden Bobber` now uses canonical `qalqovich`, and trellis growth uses canonical `panjara`

### UZ-046 — Objects, L–M batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-l-01.json`
- Entries: 60 of 1532, source positions 780–839
- Scope: object names and descriptions from Lucky Lunch through Midnight Squid
- Glossary decisions applied: canonical `Uzuk`, `Sehrli yem`, `Prizmatik parcha`, `Temirchi`, `Geoda`, `Zanjabil oroli`, and `Suvpari kuloni`
- Numeric values preserved exactly: mango growth period `28` and melon growth period `12`

### UZ-047 — Objects, M–O batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-m-01.json`
- Entries: 60 of 1532, source positions 840–899
- Scope: object names and descriptions from Milk through Obsidian
- Glossary decisions applied: canonical `Aralash urug‘lar`, `mahluq / dushman`, `Mox`, `Kino chiptasi`, `Kinoteatr`, `Holsizlik`, and `Sirli quti`
- Quoted status name preserved semantically as `«Holsizlik»`; no control tokens or numeric literals occur in this batch

### UZ-048 — Objects, O–P batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-o-01.json`
- Entries: 60 of 1532, source positions 900–959
- Scope: object names and descriptions from Ocean Stone through Pet License
- Glossary decisions applied: canonical `mahluq`, `Umumgeoda`, `Temirchi`, `Moy`, `Hammom binosi`, `Tuyaqush`, `Uy hayvoni`, and `Uy hayvoni kosasi`
- Numeric values preserved exactly: fruit-tree growth `28`, empty surrounding tiles `8`, parsnip growth `4`, and pepper growth `5`

### UZ-049 — Objects, P batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-p-01.json`
- Entries: 60 of 1532, source positions 960–1019
- Scope: object names and descriptions from Petrified Slime through Prehistoric Tool name
- Glossary decisions applied: canonical `Shilimshiq`, `Uzuk`, `Pierre`, and `Qaroqchi`; `Prehistoric` follows the existing direct-English decision `Tarixdan oldingi`
- Placeholder preserved exactly: `{0}` in the dynamic Pickles name
- Numeric values preserved exactly: fossil age `100,000`, pineapple growth `14`, fruit-tree growth `28`, empty surrounding tiles `8`, poppy growth `7`, potato growth `6`, and powdermelon growth `7`

### UZ-050 — Objects, P–R batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-p-02.json`
- Entries: 60 of 1532, source positions 1020–1079
- Scope: Prehistoric Tool description, then object names and descriptions through Radish name
- Glossary decisions applied: canonical `Sepkich`, `Prizmatik parcha`, `Shilimshiq`, `Sovrin chiptasi`, `Sovrin mashinasi`, `Qi gavhari`, `Sifatli qalqovich`, `Sifatli o‘g‘it`, `Sifatli nam saqlovchi tuproq`, `yumshatilgan tuproq`, and `Zuzu shahri`
- Numeric values preserved exactly: pumpkin growth `13`, Qi Bean growth `4`, Qi Fruit shipment `500`, and sprinkler coverage `8`

### UZ-051 — Objects, R batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-r-01.json`
- Entries: 60 of 1532, source positions 1080–1139
- Scope: Radish description, then object names and descriptions through Ruby
- Glossary decisions applied: canonical `yomg‘ir`, `Junimolar`, `uy hayvoni`, `Shilimshiq`, `O‘roq`, `Yoba`, `Ikra`, and `Konserva idishi`
- Placeholder preserved exactly: `{0}` in the dynamic Roe name
- Numeric values preserved exactly: radish growth `6`, red cabbage growth `9`, rhubarb growth `13`, and rice growth `8`

### UZ-052 — Objects, R–S batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-r-02.json`
- Entries: 60 of 1532, source positions 1140–1199
- Scope: object names and descriptions from Ruby Ring through the Bait And Bobber skill book
- Glossary decisions applied: canonical `Uzuk`, `Mitti / mittilarga oid`, `Daraxt shirasi`, `mahluq`, `Sirli qayd`, `Dehqonchilik`, `Baliqchilik`, `tajriba`, `Yem`, and `qalqovich`
- Numeric value preserved exactly: Ruby Ring attack bonus `10%`; the English word `ten` in the Rusty Spoon description remains the Uzbek word `o‘n`

### UZ-053 — Objects, S batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-s-01.json`
- Entries: 60 of 1532, source positions 1200–1259
- Scope: the remaining skill books, then object names and descriptions from Slate through Spice Berry
- Glossary decisions applied: canonical `Terimchilik`, `Konchilik`, `Jang`, `Shilimshiq`, `Dudlangan baliq`, `Sonar qalqovich`, `mahluq`, `Yem`, `Speed-Gro`, and `yumshatilgan tuproq`
- Placeholders preserved exactly: `{0}` in both Smoked Fish strings and both targeted Bait strings
- Numeric values preserved exactly: Spangle growth `8` and Speed-Gro bonus `10%`

### UZ-054 — Objects, S batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-s-02.json`
- Entries: 60 of 1532, source positions 1260–1319
- Scope: object names and descriptions from Spicy Eel through Strange Doll
- Glossary decisions applied: canonical `Aylangich`, `Ko‘k piyoz`, `Bahor`, `Sepkich`, `zaiflashtirish`, `Stardew Valley`, `Yulduz tomchisi`, `ko‘mir`, and `to‘siq`
- Literal `???` preserved exactly for the Strange Doll description
- Numeric values preserved exactly: sprinkler coverage `4` and Starfruit growth `13`

### UZ-055 — Objects, S–T batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-s-03.json`
- Entries: 60 of 1532, source positions 1320–1379
- Scope: object names and descriptions from Strawberry through Tiger Slime Egg
- Glossary decisions applied: canonical `Yoz`, `Kuz`, `Qish`, `uy hayvoni`, `Uzuk`, `Choy niholi`, `dushman`, and `Shilimshiq inkubatori`
- Numeric values preserved exactly: strawberry growth `8`, sturgeon lifespan `150`, summer squash growth `6`, sunflower growth `8`, taro growth `10`, and tea maturity `20`

### UZ-056 — Objects, T–V batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-t-01.json`
- Entries: 60 of 1532, source positions 1380–1439
- Scope: object names and descriptions from Tiger Trout through Vampire Ring
- Glossary decisions applied: canonical `Uzuk`, `Tuzoq qalqovich`, `Xazina sandig‘i`, `Xazina ovchisi`, `Daraxt o‘g‘iti`, `Oltin nishon`, `Forel musobaqasi`, `Bolta`, `Yog‘och`, `Tegirmon`, and `mahluq`
- Numeric values preserved exactly: tomato growth `11` and tulip growth `6`; spelled-out `Triple` remains spelled-out Uzbek `Uch`

### UZ-057 — Objects, V–W batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-v-01.json`
- Entries: 60 of 1532, source positions 1440–1499
- Scope: object names and descriptions from Vegetable Medley through Wild Bait
- Glossary decisions applied: canonical `Bo‘shliq`, `Soya xalqi`, `Ko‘chish totemi`, `Sohil`, `Kaliko cho‘li`, `Ferma`, `Zanjabil oroli`, `Zuzu shahri`, `fermer`, `Tola`, `Aralash urug‘lar`, `O‘roq`, `Tovuq`, `Yovvoyi yem`, and `Linus`
- Quoted `warrior energy` preserved semantically as `«jangchi quvvati»`
- Numeric value preserved exactly: wheat growth `4`; spelled-out `two` remains spelled-out Uzbek `ikki`

### UZ-058 — Objects, W–Y final batch

- Target: `Strings/Objects`
- English source: `unpacked-all/Strings/Objects.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/objects-w-01.json`
- Entries: 32 of 1532, source positions 1500–1531
- Scope: all remaining object names and descriptions from Wild Horseradish through Yam Seeds
- Glossary decisions applied: canonical `Guldasta`, `sevishib yurish`, `Qish`, `Yog‘och`, and `to‘siq`
- Placeholder preserved exactly: `{0}` in the dynamic Wine name
- Numeric value preserved exactly: yam growth `10`

`Strings/Objects` is now fully covered: all 1532 English keys have a dedicated Uzbek value, with no key copied from the Russian reference.

### UZ-059 — Boots

- Target: `Data/Boots`
- English source: `unpacked-all/Data/Boots.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-boots.json`
- Entries: all 18 English boot records
- Scope: every boot/shoe display name and description; price, defense, immunity, index, and repeated internal display-name slots are preserved
- Glossary decisions applied: canonical `Etik / oyoq kiyim`, `iridiy`, `Emily`, `Mitti`, and `Suvpari`
- Delimiter contract preserved: exactly 7 slash-separated fields per entry; fields 3–6 remain byte-for-byte equal to English and the repeated final display name matches the translated first field

### UZ-060 — Achievements

- Target: `Data/Achievements`
- English source: `unpacked-all/Data/Achievements.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-achievements.json`
- Entries: all 39 English achievement records
- Scope: every achievement title and requirement; unlock flags, prerequisite IDs, and icon IDs are preserved
- Glossary decisions applied: canonical `Yutuqlar`, `do‘stlik / yuraklar`, `Muzey`, `yasash`, `pishirish`, `Yordam kerak`, `Stardew Valley yarmarkasi`, `Gubernator`, `Zanjabil oroli`, `qurol`, `Mukammallik`, and `Cho‘qqi`
- Delimiter contract preserved: exactly 5 caret-separated fields per entry; fields 3–5 remain byte-for-byte equal to English
- Numeric values preserved exactly, including earnings thresholds, heart levels, people/item/fish counts, and `1st → 1-o‘rin`

### UZ-061 — Community Center bundles

- Target: `Data/Bundles`
- English source: `unpacked-all/Data/Bundles.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-bundles.json`
- Entries: all 31 English bundle records
- Scope: every standard Community Center bundle label, the four Vault amounts, and the Missing Bundle label
- Glossary decisions applied: canonical `to‘plam`, `ekin`, `terim buyumi`, `hayvon mahsuloti`, `hunarmand mahsuloti`, `Qisqichbaqa tuzog‘i`, `Temirchi`, `Geolog`, and `Yo‘qolgan to‘plam`
- Composition contract preserved: labels are written to fit the existing `{0} to‘plami` UI template; possessive labels use Uzbek genitive forms, and the adjectival `The Missing` is rendered as `Yo‘qolgan buyumlar` so the complete generated name is grammatical
- Delimiter contract preserved: exactly 7 slash-separated fields per entry; fields 2–6 remain byte-for-byte equal to English and the repeated final label matches the translated first field
- Every reward code, item ID, item count, quality value, color/index field, required-slot count, and Vault amount remains unchanged

### UZ-062 — Monsters

- Target: `Data/Monsters`
- English source: `unpacked-all/Data/Monsters.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-monsters.json`
- Entries: all 51 English monster records
- Scope: every monster display name stored by the base `Data/Monsters` table
- Glossary decisions applied: canonical `Shilimshiq`, `Ko‘rshapalak`, `Chang ruhi`, `Duggy`, `Tosh qisqichbaqasi`, `Skelet afsungari`, `Mumiya`, `Ilon`, `Qalampir reks`, `Yo‘lbars shilimshig‘i`, `Magma ruhi`, `Magma uchquni`, `Arvoh`, `Karbon arvohi`, `Badbo‘y arvoh`, `Yovvoyi golem`, `Iridiy golem`, and `Qirollik iloni`
- Delimiter contract preserved: exactly 15 slash-separated fields per entry; fields 1–14 remain byte-for-byte equal to English and only the final display-name field is localized
- The English record keys remain unchanged; together with the English display slot they disambiguate the three base rows whose two English labels differ: `Dust Spirit / Dust Sprite`, `Iridium Golem / Wilderness Golem`, and `Truffle Crab / Rock Crab`
- Every health, damage, defense, movement, drop table, probability, sprite/index, spawn, and behavior value remains unchanged

### UZ-063 — Fish data

- Target: `Data/Fish`
- English source: `unpacked-all/Data/Fish.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-fish.json`
- Entries: all 74 English fish, algae, seaweed, and crab-pot catch records
- Scope: every display name stored by the base `Data/Fish` table
- Naming contract: each English display name was matched to exactly one English `Strings/Objects` `*_Name` key and reuses the already reviewed Uzbek value from the completed `Strings/Objects` translation
- Delimiter contract preserved: all 64 rod-catch records retain exactly 14 slash-separated fields and all 10 trap-catch records retain exactly 8; only the first display-name field is localized
- Every difficulty, movement type, size, time window, season, weather, location/depth, probability, minimum level, tutorial flag, trap habitat, and numeric value remains byte-for-byte equal to English

### UZ-064 — Hats

- Target: `Data/hats`
- English source: `unpacked-all/Data/hats.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-hats.json`
- Entries: all 122 English hat records
- Scope: every hat, cap, mask, bow, head accessory, pan, helmet, crown, turban, and pair of goggles; both display names and all descriptions are localized
- Glossary decisions applied: canonical `Shlyapachi / shlyapa`, `Mitti / Mittilar`, `Sehrgar`, `Janob Qi`, `Abigail`, `Emily`, `Gil`, `Gubernator`, `Joja`, `Junimo`, `Kaliko cho‘li`, `Qal’a qishlog‘i`, `Tuyaqush`, `Mumiya`, `Skelet`, `Qaroqchi`, `Prizmatik`, and `Abadiyat`
- Delimiter contract preserved: all 94 legacy records retain exactly 6 slash-separated fields and all 28 indexed records retain exactly 7; fields 3–5 and every seventh index field remain byte-for-byte equal to English, while the repeated sixth display name matches the translated first field
- Control content preserved: both `???` marker records and both `100%` numeric values remain exact

### UZ-065 — NPC gift reactions

- Target: `Data/NPCGiftTastes`
- English source: `unpacked-all/Data/NPCGiftTastes.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-npc-gift-tastes.json`
- Entries: all 39 English records: 5 universal item/category lists plus all 34 NPC rows
- Visible scope: all 170 love, like, dislike, hate, and neutral gift-reaction lines, with each character’s warmth, terseness, formality, humor, or dialectal flavor retained in natural Uzbek
- Delimiter contract preserved: every NPC row retains exactly 11 slash-separated fields; only message fields 1, 3, 5, 7, and 9 are localized, while all five item/category fields and the trailing field remain byte-for-byte equal to English
- The five universal records are copied byte-for-byte from the English base because they contain only internal item IDs and category tokens
- Control syntax preserved exactly: player marker `@`, dialogue break `#$e#`, emotion markers `$u`, `$h`, `$s`, and Sandy’s trailing `~`; translated stage directions remain enclosed in matching `*...*`
- Overall textual coverage after this batch: 3,739 / 14,720 unique English records (25.40%)

### UZ-066 — Quest data

- Target: `Data/Quests`
- English source: `unpacked-all/Data/Quests.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-quests.json`
- Entries: all 66 English quest records
- Visible scope: 198 titles, descriptions, and objectives plus all 29 completion replies, for 227 localized text fields in total
- Record contract preserved: all 37 nine-field records and all 29 ten-field records retain their original slash-delimited shape; quest type, target/location, item ID, next-quest ID, reward, and cancellation flag fields remain byte-for-byte equal to English
- Control syntax preserved exactly in corresponding fields: player marker `@`, dialogue breaks `#$b#`, emotion markers `$7`, `$h`, `$s`, and `$u`; translated stage directions remain enclosed in matching `*...*`
- Numeric tokens are unchanged, including times, quantities, mine floors, rewards, and progress counters
- Glossary decisions applied: canonical `Jamoat markazi`, `Sehrgar`, `Janob Qi`, `Hokim Lewis`, `Sohil`, `Konlar`, `Bosh suyagi g‘ori`, `Dehqonchilik`, `Qarg‘a qo‘riqchisi`, `Parrandaxona`, `Molxona`, `Silos`, `Pech`, `Temirchi`, `Temirchixona`, `Sarguzashtchilar uyushmasi`, `Muzey`, `artefakt`, `mineral`, `Jodugar kulbasi`, `Kanalizatsiya`, `Qora tumor`, `Sehrli siyoh`, `Krobus`, `Birdie`, `O‘roq`, and `Zanjabil oroli`; item names reuse reviewed Uzbek `Strings/Objects` values
- Overall textual coverage after this batch: 3,805 / 14,720 unique English records (25.85%), an increase of 0.45 percentage points

### UZ-067 — Festival calendar names

- Target: `Data/Festivals/FestivalDates`
- English source: `unpacked-all/Data/Festivals/FestivalDates.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-festival-dates.json`
- Entries: all 8 English festival-date records
- Scope: every festival name displayed through the base festival calendar table; internal seasonal date keys remain unchanged
- All eight values come directly from canonical glossary entries: `Tuxum bayrami`, `Gullar raqsi`, `Luau`, `Oy shu’lali meduzalar raqsi`, `Stardew Valley yarmarkasi`, `Ruhlar arafasi`, `Muz bayrami`, and `Qish yulduzi ziyofati`
- Overall textual coverage after this batch: 3,813 / 14,720 unique English records (25.90%), an increase of 0.05 percentage points

### UZ-068 — Engagement dialogue

- Target: `Data/EngagementDialogue`
- English source: `unpacked-all/Data/EngagementDialogue.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-engagement-dialogue.json`
- Entries: all 26 English records for the twelve marriage candidates and Krobus
- Scope: all post-engagement remarks plus Krobus’s housemate responses, retaining each character’s excitement, uncertainty, humor, or reserve in natural Uzbek
- Glossary decisions applied: canonical `ferma / Ferma`, `fermer`, `nikoh / turmush o‘rtoq`, `unashtirilgan`, and Krobus’s non-romantic `uydosh` relationship context
- Control syntax preserved exactly and in source order: player marker `@`, dialogue breaks `#$b#` and `#$e#`, and emotion markers `$h` and `$l`
- Overall textual coverage after this batch: 3,839 / 14,720 unique English records (26.08%), an increase of 0.18 percentage points

### UZ-069 — The Queen of Sauce cooking channel

- Target: `Data/TV/CookingChannel`
- English source: `unpacked-all/Data/TV/CookingChannel.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-tv-cooking-channel.json`
- Entries: all 32 English cooking-channel episodes
- Scope: every recipe name and complete television presentation, preserving the host’s enthusiastic, conversational cooking-show voice
- Naming contract: every recipe title is matched to its unique English `Strings/Objects` `*_Name` key and reuses the already reviewed Uzbek object value
- Delimiter contract preserved: every record retains exactly two slash-separated fields, with the English numeric episode keys unchanged
- Glossary decisions applied: canonical `Bahor`, `Qish`, `Qish yulduzi ziyofati`, `Pelikan shaharchasi`, `Zuzu shahri`, `Stardew Valley`, `Gubernator`, and `Qisqichbaqa tuzog‘i`; ingredient names reuse established object terminology
- Overall textual coverage after this batch: 3,871 / 14,720 unique English records (26.30%), an increase of 0.22 percentage points

## Next safe batch

Continue the short English data targets with glossary-backed item names and system notes. Keep each target in a separate auditable file and validate every key and token before moving to long-form villager dialogue.
