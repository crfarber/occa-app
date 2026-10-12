# Onderwerpenkaart

Beginpunt voor welke pagina's er horen en waar de bronnen staan. Klopt een pad niet meer, of is er
een domein bijgekomen, dan is dat zelf een bevinding: meld het en werk deze kaart bij.

Dit project is **Occa** (Expo-app voor vintage kleding-scan). Domeinen nu:
`auth`, `capture`, `home`, `settings`, `support`.

Wiki = Occa-productspecificatie. **Geen wiki-pagina** voor platformonderwerpen, o.a. inloggen,
debug, support-log, API, i18n, stores, feedback, builds, testen → `docs/architecture.md`,
`docs/conventions.md` en ADR's.

## Overkoepelend

| Pagina               | Onderwerp                                                      | Bronnen                                                                                      |
| -------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `overzicht.md`       | opstarten, container, providers, navigatie (scan vs app)       | `src/bootstrap/`, `src/app/_layout.tsx`, `src/app/(app)/_layout.tsx`, `docs/architecture.md` |
| `componenten.md`     | Occa-routes, schermen en UI-componenten                        | `src/app/`, `src/bootstrap/`, `src/domeinen/`, `src/shared/ui/`                              |
| `applicatieflow.md`  | end-to-end flow: scannen → resultaat bewerken → opslaan → home | `src/app/`, `src/domeinen/capture/`, `docs/occa-brief.md`, `docs/functioneel/open-vragen.md` |
| `ontwikkelstatus.md` | gebouwd, gedeeltelijk en niet gebouwd (OCR, cloud, outbox, …)  | `src/`, `docs/occa-brief.md`, `docs/architecture.md`, `docs/functioneel/open-vragen.md`      |
| `opslagsleutels.md`  | alle sleutels in KeyValueStore/SecretStore en wie ze wist      | `rg "KEY = \|\|_KEY" src`, `src/bootstrap/container.ts` (`clearUserData`)                    |

## Per domein / feature

| Pagina               | Domein(en) / gebied                                                | Extra bronnen                                                                                             |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `scannen.md`         | `capture` (camera, gallery, kader, crop, resultaatformulier)       | `docs/occa-brief.md`, `src/domeinen/capture/screens/`                                                     |
| `categorie-model.md` | on-device TFLite-categorieherkenning                               | `assets/models/`, `capture/platform/rn/custom-category-classifier.tsx`, `training/`, `docs/occa-brief.md` |
| `kleur-en-labels.md` | interpretatie labels → categorie/subtype/kleur/patroon, pixelkleur | `capture/domain/interpret-labels.ts`, `draft-from-labels.ts`, `average-image-color.ts`                    |
| `listings.md`        | lokale listing-draft, scan-store, opslaan in sessie                | `capture/domain/listing.ts`, `capture/store/scan-store.ts`                                                |
| `home.md`            | startscherm / overzicht scans                                      | `home/`, `capture/domain/group-scans.ts`                                                                  |

`auth`, `settings`, `support`, debug: geen wiki-pagina (ook geen beweringen over
login/support-log/debug in Occa-pagina's) → ADR 0008/0012/0013/0014/0017 + architecture.

## Gepland (pagina pas schrijven als de code er is)

| Pagina (voorlopige naam) | Onderwerp                                       | Bronnen (als aanwezig)                                     |
| ------------------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| `klantacceptatie.md`     | handmatige acceptatiescenario's voor medewerker | `applicatieflow.md`, `ontwikkelstatus.md`, `occa-brief.md` |
| `ocr.md`                 | ML Kit tekstherkenning op labels                | `docs/occa-brief.md` §4                                    |
| `offline-upload.md`      | lokale wachtrij → backend upload                | `docs/occa-brief.md` §3                                    |
| `cloud-ai.md`            | backend → Foundry, JSON-schema                  | `ai/instructions.md`, `ai/schema.json`, brief              |

## Altijd meenemen

- `docs/occa-brief.md`: productbedoeling; beweringen over doelgedrag toetsen hieraan als de code nog
  ontbreekt → dan "niet gebouwd", niet verzinnen.
- `docs/functioneel/open-vragen.md`: open vragen horen onder "Open vragen" op de pagina.
- `docs/decisions/`: link naar ADR's, niet kopiëren.
