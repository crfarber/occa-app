# Opslagsleutels

> Gecontroleerd op: `be46e93` (2026-11-22)
> Bronnen: `rg` op KEY-constanten, `src/bootstrap/container.ts`

## Waarvoor

Welke keys bestaan, waar, en wat `clearUserData` wist.

## Specificatie

| Sleutel                 | Store         | Wie schrijft           | Gewist bij clearUserData?    |
| ----------------------- | ------------- | ---------------------- | ---------------------------- |
| `auth.session`          | SecretStore   | `session-repository`   | ja (via TokenProvider clear) |
| `settings.language`     | KeyValueStore | `language-settings`    | nee                          |
| `query.cache`           | KeyValueStore | query-cache-store      | ja (`clearQueryCache`)       |
| `shops.selectedStoreId` | KeyValueStore | `selected-store-store` | ja (`selectedStore.clear`)   |
| `submission.outbox`     | KeyValueStore | `outbox-repository`    | ja (`submission.clear`)      |

Scans: geen disk-key (alleen geheugen; `scanStore.clear()` bij `clearUserData`).

## Beweringen

| ID     | Bewering                                                                | Code                      | Test                           |
| ------ | ----------------------------------------------------------------------- | ------------------------- | ------------------------------ |
| KEY-01 | Sessie-chunking gebruikt `SESSION_KEY = 'auth.session'`.                | `session-repository.ts`   | `session-repository.test.ts`   |
| KEY-02 | Taal gebruikt `LANGUAGE_KEY = 'settings.language'`.                     | `language-settings.ts`    | `language-settings.test.ts`    |
| KEY-03 | `clearUserData` wist querycache + scans + filiaal, niet de taalsleutel. | `container.ts`            | `container.test.ts`            |
| KEY-04 | Filiaalkeuze gebruikt `SELECTED_STORE_KEY = 'shops.selectedStoreId'`.   | `selected-store-store.ts` | `selected-store-store.test.ts` |
| KEY-05 | Outbox gebruikt `OUTBOX_STORAGE_KEY = 'submission.outbox'`.             | `outbox-repository.ts`    | `outbox-repository.test.ts`    |

## Randgevallen en bewuste keuzes

- Geen Occa-specifieke disk-keys naast de platformkeys hierboven (outbox hoort bij de shop-flow).

## Open vragen

- Geen.
