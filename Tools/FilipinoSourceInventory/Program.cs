using System.ComponentModel.Design;
using System.Text.Json;
using Microsoft.Xna.Framework.Content;

if (args.Length != 2)
    throw new ArgumentException("Pass scratch input XNB directory and scratch output JSON directory.");
var input = Path.GetFullPath(args[0]);
var output = Path.GetFullPath(args[1]);
if (!input.StartsWith("/private/tmp/") || !output.StartsWith("/private/tmp/"))
    throw new ArgumentException("Extraction is restricted to scratch directories under /private/tmp.");
using var services = new ServiceContainer();
using var content = new ContentManager(services, input);
var options = new JsonSerializerOptions { WriteIndented = true, IncludeFields = true };
int success = 0, failed = 0;
foreach (var file in Directory.EnumerateFiles(input, "*.xnb", SearchOption.AllDirectories).Order())
{
    var target = Path.GetRelativePath(input, file)[..^4].Replace('\\', '/');
    if (Path.GetFileNameWithoutExtension(file).Contains('.'))
        throw new InvalidDataException($"Localized XNB must not be used as English: {file}");
    try
    {
        var data = content.Load<object>(target);
        var destination = Path.Combine(output, target + ".json");
        Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
        File.WriteAllText(destination, JsonSerializer.Serialize(new { content = data }, options) + "\n");
        Console.WriteLine($"OK {target}");
        success++;
    }
    catch (Exception error)
    {
        Console.Error.WriteLine($"FAIL {target}: {error}");
        failed++;
    }
}
Console.WriteLine($"Success {success}; Fail {failed}");
return failed == 0 ? 0 : 1;
