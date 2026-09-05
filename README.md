# Stardew Valley — VN Revival Translation Installer

Единый нативный установщик языковых пакетов VN Revival для Stardew Valley. Текущая сборка за один запуск устанавливает русский, польский, вьетнамский, суахили, персидский, арабский, индонезийский, хинди- и традиционно-китайский переводы. Пользователь просто открывает приложение: оно автоматически устанавливает всё необходимое и показывает кнопку запуска игры.

Все языки находятся в одном Content Patcher-пакете, но регистрируются в игре независимо (`ru-vnrevival`, `pl-vnrevival`, `vi-vnrevival`, `sw-vnrevival`, `fa-vnrevival`, `ar-vnrevival`, `id-vnrevival`, `hi-vnrevival`, `zh-TW-vnrevival`). Интерфейс установщика остаётся однокнопочным; выбора языков перед установкой нет.

## Что уже работает

- автоматическое обнаружение Steam-версии Stardew Valley на macOS;
- автоматический старт установки сразу после открытия приложения;
- автоматическая загрузка SMAPI 4.5.2 и Content Patcher 2.9.0;
- проверка SHA-256 каждого загруженного архива до запуска или распаковки;
- атомарная установка и обновление только принадлежащего приложению мода;
- запуск игры через Steam одной кнопкой после установки;
- девять независимых локалей VN Revival в меню выбора языка;
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
```

`mise.toml` выбирает полный Xcode, Node.js 22.23.2 и Python 3.14.6. `uv sync`
создаёт изолированное `.venv` с Pillow и FontTools для генерации и проверки
изображений, шрифтовых таблиц и Unicode coverage. Окружение не добавляется в
Git и восстанавливается из `pyproject.toml` и `uv.lock`.

```sh
./Scripts/build-app.sh
```

Готовое приложение появится в `dist/Stardew Translation Installer.app`.

## Тесты

```sh
swift test --disable-sandbox
```

Полный Xcode выбирается через shell-профиль, `mise.toml` и сам сборочный
сценарий. Тесты используют временную фиктивную установку игры и не затрагивают
настоящую Stardew Valley.

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
- `content.json` — регистрация девяти дополнительных языков и подключение всех переводов;
- `assets/button*.png` — отдельные двухкадровые кнопки языков;
- `assets/title/TitleButtons*.png` — локализованные атласы главного меню;
- `assets/fonts/{russian,polish,vietnamese,persian,arabic,hindi,traditional-chinese}/*.xnb` — локализованные игровые шрифты;
- `assets/translations/{russian,polish,vietnamese,swahili,persian,arabic,indonesian,hindi,traditional-chinese}/*.json` — языковые патчи с независимыми условиями.

Официальная документация: [Custom languages](https://stardewvalleywiki.com/Modding:Custom_languages), [Content Patcher](https://github.com/Pathoschild/StardewMods/blob/develop/ContentPatcher/docs/README.md), [SMAPI](https://github.com/Pathoschild/SMAPI).

## Продолжение перевода

Инструкция для моделей и переводчиков находится в [`Documentation/TRANSLATION_GUIDE.md`](Documentation/TRANSLATION_GUIDE.md). Технические знания о польском пакете зафиксированы в [`Documentation/POLISH_IMPLEMENTATION_RUNBOOK.md`](Documentation/POLISH_IMPLEMENTATION_RUNBOOK.md), а итоговые редакторские и runtime-выводы по узбекскому пакету — в [`Documentation/UZBEK_IMPLEMENTATION_RUNBOOK.md`](Documentation/UZBEK_IMPLEMENTATION_RUNBOOK.md). Краткие обязательные правила для работающего с репозиторием агента продублированы в [`AGENTS.md`](AGENTS.md). Полный рабочий снимок единого глоссария лежит в [`Documentation/glossary`](Documentation/glossary).
