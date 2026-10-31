import importlib.util
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "macos_distribution", Path(__file__).parents[1] / "Scripts/check-macos-distribution.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DistributionTests(unittest.TestCase):
    def test_adhoc_rejected_before_keychain_access(self):
        with patch.object(module.subprocess, "check_output") as query:
            with self.assertRaisesRegex(ValueError, "ad-hoc"):
                module.prerequisites({"CODESIGN_IDENTITY": "-", "NOTARY_KEYCHAIN_PROFILE": "test"})
            query.assert_not_called()

    def test_only_available_developer_id_application_is_accepted(self):
        digest = "A" * 40
        identity = "Developer ID Application: Test Publisher (TEST)"
        env = {"CODESIGN_IDENTITY": digest, "NOTARY_KEYCHAIN_PROFILE": "test"}
        with patch.object(module.subprocess, "check_output", return_value=f'1) {digest} "{identity}"'):
            module.prerequisites(env)
            module.prerequisites({**env, "CODESIGN_IDENTITY": identity})
            with self.assertRaisesRegex(ValueError, "unavailable"):
                module.prerequisites({**env, "CODESIGN_IDENTITY": "B" * 40})
        for kind in ["Apple Development", "Apple Distribution"]:
            with patch.object(module.subprocess, "check_output", return_value=f'1) {digest} "{kind}: Test"'):
                with self.assertRaisesRegex(ValueError, "cannot replace"):
                    module.prerequisites(env)

    def test_signature_and_ticket_do_not_replace_gatekeeper(self):
        calls = []

        def assess(command, check):
            calls.append(command[0])
            if command[0] == "spctl":
                raise subprocess.CalledProcessError(3, command)

        with patch.object(module.subprocess, "run", side_effect=assess):
            with self.assertRaises(subprocess.CalledProcessError):
                module.verify("Test.app")
        self.assertEqual(calls, ["codesign", "xcrun", "spctl"])
        with patch.object(module.subprocess, "run") as run:
            module.verify("Test.app")
            self.assertEqual(run.call_count, 3)
