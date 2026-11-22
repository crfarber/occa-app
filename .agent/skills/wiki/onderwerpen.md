# Onderwerpenkaart

Beginpunt voor welke pagina's er horen en waar de bronnen staan. Klopt een pad niet meer, of is er
een domein bijgekomen, dan is dat zelf een bevinding: meld het en werk deze kaart bij.

Dit project is **Occa** (Expo shop-app). Domeinen nu: `auth`, `capture`, `home`, `inventory`,
`settings`, `shops`.

Wiki = productspecificatie van deze app + wat andere clients (partner, shopper, web) moeten weten
om dezelfde shop-API te gebruiken. Platformontwerp (twee apps, leerlus) blijft in
`docs/platform/`; de wiki verwijst daarnaar en houdt alleen toetsbare beweringen over wat
**gebouwd of contractueel vastligt**.

Debug, support-log, i18n-mechaniek, builds en test-infra → `docs/architecture.md`,
`docs/conventions.md` en ADR's (geen aparte wiki-pagina's).

## Overkoepelend

| Pagina               | Onderwerp                                                               | Bronnen                                                                                                   |
| -------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `overzicht.md`       | opstarten, container, providers, login-gate, navigatie (scan vs app)    | `src/bootstrap/`, `src/app/_layout.tsx`, `src/app/(app)/_layout.tsx`, `docs/architecture.md`              |
| `componenten.md`     | Occa-routes, schermen en UI-componenten                                 | `src/app/`, `src/bootstrap/`, `src/domeinen/`, `src/shared/ui/`                                           |
| `applicatieflow.md`  | end-to-end: inloggen → scannen → resultaat → home / inboedel            | `src/app/`, `src/domeinen/capture/`, `inventory/`, `auth/`, `docs/occa-brief.md`                          |
| `ontwikkelstatus.md` | gebouwd, gedeeltelijk en niet gebouwd (OCR, cloud, outbox, shop-API, …) | `src/`, `docs/occa-brief.md`, `docs/architecture.md`, `docs/platform/`, `docs/functioneel/open-vragen.md` |
| `opslagsleutels.md`  | alle sleutels in KeyValueStore/SecretStore en wie ze wist               | `rg "KEY = \|\|_KEY" src`, `src/bootstrap/container.ts` (`clearUserData`)                                 |
| `shop-api.md`        | shop-API v1 zoals de app die gebruikt (contract voor andere platforms)  | `shops/api/`, `inventory/api/`, `docs/platform/01-shop-app.md`, partner `@occa/contracts/shop/v1`         |

## Per domein / feature

| Pagina               | Domein(en) / gebied                                                | Extra bronnen                                                                                             |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `inloggen.md`        | `auth` + settings-uitloggen: splash → formulier → sessie           | `_layout.tsx`, `login-screen.tsx`, `settings-screen.tsx`, ADR 0008/0012/0017                              |
| `inboedel.md`        | `shops` + `inventory`: filiaal + lijst + detail/PATCH              | `inventory-screen.tsx`, `inventory-item-screen.tsx`, `item-form.action.ts`, open vraag 2–3                |
| `scannen.md`         | `capture` (camera, gallery, kader, crop, label-OCR, resultform)    | `docs/occa-brief.md`, `capture-screen.tsx`, `capture.action.ts`, `mlkit-text-recognizer.ts`               |
| `foto-grootte.md`    | resolutie/compressie (web only; app crop + partner + cutout)       | `upload-photo-size.ts`, `crop-image.ts`, platform `resize.ts` / `background.ts` / `small-photo.ts`        |
| `offline-upload.md`  | outbox → concept-POST + foto's + photoStatus                       | `submission/`, `capture-screen.tsx`, `inventory/`                                                         |
| `categorie-model.md` | on-device TFLite-categorieherkenning                               | `assets/models/`, `capture/platform/rn/custom-category-classifier.tsx`, `training/`, `docs/occa-brief.md` |
| `categorie-taxonomie.md` | platformslugs ↔ capture-buckets, nieuw type (Pad A/B), allowlist | `submission/domain/category-map.ts`, `platform-categories.ts`, `category-labels.ts`, ADR 0021, platform `docs/product/categorie-taxonomie.md` |
| `categorie-taxonomie.md` | platformslugs ↔ capture-buckets, nieuw type (Pad A/B), allowlist | `submission/domain/category-map.ts`, `platform-categories.ts`, `category-labels.ts`, ADR 0021, platform `docs/product/categorie-taxonomie.md` |
| `kleur-en-labels.md` | interpretatie labels → categorie/subtype/kleur/patroon, pixelkleur | `capture/domain/interpret-labels.ts`, `draft-from-labels.ts`, `average-image-color.ts`                    |
| `listings.md`        | lokale listing-draft, scan-store, opslaan in sessie                | `capture/domain/listing.ts`, `capture/store/scan-store.ts`                                                |
| `home.md`            | startscherm / overzicht scans (tab naast Inboedel)                 | `home/`, `capture/domain/group-scans.ts`, `(app)/(tabs)/`                                                 |

Settings-taal blijft ADR 0013; alleen uitloggen hoort bij `inloggen.md`.

## Gepland (pagina pas schrijven als de code er is)

| Pagina (voorlopige naam) | Onderwerp                                                        | Bronnen (als aanwezig)                                     |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `klantacceptatie.md`     | handmatige acceptatiescenario's voor medewerker                  | `applicatieflow.md`, `ontwikkelstatus.md`, `occa-brief.md` |
| `ocr.md`                 | niet nodig als aparte pagina; zie `docs/wiki/scannen.md` SCAN-11 | `mlkit-text-recognizer.ts`                                 |
| `cloud-ai.md`            | backend → Foundry/Mistral, JSON-schema                           | `ai/instructions.md`, `ai/schema.json`, brief              |
| `aanvragen.md`           | shop-API requests afhandelen in de app                           | `docs/platform/01-shop-app.md`                             |

## Live wiki / API voor andere platforms (richting)

Doel later: één overzicht dat partner/web/shopper ook lezen, plus een stabiele API-pagina.

| Laag                        | Nu                                                                      | Later                                           |
| --------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| Productwiki (`docs/wiki/`)  | Markdown + beweringen, `/wiki` controleert tegen code                   | Zelfde bron, gepubliceerd als leesbare site     |
| Shop-API (`shop-api.md`)    | Alleen endpoints die de app **nu** aanroept + link naar platformontwerp | OpenAPI/contract-export naast deze beweringen   |
| Platform (`docs/platform/`) | Ontwerp twee apps + volledige shop-flow                                 | Blijft visie; wiki claimt alleen wat gebouwd is |

Schrijf geen endpoint of veld in `shop-api.md` dat niet in app-code of gedeeld contract staat.

## Altijd meenemen

- `docs/occa-brief.md`: productbedoeling; beweringen over doelgedrag toetsen hieraan als de code nog
  ontbreekt → dan "niet gebouwd", niet verzinnen.
- `docs/platform/`: gedeeld platformplaatje; bij conflict met code wint de code + open vraag.
- `docs/functioneel/open-vragen.md`: open vragen horen onder "Open vragen" op de pagina.
- `docs/decisions/`: link naar ADR's, niet kopiëren.
