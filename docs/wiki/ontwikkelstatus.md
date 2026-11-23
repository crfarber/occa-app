# Ontwikkelstatus

> Gecontroleerd op: `be46e93` (2026-11-22)
> Bronnen: `src/`, `docs/occa-brief.md`, `docs/architecture.md`, `docs/platform/`, `docs/functioneel/open-vragen.md`
> Zie ook: [occa-brief](../occa-brief.md) §9 Fasering, [platform/01-shop-app.md](../platform/01-shop-app.md)

## Waarvoor

Scheidt wat de code nu doet van wat brief en platform beloven. Voorkomt dat iemand een niet-gebouwde
cloudflow of API als werkend beschrijft.

## Hoe het werkt

Status per blok uit brief + codebase. "Gebouwd" = code + (liefst) test. "Gedeeltelijk" = UI of
domein zonder backend. "Niet gebouwd" = alleen brief/docs.

## Beweringen

| ID      | Bewering                                                                        | Code / bron                                        | Test         | Status               |
| ------- | ------------------------------------------------------------------------------- | -------------------------------------------------- | ------------ | -------------------- |
| STAT-01 | Camera + gallery + kader-crop + resultaatformulier bestaan.                     | `capture/`                                         | deels        | gebouwd              |
| STAT-02 | On-device categoriemodel (TFLite) is aangesloten in de UI.                      | `custom-category-classifier.tsx`, `assets/models/` | labels-tests | gebouwd              |
| STAT-03 | Labels → categorie/subtype/kleur/patroon + pixelkleur-fallback bestaan.         | `interpret-labels.ts`, `draft-from-labels.ts`      | ja           | gebouwd              |
| STAT-04 | Scans staan in een Zustand-store voor de sessie; wissen bij uitloggen.          | `scan-store.ts`, `container.ts`                    | ja           | gebouwd              |
| STAT-05 | Taalinstelling en HttpClient bestaan.                                           | `settings/`, `shared/api/`                         | ja           | gebouwd              |
| STAT-11 | ~~Geen product-UI voor login~~ Login-gate + Settings-uitloggen bestaan.         | `_layout.tsx`, `login-screen`, settings            | deels        | gebouwd (2026-11-22) |
| STAT-12 | Inboedel leest filialen + items via shop-API (Bearer).                          | `shops/`, `inventory/`                             | ja           | gebouwd              |
| STAT-14 | Item-detail + PATCH-bewerken (incl. concept gedeeltelijk) bestaat.              | `shop-item-detail.ts`, `inventory-item-screen`     | ja           | gebouwd (2026-11-22) |
| STAT-13 | ~~POST items/photos + outbox ontbreken~~ Concept-POST, foto-POST, outbox.       | `submission/`, shop-API                            | ja           | gebouwd (2026-11-22) |
| STAT-06 | ~~OCR niet geïmplementeerd~~ Label-OCR via ML Kit op labelfoto’s.               | `mlkit-text-recognizer.ts`                         | —            | gebouwd (2026-11-22) |
| STAT-10 | Multi-foto POC: max. 3 overview + label, merge overview-labels.                 | `scan-photos.ts`, `merge-interpret-results.ts`, UI | ja           | gebouwd (POC)        |
| STAT-07 | ~~Upload-wachtrij niet geïmplementeerd~~ Outbox + `photoStatus` op lijst.       | `submission/`, `inventory-screen`                  | ja           | gebouwd (2026-11-22) |
| STAT-15 | Detail: reviewfoto's + banner bij `photoStatus` wachtend/bezig (focus-refresh). | `review-photos.ts`, `inventory-item-screen`        | ja           | gebouwd (2026-11-22) |
| STAT-17 | Publiceren vanuit de app (concept → online).                                    | open vraag 9                                       | —            | niet gebouwd         |
| STAT-18 | Websocket voor `photoStatus`.                                                   | open vraag 10                                      | —            | niet gebouwd         |
| STAT-16 | Client-side downscale na crop (≤1540 / JPEG 0,82).                              | `upload-photo-size.ts`, `crop-image.ts`            | ja           | gebouwd (2026-11-22) |
| STAT-08 | Cloud AI-call (Foundry/Mistral) gebeurt niet vanuit de app.                     | brief §3, platform                                 | —            | niet gebouwd         |
| STAT-09 | Er gaat nog niets naar een webshop vanuit de scanflow.                          | open vraag 1                                       | —            | niet gebouwd         |

## Randgevallen en bewuste keuzes

- Brief-fase 2 (wachtrij + status-icoon + controle-popup naar cloud) is nog niet deze codebase.
- Huidige "controle" = lokaal resultaatformulier vóór `recordScan`, niet de cloud-sheet uit de brief.
- Partner blijft de plek voor publiceren; de app kan concepten wel gedeeltelijk bewerken (open vraag 3).
- Label-OCR vult draft-tekst; de cloud-OCR/controle-popup uit de brief is nog niet gebouwd.

## Open vragen

- [open-vragen.md](../functioneel/open-vragen.md) 1–8 beantwoord; 9 (publiceren) en 10 (websocket) later.
- Brief §10: hosting, webshop, maten, foto-groepering, white-label.
