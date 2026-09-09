using System.Security.Cryptography;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Collections;
using System.Reflection;
using System.Xml.Linq;
using Microsoft.Xna.Framework.Content;

if (args.Length != 3)
    throw new ArgumentException("Usage: UkExtract <English-Content-root> <source-discovery.json> <output-dir>");

var contentRoot = Path.GetFullPath(args[0]);
var destination = Path.GetFullPath(args[2]);
if (destination == contentRoot || destination.StartsWith(contentRoot + Path.DirectorySeparatorChar, StringComparison.Ordinal))
    throw new ArgumentException("Output must be outside the installed Content directory.");

using var discovery = JsonDocument.Parse(File.ReadAllText(args[1]));
var targets = discovery.RootElement.GetProperty("unsupportedStructuredAssets")
    .EnumerateArray().Select(value => value.GetString()!).ToArray();
if (targets.Distinct().Count() != targets.Length)
    throw new ArgumentException("Duplicate source target.");
var options = new JsonSerializerOptions {
    IncludeFields = true,
    IgnoreReadOnlyProperties = true,
    WriteIndented = true,
    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
};
var reportOptions = new JsonSerializerOptions(options) { IgnoreReadOnlyProperties = false };
Directory.CreateDirectory(destination);
using var content = new ContentManager(new EmptyServices(), contentRoot);
var results = new List<object>();
var failures = new List<object>();
var stringInventory = new List<object>();
var xmlPath = Path.ChangeExtension(typeof(StardewValley.GameData.Objects.ObjectData).Assembly.Location, ".xml");
var documentation = XDocument.Load(xmlPath).Descendants("member").ToDictionary(
    element => element.Attribute("name")!.Value,
    element => string.Join(" ", element.Value.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)));
foreach (var target in targets)
{
    if (!target.StartsWith("Data/", StringComparison.Ordinal) || target.Contains("..") || target.Contains('\\'))
        throw new ArgumentException($"Unexpected source target: {target}");
    try
    {
        var sourceFile = Path.Combine(contentRoot, target + ".xnb");
        var fingerprint = Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(sourceFile))).ToLowerInvariant();
        // MonoGame uses the game's own ReflectionReader and GameData types.
        // This reads base English XNB only; no game process or graphics window.
        var value = content.Load<object>(target);
        var json = JsonSerializer.Serialize(value, value.GetType(), options);
        var filename = Path.Combine(destination, target + ".json");
        Directory.CreateDirectory(Path.GetDirectoryName(filename)!);
        File.WriteAllText(filename, json + "\n");
        CollectStrings(value, target, "", null);
        results.Add(new { target, sourceSHA256 = fingerprint, type = value.GetType().FullName });
        Console.WriteLine($"Read {target}");
    }
    catch (Exception exception)
    {
        failures.Add(new { target, error = exception.ToString() });
        Console.Error.WriteLine($"Failed {target}: {exception.Message}");
    }
}
File.WriteAllText(Path.Combine(destination, "extraction-manifest.json"), JsonSerializer.Serialize(new {
    gameDataVersion = typeof(StardewValley.GameData.Objects.ObjectData).Assembly.GetName().Version!.ToString(),
    contentRoot, results, failures
}, reportOptions) + "\n");
File.WriteAllText(Path.Combine(destination, "string-inventory.json"), JsonSerializer.Serialize(stringInventory, reportOptions) + "\n");
Console.WriteLine($"Success {results.Count}; fail {failures.Count}");
return failures.Count == 0 ? 0 : 1;

void CollectStrings(object? value, string target, string pointer, string? member)
{
    if (value is null) return;
    if (value is string text)
    {
        stringInventory.Add(new { target, pointer, text, member,
            documentation = member is null ? null : documentation.GetValueOrDefault(member) });
        return;
    }
    if (value is IDictionary dictionary)
    {
        foreach (DictionaryEntry entry in dictionary)
            CollectStrings(entry.Value, target, pointer + "/" + Escape(entry.Key.ToString()!), member);
        return;
    }
    if (value is IEnumerable sequence)
    {
        var index = 0;
        foreach (var item in sequence) CollectStrings(item, target, pointer + "/" + index++, member);
        return;
    }
    var type = value.GetType();
    if (type.IsPrimitive || type.IsEnum || type == typeof(decimal)) return;
    foreach (var field in type.GetFields(BindingFlags.Instance | BindingFlags.Public))
        CollectStrings(field.GetValue(value), target, pointer + "/" + Escape(field.Name),
            "F:" + field.DeclaringType!.FullName + "." + field.Name);
    foreach (var property in type.GetProperties(BindingFlags.Instance | BindingFlags.Public))
        if (property.CanRead && property.CanWrite && property.GetIndexParameters().Length == 0)
            CollectStrings(property.GetValue(value), target, pointer + "/" + Escape(property.Name),
                "P:" + property.DeclaringType!.FullName + "." + property.Name);
}

string Escape(string part) => part.Replace("~", "~0").Replace("/", "~1");

sealed class EmptyServices : IServiceProvider
{
    public object? GetService(Type serviceType) => null;
}
