using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using HarmonyLib;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using StardewModdingAPI;
using StardewValley;
using StardewValley.BellsAndWhistles;
using StardewValley.GameData;
using StardewValley.Menus;

namespace VNRevival.LanguageSwitcher
{

public sealed class ModEntry : Mod
{
    private const string BulgarianLanguageCode = "bg-vnrevival";
    private const string CzechLanguageCode = "cs-vnrevival";
    private const string PersianLanguageCode = "fa-vnrevival";
    private const string ArabicLanguageCode = "ar-vnrevival";
    private const string HebrewLanguageCode = "he-vnrevival";
    private const string DutchLanguageCode = "nl-vnrevival";
    private const string SerbianLanguageCode = "sr-vnrevival";
    private static ArabicScriptTextAdapter? PersianAdapter;
    private static ArabicScriptTextAdapter? ArabicAdapter;
    private static ArabicScriptTextAdapter? HebrewAdapter;
    private static IModHelper? ModHelper;
    private static IMonitor? ModMonitor;
    private static bool LoggedTitleOverlay;
    private static bool LoggedBackOverlay;
    private static bool LoggedDeveloperOverlay;
    [ThreadStatic]
    private static int TextRenderingDepth;
    private static readonly Dictionary<string, Texture2D> TitleOverlayTextures = new(StringComparer.Ordinal);
    private static readonly Dictionary<string, Texture2D> TitleBackOverlayTextures = new(StringComparer.Ordinal);
    private static readonly Dictionary<string, Texture2D> TitleDeveloperOverlayTextures = new(StringComparer.Ordinal);
    private static readonly Dictionary<string, string> TitleOverlayFiles = new(StringComparer.Ordinal)
    {
        ["ru-vnrevival"] = "russian",
        ["sr-vnrevival"] = "serbian",
        ["pl-vnrevival"] = "polish",
        ["uk-vnrevival"] = "ukrainian",
        ["vi-vnrevival"] = "vietnamese",
        ["sw-vnrevival"] = "swahili",
        ["fa-vnrevival"] = "persian",
        ["ar-vnrevival"] = "arabic",
        ["id-vnrevival"] = "indonesian",
        ["fil-vnrevival"] = "filipino",
        ["nl-vnrevival"] = "dutch",
        ["hi-vnrevival"] = "hindi",
        ["zh-TW-vnrevival"] = "traditional-chinese",
        ["ro-vnrevival"] = "romanian",
        ["he-vnrevival"] = "hebrew",
        ["bg-vnrevival"] = "bulgarian",
        ["th-vnrevival"] = "thai",
        ["el-vnrevival"] = "greek",
        ["cs-vnrevival"] = "czech",
    };
    private static readonly Color NormalTitleInk = new(210, 34, 69);
    private static readonly Color HoverTitleInk = new(239, 72, 101);
    private const int TitleOverlayButtonWidth = 222;
    private const int TitleOverlayHeight = 174;
    private const int TitleBackOverlayWidth = 264;
    private const int TitleBackOverlayHeight = 108;
    private const int TitleDeveloperOverlayWidth = 333;
    private const int TitleDeveloperOverlayHeight = 180;
    private const float TitleDeveloperReferenceZoom = 3f;

    public override void Entry(IModHelper helper)
    {
        ModHelper = helper;
        ModMonitor = Monitor;
        MethodInfo? target = AccessTools.Method(
            typeof(LocalizedContentManager),
            nameof(LocalizedContentManager.SetModLanguage)
        );
        MethodInfo? prefix = AccessTools.Method(typeof(ModEntry), nameof(BeforeSetModLanguage));
        if (target is null || prefix is null)
            throw new InvalidOperationException("The Stardew Valley language methods were not found.");

        Harmony harmony = new(ModManifest.UniqueID);
        harmony.Patch(target, prefix: new HarmonyMethod(prefix));

        MethodInfo titleDrawTarget = AccessTools.Method(
            typeof(TitleMenu),
            nameof(TitleMenu.draw),
            new[] { typeof(SpriteBatch) }
        ) ?? throw new InvalidOperationException("The Stardew Valley title-menu draw method was not found.");
        harmony.Patch(
            titleDrawTarget,
            postfix: new HarmonyMethod(typeof(ModEntry), nameof(AfterTitleMenuDraw))
        );

        MethodInfo articleTarget = AccessTools.Method(typeof(Utility), nameof(Utility.AOrAn))
            ?? throw new InvalidOperationException("The Stardew Valley article method was not found.");
        harmony.Patch(articleTarget,
            prefix: new HarmonyMethod(typeof(ModEntry), nameof(BeforeGreekArticle)),
            postfix: new HarmonyMethod(typeof(ModEntry), nameof(AfterIndefiniteArticle)));

        MethodInfo dialogueTarget = AccessTools.Method(typeof(Dialogue), "checkForSpecialCharacters", new[] { typeof(string) })
            ?? throw new InvalidOperationException("The dialogue token method was not found.");
        MethodInfo dialoguePrefix = AccessTools.Method(typeof(ModEntry), nameof(BeforeDialogueTokens))
            ?? throw new InvalidOperationException("The Serbian dialogue prefix was not found.");
        MethodInfo dialoguePostfix = AccessTools.Method(typeof(ModEntry), nameof(AfterDialogueTokens))
            ?? throw new InvalidOperationException("The Serbian dialogue postfix was not found.");
        harmony.Patch(dialogueTarget, prefix: new HarmonyMethod(dialoguePrefix), postfix: new HarmonyMethod(dialoguePostfix));

        PatchGreekNpcNames(harmony);
        PatchGreekRandomWords(harmony);

        string persianShapingMap = Path.Combine(helper.DirectoryPath, "persian-shaping-map.json");
        PersianAdapter = ArabicScriptTextAdapter.Load(persianShapingMap);
        string arabicShapingMap = Path.Combine(helper.DirectoryPath, "arabic-shaping-map.json");
        ArabicAdapter = ArabicScriptTextAdapter.Load(arabicShapingMap);
        HebrewAdapter = ArabicScriptTextAdapter.CreateBidiOnly();
        MethodInfo textPrefix = AccessTools.Method(typeof(ModEntry), nameof(BeforeTextRendering))
            ?? throw new InvalidOperationException("The Arabic-script rendering adapter was not found.");
        MethodInfo textFinalizer = AccessTools.Method(typeof(ModEntry), nameof(FinishTextRendering))
            ?? throw new InvalidOperationException("The Arabic-script rendering cleanup was not found.");
        HarmonyMethod textHarmonyPrefix = new(textPrefix);
        HarmonyMethod textHarmonyFinalizer = new(textFinalizer);

        IEnumerable<MethodInfo> spriteTextMethods = AccessTools.GetDeclaredMethods(typeof(SpriteText))
            .Where(method =>
                (method.Name.StartsWith("drawString", StringComparison.Ordinal)
                    || method.Name is "getWidthOfString" or "getHeightOfString")
                && method.GetParameters().Any(IsTextParameter));
        IEnumerable<MethodInfo> monoGameMethods = AccessTools.GetDeclaredMethods(typeof(SpriteBatch))
            .Where(method => method.Name == nameof(SpriteBatch.DrawString)
                && method.GetParameters().Any(IsTextParameter))
            .Concat(AccessTools.GetDeclaredMethods(typeof(SpriteFont))
                .Where(method => method.Name == nameof(SpriteFont.MeasureString)
                    && method.GetParameters().Any(IsTextParameter)));

        int patched = 0;
        foreach (MethodInfo method in spriteTextMethods.Concat(monoGameMethods).Distinct())
        {
            harmony.Patch(method, prefix: textHarmonyPrefix, finalizer: textHarmonyFinalizer);
            patched += 1;
        }
        Monitor.Log($"Persian, Arabic, and Hebrew shaping/bidi adapters enabled for {patched} text methods.", LogLevel.Trace);
    }

    private static void AfterTitleMenuDraw(TitleMenu __instance, SpriteBatch b)
    {
        if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod)
            return;

        string? languageCode = LocalizedContentManager.CurrentModLanguage?.LanguageCode;
        if (languageCode is null
            || !TitleOverlayFiles.TryGetValue(languageCode, out string? slug)
            || ModHelper is null)
            return;

        DrawDeveloperOverlay(__instance, b, languageCode, slug);

        if (__instance.fadeFromWhiteTimer > 0 || !__instance.titleInPosition)
            return;

        IClickableMenu? subMenu = TitleMenu.subMenu;
        if (subMenu is null
            && __instance.buttons is not null
            && __instance.buttonsToShow > 0)
        {
            if (!TitleOverlayTextures.TryGetValue(languageCode, out Texture2D? overlay))
            {
                overlay = ModHelper.ModContent.Load<Texture2D>($"title-overlays/TitleLabels-{slug}.png");
                TitleOverlayTextures[languageCode] = overlay;
            }

            int buttonCount = Math.Min(Math.Min(4, __instance.buttons.Count), __instance.buttonsToShow);
            for (int index = 0; index < buttonCount; index += 1)
            {
                ClickableTextureComponent button = __instance.buttons[index];
                if (!button.visible || button.bounds.Width <= 0 || button.bounds.Height <= 0)
                    continue;

                Rectangle source = new(index * TitleOverlayButtonWidth, 0, TitleOverlayButtonWidth, TitleOverlayHeight);
                float overlayScale = button.baseScale > 0f
                    ? button.scale / button.baseScale
                    : 1f;
                Vector2 position = new(button.bounds.Center.X, button.bounds.Center.Y);
                Vector2 origin = new(TitleOverlayButtonWidth / 2f, TitleOverlayHeight / 2f);
                Color ink = button.sourceRect.Y == button.startingSourceRect.Y
                    ? NormalTitleInk
                    : HoverTitleInk;
                b.Draw(
                    overlay,
                    position,
                    source,
                    ink,
                    0f,
                    origin,
                    overlayScale,
                    SpriteEffects.None,
                    0f
                );
            }

            if (!LoggedTitleOverlay)
            {
                string bounds = string.Join(", ", __instance.buttons.Take(buttonCount)
                    .Select(button => $"{button.bounds.X},{button.bounds.Y} {button.bounds.Width}x{button.bounds.Height} scale {button.scale:0.###}/{button.baseScale:0.###}"));
                ModMonitor?.Log($"Centered high-resolution title labels enabled for {languageCode}; button bounds: {bounds}.", LogLevel.Trace);
                LoggedTitleOverlay = true;
            }
        }

        ClickableTextureComponent? backButton = __instance.backButton;
        if (subMenu is not null
            && !__instance.isTransitioningButtons
            && subMenu is not CharacterCustomization
            && subMenu.readyToClose()
            && backButton is not null
            && backButton.visible
            && backButton.bounds.Width > 0
            && backButton.bounds.Height > 0
            && TitleOverlayFiles.TryGetValue(languageCode, out string? backSlug))
        {
            if (!TitleBackOverlayTextures.TryGetValue(languageCode, out Texture2D? backOverlay))
            {
                backOverlay = ModHelper.ModContent.Load<Texture2D>($"title-overlays/TitleBack-{backSlug}.png");
                TitleBackOverlayTextures[languageCode] = backOverlay;
            }

            float renderedButtonWidth = backButton.sourceRect.Width * backButton.scale;
            float renderedButtonHeight = backButton.sourceRect.Height * backButton.scale;
            float overlayScale = Math.Min(
                renderedButtonWidth / TitleBackOverlayWidth,
                renderedButtonHeight / TitleBackOverlayHeight
            );
            if (overlayScale <= 0f)
                overlayScale = 1f;
            Color ink = backButton.sourceRect.Y == backButton.startingSourceRect.Y
                ? NormalTitleInk
                : HoverTitleInk;
            b.Draw(
                backOverlay,
                new Vector2(backButton.bounds.Center.X, backButton.bounds.Center.Y),
                null,
                ink,
                0f,
                new Vector2(TitleBackOverlayWidth / 2f, TitleBackOverlayHeight / 2f),
                overlayScale,
                SpriteEffects.None,
                0f
            );

            if (!LoggedBackOverlay)
            {
                ModMonitor?.Log(
                    $"Native back label enabled for {languageCode}; bounds {backButton.bounds.Width}x{backButton.bounds.Height}, "
                    + $"source {backButton.sourceRect.Width}x{backButton.sourceRect.Height}, "
                    + $"scale {backButton.scale:0.###}/{backButton.baseScale:0.###}, overlay {overlayScale:0.###}.",
                    LogLevel.Trace
                );
                LoggedBackOverlay = true;
            }
        }

    }

    private static void DrawDeveloperOverlay(
        TitleMenu menu,
        SpriteBatch spriteBatch,
        string languageCode,
        string slug
    )
    {
        if (menu.logoFadeTimer <= 0 || menu.specialSurprised || ModHelper is null)
            return;

        if (!TitleDeveloperOverlayTextures.TryGetValue(languageCode, out Texture2D? overlay))
        {
            overlay = ModHelper.ModContent.Load<Texture2D>($"title-overlays/TitleDeveloper-{slug}.png");
            TitleDeveloperOverlayTextures[languageCode] = overlay;
        }

        float alpha;
        if (menu.logoFadeTimer < 500)
            alpha = menu.logoFadeTimer / 500f;
        else if (menu.logoFadeTimer > 4500)
            alpha = 1f - (menu.logoFadeTimer - 4500) / 500f;
        else
            alpha = 1f;

        float overlayScale = TitleMenu.pixelZoom / TitleDeveloperReferenceZoom;
        spriteBatch.Draw(
            overlay,
            new Vector2(menu.width / 2f, menu.height / 2f - 30f * TitleMenu.pixelZoom),
            null,
            Color.White * Math.Clamp(alpha, 0f, 1f),
            0f,
            Vector2.Zero,
            overlayScale,
            SpriteEffects.None,
            0.2f
        );

        if (!LoggedDeveloperOverlay)
        {
            ModMonitor?.Log(
                $"Readable developer-card label enabled for {languageCode}; "
                + $"overlay {TitleDeveloperOverlayWidth}x{TitleDeveloperOverlayHeight}, "
                + $"zoom {TitleMenu.pixelZoom}, scale {overlayScale:0.###}.",
                LogLevel.Trace
            );
            LoggedDeveloperOverlay = true;
        }
    }

    private static bool IsTextParameter(ParameterInfo parameter)
    {
        return parameter.ParameterType == typeof(string)
            || parameter.ParameterType == typeof(StringBuilder);
    }

    private static void AfterIndefiniteArticle(ref string __result)
    {
        if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod)
            return;

        string? languageCode = LocalizedContentManager.CurrentModLanguage?.LanguageCode;
        if (languageCode == DutchLanguageCode)
            __result = "een";
        else if (languageCode == BulgarianLanguageCode || languageCode == CzechLanguageCode)
            __result = string.Empty;
        else
            __result = SerbianGrammar.SuppressIndefiniteArticle(__result, languageCode == SerbianLanguageCode);
    }

    private static void BeforeDialogueTokens(string str, out bool __state)
    {
        __state = LocalizedContentManager.CurrentLanguageCode == LocalizedContentManager.LanguageCode.mod
            && LocalizedContentManager.CurrentModLanguage?.LanguageCode == SerbianLanguageCode
            && str.Contains("%adj", StringComparison.Ordinal)
            && str.Contains("%noun", StringComparison.Ordinal);
    }

    private static void AfterDialogueTokens(ref string __result, bool __state)
    {
        if (__state) __result = SerbianGrammar.ApplyAdjectiveAgreement(__result);
    }

    private static bool BeforeGreekArticle(ref string __result)
    {
        if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod
            || LocalizedContentManager.CurrentModLanguage?.LanguageCode != "el-vnrevival")
            return true;

        // Unlike Lexicon, Utility.AOrAn still returns English articles for custom
        // languages. Greek construction messages supply their own inflected noun.
        __result = string.Empty;
        return false;
    }

    private static readonly HashSet<string> GreekNpcReferenceKeys = new(StringComparer.Ordinal)
    {
        "NPC.cs.4083", "NPC.cs.4086", "NPC.cs.4091", "NPC.cs.4094", "NPC.cs.4097",
        "NPC.cs.4100", "NPC.cs.4103", "NPC.cs.4106", "NPC.cs.4141", "NPC.cs.4144",
        "NPC.cs.4147", "NPC.cs.4149", "NPC.cs.4152", "NPC.cs.4153", "NPC.cs.4154",
        "NPC.cs.4161", "NPC.cs.4164", "NPC.cs.4182", "DiaryEvent.cs.6664",
    };

    private static readonly HashSet<string> GreekMovieReferenceKeys = new(StringComparer.Ordinal)
    {
        "MovieTheater_AfterMovieAlone", "MovieTheater_AfterMovie", "MovieTheater_LoveMovie",
        "MovieTheater_LikeMovie", "MovieTheater_DislikeMovie", "MovieTheater_LoveConcession",
        "MovieTheater_LikeConcession", "MovieTheater_DislikeConcession",
        "MovieTheater_LoveConcession_Female", "MovieTheater_LikeConcession_Female", "MovieTheater_DislikeConcession_Female",
        "MovieTheater_LoveConcession_Male", "MovieTheater_LikeConcession_Male", "MovieTheater_DislikeConcession_Male",
    };

    private static void PatchGreekNpcNames(Harmony harmony)
    {
        // Each overload formats independently; patch only calls with substitutions.
        foreach (MethodInfo method in AccessTools.GetDeclaredMethods(typeof(LocalizedContentManager))
            .Where(method => method.Name == nameof(LocalizedContentManager.LoadString)
                && method.GetParameters().Length >= 2))
            harmony.Patch(method, prefix: new HarmonyMethod(typeof(ModEntry),
                method.GetParameters()[1].ParameterType == typeof(object[])
                    ? nameof(BeforeGreekNpcNames) : nameof(BeforeGreekNpcName)));
        // This helper formats directly instead of calling a LoadString overload.
        MethodInfo gendered = AccessTools.Method(typeof(Game1), nameof(Game1.LoadStringByGender),
            new[] { typeof(Gender), typeof(string), typeof(object[]) })
            ?? throw new InvalidOperationException("The Stardew Valley gendered string method was not found.");
        harmony.Patch(gendered, prefix: new HarmonyMethod(typeof(ModEntry), nameof(BeforeGreekGenderedNpcName)));
    }

    private static bool IsGreekNpcReference(string path)
    {
        if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod
            || LocalizedContentManager.CurrentModLanguage?.LanguageCode != "el-vnrevival"
            || path is null)
            return false;
        const string asset = "Strings/StringsFromCSFiles:";
        path = path.Replace('\\', '/');
        const string characters = "Strings/Characters:";
        return (path.StartsWith(asset, StringComparison.Ordinal)
                && GreekNpcReferenceKeys.Contains(path.Substring(asset.Length)))
            || (path.StartsWith(characters, StringComparison.Ordinal)
                && GreekMovieReferenceKeys.Contains(path.Substring(characters.Length)));
    }

    private static void BeforeGreekNpcName(string path, ref object sub1)
    {
        if (IsGreekNpcReference(path) && sub1 is string reference)
            sub1 = GreekNpcReference(path, reference);
    }

    private static void BeforeGreekNpcNames(string path, ref object[] substitutions)
    {
        if (!IsGreekNpcReference(path) || substitutions is null
            || substitutions.Length == 0 || substitutions[0] is not string reference)
            return;
        object[] copy = (object[])substitutions.Clone();
        copy[0] = GreekNpcReference(path, reference);
        substitutions = copy;
    }

    private static void BeforeGreekGenderedNpcName(string key, ref object[] substitutions)
    {
        BeforeGreekNpcNames(key, ref substitutions);
    }

    private static string GreekNpcReference(string path, string reference)
    {
        string value = GreekNpcNominative(reference);
        // These movie reactions start with their NPC subject; gift hints embed it.
        if (value.Length > 0 && path.Replace('\\', '/').StartsWith("Strings/Characters:", StringComparison.Ordinal))
            return char.ToUpperInvariant(value[0]) + value.Substring(1);
        return value;
    }

    private static string GreekNpcNominative(string reference)
    {
        // Relationship wrappers already supply an article. Gift-hint translations
        // keep every reference in nominative, so names need no case conversion.
        if (reference.StartsWith("ο ", StringComparison.Ordinal)
            || reference.StartsWith("η ", StringComparison.Ordinal)
            || reference.StartsWith("το ", StringComparison.Ordinal)
            || Game1.characterData is null)
            return reference;
        foreach (var entry in Game1.characterData)
        {
            string name = NPC.GetDisplayName(entry.Key);
            if (reference != entry.Key && reference != name)
                continue;
            string article = entry.Value.Gender switch
            {
                Gender.Male => "ο ",
                Gender.Female => "η ",
                _ => "το ",
            };
            return article + name;
        }
        return reference;
    }

    private static readonly HashSet<string> GreekRandomWordKeys = new(StringComparer.Ordinal)
    {
        "Characters/Dialogue/MarriageDialogue:Indoor_Day_3",
        "Characters/Dialogue/MarriageDialogueMaru:Outdoor_2",
        "Characters/Dialogue/MarriageDialogueMaru:Good_6",
        "Characters/Dialogue/Abigail:fall_Thu",
    };

    private static void PatchGreekRandomWords(Harmony harmony)
    {
        MethodInfo method = AccessTools.Method(typeof(Dialogue), nameof(Dialogue.checkForSpecialCharacters))
            ?? throw new InvalidOperationException("The Stardew Valley dialogue token method was not found.");
        harmony.Patch(method, postfix: new HarmonyMethod(typeof(ModEntry), nameof(AfterGreekRandomWords)));
    }

    private static void AfterGreekRandomWords(Dialogue __instance, ref string __result)
    {
        if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod
            || LocalizedContentManager.CurrentModLanguage?.LanguageCode != "el-vnrevival")
            return;
        string key = __instance.TranslationKey?.Replace('\\', '/') ?? "";
        if (!GreekRandomWordKeys.Contains(key))
            return;
        // Leave every original random choice in place. Inflect only the selected
        // words after the native method finishes, using the reviewed Greek forms.
        var grammar = Game1.content.Load<Dictionary<string, string[]>>("VNRevival/GreekGrammar");
        __result = InflectGreekRandomWords(key, __result, grammar);
    }

    private static string InflectGreekRandomWords(string key, string text, Dictionary<string, string[]> grammar)
    {
        string nouns = string.Join("|", grammar.Keys.Where(value => value.StartsWith("noun:", StringComparison.Ordinal))
            .Select(value => Regex.Escape(value.Substring(5))));
        if (key == "Characters/Dialogue/MarriageDialogueMaru:Outdoor_2"
            || key == "Characters/Dialogue/MarriageDialogueMaru:Good_6")
            return Regex.Replace(text, "«(" + nouns + ")»", match =>
                "«" + char.ToUpperInvariant(match.Groups[1].Value[0]) + match.Groups[1].Value.Substring(1) + "»");
        string adjectives = string.Join("|", grammar.Keys.Where(value => value.StartsWith("adj:", StringComparison.Ordinal))
            .Select(value => Regex.Escape(value.Substring(4))));
        return Regex.Replace(text, @"(?<!\p{L})ένα (?<adj>" + adjectives + @"|γιγάντιο) (?<noun>" + nouns + @")(?!\p{L})", match =>
        {
            string adjective = match.Groups["adj"].Value;
            if (adjective == "γιγάντιο") adjective = "γιγάντιος";
            string[] noun = grammar["noun:" + match.Groups["noun"].Value];
            string[] forms = grammar["adj:" + adjective];
            int gender = int.Parse(noun[0], CultureInfo.InvariantCulture);
            string article = new[] { "έναν", "μια", "ένα" }[gender];
            string phrase = forms.Length == 4 && forms[3] == "after"
                ? noun[1] + " " + forms[gender] : forms[gender] + " " + noun[1];
            return article + " " + phrase;
        });
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

    private static void BeforeTextRendering(object[] __args, out bool __state)
    {
        __state = false;
        if (TextRenderingDepth > 0)
            return;
        if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod)
            return;

        ArabicScriptTextAdapter? adapter = LocalizedContentManager.CurrentModLanguage?.LanguageCode switch
        {
            PersianLanguageCode => PersianAdapter,
            ArabicLanguageCode => ArabicAdapter,
            HebrewLanguageCode => HebrewAdapter,
            _ => null,
        };
        if (adapter is null) return;

        TextRenderingDepth += 1;
        __state = true;
        try
        {
            for (int index = 0; index < __args.Length; index += 1)
            {
                if (__args[index] is string text)
                    __args[index] = adapter.Transform(text);
                else if (__args[index] is StringBuilder builder)
                    __args[index] = new StringBuilder(adapter.Transform(builder.ToString()));
            }
        }
        catch
        {
            TextRenderingDepth -= 1;
            __state = false;
            throw;
        }
    }

    private static Exception? FinishTextRendering(Exception? __exception, bool __state)
    {
        if (__state)
            TextRenderingDepth = Math.Max(0, TextRenderingDepth - 1);
        return __exception;
    }
}

public sealed class ArabicScriptTextAdapter
{
    private enum Direction { Neutral, LeftToRight, RightToLeft }

    private sealed record MapDocument(int Format, MapEntry[] Entries);
    private sealed record MapEntry(
        string Glyph,
        string Logical,
        string Form,
        string Cluster,
        string Joining
    );
    private sealed record TextItem(string Text, Direction Direction, bool IsProtected = false);

    private static readonly Regex ProtectedToken = new(
        @"\G(?:\{\{[^}]+\}\}|\{[A-Za-z0-9_:]+\}|\[[^\]]+\]|https?://\S+|%[A-Za-z][A-Za-z0-9_:]*|\$[A-Za-z0-9]+)",
        RegexOptions.Compiled | RegexOptions.CultureInvariant
    );

    private readonly Dictionary<string, string> glyphByClusterAndForm;
    private readonly Dictionary<string, string> joiningByCluster;
    private readonly HashSet<string> glyphs;

    private ArabicScriptTextAdapter(MapEntry[] entries)
    {
        glyphByClusterAndForm = entries.ToDictionary(
            entry => Key(entry.Logical, entry.Form),
            entry => entry.Glyph,
            StringComparer.Ordinal
        );
        joiningByCluster = entries
            .GroupBy(entry => entry.Logical, StringComparer.Ordinal)
            .ToDictionary(group => group.Key, group => group.First().Joining, StringComparer.Ordinal);
        glyphs = entries.Select(entry => entry.Glyph).ToHashSet(StringComparer.Ordinal);
    }

    public static ArabicScriptTextAdapter Load(string file)
    {
        MapDocument? document = JsonSerializer.Deserialize<MapDocument>(
            File.ReadAllText(file),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );
        if (document?.Format != 2 || document.Entries.Length == 0)
            throw new InvalidDataException("The Arabic-script shaping map is missing or invalid.");
        return new ArabicScriptTextAdapter(document.Entries);
    }

    public static ArabicScriptTextAdapter CreateBidiOnly()
    {
        return new ArabicScriptTextAdapter(Array.Empty<MapEntry>());
    }

    public string Transform(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        if (ContainsMappedGlyph(value) && !ContainsLogicalScript(value)) return value;
        if (!ContainsLogicalScript(value)) return value;

        StringBuilder result = new(value.Length);
        int start = 0;
        while (start < value.Length)
        {
            int newline = value.IndexOf('\n', start);
            int end = newline < 0 ? value.Length : newline;
            result.Append(TransformLine(value.Substring(start, end - start)));
            if (newline < 0) break;
            result.Append('\n');
            start = newline + 1;
        }
        return result.ToString();
    }

    private string TransformLine(string line)
    {
        List<TextItem> items = Tokenize(line);
        if (!items.Any(item => item.Direction == Direction.RightToLeft)) return line;

        string[] joiningTypes = items.Select(item => Joining(item.Text)).ToArray();
        for (int index = 0; index < items.Count; index += 1)
        {
            string joining = joiningTypes[index];
            bool joinsPrevious = joining != "none"
                && index > 0
                && joiningTypes[index - 1] == "dual";
            bool joinsNext = joining == "dual"
                && index + 1 < items.Count
                && joiningTypes[index + 1] != "none";
            string form = joinsPrevious && joinsNext ? "medial"
                : joinsPrevious ? "final"
                : joinsNext ? "initial"
                : "isolated";
            if (glyphByClusterAndForm.TryGetValue(Key(items[index].Text, form), out string? glyph))
                items[index] = new TextItem(glyph, Direction.RightToLeft);
        }

        ResolveNeutrals(items);
        List<List<TextItem>> runs = new();
        foreach (TextItem item in items)
        {
            if (runs.Count == 0 || runs[^1][0].Direction != item.Direction)
                runs.Add(new List<TextItem> { item });
            else
                runs[^1].Add(item);
        }

        StringBuilder visual = new(line.Length);
        for (int runIndex = runs.Count - 1; runIndex >= 0; runIndex -= 1)
        {
            List<TextItem> run = runs[runIndex];
            if (run[0].Direction == Direction.RightToLeft)
            {
                for (int itemIndex = run.Count - 1; itemIndex >= 0; itemIndex -= 1)
                {
                    TextItem item = run[itemIndex];
                    visual.Append(item.IsProtected ? item.Text : Mirror(item.Text));
                }
            }
            else
            {
                foreach (TextItem item in run) visual.Append(item.Text);
            }
        }
        return visual.ToString();
    }

    private List<TextItem> Tokenize(string value)
    {
        List<TextItem> items = new();
        int offset = 0;
        while (offset < value.Length)
        {
            Match protectedMatch = ProtectedToken.Match(value, offset);
            if (protectedMatch.Success)
            {
                items.Add(new TextItem(protectedMatch.Value, Direction.LeftToRight, true));
                offset += protectedMatch.Length;
                continue;
            }

            TextElementEnumerator enumerator = StringInfo.GetTextElementEnumerator(value, offset);
            if (!enumerator.MoveNext()) break;
            string element = enumerator.GetTextElement();
            items.Add(new TextItem(element, Classify(element)));
            offset += element.Length;
        }
        return items;
    }

    private Direction Classify(string value)
    {
        if (joiningByCluster.ContainsKey(value) || glyphs.Contains(value)) return Direction.RightToLeft;
        foreach (char character in value)
        {
            if (IsRightToLeft(character)) return Direction.RightToLeft;
            if (char.IsLetterOrDigit(character)) return Direction.LeftToRight;
        }
        return Direction.Neutral;
    }

    private static void ResolveNeutrals(List<TextItem> items)
    {
        int index = 0;
        while (index < items.Count)
        {
            if (items[index].Direction != Direction.Neutral) { index += 1; continue; }
            int end = index;
            while (end + 1 < items.Count && items[end + 1].Direction == Direction.Neutral) end += 1;
            Direction before = index > 0 ? items[index - 1].Direction : Direction.RightToLeft;
            Direction after = end + 1 < items.Count ? items[end + 1].Direction : Direction.RightToLeft;
            Direction resolved = before == after ? before : Direction.RightToLeft;
            for (int neutral = index; neutral <= end; neutral += 1)
                items[neutral] = items[neutral] with { Direction = resolved };
            index = end + 1;
        }
    }

    private string Joining(string logical)
    {
        return joiningByCluster.TryGetValue(logical, out string? joining) ? joining : "none";
    }

    private bool ContainsMappedGlyph(string value)
    {
        foreach (char character in value)
            if (glyphs.Contains(character.ToString())) return true;
        return false;
    }

    private static bool ContainsLogicalScript(string value)
    {
        foreach (char character in value)
            if (IsRightToLeft(character) && char.IsLetter(character)) return true;
        return false;
    }

    private static bool IsArabic(char character)
    {
        return character is >= '\u0600' and <= '\u06FF'
            or >= '\u0750' and <= '\u077F'
            or >= '\u08A0' and <= '\u08FF';
    }

    private static bool IsRightToLeft(char character)
    {
        return IsArabic(character)
            || character is >= '\u0590' and <= '\u05FF';
    }

    private static string Mirror(string value)
    {
        return value switch
        {
            "(" => ")", ")" => "(",
            "[" => "]", "]" => "[",
            "{" => "}", "}" => "{",
            "<" => ">", ">" => "<",
            _ => value,
        };
    }

    private static string Key(string logical, string form) => $"{logical}\0{form}";
}
}
