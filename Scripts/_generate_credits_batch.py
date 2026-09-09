#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = json.loads(Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked/Strings/credits.json').read_text())['content']
translated = list(source)
changes = {
    5: '[3]Долину Стардју створио:',
    8: '[3]Ажурирање 1.6:',
    16: '[3]Ажурирање 1.5:',
    20: '[3]Код за игру за више играча:',
    23: '[3]Додатни код:',
    27: '[3]Преводи:',
    30: 'Alessio Messersì (италијански)',
    31: 'Junho Won (корејски)',
    32: 'Jo "Josh" Sanghee (корејски)',
    33: 'Not Shalulu (француски)',
    34: 'Gőz Richárd "TRC" (мађарски)',
    35: 'Hüseyin Serhat Çavunt (турски)',
    36: 'Salih Emircan Ayyıldız (турски)',
    37: 'Ali Batuhan Özkan (турски)',
    38: 'Hilmi Furkan Yaşık (турски)',
    39: 'Daniel Ruiz "TheBrightKing" (шпански)',
    40: 'Sandra Martín Sigüenza (шпански)',
    41: 'Alexander Preymak (руски)',
    42: 'Arina Bedrina (руски)',
    43: 'Niclaus Leo "Royami" (руски фонт/графика)',
    44: 'Alessandro Raffaele-Addamo (немачки)',
    45: 'Vinícius de Medeiros Miguel (португалски)',
    46: 'Watermelon Translations (поједностављени кинески)',
    47: 'Takashi Fujimoto (јапански)',
    49: '[3]Руководилац превода:',
    52: '[3]Издања за Mac, Linux, Xbox One, "PlayStation 4", "PS Vita" и Nintendo Switch:',
    55: '[3]Издања за мобилне уређаје:',
    59: '[3]Провера квалитета конзолних издања:',
    62: '[3]Малопродајна дистрибуција:',
    66: '[3]Провера квалитета малопродајних издања:',
    70: '[3]Везе:',
    71: '[link] https://www.stardewvalley.net Званична веб-страница',
    72: '[link] https://forums.stardewvalley.net Званични форуми',
    73: '[link] https://www.stardewvalley.net/links Вести и заједница',
    77: '[1]Хвала на игрању <',
}
for index, value in changes.items():
    translated[index] = value

entries = {str(index): value for index, value in enumerate(translated)}
preserved = {str(index): 'Technical layout record or proper contributor/organization name is intentionally preserved.'
             for index, value in enumerate(translated) if value == source[index]}
batch = {
    'id': '0316-strings-credits',
    'locale': 'sr',
    'target': 'Strings/credits',
    'glossarySha256': '717e409d631b59e1069713078c555dee4f7ee3f658bdbe1d620a066c87902fab',
    'review': 'source-meaning-terminology-Serbian-grammar-voice-context-tokens',
    'entries': entries,
    'preservedReasons': preserved,
    'allowedLatin': {'52': ['Linux', 'Mac', 'Nintendo', 'One', 'PS', 'PlayStation', 'Switch', 'Vita', 'Xbox']},
    'contextNotes': {str(index): 'Visible role, language, platform or link label translated; names, URLs and style tags remain exact.'
                     for index in changes},
}
(ROOT / 'Documentation/serbian/batches/0316-strings-credits.json').write_text(json.dumps(batch, ensure_ascii=False, indent=2) + '\n')
