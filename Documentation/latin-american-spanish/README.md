# Latin American Spanish localization checkpoint

- Site locale: `es-419`.
- Runtime language code: `es-419-vnrevival`.
- Supported source: Stardew Valley 1.6.15 build 24356.
- Canonical English glossary: 673 entries in SiteForMods.
- Canonical game inventory: 14,720 unique `(Target, key)` records across 187 assets.

All Spanish wording is authored directly from the canonical English source. The
official `es-ES` assets may be inspected only for format or control syntax and
are not a translation source.

Glossary batches live in `glossary-batches/` and are applied with:

```sh
python3 Scripts/es-419-glossary.py apply Documentation/latin-american-spanish/glossary-batches/<batch>.json
python3 Scripts/es-419-glossary.py audit
python3 Scripts/es-419-glossary.py next --count 50
```

Structural completion does not establish editorial readiness. After all 673
entries are present, the complete layer must pass two consecutive full-entry
audits without new objective findings before it can be locked and used for the
game translation.

The glossary passed that gate at 673/673 and is locked. Game batches live in
`batches/` and are applied only after line-by-line review against the pinned
English asset:

```sh
python3 Scripts/es-419-work.py next Strings/WorldMap --count 60
python3 Scripts/es-419-work.py apply Documentation/latin-american-spanish/batches/<batch>.json
python3 Scripts/es-419-work.py audit
```

`coverage.json` is the authoritative reviewed-record count. Technical-only
records are preserved unchanged only when their complete source asset has a
documented classification in `technical-source-review.json`.
