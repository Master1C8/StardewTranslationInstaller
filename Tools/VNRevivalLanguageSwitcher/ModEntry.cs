using System;
using System.Reflection;
using HarmonyLib;
using StardewModdingAPI;
using StardewValley;
using StardewValley.GameData;

namespace VNRevival.LanguageSwitcher;

public sealed class ModEntry : Mod
{
    public override void Entry(IModHelper helper)
    {
        MethodInfo? target = AccessTools.Method(
            typeof(LocalizedContentManager),
            nameof(LocalizedContentManager.SetModLanguage)
        );
        MethodInfo? prefix = AccessTools.Method(typeof(ModEntry), nameof(BeforeSetModLanguage));
        if (target is null || prefix is null)
            throw new InvalidOperationException("The Stardew Valley language methods were not found.");

        new Harmony(ModManifest.UniqueID).Patch(target, prefix: new HarmonyMethod(prefix));
    }

    private static void BeforeSetModLanguage(ModLanguage __0)
    {
        if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod)
            return;
        if (ReferenceEquals(LocalizedContentManager.CurrentModLanguage, __0))
            return;

        // Stardew's SetModLanguage stores the new ModLanguage and then sets the
        // enum to `mod`. On a mod-to-mod switch that setter returns immediately,
        // so neither the language-change event nor asset invalidation runs. Reset
        // only the backing enum; the original method then performs one normal
        // transition to `mod` with the new language object already selected.
        AccessTools.Field(typeof(LocalizedContentManager), "_currentLangCode")
            .SetValue(null, LocalizedContentManager.LanguageCode.en);
    }
}
