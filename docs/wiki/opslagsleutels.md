# Opslagsleutels

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `rg` op KEY-constanten, `src/bootstrap/container.ts`

## Waarvoor

Welke keys bestaan, waar, en wat `clearUserData` wist.

## Specificatie

| Sleutel             | Store         | Wie schrijft         | Gewist bij clearUserData?    |
| ------------------- | ------------- | -------------------- | ---------------------------- |
| `auth.session`      | SecretStore   | `session-repository` | ja (via TokenProvider clear) |
| `settings.language` | KeyValueStore | `language-settings`  | nee                          |
| `query.cache`       | KeyValueStore | query-cache-store    | ja (`clearQueryCache`)       |

Scans: geen disk-key (alleen geheugen; `scanStore.clear()` bij `clearUserData`).

## Beweringen

| ID     | Bewering                                                      | Code                    | Test                         |
| ------ | ------------------------------------------------------------- | ----------------------- | ---------------------------- |
| KEY-01 | Sessie-chunking gebruikt `SESSION_KEY = 'auth.session'`.      | `session-repository.ts` | `session-repository.test.ts` |
| KEY-02 | Taal gebruikt `LANGUAGE_KEY = 'settings.language'`.           | `language-settings.ts`  | `language-settings.test.ts`  |
| KEY-03 | `clearUserData` wist querycache + scans, niet de taalsleutel. | `container.ts`          | `container.test.ts`          |

## Randgevallen en bewuste keuzes

- Geen Occa-specifieke disk-keys naast de platformkeys hierboven.

## Open vragen

- Geen.
