# 0020. Maatgrid: breedte per 5, hoogte per 4

**Status:** aangenomen. Vult [0007](0007-styling.md) aan.

## Besluit

Elke maat in een stijl valt op een vast grid, afhankelijk van de richting:

| Richting | Grid                          | Eigenschappen                                                                                                                 |
| -------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Breedte  | veelvoud van 5                | `width`, `min/maxWidth`, `paddingHorizontal/Left/Right`, `marginHorizontal/Left/Right`, `left`, `right`, `columnGap`          |
| Hoogte   | 2, of een veelvoud van 4      | `height`, `min/maxHeight`, `lineHeight`, `paddingVertical/Top/Bottom`, `marginVertical/Top/Bottom`, `top`, `bottom`, `rowGap` |
| Beide    | moet in beide passen (20, 40) | `padding`, `margin`, `gap`                                                                                                    |

Daarvoor zijn er twee schalen in `src/shared/ui/theme.ts` met dezelfde stapnamen:

| Stap       | `xxs` | `xs` | `sm` | `md` | `lg` | `xl` | `xxl` | `xxxl` | `screen` |
| ---------- | ----- | ---- | ---- | ---- | ---- | ---- | ----- | ------ | -------- |
| `spacingX` |       | 5    | 10   | 15   | 20   | 25   | 40    | 50     | 20       |
| `spacingY` | 2     | 4    | 8    | 12   | 16   | 24   | 32    | 48     | 20       |

Afspraken:

- Een uniforme `padding` of `margin` met een token splits je: `paddingHorizontal: spacingX.md, paddingVertical: spacingY.md`.
- Een `gap` volgt de richting van de container: `spacingX` in een rij, `spacingY` in een kolom. Een rij met `flexWrap` krijgt `columnGap` plus `rowGap`.
- Vierkanten en cirkels (iconen, stip, radio, sluiter, thumbnail) meet je aan hun hoogte en krijgen een `size`-token op het hoogtegrid. Zo blijven ze vierkant.
- Randdiktes (`borderWidth`), `borderRadius`, schaduw-offsets, `fontSize` en `letterSpacing` vallen buiten het grid.
- Maten die het platform bepaalt (safe-area-insets, de hoogte van de native header) tellen niet mee; wat je erbij optelt wel.

`src/shared/ui/size-grid.test.ts` dwingt dit af: alle tokens, alle line-heights, en elke getal-literal of verkeerde schaal in de stijlen onder `src/`, stories inbegrepen. De story `UI/Tokens/Spacing` laat beide schalen zien.

## Waarom

Met één schaal voor beide richtingen kwamen er waarden als 12, 26, 34 en 66 in de app terecht. Die passen niet bij het ontwerp. Twee schalen met dezelfde namen houden het ritme gelijk, en `md` betekent in beide richtingen "de middelste stap".

## Heroverwegen als

Het ontwerp overstapt naar één grid voor beide assen, bijvoorbeeld overal 4 of 8. Dan vallen `spacingX` en `spacingY` samen en is de splitsing van `padding` niet meer nodig.
