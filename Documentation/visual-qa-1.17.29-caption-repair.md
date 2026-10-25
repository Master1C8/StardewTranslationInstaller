# Character-creation caption repair and retained evidence

The 799da933 native capture set uses switcher DLL SHA-256
`01df06cee111549eca6642bd65408491c77c33c03f8ccab0c8b5fc3459ea779f`.
Russian `Волосы` and Serbian `Кошуља` touch the left selector arrow.
Their original failure reports remain in `dist/1.17.29-gallery/review/`.

The repair shares the existing RTL caption placement with VN LTR locales:
center each appearance caption on the actual arrow gap and place it 28 pixels
above the value. Draw-finalization restores both text and bounds. This preserves
the translated wording, font, native value and navigation components.

Only `CharacterCustomization.draw` changes rendering behavior. The prefix returns
for unsupported creation sources and co-op help. The new shared method is called
only by that prefix. Title captures have no character-creation submenu; Gus dialogue,
inventory and journal use their own menus. Their renderer paths, fonts, localized
content and bridge capture method remain unchanged. Retain their original PNG bytes,
capture DLL identity and review receipts. Do not relabel them as captures from the
repaired DLL. Reuse is conditional on verifying that the final diff changes no other
rendering path or content dependency.

Create an explicit four-scene review manifest (orders 1, 3, 4, 5) from each full
capture manifest. Review every retained frame. Capture order 2 separately using
`run_visual_qa.py --bridge --character-only` after installing the repaired DLL;
require native dimensions, three exact locale font loads, no Content Patcher errors,
background foreground-state receipts, preference restoration and unchanged save hashes.
Review every replacement original. The final gallery must have all five slots for
all twenty locales; splitting the dependency scopes does not reduce coverage.

Regression: Russian hair and Serbian shirt captions must clear the arrows. Every
locale's creation frame must also retain clearance from gender controls, neighboring
rows, portrait ornaments and input borders. Preserve the Ukrainian and Filipino
favorite-caption fixes, native values and cursor-free capture. RTL joining/order,
caption alignment and mixed tokens remain mandatory checks.

The runner's default still captures all five scenes. The repair-only mode requires
one exact locale and the guarded bridge; it skips save loading and world interactions,
while retaining the same launch/stop, preference restoration and save-hash checks.
Never modify an active capture job's installed DLL or pinned execution inputs.
