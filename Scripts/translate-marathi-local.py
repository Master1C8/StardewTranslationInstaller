#!/usr/bin/env python3
"""Fill the Marathi translation cache with the local IndicTrans2 model."""

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
    parser.add_argument("--reset-warnings", action="store_true")
    parser.add_argument("--fragment-overrides", type=Path)
    parser.add_argument("--quantize", action="store_true")
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
            # Greedy decoding occasionally duplicates the angle brackets
            # around a preserved ID (for example, <<ID1>>). Consume the
            # complete wrapper so it cannot leak into player-facing text.
            pattern = rf"(?:<\s*)+ID\s*{index}(?:\s*>)+"
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
        r"(?<![\w])(?:आई|आय|आइ)\s*\.?\s*डी\s*\.?\s*(\d+)(?!\d)",
        r"(?<![\w])(?:आईडी|आयडी|ऐडि|आइडि)\s*(\d+)(?!\d)",
        r"(?<![A-Za-z])ID\s*(\d+)(?!\d)",
        r"ಐ\s*\.?\s*ಡಿ\s*\.?\s*(\d+)(?!\d)",
        r"ಐಡಿ\s*(\d+)(?!\d)",
    ]
    result = value
    for pattern in patterns:
        result = re.sub(pattern, lambda match: f"<ID{match.group(1)}>", result)
    return result


def fragment_key(part: dict) -> str:
    terms = part.get("terms", [])
    if not terms:
        return part["text"]
    return json.dumps(
        {
            "text": part["text"],
            "version": 3,
            "terms": [
                {
                    "placeholder": term["placeholder"],
                    "replacement": term["replacement"],
                }
                for term in terms
            ],
        },
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )


def compose(
    item: dict,
    fragments: dict[str, str],
    fragment_overrides: dict[str, str],
) -> str | None:
    result = []
    for part in item["parts"]:
        if "literal" in part:
            result.append(part["literal"])
        elif part["text"] in fragment_overrides:
            result.append(fragment_overrides[part["text"]])
        elif fragment_key(part) in fragments:
            result.append(fragments[fragment_key(part)])
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
    placeholder_warnings = [] if args.reset_warnings else (
        json.loads(warnings_path.read_text()) if warnings_path.exists() else []
    )
    fragment_overrides = (
        json.loads(args.fragment_overrides.read_text())
        if args.fragment_overrides
        else {}
    )
    available_fragment_sources = {
        part["text"]
        for item in job["items"]
        for part in item["parts"]
        if "text" in part
    }
    unknown_fragment_overrides = sorted(
        set(fragment_overrides) - available_fragment_sources
    )
    if unknown_fragment_overrides:
        raise RuntimeError(
            "fragment overrides no longer match the local input: "
            + repr(unknown_fragment_overrides)
        )
    # A fragment's protected text is not a complete cache key: two different
    # glossary terms can both reduce to <ID1>. Earlier drafts keyed only by the
    # protected text and could therefore reuse one term's Marathi replacement
    # for another. Invalidate every affected composed record and migrate term
    # fragments to a key that includes their replacement map.
    invalidated_records = 0
    term_texts = set()
    plain_texts = set()
    for item in job["items"]:
        has_terms = False
        for part in item["parts"]:
            if "text" not in part:
                continue
            if part.get("terms"):
                has_terms = True
                term_texts.add(part["text"])
            else:
                plain_texts.add(part["text"])
        if has_terms and item["source"] in cache:
            del cache[item["source"]]
            invalidated_records += 1
    removed_legacy_fragments = 0
    for value in term_texts - plain_texts:
        if value in fragments:
            del fragments[value]
            removed_legacy_fragments += 1

    # Exact glossary labels and placeholder-only fragments do not need model
    # inference. Restoring them directly is both faster and more accurate.
    direct_fragments = 0
    placeholder_only = re.compile(
        r"^(?:\s|<ID\d+>|[.,!?…।:;/()'\"\-])+$",
        re.IGNORECASE,
    )
    for item in job["items"]:
        for part in item["parts"]:
            if "text" not in part or not part.get("terms"):
                continue
            if not placeholder_only.fullmatch(part["text"]):
                continue
            key = fragment_key(part)
            if key in fragments:
                continue
            output = part["text"]
            for term in part["terms"]:
                output = output.replace(term["placeholder"], term["replacement"])
            fragments[key] = output
            direct_fragments += 1

    pending_items = [item for item in job["items"] if item["source"] not in cache]
    pending_map = {}
    for item in pending_items:
        for part in item["parts"]:
            if "text" in part and fragment_key(part) not in fragments:
                pending_map.setdefault(fragment_key(part), part)
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
                "invalidatedTermRecords": invalidated_records,
                "removedLegacyTermFragments": removed_legacy_fragments,
                "directGlossaryFragments": direct_fragments,
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
        for item in job["items"]:
            completed = compose(item, fragments, fragment_overrides)
            if completed is None:
                raise RuntimeError(f"missing fragment for {item['source']!r}")
            cache[item["source"]] = completed
        args.cache.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n")
        return

    processor = IndicProcessor(inference=True)
    tokenizer = AutoTokenizer.from_pretrained(
        args.model, trust_remote_code=True, local_files_only=True
    )
    model = AutoModelForSeq2SeqLM.from_pretrained(
        args.model, trust_remote_code=True, local_files_only=True
    )
    if args.quantize:
        if device != "cpu":
            raise RuntimeError("dynamic quantization is only available on CPU")
        torch.backends.quantized.engine = "qnnpack"
        model = torch.ao.quantization.quantize_dynamic(
            model,
            {torch.nn.Linear},
            dtype=torch.qint8,
        )
    model = model.to(device)
    model.eval()

    total = len(pending)
    for offset in range(0, total, args.batch_size):
        items = pending[offset : offset + args.batch_size]
        prepared = processor.preprocess_batch(
            [item["text"] for item in items],
            src_lang="eng_Latn",
            tgt_lang="mar_Deva",
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
            )
        decoded = tokenizer.batch_decode(
            generated,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True,
        )
        decoded = [normalize_internal_placeholders(value) for value in decoded]
        translated = processor.postprocess_batch(decoded, lang="mar_Deva")
        translated = [normalize_internal_placeholders(value) for value in translated]
        for item, output in zip(items, translated, strict=True):
            restored = restore_terms(
                output,
                item.get("terms", []),
                item["text"],
                placeholder_warnings,
            )
            fragments[fragment_key(item)] = restore_whitespace(item["text"], restored)
        for item in pending_items:
            completed = compose(item, fragments, fragment_overrides)
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
