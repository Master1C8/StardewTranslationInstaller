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
using Microsoft.Xna.Framework.Graphics;
using StardewModdingAPI;
using StardewValley;
using StardewValley.BellsAndWhistles;
using StardewValley.GameData;

namespace VNRevival.LanguageSwitcher;

public sealed class ModEntry : Mod
{
    private const string UrduLanguageCode = "ur-vnrevival";
    private static UrduTextAdapter? UrduAdapter;

    public override void Entry(IModHelper helper)
    {
        MethodInfo? target = AccessTools.Method(
            typeof(LocalizedContentManager),
            nameof(LocalizedContentManager.SetModLanguage)
        );
        MethodInfo? prefix = AccessTools.Method(typeof(ModEntry), nameof(BeforeSetModLanguage));
        if (target is null || prefix is null)
            throw new InvalidOperationException("The Stardew Valley language methods were not found.");

        Harmony harmony = new(ModManifest.UniqueID);
        harmony.Patch(target, prefix: new HarmonyMethod(prefix));

        string shapingMap = Path.Combine(helper.DirectoryPath, "urdu-shaping-map.json");
        UrduAdapter = UrduTextAdapter.Load(shapingMap);
        MethodInfo textPrefix = AccessTools.Method(typeof(ModEntry), nameof(BeforeTextRendering))
            ?? throw new InvalidOperationException("The Urdu rendering adapter was not found.");
        HarmonyMethod textHarmonyPrefix = new(textPrefix);

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
            harmony.Patch(method, prefix: textHarmonyPrefix);
            patched += 1;
        }
        Monitor.Log($"Urdu shaping and bidi adapter enabled for {patched} text methods.", LogLevel.Trace);
    }

    private static bool IsTextParameter(ParameterInfo parameter)
    {
        return parameter.ParameterType == typeof(string)
            || parameter.ParameterType == typeof(StringBuilder);
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

    private static void BeforeTextRendering(object[] __args)
    {
        if (UrduAdapter is null
            || LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.mod
            || LocalizedContentManager.CurrentModLanguage?.LanguageCode != UrduLanguageCode)
            return;

        for (int index = 0; index < __args.Length; index += 1)
        {
            if (__args[index] is string text)
                __args[index] = UrduAdapter.Transform(text);
            else if (__args[index] is StringBuilder builder)
                __args[index] = new StringBuilder(UrduAdapter.Transform(builder.ToString()));
        }
    }
}

public sealed class UrduTextAdapter
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

    private UrduTextAdapter(MapEntry[] entries)
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

    public static UrduTextAdapter Load(string file)
    {
        MapDocument? document = JsonSerializer.Deserialize<MapDocument>(
            File.ReadAllText(file),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );
        if (document?.Format != 2 || document.Entries.Length == 0)
            throw new InvalidDataException("The Urdu shaping map is missing or invalid.");
        return new UrduTextAdapter(document.Entries);
    }

    public string Transform(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        if (ContainsMappedGlyph(value) && !ContainsLogicalUrdu(value)) return value;
        if (!ContainsLogicalUrdu(value)) return value;

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
            if (IsArabic(character)) return Direction.RightToLeft;
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

    private static bool ContainsLogicalUrdu(string value)
    {
        foreach (char character in value)
            if (IsArabic(character) && char.IsLetter(character)) return true;
        return false;
    }

    private static bool IsArabic(char character)
    {
        return character is >= '\u0600' and <= '\u06FF'
            or >= '\u0750' and <= '\u077F'
            or >= '\u08A0' and <= '\u08FF';
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
