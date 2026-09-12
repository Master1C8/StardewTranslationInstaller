using System;
using System.IO;
using System.Linq;
using System.Reflection;
using StardewModdingAPI;
using StardewValley;
using StardewValley.GameData;
using VNRevival.LanguageSwitcher;

AppDomain.CurrentDomain.AssemblyResolve += (_, request) =>
{
    string path = Path.Combine(AppContext.BaseDirectory, new AssemblyName(request.Name).Name + ".dll");
    return File.Exists(path) ? Assembly.LoadFrom(path) : null;
};

ArabicScriptTextAdapter adapter = ArabicScriptTextAdapter.CreateBidiOnly();

Check("שלום עולם", "םלוע םולש");
Check("שלום 123 עולם", "םלוע 123 םולש");
Check("שלום Alex עולם", "םלוע Alex םולש");
Check("(שלום עולם)", "(םלוע םולש)");
Check("שלום {player} עולם", "םלוע {player} םולש");
Check("שלום [Item 74] עולם", "םלוע [Item 74] םולש");
Check("מרכז קהילתי\nאי ג'ינג'ר", "יתליהק זכרמ\nר'גני'ג יא");
Check("English 123", "English 123");
Check(string.Empty, string.Empty);
CheckNestedRenderingPatch();

Console.WriteLine("Hebrew bidi probe passed 9 exact cases and the nested DrawString/MeasureString reentrancy case.");

void Check(string logical, string expected)
{
    string actual = adapter.Transform(logical);
    if (actual != expected)
        throw new InvalidDataException($"Hebrew bidi mismatch for '{logical}': expected '{expected}', got '{actual}'.");
    if (actual.Any(character => character is '\u202A' or '\u202B' or '\u202C' or '\u202D' or '\u202E'
            or '\u2066' or '\u2067' or '\u2068' or '\u2069'))
        throw new InvalidDataException($"Hebrew bidi output contains a directional control: {logical}");
}

void CheckNestedRenderingPatch()
{
    Type modEntry = typeof(ModEntry);
    MethodInfo prefix = modEntry.GetMethod("BeforeTextRendering", BindingFlags.Static | BindingFlags.NonPublic)
        ?? throw new MissingMethodException("BeforeTextRendering");
    MethodInfo finalizer = modEntry.GetMethod("FinishTextRendering", BindingFlags.Static | BindingFlags.NonPublic)
        ?? throw new MissingMethodException("FinishTextRendering");
    FieldInfo adapterField = modEntry.GetField("HebrewAdapter", BindingFlags.Static | BindingFlags.NonPublic)
        ?? throw new MissingFieldException("HebrewAdapter");
    FieldInfo languageField = typeof(LocalizedContentManager).GetField(
        "_currentLangCode",
        BindingFlags.Static | BindingFlags.NonPublic
    ) ?? throw new MissingFieldException("_currentLangCode");
    FieldInfo modLanguageField = typeof(LocalizedContentManager).GetField(
        "_currentModLanguage",
        BindingFlags.Static | BindingFlags.NonPublic
    ) ?? throw new MissingFieldException("_currentModLanguage");

    object? savedAdapter = adapterField.GetValue(null);
    object? savedLanguage = languageField.GetValue(null);
    object? savedModLanguage = modLanguageField.GetValue(null);
    try
    {
        adapterField.SetValue(null, adapter);
        languageField.SetValue(null, LocalizedContentManager.LanguageCode.mod);
        modLanguageField.SetValue(null, new ModLanguage { LanguageCode = "he-vnrevival" });

        object[] outerText = { "שלום" };
        object?[] outerCall = { outerText, false };
        prefix.Invoke(null, outerCall);
        if ((string)outerText[0] != "םולש" || outerCall[1] is not true)
            throw new InvalidDataException("The outer text-rendering patch did not transform Hebrew exactly once.");

        object[] innerText = { outerText[0] };
        object?[] innerCall = { innerText, false };
        prefix.Invoke(null, innerCall);
        if ((string)innerText[0] != "םולש" || innerCall[1] is not false)
            throw new InvalidDataException("A forwarding text overload transformed Hebrew a second time.");

        finalizer.Invoke(null, new object?[] { null, innerCall[1] });
        finalizer.Invoke(null, new object?[] { null, outerCall[1] });

        object[] nextText = { "שלום" };
        object?[] nextCall = { nextText, false };
        prefix.Invoke(null, nextCall);
        if ((string)nextText[0] != "םולש" || nextCall[1] is not true)
            throw new InvalidDataException("The text-rendering guard was not released after the outer call.");
        finalizer.Invoke(null, new object?[] { null, nextCall[1] });
    }
    finally
    {
        adapterField.SetValue(null, savedAdapter);
        languageField.SetValue(null, savedLanguage);
        modLanguageField.SetValue(null, savedModLanguage);
    }
}
