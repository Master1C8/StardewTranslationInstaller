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

Console.WriteLine("Hebrew bidi probe passed 9 exact cases plus RTL alignment and nested-rendering cases.");

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

        MethodInfo drawString = typeof(StardewValley.BellsAndWhistles.SpriteText).GetMethods()
            .Single(method => method.Name == "drawString" && method.GetParameters().Length == 14);
        ParameterInfo[] drawParameters = drawString.GetParameters();
        int textIndex = Array.FindIndex(drawParameters, parameter => parameter.ParameterType == typeof(string));
        int widthIndex = Array.FindIndex(drawParameters, parameter => parameter.Name == "width");
        int alignmentIndex = Array.FindIndex(
            drawParameters,
            parameter => parameter.ParameterType == typeof(StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment)
        );
        object?[] outerText = drawParameters.Select(parameter => parameter.HasDefaultValue
            ? parameter.DefaultValue
            : parameter.ParameterType.IsValueType
                ? Activator.CreateInstance(parameter.ParameterType)
                : null).ToArray();
        outerText[textIndex] = "שלום";
        outerText[widthIndex] = 320;
        outerText[alignmentIndex] = StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment.Left;
        object?[] outerCall = { drawString, outerText, false };
        prefix.Invoke(null, outerCall);
        if ((string)outerText[textIndex]! != "םולש"
            || (StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment)outerText[alignmentIndex]!
                != StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment.Right
            || outerCall[2] is not true)
            throw new InvalidDataException("The outer text-rendering patch did not transform Hebrew exactly once.");

        object?[] innerText = (object?[])outerText.Clone();
        object?[] innerCall = { drawString, innerText, false };
        prefix.Invoke(null, innerCall);
        if ((string)innerText[textIndex]! != "םולש" || innerCall[2] is not false)
            throw new InvalidDataException("A forwarding text overload transformed Hebrew a second time.");

        finalizer.Invoke(null, new object?[] { null, innerCall[2] });
        finalizer.Invoke(null, new object?[] { null, outerCall[2] });

        object?[] nextText = (object?[])outerText.Clone();
        nextText[textIndex] = "שלום";
        nextText[widthIndex] = -1;
        nextText[alignmentIndex] = StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment.Left;
        object?[] nextCall = { drawString, nextText, false };
        prefix.Invoke(null, nextCall);
        if ((string)nextText[textIndex]! != "םולש"
            || (StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment)nextText[alignmentIndex]!
                != StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment.Left
            || nextCall[2] is not true)
            throw new InvalidDataException("The text-rendering guard was not released after the outer call.");
        finalizer.Invoke(null, new object?[] { null, nextCall[2] });

        object?[] centeredText = (object?[])outerText.Clone();
        centeredText[textIndex] = "שלום";
        centeredText[widthIndex] = 320;
        centeredText[alignmentIndex] = StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment.Center;
        object?[] centeredCall = { drawString, centeredText, false };
        prefix.Invoke(null, centeredCall);
        if ((StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment)centeredText[alignmentIndex]!
                != StardewValley.BellsAndWhistles.SpriteText.ScrollTextAlignment.Center)
            throw new InvalidDataException("The RTL adapter changed explicitly centered text.");
        finalizer.Invoke(null, new object?[] { null, centeredCall[2] });
    }
    finally
    {
        adapterField.SetValue(null, savedAdapter);
        languageField.SetValue(null, savedLanguage);
        modLanguageField.SetValue(null, savedModLanguage);
    }
}
