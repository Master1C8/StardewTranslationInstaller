import fs from "node:fs";
import path from "node:path";

// Release validation owns source inputs, not saved CLI output or build caches.
export function sourceJSONFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) {
      if ([".git", ".venv", "dist"].includes(entry.name) || /^\.build(?:-|$)/u.test(entry.name)) return [];
      return sourceJSONFiles(path.join(directory, entry.name));
    }
    return entry.isFile() && entry.name.endsWith(".json") ? [path.join(directory, entry.name)] : [];
  }).sort();
}
