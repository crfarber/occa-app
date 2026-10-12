# Categoriemodel

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `assets/models/`, `capture/platform/rn/custom-category-classifier.tsx`, `domain/category-model-labels.ts`, `training/`, `docs/occa-brief.md`
> Zie ook: [occa-brief](../occa-brief.md) §4

## Waarvoor

Op het toestel een kledingcategorie raden zonder netwerk en zonder ML Kit-basismodel (dat kent
geen trui/rok goed genoeg).

## Hoe het werkt

Gebundeld `occa_category.tflite` (~1.2 MB int8, uint8-input) laadt via Infinite Red ML Kit +
`expo-asset`. Float16 (~75% val) heeft float32-I/O zonder NormalizationOptions-metadata; ML Kit
weigert dat op het toestel — daarom int8 als app-asset. Classificatie levert indexes; de app mapt
`index` → labeltekst via `CATEGORY_MODEL_LABELS` (zelfde volgorde als `labels.json`).

## Beweringen

| ID     | Bewering                                                                           | Code                                                         | Test                            |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------- |
| CAT-01 | Het modelbestand wordt als Metro-asset gebundeld (`.tflite` in `assetExts`).       | `metro.config.js`, `assets/models/`                          | —                               |
| CAT-02 | Labeltekst komt uit index→tabel, niet uit vertrouwen op ML Kit `text` alleen.      | `custom-category-classifier.tsx`, `category-model-labels.ts` | `category-model-labels.test.ts` |
| CAT-03 | `label()` wacht kort tot het model geladen is; daarna pas falen.                   | `wait-for-loaded.ts`, `custom-category-classifier.tsx`       | `wait-for-loaded.test.ts`       |
| CAT-04 | Modelconfig (`MODELS`) staat op moduleniveau (stabiele referentie voor de loader). | `custom-category-classifier.tsx`                             | —                               |
| CAT-05 | Drempel/opties: max 5 resultaten, ML Kit confidence ≥ 0,05; interpret ≥ 0,2.       | `custom-category-classifier.tsx`, `interpret-labels.ts`      | `interpret-labels.test.ts`      |
| CAT-06 | App-asset is int8/uint8 (ML Kit); niet float16 zonder metadata.                    | `assets/models/`, `training/train.py`                        | —                               |
| CAT-07 | ML Kit / custom TFLite vereist development build, niet Expo Go.                    | brief §4, native modules                                     | —                               |

## Modelklassen (specificatie)

Volgorde moet gelijk blijven aan `training/export/labels.json` / `assets/models/labels.json`:

`Blazer`, `Dress`, `Hat`, `Hoodie`, `Longsleeve`, `Outwear`, `Pants`, `Polo`, `Shirt`, `Shoes`,
`Shorts`, `Skirt`, `T-Shirt`, `Undershirt`.

## Randgevallen en bewuste keuzes

- Dataset-spelling `Outwear` (zonder e) blijft zo in labels; mapping naar app-categorie `jas` zit in
  `interpret-labels.ts`.
- Trainen: `training/train.py`; opnieuw kopiëren naar `assets/models/` na export. Stap-voor-stap
  (URL’s, venv, sync): [handleiding-starten.md](../handleiding-starten.md) §6.
- Native rebuild nodig na toevoegen van de Infinite Red-module.

## Open vragen

- Brief: genoeg echte winkelphoto's per klasse voor productiekwaliteit (~100–500).
