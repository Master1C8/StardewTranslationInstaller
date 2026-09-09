# Dutch localization checkpoint

The only editing checkout for this task is:
`/Users/antonkrutov/.codex/worktrees/3ea2/StardewTranslationInstaller`.
Final delivery must merge only this task's Dutch files into
`/Users/antonkrutov/Desktop/StardewTranslationInstaller`, preserving concurrent
work on other languages. No commit, push, site publication or deployment is authorized.

## Current state

- Locale `nl`; planned runtime language code `nl-vnrevival`.
- English extraction: 187 assets, 14,642 dictionary entries plus 78 credit lines,
  giving 14,720 unique target/key records. All extracted records are accounted for;
  this is a source inventory, not a count of translated strings.
- Re-extracted all 187 installed base XNB assets in an isolated temporary directory.
  xnbcli reported `Success 187`, `Fail 0`. Every `content` value matched the ready
  extraction. File hashes are recorded in `source-inventory.json`.
- The public Dutch endpoint returned all 673 glossary entries. Its English and
  Dutch layers matched canonical SiteForMods files before editorial corrections.
- Reviewed every glossary term and meaning. The first audit corrected 21 entries;
  the next full audit found three further issues (including a refinement to an
  already changed entry), making 23 changed entries in total.
- Following those corrections, a complete source-fidelity audit and a separate
  complete Dutch-language audit both found no further objective issue. The two
  clean passes are tied to a SHA-256 in `glossary-audits.json`.
- The corrected snapshot is `../glossary/glossary.nl.json`.
  Every difference from the public/canonical baseline has an explanation in
  `glossary-corrections.json`.
- Owner authorized the local canonical nl update. All 23 corrections were applied
  to the SiteForMods nl layer; other locales were preserved. Canonical/snapshot
  parity is now verified and the glossary is locked. No CMS publication occurred.
- Game translation coverage is complete: 14,720 of 14,720 records were authored and
  reviewed in 553 batches, and the structural audit reports no errors or warnings.
  The final complete audit corrected 710 objective issues; two subsequent complete
  14,720-record audits found no new issue. Runtime configuration, shared includes,
  fonts and release app artifacts are present.
  The shared switcher source and payload have a tested Dutch-only fix for the
  hardcoded a/an article.
- Runtime argument research is recorded in runtime-context-review.json. The Dutch-only
  article fix passed nine actual Harmony calls on .NET 6.0.32 x64, and the formerly
  deferred messages are translated. A fresh SMAPI launch loaded the Dutch locale,
  fonts and title buttons without adjacent Content Patcher errors. Live in-game
  visual inspection was not completed because Computer Use access was not approved.

## Resume

1. Read `checkpoint.json`, `release-gate.json`, `runtime-qa.json` and `coverage.json`.
2. Keep the locked glossary and the two clean full-content audits unchanged.
3. Grant Computer Use access to Stardew Valley, select `nl-vnrevival`, and complete
   the live title-screen and in-game visual inspection.
4. Restore the previously installed locale/state, synchronize this task's files to
   the Desktop checkout, and repeat parity, build and signature checks there.

Commands:

```sh
python3 Scripts/audit-dutch-glossary.py
python3 Scripts/dutch-work.py next Strings/UI --count 60
python3 Scripts/dutch-work.py apply Documentation/dutch/batches/0001-ui.json
python3 Scripts/dutch-work.py audit
python3 Scripts/test-dutch-work.py
```

Batch JSON has `locale: "nl"`, `target`, `sourceAssetSha256`, `reviewed: true`,
`entries` mapping exact source keys to Dutch text, and optional per-key `notes`.
Copy the source hash from `next`. Mark `reviewed` only after reading and checking
all rows against English, glossary, neighboring context and control syntax.
Source-identical strings require an explicit per-row reason, including genuine
Dutch/English homographs. There is no automatic credit for English scaffold text.

`apply` writes only reviewed records under the Dutch translation directory and
records source, translation and glossary hashes. Reapplying a batch is idempotent.
Run only incremental checks during batches; full audits at file/section completion,
each additional 1%, after rule/script changes, and for release gates.

The current work tool supports dictionary and credit-array records. Event validation
conservatively protects all unquoted commands; extend it using inspected English
syntax before processing `quickQuestion` or other unquoted player-facing segments.
Structured numeric fields and separators are protected. Further field-specific
technical invariants must be checked while inspecting those English formats.
The structural tools do not substitute for editorial review or runtime QA.

## Remaining release gate

The text, glossary, structural audits, idempotence checks, language gates, assets,
XNB round-trip, Xcode Swift tests, release build, signature and runtime probe pass.
The remaining gate is live Dutch visual QA followed by safe Desktop synchronization
and verification of that copy. Only then complete the goal.
