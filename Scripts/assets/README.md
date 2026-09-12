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

`title-button-overlays.png` contains the approved complete 888×174 main-menu
row for each of the 19 retained locales, in installer order. Each 222×174 cell
already contains its frame, parchment, text, and icon. The source sheet is
cropped to its left 888 pixels without resampling; the localization labels at
the right of the presentation image are not retained:

```sh
/usr/bin/python3 Scripts/extract-ready-title-buttons.py \
  /path/to/language_menu_exact_222x174.png \
  Scripts/assets/title-button-overlays.png
```

`generate-title-buttons.py` cuts that sheet into
`title-overlays/TitleButtons-*.png`. The shared language switcher draws each
222×174 cell directly into the matching 222×174 game button bounds with white
colour multiplication. It does not scale, filter, recolour, redraw, or process
the supplied art. Because the approved sheet has one state, hover uses the same
image.
