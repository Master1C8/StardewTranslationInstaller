#!/usr/bin/env node

process.env.VNREVIVAL_TRANSLATION_SLUG = "persian";
process.env.VNREVIVAL_GLOSSARY_LOCALE = "fa";
process.env.VNREVIVAL_LANGUAGE_NAME = "Persian";
process.env.VNREVIVAL_LANGUAGE_CODE = "fa-vnrevival";
await import("./audit-urdu.mjs");
