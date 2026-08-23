# Malayalam font rendering

Stardew Valley's `SpriteFont` and BMFont renderers draw one UTF-16 character
at a time and do not perform Indic shaping. Raw Malayalam text therefore
renders dependent signs and conjuncts as separate, overlapping glyphs.

The canonical translation remains readable Malayalam in
`ml-translation-cache.json` and `Documentation/glossary/glossary.ml.json`.
`Scripts/build-malayalam-patches.mjs --build` segments each Malayalam run into
grapheme clusters, assigns those clusters deterministic BMP private-use glyphs,
and writes the mapping to `Documentation/malayalam-cluster-map.json`. Control
tokens, placeholders, Latin text, numbers, punctuation, and event programs are
left unchanged.

The game-facing patch files contain the private-use characters. The four font
assets map each private-use character to the corresponding fully shaped
Malayalam cluster:

- `SpriteFont1.xnb`
- `SmallFont.xnb`
- `Malayalam.xnb`
- `Malayalam_0.xnb`

Rebuild the dynamic fonts and the pre-rendered menu labels on macOS with:

```sh
node Scripts/build-malayalam-patches.mjs --build
Scripts/build-malayalam-cluster-fonts.sh
Scripts/build-malayalam-static-labels.sh
```

The font scripts use CoreText with Malayalam Sangam MN, pack the generated
atlases through xnbcli, and round-trip unpack all four XNB files. The Malayalam
audit decodes the cluster mapping before comparing text with English and the
glossary, and also rejects raw Malayalam codepoints or unknown private-use
glyphs in the game-facing patches.
