# Bulgarian runtime fragment review

Inspected the installed 1.6.15 assembly as data with System.Reflection.Metadata,
without starting the game or changing installed assets. Assembly SHA-256:
`8937c582cad1c1127017944778c4102467bf299aea44869491f28ab0ec84cd73`.

## Fish pond quantities

`PondQueryMenu.UpdateState` first formats `neededItemCount` as a number
(IL_00A2–00C3). If the count is <= 1 it obtains an article, falling back to
`Strings/UI:PondQuery_StatusRequestOneCount` (IL_00C4–010E).
`Lexicon.getProperArticleForWord` returns the empty string for every language
except English (IL_0000–000C), including custom languages.
`Lexicon.makePlural` likewise returns the supplied name unchanged outside
English (IL_0000–000E). The request templates receive item name as {0},
quantity/article as {1}, and the original item name as {2}.

`FishPond.TryGetNeededItemData` defaults quantity to 1, or reads the explicit
quantity/range from PopulationGates. All 204 base English request alternatives
in the freshly extracted Data/FishPondData have positive minimum quantities
(the smallest is 1). Completed requests branch away before pending text.

Therefore Bulgarian uses `1` for the singleton fragment and `{1} × {0}` in
pending requests. It expresses the actual requested quantity without relying
on nonexistent Bulgarian pluralization or guessing the item's grammatical gender.
The validator permits this exact source-key/value conversion only; other numeric
changes are still errors. The fragment is a reviewed localization, not unchanged
English. Completion templates use impersonal constructions for the same reason.

Reviewed composed requests with singleton and multiple quantities and masculine,
feminine, neuter, plural and mass-noun labels. No empty article or English `some`
remains when all Bulgarian batches are active. Runtime visual verification is
still required by the release gate.

## Building announcements and house possessives

`GameLocation.buildStructure` and `CarpenterMenu.receiveLeftClick` send
`aOrAn:` plus the building's tokenized name as chat argument {1}. The receiving
chat parser calls `Utility.AOrAn`. Unlike the Lexicon article helper, this
method returns English a/an even for custom languages. The shared language
switcher now applies a postfix only when the exact active mod locale is
`bg-vnrevival`, replacing that article with the empty string. All template
arguments remain present, and `{1}{2}` renders only the Bulgarian building name.
Other locales keep the original result.

The switcher compiled successfully. `Scripts/check-bulgarian-runtime.py` tested
the compiled postfix against actual LocalizedContentManager state: 20 cases
across Bulgarian, Polish, Arabic, Persian and English, with Latin and Cyrillic
noun initials. All passed. This directly invokes the compiled postfix; it does
not claim a live SMAPI Harmony test. The isolated Harmony host could not load
SMAPI's version-remapped MonoMod.Common dependency. Fresh SMAPI verification
of patch registration and building announcements remains a release requirement.

Only houseUpgradeAccept calls getTokenizedPossessivePronoun in the installed
assembly. Its subject is the farmer whose home is being upgraded. Bulgarian
`Possessive_Pronoun_Male` and `Possessive_Pronoun_Female` should both be `своя`,
composing `{0} поръча строителни работи по своя дом!` for either gender.
The BirthingEvent chat passes gendered child term and object pronoun in
arguments {2} and {3}, confirming the existing Chat_Baby dependency.

NameChange_EasterEgg6 calls Lexicon.getProperArticleForWord, so {0} is already
empty in Bulgarian and can be adjacent to {1}, with every placeholder preserved.

## Applied Lexicon vocabulary

All 20 Lexicon records are applied in 0018-lexicon. Both `момче` and `момиче`
are neuter, so both object pronouns are `го`; the initial speculative female
`я` was never applied. Composed male/female baby and house announcements were
read and confirmed grammatical after application.

The installed assembly's Lexicon consumers are NPC.loadCurrentDialogue,
FishShop/ShopLocation.getPurchasedItemDialogueForNPC, birth-event setup/chat,
and the PositiveAdjective token resolver. The adjective pool's Male/Female
suffix describes the speaker's vocabulary, not the grammatical gender of the
thing being described. Bulgarian adjective pools therefore use neuter/adverbial
forms. Future Data/ExtraDialogue templates must adapt their surrounding grammar:
smells refer to `ухание/миризма на нещо {adjective}`, food can be `нещо
{adjective}`, and the chef compliment must accept adverbial vocabulary. Random
negative item nouns have mixed genders; their parent clauses must not assume a
gendered determiner. NPC.cs.4135/4138 similarly need a neuter construction.

All source alternatives remain ordered with the same # separators. The
incremental validator now checks nonempty alternatives as well as marker parity.
