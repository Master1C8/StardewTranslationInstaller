using System;
using System.IO;
using System.Linq;
using System.Reflection;
using StardewModdingAPI;
using StardewModdingAPI.Events;
using StardewValley;
using StardewValley.Menus;

namespace VNRevival.VisualQADriver
{
    public sealed class ModEntry : Mod
    {
        private string triggerPath = string.Empty;
        public override void Entry(IModHelper helper)
        {
            triggerPath = Environment.GetEnvironmentVariable("VN_VISUAL_QA_TRIGGER") ?? string.Empty;
            if (string.IsNullOrWhiteSpace(triggerPath))
                throw new InvalidOperationException("VN_VISUAL_QA_TRIGGER is not set.");
            helper.Events.GameLoop.UpdateTicked += OnUpdateTicked;
            Monitor.Log("Waiting for the visual-QA QuickSave trigger.", LogLevel.Trace);
        }

        private void OnUpdateTicked(object? sender, UpdateTickedEventArgs e)
        {
            if (!Context.IsWorldReady || !File.Exists(triggerPath))
                return;

            string command = File.ReadAllText(triggerPath).Trim();
            File.Delete(triggerPath);
            if (command == "inventory")
            {
                Game1.activeClickableMenu = new GameMenu(startingTab: 0);
                Monitor.Log("Opened inventory for visual QA.", LogLevel.Trace);
                return;
            }
            if (command == "journal")
            {
                Game1.activeClickableMenu = new QuestLog();
                Monitor.Log("Opened journal for visual QA.", LogLevel.Trace);
                return;
            }
            if (command == "close")
            {
                Game1.activeClickableMenu = null;
                Monitor.Log("Closed active menu for visual QA.", LogLevel.Trace);
                return;
            }
            if (command != "quickload")
                throw new InvalidOperationException("Unknown visual-QA command: " + command);

            Assembly quickSave = AppDomain.CurrentDomain.GetAssemblies()
                .FirstOrDefault(assembly => assembly.GetName().Name == "QuickSave")
                ?? throw new InvalidOperationException("QuickSave assembly is not loaded.");
            Type main = quickSave.GetType("QuickSave.Lib.Main", throwOnError: true)
                ?? throw new InvalidOperationException("QuickSave.Lib.Main was not found.");
            MethodInfo tryLoad = main.GetMethod(
                "TryLoad",
                BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic,
                binder: null,
                types: Type.EmptyTypes,
                modifiers: null
            ) ?? throw new InvalidOperationException("QuickSave.Lib.Main.TryLoad() was not found.");
            Monitor.Log("Invoking QuickSave.Lib.Main.TryLoad() for visual QA.", LogLevel.Info);
            tryLoad.Invoke(null, null);
        }
    }
}
