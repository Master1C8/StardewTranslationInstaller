# Latin American Spanish glossary audit log

The audit denominator is the complete 673-entry canonical Stardew Valley
glossary. Any new objective finding resets the consecutive-clean-pass count.

## Corrective pass — 2026-09-14

Reviewed all terms and meanings against the English source in source order.
Corrected internal terminology, source-fidelity, Latin American register,
gender coverage, capitalization, and phrasing findings. This pass is not
counted as clean because it produced changes.

## Clean pass 1 — 2026-09-14

- Reviewed all 673 entries after the corrective pass.
- Confirmed exact source ID coverage and order: 673/673, with no missing,
  extra, empty, or invalid entries.
- Confirmed the repository snapshot exactly matches the canonical working
  layer (SHA-256
  `3683203309d03e95213bdce468c826232116b769509b2245daff45e144ec3ab6`).
- Checked source alternatives, numeric facts, punctuation, neutral
  Latin American vocabulary, retained proper names, and cross-entry term
  consistency.
- `./vnrevival glossary check` passed for all SiteForMods glossaries.

Consecutive clean full-entry audits: **1/2**.

## Clean pass 2 — 2026-09-14

- Re-audited the complete 673-entry layer after pass 1 with the independent
  `Scripts/audit-es-419-glossary.py` verifier.
- Confirmed all 12 reviewed-against-English batches merge without duplicate or
  missing IDs and reproduce the canonical SiteForMods layer byte-for-byte at
  the data level.
- Rechecked Unicode normalization, whitespace and punctuation, all numeric
  facts, source alternatives, intentionally retained names and loans, and the
  Latin American vocabulary exclusion list.
- Re-ran the generic SiteForMods glossary check successfully; no new objective
  finding was produced.

Consecutive clean full-entry audits: **2/2**. The glossary is locked for use by
the game translation. Publication remains unauthorized and was not performed.
