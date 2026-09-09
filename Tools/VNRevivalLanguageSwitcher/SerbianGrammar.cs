using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace VNRevival.LanguageSwitcher
{

public enum SerbianNounGender { Masculine, Feminine }

public static class SerbianGrammar
{
    public static readonly IReadOnlyDictionary<string, string> FeminineAdjectives =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["љубичаст"] = "љубичаста", ["гњецав"] = "гњецава",
            ["кредаст"] = "кредаста", ["зелен"] = "зелена",
            ["плишан"] = "плишана", ["здепаст"] = "здепаста",
            ["џиновски"] = "џиновска", ["мастан"] = "масна",
            ["тмуран"] = "тмурна", ["практичан"] = "практична",
            ["дугоног"] = "дугонога", ["тупав"] = "тупава",
            ["скорео"] = "скорена", ["фантастичан"] = "фантастична",
            ["гумаст"] = "гумаста", ["шашав"] = "шашава",
            ["храбар"] = "храбра", ["разуман"] = "разумна",
            ["усамљен"] = "усамљена", ["горак"] = "горка",
        };

    public static readonly IReadOnlyDictionary<string, SerbianNounGender> NounGenders =
        new Dictionary<string, SerbianNounGender>(StringComparer.OrdinalIgnoreCase)
        {
            ["змај"] = SerbianNounGender.Masculine,
            ["шведски сто"] = SerbianNounGender.Masculine,
            ["кекс"] = SerbianNounGender.Masculine,
            ["робот"] = SerbianNounGender.Masculine,
            ["планета"] = SerbianNounGender.Feminine,
            ["паприка"] = SerbianNounGender.Feminine,
            ["гробница"] = SerbianNounGender.Feminine,
            ["хијена"] = SerbianNounGender.Feminine,
            ["усна"] = SerbianNounGender.Feminine,
            ["препелица"] = SerbianNounGender.Feminine,
            ["сир"] = SerbianNounGender.Masculine,
            ["катастрофа"] = SerbianNounGender.Feminine,
            ["кишни мантил"] = SerbianNounGender.Masculine,
            ["ципела"] = SerbianNounGender.Feminine,
            ["замак"] = SerbianNounGender.Masculine,
            ["вилењак"] = SerbianNounGender.Masculine,
            ["пумпа"] = SerbianNounGender.Feminine,
            ["чипс"] = SerbianNounGender.Masculine,
            ["перика"] = SerbianNounGender.Feminine,
            ["сирена"] = SerbianNounGender.Feminine,
            ["батак"] = SerbianNounGender.Masculine,
            ["лутка"] = SerbianNounGender.Feminine,
            ["подморница"] = SerbianNounGender.Feminine,
        };

    public static string SuppressIndefiniteArticle(string value, bool isSerbian)
    {
        return isSerbian ? string.Empty : value;
    }

    public static string ApplyAdjectiveAgreement(string value)
    {
        foreach ((string noun, SerbianNounGender gender) in NounGenders)
        {
            if (gender != SerbianNounGender.Feminine) continue;
            foreach ((string adjective, string feminine) in FeminineAdjectives)
            {
                string pattern = $@"(?<![\p{{L}}\p{{M}}]){Regex.Escape(adjective)}(?<gap>\s+){Regex.Escape(noun)}(?![\p{{L}}\p{{M}}])";
                value = Regex.Replace(value, pattern, match =>
                {
                    string inflected = char.IsUpper(match.Value[0])
                        ? char.ToUpperInvariant(feminine[0]) + feminine.Substring(1)
                        : feminine;
                    return inflected + match.Groups["gap"].Value + match.Value.Substring(match.Groups["gap"].Index - match.Index + match.Groups["gap"].Length);
                }, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
            }
        }
        return value;
    }
}

}
