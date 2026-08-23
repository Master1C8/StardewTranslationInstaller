#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourceRoot = path.resolve(process.argv[2] || "/Users/antonkrutov/Developer/data/stardew-english-unpacked");
const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceFile = path.join(sourceRoot, "Strings/Furniture.json");
const overridesFile = path.join(projectRoot, "Documentation/burmese-editorial-overrides.json");
const source = JSON.parse(fs.readFileSync(sourceFile, "utf8")).content;
const overrides = JSON.parse(fs.readFileSync(overridesFile, "utf8"));
const escapedFurniturePrefix = String.raw`Strings/Furniture\u0000`;
for (const id of Object.keys(overrides)) {
  if (id.startsWith(escapedFurniturePrefix)) delete overrides[id];
}

// Titles, proper names, possessives, and phrases whose natural Burmese rendering
// is not safely compositional. English remains the sole semantic source.
const exact = new Map(Object.entries({
  "'The Muzzamaroo'": "'မူဇာမာရူး'",
  "'A Night On Eco-Hill'": "'အီကိုတောင်ပေါ်က ညတစ်ည'",
  "'Pathways'": "'လမ်းကြောင်းများ'",
  "'Burnt Offering'": "'မီးကျွမ်းပူဇော်သက္ကာ'",
  "'Queen of the Gem Sea'": "'ကျောက်မျက်ပင်လယ်၏ ဘုရင်မ'",
  "'Vanilla Villa'": "'ဗနီလာအိမ်တော်'",
  "'Primal Motion'": "'မူလရွေ့လျားမှု'",
  "'Jade Hills'": "'ကျောက်စိမ်းတောင်တန်းများ'",
  "'Sun #44'": "'နေမင်း #၄၄'",
  "'Spires'": "'မျှော်စင်ချွန်များ'",
  "'Highway 89'": "'အဝေးပြေးလမ်း ၈၉'",
  "'Sun #45'": "'နေမင်း #၄၅'",
  "'Little Tree'": "'သစ်ပင်ငယ်'",
  "'Blueberries'": "'ဘလူးဘယ်ရီများ'",
  "'Blue City'": "'အပြာရောင်မြို့'",
  "'Dancing Grass'": "'ကခုန်သောမြက်ခင်း'",
  "'VGA Paradise'": "'ဗီဂျီအေ ပရဒိသု'",
  "'Kitemaster '95'": "'စွန်သခင် '၉၅'",
  "'Red Eagle'": "'လင်းယုန်နီ'",
  "'Portrait Of A Mermaid'": "'ရေသူမ၏ ပုံတူ'",
  "'Solar Kingdom'": "'နေမင်းနိုင်ငံတော်'",
  "'Clouds'": "'တိမ်များ'",
  "'1000 Years From Now'": "'ယခုမှ နှစ်တစ်ထောင်အကြာ'",
  "'Three Trees'": "'သစ်ပင်သုံးပင်'",
  "'The Serpent'": "'မြွေနဂါး'",
  "'Tropical Fish #173'": "'အပူပိုင်းငါး #၁၇၃'",
  "'Land Of Clay'": "'ရွှံ့မြေ'",
  "'The Brave Little Sapling'": "'ရဲရင့်သော သစ်ပင်ပေါက်ငယ်'",
  "'Mysterium'": "'မစ္စတီရီယမ်'",
  "'Journey Of The Prairie King: The Motion Picture'": "'ပရေရီဘုရင်၏ခရီးစဉ်: ရုပ်ရှင်ဇာတ်ကား'",
  "'Wumbus'": "'ဝမ်ဘတ်စ်'",
  "'The Zuzu City Express'": "'ဇူဇူမြို့ အမြန်ရထား'",
  "'The Miracle At Coldstar Ranch'": "'ကိုးလ်စတားမွေးမြူရေးခြံမှ အံ့ဖွယ်ဖြစ်ရပ်'",
  "'Natural Wonders: Exploring Our Vibrant World'": "'သဘာဝအံ့ဖွယ်များ: သက်ဝင်လှုပ်ရှားသော ကမ္ဘာကို လေ့လာခြင်း'",
  "'It Howls In The Rain'": "'မိုးထဲက အူသံ'",
  "'Volcano' Photo": "'မီးတောင်' ဓာတ်ပုံ",
  "'Boat'": "'လှေ'",
  "'Vista'": "'ရှုခင်း'",
  "'Jade Hills Extended'": "'ကျောက်စိမ်းတောင်တန်းများ — အကျယ်ချဲ့'",
  "'Frozen Dreams'": "'အေးခဲအိပ်မက်များ'",
  "'Physics 101'": "'ရူပဗေဒ အခြေခံ'",
  "'Squid Kid'": "'ပြည်ကြီးငါးကောင်လေး'",
  "'Runes'": "'မှော်စာလုံးများ'",
  "'Wizard's Tower'": "'မှော်ဆရာ၏မျှော်စင်'",
  "'Void Swirls'": "'ဗွိုက်ဝဲဂယက်များ'",
  "'Community Center'": "'လူထုဗဟိုဌာန'",
  "'Little Buddies'": "'မိတ်ဆွေငယ်များ'",
  "'Stardrop'": "'စတားဒရော့ပ်'",
  "'Hut'": "'တဲငယ်'",
  "'Groovy'": "'ခေတ်ဆန်'",
  "'Abstract'": "'စိတ္တဇ'",
  "'Starship'": "'ကြယ်သင်္ဘော'",
  "'Binary'": "'ဒွိကိန်း'",
  "'Checkers'": "'ချက်ကာကစားပွဲ'",
  "'UFO'": "'ယူအက်ဖ်အို'",
  "Leah's Sculpture": "လီယာ၏ ပန်းပုရုပ်",
  "Sam's Boombox": "ဆမ်၏ စတီရီယိုစက်",
  "Miner's Crest": "မိုင်းလုပ်သားအမှတ်တံဆိပ်",
  "My First Painting": "ကျွန်ုပ်၏ ပထမဆုံးပန်းချီကား",
  "Pierre's Sign": "ပီယာ၏ ဆိုင်းဘုတ်",
  "Sam's Skateboard": "ဆမ်၏ စကိတ်ဘုတ်",
  "Witch's Broom": "စုန်းမ၏ တံမြက်စည်း",
  "Manager of the Year": "တစ်နှစ်တာအကောင်းဆုံး မန်နေဂျာ",
  "Tree of the Winter Star": "ဆောင်းကြယ်ပင်",
  "J. Cola Light": "ဂျေကိုလာ မီးအိမ်",
  "J. Painting": "ဂျေပန်းချီကား",
  "J. Light": "ဂျေမီးအိမ်",
  "J": "J",
  "CCFishTank": "လူထုဗဟိုဌာန ငါးမွေးကန်",
  "Glyph": "မှော်သင်္ကေတ",
  "Cauldron": "ဆေးကျိုအိုးကြီး",
  "Porthole": "သင်္ဘောပြတင်းပေါက်ဝိုင်း",
  "Anchor": "ကျောက်ဆူး",
  "Lifesaver": "အသက်ကယ်ဘော",
  "L. Light String": "မီးကြိုးရှည်",
  "S. Pine": "ထင်းရှူးပင်ငယ်",
  "Lg. Futan Bear": "ဖူတန်ဝက်ဝံရုပ်ကြီး",
  "Futan Bear": "ဖူတန်ဝက်ဝံရုပ်",
  "Futan Rabbit": "ဖူတန်ယုန်ရုပ်",
  "Wumbus Statue": "ဝမ်ဘတ်စ်ရုပ်တု",
  "Bobo Statue": "ဘိုဘိုရုပ်တု",
  "Iridium Krobus": "အီရီဒီယမ် ခရိုဘတ်စ်ရုပ်တု",
  "Gourmand Statue": "အစားအသောက်ကျွမ်းကျင်သူရုပ်တု",
  "Two Elixirs": "ဆေးရည်နှစ်ပုလင်း",
  "Six-Pack Rings": "ခြောက်ကွင်းတွဲ",
  "Doghouse": "ခွေးအိမ်",
  "Outlet": "လျှပ်စစ်ပလပ်ပေါက်",
  "Clothesline": "အဝတ်လှန်းကြိုး",
  "Light Switch": "မီးခလုတ်",
  "China Cabinet": "ကြွေထည်ပစ္စည်းဘီရို",
  "Wallflower Pal": "နံရံပန်းမိတ်ဆွေ",
  "Calico Falls": "ကယ်လီကိုရေတံခွန်",
  "Needlepoint Flower": "အပ်ချည်ထိုးပန်း",
  "Skull Poster": "ဦးခေါင်းခွံပိုစတာ",
  "Little Photos": "ဓာတ်ပုံငယ်များ",
  "Blossom Rug": "ပန်းပွင့်ကော်ဇော",
  "Funky Rug": "ဆန်းပြားကော်ဇော",
  "Exotic Palace": "ထူးခြားဆန်းပြားသော နန်းတော်",
  "Dusty Skull": "ဖုန်တက်ဦးခေါင်းခွံ",
  "Amethyst Crystal Ball": "ခရမ်းသလင်း သလင်းဘောလုံး",
  "Topaz Crystal Ball": "တိုပက်ဇ် သလင်းဘောလုံး",
  "Aquamarine Crystal Ball": "အက်ကွာမရင်း သလင်းဘောလုံး",
  "Emerald Crystal Ball": "မြ သလင်းဘောလုံး",
  "Ruby Crystal Ball": "ပတ္တမြား သလင်းဘောလုံး",
  "Abigail Portrait": "အဘီဂေးလ်၏ ပုံတူ",
  "Emily Portrait": "အမ်မလီ၏ ပုံတူ",
  "Haley Portrait": "ဟေလီ၏ ပုံတူ",
  "Leah Portrait": "လီယာ၏ ပုံတူ",
  "Maru Portrait": "မာရူ၏ ပုံတူ",
  "Penny Portrait": "ပင်နီ၏ ပုံတူ",
  "Alex Portrait": "အဲလက်စ်၏ ပုံတူ",
  "Elliott Portrait": "အဲလီယော့၏ ပုံတူ",
  "Harvey Portrait": "ဟာဗီ၏ ပုံတူ",
  "Sam Portrait": "ဆမ်၏ ပုံတူ",
  "Sebastian Portrait": "ဆီဘက်စတီယန်၏ ပုံတူ",
  "Shane Portrait": "ရှိန်း၏ ပုံတူ",
  "Krobus Portrait": "ခရိုဘတ်၏ ပုံတူ",
  "Junimo Star": "ဂျူနီမိုကြယ်",
  "Bulletin Board": "ကြေညာဘုတ်",
  "Junimo Hut": "ဂျူနီမိုတဲ",
  "Cat Tree": "ကြောင်တက်စင်",
  "Dark Cat Tree": "အမှောင်ရောင်ကြောင်တက်စင်",
  "Dark Doghouse": "အမှောင်ရောင်ခွေးအိမ်",
  "Stone Slab": "ကျောက်ပြား",
  "Artist Bookcase": "အနုပညာရှင်၏ စာအုပ်စင်",
  "Diviner Table": "ဗေဒင်ဆရာ၏ စားပွဲ",
  "Small Plant": "သေးငယ်သောအပင်",
  "Table Plant": "စားပွဲတင်အပင်",
  "Small Crystal": "သလင်းငယ်",
  "Junimo Plush": "ဂျူနီမိုအရုပ်ပျော့",
  "Small Junimo Plush": "ဂျူနီမိုအရုပ်ပျော့ငယ်",
  "Wall Basket": "နံရံချိတ်ခြင်းတောင်း",
  "Decorative Trash Can": "အလှဆင်အမှိုက်ပုံး",
  "S. Wall Flower": "နံရံကပ်ပန်းငယ်",
  "Periodic Table": "ဒြပ်စင်အလှည့်ကျဇယား",
  "Cash Register": "ငွေရှင်းစက်",
  "Iridium Krobus": "အီရီဒီယမ် ခရိုဘတ်ရုပ်တု",
  "Bountiful Dining Table": "စားစရာအပြည့် ထမင်းစားပွဲ",
  "Food Pet Bowl": "အစာထည့် အိမ်မွေးတိရစ္ဆာန်ခွက်",
  "Water Pet Bowl": "ရေထည့် အိမ်မွေးတိရစ္ဆာန်ခွက်",
}));

const phrases = new Map(Object.entries({
  "Moonlight Jellies": "လရောင်ဂျယ်လီငါးများ",
  "Community Center": "လူထုဗဟိုဌာန",
  "Coldstar Ranch": "ကိုးလ်စတားမွေးမြူရေးခြံ",
  "Zuzu City": "ဇူဇူမြို့",
  "Prairie King": "ပရေရီဘုရင်",
  "Furniture Catalogue": "ပရိဘောဂကတ်တလောက်",
  "Joja Furniture Catalogue": "ဂျိုဂျာပရိဘောဂကတ်တလောက်",
  "Night Sky": "ညကောင်းကင်",
  "Fruit Salad": "သစ်သီးသုပ်",
  "Fish Tank": "ငါးမွေးကန်",
  "Tea-Table": "လက်ဖက်ရည်စားပွဲ",
  "Tea Table": "လက်ဖက်ရည်စားပွဲ",
  "Dining Table": "ထမင်းစားပွဲ",
  "End Table": "ဘေးစားပွဲ",
  "Coffee Table": "ကော်ဖီစားပွဲ",
  "Lamp End Table": "မီးအိမ်ပါ ဘေးစားပွဲ",
  "House Plant": "အိမ်တွင်းအပင်",
  "Wall Panel": "နံရံပြား",
  "Wall Plaque": "နံရံအလှပြား",
  "Wall Flower": "နံရံကပ်ပန်း",
  "Wall Ornament": "နံရံအလှဆင်ပစ္စည်း",
  "Wall Pumpkin": "နံရံကပ်ဖရုံသီး",
  "Wall Cactus": "နံရံကပ်ရှားစောင်း",
  "Wall Palm": "နံရံကပ်အုန်းပင်",
  "Wall Clock": "နံရံကပ်နာရီ",
  "Wall Sconce": "နံရံကပ်မီးအိမ်",
  "Wall Sword": "နံရံကပ်ဓား",
  "Sleeping Junimo": "အိပ်ပျော်နေသော ဂျူနီမို",
  "Book Stack": "စာအုပ်ထပ်",
  "Book Pile": "စာအုပ်ပုံ",
  "Elixir Shelf": "ဆေးရည်စင်",
  "Elixir Table": "ဆေးရည်စားပွဲ",
  "Crystal Ball": "သလင်းဘောလုံး",
  "Light String": "မီးကြိုး",
  "Pet Bowl": "အိမ်မွေးတိရစ္ဆာန်ခွက်",
  "Double Bed": "နှစ်ယောက်အိပ်ကုတင်",
  "Decorative Door": "အလှဆင်တံခါး",
}));

const words = new Map(Object.entries({
  Dark: "အမှောင်ရောင်", Oak: "ဝက်သစ်ချသား", Walnut: "ဝေါလ်နတ်သား", Birch: "ဘတ်ချ်သား",
  Mahogany: "မဟော်ဂနီသား", Red: "အနီရောင်", Blue: "အပြာရောင်", Green: "အစိမ်းရောင်",
  Yellow: "အဝါရောင်", Brown: "အညိုရောင်", Black: "အနက်ရောင်", Pink: "ပန်းရောင်",
  Purple: "ခရမ်းရောင်", Orange: "လိမ္မော်ရောင်", Gray: "မီးခိုးရောင်", Light: "ဖျော့ရောင်",
  Large: "ကြီးမားသော", Small: "သေးငယ်သော", Long: "ရှည်လျားသော", Tall: "မြင့်မားသော", Deluxe: "အဆင့်မြင့်",
  Modern: "ခေတ်မီ", Classic: "ဂန္ထဝင်", Elegant: "ခမ်းနား", Fancy: "လှပဆန်းပြား",
  Decorative: "အလှဆင်", Winter: "ဆောင်းရာသီ", Festive: "ပွဲတော်သုံး", Country: "ကျေးလက်စတိုင်",
  Breakfast: "မနက်စာသုံး", Diner: "စားသောက်ဆိုင်သုံး", Office: "ရုံးသုံး", Plush: "ပျော့ဖတ်",
  Groovy: "ခေတ်ဆန်", Cute: "ချစ်စရာ", Stump: "သစ်ငုတ်", Metal: "သတ္တု", King: "ဘုရင့်",
  Crystal: "သလင်း", Wizard: "မှော်ဆရာ", Witch: "စုန်းမ", Woodsy: "သစ်တောစတိုင်",
  Stone: "ကျောက်", Sun: "နေမင်း", Moon: "လမင်း", Pub: "အရက်ဆိုင်သုံး", Luxury: "ဇိမ်ခံ",
  Diviner: "ဗေဒင်ဆရာသုံး", Neolithic: "ကျောက်ခေတ်သစ်", Puzzle: "ပဟေဠိ", Candy: "သကြားလုံး",
  Luau: "လူအာအူ", Artist: "အနုပညာရှင်သုံး", Ceramic: "ကြွေ", Gold: "ရွှေ",
  Industrial: "စက်မှုသုံး", Indoor: "အိမ်တွင်း", Manicured: "ပုံသွင်းညှပ်ထားသော", Topiary: "ပုံသွင်း",
  Standing: "ထောင်ထားသော", Obsidian: "အော့ဘ်စီဒီယန်", Singing: "သီချင်းဆိုသော",
  Sloth: "ဆလော့သ်", M: "အလယ်", Chicken: "ကြက်", Dried: "အခြောက်ခံ", Sunflowers: "နေကြာပန်းများ", Grandmother: "အဘွားသုံး", Table: "စားပွဲ", Plant: "အပင်",
  Globe: "ကမ္ဘာလုံး", Model: "ပုံစံငယ်", Ship: "သင်္ဘော", Bowl: "ပန်းကန်လုံး", Lantern: "မီးအိမ်", Lamp: "မီးအိမ်",
  Calendar: "ပြက္ခဒိန်", Box: "သေတ္တာပုံ", Patchwork: "အဆင်စပ်", Budget: "ဈေးသက်သာသော",
  Plasma: "ပလာစမာ", Piano: "စန္ဒရား", Chair: "ကုလားထိုင်", Stool: "ထိုင်ခုံငယ်", Throne: "ရာဇပလ္လင်",
  Dining: "ထမင်းစား", Seat: "ထိုင်ခုံ", Bench: "ခုံတန်း", Armchair: "လက်တင်ကုလားထိုင်",
  Couch: "ဆိုဖာ", Dresser: "အံဆွဲဘီရို", Slab: "ပြား", Bookcase: "စာအုပ်စင်", Pillar: "တိုင်",
  Pipe: "ပိုက်", Palm: "အုန်းပင်", Totem: "တိုတမ်", Pole: "တိုင်", Pine: "ထင်းရှူးပင်",
  Tree: "သစ်ပင်", Geode: "ဂျီအိုဒ်ကျောက်", Vase: "ပန်းအိုး", Skeleton: "အရိုးစု", Statue: "ရုပ်တု",
  Catalogue: "ကတ်တလောက်", Boombox: "စတီရီယိုစက်", Rug: "ကော်ဇော", TV: "တီဗီ", Window: "ပြတင်းပေါက်",
  Basic: "အခြေခံ", Cottage: "ကျေးလက်အိမ်စတိုင်", Monster: "မုန်းစတား", Boarded: "ပျဉ်ကာထားသော",
  Mystic: "လျှို့ဝှက်ဆန်းကြယ်", Junimo: "ဂျူနီမို", Bear: "ဝက်ဝံ", World: "ကမ္ဘာ့", Map: "မြေပုံ",
  Ornate: "ခမ်းနားသော", Floor: "ကြမ်းပြင်", Carved: "ပန်းထွင်း", Nautical: "ရေကြောင်းစတိုင်",
  Burlap: "ဂုန်လျှော်", Column: "တိုင်", Bonsai: "ဘွန်ဆိုင်း", Candle: "ဖယောင်းတိုင်", Bamboo: "ဝါး",
  Mat: "ဖျာ", Woodcut: "သစ်သားပန်းထွင်း", Hanging: "ချိတ်ဆွဲ", Shield: "ဒိုင်း", Danglers: "တွဲလောင်းအလှဆင်ပစ္စည်း",
  Ceiling: "မျက်နှာကျက်", Flags: "အလံများ", Brick: "အုတ်", Fireplace: "မီးလင်းဖို", Iridium: "အီရီဒီယမ်",
  Stove: "မီးဖို", Pirate: "ပင်လယ်ဓားပြ", Flag: "အလံ", Bone: "အရိုး", Butterfly: "လိပ်ပြာ",
  Hutch: "လှောင်အိမ်", Strawberry: "စတော်ဘယ်ရီ", Decal: "နံရံကပ်ပုံ", Snowy: "နှင်းဖုံး",
  Brave: "ရဲရင့်သော", Sapling: "သစ်ပင်ပေါက်", Basket: "ခြင်းတောင်း", Rabbit: "ယုန်", Serpent: "မြွေနဂါး",
  Exotic: "ထူးခြားသော", Pumpkin: "ဖရုံသီး", Bed: "ကုတင်", Starry: "ကြယ်စုံ", Child: "ကလေး",
  Tropical: "အပူပိုင်းစတိုင်", Oceanic: "သမုဒ္ဒရာစတိုင်", Volcano: "မီးတောင်", Jungle: "တောတွင်း",
  Torch: "မီးတုတ်", Aquatic: "ရေသတ္တဝါ", Sanctuary: "ဘေးမဲ့စခန်း", Wild: "တောရိုင်းစတိုင်",
  Fisher: "တံငါသည်စတိုင်", Foliage: "သစ်ရွက်", Print: "ပုံနှိပ်ကား", Wall: "နံရံ", Trash: "အမှိုက်",
  Can: "ပုံး", Gourmand: "အစားအသောက်ကျွမ်းကျင်သူ", Pyramid: "ပိရမစ်", Plain: "ရိုးရိုး",
  Colorful: "ရောင်စုံ", Set: "အစုံ", Pastel: "ဖျော့ရောင်", Clouds: "တိမ်များ", Banner: "နဖူးစည်း", Starport: "ကြယ်ဆိပ်ကမ်း",
  Pitchfork: "ကောက်ရိုးခွ", Wood: "သစ်သား", Panel: "ပြား", Axe: "ပုဆိန်", Log: "သစ်လုံး",
  Leaves: "သစ်ရွက်များ", Cloud: "တိမ်", Divider: "အခန်းခြား", Icy: "ရေခဲ", Old: "ရှေးဟောင်း",
  Frozen: "အေးခဲသော", Dreams: "အိပ်မက်များ", Squirrel: "ရှဉ့်", Figurine: "ရုပ်ငယ်", Cactus: "ရှားစောင်းပင်",
  Fish: "ငါး", Retro: "ခေတ်ဟောင်း", Art: "အနုပညာ", Photo: "ဓာတ်ပုံ", Short: "အနိမ့်",
  Skateboard: "စကိတ်ဘုတ်", Periodic: "ဒြပ်စင်အလှည့်ကျ", Radio: "ရေဒီယို", Desk: "စာရေးစားပွဲ",
  Planes: "လေယာဉ်များ", Calico: "ကယ်လီကို", Dunes: "သဲခုံများ", Desert: "သဲကန္တာရ",
  Sandy: "သဲရောင်", Barrel: "စည်ပိုင်း", Mounted: "နံရံချိတ်", Trout: "ထရောက်ငါး", Cow: "နွား",
  Pinstripe: "အစင်းပါ", Tank: "ကန်", Joja: "ဂျိုဂျာ", Cola: "ကိုလာ", Vault: "ငွေတိုက်ခန်း",
  Painting: "ပန်းချီကား", Ornament: "အလှဆင်ပစ္စည်း", Cans: "ဘူးများ", Cash: "ငွေ", Register: "ငွေရှင်းစက်",
  Plastic: "ပလပ်စတစ်", Cushion: "ကူရှင်", Stacked: "ထပ်ထားသော", Boxes: "သေတ္တာများ", Morris: "မောရစ်",
  HQ: "ဌာနချုပ်", Crate: "ကုန်သေတ္တာ", Shopping: "ဈေးဝယ်", Cart: "လှည်း", Fridge: "ရေခဲသေတ္တာ",
  Study: "စာဖတ်ခန်း", Broom: "တံမြက်စည်း", Curly: "ကောက်ကွေးသော", Swamp: "ရွှံ့နွံ",
  Elixir: "ဆေးရည်", Shelf: "စင်", Bundle: "အစု", Couple: "နှစ်ခု", Runes: "မှော်စာလုံးများ",
  Tower: "မျှော်စင်", Potted: "အိုးစိုက်", Mushroom: "မှို", Bookshelf: "စာအုပ်စင်", Flooring: "ကြမ်းခင်း",
  Rune: "မှော်စာလုံး", Swirl: "ဝဲဂယက်", Book: "စာအုပ်", Fallen: "လဲကျနေသော", Pile: "ပုံ",
  Hut: "တဲငယ်", Pot: "အိုး", Bag: "အိတ်", Flower: "ပန်း", Plaque: "အလှပြား", Sleeping: "အိပ်ပျော်နေသော",
  Square: "စတုရန်း", Circular: "စက်ဝိုင်း", Portrait: "ပုံတူ", Stardrop: "စတားဒရော့ပ်", Bulletin: "ကြေညာချက်",
  Brochure: "လက်ကမ်းစာစောင်", Cabinet: "ဘီရို", Leafy: "သစ်ရွက်စုံ", Door: "တံခါး", Radio: "ရေဒီယို",
  Abstract: "စိတ္တဇ", Starship: "ကြယ်သင်္ဘော", Binary: "ဒွိကိန်း", Checkers: "ချက်ကာကစားပွဲ", UFO: "ယူအက်ဖ်အို",
  Hatch: "အပေါက်ဖုံး", Ladder: "လှေကား", Upright: "မတ်တပ်", Coat: "ကုတ်အင်္ကျီ", Stand: "စင်",
  Bird: "ငှက်", House: "အိမ်", Shovel: "ဂေါ်ပြား", Sword: "ဓား", Wine: "ဝိုင်", Spirits: "အရက်",
  Corn: "ပြောင်းဖူး", Food: "အစားအစာ", Water: "ရေ", Triangle: "တြိဂံ", Lawn: "မြက်ခင်း",
  Bountiful: "ပေါများသော", Broken: "ပျက်နေသော", Television: "ရုပ်မြင်သံကြား", Rings: "ကွင်းများ",
  Bottle: "ပုလင်း", Aluminum: "အလူမီနီယမ်", Buried: "မြေမြှုပ်ထားသော", Tire: "တာယာ",
  Wrapper: "ထုပ်ပိုးခွံ", Spilled: "ဖိတ်ကျထားသော", Beverage: "အဖျော်ယမကာ", Messy: "ပေရေနေသော",
  Shirt: "အင်္ကျီ", Shorts: "ဘောင်းဘီတို", Moldy: "မှိုတက်သော", Pig: "ဝက်", Midnight: "သန်းခေါင်ယံ",
  Beach: "ကမ်းခြေ", Back: "နောက်", R: "ညာ", L: "ဘယ်", S: "အသေး", Lg: "အကြီး",
}));

const orderedPhrases = [...phrases].sort((a, b) => b[0].length - a[0].length);
const intentionallyPreserved = new Set(["J"]);
function translate(value) {
  if (exact.has(value)) return exact.get(value);
  let working = value;
  const protectedParts = [];
  for (const [sourcePhrase, targetPhrase] of orderedPhrases) {
    const expression = new RegExp(`(?<![A-Za-z])${sourcePhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z])`, "g");
    working = working.replace(expression, () => {
      const token = `§${protectedParts.length}§`;
      protectedParts.push(targetPhrase);
      return token;
    });
  }
  working = working.replace(/[A-Za-z]+/g, (word) => words.get(word) ?? word);
  working = working.replace(/§(\d+)§/g, (_, index) => protectedParts[Number(index)]);
  working = working.replace(/\s+/g, " ").trim();
  return working;
}

const unresolved = [];
for (const [key, value] of Object.entries(source)) {
  const translated = translate(value);
  if (/[A-Za-z]/.test(translated) && !(intentionallyPreserved.has(value) && translated === value)) {
    unresolved.push({ key, value, translated });
  }
  overrides[`Strings/Furniture\u0000${key}`] = translated;
}

if (unresolved.length) {
  console.error(JSON.stringify({ unresolved }, null, 2));
  process.exit(1);
}

const orderedOverrides = Object.fromEntries(Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(overridesFile, `${JSON.stringify(orderedOverrides, null, 2)}\n`);
console.log(JSON.stringify({ furnitureOverrides: Object.keys(source).length, totalOverrides: Object.keys(orderedOverrides).length }, null, 2));
