using System;
using System.IO;
using System.Text.Json;
using Microsoft.Xna.Framework.Content;
class Services : IServiceProvider { public object GetService(Type type) { return null; } }
class Dump {
 static int Main(string[] args) {
  var cm = new ContentManager(new Services(), args[0]);
  var options = new JsonSerializerOptions { IncludeFields = true, WriteIndented = true };
  int failures = 0;
  foreach (var target in File.ReadAllLines(args[1])) {
   try {
    var value = cm.Load<object>(target);
    var output = Path.Combine(args[2], target + ".json");
    Directory.CreateDirectory(Path.GetDirectoryName(output));
    File.WriteAllText(output, JsonSerializer.Serialize(new { content = value }, options));
    Console.WriteLine("OK " + target);
   } catch(Exception e) { failures++; Console.WriteLine("FAIL " + target + ": " + e.ToString()); }
  }
  return failures == 0 ? 0 : 1;
 }
}
