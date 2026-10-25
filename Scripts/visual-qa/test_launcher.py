"""Exercise the launcher PTY boundary without starting the game."""
import tempfile
import time
import unittest
from pathlib import Path

from run_visual_qa import launch_game, stop_game


class LauncherOutputTests(unittest.TestCase):
    def test_short_startup_message_is_flushed_while_process_is_running(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            launcher = root / "StardewValley"
            launcher.write_text("#!/bin/sh\nprintf 'READY\\n'\nsleep 30\n")
            launcher.chmod(0o700)
            log = root / "launcher.log"
            process, reader = launch_game(root, log, root / "request")
            try:
                deadline = time.monotonic() + 5
                while time.monotonic() < deadline:
                    if log.exists() and b"READY" in log.read_bytes():
                        break
                    time.sleep(0.02)
                self.assertIsNone(process.poll())
                self.assertIn(b"READY", log.read_bytes())
            finally:
                stop_game(process, reader)
            self.assertFalse(reader.is_alive())


if __name__ == "__main__":
    unittest.main()
