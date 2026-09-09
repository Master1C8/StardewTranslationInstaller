using System;
using VNRevival.LanguageSwitcher;

if (SerbianGrammar.SuppressIndefiniteArticle("a", true) != string.Empty
    || SerbianGrammar.SuppressIndefiniteArticle("an", true) != string.Empty
    || SerbianGrammar.SuppressIndefiniteArticle("a", false) != "a")
    throw new InvalidOperationException("Serbian indefinite-article suppression is not locale-scoped.");

int combinations = 0;
foreach ((string adjective, string feminine) in SerbianGrammar.FeminineAdjectives)
{
    foreach ((string noun, SerbianNounGender gender) in SerbianGrammar.NounGenders)
    {
        string source = $"{adjective} {noun}";
        string expected = gender == SerbianNounGender.Feminine ? $"{feminine} {noun}" : source;
        string result = SerbianGrammar.ApplyAdjectiveAgreement(source);
        if (result != expected)
            throw new InvalidOperationException($"Agreement failed: {source} -> {result}; expected {expected}.");
        combinations += 1;
    }
}

if (combinations != 460)
    throw new InvalidOperationException($"Expected 460 combinations, got {combinations}.");
if (SerbianGrammar.ApplyAdjectiveAgreement("Љубичаст Планета") != "Љубичаста Планета")
    throw new InvalidOperationException("Initial capitalization was not preserved.");
if (SerbianGrammar.ApplyAdjectiveAgreement("предугњецав паприка") != "предугњецав паприка")
    throw new InvalidOperationException("A partial adjective word was changed.");
if (SerbianGrammar.ApplyAdjectiveAgreement("гњецав паприкаш") != "гњецав паприкаш")
    throw new InvalidOperationException("A partial noun word was changed.");

Console.WriteLine($"Serbian grammar probe passed {combinations} combinations and locale-scoped article suppression.");
