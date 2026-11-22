# Wiki Occa

Hoe de shop-app werkt, per onderwerp. Elke pagina bevat beweringen die tegen de code gecontroleerd
worden met `/wiki` of "wiki". Architectuur en regels: [architecture.md](../architecture.md),
[conventions.md](../conventions.md). Productbedoeling: [occa-brief.md](../occa-brief.md).
Platformplaatje (twee apps, leerlus): [platform/](../platform/).

**Richting:** deze wiki is de leesbare specificatie voor Occa én voor andere clients die dezelfde
shop-API willen gebruiken. Start bij [Shop-API](shop-api.md) voor wat er nu contractueel vastligt;
het volledige shop-ontwerp (upload, concept-POST, aanvragen) staat in
[platform/01-shop-app.md](../platform/01-shop-app.md) tot het gebouwd is. Later: live publicatie van
deze pagina's + machineleesbaar contract naast `shop-api.md`.

Debug, support-log, i18n-mechaniek, builds en test-infra: architecture / conventions / ADR's — geen
aparte Occa-wiki-pagina's. Lokale form-/fasestatus: [conventions.md](../conventions.md) §4
(`*.action.ts` + `useReducer`).

> Geschreven tegen HEAD `be46e93` (2026-11-22), inclusief werkende tree (item-detail, reducers,
> label-OCR). Na grote navigatie- of API-wijzigingen: opnieuw `/wiki` controleren.

**Eerste keer opzetten / trainen:** [handleiding-starten.md](../handleiding-starten.md)
(Node, pnpm, Xcode, `pnpm ios`, clothing-dataset-URL’s, `train.py`).

| Pagina                                        | Waarover                                         | Gecontroleerd |
| --------------------------------------------- | ------------------------------------------------ | ------------- |
| [Overzicht](overzicht.md)                     | start, container, login-gate, navigatie          | `be46e93`     |
| [Inloggen](inloggen.md)                       | splash → formulier → sessie, uitloggen           | `be46e93`     |
| [Shop-API](shop-api.md)                       | `/api/v1/shop` zoals de app die gebruikt         | lokaal 22-11  |
| [Inboedel](inboedel.md)                       | filialen + lijst + detail/PATCH                  | `be46e93`     |
| [Offline-upload](offline-upload.md)           | outbox, concept-POST, foto's, photoStatus        | lokaal 22-11  |
| [Foto-grootte](foto-grootte.md)               | max edge / JPEG (web; app + partner + cutout)    | lokaal 22-11  |
| [Omgevingen](omgevingen.md)                   | local / test / acceptatie / productie            | lokaal 22-11  |
| [Applicatieflow](applicatieflow.md)           | inloggen → scannen → resultaat → home / inboedel | `be46e93`     |
| [Ontwikkelstatus](ontwikkelstatus.md)         | gebouwd vs brief/platform                        | lokaal 22-11  |
| [Componenten](componenten.md)                 | routes en schermen                               | `be46e93`     |
| [Scannen](scannen.md)                         | camera, gallery, crop, label-OCR, formulier      | `be46e93`     |
| [Categoriemodel](categorie-model.md)          | on-device TFLite                                 | `aa8cfdc`     |
| [Categorie-taxonomie](categorie-taxonomie.md) | platform ↔ telefoon, nieuw type (Pad A/B)        | lokaal 22-11  |
| [Kleur en labels](kleur-en-labels.md)         | interpretLabels, pixelkleur                      | `aa8cfdc`     |
| [Listings](listings.md)                       | listing-draft, scan-store                        | `aa8cfdc`     |
| [Home](home.md)                               | overzicht scans (tab)                            | `be46e93`     |
| [Opslagsleutels](opslagsleutels.md)           | KeyValueStore / SecretStore                      | `be46e93`     |
