# Persian translation progress

Canonical working copy: `/Users/antonkrutov/Desktop/StardewTranslationInstaller`

## Pinned inputs

- Target SiteForMods locale: `fa`
- Stardew language code: `fa-vnrevival`
- English assets: `/Users/antonkrutov/Developer/data/stardew-english-unpacked/`
- Supported English game snapshot: Stardew Valley 1.6.15
- English asset count: 187 JSON targets
- English glossary count: 673 entries
- English glossary SHA-256: `b8fe9c8f5aaf9bedc990dabd2ce552d4f334450f03afee9949f75e376ab4bff9`
- Public glossary endpoint: `https://vnrevival.fun/games/stardew-valley/glossary?locale=fa&offset=0&limit=1000`
- Public glossary snapshot checked: 2026-08-28, 673 entries, all 673 translated
- Reviewed Persian glossary SHA-256: `ea3b9ad4e652d84ca89c108926ab057664d81f812b4e69904a2a3f2098964464`
- Editorial overrides SHA-256: `b137b23a0fe8957621443a507bbcc4612bc6a953d2f312a17e019c946e502828`
- Structural baseline: 14,720 unique `(Target, key)` records across 187 targets, 489 `EditData` changes, and 463 patch files

## Editorial state

- Full glossary source-fidelity and Persian editorial audit: complete (673 / 673)
- Clean full glossary audits after the last content correction: 2 of 2
- Full 14,720-record editorial gate after the last content correction: 2 of 2 clean passes
- Additional editorial pass: 178 correction declarations affecting 176 unique records in batches 0464–0468
- Automated translation audit: 0 errors, 0 warnings
- Automated glossary audit: 0 errors, 0 warnings
- Editorial override application: idempotent
- Public glossary publication: not authorized and not performed

## Translation and runtime coverage

- Fully translated or technically justified and editor-reviewed records: 14,720 / 14,720
- Project progress: 100.000%
- Persian patch files present and integrated through root `Include` changes: 463 / 463
- Persian runtime configuration: integrated as `fa-vnrevival`
- Persian shaping map: 381 contextual glyphs across 108 grapheme clusters
- Persian shaping and bidirectional adapter: built and passed mixed-direction/idempotence probes
- Persian XNB fonts: four generated assets passed XNB round-trip and glyph-map validation
- Persian language button and `TitleButtons`: generated at the required dimensions
- Integrated release audit: 0 errors, 0 warnings
- Swift tests for the current shared worktree: 6 / 8 passed; two package-integration tests are blocked by the unrelated unfinished `hi-vnrevival` entry already present in `PackageConfig.json` while generated content and test expectations still list 15 finished languages
- Last release app baseline: built and passed strict deep code-signature verification before this editorial pass
- Last verified app copy: `/Users/antonkrutov/Desktop/Stardew Translation Installer.app` (does not yet contain the corrections from batches 0464–0468)
- Fresh SMAPI runtime QA: `fa-vnrevival`, `SpriteFont1`, `SmallFont`, and Persian `TitleButtons` loaded without adjacent Content Patcher errors
- Static visual QA: Persian language button and corrected Persian title-menu labels inspected at original resolution

## Completion gate

- Every record translated or technically justified and editor-reviewed.
- Two consecutive full 14,720-record editorial audits find no new objective issue.
- Automated release audit reports 0 errors and 0 warnings.
- All JSON, keys, tokens, placeholders, event structure, includes, and exact locale gates pass.
- Generators are idempotent.
- Persian fonts build and pass XNB round-trip validation.
- Swift tests, release build, and strict code-signature verification pass.
- A fresh SMAPI launch verifies Persian shaping, RTL order, fonts, language button, and `TitleButtons` without adjacent Content Patcher errors.
- The final verified source of truth is this Desktop working copy.

## Resume point

The complete Persian corpus, glossary, runtime language entry, 463 includes,
static interface assets, 381-glyph shaping map, four locale fonts, and shared
Urdu/Persian bidi adapter are integrated. Batches 0464–0468 add the latest
editorial corrections; two subsequent clean full audits, glossary audit,
batch replay idempotence, and the Persian XNB round-trip have passed. The
shared worktree's unfinished Hindi integration currently prevents the complete
Swift/package gate and a trustworthy unified release rebuild; the last verified
app therefore predates these corrections. The glossary was not published
because owner authorization was not given.
