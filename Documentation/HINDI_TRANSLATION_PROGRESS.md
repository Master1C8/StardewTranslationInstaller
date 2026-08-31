# Hindi translation progress

Canonical working copy: `/Users/antonkrutov/Desktop/StardewTranslationInstaller`

## Pinned inputs

- Target locale: `hi`
- Planned Stardew language code: `hi-vnrevival`
- English assets: `/Users/antonkrutov/Developer/data/stardew-english-unpacked/`
- English asset count: 187 JSON targets
- English glossary count: 673 entries
- English glossary SHA-256: `b8fe9c8f5aaf9bedc990dabd2ce552d4f334450f03afee9949f75e376ab4bff9`
- Requested Bengali endpoint snapshot: `/private/tmp/glossary.bn.live.json`, fetched 2026-08-27, 673 entries
- Target Hindi endpoint: `https://vnrevival.fun/games/stardew-valley/glossary?locale=hi&offset=0&limit=1000`
- Hindi endpoint snapshot fetched: 2026-08-27, 673 entries
- Initial public/local/SiteForMods Hindi glossary comparison: 0 differing translations
- Structural translation baseline: 14,720 unique `(Target, key)` records across 187 targets and 151 patch files

## Editorial state

- Full initial glossary source-fidelity and Hindi editorial audit: complete
- Editorial corrections recorded in deterministic override layers: 483 declarations affecting 464 unique entries
- Final Hindi glossary SHA-256: `1188695143bf9b66a4e9b3b5005cbf11123e31da19197ad7e09e1194f89c64ae`
- Clean full glossary audits after the last correction: 2 / 2
- Automated glossary audit: 673 entries, 0 errors, 0 warnings
- Editorial override replay: idempotent
- Public glossary publication: not authorized and not performed
- Complete post-coverage editorial pass: direct-English accuracy, canonical names and terms,
  natural Hindi, NPC voice/agreement, and player-gender neutrality rechecked across all 14,720 records
- Post-editorial deterministic correction replay: idempotent
- Post-editorial full all-entry audits after the last correction: 2 / 2 clean

## Translation coverage

- Fully translated and editor-reviewed records: 14,720 / 14,720
- Reviewed technical preserves: 1,320
- Editorial batches: 413
- Hindi patch files integrated into `ModPayload`: 151 / 151
- Hindi runtime configuration integrated: yes (`hi-vnrevival`, `Fonts/Hindi`)
- Shaped Hindi clusters: 1,389
- Runtime encoding: 420,976 PUA scalars, 0 raw Devanagari scalars
- Hindi XNB fonts built and round-trip verified: yes (SpriteFont1, SmallFont, Hindi, Hindi_0)
- Static Hindi language and title labels built and verified: yes
- Final full Hindi audit: 0 errors, 0 warnings in two consecutive full runs
- Glossary audit: 0 errors, 0 warnings in two consecutive full runs
- Deterministic glossary replay: unchanged SHA-256
- Deterministic batch replay: unchanged translation-tree SHA-256
- Deterministic runtime encoding, content generation, static labels, and font generation: unchanged outputs
- Swift test suite: 8 / 8 passed
- Release app: `dist/Stardew Translation Installer.app`
- Release build: passed
- Strict recursive code-signature verification: passed
- Canonical Desktop copy rechecked: yes
- Project progress: 100.000%

## Final verification hashes

- Encoded Hindi translation tree: `bee5dd18e5269beee9892a294046e3f360dfb9f49a679a84805196de087263ab`
- Generated root `content.json`: `546ecf11de4d1bc02cdded9f6c96925f3107d2c8e92a45f219134c7e6e1fb837`
- `SpriteFont1.xnb`: `690371af4bcbb60748efc616a7e437cca91955f5d7583093d2979802775ac796`
- `SmallFont.xnb`: `ead57d283edf138d6e3baf5d3d8924d48326c8b7a1cd443c54b9d36ee31d09eb`
- `Hindi.xnb`: `dc929c21e434e8414243ef21a169aa8e4370ed7fd3694234d8a39435fe07b861`
- `Hindi_0.xnb`: `79e16c38128299e038a339535e6f81dfaf154ee32bf92d1f473f5292cf82c90a`
- `button-hindi.png`: `63d1b99db23dbc7237b254804cbf347716d2a8dd8cf5132697085c7cdd80fd67`
- `TitleButtons-hindi.png`: `85e12d552629e046f774807531e3ff5b4ca2cc05be86e37992aa845815970768`
