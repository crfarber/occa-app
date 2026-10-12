#!/usr/bin/env python3
"""
End-to-end: download a clothing zip (optional URL) → prepare folders → train TFLite →
copy into assets/models/.

Usage (from repo root):
    pnpm training
    pnpm training -- https://github.com/alexeygrigorev/clothing-dataset/archive/refs/heads/master.zip
    python training/run_training.py --url <zip-url>
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import venv
from pathlib import Path

DEFAULT_ZIP_URL = (
    "https://github.com/alexeygrigorev/clothing-dataset/archive/refs/heads/master.zip"
)

TRAINING_DIR = Path(__file__).resolve().parent
REPO_ROOT = TRAINING_DIR.parent
VENV_DIR = TRAINING_DIR / ".venv"
ASSETS_MODELS = REPO_ROOT / "assets" / "models"


def venv_python() -> Path:
    if sys.platform == "win32":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def ensure_venv() -> Path:
    py = venv_python()
    if not py.is_file():
        print(f"Python-venv aanmaken in {VENV_DIR} …")
        venv.create(VENV_DIR, with_pip=True)
    return py


def run(py: Path, args: list[str], *, cwd: Path) -> None:
    env = os.environ.copy()
    # Avoid picking up a broken system TensorFlow when the venv is active.
    env["VIRTUAL_ENV"] = str(VENV_DIR)
    print("+", " ".join(args))
    subprocess.run([str(py), *args], cwd=cwd, env=env, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "url",
        nargs="?",
        default=None,
        help="Zip-URL met de dataset (default: Alexey Grigorev clothing-dataset)",
    )
    parser.add_argument(
        "--url",
        dest="url_flag",
        default=None,
        help="Zelfde als positionele url",
    )
    parser.add_argument(
        "--skip-download",
        action="store_true",
        help="Gebruik bestaande training/clothing_data/train (geen download)",
    )
    parser.add_argument(
        "--data",
        default=None,
        help="Trainingsmap met klasse-submappen (default: clothing_data/train na prepare)",
    )
    parser.add_argument(
        "--quantize",
        choices=("int8", "float16"),
        default="int8",
        help="TFLite-export (default int8 voor ML Kit)",
    )
    parser.add_argument(
        "--min-count",
        type=int,
        default=50,
        help="Min. foto's per klasse bij prepare (default 50)",
    )
    args = parser.parse_args()
    zip_url = args.url_flag or args.url or DEFAULT_ZIP_URL

    py = ensure_venv()
    run(py, ["-m", "pip", "install", "--upgrade", "pip"], cwd=TRAINING_DIR)
    run(py, ["-m", "pip", "install", "-r", "requirements.txt"], cwd=TRAINING_DIR)

    data_dir = Path(args.data) if args.data else TRAINING_DIR / "clothing_data" / "train"

    if not args.skip_download and args.data is None:
        # Fresh download into cache, then materialise clothing_data/
        run(
            py,
            [
                "prepare_clothing_dataset.py",
                "--url",
                zip_url,
                "--force",
                "--out",
                "clothing_data",
                "--cache",
                ".clothing_cache",
                "--min-count",
                str(args.min_count),
            ],
            cwd=TRAINING_DIR,
        )
        data_dir = TRAINING_DIR / "clothing_data" / "train"

    if not data_dir.is_dir():
        sys.exit(f"Trainingsmap ontbreekt: {data_dir}")

    export_dir = TRAINING_DIR / "export"
    run(
        py,
        [
            "train.py",
            "--data",
            str(data_dir),
            "--out",
            str(export_dir),
            "--quantize",
            args.quantize,
        ],
        cwd=TRAINING_DIR,
    )

    ASSETS_MODELS.mkdir(parents=True, exist_ok=True)
    for name in ("occa_category.tflite", "labels.json"):
        src = export_dir / name
        if not src.is_file():
            sys.exit(f"Export mist {src}")
        dest = ASSETS_MODELS / name
        shutil.copy2(src, dest)
        print(f"Gekopieerd → {dest}")

    print(
        "\nKlaar. Herlaad de app (Metro). Controleer of "
        "category-model-labels.ts dezelfde klasse-volgorde heeft als labels.json."
    )


if __name__ == "__main__":
    main()
