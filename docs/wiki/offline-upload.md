# Offline-upload

> Gecontroleerd op: lokaal (2026-11-22)
> Bronnen: `src/domeinen/submission/`, `src/bootstrap/container.ts`, `src/domeinen/capture/screens/capture-screen.tsx`
> Zie ook: [Shop-API](shop-api.md), [Opslagsleutels](opslagsleutels.md)

## Waarvoor

Een scan die de vrijwilliger opslaat, moet eerst veilig op het toestel staan en daarna naar
partner. Zonder verbinding mag Opslaan niet mislukken.

## Hoe het werkt

1. **Opslaan** zet de scan in de lokale scan-store én in de outbox (`submission.outbox`).
2. Het scherm toont "queued" en gaat naar home; versturen loopt op de achtergrond.
3. De runner maakt eerst het concept (`POST …/items` met `clientKey`), daarna elke foto
   (`POST …/items/{id}/photos` met `photoKey`). Beide zijn idempotent.
4. Tijdelijke fouten (`isRetryable`) krijgen backoff (5 s → 15 s → 45 s → 2 min).
5. Bij start, bij terugkomen op de voorgrond, en na enqueue wordt de outbox geleegd.
6. Bij uitloggen wist `clearUserData` de outbox.

De conceptworker (BiRefNet) draait op het platform, niet in de app. De app ziet de voortgang via
`photoStatus` op lijst en detail (focus / pull-to-refresh; later websocket). Klaar: detail toont
origineel, op-achtergrond en uitsnede.

Foto's zijn bij crop al ≤1540 px / JPEG 0,82 ([foto-grootte.md](foto-grootte.md)); partner
normaliseert opnieuw.

## Beweringen

| ID     | Bewering                                                                                            | Code                                            | Test                         |
| ------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| OFF-01 | Opslaan enqueued een outbox-entry met stabiele `clientKey` `scan-{id}`.                             | `capture-screen.tsx`                            | `container.test.ts`          |
| OFF-02 | Outbox staat in KeyValueStore onder `submission.outbox`.                                            | `outbox-repository.ts`                          | `outbox-repository.test.ts`  |
| OFF-03 | Create + foto's gaan via shop-API; geslaagde entry verdwijnt.                                       | `submission-service.ts`                         | `submission-service.test.ts` |
| OFF-04 | Tijdelijke fouten krijgen backoff; permanente wachten een dag.                                      | `outbox.ts`                                     | `outbox.test.ts`             |
| OFF-05 | `clearUserData` wist de outbox.                                                                     | `container.ts`                                  | `container.test.ts`          |
| OFF-06 | Eerste overview = main, label = label, verdere overviews = extra.                                   | `map-scan.ts`                                   | `map-scan.test.ts`           |
| OFF-07 | Detail toont reviewfoto's als klaar; `photoStatus` ververst bij focus (geen poll; later websocket). | `review-photos.ts`, `inventory-item-screen.tsx` | `review-photos.test.ts`      |

## Randgevallen en bewuste keuzes

- Geen filiaal gekozen: Opslaan toont een fout, geen outbox-entry.
- Mistral draait niet vanuit de app; alleen de conceptworker (uitsnede/kleur/sjabloon).
- Foto-bestanden op schijf worden na upload niet gewist (camera/crop blijft).
- Resolutie/compressie: [foto-grootte.md](foto-grootte.md).

## Open vragen

- [open-vragen.md](../functioneel/open-vragen.md) rij 5–8 beantwoord; 9–10 later (publiceren / websocket).
