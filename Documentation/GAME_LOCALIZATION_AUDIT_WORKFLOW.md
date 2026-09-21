# Universal game-localization editorial audit protocol

This is the single editorial acceptance algorithm for game-text localization
on this workstation. It applies to every game, engine, repository, and target
locale. A project may add pinned inputs, engine-specific validators, mandatory
regression surfaces, and runtime or visual gates, but it must not replace,
weaken, or strengthen this algorithm with a different number of full model
rereads.

Glossary-source and glossary-translation acceptance remain separate workflows.
This protocol begins after the applicable canonical glossary and the complete
source-asset inventory are ready and pinned.

## Required inputs

Before editorial review, record:

- the supported game/build version and source locale;
- the canonical source inventory, stable IDs or paths, and fingerprints;
- the exact target locale and approved glossary-layer fingerprint;
- a complete glossary roster of every speaking character, resolved before
  glossary/game translation: evidenced male/female, player-selected variants,
  or canonically hidden/ambiguous state with a defined address strategy;
  insufficient evidence requires research or a recorded owner decision before
  source-glossary readiness, never guessing or deferral to game translation;
  the player entry, when present, is first;
- the authored target text, derived artifacts, text-bearing image plans, and
  their hashes;
- the previous accepted hashes, or an explicit statement that none exist;
- the project's mandatory regression catalog and deterministic validation
  commands.

If the source inventory is incomplete or IDs cannot be mapped reliably, stop.
A validator, search, sample, unchanged percentage, or prior declaration of
completion is not semantic coverage.

## Acceptance algorithm

### 1. Deterministic preflight

Validate the entire source and target corpus before semantic review. Confirm
complete ID/path coverage, parseability, protected syntax, placeholders,
commands, branching, layout schema, image-plan inventory, glossary structure,
and reproducible derived artifacts. Record every result and hash.

Mechanical success proves structural safety only. It does not prove meaning,
naturalness, voice, gender agreement, or contextual correctness.

### 2. One complete semantic source-to-target audit

A qualified language reviewer reads every source/target unit and every
text-bearing image plan once with enough scene and runtime context to judge:

- meaning, omissions, additions, negation, agency, tense, and condition;
- naturalness, grammar, voice, register, humor, and repeated callbacks;
- approved terminology and context-sensitive inflection;
- every character reference against the glossary's resolved canonical evidence
  and target-language address rules; preserve player-selected variants and
  intentional hidden/ambiguous states for players and NPCs without guessing;
- confirmed translation-relevant context recorded for high-dialogue
  characters, without requiring or inventing an exhaustive biography;
- visible UI text, titles, labels, credits, save/load surfaces, and image text.

Record complete coverage and the reviewed hashes. Findings must name a stable
ID/path, objective reason, and proposed correction. Do not rewrite equivalent
valid wording merely for preference.

### 3. Apply corrections and build the dependency closure

Apply accepted corrections only to authored localization inputs, rebuild all
derived artifacts, and compute a dependency closure containing only evidence
actually invalidated by the edits:

- every changed stable ID/path;
- the containing exchange or minimum neighboring context needed to judge it;
- exact repetitions and dependent wordplay or callbacks;
- occurrences of the affected glossary concept, referent, grammatical risk,
  or old/new localized wording;
- surfaces sharing a runtime binding, layout constraint, or split artifact;
- the project's mandatory regression catalog.

Do not add every line spoken by or naming every character merely because one
character-related line changed. Unchanged units retain the evidence of the
complete semantic audit unless a concrete dependency invalidates it.

### 4. Immutable audit-cycle evidence

Never overwrite the only copy of an earlier closure. Every cycle gets a new,
immutable evidence set containing:

- source, inventory, glossary, manual, derived-artifact, and image-plan hashes;
- `changed-ids` and `closure-ids` in canonical source order;
- review rows sufficient to reproduce the source/target comparison;
- separate component lists for context, repetitions, glossary/referents,
  runtime bindings, and mandatory regressions;
- counts and SHA-256 values, including the newline convention.

A later cycle must be able to reproduce exact set differences without model
memory, chat history, or inference from counts.

### 5. Independent dependency-aware diff audit

An independent reviewer checks the first cycle's complete closure against the
source, glossary, and scene/runtime context, plus the mandatory regression
catalog.

If that review causes corrections, the next review set is exactly:

```text
corrected IDs
+ (current closure IDs - previous closure IDs)
+ previously reviewed IDs whose evidence was explicitly invalidated
```

Do not automatically reread the full closure. Record removed dependency IDs,
but unchanged removed rows need no new semantic read. Continue delta cycles
until one review is clean on unchanged artifact and closure hashes.

If an earlier closure list is missing or its hash cannot be verified, either
reconstruct it exactly or reread the full current closure. Never guess which
dependency IDs are new.

### 6. Systemic findings and full-restart boundary

A wording pattern is not automatically a full-restart event. When stable IDs
and deterministic searches can enumerate every occurrence, add all occurrences
and their real dependencies to the next closure and review them in context.

Discard prior semantic coverage and repeat the complete audit when any of the
following changes or becomes unverifiable:

- source content, source fingerprint, or canonical asset inventory;
- applicable glossary meaning, terminology, or character evidence;
- extraction, parsing, alignment, reinsertion, or runtime binding in a way
  that may move, hide, merge, or expose text;
- stable-ID mapping or batch alignment;
- a systemic issue whose complete affected set cannot be bounded reliably;
- required coverage evidence or reviewed hashes.

An isolated correction with a complete, reproducible closure does not restart
the full semantic audit.

### 7. Mandatory regression catalog

Every project must define a stable, reviewable catalog of its high-risk
surfaces. It must include, where applicable:

- gender, pronouns, agreement, titles, professions, kinship, honorifics,
  feminatives, and every avoidable gender marker for a canonically hidden character;
- glossary terms affected by edits and protected names or comparison literals;
- save/load, locale selection, input prompts, HUD, menus, titles, speaker
  labels, credits, environment/location displays, and text-bearing images;
- placeholders, commands, markup, branching, exact-symbol assets, mixed
  writing systems, RTL/bidi, shaping, and project-specific layout constraints.

The catalog is checked in the complete semantic pass and every independent
diff cycle. Projects add concrete surfaces and commands; they do not create a
different editorial acceptance algorithm.

### 8. Final deterministic gate

On the final unchanged hashes, rerun the full structural and technical gate.
Editorial acceptance requires all of the following recorded together:

- complete semantic coverage of the entire corpus and image-text inventory;
- a clean independent diff/delta audit with reproducible closure evidence;
- a clean mandatory regression catalog;
- reproducible derived artifacts;
- zero unexplained missing, extra, protected-token, parse, or layout errors;
- final hashes and explicitly classified remaining source placeholders,
  runtime questions, or `needs-review` items.

Runtime, visual, font, texture, packaging, installation, and release readiness
remain separate statuses. Static editorial acceptance does not prove them.

## Checkpoint and cost evidence

For each locale and cycle, store the pinned fingerprints, hashes, coverage,
findings, changed-ID count, closure count and component hashes, exact delta
review set, regression result, validators, unresolved items, runtime/visual
status, model/reasoning level, and measured usage when available.

Give reviewers file paths and compact stable instructions rather than copying
the corpus into chat. Use scripts for deterministic set construction and
validation, not for generating translation wording. Report measured input,
cached input, output, and reasoning tokens when exposed; never substitute an
estimate from file size or row count.

Historical audits remain evidence of the protocol actually used. Do not
rewrite their history; apply this protocol to the next audit or invalidated
revision.

## Current-state summary

Keep one current per-locale summary tied to final artifact and evidence hashes.
Keep historical events separately and immutable audit cycles intact. Glossary
clean-pass counts and game-text semantic/delta evidence are different fields.
Do not inherit passed runtime/visual status from a changed payload without
verified applicability. An independent reviewer must be identifiable in the
evidence; a self-reread or validator is not an independent audit. If independent
review is unavailable under current permissions, leave that criterion pending.
