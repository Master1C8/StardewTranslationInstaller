# Third-party notices

The installer downloads these unmodified official releases at the user's request:

## SMAPI 4.5.2

- Project: https://github.com/Pathoschild/SMAPI
- Release: https://github.com/Pathoschild/SMAPI/releases/tag/4.5.2
- License: LGPL-3.0
- Archive SHA-256: `dd01ddca7b566bfe0d3b3d2d03833496abc56c53da976241f2ab443f5484acc4`

## Content Patcher 2.9.1

- Project: https://github.com/Pathoschild/StardewMods/tree/develop/ContentPatcher
- Official distribution file: https://www.curseforge.com/stardewvalley/mods/content-patcher/files/7759981
- License: MIT
- Archive SHA-256: `22962ecbeda204d207f66f4dded727a2ce67134f7decdd249c1024bbc4576817`

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
- Variants: Noto Sans CJK Traditional Chinese Regular and Light
- License: SIL Open Font License 1.1
- Regular font SHA-256: `dce08bd4fd91aa8aa76ed8fea4b694c2dfb8550f67871e326843212ddbeb88b4`
- Light font SHA-256: `a49db53f6aac529d91a036606e55d68e2ab1df1360f507504ac4ff2cbb0f9407`

The pinned font is downloaded only when rebuilding the Traditional Chinese
runtime fonts. The distributed XNB assets use antialiased Regular at 36 and 24
pixels, plus the custom-language BMFont at 16 pixels and a twofold in-game
pixel zoom.

## Cubic 11 1.500

- Project: https://github.com/ACh-K/Cubic-11
- Release: https://github.com/ACh-K/Cubic-11/releases/tag/v1.500
- Variant: Cubic 11 / 俐方體11號 Regular
- License: SIL Open Font License 1.1
- Font SHA-256: `0193f5f033612496df6b45ee92ac3b335bc6a5a24ff95da55ca87b33e57dcf62`

The pinned helper remains available for comparison builds of the Traditional
Chinese runtime BMFont. The current distributed runtime assets use Noto Sans
CJK TC instead.
