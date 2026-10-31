# Stardew Valley installer 1.17.30

The macOS installer now treats a restored vanilla game launcher as a broken
SMAPI installation, even when the SMAPI DLL has the required version. It
reapplies the checksum-pinned official installer and requires executable
launcher/runtime files and an active SMAPI invocation before reporting success.
The automatic install and in-game language selection workflow is unchanged.

Both platform packages include the approved Bulgarian Gus-name corrections,
right-aligned RTL tooltip headings/categories, and the corrected Persian title
label position. The source capture bridge retains its background/hidden-window
guards. Independent Bulgarian review covers the original 68-record dependency
closure and the final 11-record correction delta; the original 14 changes and
the 11 delta changes preserve every other translated value.

The native regression covers a current DLL beside a vanilla launcher with a
commented SMAPI reference, missing/non-executable runtime and launcher files,
and restored positive controls. Game-discovery fixtures use an isolated home
directory so the owner's installed game cannot shadow the mounted-volume test.
The Ukrainian data auditor no longer requires an earlier app in `dist`; final
deep strict signing verification remains in the common release audit.

Validation and artifact provenance are recorded under the canonical project's
`dist/macos-launch-repair-20261031/` and the final versioned release directory.
Automated installer repair, native capture, visual review and archive publication
have separate receipts. A technical test is not a visual judgment.
