using System;
using System.IO;
using System.Linq;
using VNRevival.LanguageSwitcher;

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

Console.WriteLine("Hebrew bidi probe passed 9 exact mixed-direction, token, punctuation, multiline, and non-Hebrew cases.");

void Check(string logical, string expected)
{
    string actual = adapter.Transform(logical);
    if (actual != expected)
        throw new InvalidDataException($"Hebrew bidi mismatch for '{logical}': expected '{expected}', got '{actual}'.");
    if (actual.Any(character => character is '\u202A' or '\u202B' or '\u202C' or '\u202D' or '\u202E'
            or '\u2066' or '\u2067' or '\u2068' or '\u2069'))
        throw new InvalidDataException($"Hebrew bidi output contains a directional control: {logical}");
}
