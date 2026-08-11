# Uzbek translation progress

## Package identity

- SiteForMods locale: `uz`
- Stardew Valley language code: `uz-vnrevival`
- Content Patcher ID: `VNRevival.StardewValleyUzbek`
- Translation directory: `assets/translations/uzbek/`
- Source language: English only

The Russian package is a read-only technical reference for Content Patcher structure, language-button assets, and locale-specific image loading. No Russian resource is copied into or modified by this package.

## Terminology source

The local `Documentation/glossary/glossary.uz.json` snapshot was compared with the canonical SiteForMods glossary on 2026-08-11. Both the English layer and the Uzbek layer matched exactly. The Uzbek layer contains all 673 stable IDs with no empty term or meaning.

Live project glossary: <https://vnrevival.fun/en/games/stardew-valley/projects/uz/>

## Completed batches

### UZ-001 — core interface labels

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui.json`
- Entries: 31
- Scope: money errors, main player-menu tabs, collections categories, journal labels, zoom labels, exit commands, and a small set of unambiguous character/inventory controls
- Placeholders preserved: `{0}` in `QuestButton_Hover`
- Glossary decisions applied: `Topshiriq`, `Jurnal`, `Anjomlar`, `Ko‘nikmalar`, `Ijtimoiy`, `Xarita`, `Yasash`, `To‘plamlar`, `Sozlamalar`, `Jamoat markazi`, and the three explicit exit labels

### UZ-002 — inventory, stats, and short creation labels

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-inventory-stats.json`
- Entries: 57
- Scope: birthday and year labels, short carpenter actions, appearance labels, collection counters, item statistics, skill buffs, player funds, the last shipped item, and bundle names
- Placeholders preserved: `{0}` and `{1}` in all 38 parameterized entries
- Glossary decisions applied: `Tug‘ilgan kun`, `yil`, `Tungi bozor`, `Ko‘rinishni o‘zgartirish`, `Binolarni buzish`, `Binolarni ko‘chirish`, `Qurish`, `Mudofaa`, `Immunitet`, `Kritik ehtimol`, `Kritik kuch`, `Zarar`, `Tezlik`, `Og‘irlik`, `Quvvat`, `Salomatlik`, the five skill names, `Omad`, `Oxirgi jo‘natilgan buyum`, and `to‘plam`

Current translated total: 88 `Strings/UI` entries.

## Next safe batch

Continue `Strings/UI` with short animal, shop, shipping, and confirmation labels. Check every term against the `uz` glossary layer before adding it. Leave long multiplayer help text and context-sensitive prompts for a later editorial pass.
