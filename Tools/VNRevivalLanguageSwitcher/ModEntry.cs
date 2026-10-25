using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
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
    private static bool LoggedPlainRtlRenderer;
    private static bool LoggedSpriteFontRtlRenderer;
    private static bool LoggedCharacterLabelLayout;
    private sealed record CharacterLabelState(ClickableComponent Label, string Text, Rectangle Bounds);
    private static readonly FieldInfo[] CharacterFormLabels = new[] { "nameLabel", "farmLabel", "favoriteLabel" }
        .Select(name => AccessTools.Field(typeof(CharacterCustomization), name)
            ?? throw new MissingFieldException(typeof(CharacterCustomization).FullName, name)).ToArray();
    private static readonly (string Button, FieldInfo Label)[] CharacterSelectionLabels = new[]
        { ("Skin", "skinLabel"), ("Hair", "hairLabel"), ("Shirt", "shirtLabel"),
          ("Pants Style", "pantsStyleLabel"), ("Acc", "accLabel") }
        .Select(item => (item.Item1, AccessTools.Field(typeof(CharacterCustomization), item.Item2)
            ?? throw new MissingFieldException(typeof(CharacterCustomization).FullName, item.Item2))).ToArray();
    private static readonly FieldInfo ColorPickerBounds = AccessTools.Field(typeof(ColorPicker), "bounds")
        ?? throw new MissingFieldException(typeof(ColorPicker).FullName, "bounds");
    private sealed record ParsedTextLayout(SpriteFont Font, int Width, ArabicScriptTextAdapter Adapter);
    private static readonly ConditionalWeakTable<string, ParsedTextLayout> ParsedTextLayouts = new();
    [ThreadStatic]
    private static int TextRenderingDepth;
    [ThreadStatic]
    private static int DialogueRenderingDepth;
    [ThreadStatic]
    private static object? RelocatedDialogueIcon;
    [ThreadStatic]
    private static Vector2 RelocatedDialogueIconPosition;
    private static FieldInfo? DialogueIconField;
    private static FieldInfo? DialogueIconPositionField;
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
        DialogueIconField = AccessTools.Field(typeof(DialogueBox), "dialogueIcon")
            ?? throw new InvalidOperationException("The Stardew Valley dialogue icon field was not found.");
        DialogueIconPositionField = AccessTools.Field(typeof(TemporaryAnimatedSprite), "position")
            ?? throw new InvalidOperationException("The Stardew Valley dialogue icon position field was not found.");
        MethodInfo dialogueDrawTarget = AccessTools.Method(
            typeof(DialogueBox),
            nameof(DialogueBox.draw),
            new[] { typeof(SpriteBatch) }
        ) ?? throw new InvalidOperationException("The Stardew Valley dialogue draw method was not found.");
        harmony.Patch(
            dialogueDrawTarget,
            prefix: new HarmonyMethod(typeof(ModEntry), nameof(BeginDialogueRendering)),
            finalizer: new HarmonyMethod(typeof(ModEntry), nameof(FinishDialogueRendering))
        );
        MethodInfo textFinalizer = AccessTools.Method(typeof(ModEntry), nameof(FinishTextRendering))
            ?? throw new InvalidOperationException("The Arabic-script rendering cleanup was not found.");
        HarmonyMethod textHarmonyFinalizer = new(textFinalizer);

        IEnumerable<MethodInfo> spriteTextMethods = AccessTools.GetDeclaredMethods(typeof(SpriteText))
            .Where(method =>
                (method.Name == nameof(SpriteText.drawString)
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
            harmony.Patch(method, prefix: new HarmonyMethod(GetTextRenderingPrefix(method)), finalizer: textHarmonyFinalizer);
            patched += 1;
        }
        Monitor.Log($"Persian, Arabic, and Hebrew shaping/bidi adapters enabled for {patched} text methods.", LogLevel.Trace);

        harmony.Patch(AccessTools.Method(typeof(CharacterCustomization), nameof(CharacterCustomization.draw),
                new[] { typeof(SpriteBatch) }),
            prefix: new HarmonyMethod(typeof(ModEntry), nameof(BeforeCharacterCreationDraw)),
            finalizer: new HarmonyMethod(typeof(ModEntry), nameof(FinishCharacterCreationDraw)));

        // SpriteFont paragraphs (journal descriptions/objectives, among others)
        // are wrapped by parseText and drawn separately through Utility. Their
        // DrawString call has no width, so preserve the actual wrapping region
        // by result identity rather than guessing from a viewport or longest line.
        harmony.Patch(AccessTools.Method(typeof(Game1), nameof(Game1.parseText),
                new[] { typeof(string), typeof(SpriteFont), typeof(int) }),
            postfix: new HarmonyMethod(typeof(ModEntry), nameof(AfterParsedText)));
        MethodInfo[] boundedTextMethods = AccessTools.GetDeclaredMethods(typeof(Utility)).Where(method =>
            method.Name == nameof(Utility.drawTextWithShadow)
            && method.GetParameters() is var parameters && parameters.Length >= 4
            && parameters[1].ParameterType == typeof(string)
            && parameters[2].ParameterType == typeof(SpriteFont)
            && parameters[3].ParameterType == typeof(Vector2)).ToArray();
        if (boundedTextMethods.Length == 0)
            throw new MissingMethodException("The bounded SpriteFont text renderer was not found.");
        foreach (MethodInfo method in boundedTextMethods)
        {
            harmony.Patch(method,
                prefix: new HarmonyMethod(typeof(ModEntry), nameof(BeforeBoundedSpriteFontText)),
                finalizer: textHarmonyFinalizer);
        }
    }

    private static void BeforeCharacterCreationDraw(CharacterCustomization __instance, out List<CharacterLabelState> __state)
    {
        __state = new();
        ArabicScriptTextAdapter? adapter = CurrentRtlAdapter();
        if (adapter is null || __instance.showingCoopHelp
            || __instance.source is not (CharacterCustomization.Source.NewGame
                or CharacterCustomization.Source.HostNewFarm or CharacterCustomization.Source.NewFarmhand)) return;
        SpriteFont font = Game1.smallFont;
        Vector2 Measure(string text)
        {
            // Measure visual glyphs once, without recursively applying bidi.
            TextRenderingDepth += 1;
            try { return font.MeasureString(adapter.Transform(text)); }
            finally { TextRenderingDepth -= 1; }
        }
        var saved = __state;
        void Place(ClickableComponent? label, int left, int right, int centerY, int height)
        {
            if (label is null || !label.visible || right <= left || !adapter.ContainsRightToLeftText(label.name)) return;
            string[] words = label.name.Replace('\n', ' ').Split(' ', StringSplitOptions.RemoveEmptyEntries);
            List<string> lines = new();
            string line = "";
            foreach (string word in words)
            {
                if (Measure(word).X > right - left) return;
                string candidate = line.Length == 0 ? word : line + " " + word;
                if (line.Length > 0 && Measure(candidate).X > right - left)
                { lines.Add(line); line = word; }
                else line = candidate;
            }
            if (line.Length > 0) lines.Add(line);
            string display = string.Join("\n", lines);
            Vector2 size = Measure(display);
            if (lines.Count == 0 || size.Y > height) return;
            saved.Add(new CharacterLabelState(label, label.name, label.bounds));
            label.name = display;
            label.bounds = new Rectangle(right - (int)Math.Ceiling(size.X),
                centerY - (int)Math.Ceiling(size.Y / 2f), label.bounds.Width, label.bounds.Height);
        }

        ClickableComponent[] fields = { __instance.nameBoxCC, __instance.farmnameBoxCC, __instance.favThingBoxCC };
        for (int index = 0; index < fields.Length; index += 1)
        {
            ClickableComponent field = fields[index];
            if (field is not null && field.visible)
                Place(CharacterFormLabels[index].GetValue(__instance) as ClickableComponent,
                    __instance.portraitBox.Right + 20, field.bounds.Left - 20,
                    field.bounds.Center.Y, field.bounds.Height);
        }
        if (__instance.petPortraitBox is Rectangle pet)
            Place(__instance.labels.FirstOrDefault(label => label.bounds.Y == pet.Top + 8),
                __instance.portraitBox.Right + 20, pet.Left - 64 - 20, pet.Center.Y, pet.Height);

        foreach (var selection in CharacterSelectionLabels)
        {
            ClickableComponent? label = selection.Label.GetValue(__instance) as ClickableComponent;
            ClickableComponent? left = __instance.leftSelectionButtons.FirstOrDefault(button => button.name == selection.Button);
            ClickableComponent? right = __instance.rightSelectionButtons.FirstOrDefault(button => button.name == selection.Button);
            if (label is null || !label.visible || left is null || right is null
                || !adapter.ContainsRightToLeftText(label.name)) continue;
            // The game draws both the caption and its value around bounds.X + 21.
            // Use the real arrow gap instead of the original fixed caption anchor.
            saved.Add(new CharacterLabelState(label, label.name, label.bounds));
            // Native centering must measure the same contextual glyphs it draws.
            // Measuring logical Arabic letters gives different widths; don't rely
            // on a MeasureString interception at the game's centering call site.
            string visual = adapter.Transform(label.name);
            // PUA shaping is idempotent. Hebrew remains Unicode RTL and must
            // reach the normal bidi renderer in logical order, exactly once.
            if (!adapter.ContainsRightToLeftText(visual)) label.name = visual;
            label.bounds.X = (left.bounds.Right + right.bounds.Left) / 2 - 21;
        }

        foreach (ColorPicker? picker in new[] { __instance.eyeColorPicker, __instance.hairColorPicker, __instance.pantsColorPicker })
        {
            if (picker is null) continue;
            Rectangle bounds = (Rectangle)ColorPickerBounds.GetValue(picker)!;
            ClickableComponent? label = __instance.labels.FirstOrDefault(item => item.bounds.Y == bounds.Y + 16
                && item.bounds.X > __instance.portraitBox.Right && item.bounds.X < bounds.Left);
            int left = __instance.rightSelectionButtons.Where(button => Math.Abs(button.bounds.Center.Y - bounds.Center.Y) <= 8)
                .Select(button => button.bounds.Right + 12).DefaultIfEmpty(__instance.portraitBox.Right + 20).Max();
            Place(label, left, bounds.Left - 20, bounds.Center.Y, bounds.Height);
        }
        if (saved.Count > 0 && !LoggedCharacterLabelLayout)
        {
            LoggedCharacterLabelLayout = true;
            ModMonitor?.Log($"RTL character-creation labels reflowed against native control bounds: {saved.Count} labels.", LogLevel.Trace);
        }
    }

    private static Exception? FinishCharacterCreationDraw(Exception? __exception, List<CharacterLabelState>? __state)
    {
        if (__state is not null)
            foreach (CharacterLabelState state in __state)
            { state.Label.name = state.Text; state.Label.bounds = state.Bounds; }
        return __exception;
    }

    private static ArabicScriptTextAdapter? CurrentRtlAdapter() =>
        LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod ? null
        : LocalizedContentManager.CurrentModLanguage?.LanguageCode switch
        {
            PersianLanguageCode => PersianAdapter,
            ArabicLanguageCode => ArabicAdapter,
            HebrewLanguageCode => HebrewAdapter,
            _ => null,
        };

    private static void AfterParsedText(string __result, SpriteFont __1, int __2)
    {
        ArabicScriptTextAdapter? adapter = CurrentRtlAdapter();
        if (TextRenderingDepth > 0 || __2 <= 0 || adapter is null
            || !adapter.ContainsRightToLeftText(__result)) return;
        ParsedTextLayouts.Remove(__result);
        ParsedTextLayouts.Add(__result, new ParsedTextLayout(__1, __2, adapter));
    }

    private static bool BeforeBoundedSpriteFontText(MethodBase __originalMethod, object[] __args, out bool __state)
    {
        __state = false;
        if (TextRenderingDepth > 0 || __args[1] is not string text
            || __args[2] is not SpriteFont font || __args[3] is not Vector2 position
            || !ParsedTextLayouts.TryGetValue(text, out ParsedTextLayout? layout)
            || !ReferenceEquals(font, layout.Font) || !ReferenceEquals(CurrentRtlAdapter(), layout.Adapter))
            return true;

        TextRenderingDepth += 1;
        __state = true;
        try
        {
            ParameterInfo[] parameters = __originalMethod.GetParameters();
            int scaleIndex = Array.FindIndex(parameters, parameter => parameter.Name == "scale"
                && parameter.ParameterType == typeof(float));
            float scale = scaleIndex >= 0 ? (float)__args[scaleIndex] : 1f;
            string[] lines = text.Replace("\r\n", "\n", StringComparison.Ordinal).Split('\n');
            for (int index = 0; index < lines.Length; index += 1)
            {
                // parseText appends a separator after its last word. It is not
                // visible ink and must not shift the RTL paragraph's right edge.
                string visualLine = layout.Adapter.Transform(lines[index].TrimEnd(' ', '\r'));
                float lineWidth = font.MeasureString(visualLine).X;
                object[] lineArguments = (object[])__args.Clone();
                lineArguments[1] = visualLine;
                lineArguments[3] = position + new Vector2((layout.Width - lineWidth) * scale,
                    index * font.LineSpacing * scale);
                // Keep the original shadow/color/layer/scale implementation.
                // The depth guard prevents the nested SpriteBatch prefix from
                // applying bidi twice and is released by the Harmony finalizer.
                ((MethodInfo)__originalMethod).Invoke(null, lineArguments);
            }
            if (!LoggedSpriteFontRtlRenderer)
            {
                LoggedSpriteFontRtlRenderer = true;
                ModMonitor?.Log($"Right-aligned bounded SpriteFont renderer enabled; width {layout.Width}, lines {lines.Length}, right edge {position.X + layout.Width * scale}.", LogLevel.Trace);
            }
            return false;
        }
        catch
        {
            TextRenderingDepth -= 1;
            __state = false;
            throw;
        }
    }

    private static void BeginDialogueRendering(DialogueBox __instance)
    {
        if (DialogueRenderingDepth == 0)
        {
            string? languageCode = LocalizedContentManager.CurrentLanguageCode
                == LocalizedContentManager.LanguageCode.mod
                ? LocalizedContentManager.CurrentModLanguage?.LanguageCode
                : null;
            bool isRightToLeft = languageCode is PersianLanguageCode or ArabicLanguageCode or HebrewLanguageCode;
            object? icon = isRightToLeft ? DialogueIconField?.GetValue(__instance) : null;
            if (icon is not null
                && DialogueIconPositionField?.GetValue(icon) is Vector2 position)
            {
                RelocatedDialogueIcon = icon;
                RelocatedDialogueIconPosition = position;
                position.X = __instance.x + 16;
                DialogueIconPositionField.SetValue(icon, position);
            }
        }
        DialogueRenderingDepth += 1;
    }

    private static Exception? FinishDialogueRendering(Exception? __exception)
    {
        DialogueRenderingDepth = Math.Max(0, DialogueRenderingDepth - 1);
        if (DialogueRenderingDepth == 0)
        {
            if (RelocatedDialogueIcon is not null)
                DialogueIconPositionField?.SetValue(RelocatedDialogueIcon, RelocatedDialogueIconPosition);
            RelocatedDialogueIcon = null;
        }
        return __exception;
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

    private static bool BeforeTextRendering(MethodBase __originalMethod, object[] __args, out bool __state)
    {
        __state = false;
        if (TextRenderingDepth > 0)
            return true;
        if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod)
            return true;

        ArabicScriptTextAdapter? adapter = LocalizedContentManager.CurrentModLanguage?.LanguageCode switch
        {
            PersianLanguageCode => PersianAdapter,
            ArabicLanguageCode => ArabicAdapter,
            HebrewLanguageCode => HebrewAdapter,
            _ => null,
        };
        if (adapter is null) return true;

        TextRenderingDepth += 1;
        __state = true;
        try
        {
            if (TryDrawBoundedRightToLeftSpriteText(__originalMethod, __args, adapter))
                return false;

            ApplyRightToLeftAlignment(__originalMethod, __args);
            DisableProgressiveRightToLeftText(__originalMethod, __args);
            for (int index = 0; index < __args.Length; index += 1)
            {
                if (__args[index] is string text)
                    __args[index] = adapter.Transform(text);
                else if (__args[index] is StringBuilder builder)
                    __args[index] = new StringBuilder(adapter.Transform(builder.ToString()));
            }
            return true;
        }
        catch
        {
            TextRenderingDepth -= 1;
            __state = false;
            throw;
        }
    }

    private static MethodInfo GetTextRenderingPrefix(MethodBase method)
    {
        ParameterInfo[] parameters = method.GetParameters();
        string name = method.DeclaringType == typeof(SpriteText) && method.Name == nameof(SpriteText.drawString)
            ? nameof(BeforeSpriteTextRendering)
            : parameters[0].ParameterType == typeof(string) ? nameof(BeforeStringMeasurement)
            : parameters[0].ParameterType == typeof(StringBuilder) ? nameof(BeforeBuilderMeasurement)
            : parameters[1].ParameterType == typeof(string) ? nameof(BeforeStringRendering)
            : nameof(BeforeBuilderRendering);
        return AccessTools.Method(typeof(ModEntry), name)
            ?? throw new MissingMethodException(name);
    }

    // SMAPI's bundled Harmony restores __args only for parameters which were
    // already by-ref in the original method. DrawString/MeasureString accept
    // text by value, so array edits alone never reach the actual renderer.
    // Bind explicit ref arguments, including SpriteText's layout parameters.
    private static bool BeforeStringRendering(object? __instance, MethodBase __originalMethod, object[] __args, ref string __1, out bool __state)
    {
        if (TryDrawSpriteFontParagraph(__instance, __originalMethod, __args, out __state)) return false;
        bool run = BeforeTextRendering(__originalMethod, __args, out __state);
        __1 = (string)__args[1];
        return run;
    }

    private static bool BeforeBuilderRendering(object? __instance, MethodBase __originalMethod, object[] __args, ref StringBuilder __1, out bool __state)
    {
        if (TryDrawSpriteFontParagraph(__instance, __originalMethod, __args, out __state)) return false;
        bool run = BeforeTextRendering(__originalMethod, __args, out __state);
        __1 = (StringBuilder)__args[1];
        return run;
    }

    private static bool TryDrawSpriteFontParagraph(object? renderer, MethodBase method, object[] arguments, out bool state)
    {
        state = false;
        if (TextRenderingDepth > 0 || renderer is not SpriteBatch
            || method.DeclaringType != typeof(SpriteBatch) || arguments[0] is not SpriteFont font
            || arguments[2] is not Vector2 position) return false;
        string? text = arguments[1] is string s ? s : (arguments[1] as StringBuilder)?.ToString();
        ArabicScriptTextAdapter? adapter = CurrentRtlAdapter();
        if (text is null || !text.Contains('\n') || adapter is null || !adapter.ContainsRightToLeftText(text))
            return false;
        ParameterInfo[] parameters = method.GetParameters();
        int IndexOf(string name) => Array.FindIndex(parameters, p => p.Name == name);
        int rotation = IndexOf("rotation"), origin = IndexOf("origin"), effects = IndexOf("effects"), scaleIndex = IndexOf("scale");
        if ((rotation >= 0 && (float)arguments[rotation] != 0f)
            || (origin >= 0 && (Vector2)arguments[origin] != Vector2.Zero)
            || (effects >= 0 && (SpriteEffects)arguments[effects] != SpriteEffects.None)) return false;
        Vector2 scale = scaleIndex < 0 ? Vector2.One : arguments[scaleIndex] is Vector2 vector
            ? vector : new Vector2((float)arguments[scaleIndex]);

        TextRenderingDepth += 1;
        state = true;
        try
        {
            string[] lines = text.Replace("\r\n", "\n", StringComparison.Ordinal).Split('\n')
                .Select(line => adapter.Transform(line.TrimEnd(' ', '\r'))).ToArray();
            float[] widths = lines.Select(line => font.MeasureString(line).X).ToArray();
            // Unbounded DrawString paragraphs (including tooltip StringBuilders)
            // own only their measured block. Keep that block's origin and extent;
            // align its shorter lines without inventing a surrounding UI region.
            float width = widths.Max();
            for (int index = 0; index < lines.Length; index += 1)
            {
                object[] lineArguments = (object[])arguments.Clone();
                lineArguments[1] = arguments[1] is StringBuilder ? new StringBuilder(lines[index]) : lines[index];
                lineArguments[2] = position + new Vector2((width - widths[index]) * scale.X,
                    index * font.LineSpacing * scale.Y);
                ((MethodInfo)method).Invoke(renderer, lineArguments);
            }
            return true;
        }
        catch
        {
            TextRenderingDepth -= 1;
            state = false;
            throw;
        }
    }

    private static bool BeforeStringMeasurement(MethodBase __originalMethod, object[] __args, ref string __0, out bool __state)
    {
        bool run = BeforeTextRendering(__originalMethod, __args, out __state);
        __0 = (string)__args[0];
        return run;
    }

    private static bool BeforeBuilderMeasurement(MethodBase __originalMethod, object[] __args, ref StringBuilder __0, out bool __state)
    {
        bool run = BeforeTextRendering(__originalMethod, __args, out __state);
        __0 = (StringBuilder)__args[0];
        return run;
    }

    private static bool BeforeSpriteTextRendering(MethodBase __originalMethod, object[] __args,
        ref string __1, ref int __4, ref int __5, ref SpriteText.ScrollTextAlignment __13, out bool __state)
    {
        bool run = BeforeTextRendering(__originalMethod, __args, out __state);
        __1 = (string)__args[1];
        __4 = (int)__args[4];
        __5 = (int)__args[5];
        __13 = (SpriteText.ScrollTextAlignment)__args[13];
        return run;
    }

    private static bool TryDrawBoundedRightToLeftSpriteText(
        MethodBase method,
        object[] arguments,
        ArabicScriptTextAdapter adapter
    )
    {
        if (method.DeclaringType != typeof(SpriteText) || method.Name != nameof(SpriteText.drawString))
            return false;

        ParameterInfo[] parameters = method.GetParameters();
        int IndexOf(string name) => Array.FindIndex(parameters, parameter => parameter.Name == name);
        int batchIndex = IndexOf("b");
        int textIndex = IndexOf("s");
        int xIndex = IndexOf("x");
        int yIndex = IndexOf("y");
        int widthIndex = IndexOf("width");
        int alphaIndex = IndexOf("alpha");
        int layerDepthIndex = IndexOf("layerDepth");
        int junimoTextIndex = IndexOf("junimoText");
        int backgroundIndex = IndexOf("drawBGScroll");
        int colorIndex = IndexOf("color");
        if (new[]
            {
                batchIndex, textIndex, xIndex, yIndex, widthIndex, alphaIndex,
                layerDepthIndex, junimoTextIndex, backgroundIndex, colorIndex,
            }.Any(index => index < 0 || index >= arguments.Length))
            return false;

        if (arguments[batchIndex] is not SpriteBatch batch
            || arguments[textIndex] is not string logicalText
            || !adapter.ContainsRightToLeftText(logicalText)
            || arguments[xIndex] is not int x
            || arguments[yIndex] is not int y
            || arguments[widthIndex] is not int width
            || width <= 0
            || arguments[alphaIndex] is not float alpha
            || arguments[layerDepthIndex] is not float layerDepth
            || arguments[junimoTextIndex] is not bool junimoText
            || arguments[backgroundIndex] is not int drawBackground
            || drawBackground >= 0)
            return false;

        Color? color = arguments[colorIndex] is Color explicitColor ? explicitColor : null;
        int rightPadding = Math.Max(4, (int)Math.Round(SpriteText.fontPixelZoom * 4f));
        int availableWidth = Math.Max(1, width - rightPadding * 2);
        List<string> logicalLines = WrapRightToLeftText(logicalText, availableWidth, adapter);

        int contentX = x;
        int viewportWidth = batch.GraphicsDevice.Viewport.Width;
        if (contentX + width > viewportWidth - 4)
            contentX = viewportWidth - width - 4;
        contentX = Math.Max(0, contentX);
        int rightEdge = contentX + width - rightPadding;
        int lineY = y;

        foreach (string logicalLine in logicalLines)
        {
            string visualLine = adapter.Transform(logicalLine);
            int lineWidth = SpriteText.getWidthOfString(visualLine, 999999);
            int lineX = rightEdge - lineWidth;
            // SpriteText wraps using a look-ahead calculation which can exceed
            // getWidthOfString by one word-spacing step. Giving the nested draw
            // only the measured glyph width can therefore push the final visual
            // RTL word onto a second, left-anchored line. Use all space from our
            // calculated origin to the viewport edge; x + width stays within the
            // native clamp, while the already wrapped line cannot wrap again.
            int lineDrawWidth = Math.Max(1, viewportWidth - lineX - 4);
            SpriteText.drawString(
                batch,
                visualLine,
                lineX,
                lineY,
                999999,
                lineDrawWidth,
                999999,
                alpha,
                layerDepth,
                junimoText,
                -1,
                string.Empty,
                color,
                SpriteText.ScrollTextAlignment.Left
            );
            lineY += Math.Max(1, SpriteText.getHeightOfString(visualLine, lineDrawWidth));
        }

        if (!LoggedPlainRtlRenderer)
        {
            LoggedPlainRtlRenderer = true;
            ModMonitor?.Log(
                $"Right-aligned plain SpriteText renderer enabled; width {width}, lines {logicalLines.Count}.",
                LogLevel.Trace
            );
        }
        return true;
    }

    private static List<string> WrapRightToLeftText(
        string logicalText,
        int availableWidth,
        ArabicScriptTextAdapter adapter
    )
    {
        List<string> lines = new();
        string normalized = logicalText.Replace("\r\n", "\n", StringComparison.Ordinal).Replace('^', '\n');
        foreach (string paragraph in normalized.Split('\n'))
        {
            if (paragraph.Length == 0)
            {
                lines.Add(string.Empty);
                continue;
            }

            string[] words = paragraph.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (words.Length == 0)
            {
                lines.Add(string.Empty);
                continue;
            }

            StringBuilder current = new();
            foreach (string word in words)
            {
                string candidate = current.Length == 0 ? word : current + " " + word;
                string visualCandidate = adapter.Transform(candidate);
                int candidateWidth = SpriteText.getWidthOfString(visualCandidate, 999999);
                if (candidateWidth > availableWidth && current.Length > 0)
                {
                    lines.Add(current.ToString());
                    current.Clear();
                    current.Append(word);
                }
                else
                {
                    current.Clear();
                    current.Append(candidate);
                }
            }
            if (current.Length > 0)
                lines.Add(current.ToString());
        }
        return lines;
    }

    private static void DisableProgressiveRightToLeftText(
        MethodBase method,
        object[] arguments
    )
    {
        ParameterInfo[] parameters = method.GetParameters();
        int characterPositionIndex = Array.FindIndex(
            parameters,
            parameter => parameter.Name == "characterPosition"
                && parameter.ParameterType == typeof(int)
        );
        if (characterPositionIndex < 0
            || characterPositionIndex >= arguments.Length
            || arguments[characterPositionIndex] is not int characterPosition
            || characterPosition < 0
            || characterPosition == 999999)
            return;

        // SpriteText's typewriter effect is anchored to the left edge. Even if a
        // logical prefix is reordered correctly, each longer fragment still grows
        // to the right. Keep the complete RTL string and bypass the progressive
        // cutoff so the renderer can place it once against its stable right edge.
        arguments[characterPositionIndex] = 999999;
    }

    private static void ApplyRightToLeftAlignment(MethodBase method, object[] arguments)
    {
        ParameterInfo[] parameters = method.GetParameters();
        int alignmentIndex = Array.FindIndex(
            parameters,
            parameter => parameter.ParameterType == typeof(SpriteText.ScrollTextAlignment)
        );
        if (alignmentIndex < 0
            || alignmentIndex >= arguments.Length
            || arguments[alignmentIndex] is not SpriteText.ScrollTextAlignment alignment
            || alignment != SpriteText.ScrollTextAlignment.Left)
            return;

        // SpriteText treats an omitted width as the distance to the viewport edge.
        // Right-aligning that default would move short standalone labels across the
        // screen, so only align text inside an explicit region. Scroll backgrounds
        // derive their own bounded width from the displayed or placeholder text.
        bool hasBoundedWidth = method.Name.Contains("Scroll", StringComparison.Ordinal);
        if (!hasBoundedWidth)
        {
            int widthIndex = Array.FindIndex(
                parameters,
                parameter => parameter.Name == "width" && parameter.ParameterType == typeof(int)
            );
            hasBoundedWidth = widthIndex >= 0
                && widthIndex < arguments.Length
                && arguments[widthIndex] is int width
                && width > 0;
        }

        if (hasBoundedWidth)
            arguments[alignmentIndex] = SpriteText.ScrollTextAlignment.Right;
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

    public bool ContainsRightToLeftText(string value) => ContainsLogicalScript(value);

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
