# Language button template

`language-button-template.png` contains the text-free normal and hover frames
recovered from Stardew Valley 1.6.15's `LooseSprites/LanguageButtons.xnb`.

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
