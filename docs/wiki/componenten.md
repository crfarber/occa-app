# Componenten

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `src/app/`, `src/domeinen/*/screens/`, `src/shared/ui/`

## Waarvoor

Actuele kaart van Occa-routes ↔ schermen, zodat wiki en navigatie niet uiteenlopen.

## Hoe het werkt

Expo Router-mappen onder `src/app/` wijzen door naar schermen in `ui.ts` van domeinen.

## Beweringen

| ID    | Bewering                                                                | Code                          | Test |
| ----- | ----------------------------------------------------------------------- | ----------------------------- | ---- |
| UI-01 | Route `/` (scan index) toont `CaptureScreen`.                           | `src/app/(scan)/index.tsx`    | —    |
| UI-02 | Route `/home` toont `HomeScreen`.                                       | `src/app/(app)/home.tsx`      | —    |
| UI-03 | Route `/item/[id]` toont `ListingScreen`.                               | `src/app/(app)/item/[id].tsx` | —    |
| UI-04 | Gedeelde UI (Button, Screen, toast, status overlay) zit in `shared/ui`. | `src/shared/ui/`              | —    |

## Randgevallen en bewuste keuzes

- Platformroutes (settings, language, …) horen niet in deze Occa-kaart; zie architecture/ADR's.

## Open vragen

- Geen.
