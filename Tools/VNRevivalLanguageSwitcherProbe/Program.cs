using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using VNRevival.LanguageSwitcher;

if (args.Length != 3)
    throw new ArgumentException("Pass the paths to urdu-shaping-map.json, persian-shaping-map.json, and arabic-shaping-map.json.");

Probe("Urdu", args[0], new[]
{
    "سلام دنیا",
    "سلام 123 دنیا",
    "سلام Alex دنیا",
    "(سلام دنیا)",
    "پیارے @، خوش آمدید!",
    "کمیونٹی سینٹر\nجنجر آئی لینڈ",
});
Probe("Persian", args[1], new[]
{
    "سلام دنیا",
    "سلام 123 دنیا",
    "سلام Alex دنیا",
    "(سلام دنیا)",
    "کشاورز عزیز، خوش آمدی!",
    "مرکز اجتماعات\nجزیره زنجبیل",
});
Probe("Arabic", args[2], new[]
{
    "مرحبا بالعالم",
    "مرحبا 123 بالعالم",
    "مرحبا Alex بالعالم",
    "(مرحبا بالعالم)",
    "أهلا بك يا مزارع!",
    "مركز المجتمع\nجزيرة الزنجبيل",
});

static void Probe(string language, string mapPath, string[] samples)
{
    UrduTextAdapter adapter = UrduTextAdapter.Load(mapPath);
    foreach (string sample in samples)
    {
        string transformed = adapter.Transform(sample);
        if (transformed == sample)
            throw new InvalidDataException($"{language} sample was not transformed: {sample}");
        if (adapter.Transform(transformed) != transformed)
            throw new InvalidDataException($"{language} shaping is not idempotent: {sample}");
        if (ContainsArabicLetter(transformed))
            throw new InvalidDataException($"A mapped {language} character remained unshaped: {sample}");
    }

    if (!adapter.Transform(samples[1]).Contains("123", StringComparison.Ordinal))
        throw new InvalidDataException($"The {language} bidi adapter reordered digits internally.");
    if (!adapter.Transform(samples[2]).Contains("Alex", StringComparison.Ordinal))
        throw new InvalidDataException($"The {language} bidi adapter reordered Latin text internally.");
    if (adapter.Transform("English 123") != "English 123")
        throw new InvalidDataException($"The {language} adapter changed non-Arabic text.");

    using JsonDocument mapDocument = JsonDocument.Parse(File.ReadAllText(mapPath));
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
                throw new InvalidDataException($"A {language} grapheme was not mapped in context: {context}");
            foreach (char character in transformed) reachedGlyphs.Add(character.ToString());
        }
    }
    string[] missingGlyphs = mappingEntries
        .Where(entry => !reachedGlyphs.Contains(entry.Glyph))
        .Select(entry => $"{entry.Logical}/{entry.Glyph}")
        .ToArray();
    if (missingGlyphs.Length > 0)
        throw new InvalidDataException($"Unreachable contextual {language} glyphs: {string.Join(", ", missingGlyphs)}");

    Console.WriteLine($"{language} shaping probe passed {samples.Length} mixed-direction samples and {mappingEntries.Count} contextual glyphs.");
}

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
