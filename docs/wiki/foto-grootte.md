# Foto-grootte

> Gecontroleerd op: lokaal (2026-11-22)
> Bronnen: `src/domeinen/capture/domain/upload-photo-size.ts`, `platform/rn/crop-image.ts`, partner `@occa/vision` `resize.ts` / `background.ts`, `@occa/core` `small-photo.ts`
> Zie ook: [scannen.md](scannen.md), [offline-upload.md](offline-upload.md), [shop-api.md](shop-api.md)

## Waarvoor

Productfoto's zijn voor **online gebruik** (site, lijsten, AI), nooit voor print. Een iPhone Pro
maakt veel te grote bestanden; die kosten uploadbandbreedte, storage en (bij Mistral) tokens. De
app verkleint daarom al bij de crop; partner en de conceptworker doen hetzelfde als safety net.

## Hoe het werkt

1. Na kader-crop schaalt de app de foto **fit-inside** tot lange kant ≤ **1540 px**, JPEG-kwaliteit
   **0,82** (zelfde intentie als partner `resizeForAnalysis`).
2. Partner normaliseert bij `POST …/photos` opnieuw naar ≤1540 / JPEG 82 en weigert bodies > 4,5 MB.
3. Conceptworker stuurt naar BiRefNet/fal maximaal lange kant **1024**; het masker gaat terug op de
   opgeslagen master.
4. Voor lijsten bestaat een aparte thumb: lange kant **480**, JPEG 78 (`.klein.jpg` in de bucket).

| Rol                       | Lange kant | JPEG | Waar                                   |
| ------------------------- | ---------- | ---- | -------------------------------------- |
| Master (site / bucket)    | ≤ 1540     | ~82  | app crop + partner `resizeForAnalysis` |
| Cut-out naar fal/BiRefNet | ≤ 1024     | ~88  | platform `CUTOUT_EDGE`                 |
| Lijst / cards             | ≤ 480      | 78   | platform `SMALL_PHOTO_*`               |

## Beweringen

| ID      | Bewering                                                                                     | Code                                    | Test                        |
| ------- | -------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------- |
| SIZE-01 | Crop output schaalt fit-inside tot lange kant ≤ `UPLOAD_PHOTO_MAX_EDGE` (1540) vóór opslaan. | `upload-photo-size.ts`, `crop-image.ts` | `upload-photo-size.test.ts` |
| SIZE-02 | JPEG-compressie na crop is `UPLOAD_PHOTO_JPEG_QUALITY` (0,82).                               | `crop-image.ts`                         | —                           |
| SIZE-03 | Partner bewaart uploads via `resizeForAnalysis` (max edge 1540 / quality 82).                | platform `resize.ts`, `photo-upload.ts` | platform `resize.test.ts`   |
| SIZE-04 | Cut-out naar fal/local shrinkt naar lange kant 1024; masker op full-size master.             | platform `background.ts`                | platform background-tests   |

## Randgevallen en bewuste keuzes

- Geen printresolutie; 1540 is genoeg voor web (richting Google Merchant ~1500) en gelijk aan de
  Mistral-meetgrens op het platform.
- Foto's die al kleiner zijn dan 1540 worden niet vergroot.
- fal/BiRefNet factureert per compute-seconde; grotere input dan 1024 helpt het model niet
  (`operating_resolution`), dus de worker shrinkt al.

## Open vragen

- Geen; besluit max-edge 1540 vastgelegd 2026-11-22 (open vraag 8).
