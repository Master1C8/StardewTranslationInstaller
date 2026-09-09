using System;
using System.Linq;
using System.Reflection;
using HarmonyLib;
using StardewValley;
using StardewValley.GameData;
using VNRevival.LanguageSwitcher;
class Probe {
 static void Main() {
  var type=typeof(LocalizedContentManager);
  var enumField=type.GetField("_currentLangCode",BindingFlags.NonPublic|BindingFlags.Static);
  var modField=type.GetFields(BindingFlags.Public|BindingFlags.NonPublic|BindingFlags.Static).Single(f=>f.FieldType==typeof(ModLanguage));
  var originalEnum=enumField.GetValue(null); var originalMod=modField.GetValue(null);
  var hook=typeof(ModEntry).GetMethod("AfterIndefiniteArticle",BindingFlags.NonPublic|BindingFlags.Static);
  try {
   foreach(var language in new[]{"bg-vnrevival","pl-vnrevival","ar-vnrevival","fa-vnrevival","en"}) {
    enumField.SetValue(null,language=="en"?LocalizedContentManager.LanguageCode.en:LocalizedContentManager.LanguageCode.mod);
    modField.SetValue(null,new ModLanguage{LanguageCode=language});
    foreach(var noun in new[]{"Barn","Obelisk","Барака","Обелиск"}) {
     object[] arguments={Utility.AOrAn(noun)}; hook.Invoke(null,arguments);var result=(string)arguments[0];
     var expected=language=="bg-vnrevival"?"":noun=="Obelisk"?"an":"a";
     if(result!=expected)throw new Exception(language+" / "+noun+" = "+result);
    }
   }
   Console.WriteLine("Compiled article postfix with actual game language state: 20 cases passed; Bulgarian empty article and other language behavior verified.");
  } finally {enumField.SetValue(null,originalEnum);modField.SetValue(null,originalMod);}
 }
}
