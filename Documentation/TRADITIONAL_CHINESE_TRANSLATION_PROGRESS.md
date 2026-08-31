# Traditional Chinese translation progress

Canonical working copy: `/Users/antonkrutov/Desktop/StardewTranslationInstaller`

## Pinned inputs

- Target SiteForMods locale: `zh-TW`
- Planned Stardew language code: `zh-TW-vnrevival`
- English assets: `/Users/antonkrutov/Developer/data/stardew-english-unpacked/`
- English asset count: 187 JSON targets
- English glossary count: 673 entries
- English glossary SHA-256: `b8fe9c8f5aaf9bedc990dabd2ce552d4f334450f03afee9949f75e376ab4bff9`
- Target glossary endpoint: `https://vnrevival.fun/games/stardew-valley/glossary?locale=zh-TW&offset=0&limit=1000`
- Endpoint snapshot: `/private/tmp/stardew-glossary-zh-TW-live.json`, fetched 2026-08-30, 673 entries
- Initial public/local/SiteForMods glossary comparison: 0 differing translations
- Structural translation baseline: 14,720 unique `(Target, key)` records across 187 targets and 151 patch files

## Editorial state

- Full initial glossary source-fidelity and Traditional Chinese editorial audit: complete
- Editorial corrections recorded in deterministic override layers: 58 entries
- Final Traditional Chinese glossary SHA-256: `a7c1ad1b50b21b8da7e1696ff198dbbf5fe27859f50f244215c239bfba629796`
- Clean full glossary audits after the last correction: 2 / 2
- Automated glossary audit: 673 entries, 0 errors, 0 warnings
- Editorial override replay: idempotent
- Public glossary publication: not authorized and not performed

## Translation coverage

- Fully translated and editor-reviewed records: 14,720 / 14,720
- Reviewed technical preserves: 1,317
- Editorial batches: 310
- Traditional Chinese patch files integrated into `ModPayload`: 151 / 151
- Runtime configuration integrated: yes
- XNB fonts built and round-trip verified: yes (3,307 required glyphs)
- Static language and title labels built and verified: yes
- Final full translation audits: 2 / 2 (14,720 / 14,720 records, 0 errors, 0 warnings on both passes)
- Batch and editorial replay: idempotent (310 / 310 batches changed 0 records)
- Simplified Chinese contamination audit: clean
- Swift test suite: passed (8 tests, 0 failures)
- SMAPI runtime QA: previously passed for Traditional Chinese, Russian, Polish, and Amharic; not rerun after the current editorial and font update
- Release build and strict signature verification: passed
- Current `dist` Traditional Chinese translations and fonts match the source byte-for-byte; the external Desktop app was not synchronized in this pass
- Project progress: 100.000%
