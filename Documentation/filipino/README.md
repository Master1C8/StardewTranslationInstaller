# Filipino release checkpoint

The Filipino (`fil-vnrevival`) package contains 14,721 reviewed player-facing
records across 152 Content Patcher files and 188 targets. The release candidate
passed two consecutive complete audits with zero errors and zero warnings. The
stable candidate hash is recorded in `final-audits.json`.

## Glossary

`../glossary/glossary.fil.json` contains 673 entries and 41 corrected meanings.
Two consecutive full editorial audits found no further issue. Its SHA-256 is
`0b37ee67fd0f2ed2ed15c54c16504af46a335f51376f8da9b46f1c6130b69b14`.

The reviewed Filipino layer is synchronized to the local canonical SiteForMods
repository. All 673 entries exactly match the installer snapshot; the atomic
write changed 41 `meaning` fields and no `term` fields, preserved English and
every non-`fil` locale, and produced whole-file SHA-256
`acb15f4f36527810e7d11f1187ac5a888eeb9d0ee11b7c577f650054ec672752`.
The owner later authorized publication of the Filipino glossary. The canonical
publisher returned `applied` for all 673 entries, and a fresh public endpoint
read matched the canonical ID order and every Filipino translation exactly.
No application deployment or push was performed. The verified Filipino change was later committed to canonical `main` at the owner's request.

`canonical-sync-preview.json` records a fresh 2026-09-08 comparison. The public
endpoint, canonical English source, and candidate all contain the same 673 IDs
in the same order. The endpoint's English fields exactly match canonical. The
local canonical `fil` layer has 63 newer entries than the endpoint and exactly
matches the saved baseline; the reviewed candidate changes 41 meanings and no
terms from that baseline. The prepared atomic replacement preserves every
other locale and leaves English unchanged.

## Source and audit evidence

Fresh xnbcli extraction matched all 187 prepared English assets. The installed
game's 51 supplemental modern assets were independently read with
`Tools/FilipinoSourceInventory`; all 4,216 references resolved to 3,597 unique
prepared targets. `supplemental-visible-fields.json` accounts for one direct
visible field, 43 implicit bundle names, and two technical exceptions.

Run the full deterministic gate with:

```sh
./Scripts/audit-filipino-all.sh
```

It checks all translation files, source keys, placeholders, exact glossary
terms, duplicate-English justifications, English residue, supplemental fields,
runtime includes, and both XNB font round trips.

## Editorial pass 5

A new complete review corrected 35 records: 13 repeated Sandy context lines, two action cues, 15 marriage-dialogue grammar or naturalness issues, four retained generic uses of `adventurer`, and one gift anecdote whose meaning had been replaced by another line. Independent exact-source, polarity, number, length, retained-English, and near-typo reports were manually reviewed. Two consecutive full audits then reported zero errors and zero warnings, including zero semantic-consistency errors.

## Runtime and artifacts

Swift tests passed 8/8. The release app built successfully, its ad-hoc code
signature passed strict verification, and the ZIP passed a complete archive
test. `smapi-qa-2026-09-08.log` records a clean Stardew Valley 1.6.15 / SMAPI
4.5.2 launch with the Filipino locale, both fonts, title buttons, language
button, and `Data/Pets` patch loaded by Content Patcher.

Live visual QA passed against the final unified 1.11.0 package through a
temporary local SMAPI harness. Nine 1280×720 backbuffer captures in
`visual-qa/` cover the localized title buttons, both
language pages, character creation, inventory, skills, options, a dialogue box,
and an explicit SpriteFont1/SmallFont glyph proof. The actual game menu classes
render Filipino labels, wrapping, accents, the peso sign, punctuation, and
control-key text without missing glyphs. `visual-qa.json` records the capture
hashes and review result.

The final Stardew Valley 1.6.15 / SMAPI 4.5.2 run loaded the Filipino
SpriteFont1, SmallFont, TitleButtons, and language-button assets with no Content
Patcher errors or warnings. The temporary QA mod and test content pack were
removed immediately afterward. The owner's installed package and original
Burmese language preference were restored and verified by their original
SHA-256 hashes.

## Main checkout delivery

The Filipino files were copied to `/Users/antonkrutov/Desktop/StardewTranslationInstaller`
and merged into its existing Ukrainian and Dutch work without overwriting those
changes. The unified package now has 12 languages, 2,630 unique includes, and
version 1.11.0. The full Filipino audit and all eight Swift tests passed again
in that checkout. After editorial pass 5, the full Filipino audit and all eight Swift tests passed again in that checkout. Its signed app and verified ZIP were rebuilt locally; the ZIP SHA-256 is `7737ce64987642170d1402a47b03b51d1626bc6650202c929aa2339240b61298`.

The canonical structural glossary check passes for all five games. Its focused
test suite currently has 26 passing tests and one unrelated failure: the
owner's pre-existing Thai critical-term edits have not yet been reflected in a
Thai snapshot assertion. Filipino causes no glossary test failure, and this
work does not modify Thai.
