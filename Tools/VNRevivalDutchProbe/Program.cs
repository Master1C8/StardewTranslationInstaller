using System;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.Loader;
using HarmonyLib;
using StardewValley;
using StardewValley.GameData;
using VNRevival.LanguageSwitcher;

internal static class Program
{
    private static int Main(string[] args)
    {
        if (args.Length != 1) throw new ArgumentException("Pass the installed game's MacOS directory.");
        string game = Path.GetFullPath(args[0]);
        AssemblyLoadContext.Default.Resolving += (context, name) =>
        {
            foreach (string directory in new[] { game, Path.Combine(game, "smapi-internal") })
            {
                string candidate = Path.Combine(directory, name.Name + ".dll");
                if (File.Exists(candidate)) return context.LoadFromAssemblyPath(candidate);
            }
            return null;
        };
        RunProbe();
        return 0;
    }

    // Set only this test process's backing fields. No game launch, assets,
    // saves, or installed mod files are read or changed by the probe.
    [MethodImpl(MethodImplOptions.NoInlining)]
    private static void RunProbe()
    {
        FieldInfo language = AccessTools.Field(typeof(LocalizedContentManager), "_currentLangCode");
        FieldInfo modLanguage = AccessTools.Field(typeof(LocalizedContentManager), "_currentModLanguage");
        object? originalLanguage = language.GetValue(null);
        object? originalMod = modLanguage.GetValue(null);
        Harmony harmony = new("VNRevival.DutchArticleProbe");
        MethodInfo original = AccessTools.Method(typeof(Utility), nameof(Utility.AOrAn));
        MethodInfo postfix = AccessTools.Method(typeof(ModEntry), "AfterIndefiniteArticle");
        try
        {
            harmony.Patch(original, postfix: new HarmonyMethod(postfix));
            Check(LocalizedContentManager.LanguageCode.mod, "nl-vnrevival", "Apple", "een");
            Check(LocalizedContentManager.LanguageCode.mod, "nl-vnrevival", "Barn", "een");
            Check(LocalizedContentManager.LanguageCode.mod, "nl-vnrevival", "", "een");
            Check(LocalizedContentManager.LanguageCode.mod, "pl-vnrevival", "Apple", "an");
            Check(LocalizedContentManager.LanguageCode.mod, "pl-vnrevival", "Barn", "a");
            Check(LocalizedContentManager.LanguageCode.mod, null, "Apple", "an");
            Check(LocalizedContentManager.LanguageCode.en, "nl-vnrevival", "Apple", "an");
            Check(LocalizedContentManager.LanguageCode.en, null, "Barn", "a");
            Check(LocalizedContentManager.LanguageCode.hu, null, "Apple", "az");
            Console.WriteLine("Dutch article probe passed 9 actual Harmony calls, including locale transitions and unchanged English/Hungarian/Polish behavior.");
        }
        finally
        {
            harmony.Unpatch(original, postfix);
            language.SetValue(null, originalLanguage);
            modLanguage.SetValue(null, originalMod);
        }

        void Check(LocalizedContentManager.LanguageCode code, string? locale, string word, string expected)
        {
            language.SetValue(null, code);
            modLanguage.SetValue(null, locale is null ? null : new ModLanguage { LanguageCode = locale });
            string actual = Utility.AOrAn(word);
            if (actual != expected)
                throw new InvalidOperationException($"{code}/{locale}/{word}: expected {expected}, got {actual}");
        }
    }
}
