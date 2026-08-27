using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using VNRevival.LanguageSwitcher;

if (args.Length != 1)
    throw new ArgumentException("Pass the path to urdu-shaping-map.json.");

UrduTextAdapter adapter = UrduTextAdapter.Load(args[0]);
string[] samples =
{
    "سلام دنیا",
    "سلام 123 دنیا",
    "سلام Alex دنیا",
    "(سلام دنیا)",
    "پیارے @، خوش آمدید!",
    "کمیونٹی سینٹر\nجنجر آئی لینڈ",
};

foreach (string sample in samples)
{
    string transformed = adapter.Transform(sample);
    if (transformed == sample)
        throw new InvalidDataException($"Urdu sample was not transformed: {sample}");
    if (adapter.Transform(transformed) != transformed)
        throw new InvalidDataException($"Urdu shaping is not idempotent: {sample}");
    if (ContainsArabicLetter(transformed))
        throw new InvalidDataException($"A mapped Arabic character remained unshaped: {sample}");
}

if (!adapter.Transform(samples[1]).Contains("123", StringComparison.Ordinal))
    throw new InvalidDataException("The bidi adapter reordered digits internally.");
if (!adapter.Transform(samples[2]).Contains("Alex", StringComparison.Ordinal))
    throw new InvalidDataException("The bidi adapter reordered Latin text internally.");
if (adapter.Transform("English 123") != "English 123")
    throw new InvalidDataException("The Urdu adapter changed non-Urdu text.");

using JsonDocument mapDocument = JsonDocument.Parse(File.ReadAllText(args[0]));
List<(string Glyph, string Logical)> mappingEntries = mapDocument.RootElement
    .GetProperty("entries")
    .EnumerateArray()
    .Select(entry => (
        entry.GetProperty("glyph").GetString()!,
        entry.GetProperty("logical").GetString()!
    ))
    .ToList();
HashSet<string> reachedGlyphs = new(StringComparer.Ordinal);
foreach (string logical in mappingEntries.Select(entry => entry.Logical).Distinct(StringComparer.Ordinal))
{
    foreach (string context in new[] { logical, $"ب{logical}", $"{logical}ب", $"ب{logical}ب" })
    {
        string transformed = adapter.Transform(context);
        if (ContainsArabicLetter(transformed))
            throw new InvalidDataException($"An Urdu grapheme was not mapped in context: {context}");
        foreach (char character in transformed) reachedGlyphs.Add(character.ToString());
    }
}
string[] missingGlyphs = mappingEntries
    .Where(entry => !reachedGlyphs.Contains(entry.Glyph))
    .Select(entry => $"{entry.Logical}/{entry.Glyph}")
    .ToArray();
if (missingGlyphs.Length > 0)
    throw new InvalidDataException($"Unreachable contextual Urdu glyphs: {string.Join(", ", missingGlyphs)}");

Console.WriteLine($"Urdu shaping probe passed {samples.Length} mixed-direction samples and {mappingEntries.Count} contextual glyphs.");

static bool ContainsArabicLetter(string value)
{
    foreach (char character in value)
    {
        if (char.IsLetter(character) && (character is >= '\u0600' and <= '\u06FF'
            or >= '\u0750' and <= '\u077F'
            or >= '\u08A0' and <= '\u08FF')) return true;
    }
    return false;
}
