# Arabic translation progress

Canonical working copy: `/Users/antonkrutov/Desktop/StardewTranslationInstaller`

## Pinned inputs

- Target SiteForMods locale: `ar`
- Planned Stardew language code: `ar-vnrevival`
- English assets: `/Users/antonkrutov/Developer/data/stardew-english-unpacked/`
- Supported English game snapshot: Stardew Valley 1.6.15
- English asset count: 187 JSON targets
- English glossary count: 673 entries
- Public glossary endpoint: `https://vnrevival.fun/games/stardew-valley/glossary?locale=ar&offset=0&limit=1000`
- Public glossary snapshot checked: 2026-08-30; 673 stable IDs from `stardew-valley` through `mermaid-show`, all 673 translated
- Public snapshot exactly matched `Documentation/glossary/glossary.ar.json` before the local source-fidelity and Arabic editorial revision
- Structural translation baseline: 14,720 unique `(Target, key)` records across 187 targets, 489 `EditData` changes, and 463 patch files

## Editorial state

- Full glossary source-fidelity and Arabic editorial audit: complete (673 / 673 stable IDs)
- Local glossary editorial corrections: 338 stable IDs; 99 glossary entries additionally received the corpus-wide tanween orthography normalization; both correction paths are idempotent
- Consecutive clean full glossary audits after the last correction: 2 / 2
- Current Arabic glossary SHA-256: `0d7e83561c1bc8d729ca553ed63c94ea475c5cf7c2a474956ee79d655519708e`
- English glossary SHA-256: `b8fe9c8f5aaf9bedc990dabd2ce552d4f334450f03afee9949f75e376ab4bff9`
- Final automatic all-entry audit: 673 English records, 673 Arabic records, 0 warnings, 0 errors
- Public snapshot differences after local editorial revision and orthography normalization: 390 records
- Public glossary publication: not authorized and not performed

## Translation coverage

- Fully translated, editor-reviewed, or explicitly verified technical records: 14,720 / 14,720
- Project progress: 100.000%
- Arabic patch scaffold: complete (463 files, 489 changes, 187 targets, 14,720 records)
- Consecutive clean full translation audits after the last correction: 2 / 2
- Final automatic all-entry audit: 14,720 records, 0 warnings, 0 errors
- Arabic runtime configuration and assets: integrated and release-audited
- Arabic shaping map: 556 contextual glyphs for 160 grapheme clusters
- Four Arabic XNB fonts: built and round-trip verified
- Arabic bidi/shaping adapter: mixed-direction, full-map reachability, and idempotence probe passed
- Fresh SMAPI Arabic launch: `ar-vnrevival`, `SpriteFont1`, `SmallFont`, and Arabic `TitleButtons` loaded; no Arabic patch error
- Batch, glossary, unified-content, shaping-map, static-atlas, and XNB build replay: byte-idempotent
- Swift test suite: 8 / 8 passed
- Release app: built, strict deep signature verification passed, and bundled Arabic files are byte-identical to the canonical source
- Shared release closure: the unfinished Thai package is no longer registered or included by the unified runtime; its work-in-progress source files remain untouched until its own editorial and asset gates pass

Coverage counts only records whose Arabic value has passed source, context,
glossary, language-quality, and token checks. Structural scaffolding and
source-identical English values do not count as translated.

## Resume point

The canonical Desktop checkout is the only worktree and source of truth. The
translation guide plus the Polish and Uzbek implementation runbooks have been
read completely. The public project page and its client bundle identified the
complete glossary endpoint above. The public export and repository snapshot
had the same 673 IDs and values before local editing. The local glossary has now
passed the iterative editorial gate and two consecutive clean full all-entry
audits at the hashes recorded above. The Arabic patch scaffold now matches the
14,720-record structural baseline, and all records have completed the first
source-and-context editorial pass. Batches 0001–0110 cover canonical names,
bundle labels, enchantments, island map labels, movie concessions, speech
bubbles, tools, reusable lexicon fragments, achievements, clothing and fish
data, hats, relationship and movie text, special orders, Qi challenges,
schedule dialogue, the reviewed dialogue sets for Gil, rainy days, Mr. Qi, the
Dwarf, Krobus, the Wizard, Sandy, Leo on the mainland, Jas, Marnie, Evelyn,
Clint, Willy, Jodi, Linus, Caroline, Pierre, Robin, Demetrius, Lewis, Pam,
Shane, Harvey, Abigail, Haley, Sebastian, Alex, Sam, Maru, Emily, Penny, and
Elliott, Leah, the movie catalog, quests, the living-off-the-land tip channel,
event interface strings, the extra-dialogue set, the Egg Festival, the Flower
Dance, the Luau, the Festival of Ice, the Stardew Valley Fair, Spirit's Eve,
the Feast of the Winter Star, the Dance of the Moonlight Jellies, and all
location event sets. Secret notes, library books, cooking recipes, gift tastes,
all mail sets, all movie reactions, all map-string sets, all location-string sets, the 1.6 string sets,
the user-interface sets, and the first object-string sets are also
reviewed. Technically preserved chair, paint, animation, aquarium, credits,
hair, and internal event metadata are included in the reviewed count. Batches
0001–0484 are applied and synchronized with the editorial ledger. The third
editorial pass corrected contextual meaning, glossary labels, UI imperatives,
gender and number agreement, the barn/coop instruction for the ostrich
incubator, the Stingray name, and the non-romantic wording in Krobus's
housemate dialogue. It also normalized the legacy `اً` combining-mark order
throughout 3,162 player-facing records (5,824 occurrences) and 99 glossary
entries (128 occurrences). Two consecutive full all-entry audits after the
last correction found no new issue. The Arabic runtime entry, exact locale
gates, static language/title atlases, four XNB fonts, 556-entry shaping map for
160 clusters, and bidi adapter are integrated and verified. The final Arabic
release audit reports 0 warnings and 0 errors; batch, glossary, orthography,
font, and shaping-map replay checks are byte-idempotent. Swift tests, the
release build, strict signature verification, and source-to-bundle byte
comparison passed.
The earlier fresh SMAPI launch activated `ar-vnrevival` and loaded its two
locale fonts and `TitleButtons` without an Arabic patch error. The unfinished
Thai package is now excluded from the generated runtime and `PackageConfig`
until its own translation and font assets are complete, so it no longer blocks
the shared Arabic release.
