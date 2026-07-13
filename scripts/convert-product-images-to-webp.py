#!/usr/bin/env python3
"""Convert product PNG files to WebP without deleting the originals.

The converter preserves the source directory layout, writes each destination
atomically, validates dimensions and transparency, and supports incremental
runs. Run from the repository root:

    python3 scripts/convert-product-images-to-webp.py
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image, ImageOps


DEFAULT_SOURCE = Path("public/images/products")
DEFAULT_QUALITY = 85


@dataclass(frozen=True)
class ConversionResult:
    source: str
    destination: str
    source_bytes: int
    destination_bytes: int
    width: int
    height: int
    source_mode: str
    destination_mode: str
    transparency: bool
    status: str

    @property
    def saved_bytes(self) -> int:
        return self.source_bytes - self.destination_bytes


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert product PNG files to WebP alongside the originals.",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help=f"Source directory (default: {DEFAULT_SOURCE})",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=DEFAULT_QUALITY,
        help=f"Lossy WebP quality from 1 to 100 (default: {DEFAULT_QUALITY})",
    )
    parser.add_argument(
        "--method",
        type=int,
        choices=range(0, 7),
        default=6,
        help="WebP encoding effort from 0 to 6 (default: 6)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Recreate WebP files even when the destination is current.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List work without writing images.",
    )
    parser.add_argument(
        "--report",
        type=Path,
        help="Optional JSON report path.",
    )
    return parser.parse_args()


def has_transparency(image: Image.Image) -> bool:
    if image.mode in {"RGBA", "LA"}:
        alpha = image.getchannel("A")
        minimum, _maximum = alpha.getextrema()
        return minimum < 255
    if image.mode == "P" and "transparency" in image.info:
        return True
    return False


def should_convert(source: Path, destination: Path, force: bool) -> bool:
    if force or not destination.exists():
        return True
    return source.stat().st_mtime_ns > destination.stat().st_mtime_ns


def validate_destination(
    destination: Path,
    expected_size: tuple[int, int],
    expected_transparency: bool,
) -> tuple[str, bool]:
    with Image.open(destination) as converted:
        converted.load()
        if converted.format != "WEBP":
            raise ValueError(f"Unexpected format: {converted.format}")
        if converted.size != expected_size:
            raise ValueError(
                f"Dimension mismatch: expected {expected_size}, got {converted.size}",
            )
        converted_transparency = has_transparency(converted)
        if expected_transparency and not converted_transparency:
            raise ValueError("Transparent source lost its alpha channel")
        return converted.mode, converted_transparency


def convert_one(
    source: Path,
    destination: Path,
    quality: int,
    method: int,
) -> ConversionResult:
    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as original:
        original.load()
        source_mode = original.mode
        source_size = original.size
        transparency = has_transparency(original)
        icc_profile = original.info.get("icc_profile")

        converted = ImageOps.exif_transpose(original)
        converted = converted.convert("RGBA" if transparency else "RGB")

        temporary_path: Path | None = None
        try:
            with NamedTemporaryFile(
                dir=destination.parent,
                prefix=f".{destination.stem}.",
                suffix=".tmp",
                delete=False,
            ) as temporary:
                temporary_path = Path(temporary.name)

            save_options: dict[str, object] = {
                "format": "WEBP",
                "quality": quality,
                "method": method,
                "exact": transparency,
            }
            if icc_profile:
                save_options["icc_profile"] = icc_profile

            converted.save(temporary_path, **save_options)
            os.replace(temporary_path, destination)
            temporary_path = None
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)

    destination_mode, destination_transparency = validate_destination(
        destination,
        source_size,
        transparency,
    )
    if transparency != destination_transparency:
        raise ValueError("Transparency validation failed")

    return ConversionResult(
        source=source.as_posix(),
        destination=destination.as_posix(),
        source_bytes=source.stat().st_size,
        destination_bytes=destination.stat().st_size,
        width=source_size[0],
        height=source_size[1],
        source_mode=source_mode,
        destination_mode=destination_mode,
        transparency=transparency,
        status="converted",
    )


def existing_result(source: Path, destination: Path) -> ConversionResult:
    with Image.open(source) as original:
        original.load()
        source_size = original.size
        source_mode = original.mode
        transparency = has_transparency(original)

    destination_mode, destination_transparency = validate_destination(
        destination,
        source_size,
        transparency,
    )
    return ConversionResult(
        source=source.as_posix(),
        destination=destination.as_posix(),
        source_bytes=source.stat().st_size,
        destination_bytes=destination.stat().st_size,
        width=source_size[0],
        height=source_size[1],
        source_mode=source_mode,
        destination_mode=destination_mode,
        transparency=destination_transparency,
        status="current",
    )


def write_report(
    report_path: Path,
    source_root: Path,
    quality: int,
    method: int,
    results: list[ConversionResult],
) -> None:
    report_path.parent.mkdir(parents=True, exist_ok=True)
    source_bytes = sum(result.source_bytes for result in results)
    destination_bytes = sum(result.destination_bytes for result in results)
    payload = {
        "source": source_root.as_posix(),
        "quality": quality,
        "method": method,
        "images": len(results),
        "converted": sum(result.status == "converted" for result in results),
        "current": sum(result.status == "current" for result in results),
        "sourceBytes": source_bytes,
        "destinationBytes": destination_bytes,
        "savedBytes": source_bytes - destination_bytes,
        "savedPercent": round(
            (source_bytes - destination_bytes) / source_bytes * 100,
            2,
        )
        if source_bytes
        else 0,
        "results": [
            {**asdict(result), "saved_bytes": result.saved_bytes}
            for result in results
        ],
    }
    report_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    args = parse_args()
    source_root = args.source.resolve()
    if not source_root.is_dir():
        print(f"Source directory does not exist: {source_root}", file=sys.stderr)
        return 2
    if not 1 <= args.quality <= 100:
        print("Quality must be between 1 and 100", file=sys.stderr)
        return 2

    sources = sorted(
        path for path in source_root.rglob("*") if path.is_file() and path.suffix.lower() == ".png"
    )
    print(f"Source: {source_root}")
    print(f"PNG files: {len(sources)}")
    print(f"WebP quality: {args.quality}, method: {args.method}")

    if args.dry_run:
        for source in sources:
            destination = source.with_suffix(".webp")
            state = "convert" if should_convert(source, destination, args.force) else "current"
            print(f"[{state}] {source} -> {destination}")
        return 0

    results: list[ConversionResult] = []
    failures: list[tuple[Path, str]] = []
    for index, source in enumerate(sources, start=1):
        destination = source.with_suffix(".webp")
        try:
            if should_convert(source, destination, args.force):
                result = convert_one(
                    source,
                    destination,
                    args.quality,
                    args.method,
                )
            else:
                result = existing_result(source, destination)
            results.append(result)
            print(
                f"[{index}/{len(sources)}] {result.status}: "
                f"{source.relative_to(source_root)} "
                f"({result.source_bytes} -> {result.destination_bytes} bytes)",
            )
        except Exception as error:  # Pillow exposes format-specific exceptions.
            failures.append((source, str(error)))
            print(f"[{index}/{len(sources)}] failed: {source}: {error}", file=sys.stderr)

    source_bytes = sum(result.source_bytes for result in results)
    destination_bytes = sum(result.destination_bytes for result in results)
    saved_percent = (
        (source_bytes - destination_bytes) / source_bytes * 100
        if source_bytes
        else 0
    )
    print(
        f"Completed: {len(results)} images, {len(failures)} failures, "
        f"{source_bytes} -> {destination_bytes} bytes ({saved_percent:.2f}% saved)",
    )

    if args.report:
        write_report(
            args.report,
            source_root,
            args.quality,
            args.method,
            results,
        )
        print(f"Report: {args.report}")

    if failures:
        print("Failures:", file=sys.stderr)
        for source, message in failures:
            print(f"- {source}: {message}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
