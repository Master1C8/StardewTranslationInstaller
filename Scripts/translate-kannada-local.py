#!/usr/bin/env python3
"""Fill the Kannada translation cache with the local IndicTrans2 model."""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path

os.environ.setdefault(
    "HF_HOME", str(Path(__file__).resolve().parents[1] / ".hf-cache")
)

import torch
from IndicTransToolkit import IndicProcessor
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--cache", type=Path, required=True)
    parser.add_argument("--fragment-cache", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--num-beams", type=int, default=5)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--warnings", type=Path)
    return parser.parse_args()


def restore_whitespace(source: str, translated: str) -> str:
    leading = source[: len(source) - len(source.lstrip())]
    trailing = source[len(source.rstrip()) :]
    return f"{leading}{translated.strip()}{trailing}"


def restore_terms(
    translated: str,
    terms: list[dict],
    source: str,
    warnings: list[dict],
) -> str:
    result = translated
    for index, term in enumerate(terms, start=1):
        if term["placeholder"].startswith("<ID"):
            pattern = rf"<\s*ID\s*{index}\s*>"
        else:
            pattern = rf"@\s*VNRTERM\s*{index}\b"
        result, count = re.subn(
            pattern, lambda _: term["replacement"], result, flags=re.IGNORECASE
        )
        replaced = count > 0
        if not replaced:
            stripped = source.strip()
            if stripped.startswith(term["placeholder"]):
                result = f"{term['replacement']} {result.lstrip()}"
                fallback = "prepend"
            elif stripped.endswith(term["placeholder"]):
                result = f"{result.rstrip()} {term['replacement']}"
                fallback = "append"
            else:
                result = f"{term['replacement']} {result.lstrip()}"
                fallback = "prepend-review"
            warnings.append({
                "source": source,
                "translated": translated,
                "placeholder": term["placeholder"],
                "replacement": term["replacement"],
                "fallback": fallback,
            })
    leftover = re.findall(
        r"(?:@\s*VNRTERM\s*\d+|<\s*ID\s*\d+\s*>)",
        result,
        re.IGNORECASE,
    )
    if leftover:
        warnings.append({
            "source": source,
            "translated": translated,
            "leftover": leftover,
            "fallback": "remove-unexpected-placeholder",
        })
        result = re.sub(
            r"(?:@\s*VNRTERM\s*\d+|<\s*ID\s*\d+\s*>)",
            "",
            result,
            flags=re.IGNORECASE,
        )
    return result


def normalize_internal_placeholders(value: str) -> str:
    patterns = [
        r"[<\[]\s*ID\s*(\d+)\s*[>\]]",
        r"[<\[]\s*ಐ\s*\.?\s*ಡಿ\s*\.?\s*(\d+)\s*[>\]]",
        r"[<\[]\s*ಐಡಿ\s*(\d+)\s*[>\]]",
        r"[<\[]\s*(?:आई|आय|आइ)\s*\.?\s*डी\s*\.?\s*(\d+)\s*[>\]]",
        r"[<\[]\s*(?:आईडी|आयडी|ऐडि|आइडि)\s*(\d+)\s*[>\]]",
        r"(?<![A-Za-z])ID\s*(\d+)(?!\d)",
        r"ಐ\s*\.?\s*ಡಿ\s*\.?\s*(\d+)(?!\d)",
        r"ಐಡಿ\s*(\d+)(?!\d)",
    ]
    result = value
    for pattern in patterns:
        result = re.sub(pattern, lambda match: f"<ID{match.group(1)}>", result)
    return result


def compose(item: dict, fragments: dict[str, str]) -> str | None:
    result = []
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
    fragments = (
        json.loads(args.fragment_cache.read_text())
        if args.fragment_cache.exists()
        else {}
    )
    warnings_path = args.warnings or args.fragment_cache.with_suffix(".warnings.json")
    placeholder_warnings = (
        json.loads(warnings_path.read_text()) if warnings_path.exists() else []
    )
    pending_items = [item for item in job["items"] if item["source"] not in cache]
    pending_map = {}
    for item in pending_items:
        for part in item["parts"]:
            if "text" in part and part["text"] not in fragments:
                pending_map.setdefault(part["text"], part)
    pending = list(pending_map.values())
    pending.sort(key=lambda item: len(item["text"]))
    if args.limit is not None:
        pending = pending[: args.limit]

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(
        json.dumps(
            {
                "pendingSegments": len(pending),
                "pendingRecords": len(pending_items),
                "cachedRecords": len(job["items"]) - len(pending_items),
                "cachedFragments": len(fragments),
                "device": device,
                "batchSize": args.batch_size,
                "numBeams": args.num_beams,
            },
            ensure_ascii=False,
            indent=2,
        ),
        flush=True,
    )
    if not pending:
        return

    processor = IndicProcessor(inference=True)
    tokenizer = AutoTokenizer.from_pretrained(
        args.model, trust_remote_code=True, local_files_only=True
    )
    model = AutoModelForSeq2SeqLM.from_pretrained(
        args.model, trust_remote_code=True, local_files_only=True
    ).to(device)
    model.eval()

    total = len(pending)
    for offset in range(0, total, args.batch_size):
        items = pending[offset : offset + args.batch_size]
        prepared = processor.preprocess_batch(
            [item["text"] for item in items],
            src_lang="eng_Latn",
            tgt_lang="kan_Knda",
            visualize=False,
        )
        batch = tokenizer(
            prepared,
            padding="longest",
            truncation=True,
            max_length=256,
            return_tensors="pt",
        ).to(device)
        maximum_new_tokens = min(
            256, max(32, int(batch["input_ids"].shape[1] * 2.5) + 16)
        )
        with torch.inference_mode():
            generated = model.generate(
                **batch,
                num_beams=args.num_beams,
                num_return_sequences=1,
                max_new_tokens=maximum_new_tokens,
                no_repeat_ngram_size=4,
            )
        decoded = tokenizer.batch_decode(
            generated,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True,
        )
        decoded = [normalize_internal_placeholders(value) for value in decoded]
        translated = processor.postprocess_batch(decoded, lang="kan_Knda")
        translated = [normalize_internal_placeholders(value) for value in translated]
        for item, output in zip(items, translated, strict=True):
            restored = restore_terms(
                output,
                item.get("terms", []),
                item["text"],
                placeholder_warnings,
            )
            fragments[item["text"]] = restore_whitespace(item["text"], restored)
        for item in pending_items:
            completed = compose(item, fragments)
            if completed is not None:
                cache[item["source"]] = completed
        args.fragment_cache.write_text(
            json.dumps(fragments, ensure_ascii=False, indent=2) + "\n"
        )
        args.cache.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n")
        warnings_path.write_text(
            json.dumps(placeholder_warnings, ensure_ascii=False, indent=2) + "\n"
        )
        completed_count = min(offset + len(items), total)
        print(
            f"Translated {completed_count}/{total} local fragments "
            f"({len(cache)} cached records).",
            flush=True,
        )


if __name__ == "__main__":
    main()
