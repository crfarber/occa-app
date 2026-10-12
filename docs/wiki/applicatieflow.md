# Applicatieflow

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `src/app/`, `src/domeinen/capture/`, `docs/occa-brief.md`
> Zie ook: [scannen.md](scannen.md), [home.md](home.md)

## Waarvoor

End-to-end pad van de medewerker vandaag: foto → herkenning → corrigeren → opslaan → lijst.

## Hoe het werkt

1. App opent op scanscherm (`(scan)`).
2. Foto via camera (kader-crop) of gallery (pinch-align → crop).
3. On-device classify + optioneel pixelkleur → bewerkbaar formulier.
4. **Opslaan** schrijft naar `scanStore` (niet eerder) en navigeert naar `/home`.
5. Op home: scans gegroepeerd op categorie; tik → listing-scherm.

Geen backend-upload in deze flow.

## Beweringen

| ID      | Bewering                                                                     | Code                                | Test                  |
| ------- | ---------------------------------------------------------------------------- | ----------------------------------- | --------------------- |
| FLOW-01 | Classificatie start pas na crop (camera) of na align-bevestiging (gallery).  | `capture-screen.tsx`                | —                     |
| FLOW-02 | Resultaatvelden worden pas in de store gezet bij Opslaan, niet bij classify. | `capture-screen.tsx` `save`         | `scan-store.test.ts`  |
| FLOW-03 | Na Opslaan gaat de navigatie naar `/home`.                                   | `capture-screen.tsx`                | —                     |
| FLOW-04 | Home toont sessie-scans gegroepeerd op herkende categorie.                   | `home-screen.tsx`, `group-scans.ts` | `group-scans.test.ts` |

## Randgevallen en bewuste keuzes

- Brief-flow "Volgende → wachtrij → status-icoon → cloud-controle" is **niet** gebouwd; zie
  [ontwikkelstatus.md](ontwikkelstatus.md).

## Open vragen

- Brief: groeperen foto's per item altijd via expliciete "Volgende"?
