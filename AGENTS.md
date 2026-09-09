# Instructions for translation agents

Before starting or resuming a game localization, or preparing its task prompt,
read `Documentation/GAME_LOCALIZATION_PROMPT.md` in full. Apply its workflow
within the current user request: continue verified checkpoints, preserve the
glossary and editorial gates, and never loop on unchanged progress messages.
Reading this reference does not itself start a localization or authorize
publication, deployment, or changes outside the current request.

Read `Documentation/TRANSLATION_GUIDE.md` completely before changing translation files.
Read `Documentation/POLISH_IMPLEMENTATION_RUNBOOK.md` completely before changing Content Patcher includes, language assets, XNB fonts, installer packaging, or the Polish runtime configuration.
Read `Documentation/UZBEK_IMPLEMENTATION_RUNBOOK.md` completely before changing the shared VN language switcher or investigating the retired Uzbek package.

## Non-negotiable rules

- An unqualified request to translate, finish, check, review, proofread, or
  audit a glossary means the complete locale and the iterative editorial gate
  in `Documentation/TRANSLATION_GUIDE.md`: correct every objective issue and
  continue until two consecutive full all-entry audits find no new issue. Only
  an explicit report-only or no-edit instruction disables corrections. A first
  draft, sample review, or structural pass is not completion.
- Publish reviewed canonical glossary content with the generic SiteForMods CLI
  `npm run glossary:sync` after `npm run glossary:check` and only after explicit
  owner authorization. Do not deploy the site merely to publish a glossary and
  do not use the legacy Stardew-specific sync script as the routine publisher.
- The player-facing workflow stays simple: opening the app starts installation automatically; after success it shows **Запустить игру**. Do not reintroduce dependency lists, setup choices, or an uninstall dashboard unless the user explicitly asks.
- One app build contains one unified `PackageConfig.json` and one `ModPayload` that installs all finished VN Revival languages. Do not add a language picker to the installer: the app installs the complete set, and the player chooses a language inside Stardew Valley.
- Translation work belongs under `Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/`. Package identity and localized installer copy belong in `Resources/PackageConfig.json`. Do not modify XNB files inside the installed game's `Content` directory. Generated locale-specific XNB assets belong only under the source `ModPayload/assets/fonts/` and must follow the runbook.
- Keep `Format` only in the root `ModPayload/content.json`. Every secondary file loaded through `Include` must omit `Format`, have non-empty `Changes`, and be included exactly once.
- Every retained font-backed package must load locale-specific `Fonts/SpriteFont1`, `Fonts/SmallFont`, and `Minigames/TitleButtons` for its exact locale code. Every generated XNB character map must stay sorted by Unicode with the four SpriteFont metadata lists aligned; `UseLatinFont` alone does not provide missing glyphs.
- The shared Stardew Valley glossary is mandatory. Start with the repository snapshot in `Documentation/glossary/`, then check whether SiteForMods/CMS has a newer complete export. Apply the translation for the package's `siteLocale` by stable glossary ID consistently across UI, items, locations, quests, and dialogue. The glossary belongs to the game in SiteForMods and is shared by every language project; it is not owned by this installer.
- Translate from the original English text yourself. Do not call a machine-translation service and do not copy an official localization as the translation. Official localized assets may only be consulted to understand file structure or established control-token syntax.
- The ready English extraction on this machine is `/Users/antonkrutov/Developer/data/stardew-english-unpacked/`, and the pinned extractor is `/Users/antonkrutov/Developer/tools/xnbcli/xnbcli`. In xnbcli JSON, translate entries from the top-level `content` object. If the extraction is missing or stale, follow section 3 of the translation guide and extract only base XNB files without locale suffixes from the installed game.
- Never translate JSON keys, Content Patcher targets/actions, IDs, event commands, or control tokens. Preserve placeholders and markup exactly.
- Do not guess missing English keys or context. Inspect the matching English game asset. If the context remains ambiguous, leave the string for review and document the uncertainty.
- A glossary source URL is optional. Keep a link only when it points to a concrete page that actually documents that entry; otherwise omit it. Never manufacture a wiki URL from the term.
- Do not open the built installer just to inspect it: the release app intentionally starts installing as soon as it opens. Unit tests use temporary folders and are safe.

## Required completion checks

1. Every changed JSON file parses.
2. Every added translation patch is gated by its exact code from `languageCodes` in `PackageConfig.json`.
3. All source keys and placeholders still match the English source.
4. Glossary terms for the package's `siteLocale` are applied consistently.
5. `swift test --disable-sandbox` passes with the Xcode toolchain.
6. `./Scripts/build-app.sh` succeeds when producing a deliverable.
7. A fresh SMAPI launch loads the locale-specific fonts and each retained language's `TitleButtons` without any adjacent Content Patcher error; visual QA covers Polish `ĄĆĘŁŃÓŚŹŻąćęłńóśźż` and the complete character sets used by the retained packages.
