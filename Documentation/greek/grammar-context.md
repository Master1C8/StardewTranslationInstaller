# Greek dynamic grammar evidence and dependencies

English native behavior was inspected through locally decompiled Stardew Valley
1.6.15 code, not another localization. The temporary complete decompilation is
`/private/tmp/stardew-greek-source/decompiled/`. It was produced with ILSpy
9.1.0.7988 from the installed `Contents/MacOS/Stardew Valley.dll`.
No decompiled game source is distributed in this repository.

## Verified and translated

- `PondQueryMenu.UpdateState`: for a request of one item, the quantity argument
  falls back to `PondQuery_StatusRequestOneCount` after `Lexicon` returns an empty
  article. Custom locales do not get English pluralization. Greek requests use
  the uninflected, quoted item name with `×{quantity}`. The fallback is therefore
  `1`, with a narrowly scoped validator exception for that exact key and value.
- `BirthingEvent`: `Chat_Baby` receives the child's gendered noun and pronoun.
  Both Greek child nouns, `αγόρι` and `κορίτσι`, are neuter; both pronoun fragments
  are `το`. The template reads `Ονόμασαν {3} μωρό {4}`. All birth-event variants
  were reviewed with these forms.
- `GameLocation`: the `Chat_HouseUpgrade` possessive argument denotes the player
  requesting construction. Greek places `του` or `της` after `σπίτι`.
- `ShopLocation` and `FishShop`: `GenericPlayerTerm` is a greeting, hence the
  vocative `αγρότη`; the female-player override is `αγρότισσα`. It is emitted as
  a second, Greek-only `EditData` patch with `PlayerGender: Female`, so the source
  gains no control delimiters. The token and values are documented in the
  [official Content Patcher token guide](https://github.com/Pathoschild/StardewMods/blob/develop/ContentPatcher/docs/author-guide/tokens.md#playergender).
  Verify this override in live male/female and split-screen QA before release.
- `CharacterCustomization`: `NameChange_EasterEgg6` receives an empty Greek
  article and an item label. Both placeholders are retained; the empty article
  directly precedes the quoted label.
- `DesertFestival`: racer placeholders are localized names from
  `Strings/1_6_Strings:Racer_0` through `Racer_4`. Explicit `δρομέας` in Greek
  templates carries the inflection while the quoted name stays unchanged.
- `ProfileMenu`: `BirthdayOrder` receives the day and a standalone season label.
  The compact season-label/day display preserves both placeholders.

## Mandatory dependencies for later translation and release

- The `RandomPositiveAdjective_Child`, `_AdultMale`, and `_AdultFemale` lists are
  selected by **speaker** but used by `PurchasedItem_5_Cooking` to describe Pierre
  as a chef. All three Greek lists are masculine nominative. The cooking
  template must agree with that referent, and its `{3}` article is empty in Greek.
- `RandomPositiveAdjective_PlaceOrEvent` is neuter. The native token resolver
  supplies it to `ShopMenu.cs.11464` via `Data/Shops`. Use an explicit neuter
  referent, such as `αντικείμενο`, for its dynamic item label.
- Delicious, negative-food and slightly-positive-food adjectives are neuter.
  `PurchasedItem_1_QualityHigh/Low` and their `_Willy` counterparts must use a
  neuter smell referent (`άρωμα`, not feminine `μυρωδιά`); rude item reactions and
  `NPC.cs.4135/4138` must also have neuter agreement. Negative-item nouns are all
  neuter singular. All random alternatives retain the original `#` count.
- `SeedShop.cs.9701` is sometimes substituted instead of an empty item article
  when produce is purchased. Its English value is `a fresh`; translate it jointly
  with all purchased-item templates, not as an isolated article.
- Native `Utility.AOrAn` returns English
  `a`/`an` even in custom locales. `Multiplayer.receiveChatInfoMessage` uses it
  for the two construction announcements. The only native callers of that
  utility are these `aOrAn:` chat substitutions. `ModEntry.BeforeGreekArticle`
  now returns an empty article only for exact `el-vnrevival`; the two completed
  Greek construction templates provide their own inflected noun and retain
  every placeholder. `python3 Scripts/greek-runtime-probe.py` passed 48 isolation
  cases, six Greek cases, and both rendered announcements using real Harmony
  and native game methods. The probe uses a temporary apphost copy retargeted
  to its own entry assembly and the matching bundled .NET 6 runtime. It opens
  neither the game nor the installer and writes nothing into the installed game.
  The switcher payload was rebuilt successfully with
  `DOTNET_BIN=unavailable-dotnet ./Scripts/build-language-switcher.sh`.
  Live Greek runtime QA remains a release gate.

This file records contextual evidence and pending checks; it does not establish
release readiness or replace the two final full-corpus editorial audits.

Further native evidence from CS-string batches 30–51 (2026-09-05):

- The purchased-item templates and their four dependent CS fragments described
  above are now fully batch-reviewed; they are no longer pending translations.
- `Dialogue.TranslationKey` is a public readonly field, so any future Greek-only
  realization fix can identify an original dialogue. `checkForSpecialCharacters`
  chooses random adjectives/nouns itself; preserve all native RNG calls/order.
  The unfinished adjective/noun block is CS rows 48–90. No inflection patch or
  inflection data for it has been implemented yet.
- CS rows 404–447 (except the previously completed 428–429) remain untranslated.
  `NPC.loadCurrentDialogue` builds gift-taste sentences from either a localized
  NPC display name or `my {relationship}`. Relationship strings come from
  `CharacterData.FriendsAndFamily` via TokenParser; `{0}` is not uniformly a bare
  name. Templates need nominative, accusative, and genitive contexts. Do not
  assume the first argument always represents the same grammatical form.
- CS row 652, `DiaryEvent.cs.6664`, remains untranslated pending a native name
  issue: `DiaryEvent.setUp` passes the internal `NPCname` directly to LoadString,
  unlike `DescriptionElement`, which resolves NPC substitutions with
  `NPC.GetDisplayName`. No fix has yet been made for this deferred row.
- `Farmer.getTitle` is only called by local-player InventoryPage and SkillsPage
  in the base game. The authored rank variants therefore use PlayerGender;
  Farmboy/Farmgirl already have native separate keys. Common-gender Greek titles
  such as Γεωπόνος, Κτηνοτρόφος, Σκαπανέας, Μικροκτηματίας need no variant.
- `Event.readFortune` uses the localized `displayName[0]` for initial hints.
  Birthday text concatenates one common prefix and an NPC-gender suffix. The
  suffix's final compliment describes the PLAYER, so its female translation is
  selected independently of the NPC-gender branch.
- `SocialPage.drawFarmerSlot` loads Single_Female for a single farmer regardless
  of gender when gendered-character translations are off. Both single-status
  Greek keys use `(χωρίς σχέση)` and work in both NPC and farmer rows. Native
  boyfriend/girlfriend branches refer specifically to the current player.
- Native spouse nickname selection reserves Hunky and Handsome for male farmers.
  The Greek forms are male vocatives; remaining nicknames use affectionate nouns.
  Hat Mouse's future phone/mail text must match the directly authored `πόκε`
  nickname and deliberate broken Greek speech in ShopMenu.cs.11494.
- `GameLocation` displays the invented Dwarvish gravestone only when the player
  cannot understand Dwarves. Its readable counterpart is
  `Strings/Locations:Town_DwarfGrave_Translated`. Preserve the invented-language
  inscription as documented in batch 41 and translate the readable counterpart.
- `JunimoNoteMenu.draw` renders CS.10786 only with `junimoText:true` and explicitly
  uses LoadBaseString for non-Latin locales. `SpriteText` maps its Latin character
  codes to Junimo sprite glyphs. Batch 41 preserves this cipher/layout input;
  it is not ordinary player-visible English. Do not translate its bytes into
  Greek letters, which have no matching glyphs in the native cipher atlas.
- `DescriptionElement.loadDescriptionElement` replaces slashes with spaces for
  the `Dialogue.cs.7*` / `.8*` word lists. SlayMonsterQuest uses the color keys
  795–810 through that path. Their reviewed Greek forms retain the original
  slash segmentation and use neuter adjectives; the eventual quest template
  must supply an agreeing referent.
- `FishingQuest` nests four population reasons and six size comparisons through
  DescriptionElement. The reviewed Greek size prefix is `στο μέγεθος{0}` and
  each suffix supplies a complete genitive article/noun, replacing English a/n
  assembly. Item substitutions resolve localized display names. The native
  fisherman/female-enthusiast gender block and all numerical objectives remain.
- Modern `Data/Machines` Keg rule Default_CoffeeBeans requires five object 433
  Coffee Beans and references Object.cs.12721 as InvalidCountMessage. This is
  the verified context for `Απαιτούνται 5 κόκκοι καφέ.`
- Native SpecialItem ID 99 loads Large/Deluxe Pack and supplies maxItems to
  CS.13094, confirming its Greek backpack and inventory-slot terminology.

All of these are partial-corpus checks. Greek package integration, fonts, live
QA and the two complete final editorial passes are still outstanding.

### Quest composition continuation (batches 54–60)
- ItemDeliveryQuest recipe nouns 13385–13396 carry their own article after Greek Ετοιμάζω; 13383 explicitly requests neuter προϊόν, so optional one endings agree. Native 13400 is passed as an unused extra format argument to 13383 but translated separately. Weekday 13373 receives abbreviations 3042–3048 and NPC display name; Greek request labels avoid inflecting either.
- Harvey 13446 accepts twelve condition fragments with accusative articles after για. Generic relief template 13500 uses εντριβές plus twelve full locative body-part phrases; this supports singular and plural body parts without runtime branching. Non-edible item placement uses explicit αντικείμενο.
- ResourceCollectionQuest 13667 uses feminine genitive adjective fragments before ποιότητας. Robin material reply uses a label for ξύλο/πέτρα. Objective and friendship reward labels preserve display names without case conversion.
- SlayMonsterQuest 13734 inserts parent-event fragment, colour and trouser type. Greek parent events are accusative after Θυμάμαι; singular παντελόνι takes καλό/μεταξωτό/ντρίλινο. The colour is quoted after σε χρώμα, supporting all sixteen Dialogue.cs.795–810 values after native slash removal, including ουράνιο τόξο. 13732/13733 are neuter plural after μικρά. Wizard beast synonyms are all neuter plural after αυτά τα.
- Frost Jelly / Frost Jellies: Ζελέ του Παγετού (same singular/plural form). Apply this to later monster-name assets. Duggy remains glossary Ντάγκι; Green/Red Slimes are Πράσινες/Κόκκινες Γλίτσες.

### Late StringsFromCSFiles context (batches 61–71)
- FishingRod.draw converts fish size from inches to rounded centimetres for every non-English locale, including custom el; 14083 uses `{0} εκ.`. This is a required label adjustment to the existing native numeric conversion.
- InputButton.ToString loads keyboard-label values from enum names after removing Oem. Familiar physical key legends retain conventional spelling; opaque legacy identifiers are documented technical preservations. Other actions/directions localized. Semicolon and Question labels include explicit `;` and `?` glyphs to avoid Greek punctuation ambiguity.
- Native ItemRecovery uses Lexicon.makePlural, which returns the original display name unchanged for all non-English locales. Greek singular/stack wrappers explicitly say αντικείμενο/αντικείμενα. Native SocialPage chooses housemate label using NPC gender.
- DesertTrade Data/Shops references DesertTrader1 for the current shopper. Added Greek female override ταξιδιώτισσα; default ταξιδιώτη. Existing sir/miss variants remain separately translated. No runtime code needed.
- New item terminology: Void Ghost Pendant = Μενταγιόν Φαντάσματος του Κενού; Horse Flute = Φλάουτο Αλόγου; Qi Seasoning = Καρύκευμα Τσι; Monster Musk = Μόσχος Τεράτων; Squid Ink Ravioli = Ραβιόλι με Μελάνι Καλαμαριού.
- Film/show consistency: The Happy Junimo Show = Το Σόου του Χαρούμενου Τζουνίμο; The Zuzu City Express = Το Εξπρές της Πόλης Ζούζου; Exploring Our Vibrant World = Εξερευνώντας τον Γεμάτο Ζωή Κόσμο μας. Junimo Kart music reuses the previously reviewed UI level titles exactly. Crane Game = Παιχνίδι με Δαγκάνα.
- Fishing broadcast acronym joke: F.I.B.S. becomes Ψ.Ε.Μ.Α. (Ψαρευτική Ενημέρωση Μέσω Αναμετάδοσης), retaining the fishing-information broadcast-service concept and a name meaning lie. Native TV.getFishingInfo appends weather/water-body labels independently after commas.
- Fresh_Prefix applies only to Object orderData QI_COOKING. Greek `{0} (φρέσκια παρασκευή)` is invariant for all food genders/numbers, without implying the item was cooked a literal moment ago.
- Island Trader brother/sister lines use deliberate παλακαλώ to convey source wiz pronunciation quirk. Other clipped barter speech retained. Last-day green-bar clue does not name the hidden material.

### Resolved gift-hint and diary grammar (batches 72–74)
- The previously deferred CS404–447 gift block is complete. Every reference is written in nominative, avoiding automatic Greek name declension. Relative_Mom etc. are nominative fragments; native referent gender selects `ο {0} μου` or `η {0} μου`. All 21 actual FriendsAndFamily relations reviewed in full composed sentences. Relative_LittleBabyGirl is μικρή κορούλα, keeping the female article grammatical; husband/wife use colloquial άντρας/γυναίκα.
- Exact Greek runtime prefixes cover the first substitution for 18 gift keys and DiaryEvent.cs.6664. They resolve raw NPC IDs or current localized display names using native CharacterData/NPC.GetDisplayName and add the nominative article from native gender. Existing relation articles remain unchanged. No NPC records or random draws are modified.
- Native Game1.LoadStringByGender formats independently after splitting the template by `/`, so it must be patched separately from all four LocalizedContentManager.LoadString formatting overloads. Its gender argument is SPEAKER gender, while 4079/4080 selection comes from the REFERENT. The patch does not infer referent gender from the speaker.
- Bundled Harmony generic `__args` mutation did not update the formatted arguments in the native probe. Replaced with explicit `ref object sub1` and `ref object[] substitutions`; array copies preserve caller-owned substitutions. All 6111 native overload/isolation cases pass (5432 non-Greek, 679 Greek), plus 21 full relation sentences and prior construction-article cases.
- DiaryEvent.cs.6664 now resolves its raw internal NPC name to Greek and reads `Τον τελευταίο καιρό, {0} κι εγώ περνάμε πολύ χρόνο μαζί...`, so its name also stays nominative. This resolves the previous CS652 deferment.
- Only CS48–90 (20 random adjectives and 23 nouns used by %adj/%noun) remain deferred in StringsFromCSFiles. All other CS entries are reviewed.

### Resolved random adjective/noun grammar (batches 75–76)
- All 1673 StringsFromCSFiles entries are now reviewed. The 20 random adjectives and 23 nouns carry explicit model-authored forms in `greekRandomForms`: adjective accusatives [masculine, feminine, neuter, optional after]; noun [gender index 0/1/2, accusative]. Chalky and crusty use post-nominal με υφή κιμωλίας / με κρούστα; other adjectives precede the noun. Drumstick is interpreted as musical μπαγκέτα in this standalone random-word list.
- greek-batches.py validates the complete 43-form set and generates Greek-only grammar-data.json plus grammar-load.json. The latter Load action exposes VNRevival/GreekGrammar. Final integration must Include grammar-load.json exactly once; grammar-data.json is data, not a secondary patch.
- Exact Greek postfix on native Dialogue.checkForSpecialCharacters is restricted to the four verified TranslationKey paths. It inflects the selected phrase after all original random draws, preserving selection order and RNG state. Dream and giant-hand transformation use accusative agreement; quoted Maru celestial names use capitalized nominatives.
- Native probe passed 720 before/after RNG and isolation cases (640 non-Greek, 80 Greek), all 460 adjective/noun combinations, 46 celestial-name cases and 9 independent agreement examples. Minimal uninitialized Game1/Farmer/Dialogue fixtures avoid launching the game; game static values are restored. Live Content Patcher loading and visual QA are still pending with the complete package.
