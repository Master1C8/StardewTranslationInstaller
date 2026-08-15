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
- Current coverage after UZ-448: 14,720 / 14,720 records (100.00%)
- The Russian reference is used only to enumerate the technical target/key universe; every translated value still comes exclusively from the English base
- This percentage measures text/data records. Locale-specific image work is tracked separately and is not mixed into the textual denominator

## Finalization record — 2026-08-12

- 463 translation JSON files are included exactly once and cover all 14,720 enumerated records
- 14,642 source-backed records pass key, placeholder, marker, and line-structure comparison; 78 `Strings/credits` records absent from the extraction were reviewed separately
- the local Uzbek glossary matches all 673 canonical stable IDs and values
- 308 event scripts pass structural comparison
- two consecutive full all-entry editorial audits completed with no changes and zero actionable findings
- live QA covers the Uzbek language button, title atlas, compact UI labels, and direct Russian VN → Uzbek VN → Polish VN switching
- the package is now in maintenance mode; the reusable conclusions and regression procedure are in [`UZBEK_IMPLEMENTATION_RUNBOOK.md`](UZBEK_IMPLEMENTATION_RUNBOOK.md)

## Completed batches
### UZ-448 — Activate every Uzbek resource in Content Patcher

- Scope: added explicit `Include` entries for the remaining 118 Uzbek JSON resources; all 463 files under `assets/translations/uzbek/` are now registered by the root `content.json`
- Technical preservation: no translation values or keys changed; this block only closes the packaging/activation gap for festival, furniture, movie-reaction, CS-string, map-string, and location resources
- Audit result: `content.json` Include set exactly matches the 463-file Uzbek resource set; no missing or extra resource paths
- Overall textual coverage after this batch: 14,720 / 14,720 unique English records (100.00%)

### UZ-447 — Technical marker and gender-placeholder audit corrections

- Scope: corrected seven existing Uzbek records whose translated text had lost or added control markers, gender placeholders, or an event line-break marker
- Files: `dialogue-elliott.json`, `dialogue-leah.json`, `dialogue-pierre.json`, `marriage-dialogue-alex.json`, `dialogue-evelyn.json`, `data-events-haley-house-1.json`, and `data-events-manor-house-1.json`
- Technical preservation: all `$` markers, `${...^...}$` placeholders, event `#$b#` breaks, and English-to-Uzbek key mappings now match the English control contract
- Audit result: all 14,642 source-backed records have matching control-marker multisets and placeholder counts; no missing or unknown non-credit keys
- Overall textual coverage after this batch: 14,720 / 14,720 unique English records (100.00%)

### UZ-446 — IslandHut parrot child and Sewer reconciliation

- Targets: `Data/Events/IslandHut`, `Data/Events/Sewer`
- English sources: `unpacked-all/Data/Events/IslandHut.json` and `unpacked-all/Data/Events/Sewer.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-island-hut-sewer-1.json`
- Entries: 2
- Scope: Leo’s parrot-child memory and name reveal, plus the Dwarf/Krobus reconciliation mediated by the Wizard
- Technical preservation: `quickQuestion` option breaks, actor spawns, temporary sprites, animation, combat movement, music, and all event endings
- Glossary decisions applied: `oltin yong‘oq`, `Soya odami`, `Unsur urushlari`, `Mitti`, `kanalizatsiya`, and `Va’da muhri`
- Overall textual coverage after this batch: 14,720 / 14,720 unique English records (100.00%)

### UZ-445 — HaleyHouse darkroom, group, and Emily scenes

- Target: `Data/Events/HaleyHouse`
- English source: `unpacked-all/Data/Events/HaleyHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-haley-house-4.json`
- Entries: 5
- Scope: Haley’s darkroom invitation, the girls’ confrontation and casual gathering, Emily’s dream message, and her private dance performance
- Technical preservation: `question`/`fork` branches, `$q/$r/$b` response markers, `@` placeholders, music, lighting, animation, and event endings
- Glossary decisions applied: `qorong‘i xona`, `sovuq muomala`, `maxfiy mashg‘ulot`, `bitiruv bazmi`, and established Haley/Emily vocabulary
- Overall textual coverage after this batch: 14,718 / 14,720 unique English records (99.99%)

### UZ-444 — Saloon public reveal and Alex dinner scenes

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-9.json`
- Entries: 2
- Scope: the group confrontation after the farmer dates multiple bachelors, plus Alex’s private dinner conversation with Emily
- Technical preservation: all actor movement, animation, sound, music, `question`/`fork` branches, `@` placeholders, and `$a/$s/$u/$l/$9/$10` markers
- Glossary decisions applied: `sovuq muomala`, `shaxsiy xona`, `qo‘ziqorinli qaymoq sousi`, `yong‘oqli salat`, `grilda pishirilgan bifshteks`, and established Alex/Emily vocabulary
- Overall textual coverage after this batch: 14,713 / 14,720 unique English records (99.95%)

### UZ-443 — FarmHouse Harvey and Penny scenes

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-10.json`
- Entries: 3
- Scope: Harvey's anniversary dinner, Penny's handmade quilt, and bedroom redecoration choice
- Technical preservation: `quickQuestion` trees, mail/conversation topics, `noQuilt` branch, emotes, animation, and scene messages
- Glossary decisions applied: `farishta sochlari makaroni`, `butun donli`, `ko‘rpa`, `yotoqxona bezagi`, and `popover`

### UZ-442 — Woods bear and Emily scenes

- Target: `Data/Events/Woods`
- English source: `unpacked-all/Data/Events/Woods.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-woods-2.json`
- Entries: 2
- Scope: the bear's forest-magic exchange and Emily's camp sleeping-bag scene
- Technical preservation: item removal/addition, bear actor animation, reward messages, event emotes, and scene endings
- Glossary decisions applied: `o‘rmon sehri`, `sevimli sous`, `maxsus bilim`, `lososrezavor`, and `uxlash xaltasi`

### UZ-441 — Trailer_Big Pam faith scene

- Target: `Data/Events/Trailer_Big`
- English source: `unpacked-all/Data/Events/Trailer_Big.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-trailer-big-2.json`
- Entries: 1
- Scope: Pam's prayer, new-house comfort, alcohol struggle, and faith confrontation
- Technical preservation: house-upgrade conditions, Joja URL text, mail flags, emotes, and dialogue ending
- Glossary decisions applied: `ibodat`, `haykalcha`, `qulaylik`, `kambag‘allik`, and `ishonch`

### UZ-440 — SamHouse Kent and Sam scenes

- Target: `Data/Events/SamHouse`
- English source: `unpacked-all/Data/Events/SamHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sam-house-2.json`
- Entries: 3
- Scope: Kent's popcorn trauma, Sam's band planning, and the snack-rejection branch
- Technical preservation: `$q/$r` responses, `$p` branch variants, music/emotes, sounds, and dialogue endings
- Glossary decisions applied: `urush xotirasi`, `popkorn`, `jam sessiyasi`, `sintezator`, and `tamaddi`

### UZ-439 — Railroad Harvey balloon and Wizard scenes

- Target: `Data/Events/Railroad`
- English source: `unpacked-all/Data/Events/Railroad.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-railroad-1.json`
- Entries: 3
- Scope: Harvey's balloon date, the Wizard's magic-ink quest, and Harvey's fear branch
- Technical preservation: `question fork1`, balloon cutscene transitions, `${lad^miss}$`, timing/viewport commands, and dialogue endings
- Glossary decisions applied: `havo shari`, `tumor`, `qora sehr`, `balandlikdan qo‘rqish`, and `muhrlamoq`

### UZ-438 — JoshHouse Alex, Harvey, and George scenes

- Target: `Data/Events/JoshHouse`
- English source: `unpacked-all/Data/Events/JoshHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-josh-house-2.json`
- Entries: 3
- Scope: Alex's apology, Harvey's health check-up with George, and George's leek-gift branches
- Technical preservation: `$q/$r` responses, `${good guy^fine young woman}$`-style branches, `quickQuestion`, gifts, animations, and sound effects
- Glossary decisions applied: `kuch mashqlari`, `natriy`, `ikkinchi fikr`, `porey`, and `hazilkash`

### UZ-437 — Hospital Harvey, ManorHouse therapy, and Mine Abigail

- Targets: `Data/Events/Hospital`, `Data/Events/ManorHouse`, `Data/Events/Mine`
- English sources: `unpacked-all/Data/Events/Hospital.json`, `ManorHouse.json`, and `Mine.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-hospital-manor-mine-1.json`
- Entries: 3
- Scope: Harvey's radio/pilot scene, Emily's clothing therapy event, and Abigail's cave confession
- Technical preservation: `question fork1`, `$q/$r` responses, gender branches, model/actor commands, and event endings
- Glossary decisions applied: `uchuvchi`, `kiyim terapiyasi`, `o‘zini ifoda etish`, `qilichbozlik`, and `g‘or`

### UZ-436 — ScienceHouse Maru robot and Robin bed scenes

- Target: `Data/Events/ScienceHouse`
- English source: `unpacked-all/Data/Events/ScienceHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-science-house-2.json`
- Entries: 3
- Scope: Maru's burn accident, the MarILDA robot launch, and Robin's deluxe four-poster bed
- Technical preservation: `$q/$r` responses, robot messages, `${good guy^fine young woman}$`, `quickQuestion` branches, actor animation, and scene endings
- Glossary decisions applied: `kuyishga qarshi krem`, `o‘zini anglash`, `sun’iy hayot`, `qattiq yog‘och`, and `to‘rt ustunli karavot`

### UZ-435 — Saloon accountability branches

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-8.json`
- Entries: 3
- Scope: the explanation, crying, and worried-response branches after the arcade confrontation
- Technical preservation: `question fork2`, `fork crying`, gender branch `^`, emotes, group jumps, and warp-out endings
- Glossary decisions applied: `bosim qilmoq`, `hamdardlik`, `javobgarlik`, `nayrang`, and `arkada mashinasi`

### UZ-434 — Trailer Penny and Pam scenes

- Target: `Data/Events/Trailer`
- English source: `unpacked-all/Data/Events/Trailer.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-trailer-1.json`
- Entries: 3
- Scope: Penny's house-cleaning argument, recipe tasting, and Pam's potato-juice gag
- Technical preservation: friendship/gender branches, `$q/$r` responses, `$p` naming branch, item/sound commands, and dialogue endings
- Glossary decisions applied: `tartibsiz`, `retsept`, `ta’m sinovchisi`, `fermentlangan`, and `kartoshka sharbati`

### UZ-433 — WizardHouse Junimo and magic-ink scenes

- Target: `Data/Events/WizardHouse`
- English source: `unpacked-all/Data/Events/WizardHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-wizard-house-2.json`
- Entries: 2
- Scope: the Wizard's Junimo scroll lesson and the magic-ink reward
- Technical preservation: Junimo actor/sprite commands, message text, forest-vision sequence, farmer eating command, and reward ending
- Glossary decisions applied: `sehrli haqiqat`, `ruh`, `Junimo`, `o‘rmon sehri`, `chaqiruv kitobi`, and `siyoh`

### UZ-432 — BusStop Robin welcome and Shane gridball scenes

- Target: `Data/Events/BusStop`
- English source: `unpacked-all/Data/Events/BusStop.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-bus-stop-2.json`
- Entries: 2
- Scope: the new farmer's arrival at the farm and Shane's first gridball game
- Technical preservation: `%farm`, `$q/$r` response IDs, bus/warp movement, game sound flow, and all scene endings
- Glossary decisions applied: `duradgor`, `qishloqona`, `gridbol`, `o‘yinoldi hayajoni`, and `osoyishtalik`

### UZ-431 — IslandSouth Leo departure

- Target: `Data/Events/IslandSouth`
- English source: `unpacked-all/Data/Events/IslandSouth.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-island-south-leo-1.json`
- Entries: 1
- Scope: Linus and Willy's plan to bring Leo to Stardew Valley, the decision branch, and the parrot farewell
- Technical preservation: conversation topic, actor movement, parrot sprites/sounds, `quickQuestion` branch, messages, and `end Leo`
- Glossary decisions applied: `materik`, `tabiat farzandi`, `to‘tiqushlar oilasi`, `hayot bobi`, and `xayrlashuv`

### UZ-430 — Pam thanks and Marlon mine introduction

- Targets: `Data/Events/Trailer_Big`, `Data/Events/Mine`
- English sources: `unpacked-all/Data/Events/Trailer_Big.json` and `Mine.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-pam-marlon-1.json`
- Entries: 3
- Scope: Pam's gratitude, Marlon's abandoned-mine introduction, and the technical mine-death recovery flow
- Technical preservation: emote/viewport movement, quest award, sword item, festival prize command, placeholders, and `minedeath`
- Glossary decisions applied: `ta’sirchan`, `shaxta qudug‘i`, `ruda`, `sarguzashtchilar gildiyasi`, and `tashlandiq`

### UZ-429 — FishShop Willy fishing scene

- Target: `Data/Events/FishShop`
- English source: `unpacked-all/Data/Events/FishShop.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-fish-shop-1.json`
- Entries: 1
- Scope: Willy's fish-bait lesson, fishing questions, and community-center business conversation
- Technical preservation: `${lad^miss}$`, `${man^lady}$`, `${trust a fisherman^count on a lady who fishes}`, `quickQuestion` branches, and all animation/sound timing
- Glossary decisions applied: `mashq tayoqchasi`, `baliq ovlash`, `sovrin`, `jamoat markazi`, and `kun kechirmoq`

### UZ-428 — Community Center Morris–Pierre punch scene

- Target: `Data/Events/CommunityCenter`
- English source: `unpacked-all/Data/Events/CommunityCenter.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-community-center-punch-1.json`
- Entries: 1
- Scope: the JojaMart–Pierre confrontation and its comic fight sequence
- Technical preservation: frame/animation timing, movement, sound effects, viewport fade, message text, and `end position` scene ending
- Glossary decisions applied: `chegirma`, `hamkasb`, `tuhmat`, `sifat`, and `miqdor`

### UZ-427 — Island Leo conversations

- Targets: `Data/Events/IslandNorth`, `Data/Events/IslandWest`
- English sources: `unpacked-all/Data/Events/IslandNorth.json` and `IslandWest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-island-leo-1.json`
- Entries: 2
- Scope: Leo's adjustment to ordinary speech, island memories, family belonging, and home questions
- Technical preservation: parrot sound/animation sequences, `quickQuestion` and `question` branches, conditional dialogue, and scene endings
- Glossary decisions applied: `oqsoqol`, `to‘tiqushlar tili`, `qirg‘oqqa chiqmoq`, `tegishli bo‘lmoq`, and `yong‘oq`

### UZ-426 — Sunroom Caroline tea scene

- Target: `Data/Events/Sunroom`
- English source: `unpacked-all/Data/Events/Sunroom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sunroom-1.json`
- Entries: 1
- Scope: Caroline's private sunroom, tea ritual, and relaxation conversation
- Technical preservation: mail flag, temporary sprite, `quickQuestion` branches, farmer eating command, green-tea cutscene, and warp-out ending
- Glossary decisions applied: `quyosh xonasi`, `panohgoh`, `damlangan choy`, `shifobaxsh`, and `sevimli mashg‘ulot`

### UZ-425 — Sandy introduction and Qi secret room

- Targets: `Data/Events/SandyHouse`, `Data/Events/QiNutRoom`
- English sources: `unpacked-all/Data/Events/SandyHouse.json` and `QiNutRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sandy-qi-1.json`
- Entries: 2
- Scope: Sandy's Oasis introduction and Mr. Qi's secret walnut-room briefing
- Technical preservation: bus/service mail context, emotes, all dialogue breaks, Qi reward terminology, and scene endings
- Glossary decisions applied: `voha`, `maxfiy xona`, `sinov`, `valyuta`, `Qi gavharlari`, and `radioaktiv`

### UZ-424 — BoatTunnel, HarveyRoom, and DesertFestival scenes

- Targets: `Data/Events/BoatTunnel`, `Data/Events/HarveyRoom`, `Data/Events/DesertFestival`
- English sources: `unpacked-all/Data/Events/BoatTunnel.json`, `HarveyRoom.json`, and `DesertFestival.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-boat-harvey-desert-1.json`
- Entries: 3
- Scope: Willy's Fern Islands boat repair offer, Harvey's pilot dream scene, and the Desert Festival defeat flow
- Technical preservation: `${lad^miss}$`, `quickQuestion` branches, cutscene/viewport commands, event emotes, and the no-dialogue `PlayerKilled` sequence
- Glossary decisions applied: `qattiq yog‘och`, `iridiy langar`, `uchuvchi`, `model samolyot`, and `vulqonli orol`

### UZ-423 — AnimalShop Shane recovery and coop scenes

- Target: `Data/Events/AnimalShop`
- English source: `unpacked-all/Data/Events/AnimalShop.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-animal-shop-2.json`
- Entries: 2
- Scope: Shane's sobriety progress, Jas's bunny slippers, and the blue-hen coop scene
- Technical preservation: friendship/event conditions, emotes, frame changes, movement, and all scene endings
- Glossary decisions applied: `gazli suv`, `suyanmoq`, `taqinchoq`, `molxona`, and `tekinxo‘r`

### UZ-422 — SeedShop aerobics and quality-crops scenes

- Target: `Data/Events/SeedShop`
- English source: `unpacked-all/Data/Events/SeedShop.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-seed-shop-3.json`
- Entries: 2
- Scope: Harvey's secret dance-aerobics class and Pierre's overpriced organic-vegetable pitch
- Technical preservation: animation/facing sequence, `$q/$r` response IDs, `quickQuestion` breaks, `advancedMove`, `textAboveHead`, and scene endings
- Glossary decisions applied: `aerobika`, `organik`, `noyob nav`, `biznes strategiyasi`, and `sabzavotli kechki ovqat`

### UZ-421 — Bath House Penny scene

- Target: `Data/Events/BathHouse_Pool`
- English source: `unpacked-all/Data/Events/BathHouse_Pool.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-bath-house-pool-1.json`
- Entries: 2
- Scope: Penny's evening pool confession and the heartbroken branch ending
- Technical preservation: swimming state, `$q/$r` response IDs, `fork pennyHeartbroken`, offsets, temporary heart sprite, and warp-out ending
- Glossary decisions applied: `hammom`, `cho‘milish kiyimi`, `his-tuyg‘ular`, and `rad etmoq`

### UZ-420 — Sam's band performance variants

- Target: `Data/Events/Temp`
- English source: `unpacked-all/Data/Events/Temp.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-temp-2.json`
- Entries: 4
- Scope: the Pelicans, Goblin Destroyer, Xenon Chip 3.0, and Alfalfas performance variants
- Technical preservation: conditional `$p` song lines, animation timings, mail flag, `${his^her}$`, emotes, and scene endings
- Glossary decisions applied: `dehqonchilik`, `konchilik`, `honki-tonk`, `demo kassetasi`, and `faxriy a’zo`

### UZ-419 — Backwoods Abigail golem rescue

- Target: `Data/Events/Backwoods`
- English source: `unpacked-all/Data/Events/Backwoods.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-backwoods-1.json`
- Entries: 1
- Scope: Abigail's rock-golem rescue, aftermath, and burial conversation
- Technical preservation: world-state flag, golem sprites/animations, movement offsets, `quickQuestion` branches, break-command pause, sounds, and scene ending
- Glossary decisions applied: `mahluq`, `hamdardlik`, `qutqarmoq`, `dafn qilmoq`, and `qilich`

### UZ-418 — Hospital Harvey checkup and recovery

- Target: `Data/Events/Hospital`
- English source: `unpacked-all/Data/Events/Hospital.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-hospital-2.json`
- Entries: 2
- Scope: Harvey's annual checkup and the post-collapse emergency-care scene
- Technical preservation: advanced movement, vitals animation, `$q/$r`, `{0}` placeholder, `hospitaldeath`, and scene endings
- Glossary decisions applied: `yillik ko‘rik`, `hayotiy ko‘rsatkichlar`, `shifokor`, and `shoshilinch operatsiya`

### UZ-417 — Junimo return and Prize Ticket introduction

- Targets: `Data/Events/AbandonedJojaMart`, `Data/Events/ManorHouse`
- English sources: `unpacked-all/Data/Events/AbandonedJojaMart.json` and `unpacked-all/Data/Events/ManorHouse.json`, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/data-events-abandoned-joja-manor-1.json`, `assets/translations/uzbek/data-events-manor-house-1.json`
- Entries: 2
- Scope: the missing Junimo's return home and Lewis's Prize Ticket program introduction
- Technical preservation: sprite text, animation/fade sequence, `quickQuestion`, break-command backslashes, warp, and quest-linked event structure
- Glossary decisions applied: `Junimo`, `xayrixohlik`, `Mukofot chiptasi`, `sovrin`, and `Yordam kerak`

### UZ-416 — IslandSouth departure and revival events

- Target: `Data/Events/IslandSouth`
- English source: `unpacked-all/Data/Events/IslandSouth.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-island-south-1.json`
- Entries: 2
- Scope: island boat departure flow and mine-death revival response
- Technical preservation: simultaneous command/fade sequence, location-specific boat commands, `{0}/{1}/{2}` placeholders, and `minedeath`
- Glossary decisions applied: `uyg‘onmoq` and `qayta jonlanish`

### UZ-415 — BusStop Sam departure and Krobus event

- Target: `Data/Events/BusStop`
- English source: `unpacked-all/Data/Events/BusStop.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-bus-stop-1.json`
- Entries: 2
- Scope: Sam's group departure for the show and the seasonal Krobus event
- Technical preservation: bus transition, temporary map, positions, `cutscene bandFork`, mail flag, quest, and sound/warp flow
- Glossary decisions applied: `jihoz`, `avtobus`, `hayajon`, and `muvaffaqiyat`

### UZ-414 — Hospital Maru sample accident

- Target: `Data/Events/Hospital`
- English source: `unpacked-all/Data/Events/Hospital.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-hospital-1.json`
- Entries: 2
- Scope: Maru's ruined sample, Harvey's response, and the truth-telling branch
- Technical preservation: `$p`, `$q/$r`, `fork toldTruth`, hospital sprites/portraits, sounds, and scene ending
- Glossary decisions applied: `namuna`, `yaroqsiz`, `baxtsiz hodisa`, and `sabr`

### UZ-413 — FarmHouse Haley cake-walk and Sebastian frog scenes

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-9.json`
- Entries: 2
- Scope: Haley's charity cake-walk invitation and Sebastian's frog terrarium branches
- Technical preservation: quests/world state, conversation topics, both `quickQuestion` trees, break-command backslashes, temporary sprites, and messages
- Glossary decisions applied: `xayriya`, `tort-yurishi`, `terrarium`, `boshpana`, and `qurbaqacha`

### UZ-412 — ArchaeologyHouse Elliott readings and Gunther donation

- Target: `Data/Events/ArchaeologyHouse`
- English source: `unpacked-all/Data/Events/ArchaeologyHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-archaeology-house-1.json`
- Entries: 4
- Scope: Elliott's science-fiction, mystery, and romance readings plus Gunther's museum donation scene
- Technical preservation: reading forks, all warp/viewport/fade operations, animation frames, quest transitions, and artifact donation flow
- Glossary decisions applied: `ilmiy-fantastik`, `detektiv`, `romantik`, `artefakt`, and `mineral`

### UZ-411 — AnimalShop cave carrot and Shane collapse scenes

- Target: `Data/Events/AnimalShop`
- English source: `unpacked-all/Data/Events/AnimalShop.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-animal-shop-1.json`
- Entries: 2
- Scope: Marnie's cave-carrot quest completion and Shane's collapse intervention
- Technical preservation: `${Mr.^Ms.}$`, quest/item removal, friendship change, temporary sprites, tile removal, sounds, movement, and scene ending
- Glossary decisions applied: `g‘or sabzisi`, `hushidan ketmoq`, `aralashuv`, and `echki`

### UZ-410 — ElliottHouse writing and piano scenes

- Target: `Data/Events/ElliottHouse`
- English source: `unpacked-all/Data/Events/ElliottHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-elliott-house-1.json`
- Entries: 5
- Scope: Elliott's writing aspirations, piano performance, novel deadline, and farm-help branches
- Technical preservation: `$q/$r`, `question fork1`, `fork howLong`/`fork extraHelp`, `switchEvent`, animation frames, position offsets, and global fade
- Glossary decisions applied: `yozuvchi`, `adabiy orzu`, `detektiv`, `ilmiy-fantastik`, and `qo‘shimcha yordamchi`

### UZ-409 — JoshHouse George, Evelyn, and Alex scenes

- Target: `Data/Events/JoshHouse`
- English source: `unpacked-all/Data/Events/JoshHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-josh-house-1.json`
- Entries: 3
- Scope: George's accident story, Evelyn's cookie recipe, and Alex's self-doubt about books
- Technical preservation: gender branches, `#$b#`, `$q/$r`, recipe ID `Cookies`, message, animation, and scene endings
- Glossary decisions applied: `ko‘mir koni`, `dinamit`, `pechenye`, `retsept`, and `daho`

### UZ-408 — SamHouse fish and rejection scenes

- Target: `Data/Events/SamHouse`
- English source: `unpacked-all/Data/Events/SamHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sam-house-1.json`
- Entries: 4
- Scope: Jodi and Kent's fish dinners, Sam's romantic scene, and his rejection response
- Technical preservation: quest/item removal, object placement, `positionOffset`, music, emotes, message notifications, and both `end dialogue Sam` endings
- Glossary decisions applied: `bass`, `qarsildoq`, `kechki ovqat`, `rad javobi`, and `oila`

### UZ-407 — Temp room responses

- Target: `Data/Events/Temp`
- English source: `unpacked-all/Data/Events/Temp.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-temp-1.json`
- Entries: 3
- Scope: Haley's dark-room decoration and departure responses, plus Elliott's embarrassed reply
- Technical preservation: `${he^she}$`, face directions, frame changes, position offsets, and both dialogue endings
- Glossary decisions applied: `bezash`, `qorong‘i xona`, `befahm`, and `xijolat`

### UZ-406 — ScienceHouse Maru, Demetrius, and Robin scenes

- Target: `Data/Events/ScienceHouse`
- English source: `unpacked-all/Data/Events/ScienceHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-science-house-1.json`
- Entries: 4
- Scope: soil-sample assistance, Demetrius's awkward comment, tomato classification, and Robin's crafting lesson
- Technical preservation: `${He^She}$`, `$q/$r`, `fork DadWeird`, crafting recipe IDs, message, movement, and `end Maru1`
- Glossary decisions applied: `tuproq namunasi`, `kolba`, `tasnif`, `duradgorlik`, and `chizma`

### UZ-405 — SeedShop Joja coupon scene

- Target: `Data/Events/SeedShop`
- English source: `unpacked-all/Data/Events/SeedShop.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-seed-shop-2.json`
- Entries: 1
- Scope: Morris's JojaMart coupon pitch and Pierre's reaction
- Technical preservation: broadcast event, `advancedMove`, viewport/fade, animation, sounds, and `end dialogue Pierre`
- Glossary decisions applied: `chegirma kuponi`, `korporatsiya`, `sodiq mijoz`, and `ustun tanlov`

### UZ-404 — SeedShop Abigail and Pierre scenes

- Target: `Data/Events/SeedShop`
- English source: `unpacked-all/Data/Events/SeedShop.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-seed-shop-1.json`
- Entries: 5
- Scope: Abigail's arcade and spirit-board scenes, Pierre's secret stash, and the Abigail–Caroline argument
- Technical preservation: `cutscene AbigailGame`, `fork beatGame`, `%firstnameletter`, sprite/animation commands, `$q/$r`, `message`, and `end dialogue Abigail`
- Glossary decisions applied: `bosqich`, `joystick`, `ruhlar taxtasi`, `jamg‘arma`, and `arvoh`

### UZ-403 — Leah art, internet, and ex-partner scenes

- Target: `Data/Events/LeahHouse`
- English source: `unpacked-all/Data/Events/LeahHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-leah-house-1.json`
- Entries: 8
- Scope: Leah's sculpture lesson, internet-art path, ex-partner conversation, laptop shop, and art-show follow-ups
- Technical preservation: all `question`/`fork` branches, `${He^She}$`, `$q/$r`, `#$b#`, mail flags, sprite/animation commands, `leahLaptop`, CSS text, and scene endings
- Glossary decisions applied: `haykal`, `vodiy`, `san’at maskani`, `noutbuk`, `onlayn`, and `ko‘rgazma`

### UZ-402 — Gus giant omelet scene

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-7.json`
- Entries: 1
- Scope: Gus's giant omelet presentation and the villagers' tasting reactions
- Technical preservation: `%farm` placeholder, `staticSprite` path, object placement, frame changes, eating sounds, viewport movement, and scene ending
- Glossary decisions applied: `omlet`, `bulg‘or qalampiri`, `qo‘ziqorin`, `tuxum`, and `tanovul qilmoq`

### UZ-401 — Saloon Sunday sports room

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-6.json`
- Entries: 1
- Scope: Alex's Sunday sports room, the villagers' reactions, and the project wrap-up
- Technical preservation: temporary sprite, viewport and animation commands, `#$b#` line breaks, emotes, `message` notifications, and `end dialogue Alex`
- Glossary decisions applied: `sportchi`, `yakshanba`, `orzu`, `an’ana`, and `loyiha`

### UZ-400 — Saloon Clint advice scene

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-5.json`
- Entries: 1
- Scope: Clint's advice request, Emily's order, and his awkward attempt to speak with her
- Technical preservation: gender branch `^`, `$q/$r` response IDs, event advice keys, movement, music, sounds, emotes, and `end warpOut`
- Glossary decisions applied: `maslahat`, `joziba`, `tabiiy`, `ichimlik`, and `buyurtma`

### UZ-399 — Haley decision and cold-shoulder branches

- Target: `Data/Events/HaleyHouse`
- English source: `unpacked-all/Data/Events/HaleyHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-haley-house-3.json`
- Entries: 2
- Scope: the girls' confrontation, Haley's explanation choices, and the two cold-shoulder branches
- Technical preservation: `question fork2`, `fork lifestyleChoice`, all speech/emote codes, repeated jumps, `dump girls 4`, fade, viewport, and `end warpOut`
- Glossary decisions applied: `turmush tarzi`, `tanlov`, `kelishuv`, `sovuq muomala`, and `guldasta`

### UZ-398 — Haley jar and Emily stone meditation scenes

- Target: `Data/Events/HaleyHouse`
- English source: `unpacked-all/Data/Events/HaleyHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-haley-house-2.json`
- Entries: 2
- Scope: Haley's stuck jar conversation and Emily's guided gemstone meditation
- Technical preservation: `$q/$r` response IDs, animation and jitter commands, scene objects, viewport movement, `#$b#` line breaks, speech bubbles, and `message` ending
- Glossary decisions applied: `banka`, `sof energiya`, `tebranish chastotasi`, `qalb`, and `qimmatbaho tosh`

### UZ-397 — Haley weekly cleaning argument

- Target: `Data/Events/HaleyHouse`
- English source: `unpacked-all/Data/Events/HaleyHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-haley-house-1.json`
- Entries: 2
- Scope: Haley and Emily's weekly cushion-cleaning argument, player responses, and Haley's refusal branch
- Technical preservation: gender branch `${farm boy^girl from the farm}$`, `$q`, all `$r` response IDs, `fork haleyWontDoIt`, emotes, movement, and event ending
- Glossary decisions applied: `ferma`, `haftalik`, `yostiq`, `yechim`, and `vazmin`

### UZ-396 — Saloon Elliott toast scene

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-4.json`
- Entries: 1
- Scope: Elliott's post-writing visit, drinks, toast, and exit
- Technical preservation: gender branch `^`, `$q`, all four `#$r` response IDs, food animation, Elliott animation frames, and `end warpOut`
- Glossary decisions applied: `ale`, `vino`, `tost`, `Sog‘liq`, and `halokat`


### UZ-395 — Saloon first 8-ball tournament

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-3.json`
- Entries: 1
- Scope: the first Pelican Town 8-ball tournament with the male villagers
- Technical preservation: animation frames, viewport movement, face directions, fade, messages, and `end`
- Glossary decisions applied: `8-ball`, `turnir`, `billiard`, and `quyon panjasi`


### UZ-394 — Saloon Alex rejection response

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-2.json`
- Entries: 1
- Scope: Alex's apology and exit after the Josh scene rejection
- Technical preservation: music stop, shake/emote, viewport movement, global fade, and `end dialogue Alex`
- Glossary decisions applied: `noqulay ahvolga solmoq` and `och`


### UZ-393 — Saloon Gus and Pam tab conversation

- Target: `Data/Events/Saloon`
- English source: `unpacked-all/Data/Events/Saloon.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-saloon-1.json`
- Entries: 1
- Scope: Gus asking the farmer to help collect Pam's unpaid tab
- Technical preservation: `#$q`, `#$r`, event response IDs, `friendship Gus 50`, movement, sounds, and `end dialogue Gus`
- Glossary decisions applied: existing `Salun`, `hisob`, `ichimlik`, and `moliyaviy`


### UZ-392 — FarmHouse Maru comet and Elliott return scenes

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-8.json`
- Entries: 2
- Scope: Maru's comet invitation and Elliott's return from the city
- Technical preservation: seasonal/time conditions, movement, animation, heart sprite, fade, and both event endings
- Glossary decisions applied: `astronomik hodisa`, `kometa`, `sayyora`, `yarim tun`, and `eski tartib`


### UZ-391 — Sam song performance and boombox gift

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-7.json`
- Entries: 1
- Scope: Sam's song performance for Jas and Vincent, their reactions, and the boombox gift
- Technical preservation: music changes, animation timing, `itemAboveHead samBoombox`, `awardFestivalPrize samBoombox`, and `end dialogue Sam`
- Glossary decisions applied: `magnitofon`, `qo‘llab-quvvatlash`, `bolalar uchun musiqa`, and `hayajonlanmoq`


### UZ-390 — Emily handmade outfit scene

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-6.json`
- Entries: 1
- Scope: Emily's handmade outfit gift and wardrobe celebration
- Technical preservation: `awardFestivalPrize emilyClothes`, coin sound, animation, repeated `positionOffset` steps, fade, and `end dialogue Emily`
- Glossary decisions applied: existing `Emilyning sehrli shlyapasi`, `Emilyning sehrli etigi`, `Emilining sehrli ko‘ylagi`, `qo‘lda tikilgan kiyim`, and `hunarmandchilik`


### UZ-389 — Sam composer offer and response choices

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-5.json`
- Entries: 1
- Scope: Sam's junior-composer offer, children's-show reaction, and two quick-question branches
- Technical preservation: `addConversationTopic samJob2 2`, `quickQuestion`, all `(break)` segments, escaped command backslashes, animation, and `end dialogue Sam`
- Glossary decisions applied: `kichik bastakor`, `Baxtli Junimo shousi`, `orzu ish`, and `karyera`


### UZ-388 — Sam music-work conversation

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-4.json`
- Entries: 1
- Scope: Sam's wish to contribute through music and find work
- Technical preservation: `addConversationTopic samJob1 2`, movement, emotes, pauses, and `$s/$h/$8/$10`
- Glossary decisions applied: `hissa qo‘shmoq`, `maqsadsiz bekor yurmoq`, and `musiqa bilan bog‘liq`


### UZ-387 — Sam song-writing scene

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-3.json`
- Entries: 1
- Scope: Sam's progress on the song, acceptance of the children's-show idea, and finished-song promise
- Technical preservation: `addConversationTopic samJob3 3`, animation, music, long pause, emotes, and `end dialogue Sam`
- Glossary decisions applied: `cholg‘u`, `bolalar shousi`, `konsertlar olami`, and `qo‘shiq`


### UZ-386 — FarmHouse Grandpa year-three evaluation

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-2.json`
- Entries: 1
- Scope: Grandpa's full evaluation speech and the farm-future farewell
- Technical preservation: gender branch `^`, `#$b#`, `%farm`, `grandpaEvaluation`, temporary sprites, and `end bed`
- Glossary decisions applied: `ulg‘aymoq`, `qalb`, `kelajak`, and `Xayr`


### UZ-385 — FarmHouse Grandpa evaluation prelude

- Target: `Data/Events/FarmHouse`
- English source: `unpacked-all/Data/Events/FarmHouse.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-house-1.json`
- Entries: 1
- Scope: Grandpa's second-year evaluation introduction
- Technical preservation: gender branch `^`, `#$b#`, temporary sprites, `grandpaEvaluation2`, and `end bed`
- Glossary decisions applied: `nevara`, `qattiqqo‘l`, and `faxrlanmoq`


### UZ-384 — Sebastian and Robin career conversation

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-15.json`
- Entries: 1
- Scope: Robin's visit, Sebastian's work frustration, career-choice question, and return to coding
- Technical preservation: actors, movement, sounds, `question fork1`, `fork noFriends`, animation frames, keyboard typing, and `end`
- Glossary decisions applied: `tezkor xabar`, `kasbiy maqsad`, `korporativ kalamush poygasi`, and `modul`


### UZ-383 — Sebastian necromancer encounter

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-14.json`
- Entries: 1
- Scope: Xarth's introduction, shadow-beam attack, healing choice, and Sebastian's finishing spell
- Technical preservation: role forks, `question fork0`, `fork healedSam`, combat/healing sounds, `savedFriends`, minigame updates, and `switchEvent end`
- Glossary decisions applied: existing `Jangchi`, `Sehrgar`, `Sof nur o‘qi`, `Solarion asosi`, and `Dreadlord`


### UZ-382 — Sebastian final boss role branches

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-13.json`
- Entries: 2
- Scope: Wizard and Warrior final-boss decisions against Xarth
- Technical preservation: both `question fork0` branches, `castBeam`/`chargeAhead`, combat sounds, `savedFriends`, minigame updates, and `switchEvent end`
- Glossary decisions applied: `Sof nur`, `Qalqon tumori`, `Soya o‘qi`, and `afsun`


### UZ-381 — Sebastian final boss attack branches

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-12.json`
- Entries: 2
- Scope: the spell-casting and sword-charge outcomes against Xarth
- Technical preservation: spell/combat sounds, minigame updates, `yoba`, `getNewSpecialItem`, and both `switchEvent end` transitions
- Glossary decisions applied: `soya nuri`, `hamroh`, `Solarion asosi`, and `tinchlik va tartib`


### UZ-380 — Sebastian tabletop resolution

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-11.json`
- Entries: 3
- Scope: Sam's successful rescue, the prisoner-room exit, and Sebastian's closing remarks
- Technical preservation: healing/combat sounds, minigame updates, `switchEvent end`, `switchEvent wizardDoor`, emote, `$s`, `$7`, fade, and `end`
- Glossary decisions applied: `tinchlik va tartib`, `hamroh`, `ssenariy`, and `kirib o‘tmoq`


### UZ-379 — Sebastian tabletop adventure opening

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-10.json`
- Entries: 1
- Scope: the Solarion adventure opening, tower approach, skeleton encounter, and combat decisions
- Technical preservation: cutscene, music, minigame updates, three questions, all forks, `killedSkeleton`, and `switchEvent sewer`
- Glossary decisions applied: existing `Solarion`, `Nekromant minorasi`, `Dreadlord Xarth`, `afsonalar zali`, and `hamroh`


### UZ-378 — Sebastian dungeon approach

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-9.json`
- Entries: 3
- Scope: the sewer corridor, transformed prisoners in capsules, and the door before Xarth
- Technical preservation: minigame state, music, `question fork1`/`question fork0`, `fork wizardDoor`/`fork leave`, `destroyedPods`, and `switchEvent` transitions
- Glossary decisions applied: `kanalizatsiya`, `mahbus`, `kapsula`, `narvon`, and `Dreadlord Xarth`


### UZ-377 — Sebastian tabletop escape branches

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-8.json`
- Entries: 3
- Scope: the skeleton attack consequence, retreat route, and hidden back entrance
- Technical preservation: combat/minigame updates, sound effects, pauses, and all three `switchEvent sewer` transitions
- Glossary decisions applied: `guruh`, `lyuk`, `narvon`, and `hudud`


### UZ-376 — Sebastian tabletop role-playing scene

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-7.json`
- Entries: 1
- Scope: Solarion tabletop-game invitation, scenario setup, and warrior/healer/wizard character selection
- Technical preservation: frames, movement, sound effects, `question chooseCharacter`, `$7`, `$h`, `addMailReceived choseWizard`, and `switchEvent opening`
- Glossary decisions applied: existing `Jangchi`, `Sehrgar`, `Solarion yilnomalari: O‘yin`, and `Nekromant minorasi`


### UZ-375 — Sebastian friends and work monologue

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-6.json`
- Entries: 1
- Scope: Sebastian's reflection on friendship, solitude, computers, and returning to work
- Technical preservation: emotes, pauses, mouse/keyboard sounds, animation, movement, fade, viewport, and `end`
- Glossary decisions applied: `ijtimoiy hayot`, `modul`, `xudbin emas`


### UZ-374 — Sebastian typing interruption scene

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-5.json`
- Entries: 1
- Scope: Sebastian's typing scene, wait-or-leave question, and return to his room event
- Technical preservation: keyboard sound, animation, `question fork1`, `fork didntLeave`, `$u`, and `switchEvent sebastianRoom`
- Glossary decisions applied: `qator` for a line of code/text and `xayolidan chiqib ketmoq` for losing a train of thought


### UZ-373 — Sebastian room work question

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-4.json`
- Entries: 1
- Scope: Sebastian's room entry scene and its two question options
- Technical preservation: movement, sound, `question fork1`, `fork decor`, `stopAnimation Sebastian`, and `switchEvent enterRobin`
- Glossary decisions applied: `dasturchi`, `mustaqil ishlamoq`, `bezak`


### UZ-372 — Sebastian room class-choice branches

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-3.json`
- Entries: 2
- Scope: Sebastian and Sam choosing warrior or healer roles before the opening event
- Technical preservation: `emote Sam 28`, `addMailReceived choseWarrior`, `addMailReceived choseHealer`, and both `switchEvent opening` branches
- Glossary decisions applied: existing `Jangchi`; class terms rendered as `sehrgar` and `tabib`


### UZ-371 — Sebastian room decor branch

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-2.json`
- Entries: 1
- Scope: Sebastian's response when the farmer compliments the decor in his room
- Technical preservation: `pause`, `stopAnimation Sebastian`, `switchEvent enterRobin`
- Glossary decisions applied: `Bezaklar`, `plakatlar`


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
- Current file: `assets/translations/uzbek/strings-animation-descriptions.json` (fully re-audited in UZ-072; the superseded duplicate asset was removed)
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
- Delimiter contract preserved: exactly 5 caret-separated fields per entry; fields 3–5 remain byte-for-byte …53571 tokens truncated…`, `set-up`, and `secretSanta` match the English source byte-for-byte (13, 194, and 1,108 characters); only the visible festival name is translated
- Glossary decision applied: `Feast of the Winter Star` → `Qish yulduzi ziyofati`
- Overall textual coverage after this batch: 13,948 / 14,720 unique English records (94.76%), an increase of 0.03 percentage points

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

### UZ-070 — Livin’ Off The Land tip channel

- Target: `Data/TV/TipChannel`
- English source: `unpacked-all/Data/TV/TipChannel.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-tv-tip-channel.json`
- Entries: all 64 English advice episodes
- Scope: the complete four-year advice rotation covering crops, seasons, fishing, animals, mining, crafting, relationships, festivals, and farm planning, with the presenter’s informal voice retained
- Control contract preserved: every single and double caret separator remains in the same record and order; numeric values `9`, `24`, and `240` remain exact
- Repeated episode contract preserved: the repeated Salmonberry and Blackberry notices retain matching Uzbek text, while the summer-fish reminder keeps its intentionally different introduction
- Glossary decisions applied: canonical `Yerdan kun ko‘rish`, all four seasons, `Ferma`, `Qarg‘a qo‘riqchisi`, `Baliq qarmog‘i`, `qalqovich`, `Hammom`, `Chaqmoq tutgich`, `Ferma ko‘rgazmasi`, `Silos`, `Issiqxona`, `Pech`, `Temirchi`, `Geoda`, `Umumgeoda`, `Qisqichbaqa tuzog‘i`, `Yem`, `Asalari uyasi`, `Sarguzashtchilar uyushmasi`, `Bochka`, `Suvpari kuloni`, `Qayta ishlash mashinasi`, `Kristallariy`, and `Chuvalchang qutisi`; fish, crop, ingredient, and resource names reuse reviewed object terminology
- Overall textual coverage after this batch: 3,935 / 14,720 unique English records (26.73%), an increase of 0.43 percentage points

### UZ-071 — Secret Notes and Journal Scraps

- Target: `Data/SecretNotes`
- English source: `unpacked-all/Data/SecretNotes.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-secret-notes.json`
- Entries: all 38 English records: 28 complete text notes and 10 unchanged `!image` commands
- Scope: all Secret Notes, Ginger Island Journal Scraps, gift-preference lists, riddles, letters, pirate journals, forging guidance, and enchantment descriptions
- Technical contract preserved: all ten `!image N` commands and every `%revealtaste:NPC:itemId` suffix are copied byte-for-byte from English; single and repeated caret separators, player marker `@`, numeric codes, days, floors, counts, and percentages remain in their original records and order
- Puzzle contract preserved: the malformed Secret Woods clue remains intentionally broken into awkward Uzbek syllables; the Skull Cavern clue, Mermaid Show sequence, stone-size poem, and all image-only puzzle notes retain their functional structure
- Glossary decisions applied: canonical `Jamoat markazi`, `Bosh suyagi g‘ori`, `Suvpari tomoshasi`, `Junimo`, `Mayiz`, `Hammom`, `Vulqon`, `Temirxona`, `toblash`, `Sehrlash`, all weapon and tool enchantment names, `Prizmatik parcha`, `Ajdar tishi`, `Oltin yong‘oq`, and established item, meal, fish, crop, and gemstone terminology
- Overall textual coverage after this batch: 3,973 / 14,720 unique English records (26.99%), an increase of 0.26 percentage points

### UZ-072 — NPC animation remarks

- Target: `Strings/animationDescriptions`
- English source: `unpacked-all/Strings/animationDescriptions.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-animation-descriptions.json`
- Entries: all 21 English animation-description records
- Scope: every spoken remark and narrator caption displayed while NPCs play, work, exercise, read, dance, take photos, or perform other scheduled animations
- Control syntax preserved exactly and in source order: narrator prefix `%`, emotion markers `$4`, `$6`, `$7`, `$s`, and `$u`, conditional branch `$c .5#`, dialogue break `#$e#`, and paired stage-direction asterisks
- Proper names and canonical `Stardew Valley` remain unchanged; billiards, exercise, work, and animation-specific wording is rendered as concise natural Uzbek suitable for short interaction bubbles
- This batch re-audited and replaced the already complete UZ-023 target; it adds no new unique `(Target, key)` records
- Overall textual coverage after this batch: 3,973 / 14,720 unique English records (26.99%), unchanged from the preceding batch

### UZ-073 — Lost library books

- Target: `Strings/Notes`
- English source: `unpacked-all/Strings/Notes.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-notes.json`
- Entries: all 22 English records, including all 21 book texts and the missing-book message
- Scope: complete books about farming, animals, foraging, fishing, mines, scarecrows, Stardrops, arcade games, diamonds, brewing, Dwarves, Yoba, marriage, legendary fish, technology, Goblins, and Gunther’s notes
- Layout contract preserved: every source line break remains in its corresponding entry; all heading dividers, list asterisks, stage-direction asterisks, blank lines, and Goblin-book caret separators retain their original structure
- Numeric research values remain exact, including mine floors `50`, odds `1` in `500`, rate `.000016`, and Yoba’s `11` days; the untranslated artificial Dwarvish passage remains byte-for-byte equal to English because it is an in-world cipher rather than English prose
- Glossary decisions applied: canonical `Dehqonchilik`, `O‘g‘it`, `O‘roq`, `Qarg‘a qo‘riqchisi`, `Yulduz tomchisi`, `Dasht qirolining sarguzashti`, `Gavhar dengizi`, `Bochka`, `Sharbat`, `Pivo`, `Och el`, `Sharob`, `Mittilar`, `Guldasta`, `Suvpari kuloni`, `Keksa dengizchi`, `Kristallariy`, `Prizmatik parcha`, all five Afsonaviy baliq names, and `Bo‘shliq mayonezi`
- Overall textual coverage after this batch: 3,995 / 14,720 unique English records (27.14%), an increase of 0.15 percentage points

### UZ-074 — Character systems, movie theater, and phones

- Target: `Strings/Characters`
- English source: `unpacked-all/Strings/Characters.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-characters.json`
- Entries: all 171 English records
- Scope: relationship labels, horse naming, Junimo reactions, Abigail’s mine dialogue, the Goblin henchman, Krobus and the Dark Talisman, divorce and pet messages, saloon sports reactions, all movie invitations and theater prompts, spouse movie replies, every business and incoming phone call, Leo memories, Pierre’s stock list, and Marlon’s item-recovery calls
- Control contract preserved exactly and in source order: numbered placeholders `{0}` and `{1}`, player marker `@`, dialogue breaks, emotion markers, narrator marker `%`, farm-name token `%farm`, Lewis’s complete `$y` choice expression, caret variant separator, standalone phone-script hashes, underscores, trailing heart marker `<`, and every stage/sound direction enclosed in `*...*`
- Numeric values remain unchanged, including every business hour, Marnie’s `4:00 PM`, the Joja `10,000g` rebate and address number, and Leo’s internal memory IDs remain in the unchanged record keys
- Glossary decisions applied: canonical `Ferma`, `Junimo`, `Konlar`, `Qora tumor`, `Kanalizatsiya`, `Kinoteatr`, `Yulduz tomchisi saluni`, `Pierre universal do‘koni`, `Marnie ranchosi`, and established relationship, tool, festival, animal, and location terminology
- Overall textual coverage after this batch: 4,166 / 14,720 unique English records (28.30%), an increase of 1.16 percentage points

### UZ-075 — Extra dialogue: core systems and Joja onboarding

- Target: `Data/ExtraDialogue`
- English source: `unpacked-all/Data/ExtraDialogue.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-extra-dialogue-core.json`
- Entries: the first 43 of 147 English records, forming a complete core/Joja sub-batch
- Scope: lost-item thanks, childbirth and adoption, spouse and construction remarks, privacy interactions, Clint and Gunther services, Sandy and Mr. Qi’s club dialogue, mine rescues, every Morris greeting, membership state, second-player restriction, Community Development processing, and both gendered form prompts
- Control contract preserved exactly and in source order: numbered placeholders, dialogue breaks and emotion markers, all `$q`/`$r` membership choice commands with their `-1` arguments and internal `Yes`/`No` IDs, hash separators, and trailing whitespace where present in English
- Glossary decisions applied: canonical `Ferma`, `mahluq`, `Anjomlar`, `Muzey`, `artefakt`, `mineral`, `Stardew Valley`, `Konlar`, `Janob Qi`, `Joja`, `Hokim Lewis`, `Jamoat markazi`, and `Joja ombori`
- `Data/ExtraDialogue` continuation plan: purchased-item reactions, scripted Skull Cavern encounters, island dialogue, Professor Snail hints, and Summit dialogue remain in subsequent audited sub-batches
- Overall textual coverage after this batch: 4,209 / 14,720 unique English records (28.59%), an increase of 0.29 percentage points

### UZ-076 — Extra dialogue: purchased-item reactions

- Target: `Data/ExtraDialogue`
- English source: `unpacked-all/Data/ExtraDialogue.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-extra-dialogue-purchases.json`
- Entries: 37 English records at source positions 44–80, forming a complete purchased-item and dumpster-reaction sub-batch
- Scope: 34 reactions to items bought through Pierre or Willy, including quality, cooking, produce, forage, teen and character-specific variants, plus all three child, teen, and adult dumpster reactions
- Control contract preserved exactly and in source order: numbered placeholders `{0}` through `{5}`, dialogue breaks, emotion markers, and every numeric value and `g` currency suffix
- Dynamic item placeholders were restructured into natural Uzbek clauses where needed, so Uzbek case or plural suffixes are not mechanically attached to runtime item names
- Glossary decisions applied: canonical `Pierre universal do‘koni`, `Baliq do‘koni`, `terim buyumi`, `Pierre`, and `Willy`; the local 673-entry glossary snapshot was compared with the live project endpoint again before packaging and had zero Uzbek-layer differences
- A redundant duplicate JSON member found in the preceding core file was removed without changing its 43 unique translated records; the package-wide audit also consolidated the superseded 21-entry animation asset so every `(Target, key)` is counted exactly once
- Overall textual coverage after this batch: 4,246 / 14,720 unique English records (28.85%), an increase of 0.25 percentage points

### UZ-077 — Extra dialogue: Skull Cavern events and construction systems

- Target: `Data/ExtraDialogue`
- English source: `unpacked-all/Data/ExtraDialogue.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-extra-dialogue-skull-system.json`
- Entries: 11 English records at source positions 81–91
- Scope: both floor-100 Skull Cavern event variants, Robin’s normal, festival-delayed, upgrade, new-building, and instant-construction replies, Morris’s Community Development confirmation, Joja movie-theater investment offer and completion, and the no-projects response
- Event-script contract preserved: all commands, actors, coordinates, animation frames, timings, directions, sprite and quest IDs, sounds, rewards, and command separators outside quoted dialogue are byte-for-byte equal to English
- Control contract preserved: `{0}` and `{1}`, dialogue and choice commands, internal `Yes`/`No` IDs, emotion markers, asterisk stage directions, and every number including `25`, `500,000g`, `803`, and all event timings
- Glossary decisions applied: canonical `Bosh suyagi g‘ori`, `Zina`, `iridiy`, `Salomatlik`, `bayram`, `Joja ombori`, and established Joja community-development wording
- Overall textual coverage after this batch: 4,257 / 14,720 unique English records (28.92%), an increase of 0.07 percentage points

### UZ-078 — Extra dialogue: island rescues and Birdie

- Target: `Data/ExtraDialogue`
- English source: `unpacked-all/Data/ExtraDialogue.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-extra-dialogue-island-birdie.json`
- Entries: 17 English records at source positions 92–108
- Scope: Willy’s gendered island-rescue variants, Leo’s rescue response, all 14 ambient Birdie conversations, and Birdie’s no-gift response
- Control contract preserved exactly and in source order: the gender-variant caret, dialogue breaks, emotion markers, and the paired asterisks around Birdie’s sigh
- Glossary decisions applied: canonical `Zanjabil oroli`, `Mittilar`, `Vulqon`, `Changalzor`, `Sohil`, `Birdie`, `sovg‘a`, and established island terminology
- Overall textual coverage after this batch: 4,274 / 14,720 unique English records (29.04%), an increase of 0.12 percentage points

### UZ-079 — Extra dialogue: Professor Snail fossil hints

- Target: `Data/ExtraDialogue`
- English source: `unpacked-all/Data/ExtraDialogue.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-extra-dialogue-professor-snail.json`
- Entries: all eight Professor Snail hints at source positions 109–116
- Scope: frog and cave-bat habitats, snake spines, digging spots, fossil-bearing rocks, river panning, fishing for ancient bones, and Golden Coconuts
- The English fossil item IDs remain unchanged in their record keys; displayed hints use the established archaeological and island vocabulary
- Glossary decisions applied: canonical `Professor Snail`, `Zanjabil oroli`, `Orol g‘arbi`, `Ko‘rshapalak`, `qazilma`, `suyak`, `elash`, and `Oltin kokos`
- Overall textual coverage after this batch: 4,282 / 14,720 unique English records (29.09%), an increase of 0.05 percentage points

### UZ-080 — Extra dialogue: Summit finale

- Target: `Data/ExtraDialogue`
- English source: `unpacked-all/Data/ExtraDialogue.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-extra-dialogue-summit.json`
- Entries: the final 31 English records at source positions 117–147; `Data/ExtraDialogue` is now complete at 147 of 147 records
- Scope: Lewis and Morris reflections, shared spouse introductions, all 12 spouse-specific finale speeches, and the five closing messages
- Event-script contract preserved: in all seven composite spouse records, every command, actor, direction, pause, emote, duration, separator, and quote boundary outside displayed dialogue is byte-for-byte equal to English
- Control contract preserved: `%farm`, `%year`, `@`, all dialogue breaks, emotion markers, asterisk stage directions, and every numeric value
- Glossary decisions applied: canonical `Cho‘qqi`, `Pelikan shaharchasi`, `Ferma`, `Bobo`, `Hokim Lewis`, `Joja korporatsiyasi`, `fermer`, and established spouse names; the local 673-entry glossary was compared again with the live endpoint and had zero Uzbek-layer differences
- Overall textual coverage after this batch: 4,313 / 14,720 unique English records (29.30%), an increase of 0.21 percentage points

### UZ-081 — Gil dialogue

- Target: `Characters/Dialogue/Gil`
- English source: `unpacked-all/Characters/Dialogue/Gil.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-gil.json`
- Entries: all 2 English records
- Scope: Gil’s sleeping caption and his response before the player has an eligible Mahluqlarni qirish maqsadlari reward
- Control contract preserved: the paired asterisks around the sleeping sound and all leading/trailing ellipses
- Glossary decisions applied: canonical `Gil` and established `Mahluqlarni qirish maqsadlari` context
- Overall textual coverage after this batch: 4,315 / 14,720 unique English records (29.31%), an increase of 0.01 percentage points

### UZ-082 — Short schedule dialogue: Pierre, Linus, Pam, Demetrius, and Clint

- Targets: `Strings/schedules/Pierre`, `Strings/schedules/Linus`, `Strings/schedules/Pam`, `Strings/schedules/Demetrius`, and `Strings/schedules/Clint`
- English sources: the five matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-pierre.json`, `schedule-linus.json`, `schedule-pam.json`, `schedule-demetrius.json`, and `schedule-clint.json`
- Entries: all 12 English records across the five targets; each target remains in its own auditable Content Patcher file
- Scope: Friday relaxation, Night Market and winter remarks, Pam and Clint’s clinic dialogue, Demetrius’s submarine, vaccination, and medical-journal remarks
- Control contract preserved exactly: all emotion markers, hash dialogue markers, asterisk stage directions, ellipses, and source key punctuation
- Glossary decisions applied: canonical `Pierre`, `Linus`, `Pam`, `Demetrius`, `Clint`, `Suvpari tomoshasi`, `Tungi bozor` context, and established Doctor Harvey terminology
- Overall textual coverage after this batch: 4,327 / 14,720 unique English records (29.40%), an increase of 0.08 percentage points

### UZ-083 — Short schedule dialogue: Robin, Elliott, and Gus

- Targets: `Strings/schedules/Robin`, `Strings/schedules/Elliott`, and `Strings/schedules/Gus`
- English sources: the three matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-robin.json`, `schedule-elliott.json`, and `schedule-gus.json`
- Entries: all 12 English records across the three targets; each target remains in its own auditable file
- Scope: clinic, exercise, Night Market, spouse, writing, shopping, saloon, and sports-viewing remarks
- Control contract preserved exactly: player marker `@`, emotion markers, asterisk stage directions, and source key punctuation
- Glossary decisions applied: canonical `Robin`, `Elliott`, `Gus`, `Stardew Valley`, `Yulduz tomchisi saluni` context, and established Doctor Harvey terminology
- Overall textual coverage after this batch: 4,339 / 14,720 unique English records (29.48%), an increase of 0.08 percentage points

### UZ-084 — Short schedule dialogue: Leah, Vincent, and Leo

- Targets: `Strings/schedules/Leah`, `Strings/schedules/Vincent`, and `Strings/schedules/Leo`
- English sources: the three matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-leah.json`, `schedule-vincent.json`, and `schedule-leo.json`
- Entries: all 13 English records across the three targets; each target remains in its own auditable file
- Scope: Leah’s clinic, spouse, and Night Market remarks; Vincent’s boat and vaccination remarks; Leo’s Night Market, library, school, dinner, and rain dialogue
- Control contract preserved exactly: player marker `@`, dialogue breaks, emotion markers, asterisk stage directions, repeated exclamation marks, and source key punctuation
- Glossary decisions applied: canonical `Leah`, `Vincent`, `Leo`, `Muzey va kutubxona` context, Lupini’s established `asl asar` wording, and Doctor Harvey terminology
- Overall textual coverage after this batch: 4,352 / 14,720 unique English records (29.57%), an increase of 0.09 percentage points

### UZ-085 — Short schedule dialogue: Alex, Evelyn, and George

- Targets: `Strings/schedules/Alex`, `Strings/schedules/Evelyn`, and `Strings/schedules/George`
- English sources: the three matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-alex.json`, `schedule-evelyn.json`, and `schedule-george.json`
- Entries: all 18 English records across the three targets; each target remains in its own auditable file
- Scope: Alex’s sports, clinic, spouse, and Night Market remarks; Evelyn and George’s Community Center, clinic, worship, and Night Market dialogue
- Control contract preserved exactly: narrator marker `%`, player marker `@`, emotion markers, asterisk stage directions, repeated punctuation, and source key punctuation
- Glossary decisions applied: canonical `Alex`, `Evelyn`, `George`, `Pelikan shaharchasi`, `Suvpari tomoshasi`, `Yoba`, and Doctor Harvey terminology
- Overall textual coverage after this batch: 4,370 / 14,720 unique English records (29.69%), an increase of 0.12 percentage points

### UZ-086 — Short schedule dialogue: Jas, Marnie, and Sandy

- Targets: `Strings/schedules/Jas`, `Strings/schedules/Marnie`, and `Strings/schedules/Sandy`
- English sources: the three matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-jas.json`, `schedule-marnie.json`, and `schedule-sandy.json`
- Entries: all 18 English records across the three targets; each target remains in its own auditable file
- Scope: Jas and Marnie’s clinic, Night Market, exercise, and shopping remarks, plus the complete Sandy/Emily birthday outing dialogue
- Control contract preserved exactly: every number, `1:30pm`, dialogue break, emotion marker, asterisk stage direction, repeated punctuation, and source key punctuation
- Glossary decisions applied: canonical `Jas`, `Marnie`, `Sandy`, `Emily`, `Stardew Valley`, `Suvpari tomoshasi`, `JojaMart`, and Doctor Harvey terminology
- Overall textual coverage after this batch: 4,388 / 14,720 unique English records (29.81%), an increase of 0.12 percentage points

### UZ-087 — Short schedule dialogue: Haley and Harvey

- Targets: `Strings/schedules/Haley` and `Strings/schedules/Harvey`
- English sources: the two matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-haley.json` and `schedule-harvey.json`
- Entries: all 14 English records across the two targets; each target remains in its own auditable file
- Scope: Haley’s clinic, weather, spouse, and winter remarks, plus Harvey’s clinic, grocery, spouse, and winter dialogue
- Control contract preserved exactly: dialogue break `#$e#`, emotion marker `$h`, and source key punctuation
- Glossary decisions applied: canonical `Haley`, `Harvey`, `Salomatlik` context, `fasl`, and `Klinika` wording
- Overall textual coverage after this batch: 4,402 / 14,720 unique English records (29.90%), an increase of 0.09 percentage points

### UZ-088 — Short schedule dialogue: Jodi and Penny

- Targets: `Strings/schedules/Jodi` and `Strings/schedules/Penny`
- English sources: the two matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-jodi.json` and `schedule-penny.json`
- Entries: all 16 English records across the two targets; each target remains in its own auditable file
- Scope: Jodi and Penny’s clinic, family, spouse, privacy, Night Market, and weather remarks
- Control contract preserved exactly: emotion markers `$a`, `$h`, `$s`, `$u`, asterisk stage directions, and source key punctuation
- Glossary decisions applied: canonical `Jodi`, `Penny`, `Vincent`, `Maru`, `Suvpari tomoshasi` context, and Doctor Harvey terminology
- Overall textual coverage after this batch: 4,418 / 14,720 unique English records (30.01%), an increase of 0.11 percentage points

### UZ-089 — Short schedule dialogue: Caroline and Sam

- Targets: `Strings/schedules/Caroline` and `Strings/schedules/Sam`
- English sources: the two matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-caroline.json` and `schedule-sam.json`
- Entries: all 18 English records across the two targets; each target remains in its own auditable file
- Scope: Caroline and Sam’s clinic, aerobics, family, holiday shopping, spouse, submarine, and Joja Cola remarks
- Control contract preserved exactly: emotion markers `$7`, `$h`, `$u`, dialogue break `#$e#`, asterisk stage directions, and source key punctuation
- Glossary decisions applied: canonical `Caroline`, `Sam`, `Harvey`, `Joja Cola`, `Tungi bozor`/holiday context, and established doctor terminology
- Overall textual coverage after this batch: 4,436 / 14,720 unique English records (30.14%), an increase of 0.12 percentage points

### UZ-090 — Short schedule dialogue: Lewis and Maru

- Targets: `Strings/schedules/Lewis` and `Strings/schedules/Maru`
- English sources: the two matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-lewis.json` and `schedule-maru.json`
- Entries: all 16 English records across the two targets; each target remains in its own auditable file
- Scope: Lewis’s confidential clinic, local business, tax, library, grocery, and Night Market remarks; Maru’s spouse, clinic, experiment, technology, and astronomy dialogue
- Control contract preserved exactly: emotion markers `$8`, `$h`, source key punctuation, and all trailing ellipses
- Glossary decisions applied: canonical `Hokim Lewis`, `Maru`, `Pelikan shaharchasi`, `Muzey va kutubxona`/library context, `Tungi bozor`, `fasl`, and established Doctor Harvey terminology
- Overall textual coverage after this batch: 4,452 / 14,720 unique English records (30.24%), an increase of 0.11 percentage points

### UZ-091 — Short schedule dialogue: Sebastian and Shane

- Targets: `Strings/schedules/Sebastian` and `Strings/schedules/Shane`
- English sources: the two matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-sebastian.json` and `schedule-shane.json`
- Entries: all 18 English records across the two targets; each target remains in its own auditable file
- Scope: Sebastian and Shane’s clinic, spouse, Sam/Jas friendship, smoking, ocean, Night Market, saloon, JojaMart, Joja Cola, and arcade remarks
- Control contract preserved exactly: player marker `@`, emotion markers `$6`, `$7`, `$a`, `$h`, numeric literal `10`, and source key punctuation
- Glossary decisions applied: canonical `Sebastian`, `Shane`, `Sam`, `Jas`, `JojaMart`, `Joja Cola`, `Tungi bozor`, `Yulduz tomchisi saluni`, and Doctor Harvey terminology
- Overall textual coverage after this batch: 4,470 / 14,720 unique English records (30.37%), an increase of 0.12 percentage points

### UZ-092 — Short schedule dialogue: Abigail and Willy

- Targets: `Strings/schedules/Abigail` and `Strings/schedules/Willy`
- English sources: the two matching `unpacked-all/Strings/schedules/*.json` files, Stardew Valley 1.6.15
- Files: `assets/translations/uzbek/schedule-abigail.json` and `schedule-willy.json`
- Entries: all 20 English records across the two targets; each target remains in its own auditable file
- Scope: Abigail’s clinic, family, relationships, annual check-up, and mysterious remarks; Willy’s clinic, fishing, ocean, warm-up drink, Night Market, and submarine dialogue
- Control contract preserved exactly: player marker `@`, emotion markers `$9`, `$h`, `$s`, and source key punctuation
- Glossary decisions applied: canonical `Abigail`, `Willy`, `Harvey`, `Baliq do‘koni`, `Tungi bozor`, ocean/water terminology, and deep-sea submarine context
- Overall textual coverage after this batch: 4,490 / 14,720 unique English records (30.50%), an increase of 0.14 percentage points

### UZ-093 — Short schedule dialogue: Emily

- Target: `Strings/schedules/Emily`
- English source: `unpacked-all/Strings/schedules/Emily.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/schedule-emily.json`
- Entries: all 16 English records
- Scope: Emily’s loom, clinic, fruit, marriage, saloon, mermaid, Night Market, and complete Sandy birthday outing dialogue
- Control contract preserved exactly: player marker `@`, emotion marker `$h`, dialogue breaks `#$e#`/`#$b#`, and source key punctuation
- Glossary decisions applied: canonical `Emily`, `Sandy`, `Gus`, `Harvey`, `To‘quv dastgohi`, `Tungi bozor`, `Suvpari`, and established spirit/magic terminology
- Overall textual coverage after this batch: 4,506 / 14,720 unique English records (30.61%), an increase of 0.11 percentage points

### UZ-094 — Leo character dialogue

- Target: `Characters/Dialogue/Leo`
- English source: `unpacked-all/Characters/Dialogue/Leo.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-leo.json`
- Entries: all 12 English records
- Scope: Leo’s daily greetings, parrot family, Ginger Island volcano, spirits, bird families, rain, and gift reactions
- Control contract preserved exactly: dialogue breaks `#$b#`/`#$e#`, emotion markers `$3`, `$h`, `$s`, and source key punctuation
- Glossary decisions applied: canonical `Leo`, `Zanjabil oroli`, `Vulqon zindoni` context, `ruhlar`, `to‘tiqush`, and established `Suvpari`/golden walnut terminology
- Overall textual coverage after this batch: 4,518 / 14,720 unique English records (30.69%), an increase of 0.08 percentage points

### UZ-095 — Mister Qi character dialogue

- Target: `Characters/Dialogue/Mister Qi`
- English source: `unpacked-all/Characters/Dialogue/Mister Qi.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-mister-qi.json`
- Entries: all 15 English records
- Scope: Mister Qi’s daily, married, Qi’s Nut Room, perfection, challenge, walnut, and mystery remarks
- Control contract preserved exactly: player marker `@`, dialogue breaks `#$e#`/`#$b#`, and source key punctuation
- Glossary decisions applied: canonical `Janob Qi`, `Qi’ning Yong‘oq xonasi`, `Mukammallik`, `Oltin yong‘oq`, and `Qi’ning Maxsus buyurtmalari` terminology
- Overall textual coverage after this batch: 4,533 / 14,720 unique English records (30.79%), an increase of 0.10 percentage points

### UZ-096 — Dwarf character dialogue

- Target: `Characters/Dialogue/Dwarf`
- English source: `unpacked-all/Characters/Dialogue/Dwarf.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-dwarf.json`
- Entries: all 23 English records
- Scope: Dwarf greetings, birthday and milk reactions, underground life, cave-carrot dishes, Ginger Island volcano, fish discoveries, Dwarvish Forge, technology, mines, and Shadow People
- Control contract preserved exactly: dialogue breaks `#$e#`/`#$b#`, asterisk stage directions, and source key punctuation
- Glossary decisions applied: canonical `Mitti`, `Mittilar`, `Konlar`, `Zanjabil oroli`, `Vulqon zindoni`, `Temirxona`, `Toshbaliq`, `Muzcha baliq`, `Lava ilonbalig‘i`, and `Soya xalqi`
- Overall textual coverage after this batch: 4,556 / 14,720 unique English records (30.95%), an increase of 0.16 percentage points

### UZ-097 — Leo mainland character dialogue

- Target: `Characters/Dialogue/LeoMainland`
- English source: `unpacked-all/Characters/Dialogue/LeoMainland.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-leo-mainland.json`
- Entries: all 20 English records
- Scope: Leo’s transition to the mainland, school, Linus and Penny lessons, island visits, Zuzu City, parrots, golden walnuts, and friendship with Jas
- Control contract preserved exactly: player marker `@`, emotion markers `$h`, `$s`, `$u`, dialogue breaks `#$e#`/`#$b#`, and source key punctuation
- Glossary decisions applied: canonical `Leo`, `Linus`, `Penny`, `Jas`, `Vincent`, `Hokim Lewis`, `Zuzu shahri`, `Zanjabil oroli`, and `Oltin yong‘oq`
- Overall textual coverage after this batch: 4,576 / 14,720 unique English records (31.09%), an increase of 0.14 percentage points

### UZ-098 — Sandy character dialogue

- Target: `Characters/Dialogue/Sandy`
- English source: `unpacked-all/Characters/Dialogue/Sandy.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-sandy.json`
- Entries: all 21 English records
- Scope: Sandy’s gifts, Stardew Valley flowers, bus service, Oasis shop, Calico Desert, seasonal seeds, milk sample, casino secrecy, and Emily/valley remarks
- Control contract preserved exactly: player marker `@`, emotion markers `$h`, `$s`, dialogue breaks `#$e#`/`#$b#`, special branch separator `||`, stage directions, item token `[184]`, and source key punctuation
- Glossary decisions applied: canonical `Sandy`, `Voha`, `Kaliko cho‘li`, `Stardew Valley`, `Nargiz`, `Xushbo‘y no‘xat`, `Kokos`, `Kaktus mevasi`, and `Sut`
- Overall textual coverage after this batch: 4,597 / 14,720 unique English records (31.23%), an increase of 0.14 percentage points

### UZ-099 — Wizard character dialogue

- Target: `Characters/Dialogue/Wizard`
- English source: `unpacked-all/Characters/Dialogue/Wizard.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-wizard.json`
- Entries: all 24 English records
- Scope: Wizard’s predictions, elixirs, elemental language, magic, Green Rain, Krobus, marriage, forest spirits, and apprentice remarks
- Control contract preserved exactly: player marker `@`, dialogue breaks `#$e#`/`#$b#`, and source key punctuation
- Glossary decisions applied: canonical `Sehrgar`, `Krobus`, `Arktika parchasi`, `Unsurlar`, `O‘rmon ruhlari`, and established magic terminology
- Overall textual coverage after this batch: 4,621 / 14,720 unique English records (31.39%), an increase of 0.16 percentage points

### UZ-100 — Krobus character dialogue

- Target: `Characters/Dialogue/Krobus`
- English source: `unpacked-all/Characters/Dialogue/Krobus.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-krobus.json`
- Entries: all 30 English records
- Scope: Krobus’s roommate, gifts, birthday, Soya xalqi history, Kanalizatsiya shop, Yoba devotion, sunlight, humans, Mittilar, and Arktika parchasi remarks
- Control contract preserved exactly: player marker `@`, emotion markers `$3`, `$4`, `$7`, `$h`, `$s`, dialogue breaks `#$e#`/`#$b#`, and source key punctuation
- Glossary decisions applied: canonical `Krobus`, `Soya xalqi`, `Kanalizatsiya`, `Mittilar`, `Yoba`, `Sehrgar`, and `Arktika parchasi`
- Overall textual coverage after this batch: 4,651 / 14,720 unique English records (31.60%), an increase of 0.20 percentage points

### UZ-101 — rainy character dialogue

- Target: `Characters/Dialogue/rainy`
- English source: `unpacked-all/Characters/Dialogue/rainy.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-rainy.json`
- Entries: all 30 English records
- Scope: weather-specific remarks from Abigail, Robin, Demetrius, Maru, Sebastian, Linus, Pierre, Caroline, Alex, George, Evelyn, Lewis, Clint, Penny, Pam, Emily, Haley, Jodi, Sam, Leah, Shane, Marnie, Elliott, Gus, Dwarf, Wizard, Harvey, Sandy, Krobus, and Leo
- Control contract preserved exactly: player marker `@`, emotion markers `$h`/`$s`, dialogue breaks `#$e#`/`#$b#`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `yomg‘ir`, `Konlar`, `ruda`, `Tirkama uy`, `Kaliko cho‘li`, `Kanalizatsiya`, `Mittilar`, `Unsurlar`, `Sehrgar`, and `Stardew Valley` terminology
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs (`rain`, `calico-desert`, `sewers`, `dwarf-dwarvish`, `wizard-rasmodius`, `ore-bar`, `trailer`) were applied
- Overall textual coverage after this batch: 4,681 / 14,720 unique English records (31.80%), an increase of 0.20 percentage points

### UZ-102 — Vincent character dialogue

- Target: `Characters/Dialogue/Vincent`
- English source: `unpacked-all/Characters/Dialogue/Vincent.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-vincent.json`
- Entries: all 27 English records
- Scope: Vincent’s introduction, birthday gifts, Green Rain, resort trip, frog egg, Sam friendship, Kent’s return, Penny, school-age remarks, and player greetings
- Control contract preserved exactly: player marker `@`, gender branches `^`, Kent branch selector `$d kent#` with `|`, emotion markers `$h`/`$s`/`$u`, dialogue breaks `#$e#`/`#$b#`, conditional timing token `#$c .3#`, `%noturn`, `%Vincent`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `Vincent`, `Penny`, `Sam`, `Jas`, and established child-dialogue terminology
- Online glossary check: canonical project page returned HTTP 200; local Uzbek glossary entries for `vincent`, `penny`, `sam`, `jas`, and `joja` were confirmed before translation
- Overall textual coverage after this batch: 4,708 / 14,720 unique English records (31.98%), an increase of 0.18 percentage points

### UZ-103 — Caroline character dialogue

- Target: `Characters/Dialogue/Caroline`
- English source: `unpacked-all/Characters/Dialogue/Caroline.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-caroline.json`
- Entries: all 52 English records
- Scope: Caroline’s introductions, gifts, tea and foraging, Abigail and Pierre family remarks, Green Rain, resort and movie-theater lines, seasonal routines, public gardens, the Wizard’s tower, and farm-life conversations
- Control contract preserved exactly: player marker `@`, emotion markers `$h`/`$s`/`$a`, dialogue breaks `#$e#`/`#$b#`, conditional selectors `$y` and `$1 Caroline23#`/`$1 Caroline1#`/`$1 Caroline12#`, `%Caroline`, and source key punctuation
- Glossary decisions applied: canonical `Caroline`, `Abigail`, `Pierre`, `Pelikan shaharchasi`, `Stardew Valley yarmarkasi`, `Sehrgar minorasi`, `Yovvoyi yerqalampir`, `Ko‘k choy`, `Terimchilik`, `Kuz`, and `Qish`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs were confirmed before translation
- Overall textual coverage after this batch: 4,760 / 14,720 unique English records (32.34%), an increase of 0.35 percentage points

### UZ-104 — Clint character dialogue

- Target: `Characters/Dialogue/Clint`
- English source: `unpacked-all/Characters/Dialogue/Clint.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-clint.json`
- Entries: all 45 English records
- Scope: Clint’s blacksmith introduction, gifts, tool upgrades, mine progress, Green Rain, Emily relationship lines, resort remarks, minecart repair, family history, and daily blacksmith conversations
- Control contract preserved exactly: player marker `@`, emotion markers `$h`/`$s`/`$u`, dialogue breaks `#$e#`/`#$b#`, response selectors `#$q 9/9 Mon_old#` and `#$r 9 30 Mon_9#`/`#$r 9 50 Mon_clown#`/`#$r 9 -50 Mon_rude#`, `%Clint`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `Clint`, `Temirchi`, `Temirchixona`, `Cho‘kich`, `Konlar`, `ruda`, `iridiy`, `Pech`, `Sohil`, `Kaliko cho‘li`, `Asboblarni yaxshilash`, and `Emily`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs were confirmed before translation
- Overall textual coverage after this batch: 4,805 / 14,720 unique English records (32.64%), an increase of 0.31 percentage points

### UZ-105 — George character dialogue

- Target: `Characters/Dialogue/George`
- English source: `unpacked-all/Characters/Dialogue/George.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-george.json`
- Entries: all 33 English records
- Scope: George’s introduction, gifts, coal-mining memories, Green Rain, Pam’s house upgrade, movie invitation, Alex family lines, Community Center changes, retirement, television, winter, and friendship dialogue
- Control contract preserved exactly: player marker `@`, gender branches `^`, emotion markers `$h`/`$s`, dialogue breaks `#$e#`/`#$b#`, `%noturn`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `George`, `Alex`, `Jamoat markazi`, `Tirkama uy`, `Pelikan shaharchasi`, `Qish`, `Bobo`, and established family/retirement terminology
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs were confirmed before translation
- Overall textual coverage after this batch: 4,838 / 14,720 unique English records (32.87%), an increase of 0.22 percentage points

### UZ-106 — Gus character dialogue

- Target: `Characters/Dialogue/Gus`
- English source: `unpacked-all/Characters/Dialogue/Gus.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-gus.json`
- Entries: all 38 English records
- Scope: Gus’s saloon introduction, cooking and drink gifts, Green Rain, tomatoes, healthy meals, Emily and Pam/Clint references, resort and island beverages, crab cakes, saloon greetings, and cooking advice
- Control contract preserved exactly: player marker `@`, spouse token `%spouse`, emotion markers `$h`/`$s`, dialogue breaks `#$e#`/`#$b#`, stage directions, slash-separated `SeedShop_Entry` responses, and source key punctuation
- Glossary decisions applied: canonical `Gus`, `Yulduz tomchisi saluni`, `pishirish`, `retsept`, `Zanjabil oroli`, `Orol janubi`, `Qisqichbaqa tuzog‘i`, `Emily`, `Pam`, and `Clint`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs were confirmed before translation
- Overall textual coverage after this batch: 4,876 / 14,720 unique English records (33.12%), an increase of 0.26 percentage points

### UZ-107 — Evelyn character dialogue

- Target: `Characters/Dialogue/Evelyn`
- English source: `unpacked-all/Characters/Dialogue/Evelyn.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-evelyn.json`
- Entries: all 49 English records
- Scope: Evelyn’s greetings, gifts, Green Rain, flowers and gardens, Jamoat markazi memories, George and Alex family lines, cookies, ocean and seasons, gardening, winter, and grandfather references
- Control contract preserved exactly: player marker `@`, gender branch `^`, emotion markers `$h`/`$s`/`$u`, dialogue breaks `#$e#`/`#$b#`, conditional selectors `#$1 evelynGarden1#` and `$k`, `%noturn`, stage directions, `${grandson^grand-daughter}`, and source key punctuation
- Glossary decisions applied: canonical `Evelyn`, `George`, `Alex`, `Jamoat markazi`, `Hokim Lewis`, `Porey piyoz`, `Lola`, `Xushbo‘y no‘xat`, `Kokos`, `Pechenyelar`, `Qovoq`, `Oddiy qo‘ziqorin`, `Qish`, and `Bobo`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 4,925 / 14,720 unique English records (33.46%), an increase of 0.33 percentage points

### UZ-108 — Jas character dialogue

- Target: `Characters/Dialogue/Jas`
- English source: `unpacked-all/Characters/Dialogue/Jas.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-jas.json`
- Entries: all 41 English records
- Scope: Jas’s greetings, birthday and fairy gifts, Green Rain, resort, Marnie and Shane family lines, dolls, Penny’s handwriting lessons, farm life, ice cream, river crawdads, and childhood memories
- Control contract preserved exactly: player marker `@`, gender branches `^`, emotion markers `$h`/`$s`/`$u`, dialogue breaks `#$e#`/`#$b#`, `$y` response selector, `${Mr.^Ms.}` template, stage directions, and source key punctuation
- Glossary decisions applied: canonical `Jas`, `Marnie`, `Shane`, `Penny`, `Muzqaymoq`, `chig‘anoq`, `Qisqichbaqa tuzog‘i`, `ferma`, and child-dialogue terminology
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 4,966 / 14,720 unique English records (33.74%), an increase of 0.28 percentage points

### UZ-109 — Lewis character dialogue

- Target: `Characters/Dialogue/Lewis`
- English source: `unpacked-all/Characters/Dialogue/Lewis.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-lewis.json`
- Entries: all 71 English records
- Scope: Hokim Lewis’s introductions, gifts, Green Rain, crops and seasons, Pelican Town governance, Community Center, bridge and bus repairs, festivals, saloon visits, farm advice, honey, mushrooms, elections, and winter reflections
- Control contract preserved exactly: player marker `@`, `%farm`, `%spouse`, `%revealtaste:Lewis:258`, emotion markers `$h`/`$s`/`$u`, dialogue breaks `#$e#`/`#$b#`, conditional selectors `#$c .3#`/`#$c .5#`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `Hokim Lewis`, `Pelikan shaharchasi`, `Jamoat markazi`, `Jo‘natma qutisi`, `O‘roq`, `Tosh koni`, `Ko‘prik ta’miri`, `Avtobus ta’miri`, `Oy shu’lali meduzalar raqsi`, `Asalari uyasi`, `Asal`, `Ko‘k rezavor`, and `Qish`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,037 / 14,720 unique English records (34.22%), an increase of 0.48 percentage points

### UZ-110 — Marnie character dialogue

- Target: `Characters/Dialogue/Marnie`
- English source: `unpacked-all/Characters/Dialogue/Marnie.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-marnie.json`
- Entries: all 40 English records
- Scope: Marnie’s ranch introduction, livestock and pet care, Shane and Jas family lines, resort and saloon remarks, animals, hay, scythe use, Green Rain, Wizard’s tower, festival judging, and community life
- Control contract preserved exactly: player marker `@`, gender branch `^`, `%pet`, `%Marnie`, emotion markers `$h`/`$s`/`$u`/`$3`/`$4`, dialogue breaks `#$e#`/`#$b#`, `$query PLAYER_NPC_RELATIONSHIP any Shane married roommate#` with `|`, `#$1 marnieAnimalSal#` and `$k`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `Marnie`, `Hokim Lewis`, `Shane`, `Jas`, `Marnie ranchosi`, `Chorvador`, `O‘roq`, `Pichan`, `Tovuq`, `Sigir`, `Ot`, `Hayvon mahsuloti`, `Sehrgar minorasi`, and `Stardew Valley yarmarkasi`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and animal terms were confirmed before translation
- Overall textual coverage after this batch: 5,077 / 14,720 unique English records (34.49%), an increase of 0.27 percentage points

### UZ-111 — Linus character dialogue

- Target: `Characters/Dialogue/Linus`
- English source: `unpacked-all/Characters/Dialogue/Linus.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-linus.json`
- Entries: all 53 English records
- Scope: Linus’s introduction, tent life, wilderness survival, moss, glaciers and mountain water, mines, fishing, trees, foraging, heron, environmental reflection, mushrooms, seasons, and winter survival
- Control contract preserved exactly: player marker `@`, emotion markers `$h`/`$s`/`$u`, dialogue breaks `#$e#`/`#$b#`, selectors `#$1 linusVandal#`, `#$1 LinusHeron#`, and `#$1 LinusFall1#`, `$k`, stage directions, item marker `[166]`, and source key punctuation
- Glossary decisions applied: canonical `Linus`, `Chodir`, `Mox`, `Konlar`, `Kamalak foreli`, `Yovvoyi yem`, `Taxta`, `Terimchilik`, `Baliqchilik`, `Tog‘`, and `Tosh koni`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,130 / 14,720 unique English records (34.85%), an increase of 0.36 percentage points

### UZ-112 — Abigail marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueAbigail`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueAbigail.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-abigail.json`
- Entries: all 72 English records
- Scope: Abigail’s married-life weather lines, farm routines, indoor and outdoor remarks, children, affection and relationship states, seasonal dialogue, Tuxum bayrami, Dasht qirolining sarguzashti, Suvpari kuloni, and spouse-room dialogue
- Control contract preserved exactly: player marker `@`, child placeholders `%kid1`/`%kid2` (with Uzbek suffixes where grammatical), gender branch `^`, emotion markers `$h`/`$l`/`$u`/`$s`/`$6`/`$8`, dialogue breaks `#$e#`, conditional timing token `#$c .5#`, item-code groups `[768 767 769 66 82]`, `[199 218 219 727 730]`, `[286 287 205 732]`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `Abigail`, `ferma`, `Konlar`, `Shilimshiqxona`/`Shilimshiq`, `Bobo`, `Tuxum bayrami`, `Suvpari kuloni`, `Kvarts`, `Ametist`, `Hayot eliksiri`, `Welwick`, and `Dasht qirolining sarguzashti`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,202 / 14,720 unique English records (35.34%), an increase of 0.49 percentage points

### UZ-113 — Alex marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueAlex`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueAlex.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-alex.json`
- Entries: all 49 English records
- Scope: Alex’s married-life exercise and weather lines, indoor and outdoor farm routines, household and children dialogue, affection, seasonal festivals, Luau, Stardew Valley yarmarka, family visits, winter warmth, and fishing competition
- Control contract preserved exactly: player marker `@`, child placeholders `%kid1`/`%kid2`, gender branches `^`, emotion markers `$h`/`$l`/`$u`/`$s`/`$6`/`$9`, dialogue breaks `#$e#`, item-code groups `[241 242 225 214 198]` and `[195 210 211]`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `Alex`, `gridbol`, `Bobo`, `Bobo-buvi`, `Yulduz tomchisi`, `Gullar raqsi`, `Luau`, `Stardew Valley yarmarkasi`, `Pech`, `Shilimshiq`, `Konlar`, `Pelikan shaharchasi`, and `Forel musobaqasi`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,251 / 14,720 unique English records (35.67%), an increase of 0.33 percentage points

### UZ-114 — Elliott marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueElliott`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueElliott.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-elliott.json`
- Entries: all 54 English records
- Scope: Elliott’s married-life writing and weather lines, coffee and cooking, beach and farm routines, poetic affection, household and children dialogue, seasonal festivals, Luau, Ruhlar arafasi, fishing, and New Year’s Eve
- Control contract preserved exactly: player marker `@`, child placeholders `%kid1`/`%kid2`, gender branches `^`, emotion markers `$h`/`$l`/`$s`/`$u`/`$7`/`$8`/`$9`/`$a`, dialogue breaks `#$e#`, item-code groups `[395]`, `[198 202 727 728]`, and `[348]`, stage directions, and source key punctuation
- Glossary decisions applied: canonical `Elliott`, `Sohil`, `Ferma`, `iridiy`, `Iridiy quymasi`, `Pari atirguli`, `Kaliko cho‘li`, `Yulduz tomchisi`, `Anor`, `Ziravorli rezavor`, `Luau`, `Ruhlar arafasi`, `Baliqchilik`, and `Qish`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,305 / 14,720 unique English records (36.04%), an increase of 0.37 percentage points

### UZ-115 — Emily marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueEmily`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueEmily.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-emily.json`
- Entries: all 58 English records
- Scope: Emily’s married-life weather and meditation lines, parrot care, crystal energy, household routines, children, dream and relationship dialogue, seasonal reflections, Yoba, farming, and winter thoughts
- Control contract preserved exactly: player marker `@`, farm and child placeholders `%farm`/`%kid1`/`%kid2`, emotion markers `$h`/`$l`/`$s`/`$u`/`$4`/`$7`, dialogue breaks `#$e#`, stage directions, and item-code groups `[428 440 444 338 207]`, `[232 234 223 220]`, `[428 440 444 338 207 395 749]`
- Glossary decisions applied: canonical `Emily`, `ferma / Ferma`, `Yoba`, `Echki suti`, `Sohil`, `Terimchilik`, `Bahor`, `Yoz`, `Kuz`, `Qish`, `qahva`, `Pari atirguli`, and `Suvpari kuloni`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,363 / 14,720 unique English records (36.43%), an increase of 0.39 percentage points

### UZ-116 — Haley marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueHaley`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueHaley.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-haley.json`
- Entries: all 44 English records
- Scope: Haley’s married-life weather and photography lines, Fern orollari retirement dreams, home routines, farm support, children, social visits, seasonal changes, and firefly/stars reflections
- Control contract preserved exactly: player marker `@`, child placeholder `%kid2`, emotion markers `$h`/`$l`/`$s`/`$5`/`$7`/`$10`/`$11`, dialogue breaks `#$e#`/`#$b#`, stage directions, literal `<$h` token, and item-code groups `[223 234 211 651 731]`, `[727 231 207 199]`, and `[194 195 210 211 216]`
- Glossary decisions applied: canonical `Haley`, `Emily`, `Bobo`, `Fern orollari`, `Ferngill Respublikasi`, `ferma`, `Ferma uyi`, `Bahor`, `Yoz`, `Kuz`, `Qish`, `quyoshli`, `yomg‘irli`, `Echki`, and `Echki suti`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,407 / 14,720 unique English records (36.73%), an increase of 0.30 percentage points

### UZ-117 — Harvey marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueHarvey`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueHarvey.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-harvey.json`
- Entries: all 52 English records
- Scope: Harvey’s medical and rainy-day lines, clinic life, radio and airplane hobbies, household routines, children, scientific observations, festivals, Luau, health advice, and winter care
- Control contract preserved exactly: player marker `@`, farm and child placeholders `%farm`/`%kid1`/`%kid2`, gender branch `^`, emotion markers `$h`/`$l`/`$s`/`$7`/`$8`, dialogue breaks `#$e#`, stage directions, and item-code groups `[212 214 225 209 200]` and `[201]`
- Glossary decisions applied: canonical `Harvey`, `Ferma`, `Ferma uyi`, `Bobo`, `Salomatlik`, `Muz bayrami`, `Luau`, `Gubernator`, `Kuz`, `Qish`, `klyukva`, `Tryufel`, `Tryufel moyi`, and `Tizza`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,459 / 14,720 unique English records (37.09%), an increase of 0.35 percentage points

### UZ-118 — Krobus marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueKrobus`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueKrobus.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-krobus.json`
- Entries: all 89 English records
- Scope: Krobus’s roommate life, rain and humidity, Soya xalqi history, Kanalizatsiya refuge, human and Mitti relations, Yoba, household routines, children, seasonal lines, and relationship states
- Control contract preserved exactly: player marker `@`, child placeholders `%kid1`/`%kid2`, emotion markers `$h`/`$l`/`$s`/`$a`/`$3`/`$7`, dialogue breaks `#$e#`/`#$b#`, conditional timing token `#$c .5#`, stage directions, and item-code groups `[305 308 203 795 397]` and `[203 204 651 225]`
- Glossary decisions applied: canonical `Krobus`, `Soya xalqi`, `Mittilar`, `Kanalizatsiya`, `Bo‘shliq ruhi`, `Yoba`, `Bobo`, `Welwick`, `ferma`, `Bahor`, `Yoz`, `Kuz`, `Qish`, `Gullar raqsi`, and `Ruhlar arafasi`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,548 / 14,720 unique English records (37.69%), an increase of 0.60 percentage points

### UZ-119 — Leah marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueLeah`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueLeah.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-leah.json`
- Entries: all 73 English records
- Scope: Leah’s art and wood-sculpture lines, nature walks, mushroom hunting, farm and house routines, children, wedding, destiny, and seasonal dialogue including Pichan, Kristall meva, Ziravorli rezavor, and Muz bayrami
- Control contract preserved exactly: player marker `@`, farm and child placeholders `%farm`/`%kid1`, gender branch `^`, emotion markers `$h`/`$l`/`$u`/`$s`/`$a`, dialogue breaks `#$e#`/`#$b#`, stage directions, and item-code groups `[281 404 420 257]`, `[16 18 20 22 90 259 396 402]`, `[196]`, `[395]`, and `[348]`
- Glossary decisions applied: canonical `Leah`, `ferma / Ferma`, `Sohil`, `Tog‘`, `Cho‘qqi`, `Ferma uyi`, `Bobo`, `Qo‘ziqorin xodasi`, `Terimchilik`, `Suvpari kuloni`, `Pichan`, `Bahor`, `Yoz`, `Kuz`, `Qish`, `Ziravorli rezavor`, `Kristall meva`, and `Muz bayrami`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,621 / 14,720 unique English records (38.18%), an increase of 0.50 percentage points

### UZ-120 — Maru marriage dialogue

- Target: `Characters/Dialogue/MarriageDialogueMaru`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialogueMaru.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-maru.json`
- Entries: all 57 English records
- Scope: Maru’s astronomy, workshop and laboratory dialogue, weather and farm routines, parents and Penny, children, engineering, seasons, clinic work, and household projects
- Control contract preserved exactly: player marker `@`, child and constellation/nebula placeholders `%kid1`/`%noun`, gender token `${husband^wife}$`, emotion markers `$h`/`$s`/`$l`, dialogue breaks `#$e#`/`#$c .5#`, stage directions, and item-code groups `[688 369 338 325 287]`, `[232 234 223 220]`, and `[286 287 205 732]`
- Glossary decisions applied: canonical `Maru`, `Penny`, `ferma`, `Dehqonchilik`, `Terimchilik`, `Bahor`, `Yoz`, `Kuz`, `Qish`, and existing item term `Ravochli pirog`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,678 / 14,720 unique English records (38.57%), an increase of 0.39 percentage points

### UZ-121 — Penny marriage dialogue

- Target: `Characters/Dialogue/MarriageDialoguePenny`
- English source: `unpacked-all/Characters/Dialogue/MarriageDialoguePenny.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/marriage-dialogue-penny.json`
- Entries: all 53 English records
- Scope: Penny’s rainy-day cooking and reading, family and saloon concerns, bathhouse memories, archaeology and artifacts, household routines, children, marriage, town visits, and seasonal dialogue
- Control contract preserved exactly: player marker `@`, child placeholders `%kid1`/`%kid2`, gender branch `^`, emotion markers `$h`/`$s`/`$l`/`$11`, dialogue breaks `#$e#`, stage directions, and item-code groups `[186 180 770 535]`, `[212 214 225 209 200]`, and `[195 210 211]`
- Glossary decisions applied: canonical `Penny`, `Maru`, `Harvey`, `Gunther`, `ferma`, `Dehqonchilik`, `Bahor`, `Yoz`, `Kuz`, `Qish`, `Hammom`, `salun`, `Arxeologiya`, `Artefakt`, `Qovun`, `Pechenyelar`, and `dolchin`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and item names were confirmed before translation
- Overall textual coverage after this batch: 5,731 / 14,720 unique English records (38.93%), an increase of 0.36 percentage points

### UZ-122 — Sam marriage dialogue

- Target: \`Characters/Dialogue/MarriageDialogueSam\`
- English source: \`unpacked-all/Characters/Dialogue/MarriageDialogueSam.json\`, Stardew Valley 1.6.15
- File: \`assets/translations/uzbek/marriage-dialogue-sam.json\`
- Entries: all 53 English records
- Scope: Sam’s guitar and comic-book routines, Vincent and family, JojaMart memories, farm life, children, marriage, festivals, Luau, meduzalar, yarmarka, and winter dialogue
- Control contract preserved exactly: player marker \`@\`, child placeholders \`%kid1\`/\`%kid2\`, gender branch \`^\`, emotion markers \`$h\`/\`$s\`/\`$7\`/\`$10\`, dialogue breaks \`#$e#\`/\`#$b#\`, stage directions, and item-code groups \`[90 88 86 535]\`, \`[206]\`, and \`[211]\`
- Glossary decisions applied: canonical \`Sam\`, \`Sebastian\`, \`Abigail\`, \`Vincent\`, \`JojaMart\`, \`Gullar raqsi\`, \`Luau\`, \`Oy shu’lali meduzalar raqsi\`, \`Muz bayrami\`, \`Gubernator\`, \`ferma\`, \`Bahor\`, \`Yoz\`, \`Kuz\`, and \`Qish\`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and existing festival/item names were confirmed before translation
- Overall textual coverage after this batch: 5,784 / 14,720 unique English records (39.29%), an increase of 0.36 percentage points

### UZ-123 — Sebastian marriage dialogue

- Target: \`Characters/Dialogue/MarriageDialogueSebastian\`
- English source: \`unpacked-all/Characters/Dialogue/MarriageDialogueSebastian.json\`, Stardew Valley 1.6.15
- File: \`assets/translations/uzbek/marriage-dialogue-sebastian.json\`
- Entries: all 67 English records
- Scope: Sebastian’s rain, smoking and motorcycle lines, gaming and laptop work, farm and household routines, Maru and family, children, relationship dialogue, Slime care, festivals, and seasonal dialogue
- Control contract preserved exactly: player marker \`@\`, child placeholders \`%kid1\`/\`%kid2\`, emotion markers \`$h\`/\`$l\`/\`$s\`/\`$7\`/\`$a\`, dialogue breaks \`#$e#\`/\`#$b#\`, stage directions, and item-code groups \`[575 769 767 84 66 78]\`, \`[395]\`, and \`[346]\`
- Glossary decisions applied: canonical \`Sebastian\`, \`Maru\`, \`Sam\`, \`Pelikan shaharchasi\`, \`ferma\`, \`Shilimshiq\`, \`Shilimshiqxona\`, \`Hayot eliksiri\`, \`Gullar raqsi\`, \`Luau\`, \`Stardew Valley yarmarkasi\`, \`Ruhlar arafasi\`, \`Muz bayrami\`, and \`Bahor/Yoz/Kuz/Qish\`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and existing monster/festival/item names were confirmed before translation
- Overall textual coverage after this batch: 5,851 / 14,720 unique English records (39.75%), an increase of 0.46 percentage points

### UZ-124 — Shane marriage dialogue

- Target: \`Characters/Dialogue/MarriageDialogueShane\`
- English source: \`unpacked-all/Characters/Dialogue/MarriageDialogueShane.json\`, Stardew Valley 1.6.15
- File: \`assets/translations/uzbek/marriage-dialogue-shane.json\`
- Entries: all 66 English records
- Scope: Shane’s animals and rain, Joja memories, pizza and cooking, gridbol, Tunnelchilar, children, Yoba, farm life, Tuxum bayrami, Gullar raqsi, Luau, seasonal routines, and personal recovery
- Control contract preserved exactly: player marker \`@\`, child placeholder \`%kid1\`/\`%kid2\`, emotion markers \`$h\`/\`$s\`/\`$6\`/\`$8\`/\`$a\`, dialogue breaks \`#$e#\`/\`#$b#\`, stage directions, and item-code groups \`[346 174 303 305 215]\` and \`[195 215 206]\`
- Glossary decisions applied: canonical \`Shane\`, \`Marnie\`, \`Jas\`, \`Yoba\`, \`JojaMart\`, \`gridbol\`, \`Tuxum bayrami\`, \`Gullar raqsi\`, \`Luau\`, \`Sharob\`, \`Pivo\`, \`Pishloqli qalampir gazagi\`, and \`Bahor/Yoz/Kuz/Qish\`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and existing food/festival/item names were confirmed before translation
- Overall textual coverage after this batch: 5,917 / 14,720 unique English records (40.20%), an increase of 0.45 percentage points

### UZ-125A — generic marriage dialogue, weather/home/family block

- Target: \`Characters/Dialogue/MarriageDialogue\`
- English source: \`unpacked-all/Characters/Dialogue/MarriageDialogue.json\`, Stardew Valley 1.6.15
- File: \`assets/translations/uzbek/marriage-dialogue-generic-01.json\`
- Entries: first 100 of 211 English records
- Scope: shared rainy-day and rainy-night spouse lines, indoor and outdoor routines, partner-specific home/farm lines, work departures/returns, and the first child/family lines
- Control contract preserved exactly: player marker \`@\`, farm and child placeholders \`%farm\`/\`%kid1\`/\`%kid2\`, adjective/noun placeholders \`%adj\`/\`%noun\`, gender branches \`^\`, emotion markers including \`$h\`/\`$l\`/\`$s\`/\`$u\`/\`$7\`, timing token \`#$c .5#\`, dialogue breaks \`#$e#\`/\`#$b#\`, literal markers \`~\` and \`<$h\`, and item-code groups \`[194 195 210 211 216]\` and \`[199 218 219 727 730]\`
- Glossary decisions applied: canonical spouse names, \`ferma\`, \`Pelikan shaharchasi\`, \`Qahva\`, \`Muz bayrami\`-compatible item terms, and existing local food/festival terminology
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and existing item names were confirmed before translation
- Overall textual coverage after this batch: 6,017 / 14,720 unique English records (40.88%), an increase of 0.68 percentage points

### UZ-125B — generic marriage dialogue, relationships/seasons/rooms block

- Target: \`Characters/Dialogue/MarriageDialogue\`
- English source: \`unpacked-all/Characters/Dialogue/MarriageDialogue.json\`, Stardew Valley 1.6.15
- File: \`assets/translations/uzbek/marriage-dialogue-generic-02.json\`
- Entries: remaining 111 of 211 English records
- Scope: shared relationship states, seasonal spouse lines, partner-specific seasons, spouse rooms, Krobus household lines, and no-bed fallback dialogue
- Control contract preserved exactly: player marker \`@\`, farm and child placeholders \`%farm\`/\`%kid1\`/\`%kid2\`, emotion markers \`$h\`/\`$l\`/\`$s\`/\`$u\`/\`$7\`, gender branches \`^\`, timing token \`#$c .5#\`, dialogue breaks \`#$e#\`/\`#$b#\`, and all stage-direction markers
- Glossary decisions applied: canonical spouse names, \`ferma\`, \`Bobo\`, \`Suvpari kuloni\`, \`Tog‘\`, \`Qo‘ziqorin xodasi\`, \`Kanalizatsiya\`, \`Ruhlar arafasi\`, \`Gullar raqsi\`, \`Ravochli pirog\`, \`Sharob\`, \`Pivo\`, and seasonal \`Bahor/Yoz/Kuz/Qish\`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and existing item/festival names were confirmed before translation
- Overall textual coverage after this batch: 6,128 / 14,720 unique English records (41.63%), an increase of 0.75 percentage points

### UZ-126 — Willy character dialogue

- Target: \`Characters/Dialogue/Willy\`
- English source: \`unpacked-all/Characters/Dialogue/Willy.json\`, Stardew Valley 1.6.15
- File: \`assets/translations/uzbek/dialogue-willy.json\`
- Entries: all 42 English records
- Scope: Willy’s fishing shop, gifts, legendary catches, crab pond, Trout Derby, Kalmar bayrami, daily fishing advice, and Fair judging
- Control contract preserved exactly: player markers \`@\`, gender branches \`^\`, gender tokens \`\${bachelor^single}$\`/\`\${man^lady}$\`, emotion markers \`$h\`/\`$s\`/\`$u\`, dialogue breaks \`#$e#\`/\`#$b#\`, and item-code group \`[797]\`
- Glossary decisions applied: canonical \`Willy\`, \`Baliqchilik\`, \`Sohil\`, \`Kanalizatsiya\`, \`Yem\`, \`Qisqichbaqa tuzog‘i\`, \`Kamalak foreli\`, \`Forel musobaqasi\`, \`Kalmar bayrami\`, \`Oltin nishon\`, \`Afsona\`, and \`Muzlik balig‘i\`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and fish/fishing item names were confirmed before translation
- Overall textual coverage after this batch: 6,170 / 14,720 unique English records (41.92%), an increase of 0.29 percentage points

### UZ-127 — Jodi character dialogue

- Target: `Characters/Dialogue/Jodi`
- English source: `unpacked-all/Characters/Dialogue/Jodi.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-jodi.json`
- Entries: all 53 English records
- Scope: Jodi’s family life, Kent’s return, Sam and Vincent, Pam’s house/bus, Joja choices, aerobics, household routines, seasons, and Yoba
- Control contract preserved exactly: player marker `@`, `%time`, conditional tokens `$d Joja#...|...` and `$d kent#...|...`, timing token `#$c .5#`, dialogue breaks `#$e#`/`#$b#`, emotion markers `$h/$s/$u/$4`, and branch separator `|`
- Glossary decisions applied: canonical `Jodi`, `Kent`, `Sam`, `Vincent`, `Pam`, `Marnie`, `Caroline`, `Yoba`, `JojaMart`, `Yoba mehrobi`, `Bahor/Yoz/Kuz/Qish`
- Online glossary check: canonical project page returned HTTP 200; relevant local Uzbek glossary IDs and existing family/Joja terms were confirmed before translation
- Overall textual coverage after this batch: 6,223 / 14,720 unique English records (42.28%), an increase of 0.36 percentage points

### UZ-128 — Kent character dialogue

- Target: `Characters/Dialogue/Kent`
- English source: `unpacked-all/Characters/Dialogue/Kent.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-kent.json`
- Entries: all 34 English records
- Scope: Kent’s return from war, family and Sam, Green Rain, resort conversations, fishing, marriage, movies, popcorn event branches, and daily routines
- Control contract preserved exactly: player marker `@`, emotion markers `$h/$s/$u/$4/$5`, dialogue breaks `#$e#`/`#$b#`, timed ambient token `#$1 Kent1#`, and continuation token `$k`
- Glossary decisions applied: canonical `Kent`, `Sam`, `Jodi`, `Mittilar tili`, `Pelikan shaharchasi`, `Baliqchilik`, `Sohil`, `Okean`, `Yoz`, and `turmush qurgan`
- Online glossary check: the canonical project glossary had already returned HTTP 200 in the preceding block; the local Uzbek snapshot was rechecked for Kent’s family, Mittilar, fishing, and relationship terminology before this translation
- Overall textual coverage after this batch: 6,257 / 14,720 unique English records (42.51%), an increase of 0.23 percentage points

### UZ-129 — Demetrius character dialogue

- Target: `Characters/Dialogue/Demetrius`
- English source: `unpacked-all/Characters/Dialogue/Demetrius.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-demetrius.json`
- Entries: all 60 English records
- Scope: Demetrius’s laboratory and family, Maru and Robin, dinosaur and crab specimens, Green Rain, resort and desert observations, farm science, seasonal research, and event branches
- Control contract preserved exactly: player marker `@`, `%fork` and `%Demetrius` placeholders, item code `[253]`, emotion markers `$h/$s/$u/$7/$5/$4`, dialogue breaks `#$e#`/`#$b#`, `$y` answer branches, and `$p 40#...|...` friendship branch
- Glossary decisions applied: canonical `Demetrius`, `Maru`, `Robin`, `Pasternak`, `Yashil yomg‘ir`, `Kaliko cho‘li`, `Qisqichbaqa`, `Ekotizim`, `laboratoriya`, `nam saqlovchi tuproq`, and seasonal `Yoz/Kuz/Qish`
- Online glossary check: the canonical project page was opened successfully in the in-app browser; the local snapshot and visible canonical entries for core place, character, farm, and season terminology were compared before translation. A direct command-line fetch was unavailable due to transient DNS resolution failure.
- Overall textual coverage after this batch: 6,317 / 14,720 unique English records (42.91%), an increase of 0.41 percentage points

### UZ-130 — Elliott character dialogue

- Target: `Characters/Dialogue/Elliott`
- English source: `unpacked-all/Characters/Dialogue/Elliott.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-elliott.json`
- Entries: all 96 English records
- Scope: Elliott’s writing, beach cabin, books and ink, Flower Dance, SquidFest, resort visits, relationships, seasonal routines, and event toasts/boats
- Control contract preserved exactly: player marker `@`, `%Elliott`, `%fork`, `%noturn`, gender branch `^`, emotion markers `$h/$s/$u/$l/$a/$8/$6`, dialogue breaks `#$e#`/`#$b#`, timed ambient token `#$1 elliottApol#`, continuation token `$k`, and item-code groups `[154]`/`[155]`
- Glossary decisions applied: canonical `Elliott`, `Leah`, `Gus`, `Pelikan shaharchasi`, `Sohil`, `Luau`, `Kalmar`, `Qisqichbaqa kotletlari`, `Qish/Bahor/Yoz/Kuz`, and existing writer/beach terminology
- Online glossary check: the canonical project page was previously opened successfully in the in-app browser; local Uzbek glossary entries for Elliott, Leah, Gus, Pelikan shaharchasi, farm, Luau, and seasons were rechecked before translation
- Overall textual coverage after this batch: 6,413 / 14,720 unique English records (43.57%), an increase of 0.65 percentage points

### UZ-131 — Harvey character dialogue

- Target: `Characters/Dialogue/Harvey`
- English source: `unpacked-all/Characters/Dialogue/Harvey.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-harvey.json`
- Entries: all 70 English records
- Scope: Harvey’s clinic, medical care, Green Rain, gifts, aerobics, relationships, resort visits, health advice, seasonal routines, and event conversations with George
- Control contract preserved exactly: player marker `@`, `$query PLAYER_NPC_RELATIONSHIP current any married roommate#...|...` relationship branches, emotion markers `$h/$s/$l/$4/$6`, dialogue breaks `#$e#`/`#$b#`, and all source branch separators `|`
- Glossary decisions applied: canonical `Harvey`, `Maru`, `Gus`, `Pelikan shaharchasi`, `Salomatlik`, `klinika`, `shifokor`, `gripp`, `aerobika`, and seasonal `Yoz/Kuz/Qish/Bahor`
- Online glossary check: the canonical project page was previously opened successfully in the in-app browser; local Uzbek glossary entries for Harvey, Maru, Gus, Pelikan shaharchasi, Salomatlik, and seasons were rechecked before translation
- Overall textual coverage after this batch: 6,483 / 14,720 unique English records (44.04%), an increase of 0.48 percentage points

### UZ-132 — Leah character dialogue

- Target: `Characters/Dialogue/Leah`
- English source: `unpacked-all/Characters/Dialogue/Leah.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-leah.json`
- Entries: all 96 English records
- Scope: Leah’s art and sculpture, nature and foraging, relationships, resort and beach dialogue, Green Rain, choice branches, and seasonal routines
- Control contract preserved exactly: player marker `@`, `%farm` and `%fork` placeholders, `$q`/`$r` dialogue choices, `$query PLAYER_NPC_RELATIONSHIP current any married roommate#...|...` relationship branches, `$p` conditional branch, `$c .5#`/`$c 0.8#` timing tokens, `#$1 LeahBug#`, gender branch `^`, emotion markers, and all dialogue breaks
- Glossary decisions applied: canonical `Leah`, `Elliott`, `Shane`, `Willy`, `Pelikan shaharchasi`, `Cindersap o‘rmoni`, `Sohil`, `oqib kelgan yog‘och`, `Piña Colada`, and seasonal `Bahor/Yoz/Kuz/Qish`
- Online glossary check: canonical project terminology was previously opened in the in-app browser; local Uzbek entries for Leah, Elliott, farm, Cindersap o‘rmoni, seasons, and related nature terms were rechecked before translation
- Overall textual coverage after this batch: 6,807 / 14,720 unique English records (46.24%), no change in record coverage

### UZ-133 — Maru character dialogue

- Target: `Characters/Dialogue/Maru`
- English source: `unpacked-all/Characters/Dialogue/Maru.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-maru.json`
- Entries: all 112 English records
- Scope: Maru’s laboratory, gadgets and robot project, family, Harvey’s clinic, Green Rain, astronomy, relationships, dialogue choices, and seasonal routines
- Control contract preserved exactly: player marker `@`, `%farm` and `%fork` placeholders, gender branch `^`, `$q`/`$r` dialogue choices, `$p` conditional branch, emotion markers `$h/$s/$l/$u/$a/$8/$9/$3`, dialogue breaks `#$e#`/`#$b#`, `$c .5#` timing token, and literal `#` separators in the telescope line
- Glossary decisions applied: canonical `Maru`, `Demetrius`, `Robin`, `Sebastian`, `Harvey`, `Penny`, `Batareya`, `Oltin`, `iridiy`, `laboratoriya`, `klinika`, `Pech`, and seasonal `Bahor/Yoz/Kuz/Qish`
- Online glossary check: canonical project terminology was previously opened in the in-app browser; local Uzbek entries for Maru, Demetrius, Robin, Harvey, Sebastian, Sam, farm, and seasons were rechecked before translation
- Overall textual coverage after this batch: 6,691 / 14,720 unique English records (45.46%), an increase of 0.76 percentage points

### UZ-134 — Robin character dialogue

- Target: `Characters/Dialogue/Robin`
- English source: `unpacked-all/Characters/Dialogue/Robin.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-robin.json`
- Entries: all 58 English records
- Scope: Robin’s carpentry shop, farm buildings, family, construction, Community Center, Green Rain, resort, and seasonal mountain dialogue
- Control contract preserved exactly: player marker `@`, `%farm` and `%noturn` placeholders, timed ambient tokens `#$1 RobinSeb#`/`#$1 RobinDem#`, emotion markers `$h/$s/$u/$6/$4`, dialogue breaks `#$e#`/`#$b#`, and all source stage-direction markers
- Glossary decisions applied: canonical `Robin`, `Demetrius`, `Maru`, `Sebastian`, `Pelikan shaharchasi`, `Parrandaxona`, `Molxona`, `Baliq hovuzi`, `Taxta`, `Tosh koni`, `Jamoat markazi`, and `Yashil yomg‘ir`
- Online glossary check: canonical project terminology was previously opened in the in-app browser; local Uzbek entries for Robin, Demetrius, Maru, Sebastian, farm, buildings, and Green Rain were rechecked before translation
- Overall textual coverage after this batch: 6,749 / 14,720 unique English records (45.85%), an increase of 0.39 percentage points

### UZ-135 — Pierre character dialogue

- Target: `Characters/Dialogue/Pierre`
- English source: `unpacked-all/Characters/Dialogue/Pierre.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-pierre.json`
- Entries: all 58 English records
- Scope: Pierre’s general store, seeds and produce, Joja competition, Abigail and Caroline, Community Center, Green Rain, seasonal shop routines, and Fair judging
- Control contract preserved exactly: player marker `@`, gender branch `^`, `${my son^daughter}$`, `%farm` and `%noturn` placeholders, `$d Joja#...|...`/`$d joja#...|...` conditionals, timed ambient tokens `#$1 pierre1#`, `#$1 pierre2#`, `#$1 pierreJoja#`, `#$1 pierreBlue#`, `#$1 pierreDin#`, `#$1 pierreMEGA#`, continuation token `$k`, and emotion markers `$h/$s/$u/$3/$6/$4`
- Glossary decisions applied: canonical `Pierre`, `Caroline`, `Abigail`, `Joja`, `JojaMart`, `Pelikan shaharchasi`, `Jamoat markazi`, `Ferma`, `ekin`, `sifat`, and seasonal `Bahor/Yoz/Kuz/Qish`
- Online glossary check: canonical project terminology was previously opened in the in-app browser; local Uzbek entries for Pierre, Caroline, Abigail, Joja, JojaMart, Pelikan shaharchasi, farm, crop, and seasons were rechecked before translation
- Overall textual coverage after this batch: 6,807 / 14,720 unique English records (46.24%), an increase of 0.39 percentage points

### UZ-136 — Sandy character dialogue refinement

- Target: `Characters/Dialogue/Sandy`
- English source: `unpacked-all/Characters/Dialogue/Sandy.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-sandy.json`
- Entries: all 21 English records
- Scope: Sandy’s Oasis, Calico Desert, bus service, seasonal seeds, Emily, desert weather, secret club, flowers, and daily shop dialogue
- Control contract preserved exactly: player marker `@`, item code `[184]`, emotion markers `$h/$s`, dialogue breaks `#$e#`/`#$b#`, literal branch separator `||`, wave marker `~`, and all source stage directions
- Glossary decisions applied: canonical `Sandy`, `Emily`, `Kaliko cho‘li`, `Voha`, `Stardew Valley`, `Yashil yomg‘ir`, `Bahor/Yoz/Qish`, `urug‘`, `kokos`, and `kaktus mevasi`
- Online glossary check: canonical project terminology was previously opened in the in-app browser; local Uzbek entries for Sandy, Emily, Kaliko cho‘li, Voha, farm, Green Rain, and seasons were rechecked before translation
- This source was already included in the package baseline; this block refines all 21 Uzbek records without changing the unique-record denominator
- Overall textual coverage after this batch: 6,807 / 14,720 unique English records (46.24%), no change in record coverage

### UZ-137 — Shane character dialogue

- Target: `Characters/Dialogue/Shane`
- English source: `unpacked-all/Characters/Dialogue/Shane.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-shane.json`
- Entries: all 71 English records
- Scope: Shane’s JojaMart work, Saloon, Joja Cola, Tunnelers, Marnie and Jas, chickens, drinking recovery, resort dialogue, relationship branches, and event responses
- Control contract preserved exactly: player marker `@`, `%Shane` speech bubble marker, `%time` placeholder, `$d Joja#...|...` conditionals, `#$1 ShaneJOSH#` timed token, `#$e#`/`#$b#` dialogue breaks, `||` branches, gender branch `^`, and emotion markers `$h/$s/$a/$u/$6/$l`
- Glossary decisions applied: canonical `Shane`, `Joja`, `JojaMart`, `Marnie`, `Jas`, `Pelikan shaharchasi`, `Stardew Valley`, `ferma/Ferma`, `tovuq`, `pivo`, `Yulduz tomchisi saluni`, and `Bahor/Yoz/Kuz/Qish`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Shane, Joja, JojaMart, Marnie, Jas, farm, chicken, Saloon, and seasons were rechecked before translation
- Overall textual coverage after this batch: 6,878 / 14,720 unique English records (46.73%), an increase of 0.48 percentage points

### UZ-138 — Pam character dialogue

- Target: `Characters/Dialogue/Pam`
- English source: `unpacked-all/Characters/Dialogue/Pam.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-pam.json`
- Entries: all 71 English records
- Scope: Pam’s bus work, trailer and house, Saloon routines, Penny and Alex family dialogue, resort, Green Rain, fishing, seasonal routines, and event responses
- Control contract preserved exactly: player marker `@`, `%noturn`, `%farm`, `%Pam` speech bubbles, `$d bus#...|...` conditional, `#$1 PamDrank#`/`#$1 PamDrunk#` timed tokens, `$k`, `#$e#`/`#$b#` dialogue breaks, slash-separated entry variants, gender branches `^`, and emotion markers `$h/$s/$u/$3`
- Glossary decisions applied: canonical `Pam`, `Penny`, `Alex`, `Marnie`, `Gus`, `Willy`, `Yoba`, `Pelikan shaharchasi`, `Kaliko cho‘li`, `Yulduz tomchisi saluni`, `ferma/Ferma`, and `Bahor/Yoz/Kuz/Qish`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Pam, Penny, Marnie, Joja, farm, Saloon, Calico Desert, and seasons were rechecked before translation
- Overall textual coverage after this batch: 6,949 / 14,720 unique English records (47.21%), an increase of 0.48 percentage points

### UZ-139 — Emily character dialogue

- Target: `Characters/Dialogue/Emily`
- English source: `unpacked-all/Characters/Dialogue/Emily.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-emily.json`
- Entries: all 106 English records
- Scope: Emily’s Saloon work, tailoring, crystals and spiritual energy, Haley and Shane family dialogue, parrots, resort, festivals, relationship branches, seasonal routines, Sandy, Clint, Linus, Junimos, and cooking
- Control contract preserved exactly: player marker `@`, `%Emily`, `%farm`, `%revealtaste:Emily:207`, `$c 0.5#` timed variants, `$query PLAYER_NPC_RELATIONSHIP current any married roommate#...|...`, `$d bus#...|...` conditional, dialogue breaks `#$e#`/`#$b#`, gender branches `^`, and emotion markers `$h/$s/$u/$3/$6/$l`
- Glossary decisions applied: canonical `Emily`, `Haley`, `Shane`, `Sandy`, `Clint`, `Linus`, `Gus`, `Yulduz tomchisi saluni`, `Pelikan shaharchasi`, `Kaliko cho‘li`, `to‘tiqush`, `Junimo`, `Kristallariy`, `Bahor/Yoz/Kuz/Qish`, and `Ferma uyi`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Emily, Haley, Shane, Sandy, Saloon, parrot, Junimo, farm, and seasons were rechecked before translation
- Overall textual coverage after this batch: 7,055 / 14,720 unique English records (47.93%), an increase of 0.72 percentage points

### UZ-140 — Alex character dialogue

- Target: `Characters/Dialogue/Alex`
- English source: `unpacked-all/Characters/Dialogue/Alex.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-alex.json`
- Entries: all 124 English records
- Scope: Alex’s sports ambitions, eggs and training, beach and resort dialogue, Haley, grandparents, relationship branches, sports-choice dialogues, seasonal routines, and family events
- Control contract preserved exactly: player marker `@`, `%Alex`, `%season`, `%firstnameletter%name`, `$c 0.8#` variant, `$p` conditionals, `$q`/`$r` dialogue choices, dialogue breaks `#$e#`/`#$b#`, gender branches `^`, and emotion markers `$h/$s/$u/$a/$9/$7/$l`
- Glossary decisions applied: canonical `Alex`, `Haley`, `Sebastian`, `Pelikan shaharchasi`, `Sohil`, `Bahor/Yoz/Kuz/Qish`, `ferma/Ferma`, `fermer`, `tuxum`, `losos`, and `gridbol`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Alex, Haley, Sebastian, farm, farmer, beach, eggs, seasons, and Pelikan shaharchasi were rechecked before translation
- Overall textual coverage after this batch: 7,179 / 14,720 unique English records (48.77%), an increase of 0.84 percentage points

### UZ-141 — Haley character dialogue

- Target: `Characters/Dialogue/Haley`
- English source: `unpacked-all/Characters/Dialogue/Haley.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-haley.json`
- Entries: all 129 English records
- Scope: Haley’s fashion and photography, beach and resort dialogue, Emily and Alex family branches, festivals and events, relationship choices, seasonal routines, shopping, and self-confidence arcs
- Control contract preserved exactly: player marker `@`, `%Haley`, `%fork`, `$13`, `$c 0.8#` variant, `$p` conditionals, `$q`/`$r` dialogue choices, `#$1 HaleyClothes#`/`#$1 haleySeagull#`/`#$1 HaleySister#` timed tokens, dialogue breaks `#$e#`/`#$b#`, gender branches `^`, item marker `<`, and emotion markers `$h/$s/$u/$a/$7/$8/$k/$l`
- Glossary decisions applied: canonical `Haley`, `Emily`, `Alex`, `Sandy`, `Zuzu shahri`, `Stardew Valley`, `Pelikan shaharchasi`, `Sohil`, `Bahor/Yoz/Kuz/Qish`, `ferma`, `poni`, and `Junimo`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Haley, Emily, Alex, Sandy, beach, Zuzu shahri, farm, Junimo, and seasons were rechecked before translation
- Overall textual coverage after this batch: 7,308 / 14,720 unique English records (49.65%), an increase of 0.88 percentage points

### UZ-142 — Sam character dialogue

- Target: `Characters/Dialogue/Sam`
- English source: `unpacked-all/Characters/Dialogue/Sam.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-sam.json`
- Entries: all 117 English records
- Scope: Sam’s band, guitar, skateboarding, family and Gotoro Empire dialogue, Sebastian and Abigail friendships, resort, festivals, events, and seasonal routines
- Control contract preserved exactly: player marker `@`, `%Sam`, `$p` conditionals, `$q`/`$r` dialogue choices, `$d Joja#...|...` conditional, `${He's^She's}$` gender placeholder, dialogue breaks `#$e#`/`#$b#`, gender branches `^`, and emotion markers `$h/$s/$u/$a/$7/$8/$9/$10/$l`
- Glossary decisions applied: canonical `Sam`, `Sebastian`, `Abigail`, `Gus`, `Willy`, `Hokim Lewis`, `Gotoro imperiyasi`, `Zuzu shahri`, `Yulduz tomchisi saluni`, `Pelikan shaharchasi`, `Bahor/Yoz/Kuz/Qish`, and `Qish yulduzi ziyofati`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Sam, Sebastian, Abigail, Gus, Gotoro imperiyasi, Zuzu shahri, Saloon, and seasons were rechecked before translation
- Overall textual coverage after this batch: 7,425 / 14,720 unique English records (50.44%), an increase of 0.79 percentage points

### UZ-143 — Sebastian character dialogue

- Target: `Characters/Dialogue/Sebastian`
- English source: `unpacked-all/Characters/Dialogue/Sebastian.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-sebastian.json`
- Entries: all 125 English records
- Scope: Sebastian’s motorcycle, computers, caves and railroad, Sam and Abigail friendships, Maru family tension, resort, relationship choices, events, and gloomy seasonal dialogue
- Control contract preserved exactly: player marker `@`, `%Sebastian`, `$c 0.8#`/`$c .5#` variants, `$p` conditionals, `$q`/`$r` dialogue choices, `$query PLAYER_NPC_RELATIONSHIP current any married roommate#...|...`, `$1 Sebastian1#` timed token, `$d Joja#...|...` conditional, dialogue breaks `#$e#`/`#$b#`, gender branches `^`, and emotion markers `$h/$s/$u/$a/$8/$9/$l`
- Glossary decisions applied: canonical `Sebastian`, `Sam`, `Abigail`, `Maru`, `Demetrius`, `Pelikan shaharchasi`, `Sohil`, `Gotoro imperiyasi`, `JojaMart`, `Yulduz tomchisi saluni`, `Bahor/Yoz/Kuz/Qish`, and `Junimo`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Sebastian, Sam, Abigail, Maru, Demetrius, JojaMart, beach, Saloon, and seasons were rechecked before translation
- Overall textual coverage after this batch: 7,550 / 14,720 unique English records (51.29%), an increase of 0.85 percentage points

### UZ-144 — Abigail character dialogue

- Target: `Characters/Dialogue/Abigail`
- English source: `unpacked-all/Characters/Dialogue/Abigail.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-abigail.json`
- Entries: all 150 English records
- Scope: Abigail’s gaming, caves and adventure, spirits and graveyard, Sam and Sebastian friendships, family, resort, festivals, relationship branches, fashion choices, and seasonal dialogue
- Control contract preserved exactly: player marker `@`, `%Abigail`, `%noun`, `$c 0.5#` variant, `$p` conditionals, `$q`/`$r` dialogue choices, `$query PLAYER_NPC_RELATIONSHIP current any married roommate#...|...`, `$d joja#...|...`/`$d cc#...|...` conditionals, timed tokens `#$1 Abigail1#`/`#$1 AbigailHAND#`, `${guy^lady}$`, dialogue breaks `#$e#`/`#$b#`, gender branches `^`, and emotion markers `$h/$s/$u/$a/$6/$8/$9/$l`
- Glossary decisions applied: canonical `Abigail`, `Sam`, `Sebastian`, `Maru`, `Demetrius`, `Sandy`, `Pelikan shaharchasi`, `Jamoat markazi`, `JojaMart`, `Ruhlar arafasi`, `Yulduz tomchisi saluni`, `Bahor/Yoz/Kuz/Qish`, and `Junimo`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Abigail, Sam, Sebastian, Maru, Demetrius, Sandy, JojaMart, Community Center, Saloon, and seasons were rechecked before translation
- Overall textual coverage after this batch: 7,700 / 14,720 unique English records (52.31%), an increase of 1.02 percentage points

### UZ-145 — Penny character dialogue

- Target: `Characters/Dialogue/Penny`
- English source: `unpacked-all/Characters/Dialogue/Penny.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/dialogue-penny.json`
- Entries: all 105 English records
- Scope: Penny’s tutoring, Pam and trailer life, Jas and Vincent, Maru and Gunther memories, library, resort, festivals, relationship choices, events, and seasonal routines
- Control contract preserved exactly: player marker `@`, `%fork`, `$y` question branches with `_Actions_/_Intentions_/_Both_` labels, `$p` conditionals, `$q`/`$r` dialogue choices, `$d bus#...|...`/`$d cc#...|...`/`$d Joja#...|...` conditionals, dialogue breaks `#$e#`/`#$b#`, gender branch `^`, and emotion markers `$h/$s/$u/$a/$3/$6/$7/$8/$9/$10/$l`
- Glossary decisions applied: canonical `Penny`, `Pam`, `Jas`, `Vincent`, `Maru`, `Gunther`, `Pelikan shaharchasi`, `Muzey va kutubxona`, `Jamoat markazi`, `Yulduz tomchisi saluni`, `Joja / Joja korporatsiyasi / JojaMart`, `Kaliko cho‘li`, `ferma / Ferma`, and `Qish yulduzi ziyofati`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Penny, Pam, Jas, Vincent, Maru, Gunther, Pelikan shaharchasi, Muzey va kutubxona, Community Center, Saloon, Joja, Calico Desert, farm, and Winter Star were rechecked before translation
- Overall textual coverage after this batch: 7,805 / 14,720 unique English records (53.02%), an increase of 0.71 percentage points

### UZ-146 — BigCraftables names and descriptions, part 1

- Target: `Strings/BigCraftables`
- English source: `unpacked-all/Strings/BigCraftables.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-bigcraftables-1.json`
- Entries: 69 consecutive English records, from `AncientStool_Name` through `Deconstructor_Description`
- Scope: ancient furniture, anvil and trinket reforging, animal automation, bait and honey equipment, chests, braziers, furniture, lighting, cooking and processing machines, and the first arcade/sign objects
- Control contract preserved exactly: all source keys, punctuation, ellipses, and empty technical structure are unchanged; this part contains no runtime placeholders or dialogue commands
- Glossary decisions applied: canonical `Sandon`, `iridiy`, `o‘g‘it`, `yem`, `Asalari uyasi`, `Parrandaxona`, `Molxona`, `Sandiq / Katta sandiq / Tosh sandiq / Katta tosh sandiq`, `Kristallariy`, `ferma / Ferma`, and `Dasht qiroli`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for anvil, iridium, fertilizer, bait, bee house, coop, barn, chest, Crystalarium, farm, and Prairie King terminology were rechecked before translation
- Overall textual coverage after this batch: 7,874 / 14,720 unique English records (53.49%), an increase of 0.47 percentage points

### UZ-147 — BigCraftables names and descriptions, part 2

- Target: `Strings/BigCraftables`
- English source: `unpacked-all/Strings/BigCraftables.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-bigcraftables-2.json`
- Entries: 72 consecutive English records, from `DecorativePitcher_Name` through `LogSection_Description`
- Scope: dehydrator, deluxe scarecrow and worm bin, farm computer, fish smoker, furnaces, garden pot, geode crusher, heaters, hoppers, incubator, Junimo chest and arcade machine, keg, lightning rod, and related furniture/decorations
- Control contract preserved exactly: all source keys, punctuation, ellipses, quotation marks, and the two literal unknown-name placeholders `??Foroguemon??` and `??HMTGF??` remain unchanged in structure; this part contains no runtime placeholders or dialogue commands
- Glossary decisions applied: canonical `Quritkich`, `Baliq dudlagich`, `Pech`, `Og‘ir pech`, `Og‘ir shira yig‘gich`, `Geoda maydalagich`, `Inkubator`, `Keg/Bochka`, `Chaqmoq tutgich`, `Junimo`, `ferma / Ferma`, `o‘g‘it`, and `yem`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for dehydrator, fish smoker, furnace, geode crusher, heavy furnace/tapper, incubator, keg, lightning rod, Junimo, farm, fertilizer, and bait terminology were rechecked before translation
- Overall textual coverage after this batch: 7,946 / 14,720 unique English records (53.97%), an increase of 0.48 percentage points

### UZ-148 — BigCraftables names and descriptions, part 3

- Target: `Strings/BigCraftables`
- English source: `unpacked-all/Strings/BigCraftables.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-bigcraftables-3.json`
- Entries: 80 consecutive English records, from `Loom_Name` through `SkullBrazier_Description`
- Scope: looms and processing machines, mini storage and teleportation objects, mushroom equipment, obelisks, oil and preserves, ostrich incubator, Prairie King arcade, rarecrows, recycling, seasonal decorations, seed and sewing machines, signs, and skeleton/skull decor
- Control contract preserved exactly: all source keys, counts in the rarecrow descriptions, punctuation, and the literal unknown-name placeholders `??Pinky Lemon??` remain unchanged in structure; this part contains no runtime placeholders or dialogue commands
- Glossary decisions applied: canonical `To‘quv dastgohi`, `Tuyaqush`, `Urug‘ tayyorlagich`, `Qo‘ziqorin xodasi`, `ferma / Ferma`, `fasl`, `Junimo`, `Dasht qiroli`, and `Sandon`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for loom, ostrich, seed maker, mushroom log, season, Junimo, Prairie King, farm, and anvil terminology were rechecked before translation
- Overall textual coverage after this batch: 8,026 / 14,720 unique English records (54.52%), an increase of 0.54 percentage points

### UZ-149 — BigCraftables names and descriptions, part 4

- Target: `Strings/BigCraftables`
- English source: `unpacked-all/Strings/BigCraftables.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-bigcraftables-4.json`
- Entries: 92 consecutive English records, from `SlimeBall_Name` through `WormBin_Description`
- Scope: slime equipment, prehistoric displays, solar panel and statues, stone and garden decorations, strange capsule, armor, signs, tapper and telephone, workbench, and worm bin
- Control contract preserved exactly: all source keys, rarecrow counts in the preceding batch, punctuation and ellipses remain stable; no runtime placeholders or dialogue commands occur in this range
- Glossary decisions applied: canonical `Quyosh paneli`, `iridiy`, `Stardew Valley`, `Mukammallik`, `Junimo`, `Qattiq yog‘och`, `Shira yig‘gich`, `Dastgoh`, `Chuvalchang qutisi / Hashamatli chuvalchang qutisi`, and `yem`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for solar panel, iridium, perfection, Junimo, hardwood, tapper, workbench, worm bin, bait, and Stardew Valley were rechecked before translation
- Overall textual coverage after this batch: 8,118 / 14,720 unique English records (55.15%), an increase of 0.63 percentage points

### UZ-150 — Mail and cooking-recipe letters, part 1

- Target: `Data/mail`
- English source: `unpacked-all/Data/mail.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/mail-1.json`
- Entries: 40 consecutive English records, from `Robin` through `ClintCooking`
- Scope: gift letters from townspeople, animal-sale notices, Mermaid’s Pendant and bouquet guidance, and the first cooking-recipe letters
- Control contract preserved exactly: recipient marker `@`, line-break markers `^`, item and money commands `%item ...`, recipe commands `%item cookingRecipe`, archive separator `%%`, and mail-title marker `[#]` all match the English source
- Glossary decisions applied: canonical `Pelikan shaharchasi`, `Kaliko cho‘li`, `JojaMart`, `Jamoat markazi`, `Yulduz tomchisi saluni`, `Stardew Valley`, `ferma / Ferma`, `iridiy`, `o‘g‘it`, and `yem`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Pelican Town, Calico Desert, JojaMart, Saloon, farm, fertilizer, bait, Stardew Valley, Mermaid’s Pendant, and bouquet terminology were rechecked before translation
- Overall textual coverage after this batch: 8,158 / 14,720 unique English records (55.42%), an increase of 0.27 percentage points

### UZ-151 — Mail and cooking-recipe letters, part 2

- Target: `Data/mail`
- English source: `unpacked-all/Data/mail.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/mail-2.json`
- Entries: 40 consecutive English records, from `JodiCooking` through `marnieAutoGrabber`
- Scope: remaining early cooking-recipe letters, family letters from Mom and Dad, newspaper and store notices, kitchen expansion, quest rewards, adoption and mine notices, festival/arcade letters, invitations, and the Auto-Grabber notice
- Control contract preserved exactly: recipient marker `@`, line-break markers `^`, item and money commands `%item ...`, archive separator `%%`, recipe commands, item IDs `(O)`/`(BC)`, and mail-title marker `[#]` all match the English source
- Glossary decisions applied: canonical `Pelikan shaharchasi`, `Kaliko cho‘li`, `JojaMart`, `Muzey va kutubxona`, `Jamoat markazi`, `Yulduz tomchisi saluni`, `Dasht qiroli`, `Junimo`, `Parrandaxona`, `ferma / Ferma`, and `o‘g‘it`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Pelican Town, Calico Desert, JojaMart, library, Community Center, Saloon, Prairie King, Junimo, coop, farm, and fertilizer were rechecked before translation
- Overall textual coverage after this batch: 8,198 / 14,720 unique English records (55.69%), an increase of 0.27 percentage points

### UZ-152 — Mail and event notices, part 3

- Target: `Data/mail`
- English source: `unpacked-all/Data/mail.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/mail-3.json`
- Entries: 40 consecutive English records, from `EmilyClothingTherapy` through `winter_26_1`
- Scope: invitations and personal notes, community-center and guild notices, Qi and Robin requests, festival notices, seasonal reminders, and the first dated quest requests
- Control contract preserved exactly: recipient marker `@`, line-break markers `^`, item and quest commands `%item ...`, item IDs, `%secretsanta`, archive separator `%%`, and mail-title marker `[#]` all match the English source
- Glossary decisions applied: canonical `Jamoat markazi`, `Pelikan shaharchasi`, `Qish yulduzi ziyofati`, `Ruhlar arafasi`, `Tuxum festivali`, `Gullar raqsi`, `Muz festivali`, `Tungi bozor`, `Stardew Valley`, `Kaliko cho‘li`, `qattiq yog‘och`, and `yem`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Community Center, Pelican Town, Winter Star, Spirit’s Eve, Egg Festival, Flower Dance, Festival of Ice, Night Market, Stardew Valley, Calico Desert, hardwood, and bait were rechecked before translation
- Overall textual coverage after this batch: 8,238 / 14,720 unique English records (55.96%), an increase of 0.27 percentage points

### UZ-153 — Mail and event notices, part 4

- Target: `Data/mail`
- English source: `unpacked-all/Data/mail.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/mail-4.json`
- Entries: 40 consecutive English records, from `spring_1_2` through `MSB_Lewis`
- Scope: dated requests, Joja invoices and exhaustion notices, Elliott’s travel letters, recovery and reward letters, crafting-recipe notices, and the Mini-Shipping Bin letters
- Control contract preserved exactly: recipient marker `@`, line-break markers `^`, item/quest/crafting/conversation commands, `%secretsanta`, `{0}` billing placeholder, item IDs, archive separator `%%`, and mail-title marker `[#]` all match the English source
- Glossary decisions applied: canonical `Qish yulduzi ziyofati`, `Pelikan shaharchasi`, `Yulduz tomchisi saluni`, `Stardew Valley`, `Zuzu shahri`, `JojaMart`, `Noyob qo‘rqinchiqush`, `Qattiq yog‘och`, `Mini-jo‘natish qutisi`, `iridiy`, and `ferma / Ferma`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Winter Star, Pelican Town, Saloon, Stardew Valley, Zuzu City, JojaMart, Rarecrow, hardwood, Mini-Shipping Bin, iridium, and farm were rechecked before translation
- Overall textual coverage after this batch: 8,278 / 14,720 unique English records (56.24%), an increase of 0.27 percentage points

### UZ-154 — Mail and event notices, part 5 (complete)

- Target: `Data/mail`
- English source: `unpacked-all/Data/mail.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/mail-5.json`
- Entries: final 19 English records, from `WizardReward` through `MarniePetRejectedAdoption`
- Scope: wizard and Demetrius reward letters, Willy/Linus/Gus/Pam/Emily/Caroline island notices, Ginger Island and Green Rain notices, Desert Festival reminder, and pet-adoption letters
- Control contract preserved exactly: line-break markers `^`, recipient marker `@`, item/crafting commands, item IDs, archive separator `%%`, and mail-title marker `[#]` all match the English source
- Glossary decisions applied: canonical `Zanjabil oroli`, `Kaliko cho‘li`, `Yulduz tomchisi saluni`, `Joja Maxsus xizmatlari`, `Pelikan shaharchasi`, `Quyosh paneli`, `Junimo`, `qattiq yog‘och`, and `uy hayvoni`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Ginger Island, Calico Desert, Saloon, Joja Special Services, Pelican Town, Solar Panel, Junimo, hardwood, and pet terminology were rechecked before translation
- Overall textual coverage after this batch: 8,297 / 14,720 unique English records (56.37%), an increase of 0.13 percentage points
- Resource completion: all 179 / 179 English `Data/mail` records are now covered by `mail-1.json` through `mail-5.json`

### UZ-155 — Shirts names and descriptions, part 1

- Target: `Strings/Shirts`
- English source: `unpacked-all/Strings/Shirts.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/shirts-1.json`
- Entries: 80 consecutive English records, from `Shirt_Name` through `BikiniTop_Name`
- Scope: basic shirts, overalls, blouses, striped and themed shirts, formal tops, vests, jackets, tunics, Emily’s magic shirt, tank tops, ponchos, and the first crop/bikini entries
- Control contract preserved exactly: all source keys and the explicit `(F)` / `(M)` name suffixes remain unchanged; this range contains no runtime placeholders or dialogue commands
- Glossary decisions applied: canonical `ferma / Ferma`, `sarguzashtchi`, `Kovboy`, `Dengizchi`, `Jamoat markazi`-independent clothing terminology, and Uzbek gender suffix labels `(F)` / `(M)`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for farm, adventurer, cowboy, sailor, and clothing terminology were rechecked before translation
- Overall textual coverage after this batch: 8,377 / 14,720 unique English records (56.91%), an increase of 0.54 percentage points

### UZ-156 — Shirts names and descriptions, part 2

- Target: `Strings/Shirts`
- English source: `unpacked-all/Strings/Shirts.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/shirts-2.json`
- Entries: 80 consecutive English records, from `BikiniTop_Description` through `TunnelersJersey_Name`
- Scope: themed and decade shirts, jackets, strap and crop tops, tie-dye and metal breastplates, flannel and bomber jackets, fishing/cave gear, hoodies, martial-arts uniforms, desert and blacksmith clothing, high-waisted shirts, sweaters, and iridium/tunneler apparel
- Control contract preserved exactly: all source keys and explicit `(F)` / `(M)` name suffixes remain unchanged; this range contains no runtime placeholders or dialogue commands
- Glossary decisions applied: canonical `iridiy`, `Qattiq yog‘och`, `Kovboy`, `Dengizchi`, `ferma / Ferma`, and consistent Uzbek clothing terms for ko‘ylak, bluzka, kurtka, nimcha, tunika, sviter, and sovut
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for iridium, hardwood, cowboy, sailor, farm, and clothing terminology were rechecked before translation
- Overall textual coverage after this batch: 8,457 / 14,720 unique English records (57.45%), an increase of 0.54 percentage points

### UZ-157 — Shirts names and descriptions, part 3

- Target: `Strings/Shirts`
- English source: `unpacked-all/Strings/Shirts.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/shirts-3.json`
- Entries: 80 consecutive English records, from `TunnelersJersey_Description` through `BeltedCoat_Description`
- Scope: Zuzu Tunnelers and formalwear, holiday and novelty shirts, bandanas and vintage clothing, vacation and slime shirts, sports and chef clothing, overalls, Yoba, necklace, and belted coat entries
- Control contract preserved exactly: all source keys and explicit `(F)` / `(M)` name suffixes remain unchanged; this range contains no runtime placeholders or dialogue commands
- Glossary decisions applied: canonical `Zuzu shahri`, `Qish yulduzi ziyofati`, `Yoba`, `ferma / Ferma`, `iridiy`, and consistent Uzbek clothing terminology
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Zuzu City, Winter Star, Yoba, farm, iridium, and clothing terminology were rechecked before translation
- Overall textual coverage after this batch: 8,537 / 14,720 unique English records (58.00%), an increase of 0.54 percentage points

### UZ-158 — Shirts names and descriptions, part 4

- Target: `Strings/Shirts`
- English source: `unpacked-all/Strings/Shirts.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/shirts-4.json`
- Entries: 80 consecutive English records, from `GoldTrimmedShirt_Name` through `DarkBandanaShirt_Description`
- Scope: prismatic, pendant, flame and antiquity shirts, jewelry and novelty clothing, uniforms, suits, food-themed shirts, flannel and seasonal shirts, raincoat, sailor, and bandana entries
- Control contract preserved exactly: all source keys remain unchanged; this range contains no runtime placeholders or dialogue commands
- Glossary decisions applied: canonical `iridiy`, `Dengizchi`, `ferma / Ferma`, and consistent Uzbek terms for ko‘ylak, kurtka, kostyum, forma, nimcha, and yomg‘irpo‘sh
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for iridium, sailor, farm, and clothing terminology were rechecked before translation
- Overall textual coverage after this batch: 8,617 / 14,720 unique English records (58.54%), an increase of 0.54 percentage points

### UZ-159 — Shirts names and descriptions, part 5 (complete)

- Target: `Strings/Shirts`
- English source: `unpacked-all/Strings/Shirts.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/shirts-5.json`
- Entries: final 78 English records, from `DarkHighlightShirt_Name` through `MysteryShirt_Description`
- Scope: novelty and formal shirts, overalls, jackets, vests, food and color-themed clothing, tropical shirts, island bikini, magic sprinkle, both prismatic-sleeve variants, and the Mystery Shirt
- Control contract preserved exactly: all source keys remain unchanged; this range contains no runtime placeholders or dialogue commands
- Glossary decisions applied: canonical clothing terminology and consistent Uzbek terms for ko‘ylak, kurtka, nimcha, kombinezon, kostyum, yeng, and ranglar
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for clothing terminology and stable color/item terms were rechecked before translation
- Overall textual coverage after this batch: 8,695 / 14,720 unique English records (59.07%), an increase of 0.53 percentage points
- Resource completion: all 398 / 398 English `Strings/Shirts` records are now covered by `shirts-1.json` through `shirts-5.json`

### UZ-160 — Location and facility messages, part 1

- Target: `Strings/Locations`
- English source: `unpacked-all/Strings/Locations.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-locations-1.json`
- Entries: first 100 consecutive English records, from `AdventureGuild_KillList_Header` through `WomensLocker_WrongGender`
- Scope: Adventurer’s Guild monster goals, incubator messages, Night Market vendors, beach bridge and mariner messages, mine-cart and bus-stop destinations, Community Center completion text, desert return prompt, farm/grandpa messages, spouse attack reactions, wizard tower/ sewer notices, and locker-room access messages
- Control contract preserved exactly: all source keys and `{0}` / `{1}` placeholders remain unchanged; multiline notices retain their line-break structure
- Glossary decisions applied: canonical `Jamoat markazi`, `Junimo / Junimolar`, `Kaliko cho‘li`, `Zanglagan kalit`, `Kanalizatsiya`, `Suvpari kuloni`, `Tosh koni`, `Avtobus bekati`, `Qozonxona`, `E’lonlar taxtasi`, `Akvarium`, `Oziq-ovqat ombori`, `Xazina xonasi`, `Tashlandiq JojaMart`, and `Ot`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Community Center, Junimo, Calico Desert, Rusty Key, sewer, Mermaid’s Pendant, quarry, bus stop, facility names, JojaMart, and horse were rechecked before translation
- Overall textual coverage after this batch: 8,795 / 14,720 unique English records (59.75%), an increase of 0.68 percentage points

### UZ-161 — Location and facility messages, part 2

- Target: `Strings/Locations`
- English source: `unpacked-all/Strings/Locations.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-locations-2.json`
- Entries: 100 consecutive English records, from `Saloon_ColaMachine_Question` through `AnimalShop_Marnie_Leave`
- Scope: Joja Cola and ice-cream stand prompts, Wizard Shrine and backpack upgrades, Mr. Qi’s desert/railroad/manor/tunnel notes, shared-wallet and divorce ledgers, mayor’s fridge, Skull Cavern door, Junimo Kart and CalicoJack menus, casino messages, Secret Notes, dwarf-grave riddle, special charm, Yoba altar, locks, carpenter, blacksmith, and animal-shop menus
- Control contract preserved exactly: all source keys, `{0}` / `{1}` placeholders, and multiline notes remain structurally intact
- Glossary decisions applied: canonical `Joja`, `Janob Qi`, `Kaliko cho‘li`, `Qi tangasi`, `CalicoJack`, `Sirli qayd`, `Yoba`, `Quyon`, `Bosh suyagi kaliti`, `Geodalarni ochish`, `Asboblarni yaxshilash`, `Hayvonlarni sotib olish`, and `Anjomlar do‘koni`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Joja, Mr. Qi, Calico Desert, Qi Coin, CalicoJack, Secret Note, Yoba, rabbit, Skull Key, geodes, tool upgrades, animal purchase, and supplies were rechecked before translation
- Overall textual coverage after this batch: 8,895 / 14,720 unique English records (60.43%), an increase of 0.68 percentage points

### UZ-162 — Location and facility messages, part 3

- Target: `Strings/Locations`
- English source: `unpacked-all/Strings/Locations.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-locations-3.json`
- Entries: 70 consecutive English records, from `AnimalShop_Marnie_Absent` through `IslandNorth_CaveHelp_3`
- Scope: museum and theater menus, CalicoJack rules, house and community upgrades, Joja membership, mine and railroad notices, sewer and Witch’s Swamp shrines, Krobus eviction, movie posters, sewing and dyeing, Caroline’s tea event, Desert Trader, mailbox/ticket prompts, and the first island cave rescue messages
- Control contract preserved exactly: all source keys, `{0}` / `{1}` placeholders, caret separators, and multiline notices remain structurally intact
- Glossary decisions applied: canonical `Muzey`, `Mukofotlar`, `Jamoat markazi`, `Joja ombori`, `qattiq yog‘och`, `Sarguzashtchilar gildiyasi`, `Stardew Valley`, `Kanalizatsiya`, `prizmatik parcha`, `Kulbani yaxshilash`, and `Buyumni qaytarish xizmati`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Community Center, Joja, hardwood, Adventurer’s Guild, Stardew Valley, sewer, Prismatic Shard, cabin upgrade, and item recovery were rechecked before translation
- Overall textual coverage after this batch: 8,965 / 14,720 unique English records (60.90%), an increase of 0.48 percentage points

### UZ-163 — Location and facility messages, part 4

- Target: `Strings/Locations`
- English source: `unpacked-all/Strings/Locations.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-locations-4.json`
- Entries: 30 consecutive English records, from `IslandNorth_CaveTool_0` through `Journal_Name`
- Scope: island cave tool feedback, Professor Snail rescue and field-office events, island survey prompts, house/cabin renovation menus, crib and bedroom renovation descriptions, and the journal label
- Control contract preserved exactly: all source keys, `$s` / `$h` dialogue markers, slash-delimited renovation fields, and every event command/token remain intact; only spoken/display text was translated
- Glossary decisions applied: canonical island survey terminology, Professor Snail naming, `Kulba`, `Yotoqxona`, `Beshik`, `Ta’mirlash`, and `Jurnal`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for island terminology, cabin, bedroom, crib, renovation, and journal were rechecked before translation
- Overall textual coverage after this batch: 8,995 / 14,720 unique English records (61.11%), an increase of 0.20 percentage points

### UZ-164 — Location and facility messages, part 5

- Target: `Strings/Locations`
- English source: `unpacked-all/Strings/Locations.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-locations-5.json`
- Entries: 17 consecutive English records, from `Gourmand_Intro` through `Saloon_Arcade_Cowboy_NewGame`
- Scope: Gourmand Frog introduction, requests, rewards, progress messages, and Prairie King arcade menu labels
- Control contract preserved exactly: pipe-delimited dialogue fields remain in the same order and count; sound-effect markers remain intact
- Glossary decisions applied: canonical `Taomxo‘r qurbaqa` and `Dasht qirolining sarguzashti`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Gourmand Frog and Journey of the Prairie King were rechecked before translation
- Overall textual coverage after this batch: 9,012 / 14,720 unique English records (61.22%), an increase of 0.12 percentage points

### UZ-165 — Location and facility messages, part 6

- Target: `Strings/Locations`
- English source: `unpacked-all/Strings/Locations.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-locations-6.json`
- Entries: 12 consecutive English records, from `qiNutDoor` through `AnimalHouse_Incubator_Hatch_Ostrich`
- Scope: Qi’s walnut-door status, Ginger Island boat-repair donations and hints, Willy’s boat remarks, and the ostrich incubator hatch notice
- Control contract preserved exactly: `#`, `^`, `{0}/100`, and all source keys remain unchanged
- Glossary decisions applied: canonical `qattiq yog‘och`, `iridiy`, and `Tuyaqush`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for hardwood, iridium, and ostrich terminology were rechecked before translation
- Overall textual coverage after this batch: 9,024 / 14,720 unique English records (61.30%), an increase of 0.08 percentage points

### UZ-166 — Location and facility messages, part 7

- Target: `Strings/Locations`
- English source: `unpacked-all/Strings/Locations.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-locations-7.json`
- Entries: 58 consecutive English records, from `NutHint_Squawk` through `Backwoods_MonsterGrave`
- Scope: Golden Walnut hints, resort controls, Lost and Found services, field-office donation replies, volcano shortcut, money boxes, Challenge Shrine, Gil’s telephone unlock, Magma Sprites, incubator states, community shortcut upgrade, summit boulder, and hint/grave text
- Control contract preserved exactly: all source keys, `{0}`, `@`, `$h`, `#$b#`, `^`, and multiline separators remain intact
- Glossary decisions applied: canonical `Zanjabil oroli`, `Vulqon kalderasi`, `Qaroqchilar ko‘rfazi`, `Yulduz tomchisi`, `Yo‘qolgan narsalar`, `Maxsus buyurtma`, `Yordamchi fermer`, `Buyumni qaytarish xizmati`, `Magma ruhlari`, and `Ishora`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Ginger Island, volcano caldera, Pirate’s Cove, Stardrop, lost-and-found, special orders, farmhands, item recovery, Magma Sprites, and hint terminology were rechecked before translation
- Overall textual coverage after this batch: 9,082 / 14,720 unique English records (61.70%), an increase of 0.39 percentage points

### UZ-167 — Location and facility messages, part 8 (complete)

- Target: `Strings/Locations`
- English source: `unpacked-all/Strings/Locations.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-locations-8.json`
- Entries: final 5 English records, `IslandHut_Event_ParrotBoyIntro`, `IslandSecret_Event_BirdieIntro`, `IslandSecret_Event_BirdieFinished`, `alreadyGotNuts`, and `FieldOfficeFinale`
- Scope: Parrot Boy introduction, Birdie’s keepsake story and follow-up branch, Birdie’s reward continuation, and Professor Snail’s final field-office scene
- Control contract preserved exactly: event commands, actor names, sound/effect commands, `quickQuestion` separators, `#$b#`, `$s/$h`, `@`, recipe/mail/quest tokens, and `Strings\\Locations` references remain intact; only dialogue/display text was translated
- Glossary decisions applied: canonical `Birdie`, `Professor Snail`, `Tuyaqush inkubatori`, and consistent island/keepsake terminology
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Birdie, Professor Snail, ostrich incubator, island, and keepsake terminology were rechecked before translation
- Overall textual coverage after this batch: 9,087 / 14,720 unique English records (61.74%), an increase of 0.03 percentage points
- Resource completion: all 392 / 392 English `Strings/Locations` records are now covered by `strings-locations-1.json` through `strings-locations-8.json`

### UZ-168 — Map inspection and room text, part 1

- Target: `Strings/StringsFromMaps`
- English source: `unpacked-all/Strings/StringsFromMaps.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-from-maps-1.json`
- Entries: first 100 consecutive English records, from `AnimalShop.1` through `HarveyRoom.12`
- Scope: Animal Shop and archaeology-house inspection text, bathhouse lockers, blacksmith notes and equipment, bus-stop/forest map labels, Elliot and Haley room objects, Grandpa’s Shrine, Fish Shop objects, and Harvey’s room text
- Control contract preserved exactly: caret-separated notes, `$s`, `@`, backtick/arrow map labels, and all source keys remain unchanged
- Glossary decisions applied: canonical `Junimo`, `Gotoro imperiyasi`, `Gavhar dengizi`, `Stardew Valley`, `Kaliko cho‘li`, `Ferngill Respublikasi`, `Pelikan shaharchasi`, `Cindersap o‘rmoni`, `Baliq do‘koni`, `qarmoq jihozi`, and `Fern orollari`
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Junimo, Gotoro Empire, Gem Sea, Stardew Valley, Calico Desert, Ferngill Republic, Pelican Town, Cindersap Forest, fish shop, tackle, and Fern Islands were rechecked before translation
- Overall textual coverage after this batch: 9,187 / 14,720 unique English records (62.41%), an increase of 0.68 percentage points

### UZ-169 — Map inspection and room text, part 2

- Target: `Strings/StringsFromMaps`
- English source: `unpacked-all/Strings/StringsFromMaps.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-from-maps-2.json`
- Entries: 100 consecutive English records, from `HarveyRoom.13` through `JojaMart.91`
- Scope: hospital signs and notices, JojaMart product labels and parody descriptions, Pravoloxinone disclaimer, branded sauces/drinks, household products, and food items
- Control contract preserved exactly: caret separators, quoted labels, and all source keys remain unchanged
- Glossary decisions applied: canonical `Yoba`, `Ferngill Respublikasi`, `Gotoro imperiyasi`, `Joja`, and consistent food/product terminology
- Online glossary check: the canonical project page was opened in the in-app browser; local Uzbek entries for Yoba, Ferngill Republic, Gotoro Empire, Joja, and related food/product terms were rechecked before translation
- Overall textual coverage after this batch: 9,287 / 14,720 unique English records (63.09%), an increase of 0.68 percentage points

### UZ-170 — Map inspection and room text, part 3

- Target: `Strings/StringsFromMaps`
- English source: `unpacked-all/Strings/StringsFromMaps.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-from-maps-3.json`
- Entries: 100 consecutive English records, from `JojaMart.92` through `Town-Fair.8`
- Scope: remaining JojaMart product labels and parody descriptions, Josh, Leah, Manor, Saloon, Sam, Maru, Sebastian, and Pierre shop-room inspection text, plus seasonal town-fair signs and visitor comments
- Control contract preserved exactly: caret-separated letters and report cards, leading spaces on map labels, quoted titles, punctuation, and all source keys remain unchanged
- Glossary decisions applied: canonical `Yoba`, `Pelikan shaharchasi`, `Joja`, and established Uzbek names for Alex, Leah, Sam, Maru, Sebastian, Pierre, Robin, Penny, Kent, and Vincent
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Yoba, Pelican Town, Joja, and character names were rechecked before translation
- Overall textual coverage after this batch: 9,387 / 14,720 unique English records (63.77%), an increase of 0.68 percentage points

### UZ-171 — Map inspection and festival text, part 4

- Target: `Strings/StringsFromMaps`
- English source: `unpacked-all/Strings/StringsFromMaps.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/strings-from-maps-4.json`
- Entries: final 67 English records, from `Town-Halloween.1` through `PirateBartender_PirateClothes_NoMore`
- Scope: seasonal town signs, trailer and Witch’s Hut inspection text, movie-theater visitor comments, crane game, Island Shrine verse, pirate cove dialogue, darts, and pirate bartender interactions
- Control contract preserved exactly: caret-separated shrine lines, `#` dialogue branches, `$h`, `$b`, `$2`, `{0}`, `@`, and all source keys remain unchanged
- Glossary decisions applied: canonical `Yoba`-era naming from the project glossary, `Pelikan shaharchasi`, `Junimo`, `gubernator`, `arxeologiya`, and established Uzbek character names
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Junimo, Pelican Town, governor, archaeology, and character names were rechecked before translation
- Overall textual coverage after this batch: 9,454 / 14,720 unique English records (64.23%), an increase of 0.46 percentage points

### UZ-172 — Furniture catalogue, part 1

- Target: `Strings/Furniture`
- English source: `unpacked-all/Strings/Furniture.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/furniture-1.json`
- Entries: first 100 consecutive English records, from `DarkPiano` through `SamsBoombox`
- Scope: chair, stool, throne, bench, armchair, couch, dresser, table, tea-table, catalogue, bookcase, pillar, plant, totem, geode, skeleton, statue, and boombox names
- Control contract preserved exactly: all source keys remain unchanged and names are kept as short display labels
- Glossary decisions applied: `geoda`, `obsidian`, `totem`, `Junimo`-era naming consistency, and established Uzbek furniture terminology (`stul`, `taburet`, `kreslo`, `divan`, `komod`, `javon`)
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for geode, obsidian, totem, and related material terms were rechecked before translation
- Overall textual coverage after this batch: 9,554 / 14,720 unique English records (64.90%), an increase of 0.68 percentage points

### UZ-173 — Furniture catalogue, part 2

- Target: `Strings/Furniture`
- English source: `unpacked-all/Strings/Furniture.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/furniture-2.json`
- Entries: next 100 consecutive English records, from `SmallPlant` through `PirateRug`
- Scope: plants, end tables, lamps, rugs, televisions, wall art, windows, Junimo plush, nautical décor, fireplaces, and pirate-themed furnishings
- Control contract preserved exactly: all source keys, title quotation marks, and literal `#` numbers in named posters/films remain unchanged
- Glossary decisions applied: `Gavhar dengizi`, `Kaliko`, `Junimo`, `Iridiy`, and consistent terms for gilam, chiroq, deraza, kamin, and o‘yinchoq
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Gem Sea, Calico, Junimo, and iridium were rechecked before translation
- Overall textual coverage after this batch: 9,654 / 14,720 unique English records (65.58%), an increase of 0.68 percentage points

### UZ-174 — Furniture catalogue, part 3

- Target: `Strings/Furniture`
- English source: `unpacked-all/Strings/Furniture.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/furniture-3.json`
- Entries: next 100 consecutive English records, from `BoneRug` through `ModernRug`
- Scope: decorative rugs and decals, film posters, Junimo and character statues, beds, fish tanks, tropical décor, banners, wall décor, fireplaces, and specialty rugs
- Control contract preserved exactly: all source keys, title quotation marks, and literal numbered `#` labels remain unchanged
- Glossary decisions applied: `Junimo`, `Taomxo‘r`, `Krobus`, `Iridiy`, `changalzor`, `baliq akvariumi`, and established furniture terms
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Junimo, Iridium, Krobus, and Island-related terms were rechecked before translation
- Overall textual coverage after this batch: 9,754 / 14,720 unique English records (66.26%), an increase of 0.68 percentage points

### UZ-175 — Furniture catalogue, part 4

- Target: `Strings/Furniture`
- English source: `unpacked-all/Strings/Furniture.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/furniture-4.json`
- Entries: next 100 consecutive English records, from `SquirrelFigurine` through `LongElixirTable`
- Scope: desert and Calico décor, Joja furniture, JojaCola displays, wizard furniture, witch items, and elixir shelves and tables
- Control contract preserved exactly: all source keys and the literal single-letter `J` display label remain unchanged
- Glossary decisions applied: `Kaliko`, `Joja`, `JojaCola`, `Jamoat markazi`, `Krobus`-era material terminology, `eliksir`, `sehrgar`, and `jodugar`
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Calico, Joja, Community Center, wizard, witch, and elixir terminology were rechecked before translation
- Overall textual coverage after this batch: 9,854 / 14,720 unique English records (66.94%), an increase of 0.68 percentage points

### UZ-176 — Furniture catalogue, part 5

- Target: `Strings/Furniture`
- English source: `unpacked-all/Strings/Furniture.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/furniture-5.json`
- Entries: next 100 consecutive English records, from `WizardLamp` through `RetroBed`
- Scope: wizard tower décor, runes and crystal balls, book stacks, Junimo furnishings, Community Center and Stardrop art, character portraits, bulletin-board furniture, and leafy wall panels
- Control contract preserved exactly: all source keys and title quotation marks remain unchanged
- Glossary decisions applied: `sehrgar`, `Junimo`, `Jamoat markazi`, `Yulduz tomchisi`, `Krobus`, canonical Uzbek character names, and consistent book/portrait/furniture terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Junimo, Community Center, Stardrop, Krobus, and character names were rechecked before translation
- Overall textual coverage after this batch: 9,954 / 14,720 unique English records (67.62%), an increase of 0.68 percentage points

### UZ-177 — Furniture catalogue, completion

- Target: `Strings/Furniture`
- English source: `unpacked-all/Strings/Furniture.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/furniture-6.json`
- Entries: final 91 English records, from `RetroDresser` through `MidnightDoubleBed`
- Scope: retro furniture, wall clocks and doors, instruments, pet furniture, lighting and switches, household décor, discarded objects, and beach-night beds
- Control contract preserved exactly: all source keys and title quotation marks remain unchanged
- Glossary decisions applied: consistent `retro`, `uy hayvoni`, `maysazor`, `plyaj`, and established furniture terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for furniture, household objects, and beach-related terms were rechecked before translation
- Overall textual coverage after this batch: 10,045 / 14,720 unique English records (68.24%), an increase of 0.62 percentage points
- `Strings/Furniture` is now fully covered: 591 / 591 records

### UZ-178 — Movie reactions, part 1

- Target: `Strings/MovieReactions`
- English source: `unpacked-all/Strings/MovieReactions.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/movie-reactions-1.json`
- Entries: first 100 consecutive English records, from `Penny_*_BeforeMovie` through `Harvey_dislike_BeforeMovie`
- Scope: Penny, Pam, Krobus, Wizard, George, Alex, Evelyn, Pierre, Abigail, Caroline, and Harvey movie reactions before, during, and after screenings
- Control contract preserved exactly: `$s`, `$h`, `$8`, `$6`, `$b`, `#`, `{0}`, `{2}`, `@`, parenthetical stage directions, and all source keys remain unchanged
- Glossary decisions applied: canonical character names, `Zuzu shahri`, `Dasht qirolining sarguzashtlari`, `Yulduz tomchisi`-era terminology, and established movie/kinoteatr wording
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for character names, Zuzu City, Prairie King, and cinema terms were rechecked before translation
- Overall textual coverage after this batch: 10,145 / 14,720 unique English records (68.92%), an increase of 0.68 percentage points

### UZ-179 — Movie reactions, part 2

- Target: `Strings/MovieReactions`
- English source: `unpacked-all/Strings/MovieReactions.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/movie-reactions-2.json`
- Entries: next 100 consecutive English records, from `Harvey_dislike_DuringMovie` through `Demetrius_winter_movie_1_AfterMovie`
- Scope: Gus, Lewis, Jodi, Sam, Vincent, Kent, Clint, Emily, Haley, Maru, Sebastian, Robin, and Demetrius reactions across movie genres and scenes
- Control contract preserved exactly: `$s`, `$h`, `$8`, `$7`, `$4`, `$3`, `$10`, `^`, `#`, `@`, `*...*`, and all source keys remain unchanged
- Glossary decisions applied: canonical character names, `Yoba`, `Pelikan shaharchasi`, `Stardew Valley`, `Joja Cola`, `Vumbus`, and consistent cinema terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Yoba, Pelican Town, Joja Cola, characters, and movie terms were rechecked before translation
- Overall textual coverage after this batch: 10,245 / 14,720 unique English records (69.60%), an increase of 0.68 percentage points

### UZ-180 — Movie reactions, completion

- Target: `Strings/MovieReactions`
- English source: `unpacked-all/Strings/MovieReactions.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/movie-reactions-3.json`
- Entries: final 69 English records, from `Demetrius_summer_movie_1_BeforeMovie` through `Leo_like_AfterMovie`
- Scope: final Demetrius, Linus, Dwarf, Marnie, Shane, Jas, Leah, Sandy, Elliott, Willy, and Leo reactions
- Control contract preserved exactly: `$s`, `$h`, `$3`, `$4`, `$7`, `@`, `*...*`, and all source keys remain unchanged
- Glossary decisions applied: canonical `Mitti`, `Pelikan shaharchasi`, `Fern orollari`, established character names, and consistent movie terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Dwarf/Mitti, Pelican Town, Fern Islands, and character names were rechecked before translation
- Overall textual coverage after this batch: 10,314 / 14,720 unique English records (70.07%), an increase of 0.47 percentage points

### UZ-181 — Stardew Valley 1.6 strings, part 1

- Target: Strings/1_6_Strings
- English source: unpacked-all/Strings/1_6_Strings.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/1-6-strings-1.json
- Entries: first 100 consecutive English records, from ForestPylon through Scholar_Question_1_0_Answers
- Scope: forest pylon relic and event script, SquidFest lines, Desert Festival marriage and villager dialogue, Cactus Man shop, Willy’s desert fishing challenges, and Scholar quiz prompts/options/answers
- Control contract preserved exactly: event command script, $h, $e, $b, $s, $5, %, @, %name, {0}, and comma-separated quiz arrays remain structurally intact
- Glossary decisions applied: Kaliko cho‘li, Kaliko tuxumlari, Skelet g‘orlari, qum baliqchasi, chayon karpi, qalqovich, and canonical character names
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Calico, Skull Cavern, Sandfish, Scorpion Carp, bobber, and character names were rechecked before translation
- Overall textual coverage after this batch: 10,414 / 14,720 unique English records (70.75%), an increase of 0.68 percentage points

The ForestPylonEvent command string was kept byte-for-byte except for the visible spoken sentence, and the quiz option/answer arrays retain their original item counts.

### UZ-182 — Stardew Valley 1.6 strings, part 2

- Target: Strings/1_6_Strings
- English source: unpacked-all/Strings/1_6_Strings.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/1-6-strings-2.json
- Entries: next 100 consecutive English records, from Scholar_Question_1_1 through Shady_Guy_Selected_2
- Scope: remaining Scholar quiz questions and arrays, Chef ingredients/sauces/dishes, festival race announcements and racer names, and Suspicious Guy race dialogue
- Control contract preserved exactly: `{0}`, `$h`, `$b`, `$s`, `*...*`, and comma-separated options/answers retain their original structure and counts
- Glossary decisions applied: Kaliko tuxumlari, Skelet g‘ori, qum baliqchasi, chayon karpi, qalqovich, and consistent culinary and race terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Calico, Skull Cavern, Sandfish, Scorpion Carp, bobber, and festival terms were rechecked before translation
- Overall textual coverage after this batch: 10,514 / 14,720 unique English records (71.43%), an increase of 0.68 percentage points

### UZ-183 — Stardew Valley 1.6 strings, part 3

- Target: Strings/1_6_Strings
- English source: unpacked-all/Strings/1_6_Strings.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/1-6-strings-3.json
- Entries: next 100 consecutive English records, from Shady_Guy_Selected_3 through DF_Mine_CalicoStatue_Name_17
- Scope: Adventurer’s Guild challenges and ratings, Emily/Sandy makeover dialogue, Desert Festival shop lines, and Skull Cavern Challenge explanations, statue effects, and egg-treasure names
- Control contract preserved exactly: `$b`, `$h`, `$s`, `$4`, `$5`, `$10`, `^`, `^^`, `{0}`, and all source keys remain unchanged
- Glossary decisions applied: Sarguzashtchilar gildiyasi, Kaliko tuxumlari, Kaliko haykali, Skelet g‘ori, Tuxum bahosi, and established character names
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Adventurer’s Guild, Calico, Skull Cavern, Calico Statue, and character names were rechecked before translation
- Overall textual coverage after this batch: 10,614 / 14,720 unique English records (72.11%), an increase of 0.68 percentage points

### UZ-184 — Stardew Valley 1.6 strings, part 4

- Target: Strings/1_6_Strings
- English source: unpacked-all/Strings/1_6_Strings.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/1-6-strings-4.json
- Entries: next 100 consecutive English records, from DF_Mine_CalicoStatue_Description_0 through IridiumSpur_Description
- Scope: Calico Statue effect descriptions, Trout Derby and SquidFest signage/booths, festival labels, Mastery paths, Blessings, Dwarf Statue benefits, and Trinket names/descriptions
- Control contract preserved exactly: Content Patcher sign markup, double backslashes, `^` breaks, `{0}`, `{1}`, `{2}`, and all source keys remain unchanged
- Glossary decisions applied: Kaliko, Forel derbisi, Kalmar festivali, Iridiy, mahorat, geoda, tumor, prizmatik, and canonical combat/fishing terms
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Calico, Trout Derby, SquidFest, iridium, mastery, geode, and trinkets were rechecked before translation
- Overall textual coverage after this batch: 10,714 / 14,720 unique English records (72.79%), an increase of 0.68 percentage points

### UZ-185 — Stardew Valley 1.6 strings, part 5

- Target: Strings/1_6_Strings
- English source: unpacked-all/Strings/1_6_Strings.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/1-6-strings-5.json
- Entries: next 100 consecutive English records, from BasiliskPaw_Name through buy_books
- Scope: advanced trinkets and frog/parrot variants, Golden Parrot and Fizz services, books and skills, forest magic, Raccoon shop dialogue, farm/rain messages, Fish Frenzy notices, Mastery notes, Joja catalogue terms, and debt notices
- Control contract preserved exactly: `$b`, `$h`, `$s`, `$u`, `^`, `^^`, `{0}`, `{1}`, `{2}`, `%`, `_`, `|`, comma-separated starter names, and all source keys remain unchanged
- Glossary decisions applied: tumor, prizmatik, iridiy, Mister Qi, Joja THRIVE, Cindersap o‘rmoni, Mastery, qattiq yog‘och, and canonical animal/farm terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Joja, Qi, Cindersap Forest, trinkets, iridium, and mastery terms were rechecked before translation
- Overall textual coverage after this batch: 10,814 / 14,720 unique English records (73.46%), an increase of 0.68 percentage points

### UZ-186 — Stardew Valley 1.6 strings, completion

- Target: Strings/1_6_Strings
- English source: unpacked-all/Strings/1_6_Strings.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/1-6-strings-6.json
- Entries: final 92 English records, from trade_books through LearnedANewPower
- Scope: bookseller and quest labels, enchantments, Joja/Qi notices, machines and recipes, renovations, pet adoption, mastery settings, profession effects, Skull Cavern warnings, and final UI labels
- Control contract preserved exactly: `$b`, `#$b#`, `^^`, `{0}`, `{1}`, `{2}`, `_`, `/`, and all source keys remain unchanged
- Glossary decisions applied: tumor, enchantment stats, Joja, Mister Qi, Junimo, Iridiy, Skelet g‘ori, mastery, and pet/farm terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Joja, Qi, Junimo, iridium, Skull Cavern, mastery, and renovations were rechecked before translation
- Overall textual coverage after this batch: 10,906 / 14,720 unique English records (74.09%), an increase of 0.62 percentage points
- Strings/1_6_Strings is now fully covered: 592 / 592 records
- `Strings/MovieReactions` is now fully covered: 269 / 269 records

### UZ-187 — generated-code strings, part 1

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-1.json
- Entries: first 100 consecutive English records, from `Buff.cs.453` through `Dialogue.cs.731`
- Scope: buff names and stat labels, crafting ingredient categories, inventory/resource labels, dialogue adjective/noun pools, and the first generated action verbs
- Control contract preserved exactly: leading/trailing spaces in stat/source labels and all source keys remain unchanged
- Glossary decisions applied: iridiy, kvars, konchilik, o‘rmonchilik, qimmatbaho tosh, and established combat/resource terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for iridium, mining, foraging, gem, and resource terms were rechecked before translation
- Overall textual coverage after this batch: 11,006 / 14,720 unique English records (74.77%), an increase of 0.68 percentage points

### UZ-188 — generated-code strings, part 2

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-2.json
- Entries: next 100 consecutive English records, from `Dialogue.cs.732` through `Event.cs.1645`
- Scope: generated dialogue actions and locations, baby and color labels, event messages, book announcements, farm-spirit epilogues, gift exchanges, festival prompts, and flower-dance lines
- Control contract preserved exactly: `$b`, `$h`, `$l`, `$q`, `$r`, `$u`, `$5`, `^`, `#`, `{0}`, `@`, `%farm`, `%book`, slash-separated color variants, and all source keys remain unchanged
- Glossary decisions applied: grange, Luau, Yoba, iridiy, farmer, farm, and established festival/location terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for grange, Luau, Yoba, farmer, farm, and festival terms were rechecked before translation
- Overall textual coverage after this batch: 11,106 / 14,720 unique English records (75.45%), an increase of 0.68 percentage points

### UZ-189 — generated-code strings, part 3

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-3.json
- Entries: next 100 consecutive English records, from `Event.cs.1647` through `Farmer.cs.2020`
- Scope: festival games and prizes, grange judging, secret gifts, fortune-teller visions, soup and fishing results, mail gifts, exhaustion messages, skill labels, and profession titles
- Control contract preserved exactly: `$b`, `$h`, `$q`, `$r`, `$s`, `$3`, `$4`, `$7`, `^`, `^^`, `#`, `{0}`, `{1}`, `{1} x{0}`, `@`, and all source keys remain unchanged
- Glossary decisions applied: yulduz jetoni, grange, Luau, billur shar, Yoba, pasternak, dehqonchilik, konchilik, and established profession terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for grange, star tokens, Luau, Yoba, parsnip, skills, and professions were rechecked before translation
- Overall textual coverage after this batch: 11,206 / 14,720 unique English records (76.13%), an increase of 0.68 percentage points

### UZ-190 — generated-code strings, part 4

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-4.json
- Entries: next 100 consecutive English records, from `Farmer.cs.2021` through `NPC.cs.4066`
- Scope: farmer titles, controller and day labels, Stardrop and energy messages, loading and crash notices, dating and marriage responses, gift rules, Krobus introduction, and greeting lines
- Control contract preserved exactly: `$b`, `$e`, `$h`, `$l`, `$s`, `$a`, `^`, `^^`, `#`, `{0}`, `{1}`, `@`, and all source keys remain unchanged
- Glossary decisions applied: grange, Stardrop, Yoba, Krobus, farmer, farm, mining, foraging, and established relationship terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Stardrop, grange, Yoba, Krobus, farmer, and relationship terms were rechecked before translation
- Overall textual coverage after this batch: 11,306 / 14,720 unique English records (76.81%), an increase of 0.68 percentage points

### UZ-191 — generated-code strings, part 5

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-5.json
- Entries: next 100 consecutive English records, from `NPC.cs.4068` through `NPC.cs.4499`
- Scope: friendship and gift advice, favorite/hated item reactions, birthdays, marriage moods, adoption and pregnancy dialogue, pet-bowl chores, farm maintenance, and weather/home comments
- Control contract preserved exactly: leading spaces, `$a`, `$b`, `$e`, `$h`, `$l`, `$s`, `#`, `/`, `{0}`, `{1}`, and all source keys remain unchanged
- Glossary decisions applied: Krobus, grange, ferma, ekin, uy hayvonlari, farzand asrab olish, homiladorlik, va established relationship terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Krobus, grange, farm, pets, adoption, pregnancy, and relationship terms were rechecked before translation
- Overall textual coverage after this batch: 11,406 / 14,720 unique English records (77.49%), an increase of 0.68 percentage points

### UZ-192 — generated-code strings, part 6

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-6.json
- Entries: next 100 consecutive English records, from `NPC.cs.4500` through `Utility.cs.5821`
- Scope: spouse housekeeping comments and nicknames, audio/display options, save-game loading labels, marriage ceremony lines, seasons, and music-track names
- Control contract preserved exactly: leading/trailing spaces, `$a`, `$b`, `$e`, `$h`, `#`, `@`, `{0}`, `{1}`, `{2}`, and `%spouse` remain unchanged
- Glossary decisions applied: Pelikan shaharchasi, Stardrop, grange, Yoba, marriage/festival terminology, and established season/resource names
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Pelican Town, Stardrop, grange, Yoba, marriage, seasons, and festival terms were rechecked before translation
- Overall textual coverage after this batch: 11,506 / 14,720 unique English records (78.17%), an increase of 0.68 percentage points

### UZ-193 — generated-code strings, part 7

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-7.json
- Entries: next 100 consecutive English records, from `Utility.cs.5823` through `MapPage.cs.11077`
- Scope: music catalogue titles, animal and building requirements, Junimo phrases, diary events, location prompts, bundle/fishing UI, save-game actions, and map labels
- Control contract preserved exactly: leading spaces, `^`, `#`, `{0}`, and all source keys remain unchanged; the Dwarvish location line is preserved verbatim
- Glossary decisions applied: Kaliko cho‘li, Joja, Pelikan shaharchasi, Junimo, grange, fishing bonuses, animal buildings, and established map terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Calico Desert, Joja, Junimo, grange, fishing, animal buildings, and map locations were rechecked before translation
- Overall textual coverage after this batch: 11,606 / 14,720 unique English records (78.85%), an increase of 0.68 percentage points

### UZ-194 — generated-code strings, part 8

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-8.json
- Entries: next 100 consecutive English records, from `MapPage.cs.11078` through `OptionsPage.cs.11299`
- Scope: town map businesses and homes, opening hours, landmarks, general/audio/graphics settings, controls, and inventory-slot labels
- Control contract preserved exactly: trailing spaces, `{0}`, literal `#` in inventory-slot labels, and all source keys remain unchanged
- Glossary decisions applied: Pelikan shaharchasi, Cindersap o‘rmoni, JojaMart, sarguzashtchilar gildiyasi, Jamoat markazi, and established map/control terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Pelican Town, Cindersap Forest, JojaMart, Adventurer’s Guild, Community Center, and control terms were rechecked before translation
- Overall textual coverage after this batch: 11,706 / 14,720 unique English records (79.52%), an increase of 0.68 percentage points

### UZ-195 — generated-code strings, part 9

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-9.json
- Entries: next 100 consecutive English records, from `OptionsPage.cs.11300` through `SocialPage_Relationship_Single_Male`
- Scope: animal purchase and care descriptions, quest/save/shipping labels, shopkeeper dialogue, rare goods, adventurer services, skills/perks, and relationship status labels
- Control contract preserved exactly: literal `#` inventory-slot labels, leading/trailing spaces, `*`, `{0}`, `{1}`, `{2}`, and all source keys remain unchanged
- Glossary decisions applied: chorva, molxona/tovuqxona, trufel, Stardrop, sarguzashtchilar gildiyasi, Skelet g‘ori, and established skill terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for livestock, barns/coops, truffles, Stardrop, Adventurer’s Guild, Skull Cavern, and skills were rechecked before translation
- Overall textual coverage after this batch: 11,806 / 14,720 unique English records (80.20%), an increase of 0.68 percentage points

### UZ-196 — generated-code strings, part 10

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-10.json
- Entries: next 100 consecutive English records, from `SocialPage_Relationship_Husband` through `CalicoJack.cs.11958`
- Scope: relationship statuses, strength-game targets, title-screen tips, tutorials, Abigail minigame messages, and CalicoJack results
- Control contract preserved exactly: `{0}` and all source keys remain unchanged
- Glossary decisions applied: Stardrop, Dasht qiroli sarguzashti, Kaliko Jek, sarguzashtchilar gildiyasi, Skelet g‘ori, and established relationship/game terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Stardrop, Prairie King, Calico Jack, Adventurer’s Guild, Skull Cavern, and relationship statuses were rechecked before translation
- Overall textual coverage after this batch: 11,906 / 14,720 unique English records (80.88%), an increase of 0.68 percentage points

### UZ-197 — generated-code strings, part 11

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-11.json
- Entries: next 100 consecutive English records, from `CalicoJack.cs.11965` through `TV.cs.13148`
- Scope: minigame results, Grandpa’s letter, accuracy and furniture labels, object categories and requirements, wallet discoveries, weather/fortune TV shows, and cooking broadcasts
- Control contract preserved exactly: `^^`, `^^^`, `{0}`, `{1}`, `{2}`, `%`, leading/trailing spaces, and quoted program title markers remain unchanged
- Glossary decisions applied: Junimo Kart, geode, Stardrop, Skelet g‘ori, Yerdan tirikchilik, Sous malikasi, Velvik bashorati, and established crafting/resource terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Junimo Kart, geode, Stardrop, Skull Cavern, Livin’ Off The Land, Queen of Sauce, and Welwick’s Oracle were rechecked before translation
- Overall textual coverage after this batch: 12,006 / 14,720 unique English records (81.56%), an increase of 0.68 percentage points

### UZ-198 — generated-code strings, part 12

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-12.json
- Entries: next 100 consecutive English records, from `TV.cs.13151` through `ItemDeliveryQuest.cs.13386`
- Scope: cooking and weather broadcasts, spirit forecasts, fishing population quests, squid descriptions, fishing rewards, and item-delivery request fragments
- Control contract preserved exactly: `#$b#`, `$h`, `$u`, `${...^...}$`, `{0}`, `{1}`, `{2}`, `%`, newlines, leading/trailing spaces, and all source keys remain unchanged
- Glossary decisions applied: Pelikan shaharchasi, Yoba ruhlari, Kalmar, baliq ovlash, Demetrius, Villi, Stardew Valley taomlar xizmati, and established food/resource terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for spirits, squid, fishing, Demetrius, Willy, cooking, and delivery quests were rechecked before translation
- Overall textual coverage after this batch: 12,106 / 14,720 unique English records (82.24%), an increase of 0.68 percentage points

### UZ-199 — generated-code strings, part 13

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-13.json
- Entries: next 100 consecutive English records, from `ItemDeliveryQuest.cs.13387` through `ItemDeliveryQuest.cs.13587`
- Scope: food and cooking request fragments, medical requests, furniture-placement wishes, community delivery notices, wizard requests, and gender/relationship-specific delivery messages
- Control contract preserved exactly: leading spaces, `$h`, `$b`, `#$b#`, `{0}`, `{1}`, `{2}`, `<`, `${...^...}$`, `¦`, `^`, and all source keys remain unchanged
- Glossary decisions applied: Stardew Valley taomlar xizmati, Doktor Xarvi, M. Rasmodius, Sehrgar, Heyli, Sem, Maru, and established food/body-part terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Harvey, Rasmodius, Haley, Sam, Maru, delivery quests, cooking, and relationship-gender controls were rechecked before translation
- Overall textual coverage after this batch: 12,206 / 14,720 unique English records (82.92%), an increase of 0.68 percentage points

### UZ-200 — generated-code strings, part 14

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-14.json
- Entries: next 100 consecutive English records, from `ItemDeliveryQuest.cs.13590` through `MeleeWeapon.cs.14122`
- Scope: Abigail/Sam/Maru delivery requests, Clint resource quests, monster-hunting quests, socializing objectives, planting and tool errors, legendary-fish messages, and the Galaxy Sword discovery
- Control contract preserved exactly: leading/trailing spaces, newlines, `#$b#`, `$h`, `$u`, `{0}`, `{1}`, `{2}`, `^^`, `^`, `=...=`, and all source keys remain unchanged
- Glossary decisions applied: Klint, Demetrius, M. Rasmodius, Heyli, Sem, Maru, Duggies, sovuq shilimshiqlar, O‘roq, and Galaktika qilichi
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Clint, Demetrius, Rasmodius, Haley, Sam, Maru, Duggies, scythe, and Galaxy Sword were rechecked before translation
- Overall textual coverage after this batch: 12,306 / 14,720 unique English records (83.60%), an increase of 0.68 percentage points

### UZ-201 — generated-code strings, part 15

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-15.json
- Entries: next 100 consecutive English records, from `MeleeWeapon.cs.14132` through `BrowserFavorites`
- Scope: weapon stats, animal tool messages, raft/slingshot/tool labels, language names, random-sentence templates, and keyboard/browser key labels
- Control contract preserved exactly: `{0}`, `{1}`, and all source keys remain unchanged
- Glossary decisions applied: qilich/xanjar/gurzi, mudofaa, kritik, Stardrop terminology, random-sentence vocabulary, and established controls
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for weapons, crit stats, Stardrop, random dialogue terms, and keyboard controls were rechecked before translation
- Overall textual coverage after this batch: 12,406 / 14,720 unique English records (84.28%), an increase of 0.68 percentage points

### UZ-202 — generated-code strings, part 16

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-16.json
- Entries: next 100 consecutive English records, from `BrowserHome` through `OptionsPage_UIScale`
- Scope: media/browser keys, controller indicators, item recovery, Krobus relationship/shop lines, movie theater concessions and tracks, Junimo Kart music, desert trading, outdoor furniture, volcano shop dialogue, and UI scale
- Control contract preserved exactly: `{0}`, `@`, `$3`, `$7`, `$b`, `$h`, `$l`, and all source keys remain unchanged
- Glossary decisions applied: Bo‘shliq arvohi, Krobus, kinoteatr, Junimo aravachasi, Kaliko, tuyaqush, volcano shop terminology, and controller/media labels
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Krobus, movie theater, Junimo Kart, Calico, ostrich, volcano, and controller terms were rechecked before translation
- Overall textual coverage after this batch: 12,506 / 14,720 unique English records (84.96%), an increase of 0.68 percentage points

### UZ-203 — generated-code strings, completion

- Target: `Strings/StringsFromCSFiles`
- English source: `unpacked-all/Strings/StringsFromCSFiles.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/strings-from-cs-files-17.json
- Entries: final 73 English records, from `NoSprinklers` through `Attack_Miss`
- Scope: buffs and placement rules, Farm Computer analysis, fishing/weather channel text, Ginger Island traders and music, horse flute/key messages, seasoning, furniture, renovation, and final quest/combat labels
- Control contract preserved exactly: `{0}`, `{1}`, and all source keys remain unchanged
- Glossary decisions applied: Qi, Ginger Island, Fern Islands, volcano, ostrich, Farm Computer, horse flute, and established buff/furniture terminology
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek entries for Qi, Ginger Island, Fern Islands, volcano, ostrich, Farm Computer, horse flute, buffs, and furniture were rechecked before translation
- Overall textual coverage after this batch: 12,579 / 14,720 unique English records (85.46%), an increase of 0.50 percentage points
- `Strings/StringsFromCSFiles` is now fully covered: 1,673 / 1,673 records

### UZ-204 — Data/Furniture, part 1

- Target: `Data/Furniture`
- English source: `unpacked-all/Data/Furniture.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-furniture-1.json
- Entries: first 100 consecutive furniture records, from `0` through `1303`
- Scope: chairs, benches, armchairs, couches, dressers, tables, rugs, bookcases, pillars, plants, geodes, vases, singing stones, and sloth skeleton pieces
- Control contract preserved exactly: all numeric/size/price metadata, `/` separators, `///true` flags, localized-text keys, and source IDs remain unchanged; only the English display-name segment is replaced with the established Uzbek `Strings/Furniture` term
- Glossary decisions applied: eman/yong‘oq/qayin/mahagon, kreslo, divan, komodi, choy stoli, Kaliko, geoda, obsidian, and furniture terminology already established in `Strings/Furniture`
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek furniture terms for chairs, tables, rugs, geodes, and decorative objects were rechecked before translation
- Overall textual coverage after this batch: 12,679 / 14,720 unique English records (86.13%), an increase of 0.68 percentage points

### UZ-205 — Data/Furniture, part 2

- Target: `Data/Furniture`
- English source: `unpacked-all/Data/Furniture.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-furniture-2.json
- Entries: next 100 consecutive furniture records, source positions 101–200
- Scope: additional decorative furniture and specialty items, with the same metadata-preserving name replacement contract as UZ-204
- Control contract preserved exactly: all numeric/size/price metadata, `/` separators, `///true` flags, localized-text keys, and source IDs remain unchanged; only the English display-name segment is replaced with the established Uzbek `Strings/Furniture` term
- Glossary decisions applied: existing furniture terms from `Strings/Furniture`, including color/material/style names and decorative-object vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek furniture terms were rechecked before translation
- Overall textual coverage after this batch: 12,779 / 14,720 unique English records (86.81%), an increase of 0.68 percentage points

### UZ-206 — Data/Furniture, part 3

- Target: `Data/Furniture`
- English source: `unpacked-all/Data/Furniture.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-furniture-3.json
- Entries: next 100 consecutive furniture records, source positions 201–300
- Scope: additional furniture display names with metadata-preserving translation from the established `Strings/Furniture` vocabulary
- Control contract preserved exactly: all numeric/size/price metadata, `/` separators, `///true` flags, localized-text keys, and source IDs remain unchanged; only the English display-name segment is replaced
- Glossary decisions applied: existing Uzbek material, color, style, and decorative-furniture terms
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek furniture terms were rechecked before translation
- Overall textual coverage after this batch: 12,879 / 14,720 unique English records (87.49%), an increase of 0.68 percentage points

### UZ-207 — Data/Furniture, part 4

- Target: `Data/Furniture`
- English source: `unpacked-all/Data/Furniture.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-furniture-4.json
- Entries: next 100 consecutive furniture records, source positions 301–400
- Scope: additional furniture display names translated through the established `Strings/Furniture` vocabulary
- Control contract preserved exactly: all numeric/size/price metadata, `/` separators, `///true` flags, localized-text keys, and source IDs remain unchanged; only the English display-name segment is replaced
- Glossary decisions applied: existing Uzbek material, color, style, and decorative-furniture terms
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek furniture terms were rechecked before translation
- Overall textual coverage after this batch: 12,979 / 14,720 unique English records (88.17%), an increase of 0.68 percentage points

### UZ-208 — Data/Furniture, part 5

- Target: `Data/Furniture`
- English source: `unpacked-all/Data/Furniture.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-furniture-5.json
- Entries: next 100 consecutive furniture records, source positions 401–500
- Scope: additional furniture display names translated through the established `Strings/Furniture` vocabulary
- Control contract preserved exactly: all numeric/size/price metadata, `/` separators, `///true` flags, localized-text keys, and source IDs remain unchanged; only the English display-name segment is replaced
- Glossary decisions applied: existing Uzbek material, color, style, and decorative-furniture terms
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek furniture terms were rechecked before translation
- Overall textual coverage after this batch: 13,079 / 14,720 unique English records (88.85%), an increase of 0.68 percentage points

### UZ-209 — Data/Furniture, part 6

- Target: `Data/Furniture`
- English source: `unpacked-all/Data/Furniture.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-furniture-6.json
- Entries: next 100 consecutive furniture records, source positions 501–600
- Scope: additional furniture display names translated through the established `Strings/Furniture` vocabulary
- Control contract preserved exactly: all numeric/size/price metadata, `/` separators, `///true` flags, localized-text keys, and source IDs remain unchanged; only the English display-name segment is replaced
- Glossary decisions applied: existing Uzbek material, color, style, and decorative-furniture terms
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek furniture terms were rechecked before translation
- Overall textual coverage after this batch: 13,179 / 14,720 unique English records (89.53%), an increase of 0.68 percentage points

### UZ-210 — Data/Furniture, part 7

- Target: `Data/Furniture`
- English source: `unpacked-all/Data/Furniture.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-furniture-7.json
- Entries: final 45 furniture records, source positions 601–645
- Scope: remaining bowls, lamps, windows, pet furniture, trash/collection furniture, house plants, paintings, beds, and piano names translated through the established `Strings/Furniture` vocabulary
- Control contract preserved exactly: all numeric/size/price metadata, `/` separators, `///true` flags, localized-text keys, source IDs, and collection tags remain unchanged; only the English display-name segment is replaced
- Glossary decisions applied: existing Uzbek material, decorative-object, furniture, and interior-plant terms from `Strings/Furniture`
- Online glossary check: the canonical project page was re-opened in the in-app browser; local Uzbek furniture terms were rechecked before translation
- Overall textual coverage after this batch: 13,224 / 14,720 unique English records (89.84%), an increase of 0.31 percentage points

### UZ-211 — Data/CraftingRecipes technical preservation

- Target: `Data/CraftingRecipes`
- English source: `unpacked-all/Data/CraftingRecipes.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-crafting-recipes.json
- Entries: all 150 crafting-recipe records
- Scope: technical recipe definitions preserved exactly from the English source; recipe IDs, ingredient/item IDs, quantities, categories, unlock conditions, and boolean flags are control data rather than player-facing text
- Control contract preserved exactly: every value is byte-for-byte equal to the English source; no Russian value or resource is used
- Online glossary check: the canonical project page was re-opened in the in-app browser; no player-facing Uzbek term was introduced in this technical-only block
- Overall textual coverage after this batch: 13,374 / 14,720 unique English records (90.86%), an increase of 1.02 percentage points

### UZ-212 — Data/animationDescriptions technical preservation

- Target: `Data/animationDescriptions`
- English source: `unpacked-all/Data/animationDescriptions.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-animation-descriptions.json
- Entries: all 105 animation-description records
- Scope: animation frame sequences, timing data, sound markers, and localized-description references preserved exactly as technical control data
- Control contract preserved exactly: every value is byte-for-byte equal to the English source; no Russian value or resource is used
- Online glossary check: the canonical project page was re-opened in the in-app browser; this technical-only block adds no player-facing term
- Overall textual coverage after this batch: 13,479 / 14,720 unique English records (91.57%), an increase of 0.71 percentage points

### UZ-213 — Data/Festivals/summer11, part 1

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-1.json
- Entries: 20 dialogue records, source positions 13–32
- Scope: Luau spouse comments and villager lines, including beach, soup, buffet, roast, and governor context
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `%`, `$s`, and `$h` remain unchanged; only spoken text is translated
- Glossary decisions applied: `hokim`, `kulba`, `sho‘rva`, `qovurdoq`, `bufet`, `jamoat ishlari`, and established coastal vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; festival and food terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,499 / 14,720 unique English records (91.71%), an increase of 0.14 percentage points

### UZ-214 — Data/Festivals/summer11, part 2

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-2.json
- Entries: 20 dialogue records, source positions 33–52
- Scope: Luau villager lines about the beach party, ocean, soup, buffet, governor, merpeople, and sunscreen
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `%`, `$s`, and `$h` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Gubernator`, `hokim`, `Luau`, `sho‘rva`, `bufet`, `Suvparilar`, and established beach vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; festival and coastal terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,519 / 14,720 unique English records (91.84%), an increase of 0.14 percentage points

### UZ-215 — Data/Festivals/summer11, part 3

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-3.json
- Entries: 20 dialogue records, source positions 53–72
- Scope: Sandy, children, Willy, Leo, governor year-two, spouse year-two, and Robin Luau dialogue
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `%noturn`, `$0`, `$1`, `$5`, `$9`, `$h`, and `$s` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Gubernator`, `hokim`, `Luau`, `sho‘rva`, `qovurdoq`, `bufet`, `Suvparilar`, and established beach vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; festival, family, and coastal terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,539 / 14,720 unique English records (91.98%), an increase of 0.14 percentage points

### UZ-216 — Data/Festivals/summer11, part 4

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-4.json
- Entries: 20 dialogue records, source positions 73–92
- Scope: year-two villager dialogue about dancing, buffet, soup, food, sunscreen, fishing, and the Luau crowd
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `%noturn`, `$0`, `$1`, `$2`, `$4`, and `$5` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Gubernator`, `sho‘rva`, `bufet`, `Porey piyoz`, `masalliq`, `mahluq`, and established festival vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; food, festival, and character terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,559 / 14,720 unique English records (92.11%), an increase of 0.14 percentage points

### UZ-217 — Data/Festivals/summer11, part 5

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-5.json
- Entries: final 12 dialogue records, source positions 93–104
- Scope: final year-two Luau lines for Shane, Marnie, Elliott, Gus, Dwarf, Wizard, Harvey, Sandy, Jas, Vincent, Willy, and Leo
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `$0`, `$1`, `$2`, `$3`, `$h`, `$s`, and `$3` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Luau`, `Gubernator`, `sho‘rva`, `masalliq`, `okean`, `dengiz`, and established festival vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; the final Luau food, ocean, and character terms were checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,571 / 14,720 unique English records (92.19%), an increase of 0.08 percentage points

### UZ-218 — Data/Festivals/winter8, part 1

- Target: `Data/Festivals/winter8`
- English source: `unpacked-all/Data/Festivals/winter8.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter8-1.json
- Entries: 20 dialogue records, source positions 7–26
- Scope: Festival of Ice spouse and villager dialogue about snowmen, cold weather, ice fishing, winter, and igloos
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `$h`, `$l`, and `$s` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Muz festivali`, `qor odam`, `muz baliqchiligi`, `muzlagan dengiz`, `igloo`, and established winter vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; winter and festival terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,591 / 14,720 unique English records (92.33%), an increase of 0.14 percentage points

### UZ-219 — Data/Festivals/winter8, part 2

- Target: `Data/Festivals/winter8`
- English source: `unpacked-all/Data/Festivals/winter8.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter8-2.json
- Entries: 20 dialogue records, source positions 27–46
- Scope: Festival of Ice announcements, snowman choices, winter villagers, ice-fishing contest lines, and festival greetings
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `$y`, `$h`, `$s`, and `$4` remain unchanged; the option separators in Penny and Willy’s `$y` strings are preserved
- Glossary decisions applied: `Muz festivali`, `muz baliqchiligi`, `qor odam`, `Qish yulduzi`, `muzlagan ko‘l`, and established winter vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; winter, food, and festival terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,611 / 14,720 unique English records (92.47%), an increase of 0.14 percentage points

### UZ-220 — Data/Festivals/winter8, part 3

- Target: `Data/Festivals/winter8`
- English source: `unpacked-all/Data/Festivals/winter8.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter8-3.json
- Entries: 15 year-two dialogue records, source positions 52–66
- Scope: year-two spouse and villager dialogue about igloos, ice sculpture, fishing, cocoa, snow, and the Winter Star sweater
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `$0`, `$1`, `$h`, and `$l` remain unchanged; only spoken text is translated
- Glossary decisions applied: `igloo`, `muz baliqchiligi`, `Qish yulduzi`, `muzlagan ko‘l`, `muz haykali`, and established winter vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; winter, family, and festival terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,626 / 14,720 unique English records (92.57%), an increase of 0.10 percentage points

### UZ-221 — Data/Festivals/winter8, part 4

- Target: `Data/Festivals/winter8`
- English source: `unpacked-all/Data/Festivals/winter8.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter8-4.json
- Entries: four year-two event-script records, source positions 48–51
- Scope: technical movement/event commands remain unchanged while all embedded player-facing ice-fishing announcements, winner messages, prize lines, and festival wrap-up dialogue are translated
- Control contract preserved exactly: command paths, actor names, coordinates, timing values, separators, and all dialogue markers such as `#$b#`, `$h`, and `$s` remain unchanged
- Glossary decisions applied: `Muz festivali`, `muz baliqchiligi`, `musobaqa`, `mukofot`, and established winter vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; event, fishing, and winter terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,630 / 14,720 unique English records (92.60%), an increase of 0.03 percentage points

### UZ-222 — Data/Festivals/winter8, part 5

- Target: `Data/Festivals/winter8`
- English source: `unpacked-all/Data/Festivals/winter8.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter8-5.json
- Entries: 20 year-two dialogue records, source positions 67–86
- Scope: snowman construction, winter quiet, Winter Star clothing, frozen-lake jokes, ice-fishing competition, and animal care
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `$0`, `$1`, `$2`, `$3`, `$4`, `$h`, `$s`, and `$y` option separators remain unchanged; only spoken text is translated
- Glossary decisions applied: `Qish yulduzi`, `muzlagan ko‘l`, `muz baliqchiligi`, `qor odam`, `tovuqxona`, `molxona`, and established winter vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; winter, festival, and farming terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,650 / 14,720 unique English records (92.73%), an increase of 0.14 percentage points

### UZ-223 — Data/Festivals/winter8, part 6

- Target: `Data/Festivals/winter8`
- English source: `unpacked-all/Data/Festivals/winter8.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter8-6.json
- Entries: final nine year-two dialogue records, source positions 87–95
- Scope: winter festival lines about the pig, spirits, Gridball, wizard observations, frozen moustache, cold fish, snowmen, the contest audience, and snow sounds
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `$0`, `$1`, `$2`, `$3`, and `$h` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Muz festivali`, `muz baliqchiligi`, `qor odam`, `Gridball`, and established winter vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; final winter and festival terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,659 / 14,720 unique English records (92.79%), an increase of 0.06 percentage points

### UZ-224 — Data/Festivals/winter8, final event records

- Target: `Data/Festivals/winter8`
- English source: `unpacked-all/Data/Festivals/winter8.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter8-7.json
- Entries: eight remaining records, source positions 0–6 and 47
- Scope: Festival of Ice name, first-year ice-fishing event scripts, player-facing winner messages, and Leo’s igloo line; movement, timing, coordinates, and other technical commands remain unchanged
- Control contract preserved exactly: event command skeletons, actor identifiers, coordinates, separators, and embedded markers such as `#$b#`, `$h`, and `$s` remain unchanged
- Glossary decisions applied: `Muz festivali`, `muz baliqchiligi`, `igloo`, `musobaqa`, `mukofot`, and established winter vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; final winter and festival terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,667 / 14,720 unique English records (92.85%), an increase of 0.05 percentage points

### UZ-225 — Data/Festivals/fall27, part 1

- Target: `Data/Festivals/fall27`
- English source: `unpacked-all/Data/Festivals/fall27.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall27-1.json
- Entries: 20 dialogue records, source positions 3–22
- Scope: Spirit’s Eve spouse and villager dialogue about the haunted maze, spiders, pumpkin ale, autumn preparation, skeletons, and festival food
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `$h`, `$l`, `$s`, and `$u` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Ruhlar arafasi`, `arvohlar labirinti`, `qovoq`, `qovoqli ale`, `skelet`, and established autumn vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; festival, maze, food, and autumn terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,687 / 14,720 unique English records (92.98%), an increase of 0.14 percentage points

### UZ-226 — Data/Festivals/fall27, part 2

- Target: `Data/Festivals/fall27`
- English source: `unpacked-all/Data/Festivals/fall27.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall27-2.json
- Entries: 20 dialogue records, source positions 23–42
- Scope: Spirit’s Eve lines about the haunted maze, jack-o-lanterns, pumpkin ale, skeletons, autumn weather, elementals, and hiding from scares
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `$h`, `$s`, `$u`, `$8`, and `#$b#` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Ruhlar arafasi`, `arvohlar labirinti`, `qo‘rqinchli chiroq`, `qovoqli ale`, `iridiy`, `elementallar`, and established autumn vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; maze, festival, food, and autumn terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,707 / 14,720 unique English records (93.12%), an increase of 0.14 percentage points

### UZ-227 — Data/Festivals/fall27, part 3

- Target: `Data/Festivals/fall27`
- English source: `unpacked-all/Data/Festivals/fall27.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall27-3.json
- Entries: 16 year-two spouse and villager dialogue records, source positions 47–62
- Scope: haunted-maze spouse dialogue, monsters, gravestones, treasure, festival decorations, winter transition, elementals, and pumpkin desserts
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `$0`, `$1`, `$2`, `$3`, `$12`, `$h`, and `%noturn` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Ruhlar arafasi`, `arvohlar labirinti`, `mahluq`, `qovoqli ale`, `elementallar`, and established autumn vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; maze, monster, food, and seasonal terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,723 / 14,720 unique English records (93.23%), an increase of 0.11 percentage points

### UZ-228 — Data/Festivals/fall27, part 4

- Target: `Data/Festivals/fall27`
- English source: `unpacked-all/Data/Festivals/fall27.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall27-4.json
- Entries: 20 year-two dialogue records, source positions 63–82
- Scope: Spirit’s Eve lines about private maze spots, village stalls, pumpkin ale, autumn weather, secret entrances, and Jack-O-Lantern carving
- Control contract preserved exactly: dialogue control markers such as `#$e#`, `#$b#`, `$0`, `$1`, `$2`, `$11`, `$12`, `$h`, `$u`, and `%noturn` remain unchanged; only spoken text is translated
- Glossary decisions applied: `Ruhlar arafasi`, `arvohlar labirinti`, `qo‘rqinchli chiroq`, `qovoqli ale`, `qovoq`, `mahluq`, and established autumn vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; maze, festival, food, and autumn terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,743 / 14,720 unique English records (93.36%), an increase of 0.14 percentage points

### UZ-229 — Data/Festivals/fall27, part 5

- Target: `Data/Festivals/fall27`
- English source: `unpacked-all/Data/Festivals/fall27.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall27-5.json
- Entries: 13 year-two dialogue records, source positions 43–44 and 83–93
- Scope: Marlon, Leo, Dwarf, Wizard, Harvey, Shane, Sandy, Jas, Willy, Vincent, Marlon year-two, Leo year-two, and Krobus year-two lines in the haunted maze
- Control contract preserved exactly: `%Leo`, `%noturn`, `^`, `$0`, `$1`, `$h`, `#$e#`, and `$s` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Ruhlar arafasi`, `arvohlar labirinti`, `mahluq`, and established festival vocabulary
- Online glossary check: the canonical project page was re-opened in the in-app browser; festival, maze, and monster terminology was checked against the Uzbek layer before translation
- Overall textual coverage after this batch: 13,756 / 14,720 unique English records (93.45%), an increase of 0.09 percentage points

### UZ-230 — Data/Festivals/fall27, final technical records

- Target: `Data/Festivals/fall27`
- English source: `unpacked-all/Data/Festivals/fall27.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall27-6.json
- Entries: 5 records, source positions 0–2 and 45–46
- Scope: festival name plus the exact conditions, setup, year-two shop, and year-two setup scripts
- Technical contract preserved exactly: conditions, shop inventory, and both event setup scripts are copied byte-for-byte from the English source; only the visible festival name is translated
- Glossary decision applied: `Spirit's Eve` → `Ruhlar arafasi`
- Overall textual coverage after this batch: 13,761 / 14,720 unique English records (93.49%), an increase of 0.03 percentage points

### UZ-231 — Data/Festivals/fall16, part 1

- Target: `Data/Festivals/fall16`
- English source: `unpacked-all/Data/Festivals/fall16.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall16-1.json
- Entries: 20 dialogue records, source positions 3–22
- Scope: spouse, villager, shopkeeper, and festival-game dialogue about the fair, grange displays, barbecue, animals, and star tokens
- Control contract preserved exactly: `@`, `#$e#`, `$h`, and `$s` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Stardew Valley yarmarkasi`, `ferma ko‘rgazmasi`, `Grange ko‘rgazmasi`, `yulduz jetoni`, and established food/festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,781 / 14,720 unique English records (93.62%), an increase of 0.14 percentage points

### UZ-232 — Data/Festivals/fall16, part 2

- Target: `Data/Festivals/fall16`
- English source: `unpacked-all/Data/Festivals/fall16.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall16-2.json
- Entries: 20 dialogue records, source positions 23–42
- Scope: vegetarian food, mayoral fair announcements, fortune teller, clown games, star tokens, animals, barbecue, wizard lore, and children’s fair dialogue
- Control contract preserved exactly: `@`, `#$b#`, `#$e#`, `$h`, `$s`, `$11`, and `$u` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Stardew Valley yarmarkasi`, `ferma ko‘rgazmasi`, `Grange ko‘rgazmasi`, `yulduz jetoni`, `kabachki shashliklari`, and established festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,801 / 14,720 unique English records (93.76%), an increase of 0.14 percentage points

### UZ-233 — Data/Festivals/fall16, part 3

- Target: `Data/Festivals/fall16`
- English source: `unpacked-all/Data/Festivals/fall16.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall16-3.json
- Entries: 19 dialogue records, source positions 43–46 and 48–62
- Scope: children, villagers, spouses, grange-display encouragement, fortune-telling, fair games, animal care, and woodcraft dialogue
- Control contract preserved exactly: `@`, `%farm`, `#$b#`, `#$e#`, `$0`, `$1`, and `$h` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Stardew Valley yarmarkasi`, `ferma ko‘rgazmasi`, `yulduz jetoni`, `Kaliko cho‘li`, and established festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,820 / 14,720 unique English records (93.89%), an increase of 0.13 percentage points

### UZ-234 — Data/Festivals/fall16, technical setup

- Target: `Data/Festivals/fall16`
- English source: `unpacked-all/Data/Festivals/fall16.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall16-4.json
- Entries: 1 technical record, source position 47 (`set-up_y2`)
- Scope: the year-two fair setup script, including map transition, actor movement, animal spawning, viewport, and pause commands
- Technical contract preserved exactly: the 3,123-character setup script matches the English source byte-for-byte; no command, actor, coordinate, or timing token was translated
- Overall textual coverage after this batch: 13,821 / 14,720 unique English records (93.89%), an increase of 0.01 percentage points

### UZ-235 — Data/Festivals/fall16, part 5

- Target: `Data/Festivals/fall16`
- English source: `unpacked-all/Data/Festivals/fall16.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall16-5.json
- Entries: 20 year-two dialogue records, source positions 63–82
- Scope: fair preparations, grange-display competition, star-token games, food, fortune-telling, littering, animal care, and spouse dialogue
- Control contract preserved exactly: `%George`, `@`, `#$b#`, `#$e#`, `$0`, `$1`, `$2`, and `$h` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Stardew Valley yarmarkasi`, `ferma ko‘rgazmasi`, `yulduz jetoni`, `Kaliko cho‘li`, and established fair vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,841 / 14,720 unique English records (94.03%), an increase of 0.14 percentage points

### UZ-236 — Data/Festivals/fall16, part 6

- Target: `Data/Festivals/fall16`
- English source: `unpacked-all/Data/Festivals/fall16.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall16-6.json
- Entries: 11 year-two dialogue records, source positions 83–93
- Scope: fair food, fortune-telling, hidden Dwarf dialogue, animals, fishing, iridium-quality catches, and Leo’s bird dialogue
- Control contract preserved exactly: `@`, `#$b#`, `#$e#`, `$0`, `$1`, `$2`, and `$h` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Stardew Valley`, `yulduz jetoni`, `iridiy`, `Rogatka`, and established fair vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,852 / 14,720 unique English records (94.10%), an increase of 0.07 percentage points

### UZ-237 — Data/Festivals/fall16, final technical records

- Target: `Data/Festivals/fall16`
- English source: `unpacked-all/Data/Festivals/fall16.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-fall16-7.json
- Entries: 3 records, source positions 0–2 (`name`, `conditions`, `set-up`)
- Scope: Stardew Valley Fair name plus the exact event condition and map setup script
- Technical contract preserved exactly: `conditions` and the 1,085-character `set-up` script match the English source byte-for-byte; only the visible festival name is translated
- Glossary decision applied: `Stardew Valley Fair` → `Stardew Valley yarmarkasi`
- Overall textual coverage after this batch: 13,855 / 14,720 unique English records (94.12%), an increase of 0.02 percentage points

### UZ-238 — Data/Festivals/winter25, part 1

- Target: `Data/Festivals/winter25`
- English source: `unpacked-all/Data/Festivals/winter25.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter25-1.json
- Entries: 20 dialogue records, source positions 4–23
- Scope: spouse, family, shopkeeper, and villager dialogue about the Feast of the Winter Star, gifts, gratitude, winter food, and family gatherings
- Control contract preserved exactly: `@`, `#$e#`, `$h`, `$l`, and `$s` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Qish yulduzi ziyofati`, `konfet tayoqchalari`, `nog`, and established winter vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,875 / 14,720 unique English records (94.26%), an increase of 0.14 percentage points

### UZ-239 — Data/Festivals/winter25, part 2

- Target: `Data/Festivals/winter25`
- English source: `unpacked-all/Data/Festivals/winter25.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter25-2.json
- Entries: 20 dialogue records, source positions 24–43
- Scope: Winter Star gifts, family traditions, fortune, winter fishing, candy canes, the Winter Star legend, and children’s gift excitement
- Control contract preserved exactly: `$y`, `@`, `=Stardrop`, `#$e#`, `#$b#`, `$h`, `$s`, `$u`, and `$4` markers remain unchanged; option separators remain unchanged; only spoken text is translated
- Glossary decisions applied: `Qish yulduzi ziyofati`, `Qish yulduzi`, `Ruhlar daraxti`, `konfet tayoqchalari`, `nog`, and established winter vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,895 / 14,720 unique English records (94.40%), an increase of 0.14 percentage points

### UZ-240 — Data/Festivals/winter25, part 3

- Target: `Data/Festivals/winter25`
- English source: `unpacked-all/Data/Festivals/winter25.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter25-3.json
- Entries: 18 dialogue records, source positions 44–46 and 49–63
- Scope: children’s gifts, Linus’s winter feast, spouse gratitude, family traditions, Powdermelon crisp, winter food, and mint-flavored jelly
- Control contract preserved exactly: `#$b#`, `#$e#`, `$0`, `$3`, `$6`, `$7`, `$h`, `$l`, and `$10` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Qish yulduzi ziyofati`, `Qish yulduzi`, `Kukunli qovun`, `sidr`, `konfet tayoqchalari`, and established winter vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,913 / 14,720 unique English records (94.52%), an increase of 0.12 percentage points

### UZ-241 — Data/Festivals/winter25, technical year-two scripts

- Target: `Data/Festivals/winter25`
- English source: `unpacked-all/Data/Festivals/winter25.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter25-4.json
- Entries: 2 technical records, source positions 47–48 (`set-up_y2`, `secretSanta_y2`)
- Scope: year-two map setup and Secret Santa cutscene scripts
- Technical contract preserved exactly: both scripts match the English source byte-for-byte (195 and 1,144 characters); no command, coordinate, actor, timing, or token was translated
- Overall textual coverage after this batch: 13,915 / 14,720 unique English records (94.53%), an increase of 0.01 percentage points

### UZ-242 — Data/Festivals/winter25, part 5

- Target: `Data/Festivals/winter25`
- English source: `unpacked-all/Data/Festivals/winter25.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter25-5.json
- Entries: 20 year-two dialogue records, source positions 64–83
- Scope: winter weather, frozen pizza, family tables, blacksmithing tools, gift choices, wine, Joja gifts, and Feast greetings
- Control contract preserved exactly: `$y`, `@`, `%noturn`, `#$b#`, `#$e#`, `$0`, `$1`, `$2`, `$6`, and `$h` markers remain unchanged; option separators remain unchanged; only spoken text is translated
- Glossary decisions applied: `Qish yulduzi ziyofati`, `Qish yulduzi`, `iridiy`, `gridbol`, and established winter vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,935 / 14,720 unique English records (94.67%), an increase of 0.14 percentage points

### UZ-243 — Data/Festivals/winter25, part 6

- Target: `Data/Festivals/winter25`
- English source: `unpacked-all/Data/Festivals/winter25.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter25-6.json
- Entries: 9 year-two dialogue records, source positions 84–92
- Scope: spiced cider, candy canes, simple winter meals, pecan pie, children’s gifts, and closing Feast dialogue
- Control contract preserved exactly: `@`, `#$b#`, `#$e#`, `$0`, `$1`, `$4`, `$8`, and `$h` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Qish yulduzi`, `Qish yulduzi ziyofati`, `sidr`, `konfet tayoqchalari`, `pekanli pirog`, and established winter vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,944 / 14,720 unique English records (94.73%), an increase of 0.06 percentage points

### UZ-244 — Data/Festivals/winter25, final records

- Target: `Data/Festivals/winter25`
- English source: `unpacked-all/Data/Festivals/winter25.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-winter25-7.json
- Entries: 4 records, source positions 0–3 (`name`, `conditions`, `set-up`, `secretSanta`)
- Scope: Feast of the Winter Star name, event condition, base setup, and Secret Santa cutscene script
- Technical contract preserved exactly: `conditions`, `set-up`, and `secretSanta` match the English source byte-for-byte (13, 194, and 1,108 characters); only the visible festival name is translated
- Glossary decision applied: `Feast of the Winter Star` → `Qish yulduzi ziyofati`
- Overall textual coverage after this batch: 13,948 / 14,720 unique English records (94.76%), an increase of 0.03 percentage points

### UZ-245 — Data/Festivals/summer28, part 1

- Target: `Data/Festivals/summer28`
- English source: `unpacked-all/Data/Festivals/summer28.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer28-1.json
- Entries: 20 dialogue records, source positions 4–23
- Scope: Moonlight Jelly festival greetings, candle-boat preparations, summer’s end, ocean life, and harvest-season reminders
- Control contract preserved exactly: `@`, `#$b#`, `#$e#`, `$h`, and `$s` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Oy nuri meduzalari`, `Oy nuri meduzalari raqsi`, `sham qayig‘i`, and established summer/festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,968 / 14,720 unique English records (94.89%), an increase of 0.13 percentage points

### UZ-246 — Data/Festivals/summer28, part 2

- Target: `Data/Festivals/summer28`
- English source: `unpacked-all/Data/Festivals/summer28.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer28-2.json
- Entries: 18 dialogue records, source positions 24–37 and 40–43
- Scope: ocean pollution, Lunaloos lore, summer’s end, night fish, children’s hopes, and spouse dialogue before the Moonlight Jelly launch
- Control contract preserved exactly: `#$b#`, `#$e#`, `$0`, `$4`, `$h`, `$s`, and `$u` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Oy nuri meduzalari`, `Lunaloos`, `sham qayig‘i`, and established ocean/summer vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 13,986 / 14,720 unique English records (95.01%), an increase of 0.12 percentage points

### UZ-247 — Data/Festivals/summer28, technical year-two scripts

- Target: `Data/Festivals/summer28`
- English source: `unpacked-all/Data/Festivals/summer28.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer28-3.json
- Entries: 2 technical records, source positions 38–39 (`set-up_y2`, `mainEvent_y2`)
- Scope: year-two map setup and Moonlight Jelly launch cutscene scripts
- Technical contract preserved exactly: both scripts match the English source byte-for-byte (642 and 1,907 characters); no command, coordinate, actor, timing, or token was translated
- Overall textual coverage after this batch: 13,988 / 14,720 unique English records (95.03%), an increase of 0.02 percentage points

### UZ-248 — Data/Festivals/summer28, part 4

- Target: `Data/Festivals/summer28`
- English source: `unpacked-all/Data/Festivals/summer28.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer28-4.json
- Entries: 20 year-two dialogue records, source positions 44–63
- Scope: the main Moonlight Jelly launch, candle-boat repairs, fall preparation, harbor gathering, and Lewis/Evelyn closing dialogue
- Control contract preserved exactly: `@`, `#$b#`, `#$e#`, `$0`, `$1`, `$4`, `$10`, and `$h` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Oy nuri meduzalari`, `sham qayig‘i`, `bandargoh`, and established ocean/festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,008 / 14,720 unique English records (95.16%), an increase of 0.14 percentage points

### UZ-249 — Data/Festivals/summer28, part 5

- Target: `Data/Festivals/summer28`
- English source: `unpacked-all/Data/Festivals/summer28.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer28-5.json
- Entries: 20 year-two dialogue records, source positions 64–83
- Scope: shoreline mishaps, autumn plans, jelly food, Lunaloos eggs, moonlight, and children’s questions
- Control contract preserved exactly: `#$b#`, `#$e#`, `$0`, `$1`, `$2`, `$h`, `$s`, and `$u` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Oy nuri meduzalari`, `Lunaloos`, `jele`, `sham chiroqlari`, and established ocean/festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,028 / 14,720 unique English records (95.30%), an increase of 0.14 percentage points

### UZ-250 — Data/Festivals/summer28, part 6

- Target: `Data/Festivals/summer28`
- English source: `unpacked-all/Data/Festivals/summer28.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer28-6.json
- Entries: 2 final year-two dialogue records, source positions 84–85
- Scope: Willy’s moonlight jelly fishing rule and Leo’s visiting friends
- Control contract preserved exactly: `$0` and `$1` markers remain unchanged; only spoken text is translated
- Glossary decision applied: `Oy nuri meduzasi`
- Overall textual coverage after this batch: 14,030 / 14,720 unique English records (95.31%), an increase of 0.01 percentage points

### UZ-251 — Data/Festivals/summer28, final records

- Target: `Data/Festivals/summer28`
- English source: `unpacked-all/Data/Festivals/summer28.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer28-7.json
- Entries: 4 records, source positions 0–3 (`name`, `conditions`, `set-up`, `mainEvent`)
- Scope: Moonlight Jelly festival name, event condition, base setup, and launch cutscene script
- Technical contract preserved exactly: `conditions`, `set-up`, and `mainEvent` match the English source byte-for-byte (15, 434, and 1,715 characters); only the visible festival name is translated
- Glossary decision applied: `Dance Of The Moonlight Jellies` → `Oy nuri meduzalari raqsi`
- Overall textual coverage after this batch: 14,034 / 14,720 unique English records (95.34%), an increase of 0.03 percentage points

### UZ-252 — Data/Festivals/spring24, part 1

- Target: `Data/Festivals/spring24`
- English source: `unpacked-all/Data/Festivals/spring24.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring24-1.json
- Entries: 20 dialogue records, source positions 4–23
- Scope: Flower Dance greetings, spring flowers, dance partners, flower queen traditions, wine, and seasonal dialogue
- Control contract preserved exactly: `@`, `#$b#`, `#$e#`, `$h`, `$s`, `$u`, and `$11` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Gullar raqsi`, `gul malikasi`, `qizil jele`, and established spring vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,054 / 14,720 unique English records (95.48%), an increase of 0.14 percentage points

### UZ-253 — Data/Festivals/spring24, part 2

- Target: `Data/Festivals/spring24`
- English source: `unpacked-all/Data/Festivals/spring24.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring24-2.json
- Entries: 19 dialogue records, source positions 24–37 and 39–43
- Scope: Flower Dance admissions, flowers, sauce, spring transition, fishing, flower queen dreams, and spouse dance dialogue
- Control contract preserved exactly: `@`, `#$b#`, `#$e#`, `$0`, `$1`, `$h`, `$s`, `$u`, and `$11` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Gullar raqsi`, `gul malikasi`, `qizil jele`, and established spring vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,073 / 14,720 unique English records (95.60%), an increase of 0.13 percentage points

### UZ-254 — Data/Festivals/spring24, technical year-two setup

- Target: `Data/Festivals/spring24`
- English source: `unpacked-all/Data/Festivals/spring24.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring24-3.json
- Entries: 1 technical record, source position 38 (`set-up_y2`)
- Scope: year-two Flower Dance map setup and actor movement script
- Technical contract preserved exactly: the 1,054-character setup script matches the English source byte-for-byte; no command, coordinate, actor, timing, or token was translated
- Overall textual coverage after this batch: 14,074 / 14,720 unique English records (95.61%), an increase of 0.01 percentage points

### UZ-255 — Data/Festivals/spring24, part 4

- Target: `Data/Festivals/spring24`
- English source: `unpacked-all/Data/Festivals/spring24.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring24-4.json
- Entries: 20 year-two dialogue records, source positions 44–63
- Scope: Flower Dance ceremony, couples, salmonberry jelly, community identity, dance confidence, and Lewis/Clint year-two dialogue
- Control contract preserved exactly: `#$b#`, `#$e#`, `$0`, `$1`, `$2`, `$3`, `$4`, `$6`, `$10`, and `$h` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Gullar raqsi`, `gul malikasi`, `qizil jele`, and established spring vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,094 / 14,720 unique English records (95.75%), an increase of 0.14 percentage points

### UZ-256 — Data/Festivals/spring24, part 5

- Target: `Data/Festivals/spring24`
- English source: `unpacked-all/Data/Festivals/spring24.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring24-5.json
- Entries: 20 year-two dialogue records, source positions 64–83
- Scope: flower queen competition, choreography, family memories, ranching, allergies, dandelion salad, and spring festival dialogue
- Control contract preserved exactly: `#$b#`, `#$e#`, `$0`, `$1`, `$2`, `$h`, and `$s` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Gullar raqsi`, `gul malikasi`, `qizil jele`, `momaqaymoq salati`, and established spring vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,114 / 14,720 unique English records (95.88%), an increase of 0.14 percentage points

### UZ-257 — Data/Festivals/spring24, final dialogue

- Target: `Data/Festivals/spring24`
- English source: `unpacked-all/Data/Festivals/spring24.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring24-6.json
- Entries: 1 final year-two dialogue record, source position 84 (`Leo_y2`)
- Scope: Leo’s question about needing a dance partner
- Control contract preserved exactly: `$0` remains unchanged; only spoken text is translated
- Glossary decision applied: `Gullar raqsi`
- Overall textual coverage after this batch: 14,115 / 14,720 unique English records (95.89%), an increase of 0.01 percentage points

### UZ-258 — Data/Festivals/spring24, final records

- Target: `Data/Festivals/spring24`
- English source: `unpacked-all/Data/Festivals/spring24.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring24-7.json
- Entries: 4 records, source positions 0–3 (`name`, `conditions`, `set-up`, `mainEvent`)
- Scope: Flower Dance name, event condition, base setup, and ceremony script
- Technical contract preserved exactly: `conditions`, `set-up`, and `mainEvent` match the English source byte-for-byte (15, 592, and 1,675 characters); only the visible festival name is translated
- Glossary decision applied: `Flower Dance` → `Gullar raqsi`
- Overall textual coverage after this batch: 14,119 / 14,720 unique English records (95.92%), an increase of 0.03 percentage points

### UZ-259 — Data/Festivals/spring13, part 1

- Target: `Data/Festivals/spring13`
- English source: `unpacked-all/Data/Festivals/spring13.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring13-1.json
- Entries: 20 dialogue records, source positions 10–29
- Scope: Egg Festival spouses and villagers, egg hunt, deviled eggs, buffet, spring community, and egg traditions
- Control contract preserved exactly: `#$b#`, `#$e#`, `$h`, `$s`, and `$u` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Tuxum bayrami`, `tuxum ovi`, `tuxumli zakuska`, and established spring vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,139 / 14,720 unique English records (96.05%), an increase of 0.14 percentage points

### UZ-260 — Data/Festivals/spring13, part 2

- Target: `Data/Festivals/spring13`
- English source: `unpacked-all/Data/Festivals/spring13.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring13-2.json
- Entries: 20 dialogue records, source positions 30–49
- Scope: Egg Festival traditions, buffet, egg dishes, chicken preparation, spring flowers, food, and repeated weather dialogue
- Control contract preserved exactly: `#$b#`, `#$e#`, `$h`, `$s`, and `$11` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `Tuxum bayrami`, `tuxumli zakuska`, `Gullar raqsi`, and established spring vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,159 / 14,720 unique English records (96.19%), an increase of 0.14 percentage points

### UZ-261 — Data/Festivals/spring13, part 3

- Target: `Data/Festivals/spring13`
- English source: `unpacked-all/Data/Festivals/spring13.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring13-3.json
- Entries: 20 dialogue records, source positions 50–69
- Scope: Egg hunt excitement, sewer and rain comments, year-two festival dialogue, chickens, eggs, and spring food
- Control contract preserved exactly: `#$b#`, `$h`, `$s`, `$a`, `$y`, `_Yes_`, and `_No_` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `tuxum ovi`, `Tuxum bayrami`, `porey piyoz`, and established spring vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,179 / 14,720 unique English records (96.32%), an increase of 0.14 percentage points

### UZ-262 — Data/Festivals/spring13, part 4

- Target: `Data/Festivals/spring13`
- English source: `unpacked-all/Data/Festivals/spring13.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring13-4.json
- Entries: 12 dialogue records, source positions 70–81
- Scope: Year-two Egg Festival dialogue about the bunny stand, slime eggs, chickens, custard, eggs, and rainy-day fishing
- Control contract preserved exactly: `#$b#`, `$h`, and `$s` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `shilimshiq tuxumi`, `laqqa baliq`, `Tuxum bayrami` context, and established spring vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,191 / 14,720 unique English records (96.41%), an increase of 0.08 percentage points

### UZ-263 — Data/Festivals/spring13, technical labels

- Target: `Data/Festivals/spring13`
- English source: `unpacked-all/Data/Festivals/spring13.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring13-5.json
- Entries: 3 records (`name`, `conditions`, `Event.cs.1862`)
- Scope: Egg Festival title, event availability condition, and winner text used by the event engine
- Technical contract preserved: `conditions` remains executable metadata; `$1` in `Event.cs.1862` remains unchanged
- Glossary decision applied: `Egg Festival` → `Tuxum bayrami`
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,194 / 14,720 unique English records (96.43%), an increase of 0.02 percentage points

### UZ-264 — Data/Festivals/spring13, post-hunt scenes

- Target: `Data/Festivals/spring13`
- English source: `unpacked-all/Data/Festivals/spring13.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring13-6.json
- Entries: 2 scene-script records (`afterEggHunt`, `AbbyWin`)
- Scope: Lewis’s post-hunt announcement, prize handoff, and festival closing lines
- Technical contract preserved exactly: scene commands, actor names, movement tokens, and `$h` / `#$b#` markers remain unchanged; only quoted speech is translated
- Glossary decisions applied: `tuxum ovi`, `Tuxum bayrami`, and established Pelican Town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,196 / 14,720 unique English records (96.44%), an increase of 0.01 percentage points

### UZ-265 — Data/Festivals/spring13, main hunt scenes

- Target: `Data/Festivals/spring13`
- English source: `unpacked-all/Data/Festivals/spring13.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring13-7.json
- Entries: 3 scene-script records (`mainEvent`, `mainEvent_y2`, `afterEggHunt_y2`)
- Scope: annual spring egg-hunt introduction, contestant instructions, start cue, and year-two post-hunt closing
- Technical contract preserved exactly: movement commands, actor names, event commands, and all `$h` / `#$b#` markers remain unchanged; only quoted speech is translated
- Glossary decisions applied: `bahorgi tuxum ovi`, `tuxum ovi`, `noyob sovrin`, and established festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,199 / 14,720 unique English records (96.46%), an increase of 0.02 percentage points

### UZ-266 — Data/Festivals/spring13, setup scripts

- Target: `Data/Festivals/spring13`
- English source: `unpacked-all/Data/Festivals/spring13.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-spring13-8.json
- Entries: 2 setup records (`set-up`, `set-up_y2`)
- Scope: first-year and year-two actor setup scripts; these records contain only executable event commands and no visible English text
- Technical contract preserved byte-for-byte from the English source
- Glossary check: no visible terminology occurs in this technical-only batch; canonical Uzbek glossary remains the source for all visible festival text
- Overall textual coverage after this batch: 14,201 / 14,720 unique English records (96.47%), an increase of 0.01 percentage points

### UZ-267 — Data/Festivals/summer11, Luau opening

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-6.json
- Entries: 3 records (`name`, `conditions`, `mainEvent`)
- Scope: Luau title, event availability, and opening potluck ceremony dialogue
- Technical contract preserved exactly: `conditions` remains executable metadata; scene commands, actor names, and `$h` / `#$b#` markers remain unchanged; only quoted speech is translated
- Glossary decisions applied: `Luau`, `umumiy ziyofat`, `masalliq`, and established Pelican Town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,204 / 14,720 unique English records (96.49%), an increase of 0.02 percentage points

### UZ-268 — Data/Festivals/summer11, governor reactions six and five

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-7.json
- Entries: 2 scene-script records (`governorReaction6`, `governorReaction5`)
- Scope: sour soup reaction, prank reveal, complaint, bland-soup reaction, and Luau closing messages
- Technical contract preserved exactly: scene commands, actor names, `/message` text slots, and all `$1`, `$2`, `$4`, `$s`, `$u`, and `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Luau`, `sho‘rva`, `masalliq`, and established festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,206 / 14,720 unique English records (96.51%), an increase of 0.02 percentage points

### UZ-269 — Data/Festivals/summer11, governor reactions four and three

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-8.json
- Entries: 2 scene-script records (`governorReaction4`, `governorReaction3`)
- Scope: excellent and pleasant soup reactions, praise, and successful-Luau messages
- Technical contract preserved exactly: scene commands, actor names, message slots, and `$h` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Luau`, `sho‘rva`, and established festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,208 / 14,720 unique English records (96.52%), an increase of 0.01 percentage points

### UZ-270 — Data/Festivals/summer11, governor reactions two through zero

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-9.json
- Entries: 3 scene-script records (`governorReaction2`, `governorReaction1`, `governorReaction0`)
- Scope: average, poor, and disastrous soup reactions, Governor fainting, and festival closing messages
- Technical contract preserved exactly: scene commands, actor names, message slots, and `$s`, `$u`, `$4` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Luau`, `sho‘rva`, `masalliq`, and established festival vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,211 / 14,720 unique English records (96.54%), an increase of 0.02 percentage points

### UZ-271 — Data/Festivals/summer11, final records

- Target: `Data/Festivals/summer11`
- English source: `unpacked-all/Data/Festivals/summer11.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-festivals-summer11-10.json
- Entries: 3 records (`set-up`, `set-up_y2`, `mainEvent_y2`)
- Scope: first-year and year-two Luau setup scripts plus the year-two potluck opening scene
- Technical contract preserved exactly: both setup scripts are byte-for-byte copies; year-two scene commands, actor names, and all `$h` / `#$b#` markers remain unchanged; only quoted speech is translated
- Glossary decisions applied: `Luau`, `umumiy ziyofat`, `masalliq`, and established governor vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,214 / 14,720 unique English records (96.56%), an increase of 0.02 percentage points

### UZ-272 — Data/Events/Town, Sunday saloon reminder

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-1.json
- Entries: 1 event record (`3917589/n gaveAlexMoney/O Alex/d Mon/d Tue/d Wed/d Thu/d Fri/d Sat`)
- Scope: Sunday reminder to visit the saloon and check on Alex
- Technical contract preserved exactly: event conditions, mail/world-state commands, and message slot remain unchanged; only the visible reminder text is translated
- Glossary decisions applied: `saloon`, `Aleks`, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,215 / 14,720 unique English records (96.57%), an increase of 0.01 percentage points

### UZ-273 — Data/Events/Town, Shane and Marnie scene

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-2.json
- Entries: 1 scene-script record (`3917584/f Shane 3500/O Shane/d Fri/t 800 1700`)
- Scope: Shane’s Friday return from the Saloon and Marnie’s concern
- Technical contract preserved exactly: event conditions, movement/audio commands, actor names, and `$h`, `$s` markers remain unchanged; only spoken text is translated
- Glossary decisions applied: `saloon`, `Shane`, `Marnie`, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,216 / 14,720 unique English records (96.58%), an increase of 0.01 percentage points

### UZ-274 — Data/Events/Town, Shane follow-up

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-3.json
- Entries: 1 scene-script record (`3917585/e 3917584/O Shane/A shaneSaloon1`)
- Scope: Shane’s denial and explanation after leaving the Saloon
- Technical contract preserved exactly: event links, movement/audio commands, actor names, response markers, and `$a` marker remain unchanged; only visible text is translated
- Glossary decisions applied: `saloon`, `Shane`, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,217 / 14,720 unique English records (96.58%), an increase of 0.01 percentage points

### UZ-275 — Data/Events/Town, Penny’s schoolbook scene

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-4.json
- Entries: 1 scene-script record (`6184643/f Haley 3500/O Haley/t 800 1500/w sunny`)
- Scope: Penny helping Jas with an old math book and Vincent asking about homework
- Technical contract preserved exactly: event conditions, movement/emote commands, actor names, and `$h`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Penny`, `Jas`, `Vinsent`, `matematika kitobi`, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,218 / 14,720 unique English records (96.59%), an increase of 0.01 percentage points

### UZ-276 — Data/Events/Town, Pam and Penny reconciliation branches

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-5.json
- Entries: 2 scene-script records (`itsagift`, `itsagift_pennySpouse`)
- Scope: Pam swallowing her pride, Penny’s reassurance, and both household relationship branches
- Technical contract preserved exactly: scene commands, actor names, animation loops, and `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Pelikan shaharchasi`, `kambag‘al`, `oila`, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,220 / 14,720 unique English records (96.60%), an increase of 0.01 percentage points

### UZ-277 — Data/Events/Town, Joja ceremony

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-6.json
- Entries: 1 scene-script record (`502261/J/w sunny/H`)
- Scope: Morris’s Joja Community Development ceremony, pilot-program speech, and exclusive gift announcement
- Technical contract preserved exactly: event conditions, actor setup, award commands, gender branch marker `^`, and all `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Joja jamoasini rivojlantirish loyihasi`, `Pelikan shaharchasi`, `Jamoat markazi`, `issiqxona`, and established Joja vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,221 / 14,720 unique English records (96.61%), an increase of 0.01 percentage points

### UZ-278 — Data/Events/Town, Lewis and Marnie secret

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-7.json
- Entries: 1 scene-script record (`639373/f Lewis 1500/f Marnie 1500/t 1900 2300/w sunny`)
- Scope: Lewis and Marnie’s secret conversation, discovery, and response choices
- Technical contract preserved exactly: event conditions, actor/emote commands, `$q`, `#$r`, `$s`, `$u`, `$4` markers, and response IDs remain unchanged; only visible text is translated
- Glossary decisions applied: `hokimiyat mavqeyi`, `sir`, `Lewis`, `Marnie`, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,222 / 14,720 unique English records (96.62%), an increase of 0.01 percentage points

### UZ-279 — Data/Events/Town, Emily and the injured parrot

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-8.json
- Entries: 1 scene-script record (`463391/f Emily 1000/e 471942/w sunny/z winter/t 600 1700`)
- Scope: Emily helping an injured parrot and the resulting event messages
- Technical contract preserved exactly: event conditions, actor/sprite commands, message slots, and `$s`, `$u` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Pelikan shaharchasi`, `to‘tiqush`, `qanot`, and established animal vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,223 / 14,720 unique English records (96.62%), an increase of 0.01 percentage points

### UZ-280 — Data/Events/Town, Alex and Dusty follow-up

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-9.json
- Entries: 1 scene-script record (`didntHear`)
- Scope: Alex’s explanation of his childhood, grandparents, and Dusty’s steak trick
- Technical contract preserved exactly: event commands, actor names, `$a`, `$s`, `$h`, and `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `buvim va bobom`, `Dasti`, `bifshteks`, `hamdardlik`, and established family vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,224 / 14,720 unique English records (96.63%), an increase of 0.01 percentage points

### UZ-281 — Data/Events/Town, Sam skateboard scene

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-10.json
- Entries: 1 scene-script record (`45/f Sam 1500/t 1200 1600/w sunny`)
- Scope: Lewis confronting Sam about skateboarding on private property, with all three response branches
- Technical contract preserved exactly: scene commands, actor names, `question` and `splitSpeak` branch separators, and `$4`, `$7`, `$8`, `$a`, `$u` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `xususiy mulk`, `skateboard`, `Sam`, `Lewis`, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,225 / 14,720 unique English records (96.64%), an increase of 0.01 percentage points

### UZ-282 — Data/Events/Town, Alex and Dusty main scene

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-11.json
- Entries: 1 scene-script record (`2481135/f Alex 1000/t 900 1600`)
- Scope: Alex’s conversation with Dusty, family history, trust response, and the linked `didntHear` branch
- Technical contract preserved exactly: branch link, response choices, event commands, actor names, and `$a`, `$s`, `$h`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Dasti`, `buvim va bobom`, `achinish`, `bifshteks`, and established family vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,226 / 14,720 unique English records (96.64%), an increase of 0.01 percentage points

### UZ-283 — Data/Events/Town, Clint asks Emily out

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-12.json
- Entries: 1 scene-script record (`101/f Clint 1500/e 97/k 2123243/k 2123343/o Emily/t 900 1830/a 0 90/!D Emily`)
- Scope: Clint’s invitation to Emily, Grampleton carnival plans, and date announcement
- Technical contract preserved exactly: event conditions, actor/emote commands, object keys, response flow, and `$4`, `$h`, `$s` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Grampleton karnavali`, `saloon`, `uchrashuv`, `Klint`, `Emily`, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,227 / 14,720 unique English records (96.65%), an increase of 0.01 percentage points

### UZ-284 — Data/Events/Town, Pam house reveal

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-13.json
- Entries: 1 scene-script record (`choseToBeKnown`)
- Scope: Robin revealing Pam’s new house, Penny’s gratitude, Pam’s reconciliation, and the `itsagift` response fork
- Technical contract preserved exactly: conversation topic, movement/animation commands, gender branch `^`, question choices, fork target, and `$4`, `$7`, `$h`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Pelikan shaharchasi`, `haqiqiy oila`, `sovg‘a`, `Penny`, `Pam`, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,228 / 14,720 unique English records (96.66%), an increase of 0.01 percentage points

### UZ-285 — Data/Events/Town, Penny-spouse house reveal

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-14.json
- Entries: 1 scene-script record (`choseToBeKnown_pennySpouse`)
- Scope: spouse-specific Pam house reveal, Robin/Penny dialogue, and the `itsagift_pennySpouse` fork
- Technical contract preserved exactly: conversation topic, movement/animation commands, question choices, fork target, and `$4`, `$7`, `$h`, `$s`, `$u`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Pelikan shaharchasi`, `haqiqiy oila`, `sovg‘a`, `Penny`, `Pam`, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,229 / 14,720 unique English records (96.66%), an increase of 0.01 percentage points

### UZ-286 — Data/Events/Town, Penny helps George

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-15.json
- Entries: 1 scene-script record (`34/f Penny 500/t 900 1400/w sunny`)
- Scope: Penny helping George, apology dialogue, and choices about aging and respect for elders
- Technical contract preserved exactly: event conditions, actor movement, question IDs, response markers, and `$4`, `$h`, `$q`, `$r`, `$s`, `$u` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Jorj`, `Penny`, `keksalar`, `Mullner`, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,230 / 14,720 unique English records (96.67%), an increase of 0.01 percentage points

### UZ-287 — Data/Events/Town, Special Orders board

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-16.json
- Entries: 1 scene-script record (`15389722/j 57`)
- Scope: Lewis and Robin introducing the Special Orders board, including the quick-question response branches
- Technical contract preserved exactly: event commands, `%farm` placeholder, `quickQuestion`, `(break)` delimiters, embedded backslash commands, fork choices, and `$4`, `$5`, `$h`, `$s`, `$u`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Maxsus topshiriqlar`, `qattiq yog‘och`, `e’lonlar taxtasi`, `Pelikan shaharchasi`, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,231 / 14,720 unique English records (96.68%), an increase of 0.01 percentage points

### UZ-288 — Data/Events/Town, Shane, Clint, and Emily advertising shoot

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-16.json
- Entries: 1 scene-script record (`831125/f Shane 1750/f Clint 500/f Emily 500/t 1000 1600/w sunny`)
- Scope: Shane directs a Joja Bluu advertisement with Clint and Emily, then invites the farmer into the shot
- Technical contract preserved exactly: event conditions, actor names, movement and camera commands, embedded line breaks, and `$5`, `$h`, `$s`, `$u`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Joja Bluu`, `sorbitol`, `gazli ichimlik`, `Klint`, `Emily`, and established advertising vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,232 / 14,720 unique English records (96.68%), an increase of 0.01 percentage points

+### UZ-289 — Data/Events/Town, Sam’s midnight confession

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-17.json
- Entries: 1 scene-script record (`233104/f Sam 2500/t 2000 2400/w sunny/n samMessage`)
- Scope: Sam’s private midnight conversation, Jodi’s interruption, hiding choices, and Sam’s confession
- Technical contract preserved exactly: event conditions, actor names, movement/audio commands, fork targets, question choices, and `$7`, `$8`, `$10`, `$h`, `$l`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Sam`, `Jodi`, `guruh`, `qo‘l kurashi`, `do‘st`, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,233 / 14,720 unique English records (96.69%), an increase of 0.01 percentage points


+### UZ-290 — Data/Events/Town, Pam house-upgrade branches

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-18.json
- Entries: 2 scene-script records (`611173/Hn pamHouseUpgrade/o Penny` and `611173/Hn pamHouseUpgrade`)
- Scope: Robin unveils Pam and Penny’s new home, including anonymous-donor choices and both family-resolution endings
- Technical contract preserved exactly: event conditions, movement/animation commands, question choices, fork targets, conversation-topic updates, and `$4`, `$5`, `$h`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `haqiqiy oila`, `noma’lum`, `qashshoqlik`, `uy`, `Robin`, `Pam`, `Penny`, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,235 / 14,720 unique English records (96.71%), an increase of 0.02 percentage points


+### UZ-291 — Data/Events/Town, Linus and George raccoon scene

- Target: `Data/Events/Town`
- English source: `unpacked-all/Data/Events/Town.json`, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-19.json
- Entries: 1 scene-script record (`502969/w sunny/f Linus 50/j 7/t 2000 2400`)
- Scope: George mistakes Linus for raccoons, Linus explains dumpster diving, the response branches, and Gus offers food
- Technical contract preserved exactly: event conditions, gender branch `^`, `$y` dialogue-choice structure, actor commands, response branches, and `$3`, `$h`, `$s`, `$u`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: `Jorj`, `Linus`, `Pelikan shaharchasi`, `xususiy mulk`, `qovoqli quymoq`, and established food/community vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,236 / 14,720 unique English records (96.71%), an increase of 0.01 percentage points


+### UZ-292 — Data/Events/Town, Abigail’s graveyard sword practice

- Target: Data/Events/Town
- English source: unpacked-all/Data/Events/Town.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-20.json
- Entries: 1 scene-script record (4/f Abigail 1500/t 2100 2400/w sunny)
- Scope: Abigail’s graveyard sword practice, her conversation with the farmer, Pierre’s interruption, and four response branches
- Technical contract preserved exactly: event conditions, $q/$r response structure, response IDs, actor/camera commands, the message command, and $4, $7, $8, $a, $h, $l, $u, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: qilichbozlik, tog‘ g‘orlari, o‘zini himoya qilish, qabriston, Abigail, Pierre, and established family vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,237 / 14,720 unique English records (96.72%), an increase of 0.01 percentage points


+### UZ-293 — Data/Events/Town, Community Center discovery

- Target: Data/Events/Town
- English source: unpacked-all/Data/Events/Town.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-21.json
- Entries: 1 scene-script record (611439/j 4/t 800 1300/w sunny/a 0 54/H)
- Scope: Lewis shows the farmer the abandoned Community Center, discovers Junimos, and leaves the building unlocked
- Technical contract preserved exactly: event conditions, quest/mail commands, camera and location transitions, Junimo sprite commands, both message commands, and $s, $h, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: Jamoat markazi, Pelikan shaharchasi, Joja korporatsiyasi, Junimo, kalamush, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,238 / 14,720 unique English records (96.73%), an increase of 0.01 percentage points


+### UZ-294 — Data/Events/Town, Leah’s art show

- Target: Data/Events/Town
- English source: unpacked-all/Data/Events/Town.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-22.json
- Entries: 1 scene-script record (53/e 55/t 1500 1700)
- Scope: Leah presents her sculptures, thanks the farmer, receives reactions from the town, and opens the bidding
- Technical contract preserved exactly: event conditions, sprite and movement commands, gender separator, mail command, camera transitions, and $h, $l, $u, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: ko‘rgazma, haykal, haykaltaroshlik, animatronik, gumanoid, yog‘och, and established art vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,239 / 14,720 unique English records (96.73%), an increase of 0.01 percentage points


+### UZ-295 — Data/Events/Town, Shane’s arcade scene

- Target: Data/Events/Town
- English source: unpacked-all/Data/Events/Town.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-23.json
- Entries: 1 scene-script record (3917586/e 3917585/O Shane/A shaneSaloon2)
- Scope: Marnie and the farmer confront Shane about his arcade-game obsession and Joja Cola
- Technical contract preserved exactly: event conditions, world-state/mail commands, location transitions, sprite/audio commands, fork question and response IDs, and $a, $h, $s, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: raund, global reyting, arkada mashinasi, Joja Cola, qaramlik, and established recovery vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,240 / 14,720 unique English records (96.74%), an increase of 0.01 percentage points


+### UZ-296 — Data/Events/Town, Haley’s cake walk fundraiser

- Target: Data/Events/Town
- English source: unpacked-all/Data/Events/Town.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-24.json
- Entries: 1 scene-script record (6184644/e 8675611/O Haley/A haleyCakewalk2/t 600 1500/w sunny/i 220)
- Scope: Haley’s cake-walk fundraiser, cake prizes, and the schoolbook donation for Penny, Jas, and Vincent
- Technical contract preserved exactly: quest/item commands, simultaneous movement blocks, gender separator, object/message commands, mail command, and $h, $s, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: xayriya yig‘imi, qizil baxmal tort, lavlagi, maktab kitoblari, biznes solig‘i, and established food/community vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,241 / 14,720 unique English records (96.75%), an increase of 0.01 percentage points


+### UZ-297 — Data/Events/Town, Community Center completion celebration

- Target: Data/Events/Town
- English source: unpacked-all/Data/Events/Town.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-town-25.json
- Entries: 1 scene-script record (191393/Hn ccFishTank/Hn ccBulletin/Hn ccPantry/Hn ccVault/Hn ccBoilerRoom/Hn ccCraftsRoom/Hl jojaFishTank/Hl jojaPantry/Hl jojaVault/Hl jojaBoilerRoom/Hl jojaCraftsRoom/Hl JojaMember/w sunny/H)
- Scope: Community Center completion celebration, Stardew Hero Award, Morris confrontation, and the town’s JojaMart boycott
- Technical contract preserved exactly: completion mail/topic commands, location/warp and sprite sequences, festival award command, fork question and response ID, message/text-above-head commands, and $h, $s, $u, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: Jamoat markazi, Stardew qahramoni mukofoti, JojaMart, boykot, jamoaviy ruh, and established town vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,242 / 14,720 unique English records (96.75%), an increase of 0.01 percentage points


+### UZ-298 — Data/Events/Beach, short response records

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-1.json
- Entries: 2 short records (NoToElliott, arrogantJosh)
- Scope: Elliott’s brief response and Alex’s jealous reaction
- Technical contract preserved exactly: actor/emote/face-direction commands, dialogue endings, and $7, $a markers remain unchanged; only visible text is translated
- Glossary decisions applied: Elliott, Alex, hasad, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,244 / 14,720 unique English records (96.77%), an increase of 0.01 percentage points


+### UZ-299 — Data/Events/Beach, Alex winter gridball scene

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-2.json
- Entries: 1 scene-script record (20/f Alex 500/z winter/p Alex/w sunny)
- Scope: Alex’s winter gridball practice, his professional ambitions, and the two response choices
- Technical contract preserved exactly: scene movement/animation commands, fork target, question response IDs, and $u, $h, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: gridbol, pley-off, professional o‘yinchi, Zuzu City Tunnelers, and established sports vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,245 / 14,720 unique English records (96.77%), an increase of 0.01 percentage points


+### UZ-300 — Data/Events/Beach, Krobus moonlight-jelly animation

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-3.json
- Entries: 1 visual-only scene-script record (7771191/t 2000 2500/f Krobus 3500/w sunny)
- Scope: Krobus and the sea-monster actor during the Moonlight Jellies scene; this record contains no spoken text
- Technical contract preserved exactly: every actor, sprite, animation, sound, warp, viewport, and timing command remains byte-for-byte equal to English
- Glossary check: no visible terminology was introduced; the record was checked against the canonical Uzbek glossary snapshot
- Overall textual coverage after this batch: 14,246 / 14,720 unique English records (96.78%), an increase of 0.01 percentage points


+### UZ-301 — Data/Events/Beach, Willy’s Quality Bobber lesson

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-4.json
- Entries: 1 scene-script record (3131209/n willyBugWadCutscene)
- Scope: Willy’s bug-meat fishing scene and the Quality Bobber crafting lesson
- Technical contract preserved exactly: temporary actor and animation commands, gender separator, recipe/message commands, the gender substitution token, and $h, $s, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: Sifatli qalqovich, baliq ovlash, hasharot go‘shti, and established fishing vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,247 / 14,720 unique English records (96.79%), an increase of 0.01 percentage points


+### UZ-302 — Data/Events/Beach, Willy’s first fishing rod

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-5.json
- Entries: 1 scene-script record (739330/t 600 1710/*n spring_2_1)
- Scope: Willy welcomes the new farmer, gives an old fishing rod, and reopens his shop
- Technical contract preserved exactly: quest/mail/item/award commands, gender separator, actor animation, and $u, $h, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: qarmoq, baliq ovlash, anjom, baliqchi, and established fishing vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,248 / 14,720 unique English records (96.79%), an increase of 0.01 percentage points


+### UZ-303 — Data/Events/Beach, Sebastian’s rain scene

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-6.json
- Entries: 1 scene-script record (29/f Sebastian 2000/t 1200 2300/w rainy)
- Scope: Sebastian meets the farmer in the rain, explains his comfort with solitude, and shares an umbrella
- Technical contract preserved exactly: movement, music, umbrella sprite, animation, and $7, $s, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: yomg‘ir, ufq, xavotir, soyabon, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,249 / 14,720 unique English records (96.80%), an increase of 0.01 percentage points


+### UZ-304 — Data/Events/Beach, Haley’s lost bracelet

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-7.json
- Entries: 1 scene-script record (13/f Haley 1500/z winter/t 1000 1600)
- Scope: Haley loses her great-grandmother’s bracelet, the farmer searches for it, and the response branch resolves
- Technical contract preserved exactly: quest/player-control/message commands, question and response IDs, actor animation, and $8, $h, $l, $q, $r, $s, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: bilaguzuk, katta buvi, qidirish, qimmatli, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,250 / 14,720 unique English records (96.81%), an increase of 0.01 percentage points


+### UZ-305 — Data/Events/Beach, Alex remembers his mother

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-8.json
- Entries: 1 scene-script record (288847/f Alex 2000/p Alex/w sunny/G !IS_PASSIVE_FESTIVAL_TODAY SquidFest)
- Scope: Alex’s grief over his mother, her music box, and four supportive response choices
- Technical contract preserved exactly: scene conditions, music/item commands, question and response IDs, event_box1–4 branches, and $7, $9, $q, $r, $s, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: xotira, esdalik, musiqa qutisi, gridbol, g‘amxo‘rlik, and established family vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,251 / 14,720 unique English records (96.81%), an increase of 0.01 percentage points


+### UZ-306 — Data/Events/Beach, Sam and Vincent’s father

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-9.json
- Entries: 1 scene-script record (733330/f Sam 750/w sunny/t 700 1500/z winter/y 1)
- Scope: Sam reassures Vincent about their father, reflects on the war, and discusses honesty with children
- Technical contract preserved exactly: actor animation, music/location commands, question response structure, splitSpeak delimiter, and $7, $8, $a, $h, $s, $u, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: plyaj, gridbol, Gotoro, qo‘shin, umid, rostgo‘ylik, and established family vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,252 / 14,720 unique English records (96.82%), an increase of 0.01 percentage points


+### UZ-307 — Data/Events/Beach, Willy’s crab experiment

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-10.json
- Entries: 1 scene-script record (711130/t 600 1710/f Willy 1500)
- Scope: Willy’s unruly crab experiment, Gus’s purchase, and the crab-cake discount
- Technical contract preserved exactly: conversation topic, location/actor transitions, sprite cleanup, gender separator, and $h, $s, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: qisqichbaqa, tajriba, baliq do‘koni, salun, kotlet, and established fishing vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,253 / 14,720 unique English records (96.83%), an increase of 0.01 percentage points


+### UZ-308 — Data/Events/Beach, Elliott’s maiden voyage

- Target: Data/Events/Beach
- English source: unpacked-all/Data/Events/Beach.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-beach-11.json
- Entries: 1 scene-script record (43/f Elliott 2500/w sunny/t 700 1300/G !IS_PASSIVE_FESTIVAL_TODAY SquidFest)
- Scope: Elliott’s restored rowboat, his book and feelings, and the two response choices during the maiden voyage
- Technical contract preserved exactly: temporary-map/warp commands, gender separators, question/response IDs, fork target, and $7, $8, $l, $q, $r, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: eshkakli qayiq, bestseller, ma’naviy qo‘llab-quvvatlash, Qirmizibaliq, and established relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,254 / 14,720 unique English records (96.83%), an increase of 0.01 percentage points


+### UZ-309 — Data/Events/Mountain, Linus trash cleanup

- Target: Data/Events/Mountain
- English source: unpacked-all/Data/Events/Mountain.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-mountain-1.json
- Entries: 1 short scene-script record (8357109/w sunny/t 600 1900/n linusTrashCleanup)
- Scope: Linus cleans the mountain water and comments on his own cleanliness
- Technical contract preserved exactly: sprite path/backslashes, viewport, timing, and $4, $5 markers remain unchanged; only visible text is translated
- Glossary decisions applied: suv, toza, Linus, and established mountain vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,255 / 14,720 unique English records (96.84%), an increase of 0.01 percentage points


+### UZ-310 — Data/Events/Mountain, MarILDA response branch

- Target: Data/Events/Mountain
- English source: unpacked-all/Data/Events/Mountain.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-mountain-2.json
- Entries: 1 dialogue branch record (BadAnswer)
- Scope: MarILDA’s freedom response choices and Maru’s closing line
- Technical contract preserved exactly: $q/$r response structure, event_robot_explain1–3 IDs, face/emote commands, and ScienceHouse transition remain unchanged; only visible text is translated
- Glossary decisions applied: MarILDA, mexanizm, ozodlik, ferma, and established science vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,256 / 14,720 unique English records (96.85%), an increase of 0.01 percentage points


+### UZ-311 — Data/Events/Mountain, Linus well scene

- Target: Data/Events/Mountain
- English source: unpacked-all/Data/Events/Mountain.json, Stardew Valley 1.6.15
- File: assets/translations/uzbek/data-events-mountain-3.json
- Entries: 1 short scene-script record (linusWell)
- Scope: Linus thanks the farmer for respecting his way of life and Robin reacts warmly
- Technical contract preserved exactly: friendship change, actor movement, music, emotes, and $4/$5/$h, #$b# markers remain unchanged; only visible text is translated
- Glossary decisions applied: hayot tarzi, vodiy, rezavorlar, hurmat, and established friendship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,257 / 14,720 unique English records (96.85%), an increase of 0.01 percentage points


### UZ-312 — Data/Events/Mountain, Willy discovers panning

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-4.json`
- Entries: 1 scene-script record (`404798/Hn ccFishTank`)
- Scope: Willy explains the newly flowing mountain stream, discovers quality ore, and gives the farmer a pan
- Technical contract preserved exactly: actor movement, temporary sprites, animation frames, sound effects, reward command, item display, and `$h` marker remain unchanged; only visible text is translated
- Glossary decisions applied: soy, tog‘, ruda, sifatli ruda, elak, ryukzak, and established fishing vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,258 / 14,720 unique English records (96.86%), an increase of 0.01 percentage points

### UZ-313 — Data/Events/Mountain, Linus campfire and Wild Bait

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-5.json`
- Entries: 1 scene-script record (`26/f Linus 1000/w sunny/t 2000 2400`)
- Scope: Linus welcomes the farmer by the campfire, explains his cautious friendship, and gives the Wild Bait recipe
- Technical contract preserved exactly: movement, sprites, animation, sound sequence, recipe ID, message command, and `$s`, `$h`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: olov, ehtiyotkor, do‘st, baliq yemi, retsept, Yovvoyi yem, and established Linus/fishing vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,259 / 14,720 unique English records (96.87%), an increase of 0.01 percentage points

### UZ-314 — Data/Events/Mountain, Sebastian’s motorcycle

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-6.json`
- Entries: 1 scene-script record (`384883/f Sebastian 1000/t 1100 1700`)
- Scope: Sebastian shows the farmer his motorcycle, talks about night rides, and offers a future ride
- Technical contract preserved exactly: garage animation, sound and glow sequence, gender branch separator, response IDs, and `$q`, `$r`, `$8`, `$9` markers remain unchanged; only visible text is translated
- Glossary decisions applied: mototsikl, Stardew vodiysi, shahar yog‘dusi, sayr, and established Sebastian/vehicle vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,260 / 14,720 unique English records (96.88%), an increase of 0.01 percentage points

### UZ-315 — Data/Events/Mountain, Maru’s night telescope

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-7.json`
- Entries: 1 scene-script record (`8/f Maru 1500/w sunny/t 2100 2340`)
- Scope: Maru invites the farmer to view the night sky and explains the wonder and sadness of distant stars
- Technical contract preserved exactly: temporary-map transition, telescope sprite, camera timing, message command, response IDs, and `$q`, `$r`, `$8`, `$s` markers remain unchanged; only visible text is translated
- Glossary decisions applied: tungi osmon, sayyora, yulduz, qo‘shaloq yulduz tizimi, and established Maru/science vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,261 / 14,720 unique English records (96.88%), an increase of 0.01 percentage points

### UZ-316 — Data/Events/Mountain, Abigail’s rainy lake scene

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-8.json`
- Entries: 1 scene-script record (`2/f Abigail 1000/w rainy/t 1200 1900/z winter`)
- Scope: Abigail meets the farmer by the rainy lake, shelters under a tree, and reacts to the mini-harp
- Technical contract preserved exactly: rain music, temporary sprite, animation frames, camera timing, response IDs, and `$q`, `$r`, `$7`, `$8`, `$h`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: yomg‘ir, ko‘l, daraxt, mini-arfa, hamroh, and established Abigail/music vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,262 / 14,720 unique English records (96.89%), an increase of 0.01 percentage points

### UZ-317 — Data/Events/Mountain, Sebastian’s mountain ride

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-9.json`
- Entries: 1 scene-script record (`384882/f Sebastian 2500/t 2000 2400`)
- Scope: Sebastian takes the farmer on a motorcycle ride, shows Zuzu City, and shares his feelings about the valley
- Technical contract preserved exactly: temporary-map transitions, motorcycle sprite, animation frame sequence, response IDs, gender branch separator, and `$q`, `$r`, `$s`, `$l`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: mototsikl, Zuzu shahri, vodiy, sayr, and established Sebastian/relationship vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,263 / 14,720 unique English records (96.90%), an increase of 0.01 percentage points

### UZ-318 — Data/Events/Mountain, Maru’s comet wish

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-10.json`
- Entries: 1 scene-script record (`5183338/e 3917666/O Maru/w sunny/t 2200 2500`)
- Scope: Maru watches a comet with the farmer and offers three wishes, including a new baby, growing old together, or money
- Technical contract preserved exactly: temporary-map transition, cutscene ID, telescope/heart sprites, quickQuestion choice count and break structure, and `$h`, `$l`, `#$b#`, `$s`, `$8` markers remain unchanged; only visible text is translated
- Glossary decisions applied: kometa, tilak, farzand, qo‘shaloq yulduz, romantik, and established Maru/science vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,264 / 14,720 unique English records (96.90%), an increase of 0.01 percentage points

### UZ-319 — Data/Events/Mountain, Sebastian rescues a frog

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-11.json`
- Entries: 1 scene-script record (`9333219/O Sebastian/f Sebastian 3500/w rainy/t 600 1900`)
- Scope: Sebastian and the farmer rescue an injured frog and decide how to care for it
- Technical contract preserved exactly: conversation topic, action sequence, quickQuestion response count, `(break)` branches, backslash commands, and `$s`, `$h`, `$7`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: qurbaqa, yaralangan, sog‘aytirmoq, g‘amxo‘rlik, Marnie, and established Sebastian/animal vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,265 / 14,720 unique English records (96.91%), an increase of 0.01 percentage points

### UZ-320 — Data/Events/Mountain, Linus and Robin’s invitation

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-12.json`
- Entries: 1 scene-script record (`371652/f Linus 2000/w sunny/t 600 1700/a 12 26`)
- Scope: Robin offers Linus a home, Linus explains his chosen way of life, and the farmer affirms their friendship
- Technical contract preserved exactly: animation/action sequence, fork target, question response structure, camera movement, and `$s`, `$h`, `$5`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: shinam uy, oqar suv, hayot tarzi, do‘stlik, rezavorlar, and established Linus/Robin vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,266 / 14,720 unique English records (96.92%), an increase of 0.01 percentage points

### UZ-321 — Data/Events/Mountain, Leo’s day with friends

- Target: `Data/Events/Mountain`
- English source: `unpacked-all/Data/Events/Mountain.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-mountain-13.json`
- Entries: 1 scene-script record (`8959199/w sunny/t 600 1900/e 6497428/f Leo 2250/F`)
- Scope: Leo cooks with Linus, fishes with Willy and the children, then reflects on family, memories, and belonging
- Technical contract preserved exactly: multi-location warp sequence, actor animation/action commands, temporary sprites, camera transitions, and `$h`, `$s` markers remain unchanged; only visible text is translated
- Glossary decisions applied: orol, oila, xotiralar, tegishli bo‘lmoq, baliq ovlash, and established Leo/family vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,267 / 14,720 unique English records (96.92%), an increase of 0.01 percentage points

### UZ-322 — Data/CookingRecipes technical records

- Target: `Data/CookingRecipes`
- English source: `unpacked-all/Data/CookingRecipes.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-cooking-recipes.json`
- Entries: 81 recipe records
- Scope: technical recipe definitions containing item IDs, quantities, unlock conditions, and buff/recipe parameters; no visible localized text is stored in these values
- Technical contract preserved exactly: every key and every recipe definition value matches the English source byte-for-byte; the visible recipe names remain governed by the corresponding English string layers
- Glossary check: no new visible terminology was introduced in this technical-only batch
- Overall textual coverage after this batch: 14,348 / 14,720 unique English records (97.47%), an increase of 0.55 percentage points

### UZ-323 — Data/AquariumFish technical records

- Target: `Data/AquariumFish`
- English source: `unpacked-all/Data/AquariumFish.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-aquarium-fish.json`
- Entries: 72 aquarium/fish behavior records
- Scope: technical fish IDs, animation categories, movement parameters, and aquarium behavior definitions; no visible localized text is stored in these values
- Technical contract preserved exactly: every key and every definition value matches the English source byte-for-byte
- Glossary check: no new visible terminology was introduced in this technical-only batch
- Overall textual coverage after this batch: 14,420 / 14,720 unique English records (97.96%), an increase of 0.49 percentage points

### UZ-324 — Data/ChairTiles technical records

- Target: `Data/ChairTiles`
- English source: `unpacked-all/Data/ChairTiles.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-chair-tiles.json`
- Entries: 60 chair, bench, booth, stool, and tile-layout records
- Scope: technical map tile coordinates, furniture categories, facing directions, and collision/display flags; no visible localized text is stored in these values
- Technical contract preserved exactly: every key and every definition value matches the English source byte-for-byte
- Glossary check: no new visible terminology was introduced in this technical-only batch
- Overall textual coverage after this batch: 14,480 / 14,720 unique English records (98.37%), an increase of 0.41 percentage points

### UZ-325 — Data/HairData technical records

- Target: `Data/HairData`
- English source: `unpacked-all/Data/HairData.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-hair-data.json`
- Entries: 23 hairstyle ID and sprite-parameter records
- Scope: technical hairstyle sprite sheets, offsets, and visibility flags; no visible localized text is stored in these values
- Technical contract preserved exactly: every key and every definition value matches the English source byte-for-byte
- Glossary check: no new visible terminology was introduced in this technical-only batch
- Overall textual coverage after this batch: 14,503 / 14,720 unique English records (98.53%), an increase of 0.16 percentage points

### UZ-326 — Data/PaintData technical records

- Target: `Data/PaintData`
- English source: `unpacked-all/Data/PaintData.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-paint-data.json`
- Entries: 12 building paint-palette records
- Scope: technical building/roof/trim palette offsets; visible building labels remain governed by the English string layers
- Technical contract preserved exactly: every key and every definition value matches the English source byte-for-byte
- Glossary check: no new visible terminology was introduced in this technical-only batch
- Overall textual coverage after this batch: 14,515 / 14,720 unique English records (98.61%), an increase of 0.08 percentage points

### UZ-327 — Data/Events/Farm, Abigail apology

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-1.json`
- Entries: 1 short dialogue scene (`5/e 3/v Abigail/t 600 800`)
- Scope: Abigail apologizes for acting strangely the previous day
- Technical contract preserved exactly: actor placement, timing, scene flow, and `$l`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: uzr so‘ramoq, g‘alati tutmoq, tushunmoq, and established Abigail vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,516 / 14,720 unique English records (98.61%), an increase of 0.01 percentage points

### UZ-328 — Data/Events/Farm, Sam’s Zuzu City concert

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-2.json`
- Entries: 1 dialogue/event record (`47/f Sam 2000/t 600 800/e 44`)
- Scope: Sam invites the farmer to his band’s Zuzu City concert and shares his nervous excitement
- Technical contract preserved exactly: actor placement, event flow, `#$b#` marker, and the `end dialogue` follow-up remain unchanged; only visible text is translated
- Glossary decisions applied: guruh, konsert, Zuzu shahri, avtobus bekati, hayajon, and established Sam/music vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,517 / 14,720 unique English records (98.62%), an increase of 0.01 percentage points

### UZ-329 — Data/Events/Farm, Grandpa candles technical scene

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-3.json`
- Entries: 1 technical scene record (`2146991/y 3/H`)
- Scope: event broadcast, camera, candle, and fade commands only; the record contains no visible text
- Technical contract preserved exactly: every command and parameter matches the English source byte-for-byte
- Glossary check: no new visible terminology was introduced in this technical-only batch
- Overall textual coverage after this batch: 14,518 / 14,720 unique English records (98.63%), an increase of 0.01 percentage points

### UZ-330 — Data/Events/Farm, Leah’s art show invitation

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-4.json`
- Entries: 1 dialogue/event record (`55/f Leah 2000/t 600 800/z winter/n LeahArtShowSuggestion`)
- Scope: Leah invites the farmer to her art show in the town square and admits she is nervous
- Technical contract preserved exactly: actor placement, event flow, `end dialogue` follow-up, and `$h`, `$l`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: san’at ko‘rgazmasi, shahar maydoni, hayajon, and established Leah/art vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,519 / 14,720 unique English records (98.63%), an increase of 0.01 percentage points

### UZ-331 — Data/Events/Forest, Penny event ending

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-1.json`
- Entries: 1 short dialogue record (`eventEnd`)
- Scope: Penny reacts to the farmer refusing to help her
- Technical contract preserved exactly: actor/emote commands, `end dialogue`, and `$a` marker remain unchanged; only visible text is translated
- Glossary decisions applied: yordam bermoq, bosh tortmoq, ishonolmayapman, and established Penny vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,520 / 14,720 unique English records (98.64%), an increase of 0.01 percentage points

### UZ-332 — Data/Events/Forest, Penny and Vincent’s cowboy question

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-2.json`
- Entries: 1 dialogue branch (`choseAnimals`)
- Scope: Vincent asks about riding a cow, and Penny reminds him that the farm is not a playground
- Technical contract preserved exactly: animation/audio sequence, switch target, `${Mr.^Ms.}$`, `${his^her}$`, and `$h` marker remain unchanged; only visible text is translated
- Glossary decisions applied: fermer, egar, sigir, kovboy, o‘yin maydonchasi, and established Penny/Vincent vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,521 / 14,720 unique English records (98.65%), an increase of 0.01 percentage points

### UZ-333 — Data/Events/Farm, Shane’s Tunnelers tickets

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-5.json`
- Entries: 1 short dialogue scene (`2128292/e 3900074/t 600 630/f Shane 2500/D Shane`)
- Scope: Shane invites the farmer to a Tunnelers game and gives the bus-stop meeting time
- Technical contract preserved exactly: actor placement, timing, skippable flag, and all `$6` markers remain unchanged; only visible text is translated
- Glossary decisions applied: chipta, avtobus bekati, o‘yin, and established Shane vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,522 / 14,720 unique English records (98.65%), an increase of 0.01 percentage points

### UZ-334 — Data/Events/Farm, Alex’s money follow-up

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-6.json`
- Entries: 1 short dialogue record (`giveAlexMoney`)
- Scope: Alex thanks the farmer and invites them to the Saloon to see the project result
- Technical contract preserved exactly: mail receipt, money change, emote/timing commands, and `$h` marker remain unchanged; only visible text is translated
- Glossary decisions applied: natija, yakshanba, Saloon, and established Alex vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,523 / 14,720 unique English records (98.66%), an increase of 0.01 percentage points

### UZ-335 — Data/Events/Farm, Leah’s sculpture gift

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-7.json`
- Entries: 1 dialogue/event record (`992253/t 600 1130/f Leah 1500/w sunny`)
- Scope: Leah gives the farmer a sculpture and explains its title
- Technical contract preserved exactly: item display, reward command, actor/timing sequence, and `#$b#` marker remain unchanged; only visible text is translated
- Glossary decisions applied: haykal, sovg‘a, hislar, and established Leah/art vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,524 / 14,720 unique English records (98.67%), an increase of 0.01 percentage points

### UZ-336 — Data/Events/Farm, Kent’s return

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-8.json`
- Entries: 1 introductory dialogue record (`63/y 2/t 600 1800/H`)
- Scope: Kent introduces himself after returning from overseas and meets the new farmer
- Technical contract preserved exactly: actor placement, broadcast/skippable flow, timing, and scene commands remain unchanged; only visible text is translated
- Glossary decisions applied: xorij, qaytmoq, fermer, tanishtirmoq, and established Kent/family vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,525 / 14,720 unique English records (98.68%), an increase of 0.01 percentage points

### UZ-337 — Data/Events/Farm, Clint explains the furnace

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-9.json`
- Entries: 1 instructional dialogue record (`992553/t 600 1130/n copperFound`)
- Scope: Clint explains ore smelting, gives the Furnace blueprint, and describes tool upgrades
- Technical contract preserved exactly: item/reward commands, recipe ID, quest ID, message command, leading spacing, and both `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: ruda, pech, metall quymasi, chizma, asboblarni yaxshilash, and established Clint/crafting vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,526 / 14,720 unique English records (98.68%), an increase of 0.01 percentage points

### UZ-338 — Data/Events/Farm, Emily’s sewing machine

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-10.json`
- Entries: 1 instructional dialogue record (`992559/t 600 1130/n clothFound/o Emily/w sunny`)
- Scope: Emily introduces cloth tailoring, grants sewing-machine access, and explains the required materials
- Technical contract preserved exactly: actor/emote sequence, reward sound, system message command, and `$h`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: mato, tikuv mashinasi, kiyim, tikish, noyob uslub, and established Emily/crafting vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,527 / 14,720 unique English records (98.69%), an increase of 0.01 percentage points

### UZ-339 — Data/Events/Farm, Emily’s sewing-machine reminder

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-11.json`
- Entries: 1 alternate dialogue record (`992559/t 600 1130/n clothFound/O Emily/w sunny`)
- Scope: Emily reminds the farmer about her sewing machine and describes tailoring outfits
- Technical contract preserved exactly: reward/message commands, emote sequence, and `$h`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: tikuv mashinasi, kiyim tikmoq, mato, ikkilamchi buyum, and established Emily/crafting vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,528 / 14,720 unique English records (98.70%), an increase of 0.01 percentage points

### UZ-340 — Data/Events/Farm, Evelyn’s Garden Pot

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-12.json`
- Entries: 1 greenhouse reward/tutorial record (`900553/t 600 1130/Hn ccPantry/A cc_Greenhouse/w sunny`)
- Scope: Evelyn gives a Garden Pot, explains seasonal indoor/outdoor crops, and teaches its recipe
- Technical contract preserved exactly: item/reward commands, recipe ID, system messages, and `$s`, `$h`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: bog‘ tuvagi, ekin, fasl, jurnal parchasi, bog‘bon, and established Evelyn/farming vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,529 / 14,720 unique English records (98.70%), an increase of 0.01 percentage points

### UZ-341 — Data/Events/Farm, Marnie’s cave-carrot request

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-13.json`
- Entries: 1 quest dialogue record (`91/f Marnie 750/t 600 930`)
- Scope: Marnie asks for a cave carrot to train her goats and adds quest 21
- Technical contract preserved exactly: quest ID, dialogue flow, `${Mr.^Ms.}$`, `$h`, `$u`, `#$b#` markers, and `end dialogue` follow-up remain unchanged; only visible text is translated
- Glossary decisions applied: g‘or sabzisi, echki, qo‘shni, mehribon, konlar, and established Marnie/farming vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,530 / 14,720 unique English records (98.71%), an increase of 0.01 percentage points

### UZ-342 — Data/Events/Farm, Jodi’s fish dinner request

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-14.json`
- Entries: 1 quest dialogue record (`93/f Jodi 1000/t 600 930/d Tue Wed Thu Fri Sat Sun`)
- Scope: Jodi invites the farmer to dinner and requests a Katta og‘izli okun for fish casserole quest 22
- Technical contract preserved exactly: quest ID, emote/timing sequence, `end dialogue`, and `$h`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: Katta og‘izli okun, baliqli toblama, ko‘l, kechki ovqat, and established Jodi/fishing vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot and existing fish/quest terms
- Overall textual coverage after this batch: 14,531 / 14,720 unique English records (98.72%), an increase of 0.01 percentage points

### UZ-343 — Data/Events/Farm, Pierre’s new seed varieties

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-15.json`
- Entries: 1 seasonal dialogue record (`102/z spring/z summer/z fall/d Mon Tue Wed Thu Fri Sat/y 1/H`)
- Scope: Pierre announces new seasonal seed varieties and promotes his seed quality
- Technical contract preserved exactly: broadcast/skippable flow, timing, leading spaces, and `$h`, `$u`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: urug‘ navi, fasl, do‘kon, raqobatchi, and established Pierre/farming vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,532 / 14,720 unique English records (98.72%), an increase of 0.01 percentage points

### UZ-344 — Data/Events/Forest, Vincent’s farming question

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-3.json`
- Entries: 1 question/fork dialogue record (`choseFarming`)
- Scope: the farmer answers whether valley soil or air/grass is better, then Vincent asks about growing strong from vegetables
- Technical contract preserved exactly: question option count, fork target, action sequence, switch target, and `$h`, `$a`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: vodiy, tuproq, sabzavot, hayvon boqish, baquvvat, g‘iybat, and established Penny/Vincent vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,533 / 14,720 unique English records (98.73%), an increase of 0.01 percentage points

### UZ-345 — Data/Events/Forest, Vincent’s goblin question

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-4.json`
- Entries: 1 dialogue record (`choseMinerals`)
- Scope: Vincent asks about goblins and Penny reassures Jas by stopping the monster story
- Technical contract preserved exactly: animation/emote sequence, field-trip switch target, and `$a` marker remain unchanged; only visible text is translated
- Glossary decisions applied: goblin, g‘or, mahluq, o‘g‘irlash, and established Penny/Vincent vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,534 / 14,720 unique English records (98.74%), an increase of 0.01 percentage points

### UZ-346 — Data/Events/Forest, Penny’s field-trip ending

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-5.json`
- Entries: 1 dialogue/question record (`fieldTripEnd`)
- Scope: Penny sends Vincent and Jas to play, reflects on teaching children, and asks about parenthood
- Technical contract preserved exactly: actor movement, viewport/fade sequence, question/response IDs, `end dialogue`, and `$q`, `$r`, `$u`, `$h` markers remain unchanged; only visible text is translated
- Glossary decisions applied: ekskursiya, ota-ona, bolalar, yaxshi inson, and established Penny/field-trip vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,535 / 14,720 unique English records (98.74%), an increase of 0.01 percentage points

### UZ-347 — Data/Events/Farm, Shane’s apology

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-16.json`
- Entries: 1 dialogue/question record (`2118991/e 3910975/t 600 800`)
- Scope: Shane apologizes for the cliff incident, discusses starting therapy, and thanks the farmer for caring about him
- Technical contract preserved exactly: empty `$q` prompt spacing, three `$r` response IDs, actor/face/showFrame sequence, and `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: terapevt, g‘amxo‘rlik, ogohlantirish, uyatli, and established Shane vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,536 / 14,720 unique English records (98.75%), an increase of 0.01 percentage points

### UZ-348 — Data/Events/Farm, Emily’s secret project request

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-17.json`
- Entries: 1 dialogue record (`3917600/f Emily 3500/O Emily/t 500 820`)
- Scope: Emily asks the farmer to bring 200 fiber for a secret project and promises to reveal the result soon
- Technical contract preserved exactly: warp, movement, sound, viewport, quest, and dialogue sequence plus the `$b` marker remain unchanged; only visible text is translated
- Glossary decisions applied: tola, maxsus narsa, sir, yakuniy natija, and established Emily vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,537 / 14,720 unique English records (98.76%), an increase of 0.01 percentage points

### UZ-349 — Data/Events/Farm, Leah’s painting lesson invitation

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-18.json`
- Entries: 1 dialogue record (`3911124/f Leah 3500/O Leah/t 500 820/w sunny/z winter/d Sun`)
- Scope: Leah invites the farmer to Cindersap Forest for a painting lesson and encourages their creative side
- Technical contract preserved exactly: conversation topic, weather/date gates, movement, emote, and `$b`, `$h` markers remain unchanged; the `@` player placeholder is preserved
- Glossary decisions applied: Cindersap o‘rmoni, rasm chizish, ijodkor tomonlar, and established Leah vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,538 / 14,720 unique English records (98.76%), an increase of 0.01 percentage points

### UZ-350 — Data/Events/Farm, Alex’s secret-project request

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-19.json`
- Entries: 1 dialogue/question record (`3917587/f Alex 3500/O Alex/t 500 820/M 5000/d Sun/y 2`)
- Scope: Alex asks for 5,000g for a secret project, with the no-answer branch preserved
- Technical contract preserved exactly: question/fork route, numeric value, actor sequence, and `$a`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: maxfiy loyiha, qo‘shma bank hisobi, ziqna, and established Alex vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,539 / 14,720 unique English records (98.77%), an increase of 0.01 percentage points

### UZ-351 — Data/Events/Farm, Gunther’s Rusty Key reward

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-20.json`
- Entries: 1 dialogue/event record (`66/e 295672/t 600 700/H`)
- Scope: Gunther thanks the farmer for museum discoveries, announces the Golden Shovel award, and grants the Rusty Key
- Technical contract preserved exactly: `${Mr.^Ms.}$` gender template, `broadcastEvent/rustyKey`, reward/message sequence, and `$b`, `$s`, `$h` markers remain unchanged; only visible text is translated
- Glossary decisions applied: artefakt, mineral, muzey, zanglagan kalit, hamyon, and established Gunther vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,540 / 14,720 unique English records (98.78%), an increase of 0.01 percentage points

### UZ-352 — Data/Events/Farm, Marlon’s Slime Hutch reward

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-21.json`
- Entries: 1 event record (`690006/n slimeHutchBuilt/H`)
- Scope: Marlon comments on the new Slime Hutch, gives a Slime Egg, and explains the Slime Incubator and egg collecting
- Technical contract preserved exactly: event movement, animation, item/reward sequence, `slimeEgg` ID, and `$b` markers remain unchanged; only visible text is translated
- Glossary decisions applied: Shilimshiqxona, Shilimshiq inkubatori, Shilimshiq tuxumi, shilimshiq boqish, and established Marlon vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,541 / 14,720 unique English records (98.78%), an increase of 0.01 percentage points

### UZ-353 — Data/Events/Farm, Marnie’s stray cat introduction

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-22.json`
- Entries: 1 event record (`1590166/m 1000/t 600 930/d Mon Tue Thu Sat Sun/w sunny/h cat/H`)
- Scope: Marnie introduces a stray cat and asks whether the farm could use a cat
- Technical contract preserved exactly: pet animation/audio sequence, `catQuestion`, `@` and `%pet` placeholders, and `$h`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: mushuk, mushukcha, fermaga, egasiz, and established Marnie vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,542 / 14,720 unique English records (98.79%), an increase of 0.01 percentage points

### UZ-354 — Data/Events/Farm, Marnie’s stray dog introduction

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-23.json`
- Entries: 1 event record (`897405/m 1000/t 600 930/d Mon Tue Thu Sat Sun/w sunny/h dog/H`)
- Scope: Marnie introduces a stray dog and asks whether the farm could use a dog
- Technical contract preserved exactly: dog animation/audio sequence, `catQuestion` event route, `@` and `%pet` placeholders, and `$h`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: it, kuchuk, fermaga, egasiz, and established Marnie vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,543 / 14,720 unique English records (98.80%), an increase of 0.01 percentage points

### UZ-355 — Data/Events/Farm, Demetrius’s Farm Cave proposal

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-24.json`
- Entries: 1 event record (`65/m 25000/t 600 1200/H`)
- Scope: Demetrius proposes converting the Farm Cave into a controlled habitat for mushrooms or fruit bats
- Technical contract preserved exactly: the `cave` branch, actor sequence, `@` placeholder, and `$h`, `#$b#`, `$e` markers remain unchanged; only visible text is translated
- Glossary decisions applied: Ferma g‘ori, mahalliy turlar, qo‘ziqorinlar, meva ko‘rshapalaklari, and established Demetrius vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,544 / 14,720 unique English records (98.80%), an increase of 0.01 percentage points

### UZ-356 — Data/Events/Farm, Willy’s Training Rod lesson

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-25.json`
- Entries: 1 event/lesson record (`980559/t 600 1130/w sunny/e 739330/j 27/!Skill Fishing 1`)
- Scope: Willy teaches fishing basics, awards one Fishing skill point, and gives the Training Rod
- Technical contract preserved exactly: `${lad^miss}$` gender template, `gainSkill Fishing 1`, `(T)TrainingRod`, reward sequence, and `$h`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: baliq ovlash, ko‘nikmalar, mashq qarmog‘i, oddiy baliqlar, and established Willy vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,545 / 14,720 unique English records (98.81%), an increase of 0.01 percentage points

### UZ-357 — Data/Events/Farm, Gus’s Mini-Jukebox gift

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-26.json`
- Entries: 1 event record (`980558/t 600 1130/w sunny/f Gus 1250`)
- Scope: Gus discusses town life, gives the farmer a Mini-Jukebox, and teaches its crafting recipe
- Technical contract preserved exactly: animation/sound sequence, `itemAboveHead jukebox`, `awardFestivalPrize jukebox`, `addCraftingRecipe Mini-Jukebox`, and `$h`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: salun, Mini-musiqa qutisi, sous, ziravor, chizma, and established Gus vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,546 / 14,720 unique English records (98.82%), an increase of 0.01 percentage points

### UZ-358 — Data/Events/Farm, Elliott’s reading tour departure

- Target: `Data/Events/Farm`
- English source: `unpacked-all/Data/Events/Farm.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-farm-27.json`
- Entries: 1 dialogue/question record (`3912125/f Elliott 3500/O Elliott/t 500 1500/p Elliott/U 8`)
- Scope: Elliott announces a week-long reading tour, asks for a response, and leaves a packing reminder
- Technical contract preserved exactly: three `quickQuestion` options, all `(break)` branches, `\speak`, `\emote`, `\pause`, `%book`, `@`, and `$s`, `$8`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: o‘qish safari, kitob, noyob imkoniyat, anorli konditsioner, and established Elliott vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,547 / 14,720 unique English records (98.82%), an increase of 0.01 percentage points

### UZ-359 — Data/Events/Forest, Shane’s late-night conversation

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-6.json`
- Entries: 1 dialogue/event record (`611944/f Shane 500/t 2000 2400`)
- Scope: Shane talks about failure, drinking, and trying to climb out of a difficult place
- Technical contract preserved exactly: night scene, lantern/animation/audio sequence, `farmerEat 346`, `@` placeholder, caret gender variants, and all `$b` markers remain unchanged; only visible text is translated
- Glossary decisions applied: muvaffaqiyatsizlik, tubsiz chuqur, kelajak, sovuq ichimlik, and established Shane vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,548 / 14,720 unique English records (98.83%), an increase of 0.01 percentage points

### UZ-360 — Data/Events/Forest, Haley’s cow photography

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-7.json`
- Entries: 1 event record (`14/f Haley 2000/z winter/t 1000 1600/w sunny`)
- Scope: Haley photographs cows, enjoys the muddy result, and heads home for a shower
- Technical contract preserved exactly: camera/screen effects, `haleyCows` cutscene, `haleyGarden` mail, `@`, and `$8`, `$9`, `$10`, `$h`, `$l`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: Sigir, tabiat suratlari, taymer, suratga olish, and established Haley vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,549 / 14,720 unique English records (98.84%), an increase of 0.01 percentage points

### UZ-361 — Data/Events/Forest, Leah’s fruit-picking scene

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-8.json`
- Entries: 1 event record (`52/f Leah 1500/p Leah/z winter`)
- Scope: Leah asks the farmer to pick fruit from a tree, shares it, and reflects on friendship
- Technical contract preserved exactly: full movement/animation sequence, `farmerEat 613`, sound/effect commands, trailing dialogue space, and `$6`, `$h`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: meva, daraxt, tatib ko‘rish, san’atdagi faoliyat, and established Leah vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,550 / 14,720 unique English records (98.85%), an increase of 0.01 percentage points

### UZ-362 — Data/Events/Forest, Jas and Vincent at the sewer door

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-9.json`
- Entries: 1 event record (`318560/j 10/t 900 1600/d Tue Wed Fri Sat`)
- Scope: Jas and Vincent investigate the locked sewer door and react to movement inside
- Technical contract preserved exactly: community-center music, animation/sound sequence, movement coordinates, and `$s`, `$u`, `$4`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: Kanalizatsiya, zanglagan kalit, muzey, and established Jas/Vincent vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,551 / 14,720 unique English records (98.85%), an increase of 0.01 percentage points

### UZ-363 — Data/Events/Forest, Vincent’s Spring Onion lesson

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-10.json`
- Entries: 1 event record (`3910979/f Vincent 2000/f Jas 2000/t 600 1700/z summer/z fall/z winter/w sunny`)
- Scope: Vincent demonstrates how to clean a Spring Onion without harming bugs and increases its value
- Technical contract preserved exactly: gender variants, `springOnion*` temporary sprites, movement sequence, `@`, `5x` value, and `$s`, `$h` markers remain unchanged; only visible text is translated
- Glossary decisions applied: Ko‘k piyoz, hasharot, maysa, oltin qiymati, and established Vincent/Jas vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,552 / 14,720 unique English records (98.86%), an increase of 0.01 percentage points

### UZ-364 — Data/Events/Forest, Shane’s cliff intervention

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-11.json`
- Entries: 1 dialogue/question/event record (`3910975/f Shane 1500/e 3910674/t 900 2000/w rainy`)
- Scope: Shane describes his despair, the farmer responds through the `shaneCliffs` question, and Harvey provides emergency treatment and hope
- Technical contract preserved exactly: `shaneCliffs` question/options, hospital transition, actor commands, `@`, and all `$7`, `$s`, `#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: ruhiy salomatlik, davolanish, maslahatchi, shifoxona, and established Shane/Harvey vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,553 / 14,720 unique English records (98.87%), an increase of 0.01 percentage points

### UZ-365 — Data/Events/Forest, Penny’s field-trip guest speaker

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-12.json`
- Entries: 1 dialogue/question/event record (`181928/f Penny 2000/t 900 1600/w sunny/G !IS_PASSIVE_FESTIVAL_TODAY TroutDerby, !SEASON_DAY summer 17 summer 18 summer 19`)
- Scope: Penny introduces the farmer as a guest speaker, teaches natural resources, and fields the children’s questions
- Technical contract preserved exactly: `event_speaker_yes/no` routes, question scores including `-1500`, `^` gender variant, `@`, and all `$h/$s/$u/$4/$q/$r/#$b#` markers remain unchanged; only visible text is translated
- Glossary decisions applied: ekskursiya, tabiiy resurs, minerallar, dengiz mahsulotlari, yog‘och, and established Penny/Jas/Vincent vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,554 / 14,720 unique English records (98.87%), an increase of 0.01 percentage points

### UZ-366 — Data/Events/Forest, Leah’s painting lesson

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-13.json`
- Entries: 1 dialogue/question/event record (`3091462/e 3911124/O Leah/w sunny/t 1130 1400/A leahPaint`)
- Scope: Leah teaches painting techniques, offers two sets of style choices, and reacts to the farmer’s painting
- Technical contract preserved exactly: both `quickQuestion` option sets, six `(break)` branches, `m_painting0/1/2` states, painting sprites, and `$6/$h/$s/$b` markers remain unchanged; only visible text is translated
- Glossary decisions applied: qishloq portreti, pop-art, akril bo‘yoq, mo‘yqalam, tasviriy san’at, and established Leah/Marnie vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,555 / 14,720 unique English records (98.88%), an increase of 0.01 percentage points

### UZ-367 — Data/Events/Forest, Leah’s Kel picnic confrontation

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-14.json`
- Entries: 1 dialogue/question/event record (`54/f Leah 2500/t 1100 1600/z winter/w sunny`)
- Scope: Leah shares a picnic, confronts Kel, and offers the farmer a choice between punching him and reasoning with him
- Technical contract preserved exactly: `LeahInternet`/`choseInternet` and `noPunch` forks, `question fork1`, gender `^` variant, `@`, and all `$6/$a/$h/$l/$b` markers remain unchanged; only visible text is translated
- Glossary decisions applied: piknik, haykal, qo‘llab-quvvatlash, ziravorlar, tanho joy, and established Leah vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,556 / 14,720 unique English records (98.89%), an increase of 0.01 percentage points

### UZ-368 — Data/Events/Forest, Kel’s online-store branch

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-15.json`
- Entries: 1 event branch record (`choseInternet`)
- Scope: Kel reveals he found Leah’s online art store and repeats the confrontation choice
- Technical contract preserved exactly: `question fork1`, `fork noPunch`, `@`, caret gender variant, and `$s/$a/$6/$l/$h/$b` markers remain unchanged; only visible text is translated
- Glossary decisions applied: onlayn san’at do‘koni, haykal, qo‘llab-quvvatlash, tanho joy, and established Leah/Kel vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,557 / 14,720 unique English records (98.89%), an increase of 0.01 percentage points

### UZ-369 — Data/Events/Forest, Leah’s no-punch branch

- Target: `Data/Events/Forest`
- English source: `unpacked-all/Data/Events/Forest.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-forest-16.json`
- Entries: 1 event branch record (`noPunch`)
- Scope: Leah confronts Kel directly, tells him to leave, and exits with the farmer
- Technical contract preserved exactly: `${man^person}$` gender template, `@`, movement/fade sequence, and `$a/$l/$h/$b` markers remain unchanged; only visible text is translated
- Glossary decisions applied: qo‘llab-quvvatlash, qishloqi, tanho joy, and established Leah/Kel vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,558 / 14,720 unique English records (98.90%), an increase of 0.01 percentage points

### UZ-370 — Data/Events/SebastianRoom, Sebastian’s interrupted-work apology

- Target: `Data/Events/SebastianRoom`
- English source: `unpacked-all/Data/Events/SebastianRoom.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/data-events-sebastian-room-1.json`
- Entries: 1 dialogue branch record (`didntLeave`)
- Scope: Sebastian apologizes for pausing the conversation to finish his work
- Technical contract preserved exactly: `stopAnimation Sebastian` and `switchEvent sebastianRoom` remain unchanged; only visible text is translated
- Glossary decisions applied: ishlayotgan narsa, tugatish, kechirim, and established Sebastian vocabulary
- Glossary check: terminology was cross-checked against the canonical Uzbek glossary snapshot already verified from the project page
- Overall textual coverage after this batch: 14,559 / 14,720 unique English records (98.91%), an increase of 0.01 percentage points

## Next safe batch

All 14,720 English `(Target, key)` records now have Uzbek values. Keep the package in maintenance mode for glossary updates, regression checks, and any newly added English content.
