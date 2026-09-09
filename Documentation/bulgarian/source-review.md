# Bulgarian source completeness investigation

The ready English extraction has 187 JSON assets and 14,720 string records.
`Strings/credits` is a list of 78 strings, counted by zero-based index; it is
not missing. Fresh pinned-xnbcli extraction of `Strings/UI` and `Strings/credits`
matched the existing content. The installed game reports 1.6.15 build 24356.

Comparing suffixless installed Data, Strings and Characters/Dialogue assets
against the ready extraction found 51 additional Data assets. The existing
xnbcli cannot deserialize their typed GameData readers. The local supplement
extractor solves this using the installed game's ContentManager and GameData
assemblies in an isolated temporary console program. It reads source XNB files
without launching Stardew Valley, SMAPI or the installer and without writing
to Content, Mods or saves. All 51 extractions succeeded.

The ignored `.bulgarian-source/supplement` directory holds the English evidence;
`supplement-review.json` pins its asset hashes and unresolved display fields.
`Data/Events/IslandFarmHouse` and `Data/Events/Tent` are genuinely empty objects.
Most typed display fields are LocalizedText references into the inventoried
Strings assets. SpecialOrder bracket references point into SpecialOrderStrings.
Movie-reaction values `love`, `like` and `dislike` are internal response enums,
not dialogue. Item Name fields, tile property Name fields, random token names,
texture paths, event commands and IDs must remain technical data.

Five literal display fields sit outside the original baseline. Farmhouse Name
and Description are read by the carpenter blueprint UI, and Turtle DisplayName
is inserted into the adoption question; all three are translated and counted.
The `???` character DisplayName is the intentional mystery label and contains
no English text. The jukebox entry `_disabled_` has Available=false and uses
Name `Invalid` as an internal sentinel. Those two values are preserved with
explicit reasons and counted.

Forty-three LocationData entries have null DisplayName values. They are
structural nulls, not missing English strings. GameLocation.DisplayName first
inherits a parent display name and otherwise returns the internal location
identifier. The installed assembly uses this fallback for technical identity,
including an exact comparison with `Temp`, and the base data contains no
`[LocationName ...]` token that exposes any of these 43 identifiers as vanilla
player-facing copy. Replacing the nulls would therefore invent source text and
could change behavior. They are excluded from the string denominator.

The final inventory contains 238 source assets and 14,725 reviewable strings.
Reviewed game batches have source and glossary hashes, and only applied,
hash-matched editorial records contribute to coverage. The glossary and
engineering preparation do not contribute to game-string coverage.


Installed-assembly evidence was collected with Mono.Cecil from Stardew Valley
1.6.15 build 24356. Direct callers use location display names for buildable
location choices, the farm computer, the `LocationName` token resolver and a
companion `Temp` sentinel check. The Farm override supplies its localized farm
name, no vanilla source invokes the token resolver for the 43 null entries, and
the sentinel proves that at least one raw fallback is deliberately technical.
