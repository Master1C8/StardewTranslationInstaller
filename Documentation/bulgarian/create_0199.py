import json, re
from pathlib import Path

source = json.loads(Path('/Users/antonkrutov/Developer/data/stardew-english-unpacked/Data/Events/HaleyHouse.json').read_text())['content']
selected = list(source.items())[:4]
translations = {
    selected[0][0]: [
        'Ъъъх! Аз винаги чистя под възглавниците! Тази седмица е ТВОЙ ред!$a',
        'Държиш се детински, Хейли. Аз върша почти цялата работа в тази къща и ти го знаеш.$u',
        'О, това е ${новото момче от фермата^новото момиче от фермата}$.$7',
        '${Той^Тя}$ си има име, да знаеш.$u',
        'Хей, обзалагам се, че ще разбереш моята гледна точка.',
        '*въздишка*... Много съжалявам, че те намесвам в това, @. Хейли се оплаква, защото я помолих да почисти под възглавниците.$u',
        '$q 45 null#Само защото аз ги чистих миналата седмица!$a#$r 46 -50 Event_clean2#Стига си мрънкала и просто ги изчисти!#$r 45 30 Event_clean1#Хейли, защо това да не бъде единственото ти седмично задължение?#$r 46 -30 Event_clean3#Емили, постъпи великодушно и този път ги изчисти ти.',
        'Добре, печелиш. Предполагам, че мога да върша това всяка седмица. Така няма да има за какво да спорим.$u',
        'Благодаря, @. Това беше чудесно решение.$h',
    ],
    selected[1][0]: [
        '*въздишка*... Явно тогава просто ще го свърша аз...$s',
    ],
    selected[2][0]: [
        'Ннннгхх... Просто не мога да отворя този буркан!$a#$b#...$s',
        'О! Това си ти... @, нали?',
        '$q 47 null#Кажи... доста си силен, нали?#$r 47 30 Event_jar1#Да#$r 47 -30 Event_jar2#Не',
        'Хей, успя! По-силен си, отколкото изглеждаш!$h',
        'Благодаря!$h',
    ],
    selected[3][0]: [
        'Влез! Само гледай бързо да затвориш вратата след себе си!',
        '@, тук си!',
        'Добре дошъл в чисто новата ми тъмна стаичка!$h',
        '$q -1 null#И така... какво мислиш?#$r -1 10 Event_darkroom1#Изглежда страхотно!#$r -1 0 Event_darkroom2#За какво служи?#$r -1 -50 Event_darkroom3#Виждал съм и по-добри.',
        'Ъм... както и да е... какво искаш да правим?$s',
        ' #Предложи да помогнеш с обзавеждането на тъмната стаичка.#Измисли си извинение и си тръгни.#Опитай да я целунеш.',
        'О, @... Толкова дълго чаках да го направиш.$11',
        'Един момент...$l',
        'Това беше хубаво...$l',
    ],
}
quoted = re.compile(r'"((?:\\.|[^"\\])*)"')
entries = {}
for key, value in selected:
    fields = quoted.findall(value)
    target = translations[key]
    if len(fields) != len(target):
        raise ValueError((key, len(fields), len(target)))
    it = iter(target)
    entries[key] = quoted.sub(lambda _m: json.dumps(next(it), ensure_ascii=False), value)
batch = {
    'id':'0199-event-haley-house-000-003',
    'target':'Data/Events/HaleyHouse',
    'status':'draft',
    'sourceHashes':{},
    'glossarySha256':'',
    'entries':entries,
    'preserveReasons':{},
}
Path('Documentation/bulgarian/batches/0199-event-haley-house-000-003.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
print('records',len(entries),'quoted',sum(map(len,translations.values())))
