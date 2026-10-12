#!/usr/bin/env python3
"""
Downloadt de Clothing dataset (Alexey Grigorev, CC0, ~5.700 foto's)
en zet hem in een mappenstructuur voor transfer learning:

    output/
      train/T-Shirt/*.jpg
      train/Pants/*.jpg
      val/...
      test/...
      labels.txt          (klassen, één per regel — handig voor ML Kit / TFLite)
      summary.csv         (aantal foto's per klasse per split)

Alleen standaardbibliotheek, geen extra packages nodig.

Voorbeelden:
    python prepare_clothing_dataset.py
    python prepare_clothing_dataset.py --out data --min-count 100
    python prepare_clothing_dataset.py --classes T-Shirt Pants Shoes Dress Hoodie
    python prepare_clothing_dataset.py --source ./clothing-dataset   (al gedownload)
"""

import argparse
import csv
import io
import random
import shutil
import sys
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

ZIP_URL = "https://github.com/alexeygrigorev/clothing-dataset/archive/refs/heads/master.zip"

# Labels die geen echte kledingcategorie zijn
SKIP_LABELS = {"Not sure", "Other", "Skip"}


def download(dest: Path) -> Path:
    """Download en pak de dataset uit; geeft de map met images.csv terug."""
    dest.mkdir(parents=True, exist_ok=True)
    existing = next(dest.glob("*/images.csv"), None)
    if existing:
        print(f"Dataset al aanwezig in {existing.parent}, download overgeslagen.")
        return existing.parent

    print(f"Downloaden van {ZIP_URL} (~320 MB)...")
    buf = io.BytesIO()
    with urllib.request.urlopen(ZIP_URL) as resp:
        total = int(resp.headers.get("Content-Length") or 0)
        done = 0
        while chunk := resp.read(1 << 20):
            buf.write(chunk)
            done += len(chunk)
            mb = done / 1e6
            msg = f"\r  {mb:,.0f} MB" + (f" / {total / 1e6:,.0f} MB" if total else "")
            print(msg, end="", flush=True)
    print("\nUitpakken...")
    with zipfile.ZipFile(buf) as zf:
        zf.extractall(dest)
    return next(dest.glob("*/images.csv")).parent


def load_rows(src: Path, include_kids: bool):
    rows = []
    with open(src / "images.csv", newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["label"] in SKIP_LABELS:
                continue
            if not include_kids and r["kids"] == "True":
                continue
            img = src / "images" / f"{r['image']}.jpg"
            if img.exists() and img.stat().st_size > 1000:  # sla lege/LFS-stubs over
                rows.append((img, r["label"]))
    return rows


def split(items, ratios, rng):
    items = items[:]
    rng.shuffle(items)
    n = len(items)
    n_train = round(n * ratios[0])
    n_val = round(n * ratios[1])
    return {
        "train": items[:n_train],
        "val": items[n_train:n_train + n_val],
        "test": items[n_train + n_val:],
    }


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--out", default="clothing_data", help="outputmap (default: clothing_data)")
    p.add_argument("--source", help="map met al gedownloade dataset (bevat images.csv)")
    p.add_argument("--cache", default=".clothing_cache", help="downloadmap (default: .clothing_cache)")
    p.add_argument("--classes", nargs="*", help="alleen deze klassen gebruiken")
    p.add_argument("--min-count", type=int, default=50, help="klassen met minder foto's overslaan (default: 50)")
    p.add_argument("--split", nargs=3, type=float, default=[0.7, 0.15, 0.15], metavar=("TRAIN", "VAL", "TEST"))
    p.add_argument("--include-kids", action="store_true", help="kinderkleding meenemen")
    p.add_argument("--seed", type=int, default=42)
    args = p.parse_args()

    if abs(sum(args.split) - 1) > 1e-6:
        sys.exit("--split moet optellen tot 1.0")

    src = Path(args.source) if args.source else download(Path(args.cache))
    rows = load_rows(src, args.include_kids)

    by_label = defaultdict(list)
    for img, label in rows:
        by_label[label].append(img)

    if args.classes:
        wanted = {c.lower(): c for c in args.classes}
        by_label = {l: v for l, v in by_label.items() if l.lower() in wanted}
        missing = set(wanted) - {l.lower() for l in by_label}
        if missing:
            print(f"Let op, niet gevonden: {', '.join(sorted(missing))}")

    dropped = {l: len(v) for l, v in by_label.items() if len(v) < args.min_count}
    by_label = {l: v for l, v in by_label.items() if len(v) >= args.min_count}
    if dropped:
        print("Overgeslagen (te weinig foto's): " + ", ".join(f"{l} ({n})" for l, n in sorted(dropped.items())))
    if not by_label:
        sys.exit("Geen klassen over. Verlaag --min-count of pas --classes aan.")

    out = Path(args.out)
    if out.exists():
        shutil.rmtree(out)

    rng = random.Random(args.seed)
    summary = []
    for label in sorted(by_label):
        parts = split(by_label[label], args.split, rng)  # gestratificeerd: per klasse splitsen
        folder = label.replace(" ", "_").replace("/", "_")
        for part, imgs in parts.items():
            d = out / part / folder
            d.mkdir(parents=True, exist_ok=True)
            for img in imgs:
                shutil.copy2(img, d / img.name)
        summary.append((folder, len(parts["train"]), len(parts["val"]), len(parts["test"])))

    (out / "labels.txt").write_text("\n".join(s[0] for s in summary) + "\n", encoding="utf-8")
    with open(out / "summary.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["klasse", "train", "val", "test"])
        w.writerows(summary)

    print(f"\n{'klasse':<12}{'train':>7}{'val':>6}{'test':>6}")
    for name, tr, va, te in summary:
        print(f"{name:<12}{tr:>7}{va:>6}{te:>6}")
    tot = [sum(s[i] for s in summary) for i in (1, 2, 3)]
    print(f"{'totaal':<12}{tot[0]:>7}{tot[1]:>6}{tot[2]:>6}")
    print(f"\nKlaar: {out.resolve()}")


if __name__ == "__main__":
    main()
