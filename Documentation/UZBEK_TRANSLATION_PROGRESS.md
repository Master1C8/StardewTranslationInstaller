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

### UZ-003 — animals, character creation, and geode services

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-animals-character.json`
- Entries: 63
- Scope: learned-recipe notices, farmer statistics, animal management, remaining carpenter errors, multiplayer creation settings and help, six farm maps, skill labels, shipped collections, and geode service text
- Glossary decisions applied: `retsept`, `Yashash binosini almashtirish`, `Homiladorlikka ruxsat`, `Mukammal!`, `Pul taqsimoti`, `Foyda ulushi`, `Boshlang‘ich kulbalar`, `Kulba joylashuvi`, all six farm-map names, the four skill names, `Jo‘natilgan buyumlar`, `Anjomlarda joy yo‘q`, and `Geoda`

### UZ-004 — Community Center rewards and level professions

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-level-professions.json`
- Entries: 88
- Scope: Joja development descriptions, Community Center rewards, letter attachments, level-up bonuses, all 30 profession names and descriptions, and profession selection
- Glossary decisions applied: `Kaliko cho‘li`, `Pelikan shaharchasi`, `Vagonchalar ta’mirlandi`, `Ko‘prik ta’miri`, `Issiqxona`, `Avtobus ta’miri`, `Yaltiragan xarsang olib tashlandi`, `Jamoat markazi`, `Tashlandiq JojaMart`, tool names, `Salomatlik`, all 30 canonical profession names, `Qisqichbaqa tuzog‘i`, `yem`, `Qattiq yog‘och`, `ruda / quyma`, `kritik zarba`, and `maxsus harakat / tiklanish vaqti`

Current translated total: 239 `Strings/UI` entries.

### UZ-005 — load, controller, and multiplayer menus

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-multiplayer.json`
- Entries: 51
- Scope: save loading, controller reconnection, item stowing, advanced crafting information, server modes, co-op connection states, invite codes, multiplayer options, cabin demolition, and host wait states
- Glossary decisions applied: `Buyumni olib qo‘yish`, `Kontroller uslubidagi menyulardan foydalanish`, `Server rejimi`, `Oflayn / Onlayn`, `Taklif kodi`, `Yangi fermaga mezbon bo‘lish`, `Kulba`, and `Yordamchi fermer`

### UZ-006 — multiplayer chat notifications

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-chat-notifications.json`
- Entries: 69
- Scope: chat formats and multiplayer announcements for joining, collections, relationships, sleep, earnings, films, achievements, and game pausing
- Glossary decisions applied: `Yordamchi fermer`, `Afsonaviy baliq`, `to‘plam`, `Yulduz tomchisi`, `Dasht qirolining sarguzashti`, `Junimo Kart`, `Yo‘qolgan kitob`, `Galaktika qilichi`, and `Yutuqlar`

Current translated total: 359 `Strings/UI` entries.

### UZ-007 — chat commands and player proposals

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-chat-commands-proposals.json`
- Entries: 100
- Scope: chat command help and errors, ban/unban controls, private replies, Mr. Qi messages, multiplayer relationship status, gifts, dance and marriage proposals, pregnancy and adoption responses, invite-code clipboard actions, lost items, and letters
- Glossary decisions applied: `fermer / yordamchi fermer`, `Janob Qi`, `nikoh / turmush o‘rtoq`, `bo‘ydoq / turmushga chiqmagan qiz`, `homiladorlik / asrab olish`, `raqs jufti`, `Taklif kodi`, `Onlayn aloqa / Mahalliy aloqa`, and `Xatlar`
- Control syntax preserved: all numbered placeholders, the wedding `^` separator, `/help commandName`, and item token `[126]`

Current translated total: 459 `Strings/UI` entries.

### UZ-008 — profiles, tailoring, dyeing, and emotes

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-profile-tailoring-emotes.json`
- Entries: 61
- Scope: fruit-tree and workbench warnings, the gift log and gift categories, Mini-Jukebox restrictions, tailoring and dye-pot instructions, and the complete emote menu
- Glossary decisions applied: `Sovg‘a jurnali`, `Tug‘ilgan kun`, `hayvon mahsuloti`, `hunarmand mahsuloti`, `Baliq`, `Mini-musiqa qutisi`, and existing UI terminology for items and colors

### UZ-009 — wallet milestones and Junimo Kart levels

- Target: `Strings/UI`
- English source: `unpacked-all/Strings/UI.json`, Stardew Valley 1.6.15
- File: `assets/translations/uzbek/ui-wallet-achievements.json`
- Entries: 38
- Scope: shared/separate wallet announcements, money-gifting and solo-earnings milestones, bundle and monster-eradication notices, Luau soup, Junimo Kart high scores and all displayed level names, and the NPC busy message
- Glossary decisions applied: `Mablag‘larni birlashtirish`, `Pul yuborish`, `to‘plam`, `Mahluqlarni qirish maqsadlari`, `iridiy`, `Luau`, `Junimo Kart`, and `Gavhar dengizi`

Current translated total: 558 `Strings/UI` entries.

## Next safe batch

Continue `Strings/UI` with Fish Pond requests, advanced game options, shop, shipping, confirmation, mine, fishing, and remaining options labels. Check every term against the `uz` glossary layer before adding it. Keep context-sensitive event commands out of the UI batches.
