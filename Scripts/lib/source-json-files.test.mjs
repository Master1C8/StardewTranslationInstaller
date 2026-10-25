import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { sourceJSONFiles } from "./source-json-files.mjs";

test("source JSON is validated while malformed generated receipts remain untouched", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "stardew-source-json-"));
  try {
    for (const name of ["Sources", "Documentation", "dist", ".build", ".build-app", ".git", ".venv"]) {
      fs.mkdirSync(path.join(root, name));
      fs.writeFileSync(path.join(root, name, "input.json"), name === "Sources" || name === "Documentation" ? "{}" : "CLI output, not JSON");
    }
    const files = sourceJSONFiles(root);
    assert.deepEqual(files.map(file => path.relative(root, file)), ["Documentation/input.json", "Sources/input.json"]);
    for (const file of files) JSON.parse(fs.readFileSync(file, "utf8"));
    fs.writeFileSync(path.join(root, "Sources/input.json"), "invalid source JSON");
    assert.throws(() => sourceJSONFiles(root).forEach(file => JSON.parse(fs.readFileSync(file, "utf8"))), SyntaxError);
    assert.equal(fs.readFileSync(path.join(root, "dist/input.json"), "utf8"), "CLI output, not JSON");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
