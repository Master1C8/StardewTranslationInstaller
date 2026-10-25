# Inventory date boundary repair

Complete native review of 799da933 found the final year digit overlapping the
inventory frame in Polish, Vietnamese and Indonesian. Polish boundary inspection
confirmed that the glyph is complete; the defect is frame overlap, not proven
glyph clipping. Preserve the original findings and failed screenshots.

The shared Utility string renderer now recognizes the exact native inventory date
call: VN LTR custom locale, dialogue font, active inventory page, original date-row
Y coordinate and complete current `Utility.getDateString()` text. It measures actual
glyph ink using the same cached SpriteFont metrics as the creation-label repair.
Only an overflowing date moves horizontally into the available row beside the portrait.
It preserves wording, font, baseline and native shadow/color/scale rendering. The safe
right edge is the page width minus its native border and twelve pixels of clearance.
The portrait's right edge plus twenty-four pixels defines the left limit. A date
wider than that corridor is not silently scaled or truncated; visual QA must reject it.

This extends the caption-only dependency closure in
`visual-qa-1.17.29-caption-repair.md`. Title, dialogue and journal paths remain unchanged.
Inventory evidence may be reused only when the final native trace proves no date
relocation for that exact locale/date/font/layout, or when original and replacement
PNG hashes match. Any relocated inventory frame needs a new original and full review.
Character-creation frames need their separate affected review. RTL date rendering
is untouched, and the extracted RTL appearance-caption helper preserves its prior body.

Use `--bridge --repair-scenes 02-character-creation 04-item-description` to capture
only these affected surfaces in one native session. With one selected scene only that
surface is captured. World captures retain normal-load and QuickSave guards; creation
alone skips save loading. Default capture still covers all five scenes. Each run must
finish restoration before model review. Keep exact capture DLL hashes per original;
do not rewrite old receipts to claim a newer capture version.

Regression: final year digit and shadow must have visible padding before the wood
frame in Polish, Vietnamese and Indonesian. Short dates already inside the panel
must retain their native position. Every affected locale retains complete wording,
glyphs, player name, funds, earnings and the axe tooltip. Check adjacent menus too.
