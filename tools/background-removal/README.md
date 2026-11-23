# Background removal (BiRefNet) – lokaal experiment

Batch-script dat achtergronden verwijdert met [BiRefNet](https://huggingface.co/ZhengPeng7/BiRefNet) via PyTorch + Hugging Face Transformers.

Dit hoort **niet** in de Expo-app (te zwaar). Het echte uitknippen komt in de concept-worker van het platform (`services/image-pipeline` in de platform-repo, Docker op GitHub Actions of je Mac); zie `techniek.md`, "De concept-worker". Dit mapje blijft een los experiment om modellen en foto's snel te vergelijken.

## Setup

```bash
cd tools/background-removal
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Gebruik

1. Zet foto’s in `input/` (jpg, jpeg, png, bmp, webp, tif, tiff).
2. Draai:

```bash
source .venv/bin/activate
python remove_background.py
```

3. Resultaten staan in `output/` als PNG met transparante achtergrond.

De eerste run downloadt het model van Hugging Face (groot; kan even duren). Op Apple Silicon gebruikt het script `mps` als die beschikbaar is, anders `cpu`.

## Scope

Alleen lokaal batch-testen. Geen koppeling met `src/domeinen/capture` of de Occa-container.
