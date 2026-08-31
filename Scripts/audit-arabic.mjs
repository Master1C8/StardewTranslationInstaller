#!/usr/bin/env node

process.env.VNREVIVAL_TRANSLATION_SLUG = "arabic";
process.env.VNREVIVAL_GLOSSARY_LOCALE = "ar";
process.env.VNREVIVAL_LANGUAGE_NAME = "Arabic";
process.env.VNREVIVAL_LANGUAGE_CODE = "ar-vnrevival";
await import("./audit-urdu.mjs");
