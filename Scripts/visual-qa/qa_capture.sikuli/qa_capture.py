# Oculix runs this file through Jython 2.7. Keep the syntax Python-2-compatible.
from sikuli import *
from java.io import File
from javax.imageio import ImageIO
import os
import subprocess
import sys
import time
import traceback


Settings.MoveMouseDelay = 0.15
Settings.DelayBeforeMouseDown = 0.05
Settings.DelayBeforeDrop = 0.05


def fail(message, screen, runtime_dir):
    failure_path = os.path.join(runtime_dir, "failure.png")
    oculix_failure_path = os.path.join(runtime_dir, "oculix-failure.png")
    try:
        subprocess.call(["/usr/sbin/screencapture", "-x", failure_path])
    except Exception:
        pass
    try:
        screen.capture().save(runtime_dir, "oculix-failure.png")
    except Exception:
        pass
    print("VN_VISUAL_QA_FAILURE: " + message)
    print("VN_VISUAL_QA_FAILURE_SCREENSHOT: " + failure_path)
    print("VN_VISUAL_QA_OCULIX_SCREENSHOT: " + oculix_failure_path)
    sys.exit(2)


def native_input(runtime_dir, action, *arguments):
    helper = os.path.join(runtime_dir, "cg-input")
    command = [helper, action] + [str(argument) for argument in arguments]
    status = subprocess.call(command)
    if status != 0:
        raise RuntimeError("CoreGraphics input failed: " + " ".join(command))
    wait(0.8)


def marker_pattern(runtime_dir, name, similarity):
    path = os.path.join(runtime_dir, "templates", "2x", name + ".png")
    return Pattern(path).similar(similarity)


def find_marker(screen, runtime_dir, name, timeout, similarity=0.72):
    # Java Robot reports logical Retina bounds but captures a 1:1 top-left crop
    # of the backing pixels on macOS. Feed Oculix/OpenCV a full native macOS
    # screenshot instead, while keeping Oculix for input events.
    deadline = time.time() + timeout
    native_path = os.path.join(runtime_dir, "native-state.png")
    normalized_path = os.path.join(runtime_dir, "native-state-rgb.png")
    pattern = marker_pattern(runtime_dir, name, similarity)
    while time.time() <= deadline:
        subprocess.call(["/usr/sbin/screencapture", "-x", native_path])
        normalized = subprocess.call([
            "/opt/homebrew/bin/magick", native_path,
            "-alpha", "off", "-depth", "8", "PNG24:" + normalized_path,
        ])
        if normalized != 0:
            raise RuntimeError("could not normalize the native screenshot")
        # Finder(String) goes through Oculix's filename cache and would keep
        # matching the first loading frame forever. BufferedImage is fresh.
        finder = Finder(ImageIO.read(File(normalized_path)))
        try:
            finder.find(pattern)
            if finder.hasNext():
                return finder.next()
        finally:
            finder.destroy()
        wait(0.4)
    return None


def wait_for_log(needle, timeout):
    log_path = os.path.expanduser("~/.config/StardewValley/ErrorLogs/SMAPI-latest.txt")
    deadline = time.time() + timeout
    while time.time() <= deadline:
        try:
            handle = open(log_path, "r")
            try:
                if needle in handle.read():
                    return True
            finally:
                handle.close()
        except IOError:
            pass
        wait(0.4)
    return False


def signal_driver(runtime_dir, command):
    trigger_path = os.path.join(runtime_dir, "quickload.request")
    handle = open(trigger_path, "w")
    try:
        handle.write(command + "\n")
    finally:
        handle.close()


def require_marker(screen, runtime_dir, name, timeout, similarity=0.72):
    match = find_marker(screen, runtime_dir, name, timeout, similarity)
    if not match:
        fail("state marker '%s' did not appear within %ss" % (name, timeout), screen, runtime_dir)
    return match


def capture(runtime_dir, filename):
    path = os.path.join(runtime_dir, "raw", filename)
    status = subprocess.call(["/usr/sbin/screencapture", "-x", path])
    if status != 0 or not os.path.exists(path):
        raise RuntimeError("screencapture failed for " + filename)
    print("VN_VISUAL_QA_CAPTURED: " + path)


def smoke(screen, runtime_dir):
    print("VN_VISUAL_QA_SCREEN: %sx%s" % (screen.getW(), screen.getH()))
    capture(runtime_dir, "smoke.png")
    screen.capture().save(runtime_dir, "oculix-smoke.png")
    print("VN_VISUAL_QA_SMOKE_OK")


def run_capture(screen, runtime_dir, code):
    App.focus("Stardew Valley")
    wait(1.0)

    # The lower-right language/help artwork only becomes stable once the title
    # animation has finished and the four title buttons are clickable.
    require_marker(screen, runtime_dir, "title", 90, 0.70)
    capture(runtime_dir, code + "-01-title-menu-raw.png")

    native_input(runtime_dir, "click", 910, 1480)
    require_marker(screen, runtime_dir, "character-creation", 25, 0.70)
    capture(runtime_dir, code + "-02-character-creation-raw.png")

    # Click the repaired lower-right Back button explicitly. Apart from being
    # more reliable than Escape here, this exercises the original regression.
    native_input(runtime_dir, "click", 2400, 1540)
    require_marker(screen, runtime_dir, "title", 25, 0.70)
    native_input(runtime_dir, "click", 1157, 1480)
    # The save rows are drawn before the title-menu transition finishes and do
    # not accept input immediately. Give the submenu its full activation delay.
    wait(6.0)
    native_input(runtime_dir, "click", 1100, 550)
    require_marker(screen, runtime_dir, "world", 90, 0.66)
    wait(5.0)

    # Signal the temporary local SMAPI driver. Synthetic keyboard events do not
    # reach this MonoGame/SDL build reliably on macOS, while the driver invokes
    # QuickSave's own TryLoad method on the game thread.
    signal_driver(runtime_dir, "quickload")
    if not wait_for_log("Loading Savefile:", 20):
        fail("the temporary SMAPI driver did not start a QuickSave reload", screen, runtime_dir)
    require_marker(screen, runtime_dir, "world", 90, 0.66)
    wait(1.5)

    native_input(runtime_dir, "right-click", 850, 1025)
    dialogue = find_marker(screen, runtime_dir, "gus-dialogue", 15, 0.68)
    if not dialogue:
        # Gus occasionally finishes a facing/movement tick just as the first
        # interaction arrives. The speech bubble appears, but the dialogue does
        # not open. Retrying the same safe interaction removes that race.
        native_input(runtime_dir, "right-click", 850, 1025)
        dialogue = find_marker(screen, runtime_dir, "gus-dialogue", 15, 0.68)
    if not dialogue:
        fail("state marker 'gus-dialogue' did not appear after two interactions", screen, runtime_dir)
    # The dialogue frame is detectable before Stardew's typewriter animation
    # has finished. Give long localized introductions time to render fully so
    # the evidence never captures a partially typed final word.
    wait(5.0)
    capture(runtime_dir, code + "-03-gus-dialogue-raw.png")

    signal_driver(runtime_dir, "inventory")
    require_marker(screen, runtime_dir, "inventory", 12, 0.68)
    native_input(runtime_dir, "move", 930, 615)
    wait(1.5)
    capture(runtime_dir, code + "-04-item-description-raw.png")

    signal_driver(runtime_dir, "close")
    require_marker(screen, runtime_dir, "world", 12, 0.66)
    signal_driver(runtime_dir, "journal")
    wait(1.5)
    native_input(runtime_dir, "click", 1280, 610)
    require_marker(screen, runtime_dir, "journal", 15, 0.67)
    capture(runtime_dir, code + "-05-journal-raw.png")
    print("VN_VISUAL_QA_AUTOMATION_OK: " + code)


screen = Screen(0)
try:
    if len(sys.argv) < 3:
        raise RuntimeError("expected mode and runtime directory")
    mode = sys.argv[1]
    runtime_dir = sys.argv[2]
    if mode == "smoke":
        smoke(screen, runtime_dir)
    elif mode == "capture":
        if len(sys.argv) < 4:
            raise RuntimeError("capture mode requires a locale code")
        run_capture(screen, runtime_dir, sys.argv[3])
    else:
        raise RuntimeError("unknown mode: " + mode)
except SystemExit:
    raise
except BaseException as error:
    traceback.print_exc()
    fail(str(error), screen, runtime_dir if 'runtime_dir' in globals() else "/private/tmp")
