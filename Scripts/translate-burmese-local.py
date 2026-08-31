#!/usr/bin/env python3
"""Translate protected Stardew Valley text to Burmese with a local NLLB model."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import ctranslate2
from transformers import AutoTokenizer


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--cache", type=Path, required=True)
    parser.add_argument("--fragment-cache", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--tokenizer-model", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=24)
    parser.add_argument("--num-beams", type=int, default=3)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--warnings", type=Path)
    return parser.parse_args()


def restore_whitespace(source: str, translated: str) -> str:
    leading = source[: len(source) - len(source.lstrip())]
    trailing = source[len(source.rstrip()) :]
    return f"{leading}{translated.strip()}{trailing}"


def normalize_internal_placeholders(value: str) -> str:
    patterns = [
        r"[<\[]\s*ID\s*(\d+)\s*[>\]]",
        r"(?<![A-Za-z])ID\s*(\d+)(?!\d)",
        r"[<\[]\s*အိုင်\s*ဒီ\s*(\d+)\s*[>\]]",
        r"အိုင်\s*ဒီ\s*(\d+)(?!\d)",
    ]
    result = value
    for pattern in patterns:
        result = re.sub(pattern, lambda match: f"<ID{match.group(1)}>", result, flags=re.IGNORECASE)
    return result


def restore_terms(translated: str, terms: list[dict], source: str, warnings: list[dict]) -> str:
    result = normalize_internal_placeholders(translated)
    for index, term in enumerate(terms, start=1):
        placeholder = f"<ID{index}>"
        result, count = re.subn(
            rf"[<\[]+\s*ID\s*{index}\s*[>\]]+",
            lambda _: term["replacement"],
            result,
            flags=re.IGNORECASE,
        )
        if count == 0:
            stripped = source.strip()
            if stripped.startswith(placeholder):
                result = f"{term['replacement']} {result.lstrip()}"
                fallback = "prepend"
            elif stripped.endswith(placeholder):
                result = f"{result.rstrip()} {term['replacement']}"
                fallback = "append"
            else:
                result = f"{term['replacement']} {result.lstrip()}"
                fallback = "prepend-review"
            warnings.append({
                "source": source,
                "translated": translated,
                "placeholder": placeholder,
                "replacement": term["replacement"],
                "fallback": fallback,
            })
    leftovers = re.findall(r"<\s*ID\s*\d+\s*>", result, flags=re.IGNORECASE)
    if leftovers:
        warnings.append({
            "source": source,
            "translated": translated,
            "leftover": leftovers,
            "fallback": "remove-unexpected-placeholder",
        })
        result = re.sub(r"<\s*ID\s*\d+\s*>", "", result, flags=re.IGNORECASE)
    return result


def compose(item: dict, fragments: dict[str, str]) -> str | None:
    result: list[str] = []
    for part in item["parts"]:
        if "literal" in part:
            result.append(part["literal"])
        elif part["text"] in fragments:
            result.append(fragments[part["text"]])
        else:
            return None
    return "".join(result)


def main() -> None:
    args = parse_args()
    job = json.loads(args.input.read_text())
    cache = json.loads(args.cache.read_text()) if args.cache.exists() else {}
    fragments = json.loads(args.fragment_cache.read_text()) if args.fragment_cache.exists() else {}
    warnings_path = args.warnings or args.fragment_cache.with_suffix(".warnings.json")
    warnings = json.loads(warnings_path.read_text()) if warnings_path.exists() else []

    pending_items = [item for item in job["items"] if item["source"] not in cache]
    pending_map: dict[str, dict] = {}
    for item in pending_items:
        for part in item["parts"]:
            if "text" in part and part["text"] not in fragments:
                pending_map.setdefault(part["text"], part)
    pending = sorted(pending_map.values(), key=lambda item: len(item["text"]))
    if args.limit is not None:
        pending = pending[: args.limit]

    device = "cpu-int8"
    print(json.dumps({
        "pendingFragments": len(pending),
        "pendingRecords": len(pending_items),
        "cachedRecords": len(job["items"]) - len(pending_items),
        "cachedFragments": len(fragments),
        "device": device,
        "batchSize": args.batch_size,
        "numBeams": args.num_beams,
    }, ensure_ascii=False, indent=2), flush=True)
    if not pending:
        return

    tokenizer = AutoTokenizer.from_pretrained(
        args.tokenizer_model,
        src_lang="eng_Latn",
        local_files_only=True,
    )
    translator = ctranslate2.Translator(
        str(args.model),
        device="cpu",
        compute_type="int8",
        inter_threads=4,
        intra_threads=2,
    )

    total = len(pending)
    for offset in range(0, total, args.batch_size):
        items = pending[offset : offset + args.batch_size]
        source_tokens = [
            tokenizer.convert_ids_to_tokens(
                tokenizer.encode(item["text"], truncation=True, max_length=512)
            )
            for item in items
        ]
        maximum_new_tokens = min(
            384,
            max(48, int(max(len(tokens) for tokens in source_tokens) * 2.2) + 24),
        )
        generated = translator.translate_batch(
            source_tokens,
            target_prefix=[["mya_Mymr"]] * len(source_tokens),
            beam_size=args.num_beams,
            max_decoding_length=maximum_new_tokens,
            no_repeat_ngram_size=4,
        )
        translated = [
            tokenizer.decode(
                tokenizer.convert_tokens_to_ids(result.hypotheses[0]),
                skip_special_tokens=True,
            )
            for result in generated
        ]
        for item, output in zip(items, translated):
            restored = restore_terms(output, item.get("terms", []), item["text"], warnings)
            fragments[item["text"]] = restore_whitespace(item["text"], restored)
        for item in pending_items:
            completed = compose(item, fragments)
            if completed is not None:
                cache[item["source"]] = completed
        args.fragment_cache.write_text(json.dumps(fragments, ensure_ascii=False, indent=2) + "\n")
        args.cache.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n")
        warnings_path.write_text(json.dumps(warnings, ensure_ascii=False, indent=2) + "\n")
        completed_count = min(offset + len(items), total)
        if completed_count == total or completed_count % (args.batch_size * 10) == 0:
            print(
                f"Translated {completed_count}/{total} local fragments "
                f"({len(cache)} cached records).",
                flush=True,
            )


if __name__ == "__main__":
    main()
