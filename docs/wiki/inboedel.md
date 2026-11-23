# Inboedel

> Gecontroleerd op: lokaal (2026-11-22)
> Bronnen: `src/domeinen/shops/`, `src/domeinen/inventory/`, `src/app/(app)/(tabs)/inventory/`, `src/app/(app)/inventory/[id].tsx`
> Zie ook: [shop-api.md](shop-api.md), [inloggen.md](inloggen.md), [conventions.md](../conventions.md) §4

## Waarvoor

Medewerker ziet de voorraad van het filiaal (inclusief concepten), gelezen via de shop-API, kan
zoeken en filteren, en kan een artikel openen om velden te bekijken en te wijzigen. Geen lokale
kopie van artikelen.

## Hoe het werkt

1. Na inloggen: tab **Inboedel** naast Home (nested native `Stack` met filterknop; zoekbalk onderaan).
2. Geen `storeId` → automatisch het eerste filiaal kiezen.
3. Met `storeId`: lijst via `GET …/stores/{storeId}/items` met `limit`/`offset`, debounced `search` en filters (`useInfiniteQuery`).
4. Scroll naar beneden laadt de volgende pagina (`hasMore`); alleen die pagina heeft signed foto’s.
5. Filterknop opent een bottom sheet; opties komen van `GET …/items/filters?locale=`. Draft tot "Toon resultaten".
6. Browse-UI (zoektekst, applied, sheet-draft) via pure reducer `inventory-browse.action.ts` + `useInventoryBrowse`.
7. Tik op een rij → `/inventory/[id]`: detail ophalen, keuzelijsten, bewerkformulier.
8. Na conceptworker: detail toont origineel, op-achtergrond en uitsnede (als aanwezig) plus
   `photoStatus`; status ververst bij focus (later: websocket).
9. Opslaan: alleen gewijzigde velden via `PATCH`; lijst + detail verversen.
10. Lokale formstatus (draft + fout) via pure reducer `item-form.action.ts` + `useItemForm`.
11. Bij uitloggen: `shops.selectedStoreId` gewist.

## Beweringen

| ID     | Bewering                                                                                                       | Code                                            | Test                              |
| ------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------- |
| INV-01 | Gekozen filiaal staat in KeyValueStore onder `shops.selectedStoreId`.                                          | `selected-store-store.ts`                       | `selected-store-store.test.ts`    |
| INV-02 | Bij geen keuze wordt het eerste filiaal automatisch geselecteerd.                                              | `inventory-screen.tsx`                          | —                                 |
| INV-03 | ~~Bij meer filialen zonder keuze navigeert Inboedel naar `/choose-store`.~~ (2026-11-22)                       | —                                               | —                                 |
| INV-04 | De voorraadlijst komt van `inventoryApi.list` met paginatie (`useInfiniteQuery`), niet uit lokale opslag.     | `inventory-context.tsx`                         | `container.test.ts`               |
| INV-17 | Scroll-einde vraagt de volgende `offset` zolang `page.hasMore` true is.                                       | `inventory-screen.tsx`                          | `shop-items.test.ts`              |
| INV-05 | `clearUserData` / uitloggen wist de filiaalkeuze.                                                              | `container.ts`                                  | `container.test.ts`               |
| INV-06 | Tik op een rij opent `/inventory/[id]` met detail en bewerkvelden.                                             | `inventory-screen.tsx`                          | —                                 |
| INV-07 | Opslaan stuurt een PATCH naar de shop-API en ververst lijst + detail.                                          | `inventory-context.tsx`                         | `container.test.ts`               |
| INV-08 | Het bewerkformulier houdt draft + fout in een pure reducer (`item-form.action.ts`).                            | `item-form.action.ts`                           | `item-form.action.test.ts`        |
| INV-09 | Alleen gewijzigde velden gaan in de PATCH-body.                                                                | `item-form.ts`                                  | `item-form.test.ts`               |
| INV-10 | Prijsvergrendeling en niet-bewerkbaar status tonen uitleg; prijsveld is dan uitgeschakeld.                     | `inventory-item-screen.tsx`                     | —                                 |
| INV-11 | Zoeken en filters zitten in `inventory-browse.action.ts` + `useInventoryBrowse` (geen losse `useState`s).      | `inventory-browse.action.ts`                    | `inventory-browse.action.test.ts` |
| INV-12 | Zoeken is een `PillField` onderaan (boven tabbalk/toetsenbord); filters via `Stack.Toolbar`.                   | `inventory-screen.tsx`                          | —                                 |
| INV-13 | Facets worden geladen bij openen van het filtersheet; "Toon resultaten" past `applied` toe.                    | `filter-sheet.tsx`                              | `inventory-browse.action.test.ts` |
| INV-14 | Bij een actieve zoekbalk of zoektekst toont een kruisknop; die wist de tekst en sluit het toetsenbord.         | `inventory-screen.tsx`                          | —                                 |
| INV-15 | Detail toont reviewfoto's (op achtergrond / origineel / uitsnede) via `reviewPhotosOf` als de worker klaar is. | `review-photos.ts`, `inventory-item-screen.tsx` | `review-photos.test.ts`           |
| INV-16 | Bij `photoStatus` `wachtend`/`bezig` toont detail een verwerkingsbanner; verversen bij focus (geen poll).      | `inventory-item-screen.tsx`, `review-photos.ts` | `review-photos.test.ts`           |

## Randgevallen en bewuste keuzes

- Foto's alleen bekijken, niet wijzigen vanuit de app; reviewfoto's komen uit signed URLs van de shop-API.
- Publiceren (concept → online) blijft op partner.
- Pilot: één login, één shop — geen filiaalwisselaar.
- Facets tellen over de hele filiaalvoorraad, niet over de actieve zoektekst.

## Open vragen

- [open-vragen.md](../functioneel/open-vragen.md) rij 2–4; foto-status/resolutie: rij 7–8.
