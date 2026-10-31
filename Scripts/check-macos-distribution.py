#!/usr/bin/env python3
"""Check publisher credentials and Apple's distribution policy without launching the installer."""
import argparse
import os
import re
import subprocess


def prerequisites(environment):
    identity = environment.get("CODESIGN_IDENTITY", "")
    if not identity or identity == "-":
        raise ValueError("A Developer ID Application identity is required; ad-hoc signing is local-only.")
    if not environment.get("NOTARY_KEYCHAIN_PROFILE"):
        raise ValueError("NOTARY_KEYCHAIN_PROFILE is required for Apple notarization.")
    output = subprocess.check_output(["security", "find-identity", "-v", "-p", "codesigning"], text=True)
    identities = re.findall(r'\b([A-Fa-f0-9]{40}) "([^"]+)"', output)
    if not any(name.startswith("Developer ID Application:")
               and identity in (digest, name) for digest, name in identities):
        raise ValueError("The selected Developer ID Application identity and private key are unavailable. "
                         "Apple Development and Apple Distribution identities cannot replace it.")


def verify(app):
    for command in [
        ["codesign", "--verify", "--deep", "--strict", "--verbose=2", app],
        ["xcrun", "stapler", "validate", app],
        ["spctl", "--assess", "--type", "execute", "--verbose=4", app],
    ]:
        subprocess.run(command, check=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--prerequisites", action="store_true")
    mode.add_argument("--app")
    args = parser.parse_args()
    try:
        if args.prerequisites:
            prerequisites(os.environ)
        else:
            verify(args.app)
    except (ValueError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"macOS distribution check failed: {error}\n")
