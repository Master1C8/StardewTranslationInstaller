# Czech editorial audit workflow

The Czech workflow records three independent facts. Do not combine them into a
single completion percentage:

1. `Scripts/czech-progress.py` verifies source coverage, payload structure, and
   hash-bound package review metadata.
2. The editing phase in `Scripts/czech-full-audit.py` records each Czech row that
   was explicitly read against its English source. Correcting one row invalidates
   evidence for that row only. Unchanged reviewed rows remain valid.
3. After every row has valid editing evidence and all findings are resolved, two
   separate clean full passes must review the same frozen translation snapshot.
   A translation, source, or glossary change invalidates the clean passes.

The audit layout is stored in `Documentation/czech/full-audit-state.json` and is
based on source text, so translation length cannot move rows between chunks.
`status`, `show`, and `next` are read-only. Mutating commands use an atomic write
and refuse concurrent ledger or source changes.

## Editing phase

Inspect the current state:

```sh
python3 Scripts/czech-full-audit.py status
```

Show a practical range and write a receipt outside the repository:

```sh
python3 Scripts/czech-full-audit.py show \
  --chunks 38-45 \
  --receipt /tmp/czech-editing-38-45.json \
  > /tmp/czech-editing-38-45.txt
```

Read every complete EN/CS row in the displayed range, including event branches,
commands, unquoted quick-question text, placeholders, and control markers.
Redirecting output or extracting selected quotes is not review evidence by
itself.

Accumulate objective corrections for a reasonable range before applying them.
For every affected package, use the normal draft workflow:

```sh
python3 Scripts/czech-batch.py apply Documentation/czech/drafts/NNN-name.json
python3 Scripts/czech-batch.py review Documentation/czech/drafts/NNN-name.json
python3 Scripts/czech-batch.py approve Documentation/czech/drafts/NNN-name.json \
  --note 'Concrete corrections and context checked.'
```

After corrections, create a fresh receipt for the range and verify that the new
display differs only by the reviewed corrections. A stale receipt is rejected
atomically. Approve the fresh receipt with a concrete note:

```sh
python3 Scripts/czech-full-audit.py show \
  --chunks 38-45 \
  --receipt /tmp/czech-editing-38-45-final.json \
  > /tmp/czech-editing-38-45-final.txt
python3 Scripts/czech-full-audit.py approve \
  --receipt /tmp/czech-editing-38-45-final.json \
  --note 'Read every EN/CS row; corrected the recorded objective issues.'
```

If a receipt contains only unchanged rows, it remains valid after an unrelated
translation correction. Approval by chunk number is deliberately disabled.

Use findings when an objective issue cannot be fixed in the current operation:

```sh
python3 Scripts/czech-full-audit.py record-findings \
  --note 'Concrete unresolved issue and affected row.'
python3 Scripts/czech-full-audit.py resolve-findings \
  --note 'How the recorded issue was corrected and rechecked.'
```

## Two clean full passes

Start the clean cycle only when `editingRemainingRecords` and `openFindings` are
both zero:

```sh
python3 Scripts/czech-full-audit.py start-clean
```

Review the full snapshot again in manageable ranges. Each pass needs new
receipts. A clean approval requires an explicit no-findings assertion:

```sh
python3 Scripts/czech-full-audit.py show \
  --chunks 1-10 \
  --receipt /tmp/czech-clean-1-pass1.json \
  > /tmp/czech-clean-1-pass1.txt
python3 Scripts/czech-full-audit.py approve \
  --receipt /tmp/czech-clean-1-pass1.json \
  --note 'Independent full review of these rows found no new issue.' \
  --no-findings
```

Complete every chunk in pass 1, then repeat the entire locale with fresh pass 2
receipts. Receipts cannot be reused across passes because each clean pass has a
different `passId`.

If either clean pass finds an issue, record it, correct it through the draft
workflow, approve the changed row again in the editing phase, resolve the
finding, and start two clean passes on the new snapshot. Do not count editing
evidence or migrated legacy chunks as a clean pass.

## Migration and verification

Schema 1 migration is explicit:

```sh
python3 Scripts/czech-full-audit.py migrate
```

It writes an exact `full-audit-state.schema1.<sha256>.json` backup and imports
only legacy chunks whose source, glossary, and displayed content hashes can be
verified. Imported evidence counts only toward the editing phase.

Run the regression suite after changing the audit implementation:

```sh
python3 Scripts/test-czech-audit.py
```
