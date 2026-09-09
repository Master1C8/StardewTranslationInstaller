# Romanian localization checkpoint

The source of truth for this task is worktree `fd02`. Do not edit the Desktop
installer checkout concurrently. The final reviewed deliverable must be copied
to `/Users/antonkrutov/Desktop/StardewTranslationInstaller` and verified there.
The owner explicitly prohibited commit and push for this task.

Resume from `checkpoint.json`, `audit-current.json`, and the last batch. The
coverage denominator is the complete 187-asset English extraction: 14,720
unique target/key records, including all 78 indexed credit rows. An event row
counts only after every visible fragment and its surrounding commands have
been checked. Technical rows and target-language homographs need individual
preservation explanations; no unchanged or simply modified text counts by
itself. Any change in source, translation, or glossary invalidates its recorded
editorial approval through hashes.

The original extraction was independently reproduced from all 187 installed
base XNB files with the pinned extractor: Success 187, Fail 0, no content
differences. Evidence and packed-asset hashes are in `source-verification.json`.

The requested public Romanian glossary was fetched from
`https://vnrevival.fun/games/stardew-valley/glossary?locale=ro&offset=0&limit=1000`.
All 673 source entries, order, and Romanian values matched the canonical
SiteForMods repository. The immutable response is `glossary-endpoint.json`.
The directly authored editorial corrections are in `glossary-corrections.json`;
the resulting snapshot is `../glossary/glossary.ro.json`. Two full corrective
passes were followed by two consecutive clean full-entry passes, recorded with
the reviewed snapshot hash in the checkpoint. Do not infer those passes from
the structural checker.

The owner subsequently explicitly authorized the local canonical Romanian
glossary update. All 47 corrections were saved in SiteForMods, preserving the
English source and every other locale. Canonical Romanian parity is verified;
`vnrevival glossary check` passes. The broader glossary suite has 24 passing
tests and one unrelated Thai critical-terminology fixture failure, which this
Romanian-only task must not change. Nothing has been published, committed,
pushed, or deployed.

Commands:

```sh
python3 Scripts/audit-romanian-progress.py
python3 Scripts/apply-romanian-glossary-editorial.py
python3 Scripts/apply-romanian-batch.py Documentation/romanian/batches/<batch>.json --check-only
python3 Scripts/apply-romanian-batch.py Documentation/romanian/batches/<batch>.json
```

The batch writer supports `Strings/UI`, `Strings/Lexicon`, and dialogue in
`Data/ExtraDialogue`. It preserves ordered dialogue controls and question IDs.
Its event parser supports the two full Skull Cavern events and seven embedded
summit fragments in that asset: every command byte outside quoted speech must
remain identical, and every speech segment needs review. It rejects other
event grammars. Extend its validation before using other event or
slash-delimited assets. Author all
Romanian wording directly from English. Scripts only preserve and validate the
explicit authored text. Batch sizes remain 40–80 short strings or 15–30 long
dialogues; review wording before materializing the batch. Full checks follow
each additional percentage point and each finished section; do not run Swift
and release builds after each small batch.

Romanian UI uses `PV` for `puncte de viață` (HP), neutral wording around dynamic
player/NPC names, and Romanian thousands separators in prose. Technical IDs,
numeric arguments, commands and currency suffix `g` are unchanged. All runtime
fonts must cover `ĂÂÎȘȚăâîșț` (comma-below Ș/Ț, not cedilla substitutes).

The unfinished Romanian patch is deliberately not registered in the unified
release configuration yet. Registration, includes, locale fonts, title assets,
SMAPI and visual QA, Swift tests, release build/signature, final editorial
passes and Desktop synchronization remain mandatory completion gates. Never
open the built installer for inspection; it starts installation automatically.
