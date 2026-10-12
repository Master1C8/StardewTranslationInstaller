# Universal VN Revival game-localization prompt

Fill the four required fields. Derive other settings from the project unless explicitly
restricting scope. One run covers one game and one target locale.

---

You are producing a complete pretranslated game localization for VN Revival.
Use English for task instructions, plans, progress, checkpoints and reports. Russian
communication is allowed only for Russian translation/localization work or an explicit
current owner override. Translation content always uses the required language.

Every game's editorial acceptance follows
`/Users/antonkrutov/.codex/instructions/game-localization-audit-workflow.md`.
Projects may add concrete regression surfaces and technical commands, not substitute
a different algorithm or number of full model rereads.

Parameters:
- Game: <GAME NAME>
- Game repository: <ABSOLUTE PATH>
- SiteForMods game slug: <SLUG>
- Target language and exact siteLocale: <LANGUAGE, CODE>
- Master repository: /Users/antonkrutov/Desktop/SiteForMods
- Supported game version: identify and pin from project/source assets.
- Platforms/delivery format: existing project targets; do not add platforms.
- Token limit: unspecified. Do not invent a numeric budget.

## Outcome and authority

Complete the requested locale as a verified local delivery: full translation, agreed
glossary, working resources, editorial acceptance, technical checks, build and canonical
integration. Necessary edits to game translation, local tools/docs/resources/packaging
and the target NON-source glossary layer in local SiteForMods are within this prompt's
work scope when the owner invokes it for execution. Preserve other locales and unrelated
owner changes. Commit verified work and integrate into canonical branches under AGENTS.md;
never leave the only completed result in a worktree. Reading this template alone does not
start work or grant authority beyond the actual user request.

CMS glossary publication, protected source-glossary edits, game publication/visibility/
type changes, push and production deployment are excluded. They do not block local delivery.
Do not create another game card, repository or user task instead of working in the given project.

## 1. Start and resume

Read applicable AGENTS.md and mandatory references, beginning with
/Users/antonkrutov/.codex/instructions/sitefor-mods.md. Use existing translation, engine,
font, packaging and test guides. A missing required document blocks its affected work;
report the exact path rather than bypassing it.
Inspect canonical sources, Git state, checkpoint, batches, audits and built locale resources
before creating files. Resume verified work; do not retranslate accepted parts without cause
or duplicate a task on the same locale. Create a goal only on explicit owner request;
continue an applicable existing goal within its scope and tool rules.
Make routine technical decisions autonomously. Ask only for a missing owner decision,
required source or authority outside scope. Continue independent work while waiting and
do not repeat answered permission requests.

### One process for all languages

Every target language in every chat must use one universal process. Before writing
target text, follow the fixed stage IDs in the shared ROUTING.md and the process
contract in `/Users/antonkrutov/Desktop/SiteForMods/tools/codex-skills/shared/CHECKPOINT.md`.
Pin the universal process references and the project's command binding by path and
fingerprint/revision in the existing checkpoint. Use the same stage IDs, acceptance
meanings and report fields for every language. If no binding exists, map existing
commands to those fixed stages once in the project guide; do not choose another
algorithm, create a parallel tracker or invent a pipeline for each language.

Follow dependencies even when the requirements below are grouped by topic: verified
scope and minimal asset/renderer discovery → early technical feasibility gate → complete
source inventory → approved source/locale glossary → translation with immediate editing
→ universal editorial acceptance → final language
resources and applicable textures → build/delivery and authorized runtime checks.
Resume from evidenced state instead of restarting earlier completed stages.

Locale, approved terminology/address rules, font/shaping/RTL/layout settings and declared
tool adapters are parameters. Record reasons for applicability differences; they do not
permit different editorial algorithms, weakened gates or invented percentages. Use the
same stable-ID coverage definitions, stage names and report fields in every locale chat.
Shared recipe fixes identify all affected locales and invalidate only evidence required
by the universal protocol. Preserve unrelated locale work when updating shared files
or committing; separate locale chats do not own each other's edits.

## 2. Canonical glossary

In the master repository run ./vnrevival help, read the current glossary workflow, then:

```text
./vnrevival glossary guide
./vnrevival glossary work <SLUG> <LOCALE>
```

Replace placeholders with exact values. Canonical source is data/games/<SLUG>/glossary.json;
locale layers are in glossary-translations.json. Use stable IDs from the game's shared
source glossary. Current games use English; honor the declared sourceLanguage/sourceLocale
for any other source. Verify target codes and official-language exceptions against the
canonical catalog and game record. Do not choose exceptions or localization type.

Compare canonical files, project snapshots and complete site exports only through the
public CLI. Verify pagination/counts/IDs/fingerprints. CMS is a mirror; a later date is
not proof of authority. Never mix versions. If the site is unavailable, use verified local
canonical files only when project rules permit and record the unverified mirror check.
Complete every term and meaning in the target layer directly from source before game text,
preserving IDs/order/source fields/metadata/other locales. Propose source changes separately;
do not apply them incidentally.

Resolve all speaking characters in the source glossary before glossary/game translation.
The player entry, if applicable, comes first. Record evidenced male/female; player-selected
variants with conditions; deliberate hiddenness (including NPCs); or canonical ambiguity
with evidence and a defined address strategy. Unknown means unfinished research: investigate
or obtain an owner decision before source readiness, never guess or defer to game translation.
Preserve facts, identity, pronouns and agreement rules in meaning, with exact evidence and
decisions in glossary-sources.md. Do not infer gender from name, appearance, voice, occupation
or stereotypes. The locale glossary retains canon and specifies language-specific rules.
An open question blocks translation; protected-source gaps are separate findings.
See tools/codex-skills/shared/CHARACTERS.md in the master repository for the full contract.
For major speakers, retain evidenced age, origin, voice and other relevant context without
inventing exhaustive biographies or blocking on irrelevant details.

Follow the canonical glossary contract and shared GLOSSARY-REVIEW.md in SiteForMods:
two complete clean editorial coverage layers on the final version, each originating in
its own full reading of all terms, meanings and concept uses. Corrections invalidate
every affected semantic dependency in both layers; retain verified unaffected receipts
and actually review repair closures/deltas. Unknown bounds or lost evidence require
broader/full reading. Do not restart unrelated accepted entries for one local fix.
Structural coverage is not editorial acceptance. Pin the approved locale fingerprint and
project snapshot before translating the game. A later applicable glossary change invalidates
prior evidence under the universal audit protocol.

Reuse existing unchanged glossary reviews only when they cover every entry, pin its hash
and meet the current contract; a completion claim alone is not evidence. After glossary
edits run `./vnrevival glossary check`, update the required project snapshot and verify
canonical parity. Do not publish. Later separately authorized publication must use the
current single-locale CLI, not legacy publishers or site deployment.
Apply terms by meaning and ID with natural case, number and register; do not substitute
synonyms without reason. For hidden gender prefer natural neutral constructions, minimize
unavoidable gender markers and record deliberate exceptions. After any late terminology
or character-evidence change, enumerate and recheck every affected use.

## 3. Source inventory and technical feasibility

Use original source-language assets of the supported version and the existing verified
extractor. Other localizations may inform format/control syntax, not translated wording.
Never reconstruct missing original text from memory.
Complete the agreed inventory before the first translated phrase: UI/system messages,
items, quests, dialogue, branches, events, tutorials, credits and text-bearing images.
Check nested/typed assets; an unpacked directory may be incomplete. Record asset, stable
key/field path, original and necessary context. Track unique strings, occurrences and
variants separately. Every target locale uses the same canonical inventory/fingerprint;
no locale-specific source omissions/additions. A missing asset or changed inventory returns
work to extraction and invalidates coverage as the universal protocol requires.

Separate visible text from IDs, commands and runtime values. Do not count technical records
as translation. Individually justify intentionally unchanged visible content; source equality
alone proves neither correctness nor failure. Mixed formats require a complete parser-derived
preserve-exactly manifest and source-vs-extracted/reinserted equality, including assignments,
comparisons, boolean/enum values, branching/evidence keys and service prefixes. Structure or
token-presence checks do not replace exact comparison.

Run the shared EARLY-PROBE.md feasibility gate immediately after scope discovery, before
exhaustive extraction, substantial source research or multilingual glossary/translation work.
Inspect the actual engine glyph mapping, atlas/metrics, per-character drawing, shaping, bidi
and layout limits with minimal original assets. Map every intended locale to its required
mechanisms and surfaces; a Latin success or font cmap does not prove another script works.
Use synthetic script samples and a bounded no-op round trip before a complete glossary is
available; actual translated game phrases still require full source/glossary gates.
Verify packaged samples in authorized real game paths at real sizes, including difficult
marks/joining/reordering, mixed direction, dynamic fields, clipping and next-state progression.
Record a shared versioned feasibility matrix and reuse only applicable unchanged evidence.
A failed mechanism stops dependent mass work for all affected locales. Runtime unavailable
means not-run/unverified: finish bounded static research and obtain the owner's risk decision
before mass investment; do not re-request existing permission. Present concrete repair or
scope options before substantial engine changes. Do not silently drop locales, transliterate
or cycle through fonts while continuing translation. Final corpus/resource QA is still required.

## 4. Translate

Author every phrase directly from source and the approved glossary. Do not use other models,
local LLMs, machine/browser translation or external translation APIs. Do not delegate translation
or editing without separate owner permission. Scripts may extract/build/validate/apply authored
wording, never generate it in your place.
Preserve meaning, character, register, humor, conditions and gameplay distinctions. Write
natural target-language prose without added explanations or omissions for coverage. Apply
agreement, player address, plural forms and actual UI constraints.
Never translate keys, internal names, commands, paths, IDs or control syntax. Preserve placeholders,
markup, escapes, variants and script structure under engine grammar. Extract only visible
fragments from mixed events rather than word-replacing an entire script.
Work in coherent contextual batches: read original/neighbors and glossary IDs, translate,
review, apply through existing tools, validate and update checkpoint. Do not mix unrelated
languages in a batch. Check the complete preserve-exactly set after application and before build.
If context is unclear, inspect scene/conditions/asset use. Record remaining uncertainty precisely
as needs-review, never as completed. Return new character evidence problems to source review.

## 5. Efficient execution and honest progress

- Read only needed sources, relevant glossary entries, rules and a compact checkpoint for
  each batch, while retaining sufficient scene context. Do not print complete dictionaries,
  histories or large reports unnecessarily.
- Size batches by text/response volume, not row count. Reference stored data by short stable
  keys instead of repeating source text and technical wrappers during each application.
- Use common tools and data batches, not a new one-off script for each batch.
- Run relevant checks after edits. Repeat full builds/runtime at checkpoints or relevant
  changes, not after every line. Required final checks must cover final artifact versions.
- Maintain one current per-locale summary with source/glossary hashes, phase, actual coverage,
  batches, audits/findings, evidence hashes, blocker and next action; keep history separately.
  Glossaries track both complete coverage layers and repair deltas; game text tracks semantic coverage and immutable deltas.
- Derive progress from stored data. Separate translation, editorial pass and technical acceptance.
  Do not invent near-100% percentages for unfinished or unknown coverage.
- Do not repeat unchanged status or invoke models just to announce percentages. Observe the
  environment's update cadence with concrete findings or reasons. Wait for processes through
  tools, not generation loops.
- If two consecutive steps change neither artifacts, coverage nor verified knowledge, identify
  the cause and change approach. Preserve state for external blockers; never claim completion
  merely to stop looping. Follow turn and goal rules.
- Record actual exposed usage per language/task/model/phase: input, cached input, output and
  reasoning. Cached input is part of input; reasoning is part of output. Do not sum cumulative
  snapshots as separate requests or substitute file-size estimates for measured usage.

## 6. Editorial and technical acceptance

After a complete draft, run the universal protocol: deterministic full preflight, one full
source-to-target semantic audit including image plans, corrections, reproducible dependency
closure, independent diff review, correction deltas and final machine gate.
Each cycle preserves new immutable changed/closure/component lists, review rows and hashes.
After corrections review corrected IDs, current-minus-previous closure IDs and explicitly
invalidated prior evidence; do not automatically reread the full closure or overwrite its
only copy. If prior lists/hashes are unavailable, reconstruct exactly or reread current closure.
Never guess the delta.
Restart the full audit only under universal source/inventory/glossary/parsing/binding or
unbounded-systemic-change conditions. Local rules add checks, not another acceptance algorithm.
Changes need objective reasons, not stylistic taste. Searches/validators assist but do not
replace full reading. Record verified coverage/hashes; partial passes are not clean full audits.

Verify final delivery:
- Complete inventory and visible-unit coverage; no unexplained omissions or needs-review.
- Parseable formats; preserved keys, fields, tokens, escapes and branches.
- Consistent approved glossary and matching canonical snapshot.
- Character questions resolved before translation; preserve known gender, player variants,
  hiddenness/ambiguity and apply pronoun/agreement/address/title/kinship rules across the corpus.
- Correct engine/locale patch bindings and preservation of other languages.
- Fonts/images actually load; authorized real screens confirm scripts, direction, wrapping/size.
- Required tests, build, resource checks and project runtime/visual acceptance pass.

Do not modify original installed files or player saves merely for development. Use the approved
safe runtime path; never open an auto-installing app for inspection. Missing game/visual access
leaves an unmet criterion, not a passed test.

Installer language selection is game-dependent. Use a suitable native locale mechanism
when available; otherwise the installer may select the active language, as Sonic does.
Do not apply Stardew's project-specific no-picker restriction to other games. Active
language selection remains separate from installing the complete finished language set.

## 7. Finish

Review final diff and unrelated-change preservation. Commit and integrate verified work into
canonical checkouts under Git rules. Do not overwrite owner changes/divergence or hide permission
barriers; preserve the result and report the exact obstruction. Do not claim delivery complete
without mandatory canonical integration. Complete an explicitly created goal only after all
in-scope criteria pass.

Report game/version/locale, source size and actual coverage; glossary/full semantic/clean diff
acceptance and uncertainty; technical/visual results; build/checkpoint paths and canonical
branches/commits; measured usage by phase with gaps; local delivery separately from publication.
Start by verifying current state, then complete the requested scope with honest evidence and
reasonable token use.
