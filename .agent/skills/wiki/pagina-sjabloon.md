# Paginasjabloon

Bestandsnaam: `docs/wiki/<onderwerp>.md`, kleine letters met streepjes (bijvoorbeeld
`scannen.md`, `categorie-model.md`). Het ID-voorvoegsel van beweringen is kort en in hoofdletters
(`SCAN`, `CAT`, `AUTH`) en verandert nooit meer.

```markdown
# <Onderwerp>

> Gecontroleerd op: `<korte commit>` (<JJJJ-MM-DD>)
> Bronnen: `src/domeinen/<domein>/`, `src/bootstrap/container.ts`
> Zie ook: [ADR 00NN](../decisions/00NN-....md), [occa-brief](../occa-brief.md)

## Waarvoor

Twee à drie zinnen: welk probleem dit onderdeel oplost voor de medewerker of het team.

## Hoe het werkt

Korte uitleg in gewone taal, eventueel met een mermaid-diagram. Geen code overnemen.

## Beweringen

| ID      | Bewering                                                                   | Code                              | Test                            |
| ------- | -------------------------------------------------------------------------- | --------------------------------- | ------------------------------- |
| SCAN-01 | Een foto wordt vóór classificatie bijgesneden tot het zichtbare kader.     | `platform/rn/crop-image.ts`       | `frame-crop.test.ts`            |
| CAT-01  | Class-index uit het TFLite-model wordt via de labeltabel naar tekst gezet. | `domain/category-model-labels.ts` | `category-model-labels.test.ts` |
| AUTH-01 | Tokens staan alleen in de TokenProvider en de beveiligde opslag.           | `auth/service/token-provider.ts`  | `token-provider.test.ts`        |

## Randgevallen en bewuste keuzes

- Wat bewust nog niet gebouwd is (zie brief), met status "niet gebouwd" i.p.v. een valse bewering.

## Open vragen

- Link naar de rijen in `docs/functioneel/open-vragen.md` die hier spelen.
```

## Regels voor beweringen

- **Eén gedrag per regel**, zo geformuleerd dat iemand het kan testen: "als X, dan Y".
- **Gedrag, geen implementatie.** "Een tijdelijke fout logt de gebruiker niet uit", niet "de
  functie `isRetryable` retourneert true".
- **Code-kolom:** het bestand waar het gedrag beslist wordt (pad relatief aan het domein mag).
- **Test-kolom:** het testbestand, of `—` als er geen is. Een lege test is een bevinding.
- **Een bewering met een open vraag** krijgt `(open vraag NN)` achter de tekst.
- **Verwijderd gedrag:** schrap de rij niet stil. Zet `~~doorgehaald~~` met de datum, en haal het
  bij de volgende controle weg.
- Tabellen die zelf de specificatie zijn (categorieën, opslagsleutels, model-labels) mogen volledig
  op de pagina staan. Vermeld dan het bronbestand waartegen ze gecontroleerd worden.

## README.md (index)

```markdown
# Wiki Occa

Hoe de app werkt, per onderwerp. Elke pagina bevat beweringen die tegen de code gecontroleerd
worden met `/wiki` of "wiki". Architectuur en regels: [architecture.md](../architecture.md),
[conventions.md](../conventions.md). Productbedoeling: [occa-brief.md](../occa-brief.md).

| Pagina                               | Waarover                         | Gecontroleerd |
| ------------------------------------ | -------------------------------- | ------------- |
| [Scannen](scannen.md)                | camera, crop, resultaatformulier | `abc1234`     |
| [Categoriemodel](categorie-model.md) | on-device TFLite-herkenning      | `abc1234`     |
```
