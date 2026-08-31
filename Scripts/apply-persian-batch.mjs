#!/usr/bin/env node

process.env.VNREVIVAL_TRANSLATION_SLUG = "persian";
process.env.VNREVIVAL_LANGUAGE_NAME = "Persian";
await import("./apply-urdu-batch.mjs");
