# Stardew Valley — VN Revival Translation Installer

Единый нативный установщик языковых пакетов VN Revival для Stardew Valley. Текущая сборка за один запуск устанавливает русский, сербский, польский, украинский, вьетнамский, суахили, персидский, арабский, индонезийский, филиппинский, нидерландский, хинди-, традиционно-китайский, румынский, болгарский, тайский, греческий и чешский переводы, а также перевод на иврит. Пользователь просто открывает приложение: оно автоматически устанавливает всё необходимое и показывает кнопку запуска игры.

Все языки находятся в одном Content Patcher-пакете, но регистрируются в игре независимо (`ru-vnrevival`, `sr-vnrevival`, `pl-vnrevival`, `uk-vnrevival`, `vi-vnrevival`, `sw-vnrevival`, `fa-vnrevival`, `ar-vnrevival`, `id-vnrevival`, `fil-vnrevival`, `nl-vnrevival`, `hi-vnrevival`, `zh-TW-vnrevival`, `ro-vnrevival`, `he-vnrevival`, `bg-vnrevival`, `th-vnrevival`, `el-vnrevival`, `cs-vnrevival`). Интерфейс установщика остаётся однокнопочным; выбора языков перед установкой нет.

## Что уже работает

- автоматическое обнаружение Steam-версии Stardew Valley на macOS;
- автоматический старт установки сразу после открытия приложения;
- автоматическая загрузка SMAPI 4.5.2 и Content Patcher 2.9.1;
- обновление найденных, но устаревших SMAPI и Content Patcher до закреплённых версий;
- проверка SHA-256 каждого загруженного архива до запуска или распаковки;
- атомарная установка и обновление только принадлежащего приложению мода;
- запуск игры через Steam одной кнопкой после установки;
- девятнадцать независимых локалей VN Revival в меню выбора языка;
- отдельные кнопки, титульные атласы и локальные шрифты для нужных языков;
- безопасная миграция старых отдельных пакетов VN Revival в единый пакет;
- отдельная папка `assets/translations`, куда добавляются патчи перевода.

Установленная на этой машине игра имеет версию 1.6.15. Если SMAPI или Content Patcher отсутствуют, приложение скачает и установит их само, а затем добавит языковой пакет. Если игру не удастся найти автоматически, появится простой выбор папки.

Загрузки закреплены по версии и контрольной сумме. Обновлять URL и SHA-256 следует вместе в `DependencyInstaller.swift`; при несовпадении установщик прекращает работу.

## Сборка

После первого клонирования подготовьте закреплённую локальную среду:

```sh
mise install
uv sync
brew install lz4
```

`mise.toml` выбирает полный Xcode, Node.js 22.23.2 и Python 3.14.6. `uv sync`
создаёт изолированное `.venv` с Pillow и FontTools для генерации и проверки
изображений, шрифтовых таблиц и Unicode coverage. Окружение не добавляется в
Git и восстанавливается из `pyproject.toml` и `uv.lock`.
`liblz4` используется только локальным упаковщиком XNB; путь к нестандартной
установке можно передать через `LZ4_LIBRARY`.

```sh
./Scripts/build-app.sh
```

Готовое универсальное приложение (`arm64` + `x86_64`) появится в
`dist/Stardew Translation Installer.app`. Локальная сборка подписывается ad hoc.
Для распространяемого релиза нужны Developer ID и сохранённый профиль Apple
notarytool:

```sh
CODESIGN_IDENTITY='Developer ID Application: …' \
NOTARY_KEYCHAIN_PROFILE='vn-revival' \
./Scripts/build-release-app.sh
```

Релизный сценарий включает hardened runtime, timestamp, нотариализацию и staple;
без обеих переменных он останавливается до создания распространяемого архива.

## Тесты

```sh
./Scripts/release-audit.sh
```

Полный Xcode выбирается через shell-профиль, `mise.toml` и сам сборочный
сценарий. Тесты используют временную фиктивную установку игры и не затрагивают
настоящую Stardew Valley.

Единый локальный технический gate проверяет JSON, запускает доступные отдельные
data/editorial gates сохранённых локалей и Swift-тесты, затем измеряет 31
фиксированную подпись редактора персонажа во всех
19 локалях по метрикам соответствующих игровых `SmallFont` и отклоняет строки,
которые заходят в соседние поля, стрелки, ползунки или флажки.

Он также распаковывает растровые шрифты всех дополнительных языков и
проверяет, что все 74 XNB используют совместимое с MonoGame LZ4-сжатие и что в
каждом атласе есть все символы соответствующего перевода.
Затем пересобирает общий language switcher, запускает изолированные runtime-пробы
иврита, персидского, арабского, сербского, греческого и болгарского, собирает
приложение, проверяет подпись и обе архитектуры. Публикация глоссариев и live
visual QA остаются отдельными обязательными проверками и этим техническим
сценарием не подменяются.
Расширенные латинские, кириллические и греческие атласы пересобираются командой
`./Scripts/build-extended-bitmap-fonts.sh`; при необходимости ей можно передать
имена отдельных каталогов локалей, например `greek czech`.
После любой регенерации XNB нужно снова применить детерминированное сжатие:

```sh
./Scripts/compress-xnb-fonts.swift
```

Сценарий использует raw LZ4 block format, устанавливает XNB-флаг `0x40` и сразу
проверяет точный round-trip. `build-app.sh` и release-аудит отклоняют несжатые
XNB, чтобы они случайно не вернулись в установщик.

## Приватный репозиторий

Каноническая внешняя копия исходников хранится в приватном репозитории
[`Master1C8/StardewTranslationInstaller`](https://github.com/Master1C8/StardewTranslationInstaller),
настроенном локально как `origin`. Репозиторий должен оставаться приватным.

GitHub хранит только закоммиченные исходники и историю Git. В него не входят
локальные `.build*`, `dist`, зависимости, секреты, сертификаты подписи и готовые
архивы релизов. Перед резервным push нужно проверить выбранные файлы и затем
отправить `main`:

```sh
gh auth status
git status --short
git push origin main
```

На новом Mac исходники восстанавливаются командой
`gh repo clone Master1C8/StardewTranslationInstaller`. Авторизация GitHub CLI
хранится в macOS Keychain текущего пользователя и не переносится на другой
компьютер автоматически.

## Сторонние компоненты

Приложение загружает официальные архивы во временную папку и удаляет их после установки; бинарники не включены в репозиторий. SMAPI распространяется под LGPL-3.0, Content Patcher — под MIT. Подробности и закреплённые версии перечислены в `THIRD_PARTY_NOTICES.md`.

## Структура мода

- `manifest.json` — метаданные Content Patcher-пакета;
- `content.json` — регистрация девятнадцати дополнительных языков и подключение всех переводов;
- `assets/button*.png` — отдельные двухкадровые кнопки языков;
- `assets/title/TitleButtons*.png` — локализованные атласы главного меню;
- `assets/fonts/{russian,serbian,polish,ukrainian,vietnamese,swahili,persian,arabic,indonesian,filipino,dutch,hindi,traditional-chinese,romanian,hebrew,bulgarian,thai,greek,czech}/*.xnb` — локализованные игровые шрифты;
- `assets/translations/{russian,serbian,polish,ukrainian,vietnamese,swahili,persian,arabic,indonesian,filipino,dutch,hindi,traditional-chinese,romanian,hebrew,bulgarian,thai,greek,czech}/*.json` — языковые патчи с независимыми условиями.

Официальная документация: [Custom languages](https://stardewvalleywiki.com/Modding:Custom_languages), [Content Patcher](https://github.com/Pathoschild/StardewMods/blob/develop/ContentPatcher/docs/README.md), [SMAPI](https://github.com/Pathoschild/SMAPI).

## Продолжение перевода

Для новой игры или следующего языка используйте
[`универсальный промпт локализации`](Documentation/GAME_LOCALIZATION_PROMPT.md).
Заполните игру, путь к репозиторию, slug SiteForMods и язык; один запуск — одна
локаль. Обязательное чтение шаблона закреплено в `AGENTS.md`.

Для подключения того же правила ко всем игровым проектам на этой машине:

```sh
python3 Scripts/install-localization-workflow.py
```

Команда сохраняет копию в `~/.codex/instructions/game-localization-prompt.md`
и добавляет обязательную ссылку в общие инструкции `sitefor-mods.md`, на которые
уже ссылается глобальный `AGENTS.md`. `--check` проверяет подключение без записи;
`--dry-run` показывает необходимые изменения. После переноса проекта на другую
машину повторите подключение. Правки универсального шаблона храните в Git и
обновляйте установленную копию командой с `--update`; она сохраняет предыдущую
версию перед заменой.

Инструкция для моделей и переводчиков находится в [`Documentation/TRANSLATION_GUIDE.md`](Documentation/TRANSLATION_GUIDE.md). Технические знания о польском пакете зафиксированы в [`Documentation/POLISH_IMPLEMENTATION_RUNBOOK.md`](Documentation/POLISH_IMPLEMENTATION_RUNBOOK.md), а итоговые редакторские и runtime-выводы по узбекскому пакету — в [`Documentation/UZBEK_IMPLEMENTATION_RUNBOOK.md`](Documentation/UZBEK_IMPLEMENTATION_RUNBOOK.md). Краткие обязательные правила для работающего с репозиторием агента продублированы в [`AGENTS.md`](AGENTS.md). Полный рабочий снимок единого глоссария лежит в [`Documentation/glossary`](Documentation/glossary).
