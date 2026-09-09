using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;
using System.Linq;
using System.Text.Json;
using HarmonyLib;
using StardewValley;
using StardewValley.GameData;
using StardewValley.GameData.Characters;
using VNRevival.LanguageSwitcher;

internal static class Program
{
    private static int Main(string[] args)
    {
        // SMAPI loads its internal dependencies explicitly, including the bundled
        // MonoMod assembly whose file identity predates Harmony's reference.
        AppDomain.CurrentDomain.AssemblyResolve += (_, request) =>
        {
            string path = Path.Combine(AppContext.BaseDirectory,
                new AssemblyName(request.Name).Name + ".dll");
            return File.Exists(path) ? Assembly.LoadFrom(path) : null;
        };
        return Run(args);
    }

    [MethodImpl(MethodImplOptions.NoInlining)]
    private static int Run(string[] args)
    {
        if (args.Length != 2) throw new ArgumentException("Pass the Greek UI patch and editorial batch directory.");
        MethodInfo article = AccessTools.Method(typeof(Utility), nameof(Utility.AOrAn));
        FieldInfo language = AccessTools.Field(typeof(LocalizedContentManager), "_currentLangCode");
        FieldInfo mod = AccessTools.Field(typeof(LocalizedContentManager), "_currentModLanguage");
        object savedLanguage = language.GetValue(null);
        object savedMod = mod.GetValue(null);
        string[] labels = { "Barn", "Obelisk", "Στάβλος", "Οβελίσκος", "", null };
        var cases = new (LocalizedContentManager.LanguageCode Code, string ModCode)[]
        {
            (LocalizedContentManager.LanguageCode.en, null),
            (LocalizedContentManager.LanguageCode.hu, null),
            (LocalizedContentManager.LanguageCode.mod, "pl-vnrevival"),
            (LocalizedContentManager.LanguageCode.mod, "fa-vnrevival"),
            (LocalizedContentManager.LanguageCode.mod, "ar-vnrevival"),
            (LocalizedContentManager.LanguageCode.mod, "el-other"),
            (LocalizedContentManager.LanguageCode.mod, null),
            (LocalizedContentManager.LanguageCode.en, "el-vnrevival"),
        };
        var baseline = new List<string>();
        Harmony harmony = new Harmony("VNRevival.GreekRuntimeProbe");
        try
        {
            foreach (var item in cases)
            {
                SetLanguage(item.Code, item.ModCode);
                foreach (string label in labels) baseline.Add(Article(label));
            }
            harmony.Patch(article, postfix: new HarmonyMethod(
                typeof(ModEntry), "AfterIndefiniteArticle"));
            int index = 0;
            foreach (var item in cases)
            {
                SetLanguage(item.Code, item.ModCode);
                foreach (string label in labels)
                    if (Article(label) != baseline[index++])
                        throw new InvalidDataException("Article behavior changed outside exact Greek locale.");
            }
            SetLanguage(LocalizedContentManager.LanguageCode.mod, "el-vnrevival");
            foreach (string label in labels)
                if (Article(label) != "") throw new InvalidDataException("English article leaked into Greek.");

            using JsonDocument patch = JsonDocument.Parse(File.ReadAllText(args[0]));
            JsonElement entries = patch.RootElement.GetProperty("Changes")[0].GetProperty("Entries");
            Check("Chat_BuildingBuild", "Αντώνης ζήτησε την κατασκευή ενός κτιρίου τύπου «Στάβλος»!");
            Check("Chat_BuildingMagicBuild", "Αντώνης έφερε με μαγεία ένα κτίριο τύπου «Στάβλος»!");
            ProbeNames(harmony, args[1], cases);
            ProbeRandomWords(harmony, args[1], cases);
            Console.WriteLine($"Greek native Harmony article probe passed {index} isolation cases, {labels.Length} Greek cases, and 2 rendered construction messages.");
            return 0;

            void Check(string key, string expected)
            {
                string actual = string.Format(entries.GetProperty(key).GetString(), "Αντώνης", Article("Στάβλος"), "Στάβλος");
                if (actual != expected) throw new InvalidDataException(key + ": " + actual);
            }
        }
        finally
        {
            harmony.UnpatchAll(harmony.Id);
            language.SetValue(null, savedLanguage);
            mod.SetValue(null, savedMod);
        }

        string Article(string label) => (string)article.Invoke(null, new object[] { label });
        void SetLanguage(LocalizedContentManager.LanguageCode code, string modCode)
        {
            // Avoid game/UI initialization in this isolated native-method probe.
            language.SetValue(null, code);
            mod.SetValue(null, modCode == null ? null : new ModLanguage { LanguageCode = modCode });
        }
    }
    private static void ProbeNames(Harmony harmony, string batchDirectory,
        (LocalizedContentManager.LanguageCode Code, string ModCode)[] isolation)
    {
        var templates = new Dictionary<string, string>();
        foreach (string file in Directory.GetFiles(batchDirectory, "*.json"))
        {
            using JsonDocument batch = JsonDocument.Parse(File.ReadAllText(file));
            foreach (JsonElement row in batch.RootElement.GetProperty("records").EnumerateArray())
                templates[row.GetProperty("target").GetString() + ":" + row.GetProperty("key").GetString()]
                    = row.GetProperty("translation").GetString();
        }
        var saved = Game1.characterData;
        var savedContent = Game1.content;
        using LocalizedContentManager content = new ProbeContent(templates);
        string[] keys = {
            "NPC.cs.4083", "NPC.cs.4086", "NPC.cs.4091", "NPC.cs.4094", "NPC.cs.4097",
            "NPC.cs.4100", "NPC.cs.4103", "NPC.cs.4106", "NPC.cs.4141", "NPC.cs.4144",
            "NPC.cs.4147", "NPC.cs.4149", "NPC.cs.4152", "NPC.cs.4153", "NPC.cs.4154",
            "NPC.cs.4161", "NPC.cs.4164", "NPC.cs.4182", "DiaryEvent.cs.6664"
        };
        var references = new (string Input, string Expected)[] {
            ("Πιερ", "ο Πιερ"), ("Κάρολαϊν", "η Κάρολαϊν"),
            ("Pierre", "ο Πιερ"), ("Caroline", "η Κάρολαϊν"),
            ("ο μπαμπάς μου", "ο μπαμπάς μου"), ("η μαμά μου", "η μαμά μου"),
            ("Άγνωστο", "Άγνωστο")
        };
        try
        {
            Game1.content = content;
            Game1.characterData = new Dictionary<string, CharacterData> {
                ["Pierre"] = new CharacterData { DisplayName = "Πιερ", Gender = Gender.Male },
                ["Caroline"] = new CharacterData { DisplayName = "Κάρολαϊν", Gender = Gender.Female }
            };
            AccessTools.Method(typeof(ModEntry), "PatchGreekNpcNames").Invoke(null, new object[] { harmony });
            int checkedCases = 0;
            foreach (var locale in isolation)
            {
                SetLanguage(locale.Code, locale.ModCode);
                CheckAll(false);
            }
            SetLanguage(LocalizedContentManager.LanguageCode.mod, "el-vnrevival");
            CheckAll(true);
            foreach (string key in keys)
            {
                string path = "Strings/StringsFromCSFiles:" + key;
                bool male = new HashSet<string> { "NPC.cs.4094", "NPC.cs.4100", "NPC.cs.4141", "NPC.cs.4149", "NPC.cs.4152", "NPC.cs.4161" }.Contains(key);
                Console.WriteLine(content.LoadString(path, male ? "Πιερ" : "Κάρολαϊν", "Δώρο"));
            }
            foreach (var entry in templates)
            {
                if (!entry.Key.StartsWith("Strings/Characters:Relative_")) continue;
                // Native referent gender determines the possessive wrapper.
                string label = entry.Key.Substring(entry.Key.IndexOf("Relative_") + 9);
                bool female = new HashSet<string> { "Mom", "Mother", "Wife", "HalfSister", "Sister", "Daughter", "LittleBabyGirl", "Aunt", "Grandma", "Niece" }.Contains(label);
                string relative = content.LoadString("Strings/StringsFromCSFiles:NPC.cs." + (female ? "4080" : "4079"), entry.Value);
                string start = content.LoadString("Strings/StringsFromCSFiles:NPC.cs.4083", relative);
                if (start != "Ήξερες ότι " + relative) throw new InvalidDataException("Relative article duplicated.");
                Console.WriteLine(start + content.LoadString("Strings/StringsFromCSFiles:NPC.cs.4084", "Δώρο"));
            }
            string untouched = "Strings/StringsFromCSFiles:ToolReady";
            if (content.LoadString(untouched, "Πιερ") != string.Format(templates[untouched], "Πιερ"))
                throw new InvalidDataException("Unrelated string changed.");
            int movieCases = 0;
            string[] movieKeys = {
                "MovieTheater_AfterMovieAlone", "MovieTheater_AfterMovie", "MovieTheater_LoveMovie",
                "MovieTheater_LikeMovie", "MovieTheater_DislikeMovie", "MovieTheater_LoveConcession",
                "MovieTheater_LikeConcession", "MovieTheater_DislikeConcession",
                "MovieTheater_LoveConcession_Female", "MovieTheater_LikeConcession_Female", "MovieTheater_DislikeConcession_Female",
                "MovieTheater_LoveConcession_Male", "MovieTheater_LikeConcession_Male", "MovieTheater_DislikeConcession_Male"
            };
            foreach (var locale in isolation.Concat(new[] { (LocalizedContentManager.LanguageCode.mod, "el-vnrevival") }))
            {
                SetLanguage(locale.Item1, locale.Item2);
                bool greek = locale.Item1 == LocalizedContentManager.LanguageCode.mod && locale.Item2 == "el-vnrevival";
                foreach (string key in movieKeys)
                foreach (var reference in references)
                {
                    string path = "Strings/Characters:" + key;
                    string name = greek ? char.ToUpperInvariant(reference.Expected[0]) + reference.Expected.Substring(1) : reference.Input;
                    string expected = string.Format(templates[path], name, "Ποπκόρν");
                    object[] values = { reference.Input, "Ποπκόρν" };
                    if (content.LoadString(path, reference.Input, "Ποπκόρν") != expected
                        || content.LoadString(path.Replace('/', '\\'), values) != expected
                        || (string)values[0] != reference.Input)
                        throw new InvalidDataException("Movie subject/article mismatch: " + path);
                    movieCases += 2;
                }
            }
            foreach (string key in movieKeys)
                Console.WriteLine(content.LoadString("Strings/Characters:" + key,
                    key.EndsWith("_Male") ? "Πιερ" : "Κάρολαϊν", "Ποπκόρν"));
            Console.WriteLine($"Greek NPC reference probe passed {checkedCases} native overload/isolation cases, {movieCases} movie-reference cases and 21 rendered relations.");

            void CheckAll(bool greek)
            {
                foreach (string key in keys)
                foreach (var reference in references)
                {
                    string path = "Strings/StringsFromCSFiles:" + key;
                    string expected = string.Format(templates[path], greek ? reference.Expected : reference.Input, "Δώρο", "extra");
                    object[] substitutions = { reference.Input, "Δώρο" };
                    if (content.LoadString(path, reference.Input, "Δώρο") != expected
                        || content.LoadString(path, reference.Input, "Δώρο", "extra") != expected
                        || content.LoadString(path.Replace('/', '\\'), substitutions) != expected
                        || (string)substitutions[0] != reference.Input)
                        throw new InvalidDataException("NPC overload mismatch: " + path + " / " + reference.Input + " Greek=" + greek + " expected=" + expected + " two=" + content.LoadString(path, reference.Input, "Δώρο") + " three=" + content.LoadString(path, reference.Input, "Δώρο", "extra") + " array=" + content.LoadString(path, substitutions));
                    if (Game1.LoadStringByGender(Gender.Male, path, substitutions) != expected
                        || Game1.LoadStringByGender(Gender.Female, path, substitutions) != expected
                        || (string)substitutions[0] != reference.Input)
                        throw new InvalidDataException("Gendered native formatter mismatch: " + path);
                    checkedCases += 5;
                    if (key == "NPC.cs.4083" || key == "DiaryEvent.cs.6664")
                    {
                        if (content.LoadString(path, (object)reference.Input) != expected)
                            throw new InvalidDataException("Single argument mismatch: " + path);
                        checkedCases++;
                    }
                }
            }
        }
        finally { Game1.characterData = saved; Game1.content = savedContent; }

        void SetLanguage(LocalizedContentManager.LanguageCode code, string modCode)
        {
            AccessTools.Field(typeof(LocalizedContentManager), "_currentLangCode").SetValue(null, code);
            AccessTools.Field(typeof(LocalizedContentManager), "_currentModLanguage").SetValue(null,
                modCode == null ? null : new ModLanguage { LanguageCode = modCode });
        }
    }

    private static void ProbeRandomWords(Harmony harmony, string batchDirectory,
        (LocalizedContentManager.LanguageCode Code, string ModCode)[] isolation)
    {
        var templates = new Dictionary<string, string>();
        var grammar = new Dictionary<string, string[]>();
        var adjectives = new List<string>();
        var nouns = new List<string>();
        foreach (string file in Directory.GetFiles(batchDirectory, "*.json").OrderBy(value => value))
        {
            using JsonDocument batch = JsonDocument.Parse(File.ReadAllText(file));
            foreach (JsonElement row in batch.RootElement.GetProperty("records").EnumerateArray())
            {
                string value = row.GetProperty("translation").GetString();
                templates[row.GetProperty("target").GetString() + ":" + row.GetProperty("key").GetString()] = value;
                if (!row.TryGetProperty("greekRandomForms", out JsonElement info)) continue;
                bool adjective = info.GetProperty("kind").GetString() == "adjective";
                grammar[(adjective ? "adj:" : "noun:") + value.ToLowerInvariant()]
                    = info.GetProperty("forms").EnumerateArray().Select(item => item.GetString()).ToArray();
                (adjective ? adjectives : nouns).Add(value);
            }
        }
        string[] keys = {
            "Characters/Dialogue/MarriageDialogue:Indoor_Day_3",
            "Characters/Dialogue/MarriageDialogueMaru:Outdoor_2",
            "Characters/Dialogue/MarriageDialogueMaru:Good_6",
            "Characters/Dialogue/Abigail:fall_Thu"
        };
        if (adjectives.Count != 20 || nouns.Count != 23) throw new InvalidDataException("Incomplete random-word forms.");
        var savedContent = Game1.content;
        var savedRandom = Game1.random;
        var savedGame = Game1.game1;
        var savedAdjectives = Dialogue.adjectives;
        var savedNouns = Dialogue.nouns;
        FieldInfo playerField = AccessTools.Field(typeof(Game1), "_player");
        object savedPlayer = playerField.GetValue(null);
        MethodInfo native = AccessTools.Method(typeof(Dialogue), nameof(Dialogue.checkForSpecialCharacters));
        MethodInfo transform = AccessTools.Method(typeof(ModEntry), "InflectGreekRandomWords");
        var baseline = new Dictionary<string, (string Text, int Next)>();
        try
        {
            Game1.game1 = (Game1)FormatterServices.GetUninitializedObject(typeof(Game1));
            Game1.content = new ProbeContent(templates, grammar);
            Dialogue.adjectives = adjectives.ToArray();
            Dialogue.nouns = nouns.ToArray();
            Farmer farmer = (Farmer)FormatterServices.GetUninitializedObject(typeof(Farmer));
            AccessTools.Field(typeof(Farmer), "netGender").SetValue(farmer, new Netcode.NetEnum<Gender>());
            farmer.Gender = Gender.Male;
            playerField.SetValue(null, farmer);
            var locales = isolation.Concat(new[] { (LocalizedContentManager.LanguageCode.mod, "el-vnrevival") }).ToArray();
            for (int locale = 0; locale < locales.Length; locale++)
            {
                SetLanguage(locales[locale].Item1, locales[locale].Item2);
                foreach (string key in keys)
                for (int seed = 0; seed < 20; seed++) baseline[locale + ":" + key + ":" + seed] = Render(key, seed);
            }
            AccessTools.Method(typeof(ModEntry), "PatchGreekRandomWords").Invoke(null, new object[] { harmony });
            int count = 0;
            for (int locale = 0; locale < locales.Length; locale++)
            {
                SetLanguage(locales[locale].Item1, locales[locale].Item2);
                foreach (string key in keys)
                for (int seed = 0; seed < 20; seed++)
                {
                    var before = baseline[locale + ":" + key + ":" + seed];
                    var after = Render(key, seed);
                    string expected = locale == locales.Length - 1 ? Transform(key, before.Text) : before.Text;
                    if (after.Text != expected || after.Next != before.Next)
                        throw new InvalidDataException("Random dialogue output/RNG drift: " + key + " locale " + locale);
                    count++;
                }
            }
            string[,] golden = {
                { "ένα μοβ δράκος", "έναν μοβ δράκο" },
                { "ένα κολλώδης ύαινα", "μια κολλώδη ύαινα" },
                { "ένα ογκώδης ρομπότ", "ένα ογκώδες ρομπότ" },
                { "ένα με υφή κιμωλίας μπισκότο", "ένα μπισκότο με υφή κιμωλίας" },
                { "ένα με κρούστα χείλος", "ένα χείλος με κρούστα" },
                { "ένα πράσινος περούκα", "μια πράσινη περούκα" },
                { "ένα αποχαυνωμένος πλανήτης", "έναν αποχαυνωμένο πλανήτη" },
                { "ένα γιγάντιο γοργόνα", "μια γιγάντια γοργόνα" },
                { "ένα γιγάντιο τάφος", "έναν γιγάντιο τάφο" }
            };
            for (int i = 0; i < golden.GetLength(0); i++)
            {
                string actual = Transform(keys[0], golden[i, 0]);
                if (actual != golden[i, 1] || Transform(keys[0], actual) != actual)
                    throw new InvalidDataException("Greek agreement golden case failed: " + actual);
                Console.WriteLine(actual);
            }
            int combinations = 0;
            foreach (string adjective in adjectives)
            foreach (string noun in nouns)
            {
                string input = "με ένα " + adjective.ToLowerInvariant() + " " + noun.ToLowerInvariant() + ".";
                string result = Transform(keys[0], input);
                if (result != Transform(keys[0], result) || !result.StartsWith("με ") || !result.EndsWith("."))
                    throw new InvalidDataException("Unstable Greek combination.");
                combinations++;
            }
            foreach (string noun in nouns)
                foreach (string key in new[] { keys[1], keys[2] })
                    if (Transform(key, "«" + noun.ToLowerInvariant() + "»") != "«" + noun + "»")
                        throw new InvalidDataException("Celestial-name capitalization failed.");
            Console.WriteLine($"Greek random-word probe passed {count} native RNG/isolation cases, {combinations} adjective/noun combinations, 46 celestial names and 9 independent agreement cases.");
        }
        finally
        {
            Game1.content = savedContent; Game1.random = savedRandom; Game1.game1 = savedGame;
            Dialogue.adjectives = savedAdjectives; Dialogue.nouns = savedNouns;
            playerField.SetValue(null, savedPlayer);
        }
        string Transform(string key, string text) => (string)transform.Invoke(null, new object[] { key, text, grammar });
        (string Text, int Next) Render(string key, int seed)
        {
            Dialogue dialogue = (Dialogue)FormatterServices.GetUninitializedObject(typeof(Dialogue));
            AccessTools.Field(typeof(Dialogue), "TranslationKey").SetValue(dialogue, key);
            Game1.random = new Random(seed);
            string text = (string)native.Invoke(dialogue, new object[] { templates[key] });
            return (text, Game1.random.Next());
        }
        void SetLanguage(LocalizedContentManager.LanguageCode code, string modCode)
        {
            AccessTools.Field(typeof(LocalizedContentManager), "_currentLangCode").SetValue(null, code);
            AccessTools.Field(typeof(LocalizedContentManager), "_currentModLanguage").SetValue(null,
                modCode == null ? null : new ModLanguage { LanguageCode = modCode });
        }
    }

    private sealed class ProbeContent : LocalizedContentManager
    {
        private readonly Dictionary<string, string> templates;
        private readonly Dictionary<string, string[]> grammar;
        public ProbeContent(Dictionary<string, string> templates, Dictionary<string, string[]> grammar = null) : base(new EmptyServices(), "") { this.templates = templates; this.grammar = grammar; }
        public override T Load<T>(string assetName) => assetName == "VNRevival/GreekGrammar" ? (T)(object)grammar : base.Load<T>(assetName);
        public override string LoadString(string path) => templates.TryGetValue(path.Replace('\\', '/'), out string value) ? value : path;
    }
    private sealed class EmptyServices : IServiceProvider
    {
        public object GetService(Type serviceType) => null;
    }

}
