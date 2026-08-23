# Kannada translation status

- Locale: `kn-vnrevival` (`ಕನ್ನಡ`)
- Stardew Valley source version: `1.6.15`
- Source text: base English unpacked assets only
- Russian and Polish assets: structure/key coverage reference only
- Translation coverage: `14,720 / 14,720` unique `(Target, key)` records (`100%`)
- Content Patcher files: `151 / 151` included
- Final glossary: `673 / 673` stable IDs
- Final glossary SHA-256: `c9a0493d29a13cdc4ca93f0566e13e9df32d7a5f173343b6b1e81e540eed1b73`
- Exact full-record glossary checks: `625`
- Structural audit: `0` warnings, `0` errors
- Editorial checks: `0` duplicate-word, spacing, residual-English, and capitalization defects
- Swift tests: `8 / 8` passed
- Expected public release: `2026-09-01`

The glossary was manually reviewed twice in full, checked against the English
layer, applied to the translation, and published through the official VN
Revival CLI. Contextual Kannada inflection is allowed in prose; exact display
values are enforced against the canonical glossary by `audit-kannada.mjs`.

The language uses dedicated `SpriteFont1`, `SmallFont`, and dialogue bitmap
fonts generated with Noto Sans Kannada. The `ಕನ್ನಡ VN` language button and
Kannada title-menu labels are derived from the base English game atlases.
All four packed font XNB files pass a complete xnbcli unpack round trip.

The current local installer was run against the detected Steam installation.
The installed `content.json` matches the release build byte-for-byte, and the
fresh SMAPI log confirms that Content Patcher loaded `ButtonKannada` from the
unified language pack version `1.3.0`.

Verification commands:

```sh
node Scripts/audit-kannada.mjs /path/to/stardew-english-unpacked /path/to/glossary.kn.json
node Scripts/audit-kannada-editorial.mjs /path/to/stardew-english-unpacked --report=summary
swift test --disable-sandbox
Scripts/build-app.sh
```

No mod archive is published on VN Revival before the expected release date.
