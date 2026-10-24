using System;
using System.IO;
using System.Linq;
using System.Reflection;
using HarmonyLib;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using StardewModdingAPI;
using StardewModdingAPI.Events;
using StardewValley;
using StardewValley.Menus;

namespace VNRevival.VisualQADriver
{
    public sealed class ModEntry : Mod
    {
        private string triggerPath = string.Empty;
        private string? capturePath;
        private bool titleReady;
        private Point? hoverPoint;
        private bool advancingDialogue;
        private static ModEntry? instance;
        public override void Entry(IModHelper helper)
        {
            triggerPath = Environment.GetEnvironmentVariable("VN_VISUAL_QA_TRIGGER") ?? string.Empty;
            if (string.IsNullOrWhiteSpace(triggerPath))
                throw new InvalidOperationException("VN_VISUAL_QA_TRIGGER is not set.");
            Monitor.Log("VN_QA_RUN " + triggerPath, LogLevel.Info);
            helper.Events.GameLoop.UpdateTicked += OnUpdateTicked;
            if (Environment.GetEnvironmentVariable("VN_VISUAL_QA_BRIDGE") == "1")
            {
                // Bridge commands invoke game methods directly. Suppress physical
                // input so a focus/desktop click cannot dismiss the capture state.
                // Keep the ordinary Oculix path interactive.
                helper.Events.Input.ButtonsChanged += (_, e) =>
                {
                    foreach (SButton button in e.Pressed.Concat(e.Held))
                        helper.Input.Suppress(button);
                };
            }
            instance = this;
            // SMAPI's Rendered event precedes Game1's final UI composition.
            // Capture after the UI target has been blended into the backbuffer.
            new Harmony(ModManifest.UniqueID).Patch(
                AccessTools.Method(typeof(Game1), "renderScreenBuffer")
                    ?? throw new MissingMethodException("Game1.renderScreenBuffer"),
                postfix: new HarmonyMethod(typeof(ModEntry), nameof(AfterScreenComposite)));
            helper.Events.GameLoop.SaveLoaded += (_, _) => Monitor.Log("VN_QA_STATE world", LogLevel.Info);
            Monitor.Log("Waiting for the visual-QA QuickSave trigger.", LogLevel.Trace);
        }

        private static void AfterScreenComposite() => instance?.CaptureFrame();

        private void CaptureFrame()
        {
            if (capturePath == null) return;
            string path = capturePath;
            capturePath = null;
            string name = Path.GetFileName(path);
            bool expected = name.Contains("-01-title-menu-")
                ? Game1.activeClickableMenu is TitleMenu && TitleMenu.subMenu == null
                : name.Contains("-02-character-creation-") ? TitleMenu.subMenu is CharacterCustomization
                : name.Contains("-03-gus-dialogue-") ? Game1.activeClickableMenu is DialogueBox
                : name.Contains("-04-item-description-") ? Game1.activeClickableMenu is GameMenu
                : name.Contains("-05-journal-") && Game1.activeClickableMenu is QuestLog;
            if (!expected)
                throw new InvalidOperationException("Capture state changed before " + name + "; active menu: "
                    + (Game1.activeClickableMenu?.GetType().Name ?? "world"));
            var device = Game1.graphics.GraphicsDevice;
            if (device.GetRenderTargets().Length != 0)
                throw new InvalidOperationException("Capture requires the final backbuffer.");
            int w = device.PresentationParameters.BackBufferWidth;
            int h = device.PresentationParameters.BackBufferHeight;
            var pixels = new Color[w * h];
            device.GetBackBufferData(pixels);
            // GetBackBufferData already returns top-first rows for the final
            // default framebuffer; offscreen render-target orientation differs.
            using var texture = new Texture2D(device, w, h);
            texture.SetData(pixels);
            using var stream = File.Create(path);
            texture.SaveAsPng(stream, w, h);
            Monitor.Log($"VN_QA_CAPTURE {path} {w}x{h}", LogLevel.Info);
        }

        private void OnUpdateTicked(object? sender, UpdateTickedEventArgs e)
        {
            if (Game1.options != null) Game1.options.pauseWhenOutOfFocus = false;
            if (!titleReady && Game1.activeClickableMenu is TitleMenu title && title.titleInPosition)
            {
                titleReady = true;
                Monitor.Log("VN_QA_STATE title-ready", LogLevel.Info);
            }
            if (hoverPoint is Point hover && Game1.activeClickableMenu is GameMenu inventory)
            {
                inventory.performHoverAction(hover.X, hover.Y);
                // Tooltip placement reads the previous input sample, separately
                // from performHoverAction. Pin both to the same prepared slot.
                Game1.oldMouseState = new Microsoft.Xna.Framework.Input.MouseState(
                    (int)(hover.X * Game1.options.uiScale), (int)(hover.Y * Game1.options.uiScale), 0,
                    Microsoft.Xna.Framework.Input.ButtonState.Released, Microsoft.Xna.Framework.Input.ButtonState.Released,
                    Microsoft.Xna.Framework.Input.ButtonState.Released, Microsoft.Xna.Framework.Input.ButtonState.Released,
                    Microsoft.Xna.Framework.Input.ButtonState.Released);
            }
            if (advancingDialogue)
            {
                if (Game1.activeClickableMenu == null)
                {
                    advancingDialogue = false;
                    Monitor.Log("VN_QA_STATE advanced world", LogLevel.Info);
                }
                else if (Game1.activeClickableMenu is DialogueBox current)
                {
                    if (current.isQuestion)
                        throw new InvalidOperationException("Unexpected dialogue choice during the prepared Gus interaction.");
                    // Let normal typing, safety delays, and opening/closing
                    // animations finish. A click is not a completed transition.
                    if (!current.transitioning && current.safetyTimer <= 0
                        && current.characterIndexInDialogue >= current.getCurrentString().Length - 1)
                        current.receiveLeftClick(current.x + 100, current.y + 100);
                }
                else
                    throw new InvalidOperationException("Unexpected menu while advancing Gus dialogue.");
            }
            if (!File.Exists(triggerPath))
                return;

            string command = File.ReadAllText(triggerPath).Trim();
            File.Delete(triggerPath);
            if (command.StartsWith("capture ", StringComparison.Ordinal))
            {
                capturePath = Path.Combine(Path.GetDirectoryName(triggerPath)!, Path.GetFileName(command.Substring(8)));
                return;
            }
            if (command == "viewport" && Game1.activeClickableMenu is TitleMenu)
            {
                // Use a normal native game viewport large enough for complete
                // setup panels and item tooltips. Never resize the PNG afterward.
                Game1.game1.SetWindowSize(1280, 780);
                Monitor.Log("VN_QA_STATE viewport", LogLevel.Info);
                return;
            }
            if (command == "setup" && Game1.activeClickableMenu is TitleMenu)
            {
                TitleMenu.subMenu = new CharacterCustomization(CharacterCustomization.Source.NewGame);
                Monitor.Log("VN_QA_STATE setup", LogLevel.Info);
                return;
            }
            if (command == "title" && Game1.activeClickableMenu is TitleMenu)
            {
                TitleMenu.subMenu = null;
                Monitor.Log("VN_QA_STATE title", LogLevel.Info);
                return;
            }
            if (command == "load" && Game1.activeClickableMenu is TitleMenu)
            {
                SaveGame.Load("zc_448908119");
                Game1.exitActiveMenu();
                return;
            }
            if (!Context.IsWorldReady)
                throw new InvalidOperationException("Command requires the prepared world: " + command);
            if (command == "dialogue")
            {
                NPC gus = Game1.getCharacterFromName("Gus");
                if (gus.currentLocation != Game1.currentLocation)
                    throw new InvalidOperationException("The prepared save is not in Gus's location.");
                gus.checkAction(Game1.player, Game1.currentLocation);
                if (Game1.activeClickableMenu is not DialogueBox)
                    throw new InvalidOperationException("Gus did not open a dialogue.");
                Monitor.Log("VN_QA_STATE dialogue", LogLevel.Info);
                return;
            }
            if (command == "advance" && Game1.activeClickableMenu is DialogueBox dialogue)
            {
                advancingDialogue = true;
                return;
            }
            if (command is "inventory" or "inventory-axe")
            {
                var menu = new GameMenu(startingTab: 0);
                Game1.activeClickableMenu = menu;
                if (command == "inventory-axe")
                {
                    var page = (InventoryPage)menu.pages[0];
                    int slot = Enumerable.Range(0, Game1.player.Items.Count)
                        .Where(index => Game1.player.Items[index] is StardewValley.Tools.Axe).DefaultIfEmpty(-1).First();
                    if (slot < 0) throw new InvalidOperationException("Prepared save has no axe.");
                    hoverPoint = page.inventory.inventory[slot].bounds.Center;
                    Game1.setMousePosition(hoverPoint.Value.X, hoverPoint.Value.Y);
                    menu.performHoverAction(hoverPoint.Value.X, hoverPoint.Value.Y);
                }
                Monitor.Log("VN_QA_STATE inventory", LogLevel.Info);
                return;
            }
            if (command is "journal" or "journal-expanded")
            {
                hoverPoint = null;
                var journal = new QuestLog();
                Game1.activeClickableMenu = journal;
                if (command == "journal-expanded")
                {
                    Point target = journal.questLogButtons[0].bounds.Center;
                    journal.receiveLeftClick(target.X, target.Y);
                }
                Monitor.Log("VN_QA_STATE journal", LogLevel.Info);
                return;
            }
            if (command == "close")
            {
                Game1.activeClickableMenu = null;
                hoverPoint = null;
                Monitor.Log("VN_QA_STATE closed", LogLevel.Info);
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
