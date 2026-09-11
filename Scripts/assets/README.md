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
