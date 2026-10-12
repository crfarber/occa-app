# Kleur en labels

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `capture/domain/interpret-labels.ts`, `draft-from-labels.ts`, `color-from-rgb.ts`, `platform/rn/average-image-color.ts`
> Zie ook: [categorie-model.md](categorie-model.md), [listings.md](listings.md)

## Waarvoor

Ruwe classifier-labels omzetten naar winkelvelden (categorie, subtype, kleur, patroon) en een
bewerkbaar formulier vullen — zonder te verzinnen wat niet herkend is.

## Hoe het werkt

`interpretLabels` mapt bekende Engelse/custom labels naar app-categorieën en subtypes. Generieke
labels (bijv. "Clothing") zetten geen categorie. Meerdere overview-foto’s: labels worden gededupeerd
en opnieuw geïnterpreteerd via `mergeInterpretResults`. Lege kleur → gemiddelde pixelkleur uit de
crop. Formulier seed via `formDraftFromLabels`; Opslaan via `listingFromForm` (patroon blijft form-only).

## Beweringen

| ID     | Bewering                                                                                  | Code                         | Test                              |
| ------ | ----------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------- |
| LAB-01 | Alleen gemapte labels vullen categorie; onbekende laten `category` op unknown.            | `interpret-labels.ts`        | `interpret-labels.test.ts`        |
| LAB-02 | Custom model-labels (o.a. `T-Shirt`, `Outwear`, `Longsleeve`) mappen naar productvelden.  | `interpret-labels.ts`        | `interpret-labels.test.ts`        |
| LAB-03 | Bij gelijktijdige top- en jas-signalen wint top (base-model Jacket-bias).                 | `interpret-labels.ts`        | `interpret-labels.test.ts`        |
| LAB-04 | Pixelkleur vult alleen als het formulier nog geen kleur heeft.                            | `draft-from-labels.ts`       | `draft-from-labels.test.ts`       |
| LAB-05 | Maximaal drie unieke kleuren uit labels, hoogste score eerst.                             | `interpret-labels.ts`        | `interpret-labels.test.ts`        |
| LAB-06 | Patroon zit in het formulier maar gaat niet mee in `listingFromForm`.                     | `draft-from-labels.ts`       | `draft-from-labels.test.ts`       |
| LAB-07 | Bij bekende categorie alleen subtypes van labels in die categorie (geen Hat→hoed op top). | `interpret-labels.ts`        | `interpret-labels.test.ts`        |
| LAB-08 | Merge van meerdere overview-resultaten dedupe’t labels op tekst (hoogste score).          | `merge-interpret-results.ts` | `merge-interpret-results.test.ts` |

## Randgevallen en bewuste keuzes

- `Hat` heeft geen `PRODUCT_CATEGORIES`-mapping → alleen relevant als categorie unknown; bij `top` geen subtype `hoed`.
- Drempels: categorie/subtype 0,2 (int8); kleur/patroon 0,4.

## Open vragen

- [open-vragen.md](../functioneel/open-vragen.md) rij 1 (welke velden naar de webshop).
