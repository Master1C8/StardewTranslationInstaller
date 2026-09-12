# Language button template

`language-button-template.png` contains the text-free normal and hover frames
recovered from Stardew Valley 1.6.15's `LooseSprites/LanguageButtons.xnb`.

`language-button-labels.png` contains the approved native-resolution pixel
lettering for all 19 VN Revival language buttons, in selector order. It is
derived directly from the owner's two visual references, rather than rendered
from substitute system fonts. To rebuild it from those 1774x887 references:

```sh
/usr/bin/python3 Scripts/extract-reference-language-labels.py \
  /path/to/language-page-1.png \
  /path/to/language-page-2.png \
  Scripts/assets/language-button-labels.png
```

Regenerate it from an unpacked original atlas with:

```sh
/usr/bin/python3 Scripts/extract-language-button-template.py \
  /path/to/LanguageButtons.png \
  Scripts/assets/language-button-template.png
```

The extractor combines all original labels and chooses an original background
pixel wherever another label leaves that coordinate uncovered. This retains
the game's wooden frame, parchment boundary, texture, and both hover colors
without interpolating or repainting any part of the button.

`title-button-template.png` is the text-free 296×116 strip containing the four
main-menu buttons in both states. It is recovered from the official localized
`Minigames/TitleButtons` atlases so that translated labels never inherit pixels
from another language. Regenerate it with:

```sh
/usr/bin/python3 Scripts/extract-title-button-template.py \
  Scripts/assets/title-button-template.png \
  /path/to/unpacked/TitleButtons*.png
```

`title-button-labels.png` contains the approved 3× screen-resolution lettering
for the four main-menu buttons in all 19 retained locales, in installer order.
It is extracted from the owner's 977×1610 visual reference with continuous
alpha coverage, so curves remain smooth. Generated `TitleButtons` atlases keep
only the original frames, parchment, icons, and hover art; the shared language
switcher draws each locale's `title-overlays/TitleLabels-*.png` at screen scale.
This avoids Stardew's point-sampled 74×58 atlas cells, which make either blocky
or blurry text:

```sh
/usr/bin/python3 Scripts/extract-reference-title-labels.py \
  /path/to/approved-title-menu-reference.png \
  Scripts/assets/title-button-labels.png
```

Arabic also uses `title-overlays/TitleBack-arabic.png` for the 66×27 back
button. `build-arabic-static-labels.sh` clears the tiny atlas label and renders
the replacement at the button's native 264×108 screen size; the switcher keeps
it centered and scales it with the stock hover animation.
