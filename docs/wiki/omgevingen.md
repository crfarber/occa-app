# Omgevingen (app)

> Gecontroleerd op: lokaal (2026-11-22)
> Bronnen: `.env.example`, `src/bootstrap/env.ts`, platform `docs/product/omgevingen.md`
> Zie ook: [Shop-API](shop-api.md)

## Waarvoor

Welke backend de app praat, en hoe je lokaal tegen de lokale Supabase van het platform werkt.

## Hoe het werkt

Vier omgevingen op het platform: **local**, **test**, **acceptance**, **production**. De Expo-app
kiest via `EXPO_PUBLIC_*` welke Supabase en welke partner-URL.

| Omgeving   | Wanneer                                              | API / Supabase                                    |
| ---------- | ---------------------------------------------------- | ------------------------------------------------- |
| local      | alles op je laptop (`pnpm local:up` in het platform) | LAN-IP van de laptop, poort 3001 / 54321          |
| test       | gedeelde testdatabase                                | test-project + Vercel preview/partner-test        |
| acceptance | vaste testgroep (na productie)                       | eigen project; zelfde privacyregels als productie |
| production | live                                                 | productieproject                                  |

Lokaal: in het platform `pnpm local:up` en `pnpm local:env` print de regels voor `.env.local` van
deze app (Supabase-URL op het netwerkadres, partner op poort 3001). Medewerker in de seed:
`lokaal@occa.test` / `occa-lokaal`.

De conceptworker draait los (`pnpm worker` of Docker); GitHub Actions voor die worker volgt later.

## Beweringen

| ID     | Bewering                                                             | Code / bron    | Test |
| ------ | -------------------------------------------------------------------- | -------------- | ---- |
| ENV-01 | App-config komt uit `EXPO_PUBLIC_*`; geen service_role in de bundle. | `.env.example` | —    |
| ENV-02 | Lokale seed-medewerker is alleen voor local Supabase, geen geheim.   | platform seed  | —    |

## Open vragen

- Wie de GitHub-org en secrets beheert: nog open (platform).
