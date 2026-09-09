# Bulgarian glossary editorial record

Reviewed on 2026-09-05. Scope: the complete Bulgarian layer, 673 entries.
The English source and live Bulgarian export were obtained through the public
Stardew Valley glossary endpoint. At acquisition, both matched the canonical
SiteForMods repository; the English installer snapshot also matched exactly.

## Editorial gate

Five complete all-entry passes were performed directly by the translating
model. The first three found and corrected 98, 31, and 1 entries respectively
(127 distinct entries changed overall). Pass 4 reread every entry for fidelity
to the English source, conditions, terminology, grammar and naturalness, and
found no new objective issue. Pass 5 separately read every Bulgarian entry in
reverse order for target-language editorial quality and found no new objective
issue. No correction occurred between the last two passes. No independent
reviewer or translation service was used.

The locked working snapshot is `Documentation/glossary/glossary.bg.json`:
SHA-256 `b4261589b67f5d2a0c0a87657f364e2dd8d8cea295862a3eb41e02bc02a7d488`.
Its 673 IDs and their order match the English source. Every entry has only
nonempty `term` and `meaning` fields, NFC Unicode and no formatting control
characters. JSON and these structural checks pass with zero errors.

## Decisions carried into game translation

- `джунимо` is the uninflected creature name; the arcade title `Junimo Kart`
  stays intact. Joja brands, Stardew Valley, CalicoJack and the explicitly
  protected Speed-Gro spellings also stay intact.
- Shed / Big Shed are `Барака` / `Голяма барака`, preserving the enclosed
  building meaning. Leo's Treehouse is `Къща на дърво на Лео`.
- Grass Starter / Blue Grass Starter use `Разсад за трева` /
  `Разсад за синя трева`. The first-year completion option describes an
  opportunity to complete the bundles, not an automatic completed outcome.
- Fishing distinguishes `кълване` and `засичане`; the infested mine floor is
  `етаж, гъмжащ от чудовища`, not a medically infected floor.
- Qi challenges award gems, rather than requiring them as an entry payment.
  Ostrich wording distinguishes its island origin from its barn housing.
- Salmonberry is rendered `сьомгова малина`, avoiding the previous confusion
  with strawberries. The source plant is Rubus spectabilis; the English
  botanical identification and Bulgarian terminology were checked against
  [BSBI](https://fermanagh.bsbi.org/rubus-spectabilis-pursh),
  [Wikimedia's species page](https://commons.wikimedia.org/wiki/Rubus_spectabilis)
  and the Bulgarian dictionary result consulted during review.
- Season labels can be capitalized as labels; ordinary prose uses lowercase
  season names. Inflection, articles and grammatical gender follow sentence
  context without changing the locked concept.

## Delivery state and limits

The fetched evidence is immutable in `glossary-live.json`; the three correction
files record the exact edited wording. Following the owner's explicit bg-only
authorization, `Scripts/sync-bulgarian-glossary.py --write` merged the reviewed
layer into canonical SiteForMods JSON. The local snapshot and canonical bg
layer now match exactly. Every byte outside the bg value and the protected
English source were preserved; a second sync was a no-op. Nothing has been
published, committed or pushed.

`./vnrevival glossary check` passes for all four canonical games, including
673 Stardew Valley entries in 19 locales. The English source SHA-256 remains
`100dd0c9f06f25159a3189a9cce3022a99aac1a6ea89ac86fb2f48505e775487`.
The initial sandbox invocation could not open tsx's local IPC socket; the
approved rerun completed successfully.

`./vnrevival test glossaries` ran 25 tests: 24 passed and one failed because the
existing Thai weapon-enchantment critical-term fixture differs from the current
Thai layer. The bg sync preserved that layer and its test fixtures exactly.
No Thai text or unrelated test expectation was changed. This suite is recorded
as failing, not presented as a Bulgarian editorial defect or a passing suite.

This gate establishes glossary editorial readiness only. No game string is
counted by this report. Swift tests, packaging, font and runtime checks remain
separate release gates; the source denominator is still being reconciled.
