# Stardew Valley production gallery review — 25 October 2026

Correction after the owner's Hebrew journal report: the prior `he #5` RTL pass
was wrong. Its three body lines share a left edge, and its short last line is
left aligned. Correct reading order alone did not satisfy the alignment gate.
The historical private ledger is preserved unchanged; its blanket 15-image RTL
acceptance is withdrawn. The 1.17.27 correction cycle in
`Documentation/rtl-rendering-repair.md` supersedes that acceptance and rechecks
all three affected RTL locales. The legacy findings below remain applicable.

Review scope: all 100 hosted original WebP images exported through the canonical
VN Revival CLI after the 15-image RTL replacement. Every image was opened
individually at original resolution. No image editing or recapture was performed.

The requested upload succeeded. New Arabic, Persian and Hebrew sets pass all
five checks. Overall gallery acceptance remains failed: 85 preserved legacy
images contain added upper-left locale badges; nine also have layout/content
findings. The review helper reports 100 total, 15 passed, 85 failed, zero pending.

| Locale | Inspected | Passed | Failed |
| --- | ---: | ---: | ---: |
| ru | 5 | 0 | 5 |
| es-419 | 5 | 0 | 5 |
| pl | 5 | 0 | 5 |
| zh-TW | 5 | 0 | 5 |
| th | 5 | 0 | 5 |
| vi | 5 | 0 | 5 |
| id | 5 | 0 | 5 |
| uk | 5 | 0 | 5 |
| ar | 5 | 5 | 0 |
| cs | 5 | 0 | 5 |
| nl | 5 | 0 | 5 |
| fa | 5 | 5 | 0 |
| ro | 5 | 0 | 5 |
| hi | 5 | 0 | 5 |
| fil | 5 | 0 | 5 |
| el | 5 | 0 | 5 |
| bg | 5 | 0 | 5 |
| sr | 5 | 0 | 5 |
| sw | 5 | 0 | 5 |
| he | 5 | 5 | 0 |

## Open findings

All 85 non-RTL images (orders 1–5 in every preserved locale above) have a
baked-in language badge around x48–698/y48–112 in the 1920×1200 frame.
The Spanish badge also clips its own text. These added annotations fail the
contamination check even when the underlying native UI is readable.

| Image | Region / observation | Severity |
| --- | --- | --- |
| pl #4 | Inventory bottom date x852..1268,y786..815: Final date numeral touches the right panel border; insufficient text margin. | major |
| zh-TW #5 | Journal body x695..1248,y525..553: Unwrapped body line is cut at right edge and ends mid-sentence. | major |
| th #2 | Character creation accessory selector x756..880,y811..836: Accessory label overlaps selector arrows. | major |
| vi #2 | Character creation accessory selector: Phụ kiện text touches selector arrows. | minor |
| vi #4 | Inventory date right edge: Date final numeral crowds the right border. | major |
| id #4 | Inventory date right edge x1260..1282,y788..814: Final date numeral extends over right frame. | major |
| hi #2 | Bottom accessory selector: सहायक वस्तु overlaps the left and right selector arrows. | major |
| fil #2 | Character creation favorite field label right edge: Paboritong label crowds the field border. | minor |
| bg #3 | Dialogue body and portrait name: Body identifies Гюс while portrait says Гас. | minor |

Next action: inspect the affected current runtime/glossary, repair the owning
layout/content boundary where reproduced, and recapture without added badges
when that separate scope is authorized. Do not retouch screenshots to hide
findings. This review does not establish that old captures represent the new
1.17.26 runtime or authorize replacing unrelated locale images.

## Evidence and limits

Private local evidence remains under `Documentation/rtl-rendering-20261024/`:

- `production-final-20261025/inventory.json`: complete slot identities and URLs.
- `production-final-20261025/downloads.json`: 100 successful original downloads.
- `production-final-review.json`: per-image observations, check decisions, precise
  regions, findings and next actions; reviewer gpt-6.1-sol.

| Receipt | SHA-256 |
| --- | --- |
| production-final-20261025/inventory.json | 59fe0348cba83acf7e6bc59c89e219e5fbde814857387392ef05178b15abafd5 |
| production-final-20261025/downloads.json | 1c9e42f13197af1dca89f7d8daf9edd9ecb83dff36ab77f9360ebe829a66e8ee |
| production-final-review.json | 5255614a6d3a9b00486c7c1a50effa1ffcb6c49ad5ed6f7011b62592143a226a |

The new RTL frames exercise title, creation, Gus dialogue, axe tooltip/inventory
and journal. Arabic/Persian joining and Hebrew order were read directly; mixed
player text `zc`, `500g`, `0g`, date/time digits and quest `3/28` retain intended
internal order. Each ledger row notes its actual visible examples and limitations.
Native cursors can obscure small selector/date portions; hidden letters were not
credited. The English Stardew logo and original FOR SALE texture are source game
artwork, not unexpected UI fallback.

This screenshot review does not prove full-game linguistic acceptance, Windows
runtime, language-picker navigation or dialogue progression. Separate bounded
macOS runtime receipts cover normal dialogue completion and protected-save hashes.
No full-corpus translation re-audit was performed.
