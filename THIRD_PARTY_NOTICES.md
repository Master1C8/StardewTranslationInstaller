# Third-party notices

The installer downloads these unmodified official releases at the user's request:

## SMAPI 4.5.2

- Project: https://github.com/Pathoschild/SMAPI
- Release: https://github.com/Pathoschild/SMAPI/releases/tag/4.5.2
- License: LGPL-3.0
- Archive SHA-256: `dd01ddca7b566bfe0d3b3d2d03833496abc56c53da976241f2ab443f5484acc4`

## Content Patcher 2.9.0

- Project: https://github.com/Pathoschild/StardewMods/tree/develop/ContentPatcher
- Official distribution file: https://www.curseforge.com/stardewvalley/mods/content-patcher/files/7448774
- License: MIT
- Archive SHA-256: `a6681b105b8f5d13300f0a9ff0324e6368291db3a6074d806c78b37a65bbad99`

The archives are downloaded to a temporary directory, verified before use, and deleted when the operation ends.

## Fusion Pixel Font 2026.09.01

- Project: https://github.com/TakWolf/fusion-pixel-font
- Release: https://github.com/TakWolf/fusion-pixel-font/releases/tag/2026.09.01
- Variant: Fusion Pixel 12px Proportional Traditional Chinese (`zh_hant`)
- License: SIL Open Font License 1.1
- Archive SHA-256: `cf607641a61c721cd58409fa58a1ccf432e97d9ad25e76687948fa3027246fee`
- Font SHA-256: `743ddb744884f81289bc7422a936d251615a721c804415fdb820aa55369494f6`

The pinned font is downloaded only when rebuilding the Traditional Chinese
menu assets. The distributed PNG assets contain rasterized glyphs derived
from this font.

## Noto Sans CJK TC 2.004

- Project: https://github.com/notofonts/noto-cjk
- Release: https://github.com/notofonts/noto-cjk/releases/tag/Sans2.004
- Variant: Noto Sans CJK Traditional Chinese Regular (`NotoSansCJKtc-Regular`)
- License: SIL Open Font License 1.1
- Font SHA-256: `dce08bd4fd91aa8aa76ed8fea4b694c2dfb8550f67871e326843212ddbeb88b4`

The pinned font is downloaded only when rebuilding the Traditional Chinese
runtime fonts. The distributed XNB assets contain rasterized glyphs derived
from this font at native 36, 24, and 32 pixel sizes so complex ideographs
remain legible.
