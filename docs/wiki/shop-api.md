# Shop-API

> Gecontroleerd op: lokaal (2026-11-22)
> Bronnen: `src/domeinen/shops/api/`, `src/domeinen/inventory/api/`, `src/bootstrap/container.test.ts`
> Zie ook: [platform/01-shop-app.md](../platform/01-shop-app.md), open vraag 2–4

## Waarvoor

Eén HTTP-contract (`/api/v1/shop`) voor de shop-app, partner en toekomstige clients. Deze pagina
beschrijft alleen wat de **Expo-app nu aanroept** en parseert.

## Hoe het werkt

- Basis-URL: `EXPO_PUBLIC_API_BASE_URL`.
- Auth: `Authorization: Bearer <accessToken>` van Supabase.
- Responses door zod (`looseObject`).

### Endpoints in gebruik

| Methode | Pad                                                   | Doel                                                                                                                              |
| ------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `GET`   | `/api/v1/shop/stores`                                 | Filialen van de medewerker                                                                                                        |
| `GET`   | `/api/v1/shop/stores/{storeId}/items`                 | Voorraadlijst; `?limit=`/`offset=` (default 40/0, max 100) + optioneel `search` en herhaalbare `size`/`colour`/`category`         |
| `GET`   | `/api/v1/shop/stores/{storeId}/items/filters`         | Facets per filiaal (`sizes`, `colours`, `categories` met count); `?locale=`                                                       |
| `GET`   | `/api/v1/shop/stores/{storeId}/items/{itemId}`        | Detail met foto's (`main`/`extra`/`label` + optioneel `original`/`cutout`/`background`), `editable`, `priceLocked`, `photoStatus` |
| `PATCH` | `/api/v1/shop/stores/{storeId}/items/{itemId}`        | Velden bijwerken (gedeeltelijke body)                                                                                             |
| `GET`   | `/api/v1/shop/item-options`                           | Keuzelijsten; `?category=&doelgroep=` voor maten                                                                                  |
| `POST`  | `/api/v1/shop/stores/{storeId}/items`                 | Concept aanmaken (`clientKey`, idempotent); velden + `_ai`-voorstellen                                                            |
| `POST`  | `/api/v1/shop/stores/{storeId}/items/{itemId}/photos` | Eén foto (multipart: `photo`, `role`, `photoKey`); main zet `photo_job`                                                           |

Lijstresponse: `{ items, page: { limit, offset, total, hasMore } }`. Alleen de gevraagde
pagina krijgt signed photo-URL’s. Lijst- en detailresponses kunnen `photoStatus` meenemen
(`wachtend` / `bezig` / `klaar` / `mislukt` / `null`): de conceptworker op het platform.

### Bewerkregels (PATCH)

| Status                                                       | Recht        | Gedrag                                                             |
| ------------------------------------------------------------ | ------------ | ------------------------------------------------------------------ |
| `concept`                                                    | `items_add`  | Gedeeltelijk opslaan; geen volledigheidseis; status blijft concept |
| `gepubliceerd` / `aangevraagd` / `bevestigd` / `terughangen` | `items_edit` | Volledigheid zoals partner; prijs vast bij aanvraag                |
| `verkocht` / `verwijderd`                                    | —            | Niet bewerkbaar                                                    |

Foutcodes in de body: `changed_meanwhile` (409), `missing_fields`, `price_locked`, `invalid_price`,
`size_unreadable`, `not_editable` (422), `no_right` (403), `rolled_back` (422).

## Beweringen

| ID     | Bewering                                                                                 | Code                          | Test                                         |
| ------ | ---------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------- |
| API-01 | Filialen via `GET /api/v1/shop/stores` met Bearer-auth.                                  | `shop-stores.ts`              | `shop-stores.test.ts`, `container.test.ts`   |
| API-02 | Voorraad via `GET /api/v1/shop/stores/{storeId}/items`.                                  | `shop-items.ts`               | `shop-items.test.ts`, `container.test.ts`    |
| API-15 | Lijst pagina’s met `limit`/`offset`; response heeft `page` (`total`, `hasMore`).         | `shop-items.ts`, partner      | `shop-items.test.ts`, partner page-tests     |
| API-03 | Optionele query `search` alleen als die niet leeg is.                                    | `shop-items.ts`               | `shop-items.test.ts`                         |
| API-04 | Itemstatus is één van de zeven vaste waarden; onbekende rijen worden genegeerd.          | `shop-items.ts`               | `shop-items.test.ts`                         |
| API-05 | Geen aparte app-database: voorraad alleen via shop-API.                                  | `inventory/`                  | `container.test.ts`                          |
| API-06 | Detail via `GET …/items/{itemId}`; PATCH stuurt gewijzigde velden.                       | `shop-item-detail.ts`         | `container.test.ts`                          |
| API-07 | Keuzelijsten via `GET /api/v1/shop/item-options`.                                        | `shop-item-detail.ts`         | —                                            |
| API-08 | Patch-foutcodes uit de body mappen naar i18n-sleutels in de app.                         | `item-form.ts`                | `item-form.test.ts`                          |
| API-09 | Facets via `GET …/items/filters` met counts per waarde die in het filiaal voorkomt.      | `shop-items.ts`               | `shop-items.test.ts`, `container.test.ts`    |
| API-10 | Herhaalbare `size`/`colour`/`category` filteren de lijst (AND tussen velden, OR binnen). | `shop-items.ts`               | `container.test.ts`                          |
| API-11 | Facetlabels volgen `?locale=` (`nl` of `en`).                                            | partner `filters/route.ts`    | partner `stock-facets.test.ts`               |
| API-12 | Concept-create met `clientKey` is idempotent; foto's met `photoKey` ook.                 | `submission/`, partner routes | `container.test.ts`, partner e2e             |
| API-13 | Lijst/detail kunnen `photoStatus` van de nieuwste `photo_job` tonen.                     | `shop-items.ts`, partner      | partner create-lib tests                     |
| API-14 | Detail kan `photos.original`, `photos.cutout` en `photos.background` meenemen (signed).  | `shop-item-detail.ts`         | `shop-item-detail.test.ts`, partner contract |

## Randgevallen en bewuste keuzes

- Geen aparte signed-upload-URL meer nodig: de app stuurt de JPEG via multipart naar partner; die
  normaliseert en slaat op (zelfde pad als de partner-upload).
- Publiceren en Mistral blijven op partner; de app maakt alleen concepten.
- Foto-resolutie: app crop ≤1540 / partner opnieuw; cut-out-send ≤1024 — [foto-grootte.md](foto-grootte.md).
- Machineleesbaar OpenAPI: nog niet; contracts + deze pagina zijn de bron.
- Facets tellen over de hele filiaalvoorraad, niet over de actieve zoektekst.
- Paginatie v1 snijdt na filter in-memory (zelfde basis als partner-Voorraad); SQL-cursor later
  als winkels structureel boven de load-cap uitkomen.

## Open vragen

- [open-vragen.md](../functioneel/open-vragen.md) rij 2–4.
