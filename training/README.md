# Categoriemodel trainen

Volledige setup van de app + training: [docs/handleiding-starten.md](../docs/handleiding-starten.md).

Lokale downloads, venv, `clothing_data/` en `export/` staan in `.gitignore` (geen foto’s in git).

## Snel: `pnpm training`

Vanuit de **repo-root**:

```bash
# Default zip (Alexey Grigorev clothing-dataset)
pnpm training

# Eigen zip-URL (Grigorev-layout: images.csv + images/)
pnpm training -- https://github.com/alexeygrigorev/clothing-dataset/archive/refs/heads/master.zip
```

Het script (`run_training.py`):

1. maakt `training/.venv` + installeert `requirements.txt`
2. downloadt/prepare’t de dataset → `clothing_data/train`
3. traint TFLite (default **int8** voor ML Kit)
4. kopieert `occa_category.tflite` + `labels.json` naar `assets/models/`

## Publieke dataset

| Wat | URL |
| --- | --- |
| Repo | https://github.com/alexeygrigorev/clothing-dataset |
| Zip | https://github.com/alexeygrigorev/clothing-dataset/archive/refs/heads/master.zip |

## Eigen winkelfoto’s

Foto’s per categorie in een map (mapnaam = `id` uit [`categories.json`](./categories.json)):

```
dataset/
  t_shirt/     *.jpg
  polo/        *.jpg
  ...
```

```bash
pnpm training -- --data training/dataset --skip-download
```

Richtlijn: **100–500 foto’s per map**, zoals in de winkel.

## Handmatig

```bash
cd training
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python prepare_clothing_dataset.py --out ./clothing_data
python train.py --data ./clothing_data/train --out ./export
cp export/occa_category.tflite export/labels.json ../assets/models/
```

`train.py` defaults: EarlyStopping, augmentatie, int8-export. Optioneel `--quantize float16`
(hogere desktop-eval, niet zonder metadata voor ML Kit).
