# Urdu translation progress

Canonical working copy: `/Users/antonkrutov/Desktop/StardewTranslationInstaller`

## Pinned inputs

- Target SiteForMods locale: `ur`
- Planned Stardew language code: `ur-vnrevival`
- English assets: `/Users/antonkrutov/Developer/data/stardew-english-unpacked/`
- Supported English game snapshot: Stardew Valley 1.6.15
- English asset count: 187 JSON targets
- English glossary count: 673 entries
- English glossary SHA-256: `b8fe9c8f5aaf9bedc990dabd2ce552d4f334450f03afee9949f75e376ab4bff9`
- Public glossary endpoint: `https://vnrevival.fun/games/stardew-valley/glossary?locale=ur&offset=0&limit=1000`
- Public glossary snapshot rechecked: 2026-08-28, 673 stable IDs, all 673 translated, with no missing or extra entries
- The public CMS snapshot and previously committed SiteForMods baseline predate the completed editorial revision. After the full source-fidelity and literary audit, the local SiteForMods canonical `ur` data was updated to the reviewed 673-entry revision (301 corrected terms and 667 corrected meanings); the public CMS value for `leo` still contains Unicode replacement characters in `Ginger Island`. CMS publication was not authorized or performed.
- Reviewed Urdu glossary SHA-256: `7294cea3451144f1066c8a09e6eadda4d9066b46a4aab6021d1caa7c88a9bb82`
- Structural translation baseline: 14,720 unique `(Target, key)` records across 187 targets, 489 `EditData` changes, and 463 patch files

## Editorial state

- Full initial glossary source-fidelity and Urdu editorial audit: complete (673 / 673)
- Clean full glossary audits after the last content correction: 2 of 2
- Automated glossary audit: 0 errors, 0 warnings
- Editorial override application: idempotent (identical SHA-256 on consecutive runs)
- Public glossary publication: not authorized and not performed

## Translation coverage

- Fully translated or technically justified and editor-reviewed records: 14,720 / 14,720
- Project progress: 100.000%
- Urdu patch scaffold files present: 463 / 463
- Urdu patch files integrated through root `Include` changes: 463 / 463
- Urdu runtime configuration integrated: yes (`ur-vnrevival`, dedicated SpriteFonts/BMFont, button, and title atlas)
- Urdu shaping and bidirectional adapter: built; all 282 contextual glyphs and mixed RTL/LTR samples pass the automated runtime probe
- Urdu RTL behavior verified in a fresh SMAPI session: yes (2026-08-28; shaping adapter enabled for 15 text methods, `ur-vnrevival` active, dedicated `SpriteFont1`, `SmallFont`, and `TitleButtons` loaded, title-menu labels visually checked, no SMAPI `WARN`/`ERROR`)
- Urdu XNB fonts built, round-trip verified, character-map sorted/aligned, and generator-idempotent: yes
- Consecutive clean full 14,720-record editorial audits: 2 / 2
- Integrated release audit: 0 errors, 0 warnings
- Swift tests: 8 / 8 passing on the clean `908adba` release snapshot
- Release app: built from the clean `908adba` snapshot and passed `codesign --verify --deep --strict`

Coverage counts only records whose Urdu value has passed source, context,
glossary, language-quality, and token checks. Structural scaffolding and
source-identical English values do not count as translated.

## Completion gate

- Every record translated or technically justified and editor-reviewed.
- Two consecutive full 14,720-record editorial audits find no new objective issue.
- Automated release audit reports 0 errors and 0 warnings.
- All JSON, keys, tokens, placeholders, event structure, includes, and exact locale gates pass.
- Generators are idempotent.
- Urdu fonts build and pass XNB round-trip validation.
- Swift tests, release build, and strict code-signature verification pass.
- The final verified Urdu release snapshot is commit `908adba`; unrelated in-progress locale work in the shared Desktop working tree is outside this verification.

## Resume point

Translation and iterative editorial review are complete. The release audit
proves exactly 463 files, 489 changes, 187 targets, and 14,720 unique records;
all locale gates are `ur-vnrevival`, with 0 errors and 0 warnings. Reviewed
coverage includes 13,845 translated records and 875 technically justified
non-player-facing or internal-identifier records. All 473 review batches passed
an immediate consecutive replay with zero changes; the
furniture, shirt, large craftable, weapon, hat, shared character-string,
special-order, engagement, schedule, shared marriage-dialogue, Krobus
marriage-dialogue, Krobus marriage-dialogue, Leah marriage-dialogue, Abigail
marriage-dialogue, Sebastian marriage-dialogue, Shane marriage-dialogue, and
Emily marriage-dialogue, Maru marriage-dialogue, and Elliott marriage-dialogue
catalogs, Penny marriage-dialogue, and Harvey marriage-dialogue are fully
reviewed; Alex and Haley marriage-dialogue catalogs are also fully reviewed,
Sam marriage-dialogue, Vincent dialogue, and Kent dialogue catalogs are fully
reviewed; George, Jas, Marnie, and Evelyn dialogue catalogs are also fully
reviewed; Clint and Willy dialogue catalogs and Secret Notes are fully
reviewed; library notes, the cooking channel catalog, and NPC gift tastes are
fully reviewed. Jodi, Linus, Caroline, Pierre, Robin, Demetrius, Lewis, Pam,
Shane, Harvey, Abigail, Haley, Sebastian, Alex, Sam, Maru, Emily, Penny,
Elliott, and Leah dialogue catalogs are also fully reviewed; the movie, quest,
Livin' Off The Land tip-channel, shared event-string, and extra-dialogue
catalogs are fully reviewed. The Desert Festival player-loss event is
technically justified; the spring 13, spring 24, summer 11, summer 28, fall 16,
fall 27, winter 8, and winter 25 festival catalogs are fully reviewed. Town,
farm, Sebastian's room, forest, farmhouse, mountain, beach, saloon, Haley's
house, Leah's house, seed shop, Sam's house, science house, temporary
performance, Josh's house, Elliott's house, hospital, animal shop, archaeology
house, bus stop, Island South, mine, railroad, trailer, bathhouse pool, manor
house, large trailer, wizard house, woods, abandoned JojaMart, backwoods, boat
tunnel, community center, fish shop, Harvey's room, island hut, Island North,
Island West, Qi's walnut room, Sandy's house, sewer, and sunroom event catalogs
are fully reviewed. All event catalogs, the mail catalog, the movie-reaction
catalog, the shared map-inspection strings, the shared location strings, the
Stardew 1.6 shared string catalog, the shared UI catalog, and the shared object
catalog and `Strings/StringsFromCSFiles` are complete. The clean release snapshot
passes all eight Swift tests, rebuilds all four Urdu XNB fonts with successful
round-trip verification, leaves the font/static-label/content generators
idempotently clean, builds the release app, and passes strict signature
verification. A fresh SMAPI visual/log session activated `ur-vnrevival`, enabled
the Urdu shaping and bidi adapter, loaded the dedicated Urdu fonts and
`TitleButtons`, displayed the shaped Urdu title-menu labels, and recorded no
`WARN` or `ERROR`; the pre-QA Burmese startup preference was restored afterward.
