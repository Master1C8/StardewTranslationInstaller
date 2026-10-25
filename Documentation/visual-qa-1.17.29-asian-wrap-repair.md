# Native Asian SpriteFont wrapping for custom languages

The Traditional Chinese Introductions source is complete in `quests.json`:
the sentence continues after `有些`. The original screenshot lost that continuation
at the journal scissor boundary. This is a renderer defect, not a translation omission.

`Game1.parseText` selects its Asian branch only for built-in `ja`, `zh`, and `th`
language enums. VN Traditional Chinese and Thai use the custom `mod` enum and took
the Latin word/space branch. The shared postfix now uses the game's own
`asianSpacingRegex`, original gender-block expansion and SpriteFont measurements
for exact `zh-TW-vnrevival` and `th-vnrevival` codes. It preserves authored text,
punctuation groups and explicit line breaks; CRLF is one break. No wording changes.

The extended runtime probe checks complete character preservation, bounded line
width, an exact CJK boundary, mixed `zc 3/28`, Thai, punctuation, CRLF and an unwrapped
positive control using real MonoGame font metrics. Its GPU boundary remains replaced;
native captures must separately prove the actual journal and neighboring surfaces.
Existing real-Harmony Hebrew/Arabic/Persian paragraph and argument tests also pass.

Capture all five scenes on both affected Asian locales with the repaired DLL, review
all originals and require the full Traditional Chinese sentence plus progress. All
other locales retain earlier original capture hashes and source identities: the new
conditional branch does not execute for them. The prior fifteen-locale creation/date
repair captures use `6260e26b` and DLL
`04041b4f464f297719199ecb5c90fbfd4e83de3887175e9803ee44d9c334ac8a`.
Do not relabel those as captures from the later DLL. Content and fonts remain unchanged
by this wrapping repair. Bulgarian name corrections have a separate affected closure.
