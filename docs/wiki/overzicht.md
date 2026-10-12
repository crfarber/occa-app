# Overzicht

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `src/bootstrap/`, `src/app/_layout.tsx`, `src/app/(app)/_layout.tsx`, `docs/architecture.md`
> Zie ook: [architecture.md](../architecture.md), [occa-brief](../occa-brief.md)

## Waarvoor

Eén startpunt dat container, providers en navigatie verbindt. Zonder dit is onduidelijk wanneer de
medewerker mag scannen of naar home gaat.

## Hoe het werkt

`createNativeContainer()` bouwt één keer bij appstart. `container.start()` herstelt taal en sessie
(sessie-infra blijft beschikbaar voor latere API-calls). De scan-route `(scan)` is de
`initialRouteName`. `(app)` (home, item, settings) is altijd bereikbaar; er is geen login-gate.

```mermaid
flowchart TD
  start[index.js] --> layout["_layout.tsx"]
  layout --> container[createNativeContainer]
  layout --> providers[AppProviders]
  providers --> nav[Navigator]
  nav -->|status unknown| splash[Splash]
  nav -->|altijd| scan["(scan)"]
  nav -->|altijd| app["(app)"]
```

## Beweringen

| ID      | Bewering                                                                                     | Code                          | Test                   |
| ------- | -------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------- |
| BOOT-01 | De container wordt één keer gebouwd bij laden van de root layout.                            | `src/app/_layout.tsx`         | —                      |
| BOOT-02 | Bij `status === 'unknown'` blijft de splash zichtbaar tot de sessie bekend is.               | `src/app/_layout.tsx`         | —                      |
| BOOT-03 | `(scan)` is de initiële route.                                                               | `src/app/_layout.tsx`         | —                      |
| BOOT-04 | `(app)` is altijd bereikbaar (geen auth-guard).                                              | `src/app/_layout.tsx`         | —                      |
| BOOT-05 | Domein-dependencies komen via `AppProviders` uit de container (geen singletons in domeinen). | `src/bootstrap/providers.tsx` | `architecture.test.ts` |
| BOOT-06 | Productie-UI gebruikt het custom TFLite-categoriemodel via `CategoryModelProvider`.          | `src/bootstrap/providers.tsx` | —                      |

## Randgevallen en bewuste keuzes

- Inloggen, debug en support-log horen niet bij de Occa-product-UI; auth blijft in de container
  beschikbaar voor latere backend-calls.

## Open vragen

- Geen open vraag specifiek voor bootstrap; zie [open-vragen.md](../functioneel/open-vragen.md).
