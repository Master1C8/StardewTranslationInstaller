# Thai translation progress

Canonical working copy: `/Users/antonkrutov/Desktop/StardewTranslationInstaller`

## Pinned inputs

- Target locale: `th`
- Planned Stardew language code: `th-vnrevival`
- English assets: `/Users/antonkrutov/Developer/data/stardew-english-unpacked/`
- English asset count: 187 JSON targets
- English glossary count: 673 entries
- English glossary SHA-256: `b8fe9c8f5aaf9bedc990dabd2ce552d4f334450f03afee9949f75e376ab4bff9`
- Public glossary endpoint: `https://vnrevival.fun/games/stardew-valley/glossary?locale=th&offset=0&limit=1000`
- Public endpoint fetched: 2026-08-30, 673 entries
- Public endpoint response SHA-256: `93d44a13a84d94e291e0bde4ae2394afcbd3d21ed47abc239897a24d383e7ed0`
- Initial endpoint/local/SiteForMods Thai glossary comparison: 0 differing stable IDs
- Structural translation baseline: 14,720 unique `(Target, key)` records across 187 targets and 151 patch files

## Editorial state

- Full initial glossary source-fidelity and Thai editorial audit: complete, entries 1–673
- Confirmed corrections are recorded in `Documentation/thai-glossary-editorial-overrides.json`
- Editorial corrections: 120 stable IDs
- Final Thai glossary SHA-256: `6f7ab0493cb142465fe919a23a0ea90f62cd699fd022c8e37f87e4b184a77029`
- Clean full glossary audits after the last correction: 2 / 2
- Automated glossary audit: 673 entries, 0 errors, 0 warnings
- Editorial override replay: idempotent
- Public glossary publication: not authorized and not performed

## Translation coverage

- Fully translated and editor-reviewed records: 9,335 / 14,720
- Reviewed editorial batches: 240
- Thai scaffold files present in `ModPayload`: 151 / 151
- Full incremental-project audits through 63%: 0 errors, 0 warnings
- Thai runtime configuration integrated: no
- Thai XNB fonts built and round-trip verified: no
- Release verification: pending
- Project progress: 63.417%

## Resume checkpoint

1. Continue with `th-long-0243` in `Characters/Dialogue/Alex`. Completed sections also include speech bubbles, achievements, animation descriptions and animation reference data, aquarium fish and aquarium reference data, `Strings/1_6_Strings`, generic marriage dialogue, marriage dialogue for Haley, Alex, Harvey, Penny, Sam, Elliott, Maru, Emily, Leah, Abigail, Shane, and Sebastian, and the dialogue files for Abigail, Leo, Leo Mainland, Dwarf, Mister Qi, Krobus, Sandy, Marnie, Jas, Clint, Wizard, George, Evelyn, Caroline, Vincent, Kent, Gus, Willy, Jodi, Linus, Pierre, Robin, Pam, Lewis, Demetrius, Elliott, Emily, Haley, Harvey, Maru, Penny, Sam, Sebastian, Shane, and Gil. Extra dialogue is complete through the summit closing messages; its two Skull Cavern level-100 event scripts remain pending. `Strings/Characters`, `Strings/Events`, `Strings/Quests`, `Strings/UI`, `Strings/SpecialOrderStrings`, `Strings/Locations`, `Data/mail`, `Data/Quests`, `Data/NPCGiftTastes`, `Data/SecretNotes`, `Strings/MovieReactions`, `Strings/Notes`, big craftables, bundles, the TV cooking and tip channels, cooking recipes, crafting recipes, chair tiles, hair data, paint data, credits, the technical furniture table, festival reference data, and movies are complete. `Strings/Furniture` is reviewed through 588 of 591 entries; its final 3 records should be combined with a later target boundary. Keep each short batch at 40–80 records and each long batch at 15–30 records.
2. Run `node Scripts/audit-thai.mjs` after every additional full percentage point and after each completed file or semantic section.
3. Keep the glossary publication checkpoint unchanged: publication is not authorized and must not be performed.
