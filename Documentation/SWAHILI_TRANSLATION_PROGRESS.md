# Swahili Translation Progress

## Scope and source contract

- Locale: `sw-vnrevival` (`Kiswahili`)
- Canonical record universe: 14,720 unique `(Target, key)` records across 187 English Stardew Valley 1.6.15 assets
- Source text: English base assets only
- Russian and Polish packs: structure and packaging references only
- Canonical glossary: 673 `sw` terms, kept byte-for-byte equal to the current SiteForMods glossary layer
- Progress formula: translated records + structurally reviewed non-text records + exact canonical glossary terms + documented preserved values, divided by 14,720

## Current checkpoint

- Reviewed: 14,720 / 14,720
- Overall progress: 100%
- Structural or glossary errors: 0
- Translation JSON files: 151
- Content Patcher includes: 151 / 151
- Event records under skeleton validation: 308
- Canonical glossary terms: 673 / 673 synchronized; exact-term dry run has 0 pending replacements
- Editorial verification: two consecutive package-wide audits completed with 0 warnings and 0 errors

## Completed areas

- Swahili package scaffold, locale registration, installer configuration, language selector and title-button atlases
- Canonical Swahili glossary synchronization and exact-term application
- Core UI and system strings
- `Strings/Objects`: 1,532 / 1,532
- `Strings/Weapons`: 134 / 134
- `Data/Fish`: 74 / 74
- `Data/Monsters` slice: 51 / 51
- `Data/Achievements`: 39 / 39
- `Strings/Buildings`: 69 / 69
- `Strings/Tools`: 54 / 54
- `Strings/Pants`: 38 / 38
- `Strings/MovieConcessions`: 48 / 48
- `Data/Bundles`: 31 / 31
- `Data/hats`: 122 / 122 visible names and descriptions; technical fields preserved
- `Data/NPCGiftTastes`: all five visible reaction fields for 34 NPCs; five universal ID lists preserved
- `Data/SecretNotes`: 28 textual notes translated; ten image directives preserved
- `Data/TV/CookingChannel`: 32 / 32
- `Data/TV/TipChannel`: 64 / 64
- `Strings/BigCraftables`: 255 / 255 remaining source-identical records reviewed
- `Strings/Furniture`: 591 / 591
- `Data/Furniture`: 645 / 645; visible names synchronized through localized text references and technical fields preserved
- `Strings/Shirts`: 397 / 397 names and descriptions
- `Strings/Events`: 26 / 26
- `Data/Quests`: 66 / 66; visible titles, descriptions, objectives and completion dialogue translated with technical fields preserved
- `Data/CookingRecipes` and `Data/CraftingRecipes`: technical formulas reviewed and preserved
- `Strings/credits`: visible headings and links translated; names/directives reviewed and preserved
- Engagement, rain, simple non-villager, Gil, Mister Qi, Dwarf, Sandy, Leo, Leo mainland, Wizard, Vincent, Krobus, George, Kent, Gus, Marnie, Jas, Willy, Clint, Evelyn, Caroline, Jodi, Linus, Lewis, Pam, Harvey, Shane, Demetrius, Pierre, and Robin dialogue files
- Complete villager dialogue files: Abigail, Haley, Sebastian, Alex, Sam, Maru, Penny, Emily, Elliott, and Leah
- Complete spouse dialogue files: Alex, Haley, Harvey, Sam, Penny, Elliott, Maru, Emily, Shane, Sebastian, Abigail, Leah, and Krobus
- Complete shared spouse dialogue file: `Characters/Dialogue/MarriageDialogue`
- `Strings/Notes`: 22 / 22; the constructed Dwarvish cipher is explicitly preserved
- `Data/ExtraDialogue`: 147 / 147, including both Skull Cavern event scripts
- `Strings/Movies`: 83 / 83
- `Strings/MovieReactions`: 266 / 266
- `Strings/SpecialOrderStrings`: 144 / 144
- `Data/Festivals/spring13`: 80 / 80
- `Data/Festivals/spring24`: 82 / 82
- `Data/Festivals/summer11`: 102 / 102
- `Data/Festivals/summer28`: 84 / 84
- `Data/Festivals/fall16`: 91 / 91
- `Data/Festivals/fall27`: 89 / 89
- `Data/Festivals/winter8`: 96 / 96
- `Data/Festivals/winter25`: 91 / 91
- `Data/mail`: 179 / 179, including gifts, recipes, unlocks, quests, festival notices, pass-out notices, spouse letters, special-order rewards, and 1.6 notices
- All 308 records across every `Data/Events/*` target, including `Farm`, `Forest`, `Town`, `Mountain`, `Beach`, `Saloon`, all homes, Ginger Island, the Desert Festival, Community Center and Joja branches
- All 32 schedule dialogue files
- All remaining canonical system, location, map, menu, minigame, tailoring, special-order, movie, festival and event strings
- All source-identical technical values reviewed and classified as automatic, glossary-preserved, or explicitly preserved

## Completed quality gates

- Eight Swift/XCTest cases passed with zero failures
- Release macOS application built successfully with `Scripts/build-app.sh`
- `codesign --verify --deep --strict` and `plutil -lint` passed for the generated app bundle
- Built application contains all 151 Swahili translation files
- Intended Swahili and integration files synchronized into the dirty Desktop working tree without overwriting unrelated user changes
- Do not publish glossary changes or launch the installer against a live game without explicit user direction

## Post-release UI fit pass

- Shortened the inventory date template so even the longest canonical season name fits the summary panel
- Shortened fixed-width character-creation labels for favorite thing, animal preference, eye/hair/pants colors and accessory
- Shortened other high-risk fixed-width labels in tailoring, pond, co-op, shipping, mobile options and title-return menus
- Added package-audit length budgets for 20 compact UI records and the longest possible inventory date
