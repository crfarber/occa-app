# Ontwikkelstatus

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `src/`, `docs/occa-brief.md`, `docs/architecture.md`, `docs/functioneel/open-vragen.md`
> Zie ook: [occa-brief](../occa-brief.md) §9 Fasering

## Waarvoor

Scheidt wat de code nu doet van wat de brief belooft. Voorkomt dat iemand een niet-gebouwde
cloudflow als werkend beschrijft.

## Hoe het werkt

Status per blok uit brief + codebase. "Gebouwd" = code + (liefst) test. "Gedeeltelijk" = UI of
domein zonder backend. "Niet gebouwd" = alleen brief/docs.

## Beweringen

| ID      | Bewering                                                                | Code / bron                                        | Test         | Status                |
| ------- | ----------------------------------------------------------------------- | -------------------------------------------------- | ------------ | --------------------- |
| STAT-01 | Camera + gallery + kader-crop + resultaatformulier bestaan.             | `capture/`                                         | deels        | gebouwd               |
| STAT-02 | On-device categoriemodel (TFLite) is aangesloten in de UI.              | `custom-category-classifier.tsx`, `assets/models/` | labels-tests | gebouwd               |
| STAT-03 | Labels → categorie/subtype/kleur/patroon + pixelkleur-fallback bestaan. | `interpret-labels.ts`, `draft-from-labels.ts`      | ja           | gebouwd               |
| STAT-04 | Scans staan in een Zustand-store voor de sessie; wissen bij uitloggen.  | `scan-store.ts`, `container.ts`                    | ja           | gebouwd               |
| STAT-05 | Taalinstelling en HttpClient-boilerplate bestaan (platform).            | `settings/`, `shared/api/`                         | ja           | gebouwd (boilerplate) |
| STAT-11 | Geen product-UI voor login, debug of support-log.                       | routes, settings, providers                        | —            | verwijderd            |
| STAT-06 | OCR (ML Kit text recognition) is niet geïmplementeerd.                  | —                                                  | —            | niet gebouwd          |
| STAT-10 | Multi-foto POC: max. 3, rollen overview/label, merge overview-labels.   | `scan-photos.ts`, `merge-interpret-results.ts`, UI | ja           | gebouwd (POC)         |
| STAT-07 | Upload-wachtrij / backend-itemstatus is niet geïmplementeerd.           | —                                                  | —            | niet gebouwd          |
| STAT-08 | Cloud AI-call (Foundry) gebeurt niet vanuit de app (en nog geen API).   | brief §3, §8                                       | —            | niet gebouwd          |
| STAT-09 | Er gaat nog niets naar een webshop.                                     | open vraag 1                                       | —            | niet gebouwd          |

## Randgevallen en bewuste keuzes

- Brief-fase 2 (wachtrij + status-icoon + controle-popup naar cloud) is nog niet deze codebase.
- Huidige "controle" = lokaal resultaatformulier vóór `recordScan`, niet de cloud-sheet uit de brief.

## Open vragen

- [open-vragen.md](../functioneel/open-vragen.md) rij 1 (webshopvelden).
- Brief §10: hosting, webshop, maten, foto-groepering, white-label.
