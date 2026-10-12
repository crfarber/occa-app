# Wiki Occa

Hoe de app werkt, per onderwerp. Elke pagina bevat beweringen die tegen de code gecontroleerd
worden met `/wiki` of "wiki". Architectuur en regels: [architecture.md](../architecture.md),
[conventions.md](../conventions.md). Productbedoeling: [occa-brief.md](../occa-brief.md).

Platformgedrag (inloggen, debug, support-log, API, i18n, stores, feedback, builds, testen) staat in
`docs/architecture.md`, `docs/conventions.md` en `docs/decisions/` — geen aparte wiki-pagina's en
geen Occa-beweringen daarover.

> Geschreven tegen de werkdirectory op 2026-10-10. `Gecontroleerd op` = `aa8cfdc` (HEAD); veel
> Occa-code zat toen nog buiten die commit. Na de eerste Occa-commit: opnieuw `/wiki`
> controleren.

**Eerste keer opzetten / trainen:** [handleiding-starten.md](../handleiding-starten.md)
(Node, pnpm, Xcode, `pnpm ios`, clothing-dataset-URL’s, `train.py`).

| Pagina                                | Waarover                                | Gecontroleerd |
| ------------------------------------- | --------------------------------------- | ------------- |
| [Overzicht](overzicht.md)             | start, container, navigatie             | `aa8cfdc`     |
| [Applicatieflow](applicatieflow.md)   | scannen → resultaat → opslaan → home    | `aa8cfdc`     |
| [Ontwikkelstatus](ontwikkelstatus.md) | gebouwd vs brief (OCR, cloud, outbox)   | `aa8cfdc`     |
| [Componenten](componenten.md)         | routes en schermen                      | `aa8cfdc`     |
| [Scannen](scannen.md)                 | camera, gallery, kader, crop, formulier | `aa8cfdc`     |
| [Categoriemodel](categorie-model.md)  | on-device TFLite                        | `aa8cfdc`     |
| [Kleur en labels](kleur-en-labels.md) | interpretLabels, pixelkleur             | `aa8cfdc`     |
| [Listings](listings.md)               | listing-draft, scan-store               | `aa8cfdc`     |
| [Home](home.md)                       | overzicht scans                         | `aa8cfdc`     |
| [Opslagsleutels](opslagsleutels.md)   | KeyValueStore / SecretStore             | `aa8cfdc`     |
