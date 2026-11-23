# Home

> Gecontroleerd op: `be46e93` (2026-11-22)
> Bronnen: `home/screens/home-screen.tsx`, `capture/domain/group-scans.ts`, `(app)/(tabs)/_layout.tsx`

## Waarvoor

Overzicht van scans in deze sessie en startpunt om opnieuw te scannen. Eén van twee tabs naast
Inboedel.

## Hoe het werkt

Sectielijst per herkende categorie. Lege staat met i18n. Knop navigeert naar scanroute `/`.
Tik op item → `/item/[id]`. TabBar onderaan: Home | Inboedel.

## Beweringen

| ID      | Bewering                                                                   | Code                 | Test                  |
| ------- | -------------------------------------------------------------------------- | -------------------- | --------------------- |
| HOME-01 | Scans worden gegroepeerd op bekende categorie; unknown heeft eigen sectie. | `group-scans.ts`     | `group-scans.test.ts` |
| HOME-02 | Lege categorieën (geen items) worden weggelaten.                           | `group-scans.ts`     | `group-scans.test.ts` |
| HOME-03 | Start-actie navigeert naar de scanroute.                                   | `home-screen.tsx`    | —                     |
| HOME-04 | Home zit in de app-tabs naast Inboedel.                                    | `(tabs)/_layout.tsx` | —                     |

## Randgevallen en bewuste keuzes

- Na inloggen landt de app op Home; scannen start via de actie op dit scherm.

## Open vragen

- Geen.
