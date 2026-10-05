# Czech audit evidence under the universal workflow

Czech follows the same current game-text acceptance algorithm as every other
locale: [GAME_LOCALIZATION_AUDIT_WORKFLOW.md](GAME_LOCALIZATION_AUDIT_WORKFLOW.md).
The sequence is deterministic preflight, one complete semantic source-to-target
audit, corrections with immutable dependency closure, independent diff/delta
review and the final deterministic gate. Glossary acceptance remains separate.

## Historical ledger boundary

`Scripts/czech-full-audit.py` and `Scripts/czech_audit.py` implement an older
editing-plus-two-clean-full-passes algorithm. Their `cleanFullAudits`,
`clean-audit`, `clean-complete` and related statuses describe that legacy
algorithm only. They do not verify the current independent diff/delta gate.
The implementation has not been migrated to that gate; do not present this
instruction correction as a completed tool migration.

Preserve `Documentation/czech/full-audit-state.json`, its receipts, source and
glossary fingerprints, findings and prior outcomes. Do not rewrite completed
history or automatically rerun Czech translation to normalize old counters.
Read-only `status`, `show` and `next` may help inspect legacy evidence. A `show`
receipt must use a new temporary output path; saving/displaying it is not proof
of semantic reading. The tool may refuse display once its old passes are complete;
inspect the underlying pinned inputs rather than reopening or mutating the ledger.

Do not use `start-clean`, legacy pass approval or schema migration to establish
new editorial readiness. In particular, do not restart two full reads after each
local correction. Reuse prior actual semantic coverage only when the reviewed
IDs, fields and hashes prove applicability under the universal protocol. Legacy
editing receipts are not automatically an independent review.

## Next authorized Czech audit

Use the existing project checkpoint and record the same process binding and
stage/status fields as other locales. Pin the shared complete source inventory,
exact Czech locale configuration, approved glossary and authored/derived hashes.
Use existing batch/application tools only after checking their current arguments
and preservation guarantees; their names do not make them editorial acceptance.

For an objective correction, preserve its stable IDs, rebuild affected derived
artifacts and record immutable changed, dependency-closure and regression ID
lists. An independent reviewer checks the first closure; later cycles review
corrected IDs, newly added closure IDs and explicitly invalidated evidence.
If such a reviewer or an adequate evidence adapter is unavailable, leave that
criterion pending and identify the missing capability. Do not substitute a
self-reread, a counter, or the old two-pass command.

Apply the universal full-restart boundaries for source, glossary, parsing,
identity or unbounded systemic changes. Keep technical, runtime, visual and
release checks separate; this document does not authorize launching a game,
creating another agent, publishing or altering protected glossary sources.
