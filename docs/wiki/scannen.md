# Scannen

> Gecontroleerd op: lokaal (2026-10-10)
> Bronnen: `src/domeinen/capture/screens/capture-screen.tsx`, `domain/frame-crop.ts`, `domain/scan-photos.ts`, `domain/merge-interpret-results.ts`, `platform/rn/crop-image.ts`, `components/`
> Zie ook: [categorie-model.md](categorie-model.md), [kleur-en-labels.md](kleur-en-labels.md)

## Waarvoor

Medewerker maakt of kiest tot drie foto’s van één item (overzicht en/of label) en krijgt een
bewerkbaar voorstel vóór opslaan.

## Hoe het werkt

Fasen: `camera` → (`align` bij gallery) → `classifying` (alleen overview) → `result` of `error`.
Camera gebruikt een zichtbaar kader; de crop-rect wordt van viewport naar beeldcoördinaten gemapt.
Gallery: pinch/pan in het kader, daarna crop. Op het resultaatscherm: thumbnails, categorie,
kleur, subtype, patroon; **Foto toevoegen** (max. 3, rol overzicht/label), Opslaan / Opnieuw.
Overview-foto’s worden geclassificeerd en gemerged; labelfoto’s alleen bewaard (geen OCR nog).

## Beweringen

| ID      | Bewering                                                                                     | Code                                                   | Test                                                     |
| ------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| SCAN-01 | Camerafoto wordt bijgesneden tot het kader vóór classify.                                    | `capture-screen.tsx`, `frame-crop.ts`, `crop-image.ts` | `frame-crop.test.ts`                                     |
| SCAN-02 | Galleryfoto gaat via align (pinch/pan) en crop vóór classify.                                | `align-photo.tsx`, `capture-screen.tsx`                | —                                                        |
| SCAN-03 | Tijdens classify toont de UI een classificatiefase (geen stille blokkade zonder feedback).   | `capture-screen.tsx`                                   | —                                                        |
| SCAN-04 | Opslaan schrijft pas dan naar de scan-store met listing uit het formulier.                   | `capture-screen.tsx`, `draft-from-labels.ts`           | `draft-from-labels.test.ts`, `scan-store.test.ts`        |
| SCAN-05 | Opnieuw wist foto’s + formulier en keert terug naar de camera.                               | `capture-screen.tsx`                                   | —                                                        |
| SCAN-06 | Zichtbare teksten komen uit i18n (`capture.*`), niet hardcoded in het scherm.                | `capture-screen.tsx`, `resources.ts`                   | —                                                        |
| SCAN-07 | Max. 3 foto’s per scan; rol overview/label; alleen overview door het model; merge-resultaat. | `scan-photos.ts`, `merge-interpret-results.ts`, UI     | `scan-photos.test.ts`, `merge-interpret-results.test.ts` |
| SCAN-08 | Subtype alleen van labels die bij de gekozen categorie horen (geen Hat→hoed op een top).     | `interpret-labels.ts`                                  | `interpret-labels.test.ts`                               |
| SCAN-09 | Capture gebruikt `choose` voor categorie/kleur/subtype/patroon.                              | `capture-screen.tsx`                                   | —                                                        |

## Randgevallen en bewuste keuzes

- Zonder cameramachtiging: permission-flow via `expo-camera`.
- Classify-fout → errorfase met i18n-sleutel, geen crash naar home.
- Labelfoto’s wachten op OCR ([STAT-06](ontwikkelstatus.md)); ze gaan niet door TFLite.

## Open vragen

- Geen.
