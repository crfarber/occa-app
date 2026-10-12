# Categoriemodel trainen

## Snel starten (publieke clothing-dataset)

De lege mappen onder `dataset/` zijn de **winkel-taxonomie** (`categories.json`) — die
gebruik je voor eigen winkelfoto's. Voor de eerste trainingsruns: de voorbereide
Alexey-Grigorev-set:

```bash
pip install -r requirements.txt
python prepare_clothing_dataset.py --out ./clothing_data
python train.py --data ./clothing_data/train --out ./export
cp export/relabel_category.tflite export/labels.json ../assets/models/
```

`train.py` gebruikt EarlyStopping, sterkere augmentatie en langere defaults (15+8 epochs).
Export standaard als **int8/uint8** TFLite (~1.2 MB) — dat is wat ML Kit op het toestel accepteert.
Float16 (`--quantize float16`) scoort hoger op desktop-eval (~75%) maar faalt in ML Kit zonder
TFLite NormalizationOptions-metadata. Optioneel `--class-weight sqrt|balanced`.

## Eigen winkelfoto's

Foto's per categorie in een map (mapnaam = `id` uit [`categories.json`](./categories.json)):

```
dataset/
  t_shirt/     *.jpg
  polo/        *.jpg
  overhemd/    *.jpg
  jas/         *.jpg
  jeans/       *.jpg
  sneaker/     *.jpg
  ...
```

```bash
python train.py --data ./dataset --out ./export
cp export/relabel_category.tflite export/labels.json ../assets/models/
```

Resultaat in `export/`:

- `relabel_category.tflite` – voor ML Kit in de app (`assets/models/`)
- `labels.json` – index → categorie, kopieer naar de app
- `report.txt` – nauwkeurigheid per categorie en waar het model zich vergist

Richtlijn: **100–500 foto's per map**, genomen zoals in de winkel (zelfde licht, hangend/liggend, verschillende kleuren).

## Welke mappen? (visueel herkenbaar)

Volledige lijst + toelichting staat in **`categories.json`**. Samenvatting van **tier 1** (hiermee beginnen — ML kan dit doorgaans goed leren):

| Map (`id`)          | App-categorie | NL-label             |
| ------------------- | ------------- | -------------------- |
| `t_shirt`           | top           | T-shirt              |
| `polo`              | top           | Polo                 |
| `overhemd`          | top           | Overhemd             |
| `blouse`            | top           | Blouse               |
| `tanktop`           | top           | Tanktop / hemd       |
| `trui`              | trui_vest     | Trui                 |
| `hoodie`            | trui_vest     | Hoodie               |
| `sweater`           | trui_vest     | Sweater / sweatshirt |
| `vest`              | trui_vest     | Vest / cardigan      |
| `jas`               | jas           | Jas (licht / tussen) |
| `winterjas`         | jas           | Winterjas / parka    |
| `blazer`            | jas           | Blazer / colbert     |
| `spijkerjas`        | jas           | Spijkerjas           |
| `leren_jas`         | jas           | Leren jas            |
| `mantel`            | jas           | Mantel / coat        |
| `bodywarmer`        | jas           | Bodywarmer           |
| `jeans`             | broek         | Jeans                |
| `chino`             | broek         | Chino / pantalon     |
| `short`             | broek         | Short                |
| `legging`           | broek         | Legging              |
| `joggingbroek`      | broek         | Joggingbroek         |
| `overall_tuinbroek` | broek         | Overall / tuinbroek  |
| `rok_kort`          | rok           | Korte rok            |
| `rok_lang`          | rok           | Lange rok / maxi     |
| `jurk_kort`         | jurk          | Korte jurk           |
| `jurk_lang`         | jurk          | Lange jurk           |
| `jumpsuit`          | jurk          | Jumpsuit / playsuit  |
| `sneaker`           | schoenen      | Sneaker              |
| `laars`             | schoenen      | Laars (hoog)         |
| `enkellaars`        | schoenen      | Enkellaars           |
| `pump`              | schoenen      | Pump / hak           |
| `sandaal`           | schoenen      | Sandaal              |
| `instapper`         | schoenen      | Instapper / loafer   |
| `veterschoen`       | schoenen      | Nette veterschoen    |
| `handtas`           | tas           | Handtas              |
| `schoudertas`       | tas           | Schoudertas          |
| `rugzak`            | tas           | Rugzak               |
| `clutch`            | tas           | Clutch               |
| `weekendtas`        | tas           | Weekendtas / shopper |
| `pet`               | accessoire    | Pet                  |
| `hoed`              | accessoire    | Hoed                 |
| `muts`              | accessoire    | Muts                 |
| `sjaal`             | accessoire    | Sjaal                |
| `riem`              | accessoire    | Riem                 |
| `zonnebril`         | accessoire    | Zonnebril            |

**Tier 2** in `categories.json` (crop top, bermuda, plissé, crossbody, …): alleen toevoegen met genoeg foto's; anders bij de dichtstbijzijnde tier-1 voegen.

## Wat je níet als klasse traint

Merk, maat, stof%, conditie, kleur-als-klasse, gender — dat is OCR, pixelkleur of cloud. Zie `doNotTrainAsClasses` in `categories.json`.

## App-koppeling

Het model leert de **blad-`id`** (`t_shirt`, `spijkerjas`, …). In de app map je die via `labels.json` + een kleine tabel naar `PRODUCT_CATEGORIES` (`top`, `jas`, …) en vul je subtype (`t-shirt`, `spijkerjas`) voor het formulier.
